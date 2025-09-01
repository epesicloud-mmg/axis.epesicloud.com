import {
  users,
  suppliers,
  truckDeliveries,
  weighbridgeReadings,
  rawMaterialBatches,
  qualityChecks,
  productionOrders,
  finishedProductBatches,
  warehouseStock,
  dispatchOrders,
  dispatchItems,
  type User,
  type UpsertUser,
  type Supplier,
  type InsertSupplier,
  type TruckDelivery,
  type InsertTruckDelivery,
  type WeighbridgeReading,
  type InsertWeighbridgeReading,
  type RawMaterialBatch,
  type InsertRawMaterialBatch,
  type QualityCheck,
  type InsertQualityCheck,
  type ProductionOrder,
  type InsertProductionOrder,
  type FinishedProductBatch,
  type InsertFinishedProductBatch,
  type DispatchOrder,
  type InsertDispatchOrder,
  type WarehouseStock,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  getSupplierById(id: string): Promise<Supplier | undefined>;

  // Truck Delivery operations
  getTruckDeliveries(): Promise<TruckDelivery[]>;
  createTruckDelivery(delivery: InsertTruckDelivery): Promise<TruckDelivery>;
  getTruckDeliveryById(id: string): Promise<TruckDelivery | undefined>;
  updateTruckDeliveryStatus(id: string, status: string): Promise<void>;

  // Weighbridge operations
  createWeighbridgeReading(reading: InsertWeighbridgeReading): Promise<WeighbridgeReading>;
  getWeighbridgeReadingByDeliveryId(deliveryId: string): Promise<WeighbridgeReading | undefined>;

  // Raw Material Batch operations
  getRawMaterialBatches(): Promise<RawMaterialBatch[]>;
  createRawMaterialBatch(batch: InsertRawMaterialBatch): Promise<RawMaterialBatch>;
  updateBatchQualityStatus(id: string, status: string): Promise<void>;

  // Quality Check operations
  getQualityChecks(): Promise<QualityCheck[]>;
  createQualityCheck(check: InsertQualityCheck): Promise<QualityCheck>;
  getQualityChecksByBatchId(batchId: string): Promise<QualityCheck[]>;

  // Production Order operations
  getProductionOrders(): Promise<ProductionOrder[]>;
  createProductionOrder(order: InsertProductionOrder): Promise<ProductionOrder>;
  updateProductionOrderStatus(id: string, status: string): Promise<void>;
  updateProductionOrderProgress(id: string, completedQuantity: number): Promise<void>;

  // Finished Product Batch operations
  getFinishedProductBatches(): Promise<FinishedProductBatch[]>;
  createFinishedProductBatch(batch: InsertFinishedProductBatch): Promise<FinishedProductBatch>;

  // Warehouse Stock operations
  getWarehouseStock(): Promise<WarehouseStock[]>;
  updateWarehouseStock(itemType: string, batchId: string, quantity: number, location: string): Promise<void>;

  // Dispatch operations
  getDispatchOrders(): Promise<DispatchOrder[]>;
  createDispatchOrder(order: InsertDispatchOrder): Promise<DispatchOrder>;
  updateDispatchOrderStatus(id: string, status: string): Promise<void>;

  // Weighbridge operations
  getWeighbridgeReadings(): Promise<WeighbridgeReading[]>;
  getWeighbridgeReading(id: string): Promise<WeighbridgeReading | undefined>;
  createWeighbridgeReading(reading: InsertWeighbridgeReading): Promise<WeighbridgeReading>;
  getPendingWeighbridgeDeliveries(): Promise<TruckDelivery[]>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    dailyProduction: number;
    qualityScore: number;
    pendingOrders: number;
    inventoryLevel: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  // Truck Delivery operations
  async getTruckDeliveries(): Promise<TruckDelivery[]> {
    return await db.select().from(truckDeliveries).orderBy(desc(truckDeliveries.deliveryDate));
  }

  async createTruckDelivery(delivery: InsertTruckDelivery): Promise<TruckDelivery> {
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

  // Weighbridge operations
  async createWeighbridgeReading(reading: InsertWeighbridgeReading): Promise<WeighbridgeReading> {
    const [created] = await db.insert(weighbridgeReadings).values(reading).returning();
    return created;
  }

  async getWeighbridgeReadingByDeliveryId(deliveryId: string): Promise<WeighbridgeReading | undefined> {
    const [reading] = await db
      .select()
      .from(weighbridgeReadings)
      .where(eq(weighbridgeReadings.deliveryId, deliveryId));
    return reading;
  }

  // Raw Material Batch operations
  async getRawMaterialBatches(): Promise<RawMaterialBatch[]> {
    return await db.select().from(rawMaterialBatches).orderBy(desc(rawMaterialBatches.createdAt));
  }

  async createRawMaterialBatch(batch: InsertRawMaterialBatch): Promise<RawMaterialBatch> {
    const [created] = await db.insert(rawMaterialBatches).values(batch).returning();
    return created;
  }

  async updateBatchQualityStatus(id: string, status: string): Promise<void> {
    await db
      .update(rawMaterialBatches)
      .set({ qualityStatus: status as any, updatedAt: new Date() })
      .where(eq(rawMaterialBatches.id, id));
  }

  // Quality Check operations
  async getQualityChecks(): Promise<QualityCheck[]> {
    return await db.select().from(qualityChecks).orderBy(desc(qualityChecks.checkedAt));
  }

  async createQualityCheck(check: InsertQualityCheck): Promise<QualityCheck> {
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

  async createProductionOrder(order: InsertProductionOrder): Promise<ProductionOrder> {
    const [created] = await db.insert(productionOrders).values(order).returning();
    return created;
  }

  async updateProductionOrderStatus(id: string, status: string): Promise<void> {
    await db
      .update(productionOrders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(productionOrders.id, id));
  }

  async updateProductionOrderProgress(id: string, completedQuantity: number): Promise<void> {
    await db
      .update(productionOrders)
      .set({ completedQuantity, updatedAt: new Date() })
      .where(eq(productionOrders.id, id));
  }

  // Finished Product Batch operations
  async getFinishedProductBatches(): Promise<FinishedProductBatch[]> {
    return await db.select().from(finishedProductBatches).orderBy(desc(finishedProductBatches.createdAt));
  }

  async createFinishedProductBatch(batch: InsertFinishedProductBatch): Promise<FinishedProductBatch> {
    const [created] = await db.insert(finishedProductBatches).values(batch).returning();
    return created;
  }

  // Warehouse Stock operations
  async getWarehouseStock(): Promise<WarehouseStock[]> {
    return await db.select().from(warehouseStock).orderBy(desc(warehouseStock.updatedAt));
  }

  async updateWarehouseStock(itemType: string, batchId: string, quantity: number, location: string): Promise<void> {
    await db
      .insert(warehouseStock)
      .values({
        itemType,
        batchId,
        currentQuantity: quantity.toString(),
        location,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [warehouseStock.itemType, warehouseStock.batchId],
        set: {
          currentQuantity: quantity.toString(),
          updatedAt: new Date(),
        },
      });
  }

  // Dispatch operations
  async getDispatchOrders(): Promise<DispatchOrder[]> {
    return await db.select().from(dispatchOrders).orderBy(desc(dispatchOrders.createdAt));
  }

  async createDispatchOrder(order: InsertDispatchOrder): Promise<DispatchOrder> {
    const [created] = await db.insert(dispatchOrders).values(order).returning();
    return created;
  }

  async updateDispatchOrderStatus(id: string, status: string): Promise<void> {
    await db
      .update(dispatchOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(dispatchOrders.id, id));
  }

  // Weighbridge operations
  async getWeighbridgeReadings(): Promise<WeighbridgeReading[]> {
    const readings = await db
      .select({
        id: weighbridgeReadings.id,
        deliveryId: weighbridgeReadings.deliveryId,
        grossWeight: weighbridgeReadings.grossWeight,
        tareWeight: weighbridgeReadings.tareWeight,
        netWeight: weighbridgeReadings.netWeight,
        operatorName: weighbridgeReadings.operatorName,
        notes: weighbridgeReadings.notes,
        weighbridgeCharges: weighbridgeReadings.weighbridgeCharges,
        ticketNumber: weighbridgeReadings.ticketNumber,
        readingTime: weighbridgeReadings.readingTime,
        createdAt: weighbridgeReadings.createdAt,
        delivery: {
          id: truckDeliveries.id,
          truckRegistration: truckDeliveries.truckRegistration,
          driverName: truckDeliveries.driverName,
          driverPhone: truckDeliveries.driverPhone,
          supplierId: truckDeliveries.supplierId,
          expectedQuantity: truckDeliveries.expectedQuantity,
          actualQuantity: truckDeliveries.actualQuantity,
          status: truckDeliveries.status,
          deliveryDate: truckDeliveries.deliveryDate,
        }
      })
      .from(weighbridgeReadings)
      .leftJoin(truckDeliveries, eq(weighbridgeReadings.deliveryId, truckDeliveries.id))
      .orderBy(desc(weighbridgeReadings.readingTime));
    return readings as any;
  }

  async getWeighbridgeReading(id: string): Promise<WeighbridgeReading | undefined> {
    const [reading] = await db
      .select({
        id: weighbridgeReadings.id,
        deliveryId: weighbridgeReadings.deliveryId,
        grossWeight: weighbridgeReadings.grossWeight,
        tareWeight: weighbridgeReadings.tareWeight,
        netWeight: weighbridgeReadings.netWeight,
        operatorName: weighbridgeReadings.operatorName,
        notes: weighbridgeReadings.notes,
        weighbridgeCharges: weighbridgeReadings.weighbridgeCharges,
        ticketNumber: weighbridgeReadings.ticketNumber,
        readingTime: weighbridgeReadings.readingTime,
        createdAt: weighbridgeReadings.createdAt,
        delivery: {
          id: truckDeliveries.id,
          truckRegistration: truckDeliveries.truckRegistration,
          driverName: truckDeliveries.driverName,
          driverPhone: truckDeliveries.driverPhone,
          supplierId: truckDeliveries.supplierId,
          expectedQuantity: truckDeliveries.expectedQuantity,
          actualQuantity: truckDeliveries.actualQuantity,
          status: truckDeliveries.status,
          deliveryDate: truckDeliveries.deliveryDate,
        }
      })
      .from(weighbridgeReadings)
      .leftJoin(truckDeliveries, eq(weighbridgeReadings.deliveryId, truckDeliveries.id))
      .where(eq(weighbridgeReadings.id, id));
    return reading as any;
  }

  async createWeighbridgeReading(reading: InsertWeighbridgeReading): Promise<WeighbridgeReading> {
    const [created] = await db
      .insert(weighbridgeReadings)
      .values(reading)
      .returning();
    return created;
  }

  async getPendingWeighbridgeDeliveries(): Promise<TruckDelivery[]> {
    return await db
      .select()
      .from(truckDeliveries)
      .where(eq(truckDeliveries.status, "pending"));
  }

  async updateDeliveryStatus(id: string, status: string): Promise<void> {
    await db
      .update(truckDeliveries)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(truckDeliveries.id, id));
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
        total: sql<number>`COALESCE(SUM(${finishedProductBatches.quantity}), 0)`,
      })
      .from(finishedProductBatches)
      .where(sql`${finishedProductBatches.createdAt} >= ${today}`);

    // Get quality score (percentage of passed quality checks)
    const qualityScoreResult = await db
      .select({
        total: sql<number>`COUNT(*)`,
        passed: sql<number>`COUNT(CASE WHEN ${qualityChecks.status} = 'passed' THEN 1 END)`,
      })
      .from(qualityChecks);

    // Get pending production orders
    const pendingOrdersResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(productionOrders)
      .where(eq(productionOrders.status, "scheduled"));

    // Calculate inventory level (simplified - could be more complex)
    const inventoryResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${warehouseStock.currentQuantity} AS NUMERIC)), 0)`,
      })
      .from(warehouseStock);

    const dailyProduction = dailyProductionResult[0]?.total || 0;
    const qualityData = qualityScoreResult[0];
    const qualityScore = qualityData?.total > 0 ? (qualityData.passed / qualityData.total) * 100 : 0;
    const pendingOrders = pendingOrdersResult[0]?.count || 0;
    const inventoryLevel = Math.min(inventoryResult[0]?.total || 0, 100); // Cap at 100%

    return {
      dailyProduction,
      qualityScore,
      pendingOrders,
      inventoryLevel,
    };
  }
}

export const storage = new DatabaseStorage();
