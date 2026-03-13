# AXIS — Product Requirements Document (PRD)
## Automated Production & Inventory eXecution System
### Maize Flour Production Management Platform

**Version:** 1.0
**Status:** Approved for Development
**Prepared by:** AXIS Product Team

---

# 1. Document Purpose

This PRD defines exactly what the AXIS platform must do — the features, screens, workflows, data requirements, and system behaviour. It translates the business requirements from the BRD into product specifications that design and engineering can implement.

This document should be read alongside:
- `AXIS_Business_Process_Map.md` — the operational process flows
- `AXIS_BRD.md` — the business objectives and rules
- `AXIS_Module_Schema_Document.md` — the data model
- `AXIS_Role_Sidebar_ScreenFlows.md` — the role-based UX flows

---

# 2. Product Vision

AXIS is a single operational platform that gives every role in a maize flour plant a controlled, traceable, and role-appropriate view of the production cycle — from inbound raw material to outbound customer delivery.

**The product must answer these questions at any point in time:**
- Where is every kilogram of raw material right now?
- Which batches are waiting for QC?
- What is in production and what is it consuming?
- Which finished stock is available, blocked, or allocated?
- What was dispatched to which customer, from which batch?
- Who did what, and when?

---

# 3. User Personas

| Persona | Role | Primary goal in AXIS | Frequency of use |
|---------|------|---------------------|-----------------|
| Procurement Officer | `procurement` | Plan and track inbound deliveries | Daily |
| Receiving Officer | `receiving` | Register arrivals and create batches | Multiple times per day |
| Weighbridge Operator | `weighbridge` | Record weight readings accurately | Multiple times per day |
| QC Officer | `quality_control` | Inspect batches and record decisions | Multiple times per day |
| Production Manager | `production_manager` | Plan, schedule, and release production orders | Daily |
| Production Operator | `production_operator` | Issue materials and record output | Multiple times per day |
| Warehouse Officer | `warehouse` | Monitor stock and execute transfers | Daily |
| Dispatch Officer | `dispatch` | Allocate stock and manage outbound deliveries | Daily |
| System Administrator | `admin` | Manage users, master data, and system settings | As needed |

---

# 4. Product Modules

AXIS is organized into six operational modules plus a system module:

| Module | Core function |
|--------|--------------|
| **Inbound** | Delivery planning, truck arrival, weighbridge, batch intake |
| **Quality Control** | Inspections for raw material, in-process, and finished goods |
| **Inventory** | Stock balances, movement ledger, transfers, adjustments |
| **Production** | Production orders, material issues, finished output |
| **Dispatch** | Outbound orders, batch allocation, loading, delivery |
| **Governance** | Exceptions, audit logs, attachments |
| **System** | Users, master data, sessions |

---

# 5. Module Specifications

---

## 5.1 Inbound Module

### 5.1.1 Delivery Management

**Purpose:** Allow procurement to plan expected deliveries and receiving to manage truck arrivals through to batch creation.

**Key screens:**
- Deliveries list (filterable by status, supplier, date range)
- Create / Edit delivery form
- Delivery detail page

**Delivery form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Supplier | Select | Yes | From `suppliers` master data |
| Truck registration | Text | Yes | |
| Driver name | Text | Yes | |
| Driver phone | Text | No | |
| Expected arrival date | Date/time | Yes | |
| Expected quantity (kg) | Decimal | No | |
| Delivery reference | Text | No | Supplier's own reference |
| Notes | Textarea | No | |

**System-generated fields:**
- `deliveryNumber` — auto-generated unique reference
- `status` — starts at `expected`
- `createdBy` — current user
- `createdAt` — current timestamp

**Status transition rules:**

| From | To | Trigger | Who |
|------|----|---------|-----|
| `expected` | `pending_receipt` | Mark arrived | Receiving |
| `pending_receipt` | `weighed` | Final weighbridge reading recorded | Weighbridge |
| `weighed` | `pending_qc` | Raw material batch created | Receiving |
| `pending_qc` | `approved` | QC approves all batches | Quality Control |
| `pending_qc` | `rejected` | QC rejects batch | Quality Control |
| `pending_qc` | `on_hold` | QC holds batch | Quality Control |
| `approved` / `rejected` | `closed` | Manual closure | Receiving / Admin |

**Business rules enforced:**
- Batches cannot be created unless status is `weighed` or later
- Delivery cannot be approved without at least one QC-approved batch
- Rejection requires a `rejectionReason` — cannot be blank

---

### 5.1.2 Weighbridge Readings

**Purpose:** Capture official gross, tare, and net weights per delivery.

**Key screens:**
- Pending weighing queue (deliveries in `pending_receipt`)
- Record weighbridge reading form
- Reading history per delivery

**Reading form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Gross weight (kg) | Decimal | Yes | |
| Tare weight (kg) | Decimal | Yes | |
| Net weight (kg) | Decimal | Auto | Calculated: gross − tare |
| Reading type | Select | Yes | `initial`, `reweigh`, `final` |
| Ticket number | Text | No | Official weighbridge ticket ref |
| Weighbridge charges | Decimal | No | |
| Reading time | Date/time | Yes | |
| Is final | Boolean | Yes | If true, triggers delivery update |
| Notes | Textarea | No | |

**On `isFinal = true`:**
- `truck_deliveries.receivedQuantity` = this reading's `netWeight`
- `truck_deliveries.status` → `weighed`

---

### 5.1.3 Raw Material Batch Intake

**Purpose:** Formally create a traceable raw material batch from a weighed delivery.

**Key screens:**
- Create batch form (triggered from delivery detail)
- Raw material batches list
- Batch detail page

**Batch form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Product | Select | Yes | `raw_material` type products only |
| Quantity received (kg) | Decimal | Yes | Defaults to delivery `receivedQuantity` |
| Initial location | Select | Yes | From `storage_locations` |
| Notes | Textarea | No | |

**System-generated fields:**
- `batchNumber` — auto-generated
- `status` — starts at `pending_qc`
- `intakeAt` — current timestamp

---

## 5.2 Quality Control Module

### 5.2.1 QC Check Management

**Purpose:** Present QC officers with a pending queue per check type and allow them to record inspection results and decisions.

**Key screens:**
- Pending QC queue (tabbed: Raw Material | In-Process | Finished Goods)
- Perform QC check form
- QC check history list
- QC check detail page

**QC check form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Check number | Text | Auto | System-generated |
| Check type | Enum | Auto | Set by context |
| Target entity | Auto-linked | Auto | Batch or order being inspected |
| Moisture level (%) | Decimal | No | |
| Contamination detected | Boolean | Yes | |
| Foreign matter (%) | Decimal | No | |
| Grain integrity | Select | No | e.g. Good, Damaged, Poor |
| Packaging integrity | Select | No | e.g. Intact, Damaged, Torn |
| Remarks | Textarea | No | |
| Decision / Status | Select | Yes | `approved`, `rejected`, `on_hold`, `in_review` |
| Rejection reason | Textarea | Conditional | Required if `rejected` |
| Hold reason | Textarea | Conditional | Required if `on_hold` |

**Downstream effects by decision:**

| Decision | Raw material batch | Finished batch | Triggered |
|----------|--------------------|---------------|----------|
| `approved` (raw) | → `approved`, `approvedAt` set | — | `inbound_receipt` stock movement |
| `rejected` (raw) | → `rejected`, `rejectedAt` set | — | `qc_failure` exception |
| `released` (finished) | — | → `released`, `releasedAt` set | Batch visible to dispatch |
| `blocked` (finished) | — | → `blocked`, `blockedAt` set | `qc_failure` exception, `block` stock movement |
| `on_hold` (any) | Stays `pending_qc` | Stays `pending_qc` | Hold reason recorded |

**Business rules enforced:**
- A rejection must have a `rejectionReason`
- An on-hold must have a `holdReason`
- A rejected batch status cannot be reversed without a new QC check
- QC check must be attributed to a named user

---

## 5.3 Inventory Module

### 5.3.1 Stock Balances

**Purpose:** Provide real-time stock visibility by batch and location.

**Key screens:**
- Stock overview (summary by product and location)
- Raw material stock list (batch-level detail)
- Finished goods stock list (batch-level detail)
- Batch stock detail

**Display fields per balance row:**
- Product name and SKU
- Batch number
- Location
- Available quantity
- Reserved quantity
- Blocked quantity
- Last movement timestamp

**Quantity bucket definitions:**

| Bucket | Meaning |
|--------|---------|
| `availableQuantity` | Free to issue to production or allocate to dispatch |
| `reservedQuantity` | Earmarked for an allocated dispatch order |
| `blockedQuantity` | Blocked by QC or warehouse — cannot be used |

---

### 5.3.2 Stock Movements Ledger

**Purpose:** Provide a complete immutable record of every stock change.

**Key screens:**
- Stock movements list (filterable by type, batch, date range)
- Movement detail (read-only)

**Display fields per movement:**
- Movement number
- Movement type
- Product and batch
- Quantity
- From location → To location
- Reference type and ID
- Created by
- Created at

**Movements are system-generated** — users never create movement records directly. They are created automatically as a result of:
- QC approvals
- Material issues
- Finished batch recording
- Dispatch allocation and confirmation
- Transfers and adjustments
- Block and release actions

---

### 5.3.3 Stock Transfers

**Purpose:** Move stock between storage locations.

**Transfer form fields:**

| Field | Type | Required |
|-------|------|----------|
| Batch | Select | Yes |
| From location | Auto (from balance) | Yes |
| To location | Select | Yes |
| Quantity | Decimal | Yes |
| Notes | Textarea | No |

**On save:**
- `stock_movement` created: `movementType = stock_transfer`
- Source balance `availableQuantity` decreases
- Destination balance `availableQuantity` increases

---

### 5.3.4 Stock Adjustments

**Purpose:** Correct stock quantities when a physical count reveals a discrepancy.

**Adjustment form fields:**

| Field | Type | Required |
|-------|------|----------|
| Batch | Select | Yes |
| Location | Select | Yes |
| Adjustment type | Select | Yes | `adjustment_increase` or `adjustment_decrease` |
| Quantity | Decimal | Yes |
| Reason | Textarea | Yes | Mandatory |

**On save:**
- `stock_movement` created with appropriate type
- Balance updated accordingly
- `exception_log` automatically raised: type `stock_mismatch`

---

### 5.3.5 Block / Release Stock

**Purpose:** Quarantine or reinstate stock without a QC check (emergency warehouse control).

**On block:**
- `stock_movement` created: `movementType = block`
- `availableQuantity` decreases, `blockedQuantity` increases
- Finished batch status → `blocked`

**On release:**
- `stock_movement` created: `movementType = release`
- `blockedQuantity` decreases, `availableQuantity` increases
- Finished batch status → `released`

---

## 5.4 Production Module

### 5.4.1 Production Orders

**Purpose:** Allow production managers to plan, schedule, release, and complete production runs.

**Key screens:**
- Production orders list (filterable by status, product, date)
- Create / Edit production order form
- Production order detail page
- Schedule view (calendar by date)

**Production order form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Product | Select | Yes | `finished_product` type only |
| Target quantity (kg) | Decimal | Yes | |
| Scheduled date | Date/time | Yes | |
| Notes | Textarea | No | |

**System-generated fields:**
- `orderNumber` — auto-generated
- `status` — starts at `draft`
- `createdBy` — current user

**Status transition rules:**

| From | To | Trigger | Who |
|------|----|---------|-----|
| `draft` | `scheduled` | Schedule action | Production Manager |
| `scheduled` | `released` | Release to floor | Production Manager |
| `released` | `in_progress` | Operator starts | Production Operator |
| `in_progress` | `completed` | Manager completes | Production Manager |
| Any | `cancelled` | Cancel action | Production Manager |

**Quantity tracking fields (read-only, system-maintained):**
- `targetQuantity` — set at creation
- `totalQuantityIssued` — accumulates with each material issue
- `actualQuantityProduced` — accumulates with each finished batch
- `totalWastage` — entered at completion

---

### 5.4.2 Material Issues

**Purpose:** Allow production operators to issue raw material batches to an active production order.

**Issue form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Production order | Auto (context) | Yes | |
| Raw material batch | Select | Yes | Only `approved` / `released_to_stock` / `partially_consumed` batches |
| From location | Select | Yes | Filtered by batch availability |
| Quantity to issue (kg) | Decimal | Yes | Cannot exceed available quantity |
| Notes | Textarea | No | |

**On save (atomic transaction):**
1. `production_material_issues` record created
2. `productionOrders.totalQuantityIssued` += `quantityIssued`
3. `rawMaterialBatches.quantityConsumed` += `quantityIssued`
4. Batch status → `partially_consumed` or `consumed`
5. `stock_movement` created: `movementType = issue_to_production`
6. `stock_balances.availableQuantity` decreases

---

### 5.4.3 Finished Output Recording

**Purpose:** Allow production operators to record finished goods batches produced by an active order.

**Output form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Production order | Auto (context) | Yes | |
| Product | Auto (from order) | Yes | |
| Quantity produced (kg) | Decimal | Yes | |
| Package size | Select | No | e.g. 1kg, 2kg, 5kg, 10kg |
| Storage location | Select | Yes | |
| Production date | Date/time | Yes | |
| Notes | Textarea | No | |

**On save:**
1. `finished_product_batches` record created — status `pending_qc`
2. `productionOrders.actualQuantityProduced` += `quantityProduced`
3. `stock_movement` created: `movementType = finished_goods_receipt`
4. `stock_balances` row created for this batch at the assigned location

---

## 5.5 Dispatch Module

### 5.5.1 Dispatch Orders

**Purpose:** Allow dispatch officers to create and manage outbound customer shipments.

**Key screens:**
- Dispatch orders list (filterable by status, customer, date)
- Create dispatch order form
- Dispatch order detail page

**Dispatch order form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Customer | Select | Yes | From `customers` master data |
| Delivery address | Textarea | No | Snapshot stored |
| Scheduled date | Date/time | Yes | |
| Notes | Textarea | No | |

**Status transition rules:**

| From | To | Trigger | Who |
|------|----|---------|-----|
| `draft` | `scheduled` | Schedule action | Dispatch |
| `scheduled` | `allocated` | Confirm allocation | Dispatch |
| `allocated` | `loading` | Start loading | Dispatch |
| `loading` | `dispatched` | Mark dispatched | Dispatch |
| `dispatched` | `delivered` | Confirm delivery + POD | Dispatch |
| Any | `cancelled` | Cancel with reason | Dispatch |

---

### 5.5.2 Dispatch Items

**Purpose:** Link specific finished batches to a dispatch order line item with granular quantity tracking.

**Add item form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Product | Select | Yes | `finished_product` type only |
| Finished batch | Select | Yes | Only `released` batches with available qty > 0 |
| Quantity allocated (kg) | Decimal | Yes | Cannot exceed available quantity |

**On allocation:**
1. `dispatch_items` record created — `status = allocated`
2. `stock_movement` created: `movementType = reservation`
3. `stock_balances.reservedQuantity` increases
4. `finishedProductBatches.quantityAllocated` increases

**On dispatch confirmation (per item):**
1. `quantityLoaded` confirmed
2. `stock_movement` created: `movementType = dispatch_out`
3. `stock_balances.reservedQuantity` decreases to 0
4. `finishedProductBatches.quantityDispatched` increases
5. Batch status → `dispatched` if fully dispatched

**On delivery confirmation (per item):**
1. `quantityDelivered` confirmed
2. Item status → `delivered`

**On cancellation:**
1. `stock_movement` created: `movementType = reservation_release`
2. `stock_balances.reservedQuantity` decreases
3. `stock_balances.availableQuantity` increases
4. `finishedProductBatches.quantityAllocated` decreases
5. Batch status returns to `released`

---

## 5.6 Governance Module

### 5.6.1 Exception Logs

**Purpose:** Capture, track, and resolve operational deviations.

**Key screens:**
- Exceptions list (filterable by status, severity, type, entity)
- Raise exception form
- Exception detail page

**Exception form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Exception type | Select | Yes | From `exceptionTypeEnum` |
| Severity | Select | Yes | `low`, `medium`, `high`, `critical` |
| Related entity type | Select | Yes | e.g. `delivery`, `raw_material_batch` |
| Related entity ID | Auto / text | Yes | Links to the affected record |
| Description | Textarea | Yes | |

**Resolution fields (on resolve):**
- Resolution notes — required
- `resolvedBy` — current user
- `resolvedAt` — current timestamp
- Status → `resolved` then `closed`

**Auto-raised exceptions (no user action needed):**

| Trigger | Exception type auto-raised |
|---------|--------------------------|
| QC rejection | `qc_failure` |
| Manual stock adjustment | `stock_mismatch` |
| In-process QC failure | `qc_failure` |
| Finished batch blocked | `qc_failure` |

---

### 5.6.2 Audit Logs

**Purpose:** Immutable record of every critical system change.

**Key screens:**
- Audit log list (read-only, filterable by entity type, actor, date range)
- Audit log detail (before/after JSON diff)

**Audit logs are system-generated and cannot be edited or deleted.**

**Actions that must generate an audit log entry:**
- Any status change on any entity
- Any quantity change on stock balances
- Any user role change
- Any approval or rejection decision
- Any exception resolution or closure
- Any manual stock adjustment

---

### 5.6.3 Attachments

**Purpose:** Allow supporting documents to be attached to any operational record.

**Attachment upload fields:**
- File (upload — PDF, image, spreadsheet)
- File name (auto from upload)
- Entity type and ID (auto from context)

**Supported entities:**
delivery, weighbridge_reading, raw_material_batch, quality_check, production_order, finished_product_batch, dispatch_order, exception_log

---

## 5.7 System Module

### 5.7.1 User Management (Admin only)

**Purpose:** Create and manage system users and role assignments.

**User form fields:**

| Field | Type | Required |
|-------|------|----------|
| Email | Email | Yes |
| Password | Password | Yes |
| First name | Text | Yes |
| Last name | Text | Yes |
| Role | Select | Yes |
| Is active | Boolean | Yes |

---

### 5.7.2 Master Data (Admin only)

**Suppliers, Customers, Products, Storage Locations** — each managed through a standard list / create / edit / deactivate flow. All four entities support soft deletion via `isActive = false`.

---

# 6. System Behaviour Requirements

## 6.1 Atomic Transactions

The following operations must succeed or fail as a complete unit. No partial saves are permitted:

| Operation | Tables in transaction |
|-----------|----------------------|
| Approve raw material batch | `raw_material_batches`, `quality_checks`, `stock_balances`, `stock_movements`, `audit_logs` |
| Issue material to production | `production_material_issues`, `production_orders`, `raw_material_batches`, `stock_balances`, `stock_movements` |
| Record finished output | `finished_product_batches`, `production_orders`, `stock_balances`, `stock_movements` |
| Release finished batch | `finished_product_batches`, `quality_checks`, `stock_balances`, `stock_movements`, `audit_logs` |
| Allocate dispatch item | `dispatch_items`, `finished_product_batches`, `stock_balances`, `stock_movements` |
| Confirm dispatch | `dispatch_orders`, `dispatch_items`, `finished_product_batches`, `stock_balances`, `stock_movements` |
| Cancel dispatch order | `dispatch_orders`, `dispatch_items`, `finished_product_batches`, `stock_balances`, `stock_movements` |
| Manual stock adjustment | `stock_balances`, `stock_movements`, `exception_logs`, `audit_logs` |

## 6.2 Access Control

- All routes must be protected server-side by role
- A user attempting to access a route outside their role receives a 403 response
- Status-gated action buttons must be disabled with a tooltip if preconditions are not met
- No role can perform another role's status transitions

## 6.3 Validation Rules

- All decimal quantity fields must be positive values greater than zero
- Issued quantity cannot exceed available quantity on the source batch
- Allocated quantity cannot exceed available quantity on the finished batch
- Rejection and hold reasons cannot be blank
- Batch and order numbers are system-generated and not editable

## 6.4 Audit Log Generation

Audit logs must be generated automatically by the service layer — no UI component should be responsible for creating them. Every service method that performs a status change or quantity update must write an audit log entry as part of its transaction.

---

# 7. Out of Scope (Phase 1)

The following will not be built in Phase 1:

- Financial accounting, invoicing, or payment processing
- Customer-facing order portal
- Mobile native application
- Automated weighbridge hardware integration
- Multi-site or multi-plant support
- External ERP integration
- Scheduled or automated reporting emails
- Dashboard analytics beyond operational status counts
- Supplier portal

---

# 8. Phasing

## Phase 1 — Core Operational System

All modules described in this PRD. Delivery target: single plant go-live.

## Phase 2 (indicative — not committed)

- Reporting and analytics dashboards
- Automated exception notifications (email / SMS)
- Mobile-optimised interface
- Weighbridge hardware integration
- Supplier portal for delivery pre-notification

## Phase 3 (indicative — not committed)

- Multi-site support
- ERP / accounting integration
- Customer order portal
- Demand forecasting

---

# 9. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| OQ-01 | Should users be able to hold multiple roles? | Operations Director | Open |
| OQ-02 | What is the threshold for raising a `weight_discrepancy` exception automatically? | QC Manager | Open |
| OQ-03 | What file types and size limits apply to attachments? | System Administrator | Open |
| OQ-04 | Should dispatch cancellation after loading be permitted, or require admin override? | Dispatch Supervisor | Open |
| OQ-05 | What is the session timeout policy for inactive users? | System Administrator | Open |