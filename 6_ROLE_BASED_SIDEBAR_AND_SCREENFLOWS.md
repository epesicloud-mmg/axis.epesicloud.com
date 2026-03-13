# AXIS — Role-Based Sidebar & Screen Flows
**All 9 Roles · Full Operational Coverage**

---

## Design Principles

- Every role sees **only what they act on**. No clutter, no confusion.
- Sidebar items map directly to **table ownership** from the schema.
- Screen flows follow the **business process sequence**, not alphabetical menus.
- Status badges and action buttons enforce **valid transitions only** — no role can skip a step they do not own.
- Shared read-only views (e.g. delivery status, stock levels) are accessible across roles but write actions are locked by role.

---

## Role Index

| # | Role | Primary Responsibility |
|---|------|----------------------|
| 1 | `admin` | System configuration, user management, full visibility |
| 2 | `procurement` | Create and plan inbound deliveries |
| 3 | `receiving` | Receive and intake arriving trucks |
| 4 | `weighbridge` | Record weighbridge readings |
| 5 | `quality_control` | Run QC checks, approve or reject batches |
| 6 | `production_manager` | Plan, schedule, and release production orders |
| 7 | `production_operator` | Execute material issues and record output |
| 8 | `warehouse` | Manage stock balances, movements, and locations |
| 9 | `dispatch` | Allocate finished goods and close dispatch orders |

---

---

## 1. Admin

### Sidebar

```
AXIS
─────────────────────────
▸ Dashboard
─────────────────────────
USERS & SETTINGS
  ▸ Users
  ▸ Roles & Permissions
  ▸ System Settings
─────────────────────────
MASTER DATA
  ▸ Suppliers
  ▸ Customers
  ▸ Products
  ▸ Storage Locations
─────────────────────────
OPERATIONS (READ)
  ▸ Deliveries
  ▸ Raw Material Batches
  ▸ Quality Checks
  ▸ Production Orders
  ▸ Finished Batches
  ▸ Stock Overview
  ▸ Dispatch Orders
─────────────────────────
GOVERNANCE
  ▸ Audit Logs
  ▸ Exception Logs
  ▸ Attachments
─────────────────────────
```

### Dashboard
- KPI strip: Open Deliveries / Pending QC Checks / Active Production Orders / Finished Stock Available / Open Exceptions
- Recent Audit Log entries (last 20)
- Open Exceptions by severity (critical → low)
- System user list with last-active timestamps

### Screen Flows

**User Management**
1. Users List → `[+ New User]`
2. New User Form: email, firstName, lastName, role (enum select), isActive
3. Edit User → change role or deactivate
4. User Detail → full audit trail of actions by that user

**Master Data — Suppliers**
1. Suppliers List (name, supplierCode, isActive, delivery count)
2. `[+ New Supplier]` → form with name, code, contactPerson, phone, email, address
3. Supplier Detail → linked deliveries list, exception history

**Master Data — Customers**
1. Customers List (name, customerCode, isActive, dispatch count)
2. `[+ New Customer]` → form
3. Customer Detail → dispatch order history, batch traceability

**Master Data — Products**
1. Products List filtered by `productType` (raw_material / finished_product)
2. `[+ New Product]` → sku, name, productType, packageSize, unitOfMeasure
3. Product Detail → current stock balance by location, production history

**Master Data — Storage Locations**
1. Locations List (code, name, zone, itemType, isActive)
2. `[+ New Location]` → code, name, zone, itemType, notes
3. Location Detail → current stock snapshot (all batches at that location)

**Exception Logs**
1. Exceptions List filtered by: status (open / in_review / resolved / closed), severity, entity type
2. Exception Detail → description, entity link, raised by, timeline
3. `[Resolve]` / `[Close]` actions with resolution notes

**Audit Logs**
1. Audit Log List → filterable by entityType, actorId, action, date range
2. Audit Detail → previousValues vs newValues JSON diff

---

---

## 2. Procurement

### Sidebar

```
AXIS
─────────────────────────
▸ Dashboard
─────────────────────────
INBOUND PLANNING
  ▸ Deliveries
  ▸ Suppliers
─────────────────────────
VISIBILITY (READ)
  ▸ Raw Material Stock
  ▸ Production Orders
─────────────────────────
```

### Dashboard
- Upcoming deliveries (next 7 days) sorted by `expectedArrivalAt`
- Deliveries by status (expected / pending_receipt / weighed / pending_qc / approved / rejected)
- Low stock alert for raw materials (available quantity below threshold)

### Screen Flows

**Deliveries List**
- Columns: deliveryNumber, supplier, truckRegistration, expectedArrivalAt, expectedQuantity, status
- Filter by: status, supplier, date range
- `[+ New Delivery]` button

**Create Delivery**
1. Select supplier (search/select from `suppliers`)
2. Enter: truckRegistration, driverName, driverPhone, expectedArrivalAt, expectedQuantity, deliveryReference, notes
3. System auto-generates `deliveryNumber`
4. Status set to `expected`
5. Save → redirects to Delivery Detail

**Delivery Detail**
- Header: deliveryNumber, supplier, status badge, expectedArrivalAt
- Truck & Driver info
- Timeline: expected → arrived → weighed → QC → approved/rejected
- Linked weighbridge readings (read-only)
- Linked raw material batches (read-only)
- Linked QC checks (read-only)
- `[Edit]` allowed while status is `expected`

---

---

## 3. Receiving

### Sidebar

```
AXIS
─────────────────────────
▸ Dashboard
─────────────────────────
RECEIVING
  ▸ Today's Deliveries
  ▸ All Deliveries
  ▸ Raw Material Batches
─────────────────────────
VISIBILITY (READ)
  ▸ Storage Locations
  ▸ Quality Checks
─────────────────────────
```

### Dashboard
- Today's expected arrivals (status = `expected` or `pending_receipt`)
- Deliveries awaiting batch intake (status = `weighed`)
- Recently created batches

### Screen Flows

**Today's Deliveries**
- List of deliveries with `expectedArrivalAt` = today
- Quick actions per row: `[Mark Arrived]`

**Mark Arrived**
1. Click `[Mark Arrived]` on a delivery
2. Confirm driverName, driverPhone, truckRegistration (editable)
3. System sets `arrivedAt = now`, status → `pending_receipt`

**All Deliveries**
- Full list with filters: status, supplier, date range
- Receiving acts on deliveries in `pending_receipt` or `weighed` states

**Create Raw Material Batch** *(after weighbridge reading is recorded)*
1. Open Delivery (status must be `weighed`)
2. `[Create Batch]` button appears
3. Form: select productId (raw material), quantityReceived (defaults from netWeight), initialLocationId, notes
4. System auto-generates `batchNumber`
5. Status set to `pending_qc`, `intakeAt = now`
6. Delivery status → `pending_qc`

**Raw Material Batches List**
- Columns: batchNumber, delivery, product, quantityReceived, status, intakeAt
- Filter by: status, date range
- Click row → Batch Detail (read-only for receiving; QC actions belong to quality_control role)

---

---

## 4. Weighbridge

### Sidebar

```
AXIS
─────────────────────────
▸ Dashboard
─────────────────────────
WEIGHBRIDGE
  ▸ Pending Weighing
  ▸ All Readings
─────────────────────────
VISIBILITY (READ)
  ▸ Deliveries
─────────────────────────
```

### Dashboard
- Deliveries in status `pending_receipt` awaiting a weighbridge reading
- Today's completed readings (count + total net weight)

### Screen Flows

**Pending Weighing**
- List of deliveries with status `pending_receipt`
- Columns: deliveryNumber, supplier, truckRegistration, driverName, arrivedAt
- `[Record Reading]` button per row

**Record Weighbridge Reading**
1. Select delivery from pending list
2. Enter: grossWeight, tareWeight (netWeight auto-calculated = gross − tare)
3. Enter: ticketNumber, weighbridgeCharges, readingTime, readingType (initial / reweigh / final), notes
4. `isFinal` toggle — if true, system updates delivery `receivedQuantity = netWeight` and status → `weighed`
5. Save → reading created, delivery updated

**All Readings**
- Full list of `weighbridge_readings` for audit
- Columns: ticketNumber, delivery, grossWeight, tareWeight, netWeight, readingType, isFinal, readingTime, operator
- Filter by: date range, isFinal, delivery

**Reading Detail**
- All fields read-only after save
- Linked delivery shown with status

---

---

## 5. Quality Control

### Sidebar

```
AXIS
─────────────────────────
▸ Dashboard
─────────────────────────
QUALITY CONTROL
  ▸ Pending Checks
  ▸ All QC Checks
─────────────────────────
VISIBILITY (READ)
  ▸ Raw Material Batches
  ▸ Production Orders
  ▸ Finished Batches
  ▸ Exception Logs
─────────────────────────
```

### Dashboard
- Pending QC checks by type: raw_material / in_process / finished_goods (count cards)
- Recently failed checks (rejected / on_hold)
- Open exceptions raised by QC

### Screen Flows

**Pending Checks**
- Three tabbed views: **Raw Material** | **In-Process** | **Finished Goods**
- Each tab lists entities waiting for a QC check:
  - Raw Material: `raw_material_batches` with status `pending_qc`
  - In-Process: `production_orders` with status `in_progress`
  - Finished Goods: `finished_product_batches` with status `pending_qc`

**Perform Raw Material QC Check**
1. Select raw material batch from pending list
2. `[Start Check]` → form opens
3. Auto-populated: checkNumber (system generated), checkType = `raw_material`, rawMaterialBatchId
4. Enter: moistureLevel, contamination (boolean), foreignMatterPercent, grainIntegrity, packagingIntegrity, remarks
5. Set status: `approved` / `rejected` / `on_hold` / `in_review`
6. If `approved`: system updates `raw_material_batches.status → approved`, sets `approvedAt`
7. If `rejected`: enter rejectionReason; system updates batch status → `rejected`, sets `rejectedAt`
8. If `on_hold`: enter holdReason; batch remains in quarantine
9. Save → check recorded, batch status updated, stock movement triggered if approved

**Perform In-Process QC Check**
1. Select production order from in-progress list
2. `[Start Check]` → form with checkType = `in_process`, productionOrderId
3. Enter measurements + status decision
4. `approved` → production order may continue
5. `rejected` / `on_hold` → exception log prompt appears

**Perform Finished Goods QC Check**
1. Select finished product batch from pending list
2. `[Start Check]` → form with checkType = `finished_goods`, finishedProductBatchId
3. Enter measurements + decision
4. `approved` (maps to `released`) → system updates `finished_product_batches.status → released`, sets `releasedAt`
5. `rejected` (maps to `blocked`) → system updates status → `blocked`, sets `blockedAt`
6. `on_hold` → batch stays in `pending_qc` with hold reason logged

**QC Check Detail**
- Full measurement record, decision, checker, approver, timestamps
- Linked entity (batch or order) with navigation link
- `[Raise Exception]` button if anomaly needs escalation

---

---

## 6. Production Manager

### Sidebar

```
AXIS
─────────────────────────
▸ Dashboard
─────────────────────────
PRODUCTION PLANNING
  ▸ Production Orders
  ▸ Schedule
─────────────────────────
VISIBILITY (READ)
  ▸ Raw Material Stock
  ▸ Finished Batches
  ▸ QC Checks
  ▸ Material Issues
─────────────────────────
```

### Dashboard
- Production orders by status (draft / scheduled / released / in_progress / completed)
- Today's scheduled orders
- Raw material stock availability (available quantity by product)
- Yield summary: targetQuantity vs actualQuantityProduced for completed orders (last 30 days)
- Wastage summary (totalWastage aggregated)

### Screen Flows

**Production Orders List**
- Columns: orderNumber, product, targetQuantity, actualQuantityProduced, status, scheduledDate
- Filter by: status, product, date range
- `[+ New Order]` button

**Create Production Order**
1. Select product (finished product only — productType = `finished_product`)
2. Enter: targetQuantity, scheduledDate, notes
3. System auto-generates `orderNumber`, status = `draft`, `createdBy = currentUser`
4. Save → Order Detail

**Production Order Detail**
- Header: orderNumber, product, status badge, scheduledDate
- Quantity summary: target / issued / produced / wastage
- Linked material issues (read-only list)
- Linked finished product batches (read-only list)
- Linked QC checks (read-only)
- Timeline: draft → scheduled → released → in_progress → completed

**Status Transitions (Production Manager only)**
- `draft → scheduled`: `[Schedule]` → confirm scheduledDate
- `scheduled → released`: `[Release to Production]` → sets `releasedAt`, `releasedBy = currentUser`, status → `released`
- `in_progress → completed`: `[Mark Completed]` → confirm actualQuantityProduced, totalWastage, sets `completedAt`
- `any → cancelled`: `[Cancel Order]` with reason (logged to exception)

**Schedule View**
- Calendar or timeline view of production orders by scheduledDate
- Color-coded by status
- Click order → Order Detail

---

---

## 7. Production Operator

### Sidebar

```
AXIS
─────────────────────────
▸ Dashboard
─────────────────────────
PRODUCTION
  ▸ My Active Orders
  ▸ Issue Materials
  ▸ Record Output
─────────────────────────
VISIBILITY (READ)
  ▸ Raw Material Stock
  ▸ Storage Locations
─────────────────────────
```

### Dashboard
- Active orders assigned to operator (status = `released` or `in_progress`)
- Raw material stock available for issue
- Today's material issues (summary)

### Screen Flows

**My Active Orders**
- List of production orders with status `released` or `in_progress`
- Columns: orderNumber, product, targetQuantity, totalQuantityIssued, status
- `[Start Order]` button on released orders → sets `startedAt = now`, status → `in_progress`

**Issue Materials**
1. Select production order (must be `in_progress`)
2. Select raw material batch to issue from:
   - Shows batches with status `approved` or `released_to_stock` or `partially_consumed`
   - Shows available quantity per batch and location
3. Enter: quantityIssued, issuedFromLocationId, notes
4. Confirm → `production_material_issues` record created
5. System updates: `productionOrders.totalQuantityIssued += quantityIssued`, `rawMaterialBatches.quantityConsumed += quantityIssued`, batch status → `partially_consumed` or `consumed` depending on remaining quantity
6. Stock movement created: `movementType = issue_to_production`

**Record Output (Create Finished Batch)**
1. Select production order (must be `in_progress`)
2. `[Record Output]` → form
3. Enter: quantityProduced, packageSize, storageLocationId, productionDate, notes
4. System auto-generates `batchNumber`, status = `pending_qc`
5. Stock movement created: `movementType = finished_goods_receipt`
6. Save → batch created, linked to production order

**Material Issue History**
- List of all issues for active orders
- Columns: productionOrder, rawMaterialBatch, quantityIssued, issuedFromLocation, issuedBy, issuedAt

---

---

## 8. Warehouse

### Sidebar

```
AXIS
─────────────────────────
▸ Dashboard
─────────────────────────
INVENTORY
  ▸ Stock Overview
  ▸ Raw Material Stock
  ▸ Finished Goods Stock
  ▸ Stock Movements
─────────────────────────
LOCATIONS
  ▸ Storage Locations
─────────────────────────
ACTIONS
  ▸ Stock Transfers
  ▸ Adjustments
  ▸ Block / Release Stock
─────────────────────────
VISIBILITY (READ)
  ▸ Raw Material Batches
  ▸ Finished Batches
  ▸ Exception Logs
─────────────────────────
```

### Dashboard
- Total raw material stock (available / reserved / blocked)
- Total finished goods stock (available / reserved / blocked) by product
- Recent stock movements (last 10)
- Open stock exceptions

### Screen Flows

**Stock Overview**
- Summary table: product, itemType, location, availableQuantity, reservedQuantity, blockedQuantity
- Filterable by: itemType, location, product
- Drill down → batch-level detail

**Raw Material Stock**
- List of `stock_balances` where `itemType = raw_material`
- Grouped by product, then by batch
- Shows: batchNumber, location, availableQuantity, reservedQuantity, blockedQuantity, lastMovementAt
- Click batch → Raw Material Batch Detail (read-only)

**Finished Goods Stock**
- List of `stock_balances` where `itemType = finished_product`
- Grouped by product (SKU), then by batch
- Shows: batchNumber, location, status (released/blocked/allocated), availableQuantity
- Click batch → Finished Batch Detail (read-only)

**Stock Movements Ledger**
- Full list of `stock_movements` sorted by `createdAt` descending
- Columns: movementNumber, movementType, itemType, product, batch, quantity, fromLocation, toLocation, referenceType, referenceId, createdBy
- Filter by: movementType, itemType, date range, batch
- Read-only audit view

**Stock Transfer**
1. Select batch (raw material or finished goods) and source location
2. Select destination location
3. Enter quantity to transfer, notes
4. Confirm → `stock_movement` created (`movementType = stock_transfer`), `stock_balances` updated at both locations

**Stock Adjustment**
1. Select batch and location
2. Select adjustment type: `adjustment_increase` or `adjustment_decrease`
3. Enter quantity and reason (required)
4. Confirm → `stock_movement` created, balance updated, exception log auto-raised for audit

**Block / Release Stock**
1. Select finished product batch
2. `[Block]` → batch status → `blocked`, `blockedAt = now`, stock movement `movementType = block` created
3. `[Release]` → batch status → `released`, `releasedAt = now`, stock movement `movementType = release` created
4. Reason required for both actions

---

---

## 9. Dispatch

### Sidebar

```
AXIS
─────────────────────────
▸ Dashboard
─────────────────────────
DISPATCH
  ▸ Dispatch Orders
  ▸ Today's Dispatches
─────────────────────────
VISIBILITY (READ)
  ▸ Finished Goods Stock
  ▸ Customers
─────────────────────────
```

### Dashboard
- Dispatch orders by status (draft / scheduled / allocated / loading / dispatched / delivered)
- Today's scheduled dispatches
- Finished goods available to allocate (status = `released`, quantity > 0)

### Screen Flows

**Dispatch Orders List**
- Columns: orderNumber, customerName, status, scheduledDate, total allocated quantity
- Filter by: status, customer, date range
- `[+ New Dispatch Order]` button

**Create Dispatch Order**
1. Select or search customer
2. `customerName` auto-populated from customer record (snapshot stored)
3. Enter: deliveryAddress, scheduledDate, receiverName, deliveryNotes, notes
4. System auto-generates `orderNumber`, status = `draft`
5. Save → Dispatch Order Detail

**Dispatch Order Detail**
- Header: orderNumber, customer, status badge, scheduledDate
- Dispatch Items table (empty initially)
- `[+ Add Item]` button (available while status = `draft` or `allocated`)
- Timeline: draft → scheduled → allocated → loading → dispatched → delivered
- POD reference field (editable when status = `delivered`)

**Add Dispatch Item**
1. `[+ Add Item]` on dispatch order
2. Select product (finished_product type)
3. System shows available finished batches for that product (status = `released`, availableQuantity > 0)
4. Select batch and enter quantityAllocated (cannot exceed available)
5. Save → `dispatch_items` record created, `finishedProductBatches.quantityAllocated += quantityAllocated`, stock movement `movementType = reservation` created

**Status Transitions (Dispatch role only)**
- `draft → scheduled`: `[Schedule]` → confirm scheduledDate
- `scheduled → allocated`: `[Confirm Allocation]` → validates all items have batch assignments, status → `allocated`, finished batch statuses → `allocated`
- `allocated → loading`: `[Start Loading]` → sets `loadedAt = now`, status → `loading`; operator enters `quantityLoaded` per item
- `loading → dispatched`: `[Mark Dispatched]` → sets `dispatchedAt = now`, status → `dispatched`; stock movements `movementType = dispatch_out` created per item; finished batch statuses → `dispatched`
- `dispatched → delivered`: `[Confirm Delivery]` → enter `podReference`, `receiverName`, confirm `quantityDelivered` per item, sets `deliveredAt = now`, status → `delivered`
- `any → cancelled`: `[Cancel]` → releases all allocated stock back, reverses reservation movements, statuses reset to `released`

---

---

## Cross-Role Status Transition Map

### Delivery Lifecycle

```
[procurement]         [receiving]       [weighbridge]      [quality_control]    [receiving]
     │                    │                   │                    │                  │
  expected  ──────▶  pending_receipt ──▶   weighed   ──────▶  pending_qc  ──▶  approved
                                                                    │
                                                               rejected / on_hold
```

### Raw Material Batch Lifecycle

```
[receiving]     [quality_control]    [quality_control]      [production_operator]
     │                │                     │                       │
 pending_qc ──▶   approved      ──▶  released_to_stock ──▶  partially_consumed ──▶ consumed
                     │
               rejected / on_hold
```

### Finished Batch Lifecycle

```
[production_operator]   [quality_control]     [dispatch]     [dispatch]
         │                    │                    │               │
    pending_qc   ──────▶  released  ──────▶  allocated ──────▶ dispatched
                              │
                           blocked
```

### Production Order Lifecycle

```
[production_manager]                         [production_operator]   [production_manager]
         │                                           │                        │
      draft ──▶ scheduled ──▶ released ──────▶ in_progress ──────────▶ completed
                                                                             │
                                                                          cancelled
```

### Dispatch Order Lifecycle

```
[dispatch]                                                                    [dispatch]
    │                                                                             │
  draft ──▶ scheduled ──▶ allocated ──▶ loading ──▶ dispatched ──▶ delivered
                                                                        │
                                                                    cancelled
```

---

## Shared Read-Only Views by Role

| Screen | admin | procurement | receiving | weighbridge | quality_control | prod_manager | prod_operator | warehouse | dispatch |
|--------|:-----:|:-----------:|:---------:|:-----------:|:---------------:|:------------:|:-------------:|:---------:|:--------:|
| Deliveries | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| Raw Material Batches | ✓ | — | ✓ | — | ✓ | — | ✓ | ✓ | — |
| QC Checks | ✓ | — | ✓ | — | ✓ | ✓ | — | — | — |
| Production Orders | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | — | — |
| Finished Batches | ✓ | — | — | — | ✓ | ✓ | — | ✓ | ✓ |
| Stock Overview | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ | ✓ |
| Stock Movements | ✓ | — | — | — | — | — | — | ✓ | — |
| Dispatch Orders | ✓ | — | — | — | — | — | — | — | ✓ |
| Exception Logs | ✓ | — | — | — | ✓ | ✓ | — | ✓ | — |
| Audit Logs | ✓ | — | — | — | — | — | — | — | — |

---

## Implementation Notes

**Route structure recommendation**

```
/dashboard
/deliveries                   → procurement, receiving, weighbridge
/deliveries/:id               → shared detail
/weighbridge                  → weighbridge role
/batches/raw                  → receiving, quality_control, warehouse
/batches/raw/:id
/quality-checks               → quality_control
/quality-checks/:id
/production/orders            → production_manager, production_operator
/production/orders/:id
/production/issues            → production_operator
/batches/finished             → quality_control, production_operator, warehouse, dispatch
/batches/finished/:id
/stock/overview               → warehouse, shared read
/stock/movements              → warehouse
/stock/transfer               → warehouse
/stock/adjustments            → warehouse
/dispatch/orders              → dispatch
/dispatch/orders/:id
/admin/users                  → admin
/admin/master-data/suppliers  → admin
/admin/master-data/customers  → admin
/admin/master-data/products   → admin
/admin/master-data/locations  → admin
/admin/audit-logs             → admin
/exceptions                   → admin, quality_control, warehouse
```

**Guard rules**
- Routes are protected by role. A `warehouse` user navigating to `/dispatch/orders` gets a 403 screen, not a blank page.
- Status-gated actions (e.g. `[Release to Production]`) are disabled with a tooltip explaining the required state if preconditions are not met.
- All write actions produce an `audit_log` entry automatically at the service layer — no role needs to manually trigger this.