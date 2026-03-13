import {
  users,
  suppliers,
  customers,
  products,
  storageLocations,
  truckDeliveries,
  weighbridgeReadings,
  rawMaterialBatches,
  qualityChecks,
  productionOrders,
  productionMaterialIssues,
  finishedProductBatches,
  stockBalances,
  stockMovements,
  dispatchOrders,
  dispatchItems,
  exceptionLogs,
  auditLogs,
  type User,
  type Supplier,
  type Customer,
  type Product,
  type StorageLocation,
  type TruckDelivery,
  type WeighbridgeReading,
  type RawMaterialBatch,
  type QualityCheck,
  type ProductionOrder,
  type ProductionMaterialIssue,
  type FinishedProductBatch,
  type StockBalance,
  type StockMovement,
  type DispatchOrder,
  type DispatchItem,
  type ExceptionLog,
  type AuditLog,
  type LoginData,
  type RegisterData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  upsertUser(user: any): Promise<User>;
  updateUser(id: string, user: any): Promise<User>;
  deleteUser(id: string): Promise<void>;
  // Master Data
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: any): Promise<Supplier>;
  updateSupplier(id: string, supplier: any): Promise<Supplier>;
  getSupplierById(id: string): Promise<Supplier | undefined>;

  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: any): Promise<Customer>;
  updateCustomer(id: string, customer: any): Promise<Customer>;
  getCustomerById(id: string): Promise<Customer | undefined>;

  getProducts(): Promise<Product[]>;
  createProduct(product: any): Promise<Product>;
  updateProduct(id: string, product: any): Promise<Product>;
  getProductById(id: string): Promise<Product | undefined>;

  getStorageLocations(): Promise<StorageLocation[]>;
  createStorageLocation(location: any): Promise<StorageLocation>;
  updateStorageLocation(id: string, location: any): Promise<StorageLocation>;
  getStorageLocationById(id: string): Promise<StorageLocation | undefined>;

  // Truck Delivery operations
  getTruckDeliveries(): Promise<TruckDelivery[]>;
  createTruckDelivery(delivery: any): Promise<TruckDelivery>;
  getTruckDeliveryById(id: string): Promise<TruckDelivery | undefined>;
  updateTruckDeliveryStatus(id: string, status: string): Promise<void>;

  // Weighbridge operations
  getWeighbridgeReadings(): Promise<WeighbridgeReading[]>;
  getWeighbridgeReading(id: string): Promise<WeighbridgeReading | undefined>;
  createWeighbridgeReading(reading: any): Promise<WeighbridgeReading>;
  getWeighbridgeReadingByDeliveryId(deliveryId: string): Promise<WeighbridgeReading | undefined>;
  getPendingWeighbridgeDeliveries(): Promise<TruckDelivery[]>;

  // Raw Material Batch operations
  getRawMaterialBatches(): Promise<RawMaterialBatch[]>;
  createRawMaterialBatch(batch: any): Promise<RawMaterialBatch>;
  getRawMaterialBatchById(id: string): Promise<RawMaterialBatch | undefined>;
  updateBatchQualityStatus(id: string, status: string): Promise<void>;

  // Quality Check operations
  getQualityChecks(): Promise<QualityCheck[]>;
  createQualityCheck(check: any): Promise<QualityCheck>;
  getQualityChecksByBatchId(batchId: string): Promise<QualityCheck[]>;

  // Production Order operations
  getProductionOrders(): Promise<ProductionOrder[]>;
  createProductionOrder(order: any): Promise<ProductionOrder>;
  getProductionOrderById(id: string): Promise<ProductionOrder | undefined>;
  updateProductionOrderStatus(id: string, status: string): Promise<void>;

  // Finished Product Batch operations
  getFinishedProductBatches(): Promise<FinishedProductBatch[]>;
  createFinishedProductBatch(batch: any): Promise<FinishedProductBatch>;
  getFinishedProductBatchById(id: string): Promise<FinishedProductBatch | undefined>;
  issueMaterials(data: any): Promise<void>;
  recordProductionOutput(data: any): Promise<void>;

  // Stock operations
  getInventoryBalances(): Promise<any[]>;
  createStockMovement(movement: any): Promise<StockMovement>;
  getStockMovements(): Promise<any[]>;

  // Dispatch operations
  getDispatchOrders(): Promise<DispatchOrder[]>;
  createDispatchOrder(order: any): Promise<DispatchOrder>;
  getDispatchOrderById(id: string): Promise<DispatchOrder | undefined>;
  updateDispatchOrderStatus(id: string, status: string): Promise<void>;

  // Governance
  getExceptionLogs(): Promise<ExceptionLog[]>;
  createExceptionLog(log: any): Promise<ExceptionLog>;
  updateExceptionStatus(id: string, status: string, resolvedBy?: string, notes?: string): Promise<void>;

  getAuditLogs(): Promise<AuditLog[]>;
  createAuditLog(log: any): Promise<AuditLog>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    dailyProduction: number;
    qualityScore: number;
    pendingOrders: number;
    inventoryLevel: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const [created] = await db.insert(users).values(userData).returning();
    return created;
  }

  async upsertUser(userData: any): Promise<User> {
    const [existing] = await db.select().from(users).where(eq(users.email, userData.email));
    if (existing) {
      const [updated] = await db.update(users).set(userData).where(eq(users.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(users).values(userData).returning();
    return created;
  }

  async updateUser(id: string, userData: any): Promise<User> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Master Data
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async createSupplier(supplier: any): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async updateSupplier(id: string, updateData: any): Promise<Supplier> {
    const [updated] = await db.update(suppliers).set(updateData).where(eq(suppliers.id, id)).returning();
    return updated;
  }

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async createCustomer(customerData: any): Promise<Customer> {
    const [created] = await db.insert(customers).values(customerData).returning();
    return created;
  }

  async updateCustomer(id: string, customerData: any): Promise<Customer> {
    const [updated] = await db.update(customers).set(customerData).where(eq(customers.id, id)).returning();
    return updated;
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async createProduct(productData: any): Promise<Product> {
    const [created] = await db.insert(products).values(productData).returning();
    return created;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async updateProduct(id: string, productData: any): Promise<Product> {
    const [updated] = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return updated;
  }

  async getStorageLocations(): Promise<StorageLocation[]> {
    return await db.select().from(storageLocations).orderBy(desc(storageLocations.createdAt));
  }

  async createStorageLocation(locationData: any): Promise<StorageLocation> {
    const [created] = await db.insert(storageLocations).values(locationData).returning();
    return created;
  }

  async updateStorageLocation(id: string, locationData: any): Promise<StorageLocation> {
    const [updated] = await db.update(storageLocations).set(locationData).where(eq(storageLocations.id, id)).returning();
    return updated;
  }

  async getStorageLocationById(id: string): Promise<StorageLocation | undefined> {
    const [location] = await db.select().from(storageLocations).where(eq(storageLocations.id, id));
    return location;
  }

  // Truck Delivery operations
  async getTruckDeliveries(): Promise<TruckDelivery[]> {
    return await db.select().from(truckDeliveries).orderBy(desc(truckDeliveries.createdAt));
  }

  async createTruckDelivery(delivery: any): Promise<TruckDelivery> {
    const [created] = await db.insert(truckDeliveries).values(delivery).returning();
    return created;
  }

  async getTruckDeliveryById(id: string): Promise<TruckDelivery | undefined> {
    const [delivery] = await db.select().from(truckDeliveries).where(eq(truckDeliveries.id, id));
    return delivery;
  }

  async updateTruckDeliveryStatus(id: string, status: string): Promise<void> {
    await db
      .update(truckDeliveries)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(truckDeliveries.id, id));
  }

  async updateDeliveryStatus(id: string, status: string): Promise<void> {
    return this.updateTruckDeliveryStatus(id, status);
  }

  // Weighbridge operations
  async getWeighbridgeReadings(): Promise<any[]> {
    return await db
      .select({
        id: weighbridgeReadings.id,
        deliveryId: weighbridgeReadings.deliveryId,
        grossWeight: weighbridgeReadings.grossWeight,
        tareWeight: weighbridgeReadings.tareWeight,
        netWeight: weighbridgeReadings.netWeight,
        readingType: weighbridgeReadings.readingType,
        ticketNumber: weighbridgeReadings.ticketNumber,
        readingTime: weighbridgeReadings.readingTime,
        isFinal: weighbridgeReadings.isFinal,
        operatorId: weighbridgeReadings.operatorId,
        notes: weighbridgeReadings.notes,
        createdAt: weighbridgeReadings.createdAt,
        delivery: {
          truckRegistration: truckDeliveries.truckRegistration,
          driverName: truckDeliveries.driverName,
        },
        operatorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      })
      .from(weighbridgeReadings)
      .leftJoin(truckDeliveries, eq(weighbridgeReadings.deliveryId, truckDeliveries.id))
      .leftJoin(users, eq(weighbridgeReadings.operatorId, users.id))
      .orderBy(desc(weighbridgeReadings.readingTime));
  }

  async getWeighbridgeReading(id: string): Promise<WeighbridgeReading | undefined> {
    const [reading] = await db.select().from(weighbridgeReadings).where(eq(weighbridgeReadings.id, id));
    return reading;
  }

  async createWeighbridgeReading(reading: any): Promise<WeighbridgeReading> {
    const weighbridgeReading = await db.transaction(async (tx) => {
      const [created] = await tx.insert(weighbridgeReadings).values(reading).returning();

      if (reading.isFinal) {
        // 1. Update Truck Delivery
        const [delivery] = await tx
          .update(truckDeliveries)
          .set({
            status: "received" as any,
            receivedQuantity: reading.netWeight.toString(),
            updatedAt: new Date()
          })
          .where(eq(truckDeliveries.id, reading.deliveryId))
          .returning();

        // 2. Create Raw Material Batch (if it doesn't exist for this delivery)
        const batchNumber = `RM-${delivery.deliveryNumber}`;
        const [batch] = await tx
          .insert(rawMaterialBatches)
          .values({
            batchNumber,
            deliveryId: delivery.id,
            productId: (delivery as any).productId,
            quantityReceived: reading.netWeight.toString(),
            status: "pending" as any,
          })
          .onConflictDoUpdate({
            target: [rawMaterialBatches.batchNumber],
            set: { quantityReceived: reading.netWeight.toString() }
          })
          .returning();

        // 3. Update Stock Balance (initial location - maybe a 'Holding' or 'Intake' zone)
        // Find or create 'Intake' location
        let intakeLocationId = "intake-zone"; // Placeholder or search
        const [loc] = await tx.select().from(storageLocations).where(eq(storageLocations.code, "INTAKE")).limit(1);
        if (loc) intakeLocationId = loc.id;

        const [existingBalance] = await tx
          .select()
          .from(stockBalances)
          .where(and(eq(stockBalances.productId, (delivery as any).productId), eq(stockBalances.batchId, batch.id)))
          .limit(1);

        if (existingBalance) {
          await tx
            .update(stockBalances)
            .set({
              availableQuantity: (Number(existingBalance.availableQuantity) + Number(reading.netWeight)).toString(),
              updatedAt: new Date()
            })
            .where(eq(stockBalances.id, existingBalance.id));
        } else {
          await tx.insert(stockBalances).values({
            productId: (delivery as any).productId,
            batchId: batch.id,
            locationId: intakeLocationId,
            itemType: "raw_material",
            availableQuantity: reading.netWeight.toString(),
          });
        }

        // 4. Record Stock Movement
        await tx.insert(stockMovements).values({
          movementNumber: await this.generateMovementNumber(),
          movementType: "inbound_receipt",
          productId: (delivery as any).productId,
          batchId: batch.id,
          quantity: reading.netWeight.toString(),
          toLocationId: intakeLocationId,
          referenceType: "delivery",
          referenceId: delivery.id,
          createdBy: reading.operatorId,
        });
      }

      return created;
    });

    return weighbridgeReading;
  }

  async getWeighbridgeReadingByDeliveryId(deliveryId: string): Promise<WeighbridgeReading | undefined> {
    const [reading] = await db
      .select()
      .from(weighbridgeReadings)
      .where(eq(weighbridgeReadings.deliveryId, deliveryId))
      .orderBy(desc(weighbridgeReadings.readingTime))
      .limit(1);
    return reading;
  }

  async getPendingWeighbridgeDeliveries(): Promise<TruckDelivery[]> {
    return await db
      .select()
      .from(truckDeliveries)
      .where(and(eq(truckDeliveries.status, "pending_receipt")));
  }

  // Raw Material Batch operations
  async getRawMaterialBatches(): Promise<RawMaterialBatch[]> {
    return await db.select().from(rawMaterialBatches).orderBy(desc(rawMaterialBatches.createdAt));
  }

  async createRawMaterialBatch(batch: any): Promise<RawMaterialBatch> {
    const [created] = await db.insert(rawMaterialBatches).values(batch).returning();
    return created;
  }

  async getRawMaterialBatchById(id: string): Promise<RawMaterialBatch | undefined> {
    const [batch] = await db.select().from(rawMaterialBatches).where(eq(rawMaterialBatches.id, id));
    return batch;
  }

  async updateBatchQualityStatus(id: string, status: string): Promise<void> {
    const updateData: any = { status: status as any, updatedAt: new Date() };
    if (status === "approved") updateData.approvedAt = new Date();
    if (status === "rejected") updateData.rejectedAt = new Date();

    await db.update(rawMaterialBatches).set(updateData).where(eq(rawMaterialBatches.id, id));
  }

  // Quality Check operations
  async getQualityChecks(): Promise<QualityCheck[]> {
    return await db.select().from(qualityChecks).orderBy(desc(qualityChecks.checkedAt));
  }

  async createQualityCheck(check: any): Promise<QualityCheck> {
    const [created] = await db.insert(qualityChecks).values(check).returning();
    return created;
  }

  async getQualityChecksByBatchId(batchId: string): Promise<QualityCheck[]> {
    return await db.select().from(qualityChecks).where(eq(qualityChecks.batchId, batchId));
  }

  // Production Order operations
  async getProductionOrders(): Promise<ProductionOrder[]> {
    return await db.select().from(productionOrders).orderBy(desc(productionOrders.createdAt));
  }

  async createProductionOrder(order: any): Promise<ProductionOrder> {
    const [created] = await db.insert(productionOrders).values(order).returning();
    return created;
  }

  async getProductionOrderById(id: string): Promise<ProductionOrder | undefined> {
    const [order] = await db.select().from(productionOrders).where(eq(productionOrders.id, id));
    return order;
  }

  async updateProductionOrderStatus(id: string, status: string): Promise<void> {
    const updateData: any = { status: status as any, updatedAt: new Date() };
    if (status === "in_progress") updateData.startedAt = new Date();
    if (status === "completed") updateData.completedAt = new Date();
    if (status === "released") updateData.releasedAt = new Date();

    await db.update(productionOrders).set(updateData).where(eq(productionOrders.id, id));
  }

  async updateProductionOrderProgress(id: string, actualQuantityProduced: number): Promise<void> {
    await db
      .update(productionOrders)
      .set({ actualQuantityProduced: actualQuantityProduced.toString(), updatedAt: new Date() })
      .where(eq(productionOrders.id, id));
  }

  // Finished Product Batch operations
  async getFinishedProductBatches(): Promise<FinishedProductBatch[]> {
    return await db.select().from(finishedProductBatches).orderBy(desc(finishedProductBatches.createdAt));
  }

  async createFinishedProductBatch(batchData: any): Promise<FinishedProductBatch> {
    const [created] = await db.insert(finishedProductBatches).values(batchData).returning();
    return created;
  }

  async getFinishedProductBatchById(id: string): Promise<FinishedProductBatch | undefined> {
    const [batch] = await db.select().from(finishedProductBatches).where(eq(finishedProductBatches.id, id));
    return batch;
  }

  async issueMaterials(data: any): Promise<void> {
    const { productionOrderId, rawBatchId, quantityIssued, issuedFromLocationId, issuedBy } = data;

    await db.transaction(async (tx) => {
      // 1. Create production_material_issues record
      await tx.insert(productionMaterialIssues).values({
        productionOrderId,
        rawBatchId,
        quantityIssued: quantityIssued.toString(),
        issuedFromLocationId,
        issuedBy,
      });

      // 2. Update productionOrders.totalQuantityIssued
      const [order] = await tx.select().from(productionOrders).where(eq(productionOrders.id, productionOrderId));
      const newTotalIssued = (parseFloat(order.totalQuantityIssued || "0") + parseFloat(quantityIssued)).toString();
      await tx.update(productionOrders)
        .set({ totalQuantityIssued: newTotalIssued, updatedAt: new Date() })
        .where(eq(productionOrders.id, productionOrderId));

      // 3. Update rawMaterialBatches.quantityConsumed and status
      const [batch] = await tx.select().from(rawMaterialBatches).where(eq(rawMaterialBatches.id, rawBatchId));
      const newConsumed = (parseFloat(batch.quantityConsumed || "0") + parseFloat(quantityIssued)).toString();
      const totalQty = parseFloat(batch.quantityReceived);
      const newStatus = parseFloat(newConsumed) >= totalQty ? "consumed" : "partially_consumed";

      await tx.update(rawMaterialBatches)
        .set({ quantityConsumed: newConsumed, status: newStatus as any, updatedAt: new Date() })
        .where(eq(rawMaterialBatches.id, rawBatchId));

      // 4. Update stock_balances.availableQuantity
      const [balance] = await tx.select()
        .from(stockBalances)
        .where(and(eq(stockBalances.batchId, rawBatchId), eq(stockBalances.locationId, issuedFromLocationId)));

      const newAvailable = (parseFloat(balance.availableQuantity || "0") - parseFloat(quantityIssued)).toString();
      await tx.update(stockBalances)
        .set({ availableQuantity: newAvailable, lastMovementAt: new Date(), updatedAt: new Date() })
        .where(eq(stockBalances.id, balance.id));

      // 5. Create stock_movement
      const movementNumber = await this.generateMovementNumber();
      await tx.insert(stockMovements).values({
        movementNumber,
        movementType: "issue_to_production",
        productId: batch.productId,
        batchId: rawBatchId,
        quantity: quantityIssued.toString(),
        fromLocationId: issuedFromLocationId,
        referenceType: "production_order",
        referenceId: productionOrderId,
        createdBy: issuedBy,
      });
    });
  }

  async recordProductionOutput(data: any): Promise<void> {
    const { productionOrderId, productId, quantityProduced, packageSize, storageLocationId, productionDate, userId } = data;

    await db.transaction(async (tx) => {
      // 1. Create finished_product_batch
      const batchNumber = `FP-${Date.now()}`; // Simplified for demo
      const [newBatch] = await tx.insert(finishedProductBatches).values({
        batchNumber,
        productionOrderId,
        productId,
        quantityProduced: quantityProduced.toString(),
        packageSize,
        storageLocationId,
        productionDate: new Date(productionDate),
        status: "pending",
      }).returning();

      // 2. Update productionOrders.actualQuantityProduced
      const [order] = await tx.select().from(productionOrders).where(eq(productionOrders.id, productionOrderId));
      const newActual = (parseFloat(order.actualQuantityProduced || "0") + parseFloat(quantityProduced)).toString();
      await tx.update(productionOrders)
        .set({ actualQuantityProduced: newActual, updatedAt: new Date() })
        .where(eq(productionOrders.id, productionOrderId));

      // 3. Create or Update stock_balance
      const [existingBalance] = await tx.select()
        .from(stockBalances)
        .where(and(eq(stockBalances.batchId, newBatch.id), eq(stockBalances.locationId, storageLocationId)));

      if (existingBalance) {
        const newAvailable = (parseFloat(existingBalance.availableQuantity || "0") + parseFloat(quantityProduced)).toString();
        await tx.update(stockBalances)
          .set({ availableQuantity: newAvailable, lastMovementAt: new Date(), updatedAt: new Date() })
          .where(eq(stockBalances.id, existingBalance.id));
      } else {
        await tx.insert(stockBalances).values({
          productId,
          batchId: newBatch.id,
          locationId: storageLocationId,
          itemType: "finished_product",
          availableQuantity: quantityProduced.toString(),
          lastMovementAt: new Date(),
        });
      }

      // 4. Create stock_movement
      const movementNumber = await this.generateMovementNumber();
      await tx.insert(stockMovements).values({
        movementNumber,
        movementType: "finished_goods_receipt",
        productId,
        batchId: newBatch.id,
        quantity: quantityProduced.toString(),
        toLocationId: storageLocationId,
        referenceType: "production_order",
        referenceId: productionOrderId,
        createdBy: userId,
      });
    });
  }

  private async generateMovementNumber(): Promise<string> {
    return `MV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }


  async createStockMovement(movement: any): Promise<StockMovement> {
    const [created] = await db.insert(stockMovements).values(movement).returning();
    return created;
  }

  // Dispatch operations
  async getDispatchOrders(): Promise<DispatchOrder[]> {
    return await db.select().from(dispatchOrders).orderBy(desc(dispatchOrders.createdAt));
  }

  async createDispatchOrder(order: any): Promise<DispatchOrder> {
    const [created] = await db.insert(dispatchOrders).values(order).returning();
    return created;
  }

  async getDispatchOrderById(id: string): Promise<DispatchOrder | undefined> {
    const [order] = await db.select().from(dispatchOrders).where(eq(dispatchOrders.id, id));
    return order;
  }

  async updateDispatchOrderStatus(id: string, status: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (status === "dispatched") updateData.dispatchedAt = new Date();
    if (status === "delivered") updateData.deliveredAt = new Date();
    if (status === "loading") updateData.loadedAt = new Date();

    await db.update(dispatchOrders).set(updateData).where(eq(dispatchOrders.id, id));
  }

  // Governance
  async getExceptionLogs(): Promise<ExceptionLog[]> {
    return await db.select().from(exceptionLogs).orderBy(desc(exceptionLogs.createdAt));
  }

  async createExceptionLog(log: any): Promise<ExceptionLog> {
    const [created] = await db.insert(exceptionLogs).values(log).returning();
    return created;
  }

  async updateExceptionStatus(id: string, status: string, resolvedBy?: string, notes?: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date();
      if (resolvedBy) updateData.resolvedBy = resolvedBy;
    }
    if (notes) updateData.resolutionNotes = notes;

    await db.update(exceptionLogs).set(updateData).where(eq(exceptionLogs.id, id));
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }

  async createAuditLog(log: any): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }


  async getStockMovements(): Promise<any[]> {
    return await db
      .select({
        id: stockMovements.id,
        movementNumber: stockMovements.movementNumber,
        movementType: stockMovements.movementType,
        productId: stockMovements.productId,
        productName: products.name,
        batchId: stockMovements.batchId,
        quantity: stockMovements.quantity,
        fromLocationId: stockMovements.fromLocationId,
        toLocationId: stockMovements.toLocationId,
        referenceType: stockMovements.referenceType,
        referenceId: stockMovements.referenceId,
        createdBy: stockMovements.createdBy,
        createdAt: stockMovements.createdAt,
      })
      .from(stockMovements)
      .leftJoin(products, eq(stockMovements.productId, products.id))
      .orderBy(desc(stockMovements.createdAt));
  }

  async getInventoryBalances(): Promise<any[]> {
    return await db
      .select({
        id: stockBalances.id,
        productId: stockBalances.productId,
        productName: products.name,
        batchId: stockBalances.batchId,
        locationId: stockBalances.locationId,
        locationName: storageLocations.name,
        zone: storageLocations.zone,
        itemType: stockBalances.itemType,
        currentQuantity: stockBalances.availableQuantity,
        reservedQuantity: stockBalances.reservedQuantity,
        blockedQuantity: stockBalances.blockedQuantity,
        unit: products.unitOfMeasure,
        lastMovementAt: stockBalances.lastMovementAt,
      })
      .from(stockBalances)
      .leftJoin(products, eq(stockBalances.productId, products.id))
      .leftJoin(storageLocations, eq(stockBalances.locationId, storageLocations.id))
      .orderBy(desc(stockBalances.lastMovementAt));
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    dailyProduction: number;
    qualityScore: number;
    pendingOrders: number;
    inventoryLevel: number;
  }> {
    // Get today's production
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyProductionResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${finishedProductBatches.quantityProduced}), 0)`,
      })
      .from(finishedProductBatches)
      .where(gte(finishedProductBatches.createdAt, today));

    // Get quality score (percentage of approved quality checks)
    const qualityScoreResult = await db
      .select({
        total: sql<number>`COUNT(*)`,
        passed: sql<number>`COUNT(CASE WHEN ${qualityChecks.status} = 'approved' THEN 1 END)`,
      })
      .from(qualityChecks);

    // Get pending production orders
    const pendingOrdersResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(productionOrders)
      .where(eq(productionOrders.status, "scheduled"));

    // Calculate inventory level (sum of stock balances / target capacity - placeholder 500t)
    const inventoryResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${stockBalances.availableQuantity}), 0)`,
      })
      .from(stockBalances);

    const dailyProduction = Number(dailyProductionResult[0]?.total || 0);
    const qualityData = qualityScoreResult[0];
    const qualityScore = qualityData?.total > 0 ? (Number(qualityData.passed) / Number(qualityData.total)) * 100 : 0;
    const pendingOrders = Number(pendingOrdersResult[0]?.count || 0);
    const totalStock = Number(inventoryResult[0]?.total || 0);
    const inventoryLevel = Math.min((totalStock / 500) * 100, 100);

    return {
      dailyProduction,
      qualityScore,
      pendingOrders,
      inventoryLevel,
    };
  }
}

export const storage = new DatabaseStorage();
