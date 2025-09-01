import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { seedDemoData } from "./seed-data";
import {
  insertSupplierSchema,
  insertTruckDeliverySchema,
  insertWeighbridgeReadingSchema,
  insertRawMaterialBatchSchema,
  insertQualityCheckSchema,
  insertProductionOrderSchema,
  insertFinishedProductBatchSchema,
  insertDispatchOrderSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ message: "Failed to create supplier" });
    }
  });

  // Truck Delivery routes
  app.get("/api/deliveries", isAuthenticated, async (req, res) => {
    try {
      const deliveries = await storage.getTruckDeliveries();
      res.json(deliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.post("/api/deliveries", isAuthenticated, async (req, res) => {
    try {
      const deliveryData = insertTruckDeliverySchema.parse(req.body);
      const delivery = await storage.createTruckDelivery(deliveryData);
      res.json(delivery);
    } catch (error) {
      console.error("Error creating delivery:", error);
      res.status(400).json({ message: "Failed to create delivery" });
    }
  });

  app.patch("/api/deliveries/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateTruckDeliveryStatus(id, status);
      res.json({ message: "Delivery status updated" });
    } catch (error) {
      console.error("Error updating delivery status:", error);
      res.status(400).json({ message: "Failed to update delivery status" });
    }
  });

  // Weighbridge routes
  app.post("/api/weighbridge", isAuthenticated, async (req, res) => {
    try {
      const readingData = insertWeighbridgeReadingSchema.parse(req.body);
      const reading = await storage.createWeighbridgeReading(readingData);
      res.json(reading);
    } catch (error) {
      console.error("Error creating weighbridge reading:", error);
      res.status(400).json({ message: "Failed to create weighbridge reading" });
    }
  });

  // Raw Material Batch routes
  app.get("/api/raw-material-batches", isAuthenticated, async (req, res) => {
    try {
      const batches = await storage.getRawMaterialBatches();
      res.json(batches);
    } catch (error) {
      console.error("Error fetching raw material batches:", error);
      res.status(500).json({ message: "Failed to fetch raw material batches" });
    }
  });

  app.post("/api/raw-material-batches", isAuthenticated, async (req, res) => {
    try {
      const batchData = insertRawMaterialBatchSchema.parse(req.body);
      const batch = await storage.createRawMaterialBatch(batchData);
      res.json(batch);
    } catch (error) {
      console.error("Error creating raw material batch:", error);
      res.status(400).json({ message: "Failed to create raw material batch" });
    }
  });

  app.patch("/api/raw-material-batches/:id/quality-status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateBatchQualityStatus(id, status);
      res.json({ message: "Batch quality status updated" });
    } catch (error) {
      console.error("Error updating batch quality status:", error);
      res.status(400).json({ message: "Failed to update batch quality status" });
    }
  });

  // Quality Check routes
  app.get("/api/quality-checks", isAuthenticated, async (req, res) => {
    try {
      const checks = await storage.getQualityChecks();
      res.json(checks);
    } catch (error) {
      console.error("Error fetching quality checks:", error);
      res.status(500).json({ message: "Failed to fetch quality checks" });
    }
  });

  app.post("/api/quality-checks", isAuthenticated, async (req: any, res) => {
    try {
      const checkData = {
        ...insertQualityCheckSchema.parse(req.body),
        checkedBy: req.user.claims.sub,
      };
      const check = await storage.createQualityCheck(checkData);
      res.json(check);
    } catch (error) {
      console.error("Error creating quality check:", error);
      res.status(400).json({ message: "Failed to create quality check" });
    }
  });

  // Production Order routes
  app.get("/api/production-orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getProductionOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching production orders:", error);
      res.status(500).json({ message: "Failed to fetch production orders" });
    }
  });

  app.post("/api/production-orders", isAuthenticated, async (req: any, res) => {
    try {
      const orderData = {
        ...insertProductionOrderSchema.parse(req.body),
        createdBy: req.user.claims.sub,
      };
      const order = await storage.createProductionOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating production order:", error);
      res.status(400).json({ message: "Failed to create production order" });
    }
  });

  app.patch("/api/production-orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateProductionOrderStatus(id, status);
      res.json({ message: "Production order status updated" });
    } catch (error) {
      console.error("Error updating production order status:", error);
      res.status(400).json({ message: "Failed to update production order status" });
    }
  });

  app.patch("/api/production-orders/:id/progress", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { completedQuantity } = req.body;
      await storage.updateProductionOrderProgress(id, completedQuantity);
      res.json({ message: "Production order progress updated" });
    } catch (error) {
      console.error("Error updating production order progress:", error);
      res.status(400).json({ message: "Failed to update production order progress" });
    }
  });

  // Finished Product Batch routes
  app.get("/api/finished-product-batches", isAuthenticated, async (req, res) => {
    try {
      const batches = await storage.getFinishedProductBatches();
      res.json(batches);
    } catch (error) {
      console.error("Error fetching finished product batches:", error);
      res.status(500).json({ message: "Failed to fetch finished product batches" });
    }
  });

  app.post("/api/finished-product-batches", isAuthenticated, async (req, res) => {
    try {
      const batchData = insertFinishedProductBatchSchema.parse(req.body);
      const batch = await storage.createFinishedProductBatch(batchData);
      res.json(batch);
    } catch (error) {
      console.error("Error creating finished product batch:", error);
      res.status(400).json({ message: "Failed to create finished product batch" });
    }
  });

  // Warehouse Stock routes
  app.get("/api/warehouse/stock", isAuthenticated, async (req, res) => {
    try {
      const stock = await storage.getWarehouseStock();
      res.json(stock);
    } catch (error) {
      console.error("Error fetching warehouse stock:", error);
      res.status(500).json({ message: "Failed to fetch warehouse stock" });
    }
  });

  // Dispatch Order routes
  app.get("/api/dispatch-orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getDispatchOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching dispatch orders:", error);
      res.status(500).json({ message: "Failed to fetch dispatch orders" });
    }
  });

  app.post("/api/dispatch-orders", isAuthenticated, async (req: any, res) => {
    try {
      const orderData = {
        ...insertDispatchOrderSchema.parse(req.body),
        createdBy: req.user.claims.sub,
      };
      const order = await storage.createDispatchOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating dispatch order:", error);
      res.status(400).json({ message: "Failed to create dispatch order" });
    }
  });

  app.patch("/api/dispatch-orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateDispatchOrderStatus(id, status);
      res.json({ message: "Dispatch order status updated" });
    } catch (error) {
      console.error("Error updating dispatch order status:", error);
      res.status(400).json({ message: "Failed to update dispatch order status" });
    }
  });

  // Weighbridge Reading routes
  app.get("/api/weighbridge-readings", isAuthenticated, async (req, res) => {
    try {
      const readings = await storage.getWeighbridgeReadings();
      res.json(readings);
    } catch (error) {
      console.error("Error fetching weighbridge readings:", error);
      res.status(500).json({ message: "Failed to fetch weighbridge readings" });
    }
  });

  app.post("/api/weighbridge-readings", isAuthenticated, async (req, res) => {
    try {
      const readingData = insertWeighbridgeReadingSchema.parse(req.body);
      const reading = await storage.createWeighbridgeReading(readingData);
      
      // Update delivery status to approved after weighbridge
      await storage.updateDeliveryStatus(readingData.deliveryId, "approved");
      
      res.json(reading);
    } catch (error) {
      console.error("Error creating weighbridge reading:", error);
      res.status(400).json({ message: "Failed to create weighbridge reading" });
    }
  });

  app.get("/api/weighbridge-readings/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const reading = await storage.getWeighbridgeReading(id);
      if (!reading) {
        return res.status(404).json({ message: "Weighbridge reading not found" });
      }
      res.json(reading);
    } catch (error) {
      console.error("Error fetching weighbridge reading:", error);
      res.status(500).json({ message: "Failed to fetch weighbridge reading" });
    }
  });

  app.get("/api/deliveries/pending-weighbridge", isAuthenticated, async (req, res) => {
    try {
      const deliveries = await storage.getPendingWeighbridgeDeliveries();
      res.json(deliveries);
    } catch (error) {
      console.error("Error fetching pending weighbridge deliveries:", error);
      res.status(500).json({ message: "Failed to fetch pending deliveries" });
    }
  });

  // Demo data seeding endpoint
  app.post('/api/seed-demo-data', isAuthenticated, async (req, res) => {
    try {
      await seedDemoData();
      res.json({ message: "Demo data created successfully" });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ message: "Failed to create demo data", error: error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
