import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { seedDemoData } from "./seed-data";
import passport from "passport";
import bcrypt from "bcryptjs";
import {
  insertSupplierSchema,
  insertProductSchema,
  insertStorageLocationSchema,
  insertCustomerSchema,
  insertTruckDeliverySchema,
  insertWeighbridgeReadingSchema,
  insertRawMaterialBatchSchema,
  insertQualityCheckSchema,
  insertProductionOrderSchema,
  insertFinishedProductBatchSchema,
  insertDispatchOrderSchema,
  loginSchema,
  registerSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Governance Helpers
  const logAudit = async (req: any, action: string, entityType: string, entityId: string, prevValues?: any, newValues?: any) => {
    try {
      await storage.createAuditLog({
        entityType,
        entityId,
        actorId: req.user?.id,
        action,
        previousValues: prevValues,
        newValues: newValues,
      });
    } catch (e) {
      console.error("Audit log failed:", e);
    }
  };

  const raiseException = async (req: any, type: string, entityType: string, entityId: string, description: string, severity: string = "medium") => {
    try {
      await storage.createExceptionLog({
        exceptionType: type,
        severity,
        relatedEntityType: entityType,
        relatedEntityId: entityId,
        description,
        status: "open",
        raisedBy: req.user?.id,
      });
    } catch (e) {
      console.error("Exception log failed:", e);
    }
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      await logAudit(req, 'create', 'user', user.id, null, { email: user.email, role: user.role });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.logIn(user, async (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        await logAudit(req, 'login', 'user', user.id);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", async (req, res) => {
    const userId = (req as any).user?.id;
    req.logout(async (err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      if (userId) await logAudit({ user: { id: userId } }, 'logout', 'user', userId);
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req: any, res) => {
    res.json(req.user);
  });

  // User Management routes (Admin only)
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Forbidden" });
    try {
      const users = await storage.getUsers();
      res.json(users.map(({ password, ...u }: any) => u));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const prevUser = await storage.getUser(id);
      const updatedUser = await storage.updateUser(id, req.body);
      await logAudit(req, 'update', 'user', id, prevUser, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, async (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      await storage.deleteUser(id);
      await logAudit(req, 'delete', 'user', id, user, null);
      res.json({ message: "User deleted" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Master Data routes
  app.get("/api/master-data/suppliers", isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/master-data/suppliers", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Procurement'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      await logAudit(req, 'create', 'supplier', supplier.id, null, supplierData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Failed to create supplier" });
    }
  });

  app.patch("/api/master-data/suppliers/:id", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Procurement'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const prevSupplier = await storage.getSupplierById(id);
      const supplier = await storage.updateSupplier(id, req.body);
      await logAudit(req, 'update', 'supplier', id, prevSupplier, req.body);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Failed to update supplier" });
    }
  });

  app.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const p = await storage.getProducts();
      res.json(p);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Production Manager'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const pData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(pData);
      await logAudit(req, 'create', 'product', product.id, null, pData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Production Manager'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const prev = await storage.getProductById(id);
      const product = await storage.updateProduct(id, req.body);
      await logAudit(req, 'update', 'product', id, prev, req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.get("/api/locations", isAuthenticated, async (req, res) => {
    try {
      const l = await storage.getStorageLocations();
      res.json(l);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.post("/api/locations", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Warehouse'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const lData = insertStorageLocationSchema.parse(req.body);
      const location = await storage.createStorageLocation(lData);
      await logAudit(req, 'create', 'location', location.id, null, lData);
      res.json(location);
    } catch (error) {
      res.status(400).json({ message: "Failed to create location" });
    }
  });

  app.patch("/api/locations/:id", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Warehouse'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const prev = await storage.getStorageLocationById(id);
      const location = await storage.updateStorageLocation(id, req.body);
      await logAudit(req, 'update', 'location', id, prev, req.body);
      res.json(location);
    } catch (error) {
      res.status(400).json({ message: "Failed to update location" });
    }
  });

  app.get("/api/master-data/customers", isAuthenticated, async (req, res) => {
    try {
      const c = await storage.getCustomers();
      res.json(c);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/master-data/customers", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Dispatch'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const cData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(cData);
      await logAudit(req, 'create', 'customer', customer.id, null, cData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.patch("/api/master-data/customers/:id", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Dispatch'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const prev = await storage.getCustomerById(id);
      const customer = await storage.updateCustomer(id, req.body);
      await logAudit(req, 'update', 'customer', id, prev, req.body);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Failed to update customer" });
    }
  });

  // Inbound routes
  app.get("/api/deliveries", isAuthenticated, async (req, res) => {
    try {
      const deliveries = await storage.getTruckDeliveries();
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.post("/api/deliveries", isAuthenticated, async (req: any, res) => {
    try {
      const deliveryData = insertTruckDeliverySchema.parse(req.body);
      const delivery = await storage.createTruckDelivery(deliveryData);
      await logAudit(req, 'create', 'delivery', delivery.id, null, deliveryData);
      res.json(delivery);
    } catch (error) {
      res.status(400).json({ message: "Failed to create delivery" });
    }
  });

  app.patch("/api/deliveries/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const prev = await storage.getTruckDeliveryById(id);
      await storage.updateTruckDeliveryStatus(id, status);
      await logAudit(req, 'status_change', 'delivery', id, prev?.status, status);
      res.json({ message: "Delivery status updated" });
    } catch (error) {
      res.status(400).json({ message: "Failed to update delivery status" });
    }
  });

  app.post("/api/weighbridge", isAuthenticated, async (req: any, res) => {
    try {
      const readingData = insertWeighbridgeReadingSchema.parse(req.body);
      const reading = await storage.createWeighbridgeReading(readingData);
      await logAudit(req, 'create', 'weighbridge_reading', reading.id, null, readingData);
      res.json(reading);
    } catch (error) {
      res.status(400).json({ message: "Failed to create weighbridge reading" });
    }
  });

  // Raw Material Batch routes
  app.get("/api/raw-material-batches", isAuthenticated, async (req, res) => {
    try {
      const batches = await storage.getRawMaterialBatches();
      res.json(batches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  app.post("/api/raw-material-batches", isAuthenticated, async (req: any, res) => {
    try {
      const batchData = insertRawMaterialBatchSchema.parse(req.body);
      const batch = await storage.createRawMaterialBatch(batchData);
      await logAudit(req, 'create', 'batch', batch.id, null, batchData);
      res.json(batch);
    } catch (error) {
      res.status(400).json({ message: "Failed to create batch" });
    }
  });

  app.patch("/api/raw-material-batches/:id/quality-status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const prev = await storage.getRawMaterialBatchById(id);
      await storage.updateBatchQualityStatus(id, status);
      await logAudit(req, 'status_change', 'batch', id, prev?.status, status);
      if (status === 'rejected') {
        await raiseException(req, 'qc_failure', 'batch', id, `Batch ${prev?.batchNumber} rejected during quality approval.`, 'high');
      }
      res.json({ message: "Batch status updated" });
    } catch (error) {
      res.status(400).json({ message: "Failed to update batch status" });
    }
  });

  // Quality Check routes
  app.get("/api/quality-checks", isAuthenticated, async (req, res) => {
    try {
      const checks = await storage.getQualityChecks();
      res.json(checks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checks" });
    }
  });

  app.post("/api/quality-checks", isAuthenticated, async (req: any, res) => {
    try {
      const checkData = { ...insertQualityCheckSchema.parse(req.body), checkedBy: req.user.id };
      const check = await storage.createQualityCheck(checkData);
      await logAudit(req, 'create', 'quality_check', check.id, null, checkData);

      if (check.status === 'rejected') {
        const entityType = check.batchId ? 'raw_batch' : (check.finishedBatchId ? 'finished_batch' : 'production_order');
        const entityId = (check.batchId || check.finishedBatchId || check.productionOrderId) as string;
        await raiseException(req, 'qc_failure', entityType, entityId, `Quality Check ${check.checkNumber} rejected.`);
      }
      res.json(check);
    } catch (error) {
      res.status(400).json({ message: "Failed to create quality check" });
    }
  });

  // Production Order routes
  app.get("/api/production/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getProductionOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/production/orders", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Production Manager'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const orderData = { ...insertProductionOrderSchema.parse(req.body), createdBy: req.user.id };
      const order = await storage.createProductionOrder(orderData);
      await logAudit(req, 'create', 'production_order', order.id, null, orderData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/production/orders/:id/status", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Production Manager', 'Production Operator'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const { id } = req.params;
      const { status } = req.body;
      const prev = await storage.getProductionOrderById(id);
      await storage.updateProductionOrderStatus(id, status);
      await logAudit(req, 'status_change', 'production_order', id, prev?.status, status);
      res.json({ message: "Order status updated" });
    } catch (error) {
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  app.post("/api/production/issue-materials", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Production Operator'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const issueData = { ...req.body, issuedBy: req.user.id };
      await storage.issueMaterials(issueData);
      await logAudit(req, 'material_issue', 'production_order', req.body.productionOrderId, null, issueData);
      res.json({ message: "Materials issued successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to issue materials" });
    }
  });

  app.post("/api/production/record-output", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Production Operator'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const outputData = { ...req.body, userId: req.user.id };
      await storage.recordProductionOutput(outputData);
      await logAudit(req, 'record_output', 'production_order', req.body.productionOrderId, null, outputData);
      res.json({ message: "Production output recorded successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to record output" });
    }
  });

  // Inventory / Stock routes
  app.get("/api/inventory/balances", isAuthenticated, async (req, res) => {
    try {
      const balances = await storage.getInventoryBalances();
      res.json(balances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch balances" });
    }
  });

  app.get("/api/stock-movements", isAuthenticated, async (req, res) => {
    try {
      const movements = await storage.getStockMovements();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });

  // Governance routes
  app.get("/api/audit-logs", isAuthenticated, async (req: any, res) => {
    if (!['Admin', 'Plant Manager'].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/exceptions", isAuthenticated, async (req, res) => {
    try {
      const exceptions = await storage.getExceptionLogs();
      res.json(exceptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exceptions" });
    }
  });

  // Demo data seeding
  app.post('/api/seed-demo-data', isAuthenticated, async (req, res) => {
    try {
      await seedDemoData();
      res.json({ message: "Demo data created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed demo data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
