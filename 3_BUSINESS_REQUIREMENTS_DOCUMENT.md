# AXIS — Business Requirements Document (BRD)
## Automated Production & Inventory eXecution System
### Maize Flour Production Management Platform

**Version:** 1.0
**Status:** Approved for Development
**Prepared by:** AXIS Project Team

---

# 1. Executive Summary

AXIS is a purpose-built production and inventory management platform for a maize flour milling operation. It is designed to replace manual, paper-based, and informal operational processes with a controlled, traceable, role-based digital system.

The core business problem is the absence of a single system of record that links inbound raw material, quality control, production execution, and outbound dispatch into one connected operational chain. Without this, the business cannot trace batches end-to-end, enforce quality gates, or audit stock movements reliably.

AXIS solves this by implementing a controlled process flow from supplier delivery through to customer delivery, with every critical action recorded, attributed to a user, and auditable.

---

# 2. Business Context

## 2.1 Industry and Operation

The business operates a maize flour milling plant. The core production cycle is:

1. Raw maize is purchased from suppliers and delivered by truck
2. Deliveries are weighed at the weighbridge to establish net quantity
3. Raw maize is inspected by quality control before entering storage
4. Approved raw maize is issued to production and milled into flour
5. Finished flour is packaged in various sizes (1kg, 2kg, 5kg, 10kg)
6. Finished flour is inspected by quality control before release
7. Released flour is dispatched to customers

## 2.2 Current State

The current operation runs primarily on:

- Paper delivery notes and weighbridge tickets
- WhatsApp messages for coordination between roles
- Spreadsheets for stock tracking
- Notebooks for QC records
- Verbal handoffs between shifts and departments

This creates the following operational environment:

- No single version of truth for stock quantities
- No formal link between a delivery and the batch it produced
- No audit trail for who approved, rejected, or adjusted anything
- No ability to trace a customer shipment back to a specific raw material delivery
- No formal exception management — problems are resolved informally and leave no record
- Errors and disputes are common and difficult to resolve

## 2.3 Trigger for This Project

The business has grown to a scale where informal systems can no longer support operational control. The specific triggers are:

- Increasing supplier disputes over delivered quantities with no system evidence
- QC failures reaching customers due to absent formal release controls
- Stock reconciliation taking hours per week due to manual counting
- Inability to answer regulatory or customer traceability questions
- Production yield losses that cannot be investigated due to absent records

---

# 3. Business Objectives

AXIS must achieve the following measurable business outcomes:

| # | Objective | Measure of success |
|---|-----------|-------------------|
| 1 | Eliminate paper-based inbound receiving | 100% of deliveries recorded in AXIS from the day of go-live |
| 2 | Enforce QC gates before production and dispatch | Zero batches enter production or dispatch without a recorded QC approval |
| 3 | Achieve real-time stock visibility | Stock quantities accurate to within 30 minutes of any movement |
| 4 | Enable end-to-end batch traceability | Any finished goods batch traceable to its source delivery within 60 seconds |
| 5 | Create a formal exception management trail | 100% of operational deviations logged and resolved in-system |
| 6 | Reduce stock reconciliation time | Manual stock counts reduced from weekly to monthly verification only |
| 7 | Support supplier dispute resolution | All delivery quantities supported by system records and weighbridge evidence |

---

# 4. Stakeholders

| Role | Name / Title | Responsibility in AXIS |
|------|-------------|----------------------|
| Business Owner | Operations Director | System sponsor; approves business rules and scope |
| Procurement Officer | Procurement Team | Manages inbound delivery planning |
| Receiving Supervisor | Receiving Team Lead | Oversees truck arrival and batch intake |
| Weighbridge Operator | Weighbridge Team | Records all weight readings |
| QC Manager | Quality Control Lead | Owns all QC processes and decisions |
| Production Manager | Production Lead | Plans and releases production orders |
| Production Operators | Production Floor Team | Executes material issues and output recording |
| Warehouse Manager | Warehouse Lead | Manages stock movements and location control |
| Dispatch Supervisor | Dispatch Team Lead | Manages outbound orders and delivery confirmation |
| System Administrator | IT / Admin | User management, master data, system configuration |

---

# 5. Scope

## 5.1 In Scope

The following business processes are within the scope of AXIS Phase 1:

- Inbound delivery planning and truck arrival registration
- Weighbridge reading capture and net weight confirmation
- Raw material batch creation and location assignment
- Raw material quality control (inspection, approval, rejection, hold)
- Stock balance management and movement ledger
- Production order planning, scheduling, and release
- Raw material issue to production
- In-process quality control
- Finished goods batch creation and storage assignment
- Finished goods quality control (release and block)
- Dispatch order creation, batch allocation, and loading confirmation
- Delivery confirmation and proof of delivery recording
- Exception logging, tracking, and resolution
- Audit logging of all critical system actions
- Document attachment against operational records
- Role-based access control for all 9 operational roles

## 5.2 Out of Scope (Phase 1)

The following are explicitly excluded from Phase 1:

- Financial accounting and invoicing
- Supplier payment processing
- Customer billing and credit management
- Payroll and HR management
- Maintenance management and equipment tracking
- Multi-site or multi-plant operations
- Mobile application (web-only in Phase 1)
- Integration with external ERP or accounting systems
- Automated weighbridge hardware integration
- Customer-facing portal or self-service

These may be considered for future phases.

---

# 6. Business Rules

These are the non-negotiable operational rules that AXIS must enforce regardless of who is operating the system.

## 6.1 Inbound Rules

| # | Rule |
|---|------|
| BR-I-01 | A raw material batch cannot be created from a delivery that has not been weighed (status must be `weighed` or later) |
| BR-I-02 | A delivery cannot be approved without at least one QC check recorded against its batches |
| BR-I-03 | A rejected delivery cannot have its batches released to stock |
| BR-I-04 | A delivery on hold cannot be closed without an exception resolution record |
| BR-I-05 | Weighbridge net weight must be a positive decimal value greater than zero |

## 6.2 Quality Control Rules

| # | Rule |
|---|------|
| BR-Q-01 | A raw material batch cannot be released to stock without a QC check with status `approved` |
| BR-Q-02 | A finished product batch cannot be dispatched without a QC check with status `released` (approved) |
| BR-Q-03 | A rejected batch cannot have its status reversed without a new QC check |
| BR-Q-04 | QC checks must be attributed to a named QC officer |
| BR-Q-05 | A rejection must include a rejection reason text — it cannot be blank |
| BR-Q-06 | An in-process QC failure must raise an exception before production can continue |

## 6.3 Stock Rules

| # | Rule |
|---|------|
| BR-S-01 | Stock cannot exist without a batch and a location — unbatched generic stock is not permitted |
| BR-S-02 | Issued quantity cannot exceed available quantity on the batch at the time of issue |
| BR-S-03 | Every stock change must create a corresponding stock movement record |
| BR-S-04 | Blocked stock cannot be issued to production or allocated to dispatch |
| BR-S-05 | Manual stock adjustments must include a reason and automatically raise an exception log |
| BR-S-06 | Reserved stock cannot be issued to a different purpose without releasing the reservation first |

## 6.4 Production Rules

| # | Rule |
|---|------|
| BR-P-01 | A production order cannot be started by an operator unless its status is `released` |
| BR-P-02 | Only approved or released-to-stock raw material batches can be issued to production |
| BR-P-03 | A production order cannot be marked completed without at least one finished batch recorded |
| BR-P-04 | Wastage must be recorded when completing a production order if actual output is below target |
| BR-P-05 | A cancelled production order must reverse any material issues made against it |

## 6.5 Dispatch Rules

| # | Rule |
|---|------|
| BR-D-01 | Only `released` finished batches can be allocated to a dispatch order |
| BR-D-02 | Allocated quantity cannot exceed available quantity on the batch |
| BR-D-03 | A dispatch order cannot be marked `dispatched` without all items having a `quantityLoaded` greater than zero |
| BR-D-04 | A cancelled dispatch order must reverse all batch allocations and reservation movements |
| BR-D-05 | Proof of delivery reference is required to close a dispatch order as `delivered` |

---

# 7. Functional Requirements

These describe what the system must be able to do, expressed as business capabilities.

## 7.1 Inbound / Receiving

- FR-I-01: The system must allow procurement to create expected delivery records before a truck arrives
- FR-I-02: The system must allow receiving to register a truck arrival against a planned delivery
- FR-I-03: The system must allow weighbridge to record multiple weight readings per delivery, distinguishing initial, reweigh, and final readings
- FR-I-04: The system must automatically calculate net weight from gross and tare inputs
- FR-I-05: The system must allow receiving to create raw material batches from weighed deliveries
- FR-I-06: The system must support delivery approval, rejection, and hold with documented reasons

## 7.2 Quality Control

- FR-Q-01: The system must present a QC officer with a pending queue for each check type (raw material, in-process, finished goods)
- FR-Q-02: The system must allow a QC officer to record inspection measurements against any batch or production order
- FR-Q-03: The system must enforce that an approval automatically triggers downstream status changes and stock movements
- FR-Q-04: The system must enforce that a rejection blocks the entity from proceeding and raises an exception
- FR-Q-05: The system must support hold status with a documented reason and a path back to re-inspection

## 7.3 Inventory / Warehouse

- FR-W-01: The system must maintain a real-time stock balance per batch per location
- FR-W-02: The system must maintain a complete movement ledger showing every stock change with type, quantity, actor, and timestamp
- FR-W-03: The system must allow warehouse to transfer stock between locations
- FR-W-04: The system must allow warehouse to perform manual adjustments with a mandatory reason
- FR-W-05: The system must allow warehouse to block and release stock with documented reasons
- FR-W-06: The system must separate available, reserved, and blocked quantity buckets per balance row

## 7.4 Production

- FR-P-01: The system must allow production managers to create, schedule, and release production orders
- FR-P-02: The system must allow production operators to issue specific raw material batches to a production order
- FR-P-03: The system must allow production operators to record multiple finished output batches against one production order
- FR-P-04: The system must track target quantity, issued quantity, actual produced quantity, and wastage per production order
- FR-P-05: The system must support in-process QC checks linked to active production orders

## 7.5 Dispatch

- FR-D-01: The system must allow dispatch to create outbound orders linked to customers
- FR-D-02: The system must allow dispatch to allocate specific released finished batches to dispatch order line items
- FR-D-03: The system must track the lifecycle from draft through allocation, loading, dispatch, and delivery confirmation
- FR-D-04: The system must record proof of delivery reference and receiver name on delivery confirmation
- FR-D-05: The system must support dispatch cancellation with automatic reversal of all batch allocations

## 7.6 Governance

- FR-G-01: The system must allow any user to raise an exception against any operational entity
- FR-G-02: The system must track exceptions from open through review, resolution, and closure
- FR-G-03: The system must automatically generate an audit log entry for every status change and critical action
- FR-G-04: The system must allow file attachments to be uploaded against any operational record
- FR-G-05: The system must provide an audit log view showing before and after values for every change

---

# 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | All standard page loads must complete within 2 seconds under normal operating conditions |
| **Availability** | System must be available during all operational hours (minimum 6am–10pm, 7 days per week) |
| **Data integrity** | All critical operations (approvals, stock movements, dispatch) must execute as atomic transactions — partial saves are not permitted |
| **Security** | Role-based access control must be enforced at the server side — no client-side-only guards |
| **Auditability** | All status changes and quantity modifications must be traceable to a named user with a timestamp |
| **Scalability** | The system must support up to 50 concurrent users without performance degradation |
| **Data retention** | Operational records must be retained for a minimum of 7 years |
| **Browser support** | Must function on current versions of Chrome, Firefox, Edge, and Safari |
| **Authentication** | Session-based authentication with configurable session timeout |

---

# 9. Assumptions

The following assumptions are made in this BRD. If any prove incorrect, requirements may need to be revised.

| # | Assumption |
|---|-----------|
| A-01 | The system will be deployed for a single plant location in Phase 1 |
| A-02 | All users will access the system via a web browser on a desktop or laptop |
| A-03 | The weighbridge does not have a hardware integration — readings will be entered manually by the operator |
| A-04 | There is no requirement to integrate with an external accounting or ERP system in Phase 1 |
| A-05 | Each user will have one role only — dual roles are not required in Phase 1 |
| A-06 | The product master will be set up before go-live and maintained by the admin role |
| A-07 | Storage locations will be set up before go-live and maintained by the admin role |
| A-08 | Internet connectivity is available and reliable at the plant |
| A-09 | The business will provide a dedicated system administrator to manage users and master data |

---

# 10. Constraints

| # | Constraint |
|---|-----------|
| C-01 | The system must be web-based — no native mobile or desktop application is required |
| C-02 | The technology stack is fixed: Node.js backend, PostgreSQL database, Drizzle ORM |
| C-03 | The system must be deployable to a cloud hosting environment |
| C-04 | All data must be stored within the same database — no distributed data stores in Phase 1 |

---

# 11. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| R-01 | Users revert to paper processes during transition | High | High | Training program; management enforcement; system made mandatory from go-live day |
| R-02 | QC role not staffed consistently | Medium | High | Admin can perform QC actions in emergency; exception log captures gaps |
| R-03 | Data entry errors on weighbridge readings | Medium | Medium | isFinal flag requires deliberate confirmation; reweigh capability available |
| R-04 | Internet connectivity failure at plant | Low | High | System should support offline-friendly error messaging and queue retry where possible |
| R-05 | Resistance to batch traceability discipline | Medium | Medium | Management mandate required; system enforces rules at the service layer |

---

# 12. Success Criteria

AXIS will be considered successfully implemented when:

1. All inbound deliveries are planned and received in AXIS with no paper backup process
2. No raw material batch has been released to production without a recorded QC approval
3. No finished goods batch has been dispatched without a recorded QC release
4. Every dispatch order can be traced back to its source delivery within 60 seconds
5. The warehouse team can reconcile stock balances from system records alone without a manual count
6. All exceptions raised in the first 90 days of operation are resolved and closed in-system

---

# 13. Document Sign-off

| Role | Name | Date |
|------|------|------|
| Operations Director | | |
| QC Manager | | |
| Production Manager | | |
| Warehouse Manager | | |
| Dispatch Supervisor | | |
| System Administrator | | |