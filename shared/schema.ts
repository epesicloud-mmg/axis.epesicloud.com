import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull(), // Quality Control, Procurement, Accounts, Production, Warehouse, Dispatch, Admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const qualityStatusEnum = pgEnum("quality_status", [
  "pending",
  "passed",
  "failed",
  "in_review",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "quality_check",
  "approved",
  "rejected",
  "in_storage",
]);

export const productionStatusEnum = pgEnum("production_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  contactPerson: varchar("contact_person"),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Truck Deliveries
export const truckDeliveries = pgTable("truck_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  truckRegistration: varchar("truck_registration").notNull(),
  driverName: varchar("driver_name").notNull(),
  driverPhone: varchar("driver_phone"),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  expectedQuantity: varchar("expected_quantity"),
  actualQuantity: varchar("actual_quantity"),
  status: deliveryStatusEnum("status").default("pending"),
  deliveryDate: timestamp("delivery_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weighbridge Readings
export const weighbridgeReadings = pgTable("weighbridge_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deliveryId: varchar("delivery_id").references(() => truckDeliveries.id),
  grossWeight: varchar("gross_weight").notNull(),
  tareWeight: varchar("tare_weight").notNull(),
  netWeight: varchar("net_weight").notNull(),
  operatorName: varchar("operator_name").notNull(),
  notes: text("notes"),
  weighbridgeCharges: varchar("weighbridge_charges"),
  ticketNumber: varchar("ticket_number"),
  readingTime: timestamp("reading_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Raw Material Batches
export const rawMaterialBatches = pgTable("raw_material_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: varchar("batch_number").unique().notNull(),
  deliveryId: varchar("delivery_id").references(() => truckDeliveries.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  moistureLevel: decimal("moisture_level", { precision: 5, scale: 2 }),
  qualityStatus: qualityStatusEnum("quality_status").default("pending"),
  storageLocation: varchar("storage_location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quality Control Checks
export const qualityChecks = pgTable("quality_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => rawMaterialBatches.id),
  checkType: varchar("check_type").notNull(), // raw_material, production, packaging
  moistureLevel: decimal("moisture_level", { precision: 5, scale: 2 }),
  contamination: boolean("contamination").default(false),
  grainIntegrity: varchar("grain_integrity"),
  notes: text("notes"),
  status: qualityStatusEnum("status").default("pending"),
  checkedBy: varchar("checked_by").references(() => users.id),
  checkedAt: timestamp("checked_at").defaultNow(),
});

// Production Orders
export const productionOrders = pgTable("production_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").unique().notNull(),
  productType: varchar("product_type").notNull(), // flour_2kg, flour_4kg, etc.
  targetQuantity: integer("target_quantity").notNull(),
  completedQuantity: integer("completed_quantity").default(0),
  status: productionStatusEnum("status").default("scheduled"),
  scheduledDate: timestamp("scheduled_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production Run Materials (materials used in production)
export const productionRunMaterials = pgTable("production_run_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productionOrderId: varchar("production_order_id").references(() => productionOrders.id),
  batchId: varchar("batch_id").references(() => rawMaterialBatches.id),
  quantityUsed: decimal("quantity_used", { precision: 10, scale: 2 }).notNull(),
  usedAt: timestamp("used_at").defaultNow(),
});

// Finished Product Batches
export const finishedProductBatches = pgTable("finished_product_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: varchar("batch_number").unique().notNull(),
  productionOrderId: varchar("production_order_id").references(() => productionOrders.id),
  productType: varchar("product_type").notNull(),
  quantity: integer("quantity").notNull(),
  packageSize: varchar("package_size"), // 2kg, 4kg
  qualityStatus: qualityStatusEnum("quality_status").default("pending"),
  storageLocation: varchar("storage_location"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Warehouse Stock
export const warehouseStock = pgTable("warehouse_stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemType: varchar("item_type").notNull(), // raw_maize, finished_product
  batchId: varchar("batch_id"), // references either raw or finished batch
  location: varchar("location").notNull(),
  currentQuantity: decimal("current_quantity", { precision: 10, scale: 2 }).notNull(),
  reservedQuantity: decimal("reserved_quantity", { precision: 10, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dispatch Orders
export const dispatchOrders = pgTable("dispatch_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").unique().notNull(),
  customerId: varchar("customer_id"),
  customerName: varchar("customer_name").notNull(),
  deliveryAddress: text("delivery_address"),
  scheduledDate: timestamp("scheduled_date"),
  dispatchedAt: timestamp("dispatched_at"),
  deliveredAt: timestamp("delivered_at"),
  status: varchar("status").default("scheduled"), // scheduled, dispatched, delivered
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dispatch Items
export const dispatchItems = pgTable("dispatch_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dispatchOrderId: varchar("dispatch_order_id").references(() => dispatchOrders.id),
  finishedBatchId: varchar("finished_batch_id").references(() => finishedProductBatches.id),
  quantity: integer("quantity").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  qualityChecks: many(qualityChecks),
  productionOrders: many(productionOrders),
  dispatchOrders: many(dispatchOrders),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  deliveries: many(truckDeliveries),
}));

export const truckDeliveriesRelations = relations(truckDeliveries, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [truckDeliveries.supplierId],
    references: [suppliers.id],
  }),
  weighbridgeReading: one(weighbridgeReadings),
  batches: many(rawMaterialBatches),
}));

export const weighbridgeReadingsRelations = relations(weighbridgeReadings, ({ one }) => ({
  delivery: one(truckDeliveries, {
    fields: [weighbridgeReadings.deliveryId],
    references: [truckDeliveries.id],
  }),
}));

export const rawMaterialBatchesRelations = relations(rawMaterialBatches, ({ one, many }) => ({
  delivery: one(truckDeliveries, {
    fields: [rawMaterialBatches.deliveryId],
    references: [truckDeliveries.id],
  }),
  qualityChecks: many(qualityChecks),
  productionMaterials: many(productionRunMaterials),
}));

export const qualityChecksRelations = relations(qualityChecks, ({ one }) => ({
  batch: one(rawMaterialBatches, {
    fields: [qualityChecks.batchId],
    references: [rawMaterialBatches.id],
  }),
  checker: one(users, {
    fields: [qualityChecks.checkedBy],
    references: [users.id],
  }),
}));

export const productionOrdersRelations = relations(productionOrders, ({ one, many }) => ({
  creator: one(users, {
    fields: [productionOrders.createdBy],
    references: [users.id],
  }),
  materials: many(productionRunMaterials),
  finishedBatches: many(finishedProductBatches),
}));

export const productionRunMaterialsRelations = relations(productionRunMaterials, ({ one }) => ({
  productionOrder: one(productionOrders, {
    fields: [productionRunMaterials.productionOrderId],
    references: [productionOrders.id],
  }),
  batch: one(rawMaterialBatches, {
    fields: [productionRunMaterials.batchId],
    references: [rawMaterialBatches.id],
  }),
}));

export const finishedProductBatchesRelations = relations(finishedProductBatches, ({ one, many }) => ({
  productionOrder: one(productionOrders, {
    fields: [finishedProductBatches.productionOrderId],
    references: [productionOrders.id],
  }),
  dispatchItems: many(dispatchItems),
}));

export const dispatchOrdersRelations = relations(dispatchOrders, ({ one, many }) => ({
  creator: one(users, {
    fields: [dispatchOrders.createdBy],
    references: [users.id],
  }),
  items: many(dispatchItems),
}));

export const dispatchItemsRelations = relations(dispatchItems, ({ one }) => ({
  dispatchOrder: one(dispatchOrders, {
    fields: [dispatchItems.dispatchOrderId],
    references: [dispatchOrders.id],
  }),
  finishedBatch: one(finishedProductBatches, {
    fields: [dispatchItems.finishedBatchId],
    references: [finishedProductBatches.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.string().default("Admin"),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTruckDeliverySchema = createInsertSchema(truckDeliveries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWeighbridgeReadingSchema = createInsertSchema(weighbridgeReadings).omit({
  id: true,
  createdAt: true,
});

export const insertRawMaterialBatchSchema = createInsertSchema(rawMaterialBatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQualityCheckSchema = createInsertSchema(qualityChecks).omit({
  id: true,
  checkedAt: true,
});

export const insertProductionOrderSchema = createInsertSchema(productionOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinishedProductBatchSchema = createInsertSchema(finishedProductBatches).omit({
  id: true,
  createdAt: true,
});

export const insertDispatchOrderSchema = createInsertSchema(dispatchOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertTruckDelivery = z.infer<typeof insertTruckDeliverySchema>;
export type TruckDelivery = typeof truckDeliveries.$inferSelect;
export type InsertWeighbridgeReading = z.infer<typeof insertWeighbridgeReadingSchema>;
export type WeighbridgeReading = typeof weighbridgeReadings.$inferSelect;
export type InsertRawMaterialBatch = z.infer<typeof insertRawMaterialBatchSchema>;
export type RawMaterialBatch = typeof rawMaterialBatches.$inferSelect;
export type InsertQualityCheck = z.infer<typeof insertQualityCheckSchema>;
export type QualityCheck = typeof qualityChecks.$inferSelect;
export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;
export type InsertFinishedProductBatch = z.infer<typeof insertFinishedProductBatchSchema>;
export type FinishedProductBatch = typeof finishedProductBatches.$inferSelect;
export type InsertDispatchOrder = z.infer<typeof insertDispatchOrderSchema>;
export type DispatchOrder = typeof dispatchOrders.$inferSelect;
export type WarehouseStock = typeof warehouseStock.$inferSelect;
export type DispatchItem = typeof dispatchItems.$inferSelect;
