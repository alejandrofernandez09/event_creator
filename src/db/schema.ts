import { pgTable, uuid, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

//  Enums 

export const accountStatusEnum = pgEnum("account_status", ["active", "suspended"]);
export const orderStatusEnum = pgEnum("order_status", ["PENDING", "CONFIRMED", "CANCELED", "EXPIRED"]);
export const rsvpStatusEnum = pgEnum("rsvp_status", ["confirmed", "declined", "pending"]);

//  Tabelas 

/**
 * accounts  configuracao financeira do dono do evento
 */
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull().unique(),
  asaasKey: text("asaas_key").default(""),       // preenchido no Sprint 1
  walletId: text("wallet_id").default(""),
  status: accountStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * events  o hub central de cada evento
 */
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  themeJson: text("theme_json").notNull().default("{}"),  // JSON serializado
  description: text("description").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * products  itens da lista de presentes
 */
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  name: text("name").notNull(),
  description: text("description").default(""),
  price: integer("price").notNull(),   // em centavos (ex: 20000 = R$200,00)
  imgUrl: text("img_url").default(""),
  available: integer("available").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * orders  rastreio financeiro (fonte de verdade: atualizado APENAS via webhook)
 */
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  productId: uuid("product_id").references(() => products.id),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").default(""),
  amount: integer("amount").notNull(),  // em centavos
  status: orderStatusEnum("status").notNull().default("PENDING"),
  pixId: text("pix_id").default(""),   // ID da cobrança no Asaas
  pixCode: text("pix_code").default(""), // copia-e-cola Pix
  pixExpiry: timestamp("pix_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * rsvps  confirmacao de presenca
 */
export const rsvps = pgTable("rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").default(""),
  phone: text("phone").default(""),
  status: rsvpStatusEnum("status").notNull().default("confirmed"),
  message: text("message").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
