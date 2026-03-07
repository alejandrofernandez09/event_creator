/**
 * Cliente da API Asaas  servidor only (nunca importar no cliente)
 */

const ASAAS_SANDBOX = "https://sandbox.asaas.com/api/v3";
const ASAAS_PROD    = "https://api.asaas.com/v3";

function getBaseUrl(): string {
  return process.env.ASAAS_ENV === "production" ? ASAAS_PROD : ASAAS_SANDBOX;
}

function getApiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY nao configurada");
  return key;
}

async function asaasRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "access_token": getApiKey(),
      "Content-Type": "application/json",
      "User-Agent": "EaaS-Platform/1.0",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({})) as Record<string, unknown>;

  if (!res.ok) {
    const errors = data?.errors as Array<{ description?: string }> | undefined;
    const msg = errors?.[0]?.description ?? (data?.message as string) ?? `HTTP ${res.status}`;
    throw new Error(`Asaas ${res.status}: ${msg}`);
  }

  return data as T;
}

//  Customer 

interface AsaasCustomerResponse { id: string; }
interface AsaasCustomerList    { data: AsaasCustomerResponse[]; }

/**
 * Busca customer pelo e-mail ou cria um novo.
 * cpfCnpj e obrigatorio em producao. No sandbox usa CPF de teste se omitido.
 */
export async function findOrCreateCustomer(
  name: string,
  email?: string,
  cpfCnpj?: string,
): Promise<string> {
  if (email) {
    const search = await asaasRequest<AsaasCustomerList>(
      "GET",
      `/customers?email=${encodeURIComponent(email)}&limit=1`,
    );
    if (search.data?.[0]?.id) return search.data[0].id;
  }

  // CPF "00000000191" e valido para testes no sandbox Asaas.
  // Em producao, coletar CPF real do convidado antes de criar o customer.
  const cpf = cpfCnpj ?? (process.env.ASAAS_ENV !== "production" ? "00000000191" : undefined);

  const customer = await asaasRequest<AsaasCustomerResponse>("POST", "/customers", {
    name,
    ...(email ? { email } : {}),
    ...(cpf ? { cpfCnpj: cpf } : {}),
    notificationDisabled: true,
  });

  return customer.id;
}

//  Pagamento 

export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  dueDate: string;
}

/**
 * Cria cobrança PIX no Asaas.
 * Usa o orderId como externalReference para idempotencia.
 */
export async function createPixPayment(params: {
  customerId: string;
  valueInCents: number;
  description: string;
  orderId: string;
}): Promise<AsaasPayment> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);
  const dueDateStr = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD

  return asaasRequest<AsaasPayment>("POST", "/payments", {
    customer: params.customerId,
    billingType: "PIX",
    value: params.valueInCents / 100,   // Asaas usa BRL, nao centavos
    dueDate: dueDateStr,
    description: params.description,
    externalReference: params.orderId,
  });
}

//  QR Code 

export interface AsaasPixQrCode {
  encodedImage: string;  // base64 PNG
  payload: string;       // codigo copia-e-cola
  expirationDate: string;
}

/** Busca QR Code de um pagamento PIX criado. */
export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasRequest<AsaasPixQrCode>("GET", `/payments/${paymentId}/pixQrCode`);
}