# Mesael Construction System — Durable Project Context

Last updated: 2026-07-31

Purpose: This file is the persistent source of context for requirements analysis, business architecture, system design, and implementation planning for Mesael. It consolidates the interview metadata, user corrections, organizational analysis, and the current system architecture baseline.

## 1. Authoritative corrections and confirmed facts

- The company name is **Mesael**.
- References to "Messeah" or "Messiah" in generated metadata are incorrect.
- The employee's name is **Yamrot Tufa**.
- References to "Amrot" or "Lamrot" in generated metadata are incorrect. Confirmed from the audio on 2026-07-31.
- Mesael is a construction company based in Ethiopia.
- Mesael is a **sole proprietorship**, not a PLC.
- The Owner/CEO is the ultimate authority and legal proprietor.
- The Deputy General Manager (DGM) also acts as Finance Head.
- The DGM can instruct and supervise Leta.
- The DGM can approve authorized requests when the owner is unavailable.
- The exact monetary thresholds and request categories for DGM approval have not yet been defined.

Do not introduce PLC concepts such as shareholders, share capital, dividends, board voting, or board resolutions unless the company's legal form changes.

### 1.1 Identity resolution across metadata (confirmed 2026-07-31)

The generated metadata uses inconsistent spellings for the same people. Canonical mapping:

| Canonical name | Role | Also appears in metadata as |
|---|---|---|
| **Mesael** | Owner / CEO / General Manager | Misael, Mikael, "Messiah" (company), "the owner" |
| **Dembi** | Deputy General Manager / Finance Head | Dembe, "Dembi (Finance Department)" |
| **Likke** | Reception, hospitality and office support | "Office Cleaner / Receptionist" (name not stated in audio) |
| **Firehiwot** | Office Engineer / Project Coordinator | Frewot, Frehiwot, "Frie", "Fre" |
| **John** | Project Manager | — |
| **Samuel Demeke** | Purchaser | Sami |
| **Leta** | Operational finance | "Senior Financial Analyst", "Finance Lead", "finance head" |
| **Kalkidan Asmamaw** | Accountant | Qal |
| **Yamrot Tufa** | Billing and tax compliance | Amrot Tufa, Lamrot, titled "Auditor" |

Additional confirmations:

- `metadata/fire.txt` describes **two interviewees but only one person**. Firehiwot holds both the Project Coordinator role and the administrative/project-support role. The document should not be read as evidence of two separate employees.
- `metadata/qal - accountatn.txt` calls Leta the "finance head." This is incorrect at the management level: **Dembi** is Finance Head. Leta runs operational finance under Dembi.
- `metadata/lamrot.txt` gives Yamrot's title as "Auditor." Her actual function is **billing and tax compliance**, not independent audit. Use the functional title.
- **John** submitted written input rather than an audio interview because he was on site. This is why `audio/` has no file for him.
- "Mikiyas" / "Miki" in `metadata/qal - accountatn.txt` is **unresolved** — possibly a garbled reference to Mesael, possibly a separate person. Do not assume.
- The receptionist is **Likke**. Her name was not stated in the audio; confirmed by the interviewer on 2026-07-31.
- **Dembi uses he/him.** Generated analysis has previously assumed otherwise.

### 1.2 Interview coverage

Eight people were interviewed during the week of 2026-07-27: Mesael (CEO), Firehiwot, John, Samuel Demeke, Leta, Kalkidan Asmamaw, Yamrot Tufa, and Likke. **Dembi (DGM) has not been interviewed.** This is a material gap: the DGM holds the delegated finance authority that Section 13's open questions depend on.

## 2. Evidence available in the workspace

The workspace contains interview audio under `audio/` and structured interview metadata under `metadata/`.

The metadata covers these functions:

- Owner/CEO
- Project management
- Office engineering and project coordination
- Procurement
- Operational finance
- Accounting
- Billing and tax compliance
- Reception and administrative support

Important data-quality notes:

- The metadata is primarily analytical summaries with selected quotations, workflows, risks, and observations. It is not a complete word-for-word transcript.
- Several stated interview durations do not match the recording durations.
- Names and spellings in generated metadata are not always reliable; user corrections take precedence.
- Some files contain sensitive statements about employees, performance, restructuring, and the owner's health. Access and use should be controlled.
- John has metadata but no matching audio file, because he submitted written input from site instead of sitting for an interview.
- The recordings labelled for Firehiwot and Qal/Kalkidan are split into multiple audio files.

## 3. Current organizational model

Mesael operates as an informal hub-and-spoke organization centered on the Owner/CEO.

```text
Owner / CEO
├── Management Departement
│
├── Deputy General Manager / Finance Head
│   ├── Supervises and can instruct Leta
│   ├── Approves within normal finance authority
│   └── Acts as delegated approver when the owner is unavailable
│
├── Projects and Engineering
│   ├── Office engineering / project coordination
│   ├── Project managers, including John
│   ├── Site engineers and supervisors
│   ├── Internal and external consultants
│   └── Laborers and subcontractors
│
├── Procurement and Asset Operations
│   ├── Samuel — purchasing
│   ├── Suppliers and garages
│   ├── Drivers and equipment operators
│   └── Vehicles, machinery, and rentals
│
├── Finance and office head
│   ├── Leta — operational finance and cash execution
│   ├── Kalkidan — accounting and Peachtree
│   └── Yamrot Tufa — billing and tax compliance
│
└── Administration and Support
    └── Likke — reception, hospitality, errands, and correspondence
```

Major structural gaps or informal functions:

- No properly separated HR department
- Weak or absent centralized inventory/store control
- Weak formal document-control function
- Contract and subcontract administration distributed across several employees
- Procurement, finance, engineering, and administration responsibilities overlap
- CEO involvement extends from executive decisions into routine operational approvals

## 4. Actual responsibilities by person or function

### Owner/CEO

- Identifies opportunities and manages bidding.
- Calculates or approves pricing, overhead, tax, and target profit.
- Manages important client and supplier relationships.
- Approves financial disbursements and confirms bank transactions.
- Reviews project progress, cost, stock, material use, and equipment rentals.
- Performs operational work that should normally be delegated.
- Wants measurable employee-performance information.
- Is a major organizational bottleneck and single point of failure.

### Deputy General Manager / Finance Head

- Heads finance at the management level.
- Can order and supervise Leta.
- Can approve permitted requests under normal authority.
- Can act as substitute approver when the owner is unavailable.
- Must escalate reserved, restricted, or above-threshold decisions to the owner.

### John — Project Manager

- Plans and monitors site construction activities.
- Conducts morning briefings and site inspections.
- Controls schedule, quality, cost, safety, and resource use.
- Coordinates labor, equipment, materials, engineers, and subcontractors.
- Reviews daily plans, tests, inspection requests, and site reports.
- Resolves technical and operational issues.
- Delivers projects to clients according to contract and schedule.

### Office engineering and project coordination

- Receives material, equipment, rental, and payment requests from sites.
- Verifies specifications and follows up with project staff.
- Coordinates purchasers, suppliers, consultants, and finance.
- Helps gather or compare quotations.
- Prepares agreements, letters, reports, and payment documentation.
- Tracks deliveries, machinery rental hours, extensions, and returns.
- Compiles daily project reports from Telegram and other informal channels.
- Absorbs miscellaneous administrative and HR work because role boundaries are weak.

### Samuel — Purchasing

- Collects sealed proformas and supplier quotations.
- Reviews quotations with office engineering and hands them to finance.
- Collects supplier bank information for RTGS payment.
- Purchases and delivers construction materials to sites.
- Coordinates vehicles, servicing, garages, mileage, and spare parts.
- Delivers external letters and tender documents.
- Wants a single accountable procurement channel.

### Leta — Operational finance

- Processes and executes site, supplier, and contractor payments.
- Manages bank transfers, cash, petty cash, and related reconciliation.
- Performs or supports payroll execution.
- Verifies project payment requests and supporting information.
- Posts payment information and voucher references into Telegram finance groups.
- Also performs procurement comparison and office-management work.
- Works under the authority of the DGM/Finance Head and the owner.

### Kalkidan — Accountant

- Checks payment documentation, receipts, proformas, agreements, and vouchers.
- Posts transactions into Peachtree.
- Prepares profit and loss, balance sheet, and accounting reports.
- Prepares tax schedules in Excel for submission by the responsible tax function.
- Organizes physical payment vouchers and documents in box files.
- Frequently records transactions after the fact because site documents arrive late or incomplete.
- Does not primarily control cash or execute payroll.

### Yamrot Tufa — Billing and tax compliance

- Issues official receipts/invoices for project payment stages.
- Distributes invoice copies and coordinates physical originals.
- Aggregates sales and purchase information.
- Files or supports online tax declarations.
- Obtains tax clearances and resolves tax issues.
- Performs billing and tax operations rather than an independent audit function.

### Likke — Reception and administrative support

- Receives and routes visitors.
- Records names, contacts, appointments, and messages.
- Performs cleaning and hospitality duties.
- Purchases minor office consumables and stationery.
- Sometimes performs urgent physical bank errands.
- Has excessive role overlap and creates reception coverage and financial-security risks.

### Site engineers, consultants, supervisors, subcontractors, drivers, and operators

- Site engineers and consultants verify completed work, measurements, quality, tests, and technical documents.
- Subcontractors execute measured project work and request progress payment.
- Supervisors coordinate day-to-day production and labor.
- Drivers and operators use vehicles and equipment, but servicing and utilization controls are weak.

## 5. Current end-to-end operational problems

- Telegram, phone calls, paper, Excel, physical files, and verbal instructions are treated as operational systems.
- Requests are frequently unbudgeted or not linked to project schedules and BOQ activities.
- Supporting documents often arrive after money has been paid.
- Accounting is performed retrospectively using paper vouchers and bank statements.
- Procurement has overlapping ownership and duplicate quotation collection.
- Repetitive proforma requests damage supplier relationships.
- Payments and approvals depend heavily on the owner.
- The Monday-only payment-request practice creates a weekly bottleneck; whether it is formal policy still requires confirmation.
- Vehicle mileage, equipment hours, fuel, servicing, rentals, and returns are not centrally controlled.
- Inventory received, transferred, issued, consumed, and remaining is not reliably reconciled.
- Employee performance is not consistently measured from objective operational data.
- Role boundaries are weak, creating control, security, and accountability problems.

## 6. Governing design principle

Mesael needs a localized **construction operations ERP**, not merely generic accounting software.

The central data spine should be:

```text
Tender and estimate
        ↓
Client contract and project budget
        ↓
Project plan, WBS, and BOQ/cost codes
        ↓
Material / subcontract / rental / expense request
        ↓
Budget validation and delegated approval
        ↓
Procurement or contract execution
        ↓
Delivery, measurement, inspection, or usage confirmation
        ↓
Payment, deductions, and tax treatment
        ↓
Accounting, reconciliation, project cost, and reporting
```

Every operational transaction should carry at least:

- Project and site
- Client contract
- WBS activity or BOQ item
- Budget line and cost code
- Requester
- Material/service/subcontract/equipment classification
- Supporting documents
- Approval history
- Supplier or payee
- Amount, currency, and tax treatment
- Delivery/work/usage confirmation
- Payment and accounting references

Data should be entered once and move through the complete lifecycle without being manually recreated in Telegram, paper, Excel, and Peachtree.

## 7. Required business modules

### 7.1 Core platform and governance

- Company, department, site, and project structure
- Users, employees, and external parties
- Role-based access control
- Configurable approval workflows
- Owner-reserved decisions
- DGM finance authority and substitute approval
- Time-limited delegations
- Thresholds by transaction type, amount, project, and budget status
- Notifications, reminders, and escalation
- Document storage, versioning, and retention
- Immutable audit trail
- Master data and document numbering

The audit record must distinguish a DGM approval made as Finance Head from a DGM approval made under temporary owner delegation.

### 7.2 Commercial, tendering, and client contracts

- Clients, opportunities, and tenders
- Tender deadlines and documents
- Company experience records
- BOQ and cost estimation
- Tax, overhead, and target-profit calculations
- Bid review and approval
- Bid security and tender guarantees
- Client contracts and amendments
- Billing milestones
- Client invoices and collections

### 7.3 Project and site operations

- Project setup and responsibility assignment
- WBS, BOQ, activities, and schedules
- Daily and weekly work plans
- Daily site diaries and reports
- Manpower, equipment, and material utilization
- Progress measurements
- Quality inspections and test results
- Safety inspections and incidents
- RFIs, site instructions, and issues
- Client and consultant correspondence
- Completion, handover, and defect tracking

### 7.4 Project budgeting and cost control

- Baseline budget by BOQ/activity/cost code
- Budget revisions and change orders
- Committed, spent, forecast, and remaining amounts
- Request-to-budget validation
- Duplicate-request detection
- Planned-versus-actual analysis
- Cost-to-complete forecasting
- Price-escalation tracking
- Project cash flow and profitability

No request should reach approval without displaying its project and budget effect.

### 7.5 Procurement and vendor management

- Purchase requisitions and specifications
- RFQs and digital proformas
- Quote comparison and approval
- Approved-vendor list
- Supplier catalog and price history
- Purchase orders
- Delivery and goods receipt
- Rejections and returns
- Supplier invoice matching
- Emergency-procurement workflow
- Vendor performance

### 7.6 Inventory and material control

- Central and site warehouses
- Material catalog and units of measure
- Goods-receiving notes
- Stock transfer, issue, return, damage, and wastage
- Minimum-stock alerts
- Physical stock counts
- Consumption by project and activity
- Purchased-versus-received-versus-issued reconciliation

### 7.7 Subcontract and contract administration

- Subcontractor registry and qualification
- Agreements, scope, rates, and BOQ items
- Advances, retention, and deductions
- Measurements and take-offs
- Inspection and test evidence
- Progress certificates
- Variations
- Payment requests
- Completion and final settlement
- Subcontractor performance history

### 7.8 Fleet, machinery, and rental management

- Vehicle and equipment register
- Ownership/rental status and project assignment
- Mileage, operating hours, and fuel
- Preventive maintenance
- Garages, spare parts, and service history
- Breakdowns and downtime
- Rental agreements, advances, extensions, and returns
- Utilization and cost reconciliation

### 7.9 Finance, accounting, and tax

- Accounts payable and receivable
- Payment requests and vouchers
- Cash, bank, and petty cash
- Maker-checker controls
- Supplier and subcontractor payments
- Client invoicing and collections
- General ledger and project-cost posting
- Bank reconciliation
- Fixed assets and depreciation
- VAT, withholding, employment tax, pension, and other configured taxes
- Tax-clearance tracking
- Financial statements
- Peachtree integration or controlled migration

The same user should not create, approve, pay, and reconcile the same transaction. Owner overrides, if permitted, require an explicit reason and permanent audit record.

### 7.10 HR, workforce, payroll, and performance

- Employee records
- Recruitment and onboarding
- Employment contracts and renewals
- Project/site assignments
- Attendance, leave, and timesheets
- Salary, allowance, overtime, deduction, tax, and pension rules
- Payroll processing and approval
- Training and professional certificates
- Grievance and disciplinary records
- Objective role-based performance indicators
- Manager-reviewed performance evaluations

The system should support human decisions, not automatically determine dismissal or salary increases.

### 7.11 Document, correspondence, and administration

- Incoming/outgoing letters
- Letter numbering and approval
- Tender, contract, project, and finance files
- Visitor registration
- Appointments and messages
- Administrative tasks and follow-up
- Office-supply requests

### 7.12 Executive reporting and analytics

- Project cost and schedule health
- Portfolio profitability
- Cash position and payment aging
- Pending approvals
- Budget exceptions
- Missing supporting documents
- Procurement lead time
- Stock variance
- Equipment utilization and downtime
- Tax and licence deadlines
- Payroll cost
- Verified role-based performance indicators

## 8. Sole-proprietorship-specific requirements

- Maintain an owner capital account.
- Record owner drawings separately from salaries and business expenses.
- Distinguish owner-funded business expenses from normal company payments.
- Do not implement PLC shareholder, share, dividend, board, or director-voting modules.
- Preserve owner-reserved authority while supporting explicit DGM delegation.
- Record who committed the business, under which authority, and within what limit.
- The system reduces operational risk but does not create legal separation or limited liability for the proprietor.

## 9. Ethiopian localization and compliance checklist

The system is expected to support:

- Ethiopian Birr
- Africa/Addis_Ababa timestamps
- Ethiopian and Gregorian dates
- Ethiopian fiscal and tax periods
- Unicode data for Amharic, Afaan Oromo, and English
- Configurable Ethiopian tax types, rates, thresholds, forms, and certificates
- Employment tax and pension processing
- Tax-compliant invoice/receipt references
- Contractor licence category, grade, qualification evidence, and expiry
- Professional certificate and equipment evidence
- Tax clearances
- Public-project securities and guarantees when applicable
- Labour, safety, quality, environmental, and document-retention records
- Low-bandwidth/mobile site access
- Delayed synchronization/offline capture if site connectivity requires it
- Secure backups, access control, and immutable audit history

Legal and tax requirements must be validated against current Ethiopian laws, regulations, directives, federal/regional construction rules, and the company's actual contractor grade. Live public-source verification was unavailable when this context was prepared, so this section is a design and professional-verification checklist, not legal advice.

## 10. Construction contract controls that may be required

Depending on the client and project type:

- Bid security
- Performance guarantee
- Advance-payment guarantee
- Insurance policies and expiry
- Interim payment certificates
- Advance recovery
- Retention
- Variations and change orders
- Price adjustment
- Extension of time
- Claims
- Liquidated damages
- Taking-over certificate
- Defect-liability period
- Final account
- Guarantee release

These are business records and workflows, not merely uploaded documents.

## 11. Recommended technical direction (not yet an approved implementation decision)

Current recommendation: begin with a modular monolith rather than microservices.

```text
Head-office web application + mobile/PWA for sites and approvers
                              │
                     Central application/API
                              │
       Modular domains with explicit data and rule ownership
                              │
       PostgreSQL + document/object storage + audit/outbox
                              │
 Peachtree, tax, bank, email/SMS, and messaging integration adapters
```

Telegram may remain a notification channel during transition, but official requests, approvals, documents, and audit records must reside in the system.

## 12. Recommended implementation order

1. Organization, roles, permissions, DGM delegation, documents, and audit controls.
2. Project setup, WBS/BOQ, budgets, and cost codes.
3. Digital requests, attachments, approvals, exceptions, and mobile access.
4. Procurement, goods receipt, inventory, subcontracts, and rentals.
5. Finance workflow and controlled Peachtree integration.
6. Billing, tax, payroll, fleet, performance, and advanced reporting.
7. Further automation and external integrations after core data quality is stable.

## 13. Important unresolved questions

- Exact DGM approval categories, monetary ceilings, and delegation conditions
- Owner-reserved decision categories
- Whether the Monday-only payment rule is official policy
- Petty-cash limits and replenishment rules
- Project-manager and site-engineer spending authority
- Contractor category, grade, issuing authority, and renewal requirements
- Federal versus regional project/licensing obligations
- Whether Peachtree will remain the statutory ledger or be replaced
- Required tax types, current rates, filing formats, and fiscal periods
- Bank integration capabilities and confirmation controls
- Warehouse and site-store structure
- Payroll rules, allowances, overtime, and pension details
- Internet reliability at each construction site
- Required UI languages
- Formal responsibilities and canonical spellings for personnel whose metadata is ambiguous
- Public-sector contract forms and guarantee requirements used by Mesael
- Data migration scope from Telegram, Excel, Peachtree, and physical files

## 14. Current primary finding

Mesael's core problem is not the absence of accounting software. It is the disconnected control of projects, budgets, requests, approvals, supporting documents, procurement, stock, subcontractors, assets, payments, and accounting.

The system must correct the operating model rather than reproduce the current Telegram-and-paper process on a screen.
