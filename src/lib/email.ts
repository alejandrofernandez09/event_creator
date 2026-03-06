const FROM = process.env.EMAIL_FROM ?? "Festas <onboarding@resend.dev>";

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function buildRsvpHtml(params: {
  guestName: string;
  eventName: string;
  eventDate: string;
  status: "confirmed" | "declined";
  message?: string | null;
  primaryColor: string;
  secondaryColor: string;
  eventUrl?: string | null;
}): string {
  const { guestName, eventName, eventDate, status, message, primaryColor, secondaryColor, eventUrl } = params;
  const emoji = status === "confirmed" ? "" : "";
  const title = status === "confirmed" ? "Presença Confirmada!" : "Resposta Registrada";
  const subtitle =
    status === "confirmed"
      ? `Oba! Mal podemos esperar para celebrar com você, <strong>${guestName}</strong>!`
      : `Obrigado por nos avisar, <strong>${guestName}</strong>. Sentiremos sua falta!`;
  const rgb = hexToRgb(primaryColor);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);">

        <!-- Header com cor do tema -->
        <tr>
          <td style="background:linear-gradient(135deg,${primaryColor},${secondaryColor});padding:48px 32px;text-align:center;">
            <div style="font-size:56px;margin-bottom:12px;line-height:1;">${emoji}</div>
            <h1 style="color:white;margin:0;font-size:30px;font-weight:800;letter-spacing:-0.5px;">${title}</h1>
          </td>
        </tr>

        <!-- Corpo -->
        <tr>
          <td style="padding:36px 32px;">
            <p style="color:#374151;font-size:17px;line-height:1.7;margin:0 0 28px;">${subtitle}</p>

            <!-- Card de detalhes -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7FF;border-radius:14px;border:1px solid rgba(${rgb},0.15);margin-bottom:28px;overflow:hidden;">
              <tr>
                <td style="padding:16px 20px;border-bottom:1px solid #EEECFF;">
                  <span style="color:#6B7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Evento</span>
                  <p style="color:#111827;font-size:17px;font-weight:700;margin:4px 0 0;">${eventName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;${message ? 'border-bottom:1px solid #EEECFF;' : ''}">
                  <span style="color:#6B7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Data</span>
                  <p style="color:#111827;font-size:16px;margin:4px 0 0;">${eventDate}</p>
                </td>
              </tr>
              ${message ? `<tr>
                <td style="padding:16px 20px;">
                  <span style="color:#6B7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Sua mensagem</span>
                  <p style="color:#374151;font-size:15px;font-style:italic;margin:6px 0 0;">&ldquo;${message}&rdquo;</p>
                </td>
              </tr>` : ""}
            </table>

            <!-- Botão Ver Evento (somente se confirmado e tiver URL) -->
            ${status === "confirmed" && eventUrl ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="${eventUrl}" style="display:inline-block;background:${primaryColor};color:white;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;letter-spacing:0.3px;">
                     Ver o site do evento
                  </a>
                </td>
              </tr>
            </table>` : ""}

            <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0;border-top:1px solid #F3F4F6;padding-top:20px;">
              Este e-mail foi enviado automaticamente pela plataforma de eventos. Não responda.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendRsvpConfirmation(params: {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  status: "confirmed" | "declined";
  message?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  eventUrl?: string | null;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY nao configurada, email ignorado");
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject =
      params.status === "confirmed"
        ? ` Presença confirmada  ${params.eventName}`
        : `Sua resposta para ${params.eventName}`;
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject,
      html: buildRsvpHtml({
        ...params,
        primaryColor: params.primaryColor ?? "#7C3AED",
        secondaryColor: params.secondaryColor ?? "#EC4899",
      }),
    });
    console.log(`[email] RSVP email enviado para ${params.to} | evento: ${params.eventName} | cor: ${params.primaryColor ?? "default"}`);
  } catch (err) {
    console.error("[email] Falha ao enviar RSVP email:", err);
  }
}
