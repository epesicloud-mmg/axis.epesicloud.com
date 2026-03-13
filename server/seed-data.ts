import { db } from "./db";
import {
  suppliers,
  customers,
  products,
  storageLocations,
  truckDeliveries,
  weighbridgeReadings,
  rawMaterialBatches,
  qualityChecks,
  productionOrders,
  finishedProductBatches,
  stockBalances,
  dispatchOrders,
  dispatchItems,
  users
} from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDemoData() {
  try {
    console.log("🌱 Starting to seed demo data...");

    // 0. Get a user for references
    const [adminUser] = await db.select().from(users).limit(1);
    const userId = adminUser?.id;

    // 1. Create Suppliers
    const supplierData = [
      {
        id: "supplier-001",
        name: "Green Valley Farms",
        supplierCode: "SUP-GVF",
        contactPerson: "John Kamau",
        phone: "+254712345678",
        email: "contact@greenvalley.co.ke",
        address: "Nakuru County, Kenya",
        isActive: true
      },
      {
        id: "supplier-002",
        name: "Highlands Agriculture Co.",
        supplierCode: "SUP-HAC",
        contactPerson: "Mary Wanjiku",
        phone: "+254723456789",
        email: "info@highlands-ag.com",
        address: "Uasin Gishu County, Kenya",
        isActive: true
      }
    ];

    for (const s of supplierData) {
      await db.insert(suppliers).values(s).onConflictDoNothing();
    }
    console.log("✅ Seeded suppliers");

    // 2. Create Customers
    const customerData = [
      {
        id: "cust-001",
        name: "Tuskys Supermarket",
        customerCode: "CUST-TYS",
        contactPerson: "James Omondi",
        phone: "+254720123456",
        email: "logistics@tuskys.co.ke",
        address: "Westlands, Nairobi"
      },
      {
        id: "cust-002",
        name: "Naivas Supermarket",
        customerCode: "CUST-NVS",
        contactPerson: "Sarah Chebet",
        phone: "+254731234567",
        email: "orders@naivas.co.ke",
        address: "Karen, Nairobi"
      }
    ];

    for (const c of customerData) {
      await db.insert(customers).values(c).onConflictDoNothing();
    }
    console.log("✅ Seeded customers");

    // 3. Create Products
    const productData = [
      {
        id: "prod-raw-001",
        sku: "RM-MAIZE-001",
        name: "Raw White Maize",
        productType: "raw_material" as const,
        unitOfMeasure: "kg"
      },
      {
        id: "prod-fin-001",
        sku: "FP-MAIZE-2KG",
        name: "Premium Maize Flour 2kg",
        productType: "finished_product" as const,
        packageSize: "2kg",
        unitOfMeasure: "kg"
      },
      {
        id: "prod-fin-002",
        sku: "FP-MAIZE-5KG",
        name: "Premium Maize Flour 5kg",
        productType: "finished_product" as const,
        packageSize: "5kg",
        unitOfMeasure: "kg"
      }
    ];

    for (const p of productData) {
      await db.insert(products).values(p).onConflictDoNothing();
    }
    console.log("✅ Seeded products");

    // 4. Create Storage Locations
    const locationData = [
      {
        id: "loc-raw-01",
        code: "SILO-01",
        name: "Main Maize Silo 1",
        zone: "Bunkers",
        itemType: "raw_material" as const
      },
      {
        id: "loc-fin-01",
        code: "WH-B1",
        name: "Finished Goods Warehouse B1",
        zone: "Dispatch",
        itemType: "finished_product" as const
      }
    ];

    for (const l of locationData) {
      await db.insert(storageLocations).values(l).onConflictDoNothing();
    }
    console.log("✅ Seeded storage locations");

    // 5. Create Truck Deliveries
    const deliveryData = [
      {
        id: "delivery-001",
        deliveryNumber: "DLV-0001",
        supplierId: "supplier-001",
        truckRegistration: "KCA 123A",
        driverName: "Samuel Mwangi",
        driverPhone: "+254745678901",
        expectedQuantity: "25000",
        receivedQuantity: "24850",
        expectedArrivalAt: new Date("2025-01-07T08:30:00Z"),
        status: "approved" as const,
        createdBy: userId
      }
    ];

    for (const d of deliveryData) {
      await db.insert(truckDeliveries).values(d).onConflictDoNothing();
    }
    console.log("✅ Seeded deliveries");

    // 6. Create Raw Material Batches
    const rawBatchData = [
      {
        id: "rb-001",
        batchNumber: "RM-BT-001",
        deliveryId: "delivery-001",
        productId: "prod-raw-001",
        quantityReceived: "24850",
        initialLocationId: "loc-raw-01",
        status: "approved" as const,
        intakeBy: userId
      }
    ];

    for (const rb of rawBatchData) {
      await db.insert(rawMaterialBatches).values(rb).onConflictDoNothing();
    }
    console.log("✅ Seeded raw batches");

    // 7. Create Quality Checks
    const qcData = [
      {
        id: "qc-001",
        checkNumber: "QC-IN-001",
        checkType: "raw_material",
        batchId: "rb-001",
        moistureLevel: "12.5",
        status: "approved" as const,
        checkedBy: userId
      }
    ];

    for (const qc of qcData) {
      await db.insert(qualityChecks).values(qc).onConflictDoNothing();
    }
    console.log("✅ Seeded quality checks");

    // 8. Create Production Orders
    const productionData = [
      {
        id: "po-001",
        orderNumber: "PO-2025-001",
        productId: "prod-fin-001",
        targetQuantity: "5000",
        actualQuantityProduced: "4850",
        totalQuantityIssued: "10000",
        status: "completed" as const,
        scheduledDate: new Date("2025-01-08T08:00:00Z"),
        startedAt: new Date("2025-01-08T08:30:00Z"),
        completedAt: new Date("2025-01-08T15:00:00Z"),
        createdBy: userId
      },
      {
        id: "po-002",
        orderNumber: "PO-2025-002",
        productId: "prod-fin-002",
        targetQuantity: "2000",
        actualQuantityProduced: "0",
        status: "scheduled" as const,
        scheduledDate: new Date("2025-01-09T08:00:00Z"),
        createdBy: userId
      }
    ];

    for (const po of productionData) {
      await db.insert(productionOrders).values(po).onConflictDoNothing();
    }
    console.log("✅ Seeded production orders");

    // 9. Create Stock Balances
    const stockData = [
      {
        id: "st-001",
        productId: "prod-raw-001",
        batchId: "rb-001",
        locationId: "loc-raw-01",
        itemType: "raw_material" as const,
        availableQuantity: "24850"
      },
      {
        id: "st-002",
        productId: "prod-fin-001",
        batchId: "FP-BT-001",
        locationId: "loc-fin-01",
        itemType: "finished_product" as const,
        availableQuantity: "1500"
      }
    ];

    for (const st of stockData) {
      await db.insert(stockBalances).values(st).onConflictDoNothing();
    }
    console.log("✅ Seeded stock balances");

    // 10. Create Dispatch Orders
    const dispatchData = [
      {
        id: "do-001",
        orderNumber: "DO-2025-001",
        customerId: "cust-001",
        customerName: "Tuskys Supermarket",
        deliveryAddress: "Westlands, Nairobi",
        status: "delivered",
        scheduledDate: new Date("2025-01-10T10:00:00Z"),
        deliveredAt: new Date("2025-01-10T14:30:00Z"),
        createdBy: userId
      }
    ];

    for (const d of dispatchData) {
      await db.insert(dispatchOrders).values(d).onConflictDoNothing();
    }
    console.log("✅ Seeded dispatch orders");

    console.log("🎉 Demo data seeding completed successfully!");
    return true;

  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  }
}