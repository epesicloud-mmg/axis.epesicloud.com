# AXIS — Business Process Map
## Automated Production & Inventory eXecution System
### Maize Flour Production Management Platform

**Version:** 2.0 — Merged & Implementation-Ready
**Status:** Approved Baseline

---

# 1. Document Purpose

This document defines the **full business process architecture** for AXIS, covering the end-to-end operational lifecycle of maize flour production from inbound raw maize delivery to final customer dispatch.

It maps every core operational process as it should function after implementation, covering:

- the sequence of steps in each process
- who performs each step (by role)
- what triggers each step
- what decisions occur and what each outcome leads to
- where handoffs between roles happen
- where exceptions, delays, or failures can occur
- what physical materials or documents move at each stage
- the system actions and status changes triggered at every step

This document is built on five operational control pillars:

**Pillar 1 — Controlled Inbound:** Truck, weight, batch, QC, and acceptance all linked.

**Pillar 2 — Controlled Inventory:** Every stock change recorded, every stock item batch-based, every location known.

**Pillar 3 — Controlled Production:** Planned orders, approved inputs, tracked consumption, tracked output, visible wastage.

**Pillar 4 — Controlled Outbound:** Customer order, batch allocation, loading confirmation, dispatch, and proof of delivery.

**Pillar 5 — Controlled Governance:** Audit logs, attachments, exception handling, and role-based approvals.

This document is the foundation from which the BRD, PRD, and all technical documents are derived.

---

# 2. AXIS Operational Scope

The AXIS implementation covers these operational domains:

1. Supplier and inbound delivery control
2. Truck receiving and weighbridge operations
3. Raw material batch intake
4. Raw material quality inspection
5. Procurement acceptance or rejection
6. Raw material inventory control
7. Production planning and scheduling
8. Material issue to production
9. Production execution and yield capture
10. Finished goods batch creation
11. Finished goods quality inspection and release
12. Finished goods warehouse control
13. Dispatch order creation and allocation
14. Loading, dispatch, and delivery confirmation
15. Traceability, audit, attachments, and exception management

---

# 3. Core Business Control Model

AXIS enforces the following operational logic across all modules:

## 3.1 Inbound Control

- No truck may be received without registration
- No quantity is accepted without weighbridge confirmation
- No raw material becomes available without a QC outcome
- No failed raw batch is released to stock

## 3.2 Inventory Control

- No stock exists without a batch and a location
- No inventory changes without a movement record
- Reserved stock must be distinct from available stock
- Blocked stock must not be usable in production or dispatch

## 3.3 Production Control

- No production starts without an approved production order
- No production consumes stock without material issue records
- Every production run must record actual input and output
- Yield and wastage must be captured

## 3.4 Finished Goods Control

- No finished goods are dispatchable without QC release
- No finished goods can leave the warehouse without formal allocation
- Every dispatch must link to exact finished batches

## 3.5 Governance

- Every critical transaction must have an actor, timestamp, and state change history
- Supporting documents must be attachable at key stages
- Exceptions must be recordable, trackable, and formally resolved

---

# 4. Primary Actors and Operational Roles

## Procurement
Supplier coordination, expected delivery creation, delivery acceptance or rejection, supplier-related exceptions.

## Gate / Receiving Clerk
Truck arrival registration, basic intake verification, delivery initiation.

## Weighbridge Operator
Gross and tare capture, weight verification, weighbridge ticket issuance.

## Quality Control
Raw material inspection, in-process quality checks, finished goods release or rejection, holds and quality exceptions.

## Warehouse
Raw material stock intake, storage location assignment, stock movement control, finished goods storage, dispatch picking and loading support.

## Production Manager / Production Planner
Production order planning, material requirement review, production release, output and variance review.

## Production Team
Material consumption execution, production run progress, finished output declaration, wastage capture.

## Dispatch Team
Dispatch order execution, stock allocation coordination, vehicle loading confirmation, dispatch closure and delivery confirmation.

## Admin / Operations Management
Users and permissions, master data, oversight dashboards, audit review, exception governance.

---

# 5. Core Master Data Required Before Operations

Before operations begin, AXIS must maintain these core master records:

- Users and roles
- Suppliers
- Customers
- Products (raw materials and finished goods)
- Packaging sizes
- Storage locations (zones, bays, silos, bins)
- Quality parameter templates
- Reason codes for holds, rejections, and adjustments
- Document types

These are not optional — if the workflow is to remain structured, all master data must be configured at go-live.

---

# 6. Process Overview

AXIS covers 19 operational processes organized across 6 modules:

| # | Process | Module | Primary Owner | End State |
|---|---------|--------|--------------|-----------|
| 1 | Supplier delivery planning | Inbound | Procurement | Delivery `expected` |
| 2 | Truck arrival registration | Inbound | Receiving | Delivery `pending_receipt` |
| 3 | Weighbridge measurement | Inbound | Weighbridge | Delivery `weighed` |
| 4 | Raw material batch creation | Inbound | Receiving / Warehouse | Batch `pending_qc` |
| 5 | Raw material quality inspection | Quality Control | QC | Batch `approved` / `rejected` / `on_hold` |
| 6 | Procurement acceptance or rejection | Inbound | Procurement | Delivery `approved` / `rejected` |
| 7 | Raw material stock intake | Inventory | Warehouse | Stock available |
| 8 | Production planning and scheduling | Production | Production Manager | Order `scheduled` |
| 9 | Production order release | Production | Production Manager | Order `released` |
| 10 | Raw material issue to production | Production | Warehouse + Production | Materials committed |
| 11 | Production execution | Production | Production Team | Order `in_progress` → `completed` |
| 12 | In-process quality checks | Quality Control | QC | Process controlled |
| 13 | Finished product batch creation | Production | Production Team | Batch `pending_qc` |
| 14 | Finished goods quality inspection | Quality Control | QC | Batch `released` / `blocked` |
| 15 | Finished goods warehouse intake | Inventory | Warehouse | Finished stock available |
| 16 | Customer dispatch order creation | Dispatch | Dispatch | Order `draft` → `scheduled` |
| 17 | Finished goods allocation | Dispatch | Warehouse + Dispatch | Order `allocated` |
| 18 | Picking, loading, and dispatch | Dispatch | Dispatch + Warehouse | Order `dispatched` |
| 19 | Delivery confirmation / POD | Dispatch | Dispatch | Order `delivered` |

---

# 7. Detailed Process Specifications

---

## PROCESS 1 — Supplier Delivery Planning

### Objective
To record expected inbound raw maize deliveries before arrival.

### Trigger
Procurement expects delivery from a supplier.

### Owner
Procurement

### Inputs
- Supplier identity
- Expected quantity (kg)
- Expected arrival date and time
- Optional PO / contract / delivery reference
- Optional truck and driver details

### AXIS System Actions
- Create expected inbound delivery record
- Assign delivery reference number (auto-generated)
- Set delivery status → `expected`
- Optionally upload source documents

### Outputs
- Delivery visible on inbound schedule
- Receiving team has advance notice
- Plant can prepare receiving and QC capacity

### Key Business Rules
- All planned supplier deliveries should be pre-registered when known
- Walk-in deliveries are permitted but must be registered before intake begins
- All deliveries must have a supplier linkage

### Possible Exceptions
- Unapproved or unknown supplier
- Duplicate delivery registration
- Missing or incorrect delivery reference

---

## PROCESS 2 — Truck Arrival Registration

### Objective
To formally admit a supplier delivery into the intake workflow.

### Trigger
Truck arrives at site.

### Owner
Gate Officer / Receiving Clerk / Procurement

### Swimlane Flow

```
PROCUREMENT / RECEIVING
        │
  [START]
        │
Truck arrives at gate
        │
Search for expected delivery
by supplier / truck reg / reference
        │
        ┌──────────────────────┐
        │                      │
  Delivery found         No delivery found
        │                      │
        │               Create walk-in
        │               delivery record
        │               Raise supplier_variance
        │               exception
        │                      │
        └──────┬───────────────┘
               │
Capture / confirm:
- truck registration
- driver name and phone
- supplier identity
- arrival time
               │
Set deliveryStatus
= pending_receipt
arrivedAt = now
               │
         [END → Weighbridge]
```

### AXIS System Actions
- Search expected delivery or create walk-in record
- Capture truck registration, driver name, driver phone
- Confirm supplier identity
- Set delivery status → `pending_receipt`
- Stamp `arrivedAt` = current timestamp

### Outputs
- Official inbound delivery record activated
- Truck is now eligible for weighbridge step

### Key Business Rules
- No truck proceeds to unload before registration
- Walk-in deliveries must still be registered before any weighing

### Possible Exceptions
- Supplier mismatch
- Duplicate truck entry
- Missing delivery reference
- Unapproved supplier arriving unscheduled

---

## PROCESS 3 — Weighbridge Measurement

### Objective
To capture the official delivery weight and establish the intake quantity basis.

### Trigger
Registered truck reaches weighbridge.

### Owner
Weighbridge Operator

### Swimlane Flow

```
WEIGHBRIDGE
     │
  [START — delivery status = pending_receipt]
     │
Record gross weight reading
(loaded truck on scale)
     │
Record tare weight reading
(empty truck on scale)
     │
System calculates net weight
netWeight = grossWeight − tareWeight
     │
Record:
- ticket number
- weighbridge charges
- readingTime
- readingType (initial / reweigh / final)
     │
Is this the final reading?
     │
┌────┴─────────────────────────────┐
│                                  │
YES — mark isFinal = true          NO — save as initial or reweigh
│                                  │
truck_deliveries                   Await further instruction
.receivedQuantity = netWeight      or reweigh request
deliveryStatus → weighed           │
                                   [Loop back if reweigh needed]
     │
  [END → Batch Creation]
```

### AXIS System Actions
- Create `weighbridge_readings` record linked to delivery
- Capture gross weight, tare weight, ticket number, reading time
- Calculate net weight automatically: `gross − tare`
- On `isFinal = true`: update `truck_deliveries.receivedQuantity = netWeight`, advance `deliveryStatus → weighed`

### Outputs
- Net inbound quantity formally established
- Official weighbridge record stored with operator identity and timestamp
- Intake quantity ready for batch creation

### Key Business Rules
- Net weight must be system-calculated — manual override requires exception
- All readings must be time-stamped and operator-stamped
- If reweigh is required, final official reading must be explicitly marked `isFinal = true`
- Previous readings are retained — they are never overwritten

### Possible Exceptions
- Missing tare weight
- Abnormal weight variance vs expected quantity → raise `weight_discrepancy` exception
- Duplicate reading submitted in error
- Equipment downtime requiring manual retrospective entry

---

## PROCESS 4 — Raw Material Batch Creation

### Objective
To convert the physically received maize into a traceable raw material batch.

### Trigger
Weighbridge process completed — delivery status = `weighed`.

### Owner
Receiving Team / Warehouse

### Swimlane Flow

```
RECEIVING / WAREHOUSE
     │
  [START — delivery status = weighed]
     │
Open delivery record
     │
Confirm net received quantity
(from weighbridge)
     │
Create raw material batch:
- productId (e.g. RAW_MAIZE)
- quantityReceived = netWeight
- initialLocationId (quarantine bay)
- intakeAt = now
     │
System generates batchNumber
batchStatus = pending_qc
deliveryStatus → pending_qc
     │
  [END → QC Queue]
```

### AXIS System Actions
- Create `raw_material_batches` record
- Auto-generate `batchNumber`
- Link batch to delivery via `deliveryId`
- Assign product, quantity, and initial storage location
- Set batch status → `pending_qc`
- Advance delivery status → `pending_qc`
- Stamp `intakeAt` = current timestamp

### Outputs
- Raw maize formally represented as a traceable system batch
- Batch visible in QC pending queue

### Key Business Rules
- Each inbound lot must have a unique batch identity
- No loose intake quantities without a batch record
- Quantity is tied to the final weighbridge reading unless an approved variance exists
- Batch must be assigned a physical location from creation

### Possible Exceptions
- Short delivery vs expected quantity → raise `supplier_variance` exception
- Damaged bags or contamination noted during unloading → capture in batch notes, inform QC
- Partial unload (truck delivers split loads) → create one batch per confirmed lot

---

## PROCESS 5 — Raw Material Quality Inspection

### Objective
To determine whether the received raw maize is acceptable for production use.

### Trigger
Raw material batch created — batch status = `pending_qc`.

### Owner
Quality Control

### Swimlane Flow

```
QUALITY CONTROL
     │
  [START — batch status = pending_qc]
     │
Locate batch in
Pending QC queue
     │
Go to batch storage location
Perform physical inspection
     │
Record QC check:
- moistureLevel (%)
- contamination detected (Y/N)
- foreignMatterPercent (%)
- grainIntegrity (good / damaged / poor)
- packagingIntegrity (intact / damaged / torn)
- remarks
checkedBy = current user
checkedAt = now
     │
Make decision
     │
┌────────┬──────────┬──────────┐
│        │          │          │
APPROVED REJECTED  ON HOLD   IN REVIEW
│        │          │          │
▼        ▼          ▼          ▼
batchStatus batchStatus batchStatus batchStatus
→ approved  → rejected  stays     stays
approvedAt  rejectedAt  pending_qc pending_qc
set         set         holdReason in_review
│           │           recorded
Stock       Exception   Awaiting
movement:   raised:     further
inbound_    qc_failure  review
receipt
created
stockBalances
updated
     │
  [END → Procurement Acceptance]
```

### AXIS System Actions

**On `approved`:**
- Set `approvedAt`, batch status → `approved`
- Create `stock_movement`: type `inbound_receipt`
- Update `stock_balances`: `availableQuantity` increases at initial location
- Advance delivery status → `approved`

**On `rejected`:**
- Set `rejectedAt`, batch status → `rejected`
- Raise `exception_log`: type `qc_failure`
- Advance delivery status → `rejected`
- Batch cannot be issued to production

**On `on_hold`:**
- Batch stays `pending_qc` at quarantine
- `holdReason` stored
- Batch is non-allocatable and non-issuable until re-inspected

**On `in_review`:**
- Batch stays `pending_qc`
- Assigned to senior QC for further assessment

### Key Business Rules
- No raw batch is usable before a QC decision
- Rejection reason must be recorded — cannot be blank
- Hold status must block downstream use
- A rejected batch status cannot be reversed without a new QC check
- QC check must be attributed to a named officer

### Possible Exceptions
- Inconclusive sample → use `in_review` status
- Moisture above threshold → reject or hold depending on level
- Contamination above acceptable limit → reject with `qc_failure` exception
- Supplier disputes rejection → raise exception; retest as a second QC check

---

## PROCESS 6 — Procurement Acceptance or Rejection

### Objective
To formally complete the commercial and operational acceptance decision after QC.

### Trigger
Raw material QC result finalized.

### Owner
Procurement / Receiving Manager

### AXIS System Actions

**If QC approved:**
- Delivery status already → `approved`
- Procurement formally closes acceptance
- Batch status → `released_to_stock` (warehouse step triggers this — see Process 7)

**If QC rejected:**
- Capture rejection reason
- Delivery status already → `rejected`
- Assign rejection handling route:
  - Supplier return
  - Disposal
  - Claim / dispute
  - Exceptional approval with management authorization

**If QC on hold:**
- Delivery remains open in controlled hold state
- Batch remains blocked until QC re-inspects and decides

### Key Business Rules
- Procurement acceptance must not bypass QC
- Rejected material must not move into usable stock under any circumstances
- Hold cases must remain visible until formally resolved
- Any exceptional approval overriding a QC rejection must be authorized and audit-logged

---

## PROCESS 7 — Raw Material Stock Intake

### Objective
To place approved raw material into usable warehouse inventory at a confirmed location.

### Trigger
Raw batch approved by QC and accepted by procurement.

### Owner
Warehouse

### AXIS System Actions
- Confirm or assign storage location (zone / bay / silo / bin)
- Batch status → `released_to_stock`
- `stock_balances.availableQuantity` reflects approved quantity at location
- `stock_movement` of type `inbound_receipt` already created at QC approval step — warehouse confirms location assignment

### Key Business Rules
- Every stock increase must generate a stock movement
- Approved stock must have a confirmed physical location
- Blocked or rejected stock cannot be marked available
- Stock balance is location-specific and batch-specific

### Possible Exceptions
- No storage location available → exception raised; batch held pending location
- Quantity discrepancy between QC-approved and physically stored quantity → `stock_mismatch` exception
- Stock ledger mismatch on reconciliation → adjustment with mandatory reason

---

## PROCESS 8 — Production Planning and Scheduling

### Objective
To create executable production orders based on demand and confirmed material availability.

### Trigger
Demand for finished flour stock or fulfillment requirement for customer orders.

### Owner
Production Manager

### Swimlane Flow

```
PRODUCTION MANAGER
     │
  [START]
     │
Review finished goods demand
and available raw material stock
     │
Create production order:
- product type (e.g. FLOUR_2KG)
- targetQuantity (kg)
- scheduledDate
orderNumber auto-generated
orderStatus = draft
     │
Confirm raw material availability
(approved and released_to_stock batches)
     │
Is stock sufficient?
     │
┌────┴────────────────────┐
│                         │
YES                       NO
│                         │
Schedule order            Raise exception:
orderStatus               insufficient_stock
= scheduled               Await procurement
     │                    or reschedule
  [END → Release]
```

### AXIS System Actions
- Create `production_orders` record
- Auto-generate `orderNumber`
- Set `status → draft`, then `scheduled` on confirmation
- Link to product (`finished_product` type only)
- Record `targetQuantity` and `scheduledDate`

### Key Business Rules
- Production planning must reference only approved and available raw stock
- Target output must be realistic against line capacity
- Order must not be released if raw material inputs are unavailable
- Only one product type per production order

### Possible Exceptions
- Insufficient raw stock → exception raised; order remains `draft`
- Production line unavailable → order rescheduled
- Urgent reprioritization → existing order cancelled and new order created

---

## PROCESS 9 — Production Order Release

### Objective
To authorize a scheduled production order for actual execution on the floor.

### Trigger
Production schedule confirmed and required raw material inputs verified as available.

### Owner
Production Manager

### AXIS System Actions
- Set `productionOrders.status → released`
- Record `releasedAt = now`, `releasedBy = current user`
- Order becomes visible to production operators and warehouse for material issue
- Optionally pre-reserve raw stock for the order

### Key Business Rules
- Only released orders may have materials issued against them
- Only released orders can be started by production operators
- Release confirms operational readiness — it is a deliberate authorization step, not automatic

---

## PROCESS 10 — Raw Material Issue to Production

### Objective
To record the exact raw batches and quantities consumed in a production run, creating full batch traceability.

### Trigger
Released production order is ready to start.

### Owner
Warehouse + Production

### Swimlane Flow

```
WAREHOUSE / PRODUCTION OPERATOR
     │
  [START — order status = released]
     │
Select production order
     │
Select raw material batch to issue:
- batch must be approved / released_to_stock
  / partially_consumed
- batch must have sufficient availableQty
     │
Enter quantityIssued
Select issuedFromLocationId
     │
System creates:
production_material_issues record
     │
Atomic transaction:
- productionOrders.totalQuantityIssued += quantityIssued
- rawMaterialBatches.quantityConsumed += quantityIssued
- batch status → partially_consumed or consumed
- stock_movement: issue_to_production
- stock_balances.availableQuantity -= quantityIssued
     │
Repeat for additional batches
as needed
     │
  [END → Production Execution]
```

### Key Business Rules
- Only approved raw stock may be issued
- Issue quantities must not exceed available stock at source location
- Multiple batches may be issued to a single production order
- Every issue creates an explicit material issue record — no bulk consumption without records
- Production traceability depends entirely on this link

### Possible Exceptions
- Insufficient quantity at location → operator selects alternative batch or location
- Blocked batch mistakenly selected → system prevents issue, error shown
- Wrong batch picked → issue reversed; correct batch issued; audit log records correction
- Issue variance beyond expected → exception raised requiring approval

---

## PROCESS 11 — Production Execution

### Objective
To manage the active milling and packaging run and capture actual performance data.

### Trigger
Raw materials issued and production started by operator.

### Owner
Production Team

### Swimlane Flow

```
PRODUCTION OPERATOR
     │
  [START — order status = released]
     │
Start production run
orderStatus → in_progress
startedAt = now
     │
Execute milling / packaging
     │
Issue additional raw material
as needed (loop back to Process 10)
     │
Capture in-process notes
or QC checkpoints (see Process 12)
     │
Production run completes
     │
Record finished output batches
(see Process 13)
     │
PRODUCTION MANAGER marks complete
actualQuantityProduced confirmed
totalWastage entered
orderStatus → completed
completedAt = now
     │
  [END → Finished Goods QC]
```

### AXIS System Actions
- `startedAt` stamped when operator starts
- Status → `in_progress`
- `actualQuantityProduced` accumulates with each finished batch recorded
- `totalQuantityIssued` accumulates with each material issue
- On completion: `totalWastage` entered, status → `completed`, `completedAt` stamped

### Key Business Rules
- Completed production order must show actual consumption, actual output, and wastage
- Variances between target and actual must be visible — not hidden
- Wastage must not be absorbed silently into output figures
- A cancelled production order must reverse any material issues already made

### Possible Exceptions
- Machine downtime mid-run → exception raised; run paused; order stays `in_progress`
- Low yield / significant shortfall → `production_shortfall` exception raised
- Contamination event mid-run → production halted; in-process QC invoked
- Interrupted or partially completed run → partial output batches created; wastage captured

---

## PROCESS 12 — In-Process Quality Checks

### Objective
To monitor product quality during production at critical control points before final batch release.

### Trigger
Production run is active, or at defined control stages (e.g. post-milling, pre-packaging).

### Owner
Quality Control

### AXIS System Actions
- Create `quality_checks` record with `checkType = in_process`
- Link check to `productionOrderId`
- Record test values and QC officer notes
- If issue detected: set production hold; raise exception

### Key Business Rules
- In-process QC checks are optional per plant policy but must be supported by the system
- A quality hold during production must be visible and enforceable — it must block the order from advancing
- Any failed in-process check must raise an exception before production continues

### Possible Exceptions
- Process drift detected → hold raised; production manager and QC decide corrective action
- Inconsistent packaging → line stopped; packaging team investigates
- Contamination suspicion → batch quarantined; QC re-inspects; exception raised

---

## PROCESS 13 — Finished Product Batch Creation

### Objective
To convert production output into traceable finished goods batches ready for QC inspection.

### Trigger
Production run completes packaged output.

### Owner
Production Team

### AXIS System Actions
- Create `finished_product_batches` record per output lot
- Auto-generate `batchNumber`
- Link to `productionOrderId`
- Record `productId`, `quantityProduced`, `packageSize`, `storageLocationId`, `productionDate`
- Set batch status → `pending_qc`
- Create `stock_movement`: type `finished_goods_receipt`
- Update `stock_balances`: new row at assigned location with `availableQuantity = quantityProduced`
- Update `productionOrders.actualQuantityProduced` += `quantityProduced`

### Key Business Rules
- Finished goods must be batch-based — no generic untracked finished stock
- One production order may produce multiple finished batches if operationally needed
- Each finished batch must be assigned a physical storage location at creation

### Possible Exceptions
- Packaging error (wrong size or damaged) → batch flagged; QC notified before inspection
- Output quantity significantly below target → `production_shortfall` exception raised
- Mixed package sizes from one run → separate finished batches created per size

---

## PROCESS 14 — Finished Goods Quality Inspection

### Objective
To formally inspect finished flour batches and decide whether they are released to dispatchable stock or blocked.

### Trigger
Finished product batch created — batch status = `pending_qc`.

### Owner
Quality Control

### Swimlane Flow

```
QUALITY CONTROL
     │
  [START — finishedBatch status = pending_qc]
     │
Locate batch in
Finished Goods QC queue
     │
Go to storage location
Perform physical inspection:
- packaging integrity (sealed, labelled)
- moisture level (%)
- contamination (Y/N)
- foreignMatterPercent (%)
- grainIntegrity
- remarks
checkedBy = current user
checkedAt = now
     │
Make decision
     │
┌─────────┬──────────┬──────────────┐
│         │          │              │
RELEASED  BLOCKED  ON HOLD    HOLD FOR REVIEW
│         │          │              │
▼         ▼          ▼              ▼
batchStatus batchStatus batchStatus batchStatus
→ released  → blocked   stays       stays
releasedAt  blockedAt   pending_qc  pending_qc
set         set         holdReason  assigned to
                        recorded    senior QC
│           │
Stock       Stock
available   movement:
for         block
dispatch    exception:
            qc_failure
     │
  [END → Warehouse Intake or Block Handling]
```

### AXIS System Actions

**On `released`:**
- Set `releasedAt`, batch status → `released`
- Batch becomes visible to dispatch for allocation

**On `blocked`:**
- Set `blockedAt`, batch status → `blocked`
- `stock_movement` created: type `block`
- `stock_balances.availableQuantity` → 0, `blockedQuantity` increases
- `exception_log` auto-raised: type `qc_failure`
- Batch cannot be allocated to dispatch

**On `on_hold`:**
- Batch stays `pending_qc`
- `holdReason` recorded
- Batch is non-dispatchable until re-inspected

### Key Business Rules
- No finished batch becomes dispatchable until explicitly `released`
- Blocked stock must remain invisible to dispatch allocation
- Failed inspection must trigger a controlled handling path
- Rejection reason is required — cannot be blank

### Possible Exceptions
- Packaging seal or label issue → block; rework decision made by QC and production manager
- Quality parameter outside threshold → block with `qc_failure` exception
- Blocked batch suitable for rework → returned to production; new finished batch created
- Blocked batch condemned → `adjustment_decrease` stock movement; exception closed with destruction record

---

## PROCESS 15 — Finished Goods Warehouse Intake

### Objective
To confirm released finished goods in dispatchable warehouse inventory at a confirmed location.

### Trigger
Finished product batch released by QC.

### Owner
Warehouse

### AXIS System Actions
- Confirm or reassign storage location as needed
- Batch status already `released` from QC step
- `stock_balances.availableQuantity` reflects released quantity at confirmed location
- Batch is now visible for dispatch allocation

### Key Business Rules
- Finished stock must carry both batch identity and location
- Blocked or unreleased finished goods cannot appear as available stock
- Location must be confirmed before the batch is visible for dispatch

### Possible Exceptions
- Storage capacity issue → batch held at temporary location; exception raised
- Damaged finished goods discovered on transfer from production → QC re-inspects; block if required
- Location mismatch in system vs physical → `stock_mismatch` exception; warehouse reconciles

---

## PROCESS 16 — Customer Dispatch Order Creation

### Objective
To create an outbound demand record for fulfillment.

### Trigger
Customer order or dispatch instruction received.

### Owner
Dispatch / Sales Operations / Admin

### AXIS System Actions
- Create `dispatch_orders` record
- Auto-generate `orderNumber`
- Link to `customerId` (customer name snapshotted at creation)
- Capture `deliveryAddress`, `scheduledDate`, `notes`
- Set status → `draft`

### Key Business Rules
- Dispatch order must exist before stock allocation begins
- Required product and quantity must be explicit per line item
- Customer name is snapshotted — changes to the customer master do not affect existing orders

### Possible Exceptions
- Incomplete customer details → order cannot be submitted without customer linkage
- Invalid product requested → system prevents selection of unavailable products
- Scheduling conflict → dispatcher adjusts date

---

## PROCESS 17 — Finished Goods Allocation

### Objective
To formally reserve exact finished product batches against a dispatch order, creating outbound traceability.

### Trigger
Dispatch order confirmed for fulfillment.

### Owner
Warehouse + Dispatch

### Swimlane Flow

```
DISPATCH / WAREHOUSE
     │
  [START — dispatch order status = draft / scheduled]
     │
Select dispatch order
     │
Add dispatch item:
- select product
- select released finished batch
- enter quantityAllocated
     │
Validation:
- batch must be status = released
- quantityAllocated ≤ availableQuantity
     │
Atomic transaction:
- dispatch_items record created (status = allocated)
- stock_movement: reservation
- stock_balances.reservedQuantity increases
- stock_balances.availableQuantity decreases
- finishedBatch.quantityAllocated increases
     │
Repeat for all line items
     │
Confirm allocation
orderStatus → allocated
finishedBatch status → allocated
     │
  [END → Loading]
```

### Key Business Rules
- Allocation must only use `released` finished stock
- Reserved stock immediately reduces availability to other orders
- Batch-level allocation is mandatory — no generic stock allocation permitted
- Cancelled allocation must reverse all reservation movements

### Possible Exceptions
- Insufficient released stock → exception raised; dispatcher works with warehouse to release more stock or adjust order
- Split allocation across multiple batches → permitted; system supports multi-batch per product line
- Reserved stock conflict → system prevents double-allocation; first reservation wins

---

## PROCESS 18 — Picking, Loading, and Dispatch Confirmation

### Objective
To validate that the correct stock is physically loaded and officially dispatched.

### Trigger
Allocated dispatch order ready for shipment.

### Owner
Dispatch Team + Warehouse

### Swimlane Flow

```
WAREHOUSE                    DISPATCH
     │                            │
  [START — order = allocated]     │
     │                            │
Pick reserved batches             │
from storage locations            │
itemStatus → picked               │
     │                            │
Stage at loading bay              │
     │                       Start loading
     │                       orderStatus
     │                       → loading
     │                            │
     │                  Confirm quantityLoaded
     │                  per dispatch item
     │                  itemStatus → loaded
     │                            │
All items loaded?                 │
     │                            │
     │                  Mark dispatched
     │                  dispatchedAt = now
     │                  orderStatus → dispatched
     │                            │
     │             Atomic transaction per item:
     │             - stock_movement: dispatch_out
     │             - stock_balances.reservedQty → 0
     │             - finishedBatch.quantityDispatched increases
     │             - finishedBatch status → dispatched
     │                            │
     │                         [END → POD]
```

### Key Business Rules
- Loaded quantity must match allocated quantity unless partial dispatch is explicitly approved
- All outbound stock reductions must be movement-based — no manual balance edits
- Wrong batch loading must be blocked or flagged before departure
- Dispatch cannot be confirmed without all item quantities loaded

### Possible Exceptions
- Partial dispatch (not all items loaded) → `dispatch_short_load` exception raised; order adjusted before departing
- Damaged goods during loading → damaged items replaced or order adjusted; exception raised
- Vehicle change at last minute → vehicle details updated; order proceeds
- Loading variance discovered → dispatcher reconciles before confirming dispatch

---

## PROCESS 19 — Delivery Confirmation / Proof of Delivery

### Objective
To close the delivery lifecycle with formal delivery evidence.

### Trigger
Goods received by customer.

### Owner
Dispatch Team / Delivery Personnel

### AXIS System Actions
- Capture `podReference` (POD document number or signature reference)
- Capture `receiverName`
- Capture `quantityDelivered` per item
- Set item statuses → `delivered`
- Set `deliveredAt = now`
- Set dispatch order status → `delivered`

### Key Business Rules
- `delivered` status must not be set without confirmation evidence
- `podReference` is required to close the order as `delivered`
- Delivery exceptions must be recorded — not ignored or left unresolved

### Possible Exceptions
- Failed delivery (customer refuses) → `failed_delivery` exception raised; stock movement reversed; batches returned to `released` status
- Partial acceptance (customer accepts partial quantity) → delivered quantity per item updated; shortfall exception raised
- Damaged on arrival → `damaged_goods` exception raised; claim process initiated
- POD document not yet returned → order stays in `dispatched`; follow-up required; `failed_delivery` exception raised after threshold

---

# 8. Cross-Functional Control Processes

---

## 8.1 Stock Movement Control

### Objective
To ensure every inventory change is traceable to a specific event, actor, and timestamp.

### Applies To
Every stock quantity change must create a corresponding `stock_movements` record:

| Event | Movement Type |
|-------|--------------|
| Raw batch QC approved | `inbound_receipt` |
| Material issued to production | `issue_to_production` |
| Finished batch created | `finished_goods_receipt` |
| Dispatch allocated | `reservation` |
| Dispatch confirmed | `dispatch_out` |
| Dispatch cancelled | `reservation_release` |
| Stock transferred between locations | `stock_transfer` |
| Manual adjustment increase | `adjustment_increase` |
| Manual adjustment decrease | `adjustment_decrease` |
| Batch blocked by warehouse or QC | `block` |
| Batch released from block | `release` |
| Failed delivery — stock returned | `rejection` |

### Required Movement Data Per Record
- `movementType`
- `itemType` (raw_material / finished_product)
- `batchId` (raw or finished)
- `quantity`
- `fromLocationId`
- `toLocationId`
- `referenceType` and `referenceId` (links back to the triggering entity)
- `createdBy`
- `createdAt`

### Rule
Stock movements are system-generated — no user creates them directly. They are created automatically as side effects of service-layer operations. Inventory balances must be derivable from movement history.

---

## 8.2 Batch Traceability Control

### Objective
To allow complete forward and backward traceability from supplier delivery to customer.

### Full Traceability Chain

```
Supplier
  └── truck_delivery
        └── weighbridge_reading
              └── raw_material_batch
                    └── quality_check (raw)
                          └── production_order
                                └── production_material_issue
                                      └── finished_product_batch
                                            └── quality_check (finished)
                                                  └── dispatch_order
                                                        └── dispatch_item
                                                              └── customer_delivery
```

### Questions AXIS Must Be Able To Answer

| Direction | Question |
|-----------|----------|
| Forward | Which customer received flour from this raw material batch? |
| Backward | Which supplier delivered the maize used in this finished batch? |
| Inbound | Which deliveries contributed to this production order? |
| Outbound | Which finished batches were dispatched in this order? |
| Production | Which raw batches were consumed in this production run? |
| QC | What were the quality results for this batch at each stage? |
| Stock | What is the full movement history for this batch? |

---

## 8.3 Quality Hold and Release Control

### Objective
To prevent failed or unreviewed material from being used in production or dispatched to customers.

### Hold Scenarios and Blocking Effects

| Scenario | Affected status | Blocking effect |
|----------|----------------|----------------|
| Raw material `pending_qc` | `pending_qc` | Cannot be issued to production |
| Raw material `on_hold` | `on_hold` | Cannot be issued to production |
| Raw material `rejected` | `rejected` | Permanently blocked from production |
| Finished goods `pending_qc` | `pending_qc` | Cannot be allocated to dispatch |
| Finished goods `blocked` | `blocked` | Cannot be allocated to dispatch |
| In-process hold | Production order paused | Production cannot continue until resolved |

### Control Rules
- On-hold stock must be non-allocatable and non-issuable
- Rejected stock must remain outside normal usable inventory permanently
- Release actions must be role-controlled and fully audit-logged
- A rejected entity cannot change status without a new QC check on record

---

## 8.4 Exception Management

### Objective
To log, track, escalate, and formally resolve all operational deviations.

### Exception Lifecycle

```
open → in_review → resolved → closed
```

### Exception Types and Ownership

| Exception Type | Typically Raised By | Typically Resolved By |
|----------------|--------------------|-----------------------|
| `supplier_variance` | Receiving | Procurement + supplier |
| `weight_discrepancy` | Weighbridge / Receiving | Procurement + weighbridge operator |
| `qc_failure` | Quality Control (auto) | QC + Production Manager |
| `stock_mismatch` | Warehouse | Warehouse + Admin |
| `production_shortfall` | Production Operator | Production Manager |
| `dispatch_short_load` | Dispatch | Dispatch + Warehouse |
| `failed_delivery` | Dispatch | Dispatch + Customer service |
| `damaged_goods` | Any role | Warehouse + QC |
| `system_data_issue` | Any role | Admin |

### Auto-Raised Exceptions (No User Action Required)

| Trigger | Exception auto-raised |
|---------|----------------------|
| QC rejection (raw or finished) | `qc_failure` |
| Manual stock adjustment | `stock_mismatch` |
| In-process QC failure | `qc_failure` |
| Finished batch blocked | `qc_failure` |

### Required Exception Record Fields
- `exceptionType`
- `severity` (low / medium / high / critical)
- `entityType` and `entityId` (links to affected record)
- `description`
- `status`
- `raisedBy`, `raisedAt`
- `resolvedBy`, `resolvedAt`, `resolutionNotes`

---

## 8.5 Document and Attachment Management

### Objective
To support the operational evidence trail with supporting documents at every stage.

### Attachable Entities

| Entity | Example Documents |
|--------|-----------------|
| `delivery` | Delivery note, supplier invoice, PO copy |
| `weighbridge_reading` | Official weighbridge ticket |
| `raw_material_batch` | QC certificate, receiving report |
| `quality_check` | Lab test results, inspection photos |
| `production_order` | Production worksheet, recipe reference |
| `finished_product_batch` | Packaging record, batch certificate |
| `dispatch_order` | Customer order, dispatch note, proof of delivery |
| `exception_log` | Evidence photos, correspondence, resolution memo |

### Rule
Any operational record can have one or more attachments. Attachments are stored with: `entityType`, `entityId`, `fileName`, `fileUrl`, `mimeType`, `uploadedBy`, `uploadedAt`.

---

## 8.6 Audit Trail Control

### Objective
To create an immutable record of all important business changes for accountability, compliance, and dispute resolution.

### Actions That Must Generate an Audit Log Entry

- Any status change on any entity
- Any quantity change on stock balances
- Any approval or rejection decision
- Any user role change by admin
- Any manual stock adjustment
- Any exception resolution or closure
- Any dispatch confirmation or delivery closure

### Required Audit Record Fields
- `entityType`
- `entityId`
- `action`
- `previousValues` (JSONB — full previous state)
- `newValues` (JSONB — full new state)
- `actorId`
- `timestamp`

### Rule
Audit logs are system-generated by the service layer — no UI component creates them. They are immutable — they cannot be edited or deleted under any circumstances.

---

# 9. Swimlane-Oriented Process Summary by Role

## Procurement Lane
- Create expected delivery records
- Validate supplier identity on arrival
- Make formal acceptance or rejection decision after QC
- Manage supplier-related exceptions and disputes

## Receiving / Gate Lane
- Register truck arrival against planned or walk-in delivery
- Confirm intake reference and supplier match
- Create raw material batches from weighed deliveries

## Weighbridge Lane
- Capture gross and tare weight per delivery
- Issue official weighbridge ticket
- Mark final reading and confirm net quantity

## Quality Control Lane
- Inspect raw material batches (approve / reject / hold)
- Conduct in-process checks during production runs
- Inspect and release or block finished goods batches
- Manage QC-related exceptions and reinspections

## Warehouse Lane
- Store approved raw material at confirmed locations
- Issue raw material to released production orders
- Store and manage released finished goods
- Perform stock transfers and adjustments with documented reasons
- Block and release stock as required
- Support dispatch picking and loading

## Production Lane
- Create, schedule, and release production orders
- Issue raw materials to active orders
- Execute and monitor production runs
- Record finished output batches with quantities and locations
- Capture wastage and close completed orders

## Dispatch Lane
- Create customer dispatch orders
- Allocate released finished batches to order lines
- Coordinate picking, staging, and loading with warehouse
- Confirm dispatch and record outbound quantities
- Capture proof of delivery and close order

## Admin Lane
- Manage users, roles, and permissions
- Maintain all master data (suppliers, customers, products, locations)
- Oversee exception queue and unresolved items
- Access audit logs and system governance dashboards

---

# 10. Cross-Process Handoff Map

```
[PROCUREMENT]
Creates expected delivery
        │
        ▼
[RECEIVING / GATE]
Registers truck arrival
        │
        ▼
[WEIGHBRIDGE]
Captures gross, tare, net weight
        │
        ▼
[RECEIVING / WAREHOUSE]
Creates raw material batch
        │
        ▼
[QUALITY CONTROL]
Inspects batch → Approves / Rejects / Holds
        │
    APPROVED
        │
        ▼
[WAREHOUSE]
Confirms stock intake at location
        │
        ▼
[PRODUCTION MANAGER]
Creates, schedules, and releases production order
        │
        ▼
[WAREHOUSE + PRODUCTION OPERATOR]
Issues raw material to production order
        │
        ▼
[PRODUCTION TEAM]
Executes run → Records output batches
        │
        ▼
[QUALITY CONTROL]
Inspects finished batch → Releases / Blocks
        │
    RELEASED
        │
        ▼
[WAREHOUSE]
Confirms finished goods at storage location
        │
        ▼
[DISPATCH]
Creates order → Allocates batches → Loads → Dispatches
        │
        ▼
[DISPATCH]
Confirms delivery with POD → Order closed
```

---

# 11. Full High-Level Process Flow

```
[1] Supplier Delivery Planning
          │
          ▼
[2] Truck Arrival Registration
          │
          ▼
[3] Weighbridge Measurement
          │
          ▼
[4] Raw Material Batch Creation
          │
          ▼
[5] Raw Material QC
          │
    ┌─────┴──────┬────────────┐
    │            │            │
APPROVED     REJECTED     ON HOLD
    │            │            │
    ▼            ▼            │
[6] Procurement  Handle /     Re-inspect
    Acceptance   Return        loop
    │
    ▼
[7] Raw Material Stock Intake
    │
    ▼
[8] Production Planning
    │
    ▼
[9] Production Order Release
    │
    ▼
[10] Raw Material Issue to Production
    │
    ▼
[11] Production Execution ←── [12] In-Process QC (optional)
    │
    ▼
[13] Finished Product Batch Creation
    │
    ▼
[14] Finished Goods QC
    │
    ┌─────┴──────┬────────────┐
    │            │            │
RELEASED     BLOCKED      ON HOLD
    │            │
    ▼        Rework /
[15] FG         Destroy
    Warehouse
    Intake
    │
    ▼
[16] Dispatch Order Creation
    │
    ▼
[17] Finished Goods Allocation
    │
    ▼
[18] Picking / Loading / Dispatch
    │
    ▼
[19] Delivery Confirmation / POD
    │
    ▼
  [ORDER CLOSED]
```

---

# 12. End-to-End Process Reference Table

| # | Process | Primary Owner | Main Record | Decision Point | Next Output |
|---|---------|--------------|-------------|---------------|-------------|
| 1 | Supplier delivery planning | Procurement | `truck_deliveries` | Expected or walk-in? | Delivery `expected` |
| 2 | Truck arrival registration | Receiving | `truck_deliveries` | Valid intake? | Delivery `pending_receipt` |
| 3 | Weighbridge measurement | Weighbridge | `weighbridge_readings` | Quantity validated? | Delivery `weighed` |
| 4 | Raw material batch creation | Receiving / Warehouse | `raw_material_batches` | Batch created? | Batch `pending_qc` |
| 5 | Raw material QC | Quality Control | `quality_checks` | Approve / reject / hold? | Batch `approved` or `rejected` |
| 6 | Procurement acceptance | Procurement | `truck_deliveries` | Accept or return? | Stock intake or rejection route |
| 7 | Raw material stock intake | Warehouse | `stock_movements` | Location assigned? | Available raw stock |
| 8 | Production planning | Production Manager | `production_orders` | Stock sufficient? | Order `scheduled` |
| 9 | Production release | Production Manager | `production_orders` | Ready to execute? | Order `released` |
| 10 | Raw material issue | Warehouse + Production | `production_material_issues` | Correct batch and qty? | Materials committed |
| 11 | Production execution | Production Team | `production_orders` | Run complete? | Finished batches created |
| 12 | In-process QC | Quality Control | `quality_checks` | Continue or hold? | Process controlled |
| 13 | Finished batch creation | Production Team | `finished_product_batches` | Output confirmed? | Batch `pending_qc` |
| 14 | Finished goods QC | Quality Control | `quality_checks` | Release or block? | Batch `released` or `blocked` |
| 15 | Finished goods intake | Warehouse | `stock_movements` | Stored correctly? | Dispatchable stock |
| 16 | Dispatch order creation | Dispatch | `dispatch_orders` | Valid request? | Order `draft` |
| 17 | Batch allocation | Warehouse + Dispatch | `dispatch_items` | Enough released stock? | Order `allocated` |
| 18 | Loading and dispatch | Dispatch + Warehouse | `dispatch_orders` | Loaded correctly? | Order `dispatched` |
| 19 | POD and order closure | Dispatch | `dispatch_orders` | Delivery confirmed? | Order `delivered` |

---

# 13. Operational Status Models

## 13.1 Delivery Status
```
expected → pending_receipt → weighed → pending_qc → approved → closed
                                                   ↘ rejected → closed
                                                   ↘ on_hold  → (re-inspect loop)
```

## 13.2 Raw Material Batch Status
```
pending_qc → approved → released_to_stock → partially_consumed → consumed
           ↘ rejected
           ↘ on_hold → (re-inspect loop)
```

## 13.3 Production Order Status
```
draft → scheduled → released → in_progress → completed
                                           ↘ cancelled
```

## 13.4 Finished Product Batch Status
```
pending_qc → released → allocated → dispatched
           ↘ blocked
           ↘ on_hold → (re-inspect loop)
```

## 13.5 Dispatch Order Status
```
draft → scheduled → allocated → loading → dispatched → delivered
                                                      ↘ cancelled (at any pre-dispatch stage)
```

## 13.6 Exception Status
```
open → in_review → resolved → closed
```

---

# 14. Minimum System Records Required

To support this business process correctly, AXIS must maintain these operational records:

| Record | Purpose |
|--------|---------|
| `users` | Identity and access control |
| `suppliers` | Inbound delivery source |
| `customers` | Outbound dispatch destination |
| `products` | Raw material and finished goods catalogue |
| `storage_locations` | Physical location master |
| `truck_deliveries` | Inbound delivery lifecycle |
| `weighbridge_readings` | Weight evidence per delivery |
| `raw_material_batches` | Traceable raw material lots |
| `quality_checks` | QC decisions for all three check types |
| `production_orders` | Production planning and execution |
| `production_material_issues` | Raw-to-production traceability link |
| `finished_product_batches` | Traceable finished goods lots |
| `stock_balances` | Real-time inventory by batch and location |
| `stock_movements` | Complete inventory change ledger |
| `dispatch_orders` | Outbound customer order lifecycle |
| `dispatch_items` | Batch-level outbound allocation |
| `attachments` | Supporting documents at every stage |
| `audit_logs` | Immutable change history |
| `exception_logs` | Operational deviation tracking |

---

# 15. Current State vs AXIS — Pain Points Eliminated

| Process | Current Pain Point | AXIS Solution |
|---------|-------------------|---------------|
| Inbound receiving | Deliveries tracked on paper or WhatsApp with no formal record | `truck_deliveries` creates a permanent system record from planning to closure |
| Weighbridge | Ticket numbers recorded manually; net weight calculated on a calculator | `weighbridge_readings` captures all readings with automatic net weight calculation |
| Raw material QC | QC results in notebooks or spreadsheets with no link to batch | `quality_checks` links inspection results directly to the batch with full measurement history |
| Procurement acceptance | Informal phone calls or verbal confirmation | Explicit acceptance step with system state change and audit log |
| Stock tracking | Counted manually with no location control | `stock_balances` + `stock_movements` provide real-time location-based inventory |
| Production planning | No formal link between demand and available raw stock | Production order creation validates raw stock availability before release |
| Production consumption | No record of which raw batch was used for which run | `production_material_issues` creates an explicit traceable link per batch per order |
| In-process quality | No systematic capture of mid-run quality observations | `quality_checks` with `checkType = in_process` linked to production orders |
| Finished goods | Released and blocked batches tracked informally | `finished_product_batches.status` enforces explicit QC release before dispatch is possible |
| Dispatch allocation | Allocations done verbally or on paper; no batch-level customer linkage | `dispatch_items` links exact batch to exact customer order |
| Delivery confirmation | POD stored in folders with no system linkage | POD reference and receiver name captured and linked to the dispatch order |
| Governance | Exceptions and incidents handled informally with no resolution trail | `exception_logs` + `audit_logs` create a formal evidence and accountability layer |