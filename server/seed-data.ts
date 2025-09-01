import { db } from "./db";
import { 
  suppliers, 
  truckDeliveries, 
  weighbridgeReadings,
  rawMaterialBatches,
  qualityChecks,
  productionOrders,
  finishedProductBatches,
  warehouseStock,
  dispatchOrders,
  dispatchItems
} from "@shared/schema";

export async function seedDemoData() {
  try {
    console.log("🌱 Starting to seed demo data...");

    // 1. Create Suppliers
    const supplierData = [
      {
        id: "supplier-001",
        name: "Green Valley Farms",
        contactPerson: "John Kamau",
        phoneNumber: "+254712345678",
        email: "contact@greenvalley.co.ke",
        address: "Nakuru County, Kenya",
        rating: 4.8,
        isActive: true
      },
      {
        id: "supplier-002", 
        name: "Highlands Agriculture Co.",
        contactPerson: "Mary Wanjiku",
        phoneNumber: "+254723456789",
        email: "info@highlands-ag.com",
        address: "Uasin Gishu County, Kenya",
        rating: 4.5,
        isActive: true
      },
      {
        id: "supplier-003",
        name: "Maize Masters Ltd",
        contactPerson: "Peter Kipchoge",
        phoneNumber: "+254734567890", 
        email: "sales@maizmasters.co.ke",
        address: "Trans Nzoia County, Kenya",
        rating: 4.7,
        isActive: true
      }
    ];

    await db.insert(suppliers).values(supplierData);
    console.log("✅ Created suppliers");

    // 2. Create Truck Deliveries
    const deliveryData = [
      {
        id: "delivery-001",
        supplierId: "supplier-001",
        truckRegistration: "KCA 123A",
        driverName: "Samuel Mwangi",
        driverPhone: "+254745678901",
        expectedQuantity: "2500",
        deliveryDate: new Date("2025-01-07T08:30:00Z"),
        status: "approved" as const
      },
      {
        id: "delivery-002",
        supplierId: "supplier-002", 
        truckRegistration: "KBZ 456B",
        driverName: "Grace Akinyi",
        driverPhone: "+254756789012",
        expectedQuantity: "3200",
        actualQuantity: "3150",
        deliveryDate: new Date("2025-01-07T10:15:00Z"),
        status: "approved" as const
      },
      {
        id: "delivery-003",
        supplierId: "supplier-003",
        truckRegistration: "KDX 789C", 
        driverName: "David Kiprotich",
        driverPhone: "+254767890123",
        expectedQuantity: "1800",
        deliveryDate: new Date("2025-01-08T09:00:00Z"),
        status: "quality_check" as const
      },
      {
        id: "delivery-004",
        supplierId: "supplier-001",
        truckRegistration: "KCA 321D",
        driverName: "Jane Mutindi",
        driverPhone: "+254778901234",
        expectedQuantity: "2800",
        deliveryDate: new Date("2025-01-08T11:30:00Z"),
        status: "pending" as const
      }
    ];

    await db.insert(truckDeliveries).values(deliveryData);
    console.log("✅ Created truck deliveries");

    // 3. Create Weighbridge Readings
    const weighbridgeData = [
      {
        id: "wb-001",
        deliveryId: "delivery-001",
        grossWeight: "27500",
        tareWeight: "25000",
        netWeight: "2500",
        operatorName: "Robert Ochieng",
        readingTime: new Date("2025-01-07T08:45:00Z")
      },
      {
        id: "wb-002", 
        deliveryId: "delivery-002",
        grossWeight: "28150",
        tareWeight: "25000",
        netWeight: "3150",
        operatorName: "Robert Ochieng",
        readingTime: new Date("2025-01-07T10:30:00Z")
      },
      {
        id: "wb-003",
        deliveryId: "delivery-003",
        grossWeight: "26800",
        tareWeight: "25000",
        netWeight: "1800",
        operatorName: "Sarah Chepkemoi",
        readingTime: new Date("2025-01-08T09:15:00Z")
      }
    ];

    await db.insert(weighbridgeReadings).values(weighbridgeData);
    console.log("✅ Created weighbridge readings");

    // 4. Create Raw Material Batches
    const rawBatchData = [
      {
        id: "batch-raw-001",
        deliveryId: "delivery-001", 
        batchNumber: "RM-2025-001",
        quantity: "2500",
        moistureLevel: "12.5",
        qualityStatus: "passed" as const,
        storageLocation: "Warehouse A - Section 1",
        receivedAt: new Date("2025-01-07T09:00:00Z")
      },
      {
        id: "batch-raw-002",
        deliveryId: "delivery-002",
        batchNumber: "RM-2025-002", 
        quantity: "3150",
        moistureLevel: "11.8",
        qualityStatus: "passed" as const,
        storageLocation: "Warehouse A - Section 2",
        receivedAt: new Date("2025-01-07T10:45:00Z")
      },
      {
        id: "batch-raw-003",
        deliveryId: "delivery-003",
        batchNumber: "RM-2025-003",
        quantity: "1800", 
        moistureLevel: "13.2",
        qualityStatus: "pending" as const,
        storageLocation: "Quarantine Area",
        receivedAt: new Date("2025-01-08T09:30:00Z")
      }
    ];

    await db.insert(rawMaterialBatches).values(rawBatchData);
    console.log("✅ Created raw material batches");

    // 5. Create Quality Checks
    const qualityData = [
      {
        id: "qc-001",
        batchId: "batch-raw-001",
        checkType: "incoming_inspection",
        checkedBy: "Dr. Alice Wambui",
        moistureLevel: "12.5",
        contamination: false,
        pestResidues: false,
        aflatoxinLevel: "2.1",
        status: "passed" as const,
        notes: "Excellent quality maize, meets all standards",
        checkedAt: new Date("2025-01-07T09:30:00Z")
      },
      {
        id: "qc-002",
        batchId: "batch-raw-002",
        checkType: "incoming_inspection", 
        checkedBy: "Dr. Alice Wambui",
        moistureLevel: "11.8",
        contamination: false,
        pestResidues: false,
        aflatoxinLevel: "1.8",
        status: "passed" as const,
        notes: "High quality batch, ready for processing",
        checkedAt: new Date("2025-01-07T11:00:00Z")
      },
      {
        id: "qc-003",
        batchId: "batch-raw-003",
        checkType: "incoming_inspection",
        checkedBy: "James Mutua",
        moistureLevel: "13.2", 
        contamination: true,
        pestResidues: false,
        aflatoxinLevel: "3.5",
        status: "in_review" as const,
        notes: "Slight contamination detected, requires additional testing",
        checkedAt: new Date("2025-01-08T10:00:00Z")
      }
    ];

    await db.insert(qualityChecks).values(qualityData);
    console.log("✅ Created quality checks");

    // 6. Create Production Orders
    const productionData = [
      {
        id: "prod-001",
        orderNumber: "PO-2025-001",
        productType: "maize_flour_2kg",
        targetQuantity: 1000,
        completedQuantity: 850,
        rawMaterialUsed: "2100",
        status: "in_progress" as const,
        scheduledDate: new Date("2025-01-07T12:00:00Z"),
        startedAt: new Date("2025-01-07T12:30:00Z"),
        expectedCompletionDate: new Date("2025-01-07T18:00:00Z")
      },
      {
        id: "prod-002", 
        orderNumber: "PO-2025-002",
        productType: "maize_flour_4kg",
        targetQuantity: 500,
        completedQuantity: 500,
        rawMaterialUsed: "2050",
        status: "completed" as const,
        scheduledDate: new Date("2025-01-06T08:00:00Z"),
        startedAt: new Date("2025-01-06T08:30:00Z"),
        completedAt: new Date("2025-01-06T14:30:00Z"),
        expectedCompletionDate: new Date("2025-01-06T16:00:00Z")
      },
      {
        id: "prod-003",
        orderNumber: "PO-2025-003",
        productType: "maize_flour_1kg",
        targetQuantity: 800,
        completedQuantity: 0,
        status: "scheduled" as const,
        scheduledDate: new Date("2025-01-09T08:00:00Z"),
        expectedCompletionDate: new Date("2025-01-09T16:00:00Z")
      }
    ];

    await db.insert(productionOrders).values(productionData);
    console.log("✅ Created production orders");

    // 7. Create Finished Product Batches
    const finishedBatchData = [
      {
        id: "batch-finished-001",
        productionOrderId: "prod-002",
        batchNumber: "FP-2025-001",
        productType: "maize_flour_4kg", 
        quantity: 500,
        packageSize: "4kg",
        expiryDate: new Date("2025-07-06T00:00:00Z"),
        qualityGrade: "A",
        storageLocation: "Warehouse B - Section 1",
        producedAt: new Date("2025-01-06T14:30:00Z")
      },
      {
        id: "batch-finished-002",
        productionOrderId: "prod-001", 
        batchNumber: "FP-2025-002",
        productType: "maize_flour_2kg",
        quantity: 420,
        packageSize: "2kg", 
        expiryDate: new Date("2025-07-07T00:00:00Z"),
        qualityGrade: "A",
        storageLocation: "Warehouse B - Section 2",
        producedAt: new Date("2025-01-07T16:00:00Z")
      }
    ];

    await db.insert(finishedProductBatches).values(finishedBatchData);
    console.log("✅ Created finished product batches");

    // 8. Create Warehouse Stock
    const warehouseData = [
      {
        id: "stock-001",
        itemType: "maize_flour_4kg",
        currentQuantity: "450",
        reservedQuantity: "50",
        location: "Warehouse B - Section 1",
        minThreshold: "100",
        maxCapacity: "1000",
        lastUpdated: new Date("2025-01-07T16:30:00Z")
      },
      {
        id: "stock-002",
        itemType: "maize_flour_2kg", 
        currentQuantity: "380",
        reservedQuantity: "40",
        location: "Warehouse B - Section 2",
        minThreshold: "150",
        maxCapacity: "1500",
        lastUpdated: new Date("2025-01-07T16:30:00Z")
      },
      {
        id: "stock-003",
        itemType: "raw_maize",
        currentQuantity: "3850",
        reservedQuantity: "2100",
        location: "Warehouse A",
        minThreshold: "1000",
        maxCapacity: "10000",
        lastUpdated: new Date("2025-01-08T10:00:00Z")
      }
    ];

    await db.insert(warehouseStock).values(warehouseData);
    console.log("✅ Created warehouse stock");

    // 9. Create Dispatch Orders
    const dispatchData = [
      {
        id: "dispatch-001",
        orderNumber: "DO-2025-001",
        customerName: "Tuskys Supermarket",
        deliveryAddress: "Westlands, Nairobi",
        contactPhone: "+254720123456",
        scheduledDate: new Date("2025-01-08T14:00:00Z"),
        status: "completed" as const,
        dispatchedAt: new Date("2025-01-08T14:30:00Z"),
        driverName: "Michael Otieno",
        vehicleRegistration: "KBY 789M"
      },
      {
        id: "dispatch-002",
        orderNumber: "DO-2025-002", 
        customerName: "Naivas Supermarket",
        deliveryAddress: "Karen, Nairobi",
        contactPhone: "+254731234567",
        scheduledDate: new Date("2025-01-08T16:00:00Z"),
        status: "in_transit" as const,
        dispatchedAt: new Date("2025-01-08T16:15:00Z"),
        driverName: "Susan Chebet",
        vehicleRegistration: "KCX 456N"
      },
      {
        id: "dispatch-003",
        orderNumber: "DO-2025-003",
        customerName: "Carrefour Supermarket",
        deliveryAddress: "Kilimani, Nairobi", 
        contactPhone: "+254742345678",
        scheduledDate: new Date("2025-01-09T10:00:00Z"),
        status: "scheduled" as const
      }
    ];

    await db.insert(dispatchOrders).values(dispatchData);
    console.log("✅ Created dispatch orders");

    // 10. Create Dispatch Items
    const dispatchItemsData = [
      {
        id: "dispatch-item-001",
        dispatchOrderId: "dispatch-001",
        productType: "maize_flour_4kg",
        quantity: 50,
        unitPrice: "450.00",
        totalAmount: "22500.00"
      },
      {
        id: "dispatch-item-002", 
        dispatchOrderId: "dispatch-002",
        productType: "maize_flour_2kg",
        quantity: 40,
        unitPrice: "230.00",
        totalAmount: "9200.00"
      },
      {
        id: "dispatch-item-003",
        dispatchOrderId: "dispatch-003",
        productType: "maize_flour_4kg",
        quantity: 75,
        unitPrice: "450.00", 
        totalAmount: "33750.00"
      },
      {
        id: "dispatch-item-004",
        dispatchOrderId: "dispatch-003",
        productType: "maize_flour_2kg", 
        quantity: 60,
        unitPrice: "230.00",
        totalAmount: "13800.00"
      }
    ];

    await db.insert(dispatchItems).values(dispatchItemsData);
    console.log("✅ Created dispatch items");

    console.log("🎉 Demo data seeding completed successfully!");
    return true;

  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  }
}