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
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const qualityStatusEnum = pgEnum("quality_status", [
  "pending",
  "approved",
  "rejected",
  "on_hold",
  "in_review",
  "released",
  "blocked",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "expected",
  "pending_receipt",
  "weighed",
  "pending_qc",
  "approved",
  "rejected",
  "on_hold",
  "in_review",
  "closed",
]);

export const productionStatusEnum = pgEnum("production_status", [
  "draft",
  "scheduled",
  "released",
  "in_progress",
  "completed",
  "cancelled",
]);

export const itemTypeEnum = pgEnum("item_type", [
  "raw_material",
  "finished_product",
]);

export const readingTypeEnum = pgEnum("reading_type", [
  "initial",
  "reweigh",
  "final",
]);

export const exceptionTypeEnum = pgEnum("exception_type", [
  "qc_failure",
  "stock_mismatch",
  "supplier_variance",
  "weight_discrepancy",
  "production_shortfall",
  "other",
]);

export const severityEnum = pgEnum("severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

// Master Data
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  supplierCode: varchar("supplier_code").unique(),
  contactPerson: varchar("contact_person"),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  customerCode: varchar("customer_code").unique(),
  contactPerson: varchar("contact_person"),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: varchar("sku").unique().notNull(),
  name: varchar("name").notNull(),
  productType: itemTypeEnum("product_type").notNull(),
  packageSize: varchar("package_size"), // 1kg, 2kg, 5kg, 10kg
  unitOfMeasure: varchar("uom").default("kg"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const storageLocations = pgTable("storage_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").unique().notNull(),
  name: varchar("name").notNull(),
  zone: varchar("zone"),
  itemType: itemTypeEnum("item_type"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Operations
export const truckDeliveries = pgTable("truck_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deliveryNumber: varchar("delivery_number").unique().notNull(),
  truckRegistration: varchar("truck_registration").notNull(),
  driverName: varchar("driver_name").notNull(),
  driverPhone: varchar("driver_phone"),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  productId: varchar("product_id").references(() => products.id),
  expectedArrivalAt: timestamp("expected_arrival_at"),
  arrivedAt: timestamp("arrived_at"),
  expectedQuantity: decimal("expected_quantity", { precision: 10, scale: 2 }),
  receivedQuantity: decimal("received_quantity", { precision: 10, scale: 2 }),
  deliveryReference: varchar("delivery_reference"),
  notes: text("notes"),
  status: deliveryStatusEnum("status").default("expected"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const weighbridgeReadings = pgTable("weighbridge_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deliveryId: varchar("delivery_id").references(() => truckDeliveries.id),
  grossWeight: decimal("gross_weight", { precision: 10, scale: 2 }).notNull(),
  tareWeight: decimal("tare_weight", { precision: 10, scale: 2 }).notNull(),
  netWeight: decimal("net_weight", { precision: 10, scale: 2 }).notNull(),
  readingType: readingTypeEnum("reading_type").default("initial"),
  ticketNumber: varchar("ticket_number"),
  weighbridgeCharges: decimal("weighbridge_charges", { precision: 10, scale: 2 }),
  readingTime: timestamp("reading_time").notNull(),
  isFinal: boolean("is_final").default(false),
  operatorId: varchar("operator_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rawMaterialBatches = pgTable("raw_material_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: varchar("batch_number").unique().notNull(),
  deliveryId: varchar("delivery_id").references(() => truckDeliveries.id),
  productId: varchar("product_id").references(() => products.id),
  quantityReceived: decimal("quantity_received", { precision: 10, scale: 2 }).notNull(),
  quantityConsumed: decimal("quantity_consumed", { precision: 10, scale: 2 }).default("0"),
  initialLocationId: varchar("initial_location_id").references(() => storageLocations.id),
  status: qualityStatusEnum("status").default("pending"),
  intakeAt: timestamp("intake_at").defaultNow(),
  intakeBy: varchar("intake_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const qualityChecks = pgTable("quality_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  checkNumber: varchar("check_number").unique().notNull(),
  checkType: varchar("check_type").notNull(), // raw_material, in_process, finished_goods
  batchId: varchar("batch_id").references(() => rawMaterialBatches.id), // For raw
  finishedBatchId: varchar("finished_batch_id"), // For finished (we'll add ref later)
  productionOrderId: varchar("production_order_id"), // For in_process (we'll add ref later)
  moistureLevel: decimal("moisture_level", { precision: 5, scale: 2 }),
  contamination: boolean("contamination").default(false),
  foreignMatterPercent: decimal("foreign_matter_percent", { precision: 5, scale: 2 }),
  grainIntegrity: varchar("grain_integrity"),
  packagingIntegrity: varchar("packaging_integrity"),
  remarks: text("notes"),
  status: qualityStatusEnum("status").default("pending"),
  rejectionReason: text("rejection_reason"),
  holdReason: text("hold_reason"),
  checkedBy: varchar("checked_by").references(() => users.id),
  checkedAt: timestamp("checked_at").defaultNow(),
});

export const productionOrders = pgTable("production_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").unique().notNull(),
  productId: varchar("product_id").references(() => products.id),
  targetQuantity: decimal("target_quantity", { precision: 10, scale: 2 }).notNull(),
  totalQuantityIssued: decimal("total_quantity_issued", { precision: 10, scale: 2 }).default("0"),
  actualQuantityProduced: decimal("actual_quantity_produced", { precision: 10, scale: 2 }).default("0"),
  totalWastage: decimal("total_wastage", { precision: 10, scale: 2 }).default("0"),
  status: productionStatusEnum("status").default("draft"),
  scheduledDate: timestamp("scheduled_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  releasedAt: timestamp("released_at"),
  releasedBy: varchar("released_by").references(() => users.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productionMaterialIssues = pgTable("production_material_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productionOrderId: varchar("production_order_id").references(() => productionOrders.id),
  rawBatchId: varchar("raw_batch_id").references(() => rawMaterialBatches.id),
  quantityIssued: decimal("quantity_issued", { precision: 10, scale: 2 }).notNull(),
  issuedFromLocationId: varchar("issued_from_location_id").references(() => storageLocations.id),
  issuedBy: varchar("issued_by").references(() => users.id),
  issuedAt: timestamp("issued_at").defaultNow(),
});

export const finishedProductBatches = pgTable("finished_product_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: varchar("batch_number").unique().notNull(),
  productionOrderId: varchar("production_order_id").references(() => productionOrders.id),
  productId: varchar("product_id").references(() => products.id),
  quantityProduced: decimal("quantity_produced", { precision: 10, scale: 2 }).notNull(),
  quantityAllocated: decimal("quantity_allocated", { precision: 10, scale: 2 }).default("0"),
  quantityDispatched: decimal("quantity_dispatched", { precision: 10, scale: 2 }).default("0"),
  packageSize: varchar("package_size"),
  status: qualityStatusEnum("status").default("pending"),
  storageLocationId: varchar("storage_location_id").references(() => storageLocations.id),
  productionDate: timestamp("production_date"),
  releasedAt: timestamp("released_at"),
  blockedAt: timestamp("blocked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stockBalances = pgTable("stock_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  batchId: varchar("batch_id").notNull(), // generic ref string or UUID
  locationId: varchar("location_id").references(() => storageLocations.id),
  itemType: itemTypeEnum("item_type").notNull(),
  availableQuantity: decimal("available_quantity", { precision: 10, scale: 2 }).default("0"),
  reservedQuantity: decimal("reserved_quantity", { precision: 10, scale: 2 }).default("0"),
  blockedQuantity: decimal("blocked_quantity", { precision: 10, scale: 2 }).default("0"),
  lastMovementAt: timestamp("last_movement_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  movementNumber: varchar("movement_number").unique().notNull(),
  movementType: varchar("movement_type").notNull(), // inbound_receipt, issue_to_production, finished_goods_receipt, stock_transfer, stock_adjustment, reservation, reservation_release, dispatch_out, block, release
  productId: varchar("product_id").references(() => products.id),
  batchId: varchar("batch_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  fromLocationId: varchar("from_location_id").references(() => storageLocations.id),
  toLocationId: varchar("to_location_id").references(() => storageLocations.id),
  referenceType: varchar("reference_type"), // delivery, production_order, dispatch_order, quality_check
  referenceId: varchar("reference_id"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dispatchOrders = pgTable("dispatch_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").unique().notNull(),
  customerId: varchar("customer_id").references(() => customers.id),
  customerName: varchar("customer_name").notNull(), // snapshot
  deliveryAddress: text("delivery_address"),
  scheduledDate: timestamp("scheduled_date"),
  receiverName: varchar("receiver_name"),
  podReference: varchar("pod_reference"),
  deliveryNotes: text("delivery_notes"),
  notes: text("notes"),
  status: varchar("status").default("draft"), // draft, scheduled, allocated, loading, dispatched, delivered, cancelled
  dispatchedAt: timestamp("dispatched_at"),
  deliveredAt: timestamp("delivered_at"),
  loadedAt: timestamp("loaded_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dispatchItems = pgTable("dispatch_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dispatchOrderId: varchar("dispatch_order_id").references(() => dispatchOrders.id),
  productId: varchar("product_id").references(() => products.id),
  finishedBatchId: varchar("finished_batch_id").references(() => finishedProductBatches.id),
  quantityAllocated: decimal("quantity_allocated", { precision: 10, scale: 2 }).notNull(),
  quantityLoaded: decimal("quantity_loaded", { precision: 10, scale: 2 }).default("0"),
  quantityDelivered: decimal("quantity_delivered", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status").default("allocated"), // allocated, loading, dispatched, delivered
});

// Governance
export const exceptionLogs = pgTable("exception_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exceptionType: exceptionTypeEnum("exception_type").notNull(),
  severity: severityEnum("severity").default("medium"),
  relatedEntityType: varchar("related_entity_type").notNull(), // delivery, batch, order, etc.
  relatedEntityId: varchar("related_entity_id").notNull(),
  description: text("description").notNull(),
  status: varchar("status").default("open"), // open, in_review, resolved, closed
  raisedBy: varchar("raised_by").references(() => users.id),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  actorId: varchar("actor_id").references(() => users.id),
  action: varchar("action").notNull(), // create, update, delete, status_change
  previousValues: jsonb("previous_values"),
  newValues: jsonb("new_values"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  qualityChecks: many(qualityChecks),
  productionOrders: many(productionOrders),
  dispatchOrders: many(dispatchOrders),
  exceptionLogs: many(exceptionLogs, { relationName: "raisedExceptions" }),
  resolvedExceptions: many(exceptionLogs, { relationName: "resolvedExceptions" }),
  auditLogs: many(auditLogs),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  deliveries: many(truckDeliveries),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  dispatchOrders: many(dispatchOrders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  deliveries: many(truckDeliveries),
  productionOrders: many(productionOrders),
  finishedBatches: many(finishedProductBatches),
  stockBalances: many(stockBalances),
}));

export const truckDeliveriesRelations = relations(truckDeliveries, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [truckDeliveries.supplierId],
    references: [suppliers.id],
  }),
  weighbridgeReadings: many(weighbridgeReadings),
  batches: many(rawMaterialBatches),
}));

export const weighbridgeReadingsRelations = relations(weighbridgeReadings, ({ one }) => ({
  delivery: one(truckDeliveries, {
    fields: [weighbridgeReadings.deliveryId],
    references: [truckDeliveries.id],
  }),
  operator: one(users, {
    fields: [weighbridgeReadings.operatorId],
    references: [users.id],
  }),
}));

export const rawMaterialBatchesRelations = relations(rawMaterialBatches, ({ one, many }) => ({
  delivery: one(truckDeliveries, {
    fields: [rawMaterialBatches.deliveryId],
    references: [truckDeliveries.id],
  }),
  product: one(products, {
    fields: [rawMaterialBatches.productId],
    references: [products.id],
  }),
  location: one(storageLocations, {
    fields: [rawMaterialBatches.initialLocationId],
    references: [storageLocations.id],
  }),
  qualityChecks: many(qualityChecks),
  materialIssues: many(productionMaterialIssues),
}));

export const qualityChecksRelations = relations(qualityChecks, ({ one }) => ({
  batch: one(rawMaterialBatches, {
    fields: [qualityChecks.batchId],
    references: [rawMaterialBatches.id],
  }),
  finishedBatch: one(finishedProductBatches, {
    fields: [qualityChecks.finishedBatchId],
    references: [finishedProductBatches.id],
  }),
  productionOrder: one(productionOrders, {
    fields: [qualityChecks.productionOrderId],
    references: [productionOrders.id],
  }),
  checker: one(users, {
    fields: [qualityChecks.checkedBy],
    references: [users.id],
  }),
}));

export const productionOrdersRelations = relations(productionOrders, ({ one, many }) => ({
  product: one(products, {
    fields: [productionOrders.productId],
    references: [products.id],
  }),
  creator: one(users, {
    fields: [productionOrders.createdBy],
    references: [users.id],
  }),
  releaser: one(users, {
    fields: [productionOrders.releasedBy],
    references: [users.id],
  }),
  materialIssues: many(productionMaterialIssues),
  finishedBatches: many(finishedProductBatches),
}));

export const productionMaterialIssuesRelations = relations(productionMaterialIssues, ({ one }) => ({
  productionOrder: one(productionOrders, {
    fields: [productionMaterialIssues.productionOrderId],
    references: [productionOrders.id],
  }),
  batch: one(rawMaterialBatches, {
    fields: [productionMaterialIssues.rawBatchId],
    references: [rawMaterialBatches.id],
  }),
  location: one(storageLocations, {
    fields: [productionMaterialIssues.issuedFromLocationId],
    references: [storageLocations.id],
  }),
  issuer: one(users, {
    fields: [productionMaterialIssues.issuedBy],
    references: [users.id],
  }),
}));

export const finishedProductBatchesRelations = relations(finishedProductBatches, ({ one, many }) => ({
  productionOrder: one(productionOrders, {
    fields: [finishedProductBatches.productionOrderId],
    references: [productionOrders.id],
  }),
  product: one(products, {
    fields: [finishedProductBatches.productId],
    references: [products.id],
  }),
  location: one(storageLocations, {
    fields: [finishedProductBatches.storageLocationId],
    references: [storageLocations.id],
  }),
  qualityChecks: many(qualityChecks),
  dispatchItems: many(dispatchItems),
}));

export const stockBalancesRelations = relations(stockBalances, ({ one }) => ({
  product: one(products, {
    fields: [stockBalances.productId],
    references: [products.id],
  }),
  location: one(storageLocations, {
    fields: [stockBalances.locationId],
    references: [storageLocations.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  fromLocation: one(storageLocations, {
    fields: [stockMovements.fromLocationId],
    references: [storageLocations.id],
  }),
  toLocation: one(storageLocations, {
    fields: [stockMovements.toLocationId],
    references: [storageLocations.id],
  }),
  creator: one(users, {
    fields: [stockMovements.createdBy],
    references: [users.id],
  }),
}));

export const dispatchOrdersRelations = relations(dispatchOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [dispatchOrders.customerId],
    references: [customers.id],
  }),
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
  product: one(products, {
    fields: [dispatchItems.productId],
    references: [products.id],
  }),
  finishedBatch: one(finishedProductBatches, {
    fields: [dispatchItems.finishedBatchId],
    references: [finishedProductBatches.id],
  }),
}));

export const exceptionLogsRelations = relations(exceptionLogs, ({ one }) => ({
  raiser: one(users, {
    fields: [exceptionLogs.raisedBy],
    references: [users.id],
    relationName: "raisedExceptions",
  }),
  resolver: one(users, {
    fields: [exceptionLogs.resolvedBy],
    references: [users.id],
    relationName: "resolvedExceptions",
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
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

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStorageLocationSchema = createInsertSchema(storageLocations).omit({
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

export const insertProductionMaterialIssueSchema = createInsertSchema(productionMaterialIssues).omit({
  id: true,
  issuedAt: true,
});

export const insertFinishedProductBatchSchema = createInsertSchema(finishedProductBatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export const insertDispatchOrderSchema = createInsertSchema(dispatchOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExceptionLogSchema = createInsertSchema(exceptionLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type StorageLocation = typeof storageLocations.$inferSelect;
export type InsertStorageLocation = z.infer<typeof insertStorageLocationSchema>;
export type TruckDelivery = typeof truckDeliveries.$inferSelect;
export type InsertTruckDelivery = z.infer<typeof insertTruckDeliverySchema>;
export type WeighbridgeReading = typeof weighbridgeReadings.$inferSelect;
export type InsertWeighbridgeReading = z.infer<typeof insertWeighbridgeReadingSchema>;
export type RawMaterialBatch = typeof rawMaterialBatches.$inferSelect;
export type InsertRawMaterialBatch = z.infer<typeof insertRawMaterialBatchSchema>;
export type QualityCheck = typeof qualityChecks.$inferSelect;
export type InsertQualityCheck = z.infer<typeof insertQualityCheckSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;
export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionMaterialIssue = typeof productionMaterialIssues.$inferSelect;
export type InsertProductionMaterialIssue = z.infer<typeof insertProductionMaterialIssueSchema>;
export type FinishedProductBatch = typeof finishedProductBatches.$inferSelect;
export type InsertFinishedProductBatch = z.infer<typeof insertFinishedProductBatchSchema>;
export type StockBalance = typeof stockBalances.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type DispatchOrder = typeof dispatchOrders.$inferSelect;
export type InsertDispatchOrder = z.infer<typeof insertDispatchOrderSchema>;
export type DispatchItem = typeof dispatchItems.$inferSelect;
export type ExceptionLog = typeof exceptionLogs.$inferSelect;
export type InsertExceptionLog = z.infer<typeof insertExceptionLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
