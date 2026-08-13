# Mesael Construction — Finance Function

## In-Depth As-Is Analysis, Task Catalogue, and Process Completion Definitions

| | |
|---|---|
| **Document** | Finance Module Analysis |
| **Version** | 1.0 |
| **Date** | 2026-08-09 |
| **Status** | Pre-contract analysis — prepared for the Owner/CEO |
| **Prepared from** | 10 audio recordings, 8 interview write-ups, 1 written submission, and the consolidated project context |
| **Scope** | The finance function only — money in, money out, and the records that prove both |
| **Related documents** | `MESAEL_SYSTEM_CONTEXT.md`, `SRS_v1.0.md` (Module 09), `Mesael-System-Architecture.html` |

---

## 0. How to read this document

### 0.1 What the CEO asked for

Finance was named as the area of greatest pain. This document answers three questions, in order:

1. **What does the finance function actually do today?** Not what the org chart says — what the eight
   interviews describe people actually doing.
2. **What is the complete list of tasks the finance function performs?** Named, numbered, owned.
3. **For each task, what is the exact sequence of actions that must happen before that task can be
   called finished?** This is the part that matters most. Today, almost no finance task at Mesael has
   a defined end state. A payment "finishes" when the money leaves — but the receipt, the delivery
   confirmation, the voucher, and the ledger entry arrive weeks later, or never. Section 7 defines,
   for every finance task, a *Definition of Done*: the precise list of system actions after which the
   task is closed and cannot silently remain half-complete.

### 0.2 What this document is not

- It is not a price quotation or a project plan.
- It is not legal or tax advice. Ethiopian tax types, rates, thresholds and filing deadlines appear
  here as **configuration placeholders** that must be validated against current law and against
  Mesael's actual filings before build.
- It does not invent facts. Where the interviews are silent, this document says so explicitly rather
  than filling the gap with a plausible guess.

### 0.3 Confidence legend

Every material statement in this document carries one of four markers.

| Marker | Meaning |
|---|---|
| **[C]** | **Confirmed.** Stated directly in an interview, or confirmed by the interviewer in `MESAEL_SYSTEM_CONTEXT.md`. |
| **[I]** | **Inferred.** Follows logically from two or more confirmed statements, but nobody said it outright. |
| **[A]** | **Assumption.** A design decision we have taken in the absence of an answer. Every one of these is listed in Section 10 and needs a yes/no from Mesael or Dembi. |
| **[G]** | **Gap.** We do not know, and could not know from the material available. Listed in Section 10.3. |

### 0.4 A note on names

The generated interview write-ups spell the same people several different ways. This document uses
the canonical names confirmed in `MESAEL_SYSTEM_CONTEXT.md` §1.1 throughout:

| Canonical | Role | Appears in the raw metadata as |
|---|---|---|
| **Mesael** | Owner / CEO / General Manager | Misael, Mikael, Mikiyas (unresolved), "the owner", "Messiah" (company) |
| **Dembi** | Deputy General Manager / Finance Head | Dembe, "Dembi (Finance Department)" |
| **Leta** | Operational finance | "Senior Financial Analyst", "Finance Lead", "finance head" |
| **Kalkidan Asmamaw** | Accountant | Qal |
| **Yamrot Tufa** | Billing and tax compliance | Amrot Tufa, Lamrot, titled "Auditor" |
| **Firehiwot** | Office Engineer / Project Coordinator | Frehiwot, Frewot, "Frie", "Fre" |
| **Samuel Demeke** | Purchaser | Sami |
| **John** | Project Manager | — |
| **Likke** | Reception and office support | "Office Cleaner / Receptionist" |

Two corrections carried forward from the context file and applied throughout:

- `metadata/qal - accountatn.txt` calls Leta the "finance head". **This is wrong at the management
  level.** Dembi is Finance Head; Leta runs operational finance underneath. [C]
- `metadata/lamrot.txt` gives Yamrot's title as "Auditor". Her actual function is **billing and tax
  compliance**. Mesael currently has **no independent internal audit function at all**. [C] This is a
  finance finding in its own right — see F-13.

---

## 1. Evidence base

### 1.1 What each source contributed to the finance picture

| Source | Role | Format | Finance content contributed |
|---|---|---|---|
| `metadata/Mesael CEO.txt` | Owner/CEO | ~10 min audio | Approval centralisation, bank confirmation by phone, bid pricing and margin method, turnover and wage scale, price-escalation losses, stock reconciliation |
| `metadata/leta.txt` | Operational finance | ~6 min 45 s audio | The payment execution chain end to end, petty cash operation, price comparison, PV coding, Telegram posting, approval bottleneck |
| `metadata/qal - accountatn.txt` | Accountant | ~7 min, 3 clips | Document verification, PV cutting, Peachtree posting cadence, box-file archive, tax schedule preparation, the late-documents problem |
| `metadata/lamrot.txt` | Billing & tax | ~2 min 20 s audio | Official receipt issuance against contract stages, receipt distribution, cheque collection via runner, monthly sales/purchase aggregation, online declaration, tax clearance |
| `metadata/sami-purchase.txt` | Purchaser | ~9 min audio | Proforma collection and sealing, RTGS payment mechanics, petty cash ceiling range, garage/servicing payments, supplier fatigue |
| `metadata/fire.txt` | Office Engineer / Coordinator | ~13 + ~23 min audio | Request intake, price cross-checking, subcontractor payment file assembly, machinery rental advances, the Monday rule, unbudgeted requests |
| `metadata/john Pm` | Project Manager | Written submission | Site cost monitoring, resource coordination, daily reporting — the upstream of every payment request |
| `metadata/reception.txt` | Reception | ~2–3 min audio | Urgent bank runs, office consumable purchasing, visitors arriving for payments |

### 1.2 The one gap that matters most

**Dembi — Deputy General Manager and Finance Head — has not been interviewed.** [C]

He is the single most important person in the finance function after Mesael himself. He appears in
three separate interviews as an active financial actor:

- Mesael names him as the person who "processes finance directions given by the owner; interacts with
  banks for disbursements". [C]
- Yamrot names him as one of only three people who can instruct her to issue an official receipt —
  "from Misael, from Dembe, from Leta… the order comes from one of these three". [C]
- Firehiwot describes subcontractor payment approvals being sent via Telegram **simultaneously to the
  General Manager and the Deputy General Manager**. [C]

So Dembi holds real approval and execution power, and none of it is documented from his own mouth.
Every statement in this document about approval ceilings, delegation, and substitute authority is
therefore second-hand. We have handled this by making all authority **configuration rather than code**
— see Section 10.4. The analysis below stands without him; the *numbers* inside the approval matrix do
not, and must be set with him before go-live.

---

## 2. The finance function as it actually exists

### 2.1 There is no finance department — there is a finance chain

Mesael has finance *people*, but not a finance *department* in any structural sense. What exists is a
chain of five individuals with overlapping and undocumented boundaries, all terminating at the Owner.

```text
                        ┌──────────────────────────────┐
                        │   MESAEL — Owner / CEO       │
                        │   Every disbursement stops    │
                        │   here. No exceptions. [C]    │
                        └───────────────┬──────────────┘
                                        │
                        ┌───────────────┴──────────────┐
                        │   DEMBI — DGM / Finance Head │
                        │   Co-approver, bank contact,  │
                        │   receipt-issuance authority  │
                        │   NOT INTERVIEWED [G]         │
                        └───────────────┬──────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
┌───────┴────────┐           ┌──────────┴─────────┐          ┌──────────┴─────────┐
│ LETA           │           │ KALKIDAN           │          │ YAMROT             │
│ Operational    │           │ Accountant         │          │ Billing & tax      │
│ finance        │           │                    │          │                    │
│ • executes     │           │ • verifies docs    │          │ • cuts official    │
│   transfers    │           │ • cuts PVs         │          │   receipts         │
│ • petty cash   │           │ • posts Peachtree  │          │ • VAT / sales &    │
│ • payroll      │           │ • P&L, BS          │          │   purchase filing  │
│ • verifies     │           │ • tax schedules    │          │ • tax clearance    │
│   requests     │           │   in Excel         │          │ • liaises with     │
│ • selects      │           │ • box files 1–7    │          │   Revenues office  │
│   vendors (!)  │           │                    │          │                    │
└────────────────┘           └────────────────────┘          └────────────────────┘
        │                               │                               │
        └───────────────────────────────┴───────────────────────────────┘
                                        │
                    Feeders who are not finance staff but
                    control finance-critical inputs:
                    FIREHIWOT (request intake, file assembly)
                    SAMUEL (proformas, supplier bank details)
                    JOHN / site engineers (measurement, receipts)
                    LIKKE (physical bank runs) ← control risk
```

### 2.2 Who actually does what — stated title versus real finance authority

| Person | Official title | Finance work actually performed | Authority actually exercised | Authority formally documented |
|---|---|---|---|---|
| Mesael | Owner / CEO | Approves every disbursement; confirms every bank transfer by phone; sets bid prices, tax loading, overhead and target margin; reconciles stock and rental usage against reports | Unlimited [C] | Implicit — sole proprietor |
| Dembi | DGM / Finance Head | Processes owner's finance directions; interacts with banks; co-approves subcontractor payments; can instruct receipt issuance | Substantial [C] | **None found** [G] |
| Leta | Operational finance | Verifies requests against schedules and performance reports; converts to payment request format; executes bank transfers; runs petty cash; performs or supports payroll; posts PV codes to Telegram; **also selects vendors on price** | Execution + de facto selection [C] | **None found** [G] |
| Kalkidan | Accountant | Checks attachments against agreements and prices; cuts cash payment vouchers from bank statements; posts to Peachtree; prepares P&L, balance sheet, tax schedules; maintains box files 1–7 | Verification only, no disbursement [C] | Implicit |
| Yamrot | "Auditor" (actually billing & tax) | Issues official receipts against contract payment stages; distributes copies; aggregates monthly sales and purchases; files online declarations; obtains tax clearances; resolves assessments in person | Issues company revenue documents on verbal instruction [C] | **None found** [G] |
| Firehiwot | Office Engineer / Coordinator | Receives site requests; cross-checks prices; collects secondary quotes; assembles subcontractor payment files with inspection and test results; manages rental agreements and advances | Gatekeeper over what reaches finance [C] | **None found** [G] |
| Samuel | Purchaser | Collects sealed proformas; obtains supplier bank details for RTGS; collects bank receipts; pays garages by mobile banking | Commits company to suppliers in practice [C] | **None found** [G] |
| Likke | Reception / office support | Performs urgent physical bank transactions; buys office consumables | **Handles company money with no finance role** [C] | None — and should not have any |

**The pattern:** every person in the chain except Kalkidan exercises more financial authority than they
have been formally granted, and nobody's limit is written down anywhere. [I]

### 2.3 The unresolved "Mikiyas"

Kalkidan describes Leta "communicating directly with Mikiyas or bank statements" when executing
payments. Mesael separately describes "verifying through staff members like Dembi and **bank agents**".

Two readings are possible and we are not choosing between them without confirmation:

- **Reading A:** "Mikiyas" is a garbled rendering of "Mesael" in the transcription. [I]
- **Reading B:** "Mikiyas" is Mesael's named relationship manager or agent **at the bank** — which
  would neatly explain both Kalkidan's and Mesael's statements. [I]

Reading B is the more interesting one for us, because if a named individual at the bank is part of the
payment execution path, that is an external dependency the system must model (see FIN-TRE-03). **This
must be resolved before build.** [G] It is question Q18 in the SRS.

---

## 3. The money map

Before defining tasks, we mapped every route by which money enters and leaves Mesael, because the task
list has to cover all of them or it is not a finance module.

### 3.1 Money in

| # | Inflow | Instrument | Trigger | Who touches it | Recorded where today |
|---|---|---|---|---|---|
| IN-1 | Client advance payment | Cheque [C] | Contract signature + advance guarantee | Yamrot issues receipt → runner delivers → collects cheque | Paper receipt book, Peachtree later |
| IN-2 | Client progress payment (1st, 2nd, 3rd…) | Cheque [C] | Payment stage reached under contract | Same as above | Same |
| IN-3 | Retention release | [G] Not discussed | Defect liability expiry | [G] | [G] |
| IN-4 | Owner capital injection | [G] Not discussed | Owner decision | Mesael | [G] — must be separable |
| IN-5 | Rental / equipment income (if Mesael rents out) | [G] Not discussed | — | — | [G] |
| IN-6 | Sale of scrap / surplus material | [G] Not discussed | — | — | [G] |

> **Finding:** the interviews describe inflow almost entirely as *government client cheques collected by
> a physical runner against a hand-delivered paper receipt*. [C] There is no described process for
> retention release, no described treatment of owner capital, and no described receivables ageing.
> The company knows what it billed; it is not clear that it systematically knows **what it is owed and
> how old that debt is**. [I]

### 3.2 Money out

| # | Outflow | Instrument | Approver today | Volume/scale evidence |
|---|---|---|---|---|
| OUT-1 | Supplier / material purchase | RTGS bank transfer [C] | Mesael, after Firehiwot → Leta chain | "practically all material and service purchasing is executed via RTGS" [C] |
| OUT-2 | Subcontractor progress payment | Cheque or transfer [C] | GM **and** DGM in parallel via Telegram [C] | Measured work, DB percentage sheets [C] |
| OUT-3 | Machinery / equipment rental advance | Transfer [C] | Mesael [C] | **100% advance against estimated hours** [C] |
| OUT-4 | Payroll | [G] instrument unstated | Mesael [I] | "6 to 8 million Birr in wages" per period [C] |
| OUT-5 | Petty cash disbursement | Physical cash [C] | Leta [C] | Ceiling cited as ETB 50,000–60,000 [C] |
| OUT-6 | Vehicle / machinery servicing | Mobile banking [C] | Samuel, in practice [C] | ETB 15,000 example servicing fee [C] |
| OUT-7 | Tax payments and settlements | [G] | Yamrot executes, authority unstated | Monthly [C] |
| OUT-8 | Urgent bank run | Cash / branch transaction [C] | Finance dispatches Likke [C] | "if cars or machinery are stopped, we go immediately to the bank" [C] |
| OUT-9 | Office consumables and stationery | Office cash [C] | Informal [C] | Small, frequent [C] |
| OUT-10 | Owner drawings | [G] Not discussed | Mesael | **Currently indistinguishable from business expense** [I] |

### 3.3 The leakage surface

Combining the two tables above gives the set of routes by which value can leave Mesael **without a
reliable system record being created at the moment it leaves**:

1. **Mobile-banking garage payments by the purchaser** — outside petty cash, outside RTGS, approved by
   nobody in the described chain. [C]
2. **Urgent bank runs by reception staff** — a non-finance employee physically moving company money
   under verbal instruction. [C]
3. **Petty cash disbursed before documentation** — receipts arrive later, "balance the box back to
   zero" is a daily cash count, not a documented-expense reconciliation. [C]
4. **100% rental advances against *estimated* hours** — with no described reconciliation against actual
   hours, over-advance is invisible. [C][I]
5. **Payments released before supporting documents arrive** — Kalkidan: "payments are made so work
   doesn't stall, but the receipts and agreements aren't provided on time. We end up chasing them after
   the money is already spent." [C]
6. **Duplicate requisitions** — Kalkidan: "you might see them requesting the exact same item today that
   was bought yesterday." [C]
7. **Urgent purchases bypassing the 3-proforma rule** — Leta: "we are forced to buy directly just to
   keep work going, even if it creates issues with approvals later." [C]
8. **Office consumable purchasing by reception against office cash** — no described control. [C]
9. **Owner drawings mixed with business expenditure** — no described separation. [I]
10. **Price escalation absorbed silently** — Mesael describes fuel price jumps eroding margin because
    "field reporting is delayed and unquantified". [C]

Every one of these ten is addressed by a specific task and a specific control in Section 7. The
cross-reference is in Section 8.4.

---

## 4. As-is process walkthroughs

Six processes carry essentially all of Mesael's finance activity. Each is walked through below exactly
as the interviews describe it, with the stall points marked.

### 4.1 Process W1 — Site material request to supplier payment

This is the highest-volume finance process in the company.

| Step | Actor | Action | Medium | Elapsed |
|---|---|---|---|---|
| 1 | Site PM / site engineer | Identifies material need, generates a schedule/request | Telegram message [C] | — |
| 2 | Firehiwot | Receives request, checks details, communicates back to site on specs/brand | Telegram, phone [C] | Hours–days; **lags when brand is specified and unavailable** [C] |
| 3 | Firehiwot | Passes to Samuel, **or collects quotes herself if "urgent"** | Phone [C] | — |
| 4 | Samuel | Visits suppliers, collects **sealed** proformas — 3–4 for standard material, 10–20 for unfamiliar machinery | Paper [C] | Days |
| 5 | Samuel + Firehiwot | Open the sealed proformas **together** and compare | Paper, in person [C] | Same day |
| 6 | Leta / Finance | Receives proformas, **selects the lowest/best price** | Paper [C] | — |
| 7 | Leta | Converts to formal proforma/payment request format | Paper [C] | — |
| 8 | Mesael | Reviews and signs, **or authorises verbally by phone if off-site** | Paper signature or phone call [C] | **The stall. Hours to weeks.** [C] |
| 9 | Samuel | Obtains supplier bank account details, hands to finance | Paper [C] | — |
| 10 | Leta | Executes RTGS transfer | Online/mobile banking [C] | — |
| 11 | Mesael | **Confirms the bank transfer by phone** | Phone call [C] | — |
| 12 | Samuel | Collects bank receipt, receives goods, delivers to site | Physical [C] | Days |
| 13 | Site | Confirms receipt in the Telegram group | Telegram [C] | Often lags [C] |
| 14 | Leta | Merges agreement + payment request + receipt, assigns PV code, posts to finance Telegram group | Telegram + paper [C] | — |
| 15 | Kalkidan | Verifies attachments against agreement and prices | Paper [C] | Later |
| 16 | Kalkidan | Cuts PV from bank statement, files in box file | Paper [C] | Later |
| 17 | Kalkidan | Posts into Peachtree | Peachtree [C] | **Monthly or every 1–2 months** [C] |

**Where W1 breaks:**

- **Step 3 is a fork with two owners.** Samuel: *"If Frie is collecting, then where is Sami? Since she
  gathered it, why should I follow up on it? At that moment, we can't deliver goods to the site."* [C]
  The urgent path and the standard path are the same request with different owners, and nobody
  arbitrates. Goods stop moving while two people each assume the other is following up.
- **Step 4 damages supplier relationships.** Samuel: *"If you lose a customer you had for over 4 or 5
  years, next time when you ask for a proforma, they won't write it for you because of repeated
  rejections due to price competition."* [C] The company is burning long-term supplier goodwill to
  re-price commodity items like cement and rebar on every single purchase.
- **Step 6 puts vendor selection inside finance.** The person who selects the vendor is the person who
  executes the payment. That is a segregation-of-duties failure, not a workflow preference. [I]
- **Step 8 is the bottleneck the whole company complains about.** Leta: *"The biggest delay we face is
  in payment approvals — everything has to pass through top management signatures, even when the work
  on site is already verified."* [C]
- **Step 11 is a security exposure.** Bank transfers are confirmed by *voice over the phone*. Whether
  a formal bank token exists is explicitly unknown. [G] Mesael's own interview flags this as needing
  clarification for payment integration.
- **Steps 15–17 happen weeks after step 10.** The accounting record trails the cash movement by up to
  two months. [C]
- **The whole chain has no budget check anywhere in it.** Not one of the seventeen steps validates the
  request against a project budget line. [C — by absence across all interviews]

### 4.2 Process W2 — Subcontractor progress payment

| Step | Actor | Action | Medium |
|---|---|---|---|
| 1 | Subcontractor | Completes a work phase | — |
| 2 | Site engineer | Creates the payment request | Paper/Telegram [C] |
| 3 | Project Manager | Reviews against the agreement and agreed rates | [C] |
| 4 | Firehiwot / admin | Routes request **simultaneously to GM and DGM** for approval | **Telegram** [C] |
| 5 | Internal consultant | Prepares payment sheets with DB percentage calculations | Excel/paper [C] |
| 6 | Firehiwot / admin | Attaches inspection results and test results, compiles the file | Paper [C] |
| 7 | Firehiwot / admin | Submits to finance — **only on a Monday** [C] | Physical handoff |
| 8 | Leta | Verifies contractor work against performance reports from engineers | Paper [C] |
| 9 | Mesael | Approves | Signature or phone [C] |
| 10 | Leta | Executes payment | Transfer/cheque [C] |
| 11 | Kalkidan | Verifies documents, cuts PV, files, posts to Peachtree | Peachtree [C] |

**Where W2 breaks:**

- **Step 4 sends a financial approval into a chat application, to two people at once.** [C] Nobody can
  later prove who approved first, whether both approved, whether either read the attachments, or
  whether the message was edited. Firehiwot's own file flags this: *"heavy reliance on unstructured
  Telegram messaging for critical financial approvals (routed to both the GM and DGM) creates audit
  trail blind spots."* [C]
- **Step 5 places a critical financial calculation with an internal consultant** operating "far beyond
  a standard advisory boundary". [C] The DB percentage sheet determines how much money leaves the
  company, and it is prepared outside the finance function entirely.
- **Step 7 is the Monday rule.** All payment requests for the entire company funnel into one weekday.
  Firehiwot: *"Everything piles up for Monday because that's the only day payment requests are
  accepted. It becomes chaotic."* [C] Whether this is official policy or a coping mechanism invented
  by administrative staff is **explicitly unresolved**. [G] It is SRS question Q4, and it matters: if
  it is policy, the system encodes a payment run calendar; if it is a coping mechanism, the system
  removes it entirely and the weekly surge disappears.
- **No retention, no advance recovery, no withholding tax step appears anywhere in this process.** [C —
  by absence] Ethiopian construction subcontracts normally carry retention and advance recovery, and
  supplier/subcontractor payments normally carry withholding. None of the three appears in any
  interview description of the payment calculation. Either they are being handled invisibly inside the
  consultant's Excel sheet, or they are not being handled. **This is the single most valuable question
  we can put to Dembi.** [G]

### 4.3 Process W3 — Machinery and equipment rental

| Step | Actor | Action |
|---|---|---|
| 1 | Site PM | Requests machinery via Telegram [C] |
| 2 | Firehiwot | Processes specs, sources lessor, prepares the rental agreement [C] |
| 3 | Firehiwot | Signs the agreement — *"I am the one representing the company signing the agreement"* [C] |
| 4 | Finance | Pays a **100% advance based on estimated hours** [C] |
| 5 | Site | Uses the machine; hours accumulate against thresholds such as 200/300 hours [C] |
| 6 | Firehiwot | Manages extensions and the final return [C] |
| 7 | — | **Reconciliation of advance against actual hours: not described by anyone** [G] |

**Where W3 breaks:**

This process contains the largest single financial exposure we found, and it is almost entirely
invisible.

- Money leaves **in full, in advance, against an estimate**. [C]
- Actual hours are tracked informally and with difficulty — Firehiwot lists "hardships in tracking
  exact operating hours and managing extensions or returns before rental agreements expire" as a named
  pain point. [C]
- The mechanism for resolving hour disputes between site managers and lessors is explicitly unclear.
  [G]
- Therefore: if the machine works fewer hours than estimated, **there is no described process that
  recovers the difference**. [I] The company pays for hours it never receives, and the loss is
  structurally undetectable.

Mesael's own complaint about "unbudgeted operational losses due to weak internal cost tracking" [C] is
very likely being fed by exactly this. We flag it as the highest-value finance quick win in Section 11.

### 4.4 Process W4 — Petty cash and the urgent bank run

| Step | Actor | Action |
|---|---|---|
| 1 | Requester | Needs small/urgent cash — site transport, ride fees, urgent fuel [C] |
| 2 | Leta | Disburses from the physical petty cash box [C] |
| 3 | Recipient | Spends, brings back a paper receipt (*negeye*) [C] |
| 4 | Leta | Produces daily/regular reports to **"balance the cash box back to zero"** [C] |
| 5 | Kalkidan | Eventually receives the vouchers for posting [C] |

Parallel emergency path:

| Step | Actor | Action |
|---|---|---|
| E1 | Finance | Identifies an urgent payment blockage — *"if cars or machinery are stopped"* [C] |
| E2 | Finance | Dispatches **Likke (reception)** to the bank branch [C] |
| E3 | Likke | Performs the transaction physically |
| E4 | — | If Likke is unavailable, finance staff go themselves [C] |
| E5 | — | **How the cash is requested, handed over, and reconciled is explicitly not detailed** [G] |

**Where W4 breaks:**

- **The petty cash ceiling is unknown.** Samuel cites ETB 50,000–60,000 as the range at which petty
  cash becomes "insufficient or impractical" [C], and Leta's file explicitly lists "clarification
  needed on the precise threshold amount that separates petty cash expenditures from formal bank
  transfer requests" as an open question. [G] Two people in the same company do not agree on where the
  petty cash line is.
- **"Balancing to zero" is a cash count, not a reconciliation.** Counting that cash-in-box plus
  vouchers equals the float proves the money is accounted for physically. It does not prove the
  expenditure was authorised, coded to a project, or supported by a valid tax receipt. [I]
- **Using reception for bank transactions is a genuine control failure**, not a quirk. Likke's own file
  flags it: *"Utilizing reception/custodial staff for emergency bank transactions presents an
  operational risk and security blur."* [C] It exposes the company to loss, to dispute, and to the
  employee herself being blamed for a discrepancy she has no means to defend against.
- **Samuel's mobile-banking garage payments sit outside this process entirely** [C] — a third cash
  channel that neither petty cash nor RTGS governs.

### 4.5 Process W5 — Client billing and collection

| Step | Actor | Action |
|---|---|---|
| 1 | Mesael **or** Dembi **or** Leta | Instructs Yamrot to issue a receipt — *"from Misael, from Dembe, from Leta… the order comes from one of these three"* [C] |
| 2 | Yamrot | Checks the contract terms to determine the payment stage — advance, 1st, 2nd, 3rd [C] |
| 3 | Yamrot | Cuts the formal receipt stating the exact payment type and stage [C] |
| 4 | Yamrot | Emails digital copies back to all three instructors [C] |
| 5 | Yamrot | Routes the **original physical receipt** to the site or client office (e.g. Mojo site) [C] |
| 6 | Runner | For government contracts, delivers the original to the client office and **receives the payment cheque** [C] |
| 7 | Runner | Brings the cheque back to the company [C] |
| 8 | Finance | Deposits it [I — not described] |
| 9 | Kalkidan | Records the sale eventually, from bank statement [C] |

**Where W5 breaks:**

- **Revenue is triggered by a verbal instruction, not by a contract milestone.** [C] Three different
  people can independently start the billing process. Nothing in the described process checks whether
  the milestone was actually certified, whether that stage has already been billed, or whether the
  amount matches the contract. Yamrot's own file recommends exactly this fix: *"billing triggers should
  be automatically generated upon project milestone completions rather than relying on informal manual
  requests."* [C]
- **Duplicate or missed billing is possible and would be hard to detect.** [I] If two of the three
  instructors independently ask for the same stage receipt, nothing prevents it.
- **A cheque is physically carried by an unnamed runner.** The identity of this person is an explicit
  open question in Yamrot's file. [G] This is company revenue in transit with no described custody
  record.
- **There is no described receivables register.** Nothing tracks "we billed stage 2 on this date, the
  client has not paid, it is now 47 days old". [I] For a company working predominantly with government
  clients — who are typically slow payers — this is a serious blind spot, and it connects directly to
  the cash pressure that forces urgent bank runs and pushes payment approvals into a weekly batch.

### 4.6 Process W6 — Month-end: Excel, the tax portal, and Peachtree

| Step | Actor | Action |
|---|---|---|
| 1 | Site staff | Type site purchase receipts into local Excel sheets [C] |
| 2 | Site staff | Email the Excel sheets to Yamrot [C] |
| 3 | Yamrot | Aggregates total monthly **sales and purchases** in Excel [C] |
| 4 | Yamrot | "Closes" the month and declares the figures on the Revenues Authority online portal [C] |
| 5 | Kalkidan | Separately prepares monthly tax schedules in Excel from Peachtree data [C] |
| 6 | Kalkidan | Batch-posts accumulated PVs, receipts and bank statements into Peachtree — monthly, or every 1–2 months [C] |
| 7 | Kalkidan | Produces P&L and balance sheet [C] |
| 8 | Yamrot | Applies for tax clearances; travels to the tax office to correct errors [C] |
| 9 | Internal auditor → external auditor | Review [C — role named by Kalkidan] |

**Where W6 breaks:**

- **The same underlying transaction is typed by hand at least three times**: on paper at site, into
  site Excel, and into Peachtree — and a fourth time into the tax portal. [C] Every re-keying is an
  error opportunity and none of the four copies is authoritative.
- **Two parallel tax preparations exist.** Yamrot aggregates sales and purchases from *site Excel
  sheets*; Kalkidan prepares tax schedules from *Peachtree*. These are two different data lineages for
  the same statutory numbers, and nothing described reconciles them. [I] If they disagree, nobody
  necessarily finds out.
- **Peachtree is up to two months behind reality.** [C] Which means the P&L and balance sheet Mesael
  might use to make a decision in, say, week 3 of a month describe a company that existed six to eight
  weeks earlier.
- **Kalkidan names an internal auditor in the review chain** [C], but Yamrot — the person titled
  "Auditor" — performs no audit. [C] Whether an actual independent internal audit function exists is
  unresolved. [G] This is SRS question Q10.

---

## 5. Structural findings

Fourteen findings, each traceable to interview evidence, each mapped to the tasks that resolve it.

| # | Finding | Evidence | Consequence | Resolved by |
|---|---|---|---|---|
| **F-01** | **Every disbursement requires the Owner personally.** *"If I am not present to confirm it, no money goes out."* | Mesael [C], Leta [C], Firehiwot [C] | The company's payment capacity equals one person's availability. Mesael reports it is affecting his health. | FIN-GOV-01/02/03 |
| **F-02** | **Money moves before documents arrive.** *"Payments are made so work doesn't stall, but the receipts and agreements aren't provided on time."* | Kalkidan [C] | The accounting record is a reconstruction, not a record. Tax and audit exposure. | FIN-P2P-05, FIN-GLR-01, universal attachment gate |
| **F-03** | **No request is validated against a budget.** *"On material requests, they don't link it to the budget. You might see them requesting the exact same item today that was bought yesterday."* | Kalkidan [C], Firehiwot [C] | Overspend is discovered after the fact, if at all. Duplicate purchases are paid for. | FIN-BCC-02/03/04 |
| **F-04** | **Segregation of duties has collapsed in operational finance.** Leta verifies the request, selects the vendor, approves the disbursement mechanics, hands out the cash, and posts the reference. | Leta [C], own file flags it [C] | One person can originate and complete a payment. No compensating control exists. | Section 6 matrix; FIN-GOV-04 |
| **F-05** | **Financial approvals live in Telegram.** Subcontractor payments are sent to GM and DGM simultaneously by chat. | Firehiwot [C] | No provable approval record. Messages can be edited or deleted. Cannot be produced to an auditor. | FIN-GOV-02, all approval steps |
| **F-06** | **Bank transfers are authorised by voice.** Mesael confirms transfers by phone; whether a bank token is used is unknown. | Mesael [C][G] | Impersonation risk; no non-repudiable authorisation record. | FIN-TRE-03 |
| **F-07** | **100% rental advances against estimated hours, with no reconciliation.** | Firehiwot [C], gap [G] | Structurally undetectable overpayment on every rental. | FIN-RNT-01…05 |
| **F-08** | **Peachtree runs 1–2 months behind.** | Kalkidan [C] | No reliable current financial position. Decisions made on stale numbers. | FIN-GLR-03/06 |
| **F-09** | **The Monday-only rule concentrates all payment work into one day.** Status as policy vs. coping mechanism unknown. | Firehiwot [C][G] | Weekly surge, staff stress, avoidable delay, and it pushes urgent needs into the informal channels. | FIN-P2P-03, FIN-TRE-02 |
| **F-10** | **Petty cash has no agreed ceiling.** Cited as 50,000–60,000 by one person, listed as an open question by another. | Samuel [C], Leta [G] | The boundary between petty cash and formal transfer is negotiable in practice, which means it is not a control. | FIN-PCH-01…04 |
| **F-11** | **Non-finance staff move company money.** Reception performs urgent bank transactions; the purchaser pays garages by mobile banking. | Likke [C], Samuel [C] | Money leaves outside every described control, and exposes those employees personally. | FIN-PCH-04, FIN-TRE-05, FIN-RNT-04 |
| **F-12** | **Revenue billing is triggered verbally by any of three people.** | Yamrot [C] | Duplicate, missed, or premature billing is possible and undetectable. Revenue recognition is not tied to certified milestones. | FIN-OTC-01/02 |
| **F-13** | **There is no independent internal audit function.** The person titled "Auditor" is a billing and tax clerk. An "internal auditor" is separately named by Kalkidan but never described. | Yamrot [C], Kalkidan [C], context [C] | No independent check on any of the above. | FIN-GOV-04, Q10 to client |
| **F-14** | **Owner drawings are not separated from business expenditure.** Not discussed by anyone; Mesael is a sole proprietorship. | [I] from context [C] | The owner's personal position and the company's operating result cannot be told apart. Tax and lending consequences. | FIN-TRE-06 |

---

## 6. Segregation of duties — the as-is matrix

The five classic finance duties are: **Initiate**, **Verify**, **Approve**, **Execute (pay)**,
**Record**, **Reconcile**. A control environment requires that no single person holds a majority of
them for the same transaction — and specifically that Approve, Execute and Reconcile are held by three
different people.

Below is the actual distribution today, for the supplier payment process (W1).

| Duty | Mesael | Dembi | Leta | Kalkidan | Firehiwot | Samuel | Likke |
|---|---|---|---|---|---|---|---|
| **Initiate** | — | — | ● | — | ● | ● | — |
| **Verify** | ● | ● | ● | ● | ● | — | — |
| **Select vendor** | ● | — | ● | — | ● | ● | — |
| **Approve** | ● | ● | — | — | — | — | — |
| **Execute payment** | — | ● | ● | — | — | ● (mobile/garage) | ● (bank runs) |
| **Record** | — | — | ● (Telegram) | ● (Peachtree) | — | — | — |
| **Reconcile** | ● (stock/rentals) | — | ● (petty cash) | ● (bank) | — | — | — |

**Reading of this matrix:**

1. **Leta holds five of seven duties** for the same transaction class. [C] This is the single most
   significant internal control finding in the analysis. It is not an accusation of wrongdoing — there
   is no evidence of any — it is a statement that the company currently has **no structural means of
   detecting** wrongdoing or error in operational finance.
2. **Two people execute payments who have no finance role at all** (Samuel, Likke). [C]
3. **Approval is held by exactly two people**, one of whom (Mesael) is a stated bottleneck and the
   other (Dembi) has undocumented limits. [C][G]
4. **Recording is split across two systems** (Telegram references by Leta, Peachtree entries by
   Kalkidan) with different timing and no reconciliation between them. [C]
5. **Nobody independently reconciles the subcontract and rental processes at all.** [C — by absence]

The target matrix, enforced by the system, is given in Section 8.5.

---

## 7. The finance task catalogue

### 7.1 How tasks are defined

A **task** here means a unit of finance work that has a clear trigger, a single accountable owner, and
a state in which it can be declared *finished*. Sixty-eight tasks were identified across twelve
groups. Every task in the catalogue is traceable to at least one interview statement, or is a control
task that the interviews show to be missing.

For each task, Section 7.3 gives:

- **Owner / Trigger / Frequency** — who, when, how often
- **Today** — how it is done now, with evidence
- **Why it fails** — the specific breakage
- **Action sequence** — the numbered steps that must occur in the system
- **Definition of Done** — the exit test. If any line is unticked, the task is not finished, and the
  system must not allow it to be treated as finished.
- **System blocks** — the conditions under which the system refuses to let the task proceed

### 7.2 Task index

| Group | Code | Tasks | Focus |
|---|---|---|---|
| A | **TRE** | 6 | Treasury, banking, cash position, owner capital |
| B | **P2P** | 8 | Procure-to-pay: requisition through supplier payment |
| C | **SUB** | 7 | Subcontractor certification and payment |
| D | **RNT** | 5 | Equipment and machinery rental finance |
| E | **PCH** | 4 | Petty cash |
| F | **PAY** | 5 | Payroll |
| G | **OTC** | 6 | Order-to-cash: billing, collection, receivables |
| H | **TAX** | 7 | Tax and statutory compliance |
| I | **GLR** | 7 | Ledger, close, reporting, audit support |
| J | **BCC** | 5 | Budget and cost control |
| K | **GOV** | 4 | Authority, delegation, audit trail |
| L | **CMF** | 4 | Commercial finance: bids, guarantees, contracts |
| | | **68** | |

### 7.2.1 Master task list

| ID | Task | Accountable owner (proposed) | Frequency | Exists today? |
|---|---|---|---|---|
| **A — Treasury and banking** | | | | |
| FIN-TRE-01 | Maintain bank account register, mandates and signatories | Dembi | On change | Informal [G] |
| FIN-TRE-02 | Produce the daily cash and bank position | Leta | Daily | No [I] |
| FIN-TRE-03 | Execute and confirm an outgoing bank transfer | Leta → Dembi | Per payment | Yes, by phone [C] |
| FIN-TRE-04 | Issue, control and clear cheques | Leta | Per cheque | Yes, uncontrolled [C] |
| FIN-TRE-05 | Perform bank reconciliation | Kalkidan | Monthly → daily | Yes, retrospective [C] |
| FIN-TRE-06 | Maintain owner capital and drawings account | Kalkidan | Per event | **No** [I] |
| **B — Procure to pay** | | | | |
| FIN-P2P-01 | Receive and validate a purchase requisition | Firehiwot | Daily | Yes, via Telegram [C] |
| FIN-P2P-02 | Run the quotation / proforma cycle | Samuel | Per requisition | Yes, on paper [C] |
| FIN-P2P-03 | Evaluate quotations and select the supplier | Dembi (not Leta) | Per requisition | Yes, inside finance [C] |
| FIN-P2P-04 | Raise the purchase order and register the commitment | Samuel | Per selection | **No** [C] |
| FIN-P2P-05 | Confirm goods receipt and perform the three-way match | Site store / John | Per delivery | Partial, via Telegram [C] |
| FIN-P2P-06 | Approve the supplier payment | Per authority matrix | Per payment | Yes, Mesael only [C] |
| FIN-P2P-07 | Execute the supplier payment and apply withholding | Leta | Per payment | Yes; withholding unverified [G] |
| FIN-P2P-08 | Maintain supplier master and approved vendor list | Samuel + Dembi | Ongoing | **No** [C] |
| **C — Subcontracts** | | | | |
| FIN-SUB-01 | Register the subcontract and its financial terms | Firehiwot + Dembi | Per contract | Paper only [C] |
| FIN-SUB-02 | Pay and record the subcontract advance | Leta | Per contract | [G] |
| FIN-SUB-03 | Receive and verify the measurement / take-off | John + consultant | Per cycle | Yes, on paper [C] |
| FIN-SUB-04 | Produce the interim payment certificate | Dembi | Per cycle | Consultant's Excel [C] |
| FIN-SUB-05 | Approve the subcontractor payment | Mesael + Dembi | Per cycle | Telegram [C] |
| FIN-SUB-06 | Execute the subcontractor payment | Leta | Per cycle | Yes [C] |
| FIN-SUB-07 | Final account and retention release | Dembi | Per contract end | **No** [G] |
| **D — Rentals and equipment finance** | | | | |
| FIN-RNT-01 | Register the rental agreement and financial basis | Firehiwot | Per rental | Paper [C] |
| FIN-RNT-02 | Pay the rental advance | Leta | Per rental | Yes, 100% upfront [C] |
| FIN-RNT-03 | Capture and certify actual operating hours | Site / John | Daily | Informal, difficult [C] |
| FIN-RNT-04 | Approve extensions and off-hire | Firehiwot + Dembi | Per event | Manual [C] |
| FIN-RNT-05 | Reconcile advance vs actual usage and settle | Dembi | Per rental end | **No** [G] |
| **E — Petty cash** | | | | |
| FIN-PCH-01 | Establish and assign the petty cash float | Dembi | On change | Informal [C] |
| FIN-PCH-02 | Disburse petty cash against an authorised request | Leta | Daily | Yes [C] |
| FIN-PCH-03 | Acquit petty cash and close the daily count | Leta | Daily | Partial [C] |
| FIN-PCH-04 | Replenish the float and govern the emergency cash route | Dembi | Weekly | Uncontrolled [C] |
| **F — Payroll** | | | | |
| FIN-PAY-01 | Maintain payroll master data | Dembi | On change | [G] |
| FIN-PAY-02 | Collect and certify attendance and timesheets | John / site | Monthly | Paper timesheets [C] |
| FIN-PAY-03 | Run and check the payroll | Leta | Monthly | Yes [C] |
| FIN-PAY-04 | Approve and disburse payroll | Mesael → Leta | Monthly | Yes [C] |
| FIN-PAY-05 | File and pay employment tax and pension | Yamrot | Monthly | [G] |
| **G — Order to cash** | | | | |
| FIN-OTC-01 | Establish the client contract billing plan | Dembi | Per contract | Paper contract [C] |
| FIN-OTC-02 | Certify a billing milestone and raise the client invoice | Dembi | Per milestone | Verbal trigger [C] |
| FIN-OTC-03 | Issue the official tax receipt | Yamrot | Per milestone | Yes [C] |
| FIN-OTC-04 | Dispatch the original and track custody | Yamrot | Per receipt | Runner, untracked [C] |
| FIN-OTC-05 | Record collection and bank the cheque | Leta | Per collection | Yes [C] |
| FIN-OTC-06 | Manage receivables ageing and client-held retention | Dembi | Weekly | **No** [I] |
| **H — Tax and statutory** | | | | |
| FIN-TAX-01 | Maintain the tax configuration | Yamrot + Dembi | On law change | Excel knowledge [C] |
| FIN-TAX-02 | Aggregate monthly sales | Yamrot | Monthly | Excel [C] |
| FIN-TAX-03 | Aggregate monthly purchases | Yamrot | Monthly | Site Excel by email [C] |
| FIN-TAX-04 | Prepare and file the VAT declaration | Yamrot | Monthly | Portal [C] |
| FIN-TAX-05 | Prepare and file withholding tax | Yamrot | Monthly | [G] |
| FIN-TAX-06 | Obtain and track tax clearance certificates | Yamrot | Periodic | Yes [C] |
| FIN-TAX-07 | Manage assessments, corrections and penalties | Yamrot | As arising | In person at tax office [C] |
| **I — Ledger, close and reporting** | | | | |
| FIN-GLR-01 | Generate the payment voucher | System (was Kalkidan) | Per payment | Manual, after the fact [C] |
| FIN-GLR-02 | Verify the document set against the transaction | Kalkidan | Per transaction | Yes, too late [C] |
| FIN-GLR-03 | Post to ledger and project cost | System + Kalkidan | Continuous | Batch, 1–2 months late [C] |
| FIN-GLR-04 | Maintain fixed assets and depreciation | Kalkidan | Monthly | [G] |
| FIN-GLR-05 | Perform the period close | Kalkidan | Monthly | Yes, painful [C] |
| FIN-GLR-06 | Produce financial statements and management reports | Kalkidan | Monthly | Yes [C] |
| FIN-GLR-07 | Support audit and maintain the archive | Kalkidan | Annual + on demand | Box files 1–7 [C] |
| **J — Budget and cost control** | | | | |
| FIN-BCC-01 | Establish the project budget baseline from the bid | Dembi | Per project | **No** [C] |
| FIN-BCC-02 | Validate a request against budget | System | Per request | **No** [C] |
| FIN-BCC-03 | Track commitments and actuals | System | Continuous | **No** [C] |
| FIN-BCC-04 | Manage revisions, variations and price escalation | Dembi | As arising | Manual, late [C] |
| FIN-BCC-05 | Report project cost, forecast and profitability | Dembi | Weekly | **No** [C] |
| **K — Governance and authority** | | | | |
| FIN-GOV-01 | Maintain the approval authority matrix | Mesael | On change | **No** [G] |
| FIN-GOV-02 | Route, record and evidence an approval | System | Per approval | Telegram [C] |
| FIN-GOV-03 | Administer delegation and substitute authority | Mesael | As needed | Verbal [C] |
| FIN-GOV-04 | Maintain the audit trail and exception register | System | Continuous | **No** [C] |
| **L — Commercial finance** | | | | |
| FIN-CMF-01 | Build the bid cost estimate, tax loading and margin | Mesael | Per bid | Manual [C] |
| FIN-CMF-02 | Approve the bid price and record the commitment | Mesael | Per bid | Personal [C] |
| FIN-CMF-03 | Manage bid securities and guarantees | Dembi | Per bid | [G] |
| FIN-CMF-04 | Register the awarded contract and financial terms | Dembi | Per award | Paper [C] |

---

### 7.3 Task definitions and completion sequences

> **Reading note.** "Action sequence" is what happens in the system, in order. "Definition of Done" is
> the test that decides whether the task is finished. A task that fails any Definition of Done line
> stays open, stays visible on the owner's queue, and appears in the exception register (FIN-GOV-04).
> Nothing in this system silently completes.

---

## A — Treasury and Banking

### FIN-TRE-01 — Maintain the bank account register, mandates and signatories

**Owner:** Dembi · **Approver:** Mesael · **Trigger:** New account, mandate change, signatory change,
account closure · **Frequency:** Rare, very high impact

**Today.** No register was described by anyone. [G] Bank relationships are held personally by Mesael
and Dembi, with Leta executing and Samuel supplying supplier account details. [C] A named individual
possibly at the bank ("Mikiyas") may sit inside the payment path. [I]

**Why it fails.** If bank mandates are not recorded, the system cannot know who is legally permitted
to move money from which account, and cannot enforce it. Every downstream payment control depends on
this task being correct.

**Action sequence.**

1. Create the bank account record: bank, branch, account name, account number, currency (ETB), account
   type, purpose (operational / payroll / project-specific / guarantee margin).
2. Attach the bank's account-opening and mandate documents.
3. Record the authorised signatories and the mandate rule (single / joint / any-two).
4. Map each signatory to a system user, so a system approval can be matched to a legal mandate.
5. Record the payment channels enabled on the account: RTGS, cheque, mobile banking, branch counter.
6. Record any external contact person at the bank and their role — **this is where "Mikiyas" is
   resolved once we have the answer.**
7. Set the account's operating status and any daily/transaction limits agreed with the bank.
8. Route to Mesael for approval; approval is recorded with identity, timestamp and device.
9. On approval, the account becomes selectable in payment tasks. Until then it is not.

**Definition of Done.**

- [ ] Account record exists with all fields above populated
- [ ] Mandate document attached
- [ ] Every signatory mapped to an active system user
- [ ] Mandate rule set and machine-readable
- [ ] Owner approval recorded
- [ ] Account visible in FIN-TRE-02 cash position

**System blocks.** No payment (FIN-TRE-03, 04) may name an account that is not in *Approved* status.
No user may be selected as an approver of a payment from an account for which they are not a mandated
signatory.

---

### FIN-TRE-02 — Produce the daily cash and bank position

**Owner:** Leta · **Consumer:** Dembi, Mesael · **Trigger:** Daily, automatic · **Frequency:** Daily

**Today.** Not performed. [I] Cash position is known only implicitly, through Mesael's phone
confirmations and Leta's petty cash count. The company discovers it is short of money when a machine
stops and someone is sent to the bank. [C]

**Why it fails.** Without a forward cash position, payment scheduling is reactive. This is a direct
contributor to the Monday batch, to the urgent bank runs, and to the pressure on Mesael to
approve individually and immediately.

**Action sequence.**

1. Pull the opening balance of every account in FIN-TRE-01 (imported statement balance, or last
   reconciled balance plus posted movements).
2. Add petty cash float balances from FIN-PCH-03.
3. Add confirmed but uncleared inflows: cheques received (FIN-OTC-05) not yet cleared.
4. Subtract committed outflows: approved-but-unpaid payments, cheques issued and not presented.
5. Subtract scheduled outflows in the next 7 / 14 / 30 days: payroll, tax due dates from FIN-TAX,
   subcontract certificates due, rental extensions.
6. Add expected inflows by due date from FIN-OTC-06 receivables ageing.
7. Produce the position: available today, projected 7-day, projected 30-day, per account and total.
8. Flag any projected negative day.
9. Publish to the Dembi and Mesael dashboards at a fixed time each morning.

**Definition of Done.**

- [ ] All accounts and floats included, none stale by more than one banking day
- [ ] Committed and scheduled outflows both included
- [ ] 7-day and 30-day projection produced
- [ ] Negative-day flags raised where applicable
- [ ] Published and timestamped

**System blocks.** If any account's last statement import is older than the configured tolerance, the
position is published **marked as stale**, naming the account — it is never published as if it were
current.

---

### FIN-TRE-03 — Execute and confirm an outgoing bank transfer

**Owner:** Leta (execution) · **Confirmer:** Dembi or Mesael · **Trigger:** An approved payment
· **Frequency:** Continuous — this is the highest-frequency treasury task

**Today.** Leta executes the RTGS transfer; Mesael confirms it **by phone**. [C] Whether a bank token
or formal authentication is used is explicitly unknown and flagged in Mesael's own interview. [G]

**Why it fails.** A voice confirmation is not evidence. It cannot be produced to an auditor, it cannot
be replayed, and it cannot be distinguished from an impersonation. It also chains the owner to his
phone: this single step is a large part of why he says the load is affecting his health. [C]

**Action sequence.**

1. Open the approved payment (from FIN-P2P-06, FIN-SUB-05, FIN-RNT-02, FIN-PAY-04 or FIN-TAX).
2. System re-validates, at the moment of execution: approval still valid, payee bank details unchanged
   since approval, budget still available, all required documents still attached, and no duplicate
   payment exists for the same source transaction.
3. Select the paying account. System checks the mandate rule from FIN-TRE-01 and sufficient available
   balance from FIN-TRE-02.
4. Generate the payment instruction with a system payment reference.
5. Second person performs the **release** step — the maker-checker split. The maker cannot be the
   checker; the system enforces this by user identity, not by policy.
6. Execute at the bank (via integration if available, otherwise manually) and enter the bank's
   transaction reference.
7. Attach the bank's confirmation slip or advice.
8. System records: who prepared, who released, exact timestamp (Africa/Addis_Ababa), account, amount,
   payee, channel, bank reference, and the source transaction.
9. Payment status moves to *Paid*. Notification fires to the requester, the project, and the payee
   contact if configured.
10. The payment voucher (FIN-GLR-01) is generated **automatically at this point**, not weeks later.

**Definition of Done.**

- [ ] Approval, budget, documents and payee details all re-validated at execution
- [ ] Maker and checker are different named users
- [ ] Bank reference captured
- [ ] Bank confirmation attached
- [ ] Payment voucher auto-generated and numbered
- [ ] Ledger and project cost postings created (FIN-GLR-03)
- [ ] Duplicate check passed and logged

**System blocks.** Execution is refused if payee bank details changed after approval (the payment goes
back for re-approval); if the maker and checker are the same person; if the same source transaction
already has a payment in *Paid* status; or if any mandatory document has been removed since approval.

---

### FIN-TRE-04 — Issue, control and clear cheques

**Owner:** Leta · **Trigger:** A payment routed to the cheque channel · **Frequency:** Regular —
government-facing work makes cheques common at Mesael [C]

**Today.** Cheques are used for settlements and for client collections. [C] No cheque book control,
void handling, or presentation tracking was described. [G]

**Action sequence.**

1. Register the cheque book: bank account, serial range, date received, custodian.
2. On payment, the system allocates the **next sequential** cheque number — it is not typed in.
3. Record payee, amount in figures and words, date, and whether post-dated.
4. Print or hand-write; attach a scan of the signed cheque.
5. Record collection: who collected it, when, and their signature or ID reference.
6. Track presentation status from the bank statement import: issued → presented → cleared.
7. Handle exceptions explicitly: void (with reason and physical retention), stopped, stale-dated.
8. Report unpresented cheques over the configured age into FIN-TRE-02 and FIN-TRE-05.

**Definition of Done.**

- [ ] Cheque number allocated by the system from a registered book
- [ ] Payee, amount and date recorded and matching the source payment exactly
- [ ] Collection acknowledged and recorded
- [ ] Presentation status tracked to *Cleared* or explicitly to *Void / Stopped / Stale*
- [ ] No cheque serial in the registered range is unaccounted for

**System blocks.** A cheque number cannot be re-used. A cheque cannot be issued from a book not
registered to the paying account. A payment cannot close while its cheque is unaccounted for.

---

### FIN-TRE-05 — Perform bank reconciliation

**Owner:** Kalkidan · **Trigger:** Statement import · **Frequency:** Target daily; monthly minimum

**Today.** Reconciliation is retrospective and is in fact the *source* of the accounting record —
Kalkidan cuts payment vouchers **from the bank statement**. [C] The statement is being used to
discover what happened, rather than to verify what was already recorded.

**Why it fails.** This inverts the correct order. The ledger should predict the statement; here the
statement creates the ledger. Any payment that left the bank without a system record is therefore
invisible until statement time — up to two months later. [C]

**Action sequence.**

1. Import or enter the bank statement for the period, per account.
2. System auto-matches statement lines to system payments and receipts on reference, amount and date.
3. Present unmatched items in two buckets: **in system not in bank** (unpresented / failed) and **in
   bank not in system** — the second bucket is the important one.
4. For each "in bank not in system" line, require classification and resolution: a missing payment
   record must be created and traced back to who initiated it; bank charges and interest are posted;
   unidentified items are escalated.
5. Post charges, interest and forex differences.
6. Compute the reconciliation statement: statement balance → adjustments → ledger balance.
7. Second-person review and sign-off. The reconciler cannot be the person who executed the payments.
8. Lock the reconciled period for that account.

**Definition of Done.**

- [ ] Every statement line is matched, classified or formally escalated — none left unexplained
- [ ] Reconciled difference is zero, or the residual is documented and approved
- [ ] Every "in bank not in system" item has a named originator
- [ ] Independent reviewer sign-off recorded
- [ ] Period locked

**System blocks.** A period cannot close (FIN-GLR-05) with an unreconciled account. Reconciliation
cannot be signed off by a user who executed payments on that account in the period.

---

### FIN-TRE-06 — Maintain the owner capital and drawings account

**Owner:** Kalkidan · **Approver:** Mesael · **Trigger:** Owner injects funds, withdraws funds, or
pays a business cost personally · **Frequency:** As arising

**Today.** Not described by anyone. [G] Mesael is a **sole proprietorship** [C], which means there is
no legal separation between the owner's money and the company's — but there must be an *accounting*
separation, or the business result is meaningless.

**Why it fails.** Without this, three different things look identical in the books: a business expense,
an owner drawing, and an owner-funded business expense. Profitability, tax position and any future
lending or partnership discussion all depend on telling them apart.

**Action sequence.**

1. Classify every owner-related movement into one of four types: **capital injection**, **drawing**,
   **owner-funded business expense** (reimbursable), **owner-personal expense paid by the company**
   (a drawing by another name).
2. Record date, amount, instrument, and the account or cash source.
3. Attach evidence — transfer advice, cheque, or receipt.
4. Post to the correct equity or expense account. Drawings never touch profit and loss.
5. Where the company paid a personal cost, flag it and reclassify to drawings automatically.
6. Maintain a running owner capital account statement: opening, injections, drawings, profit share,
   closing.
7. Present the owner capital movement as a standing line in the monthly report to Mesael.

**Definition of Done.**

- [ ] Every owner-related movement is classified into exactly one of the four types
- [ ] Evidence attached
- [ ] Posting made to equity, not to profit and loss, for injections and drawings
- [ ] Owner capital statement balances and reconciles for the period
- [ ] No unclassified owner movement remains open at period close

**System blocks.** Period close is refused while any owner-related transaction is unclassified.

---

## B — Procure to Pay

### FIN-P2P-01 — Receive and validate a purchase requisition

**Owner:** Firehiwot · **Trigger:** Site need · **Frequency:** The highest-volume trigger in the
company [C]

**Today.** A site PM sends a material or machinery request by Telegram. Firehiwot checks details, goes
back to site on specifications and brands, then passes it on. [C] Requests arrive "without prior
budgeting or scheduling". [C] Duplicate requests occur — the same item requested today that was bought
yesterday. [C]

**Why it fails.** The request is not a record. It is a chat message. It has no number, no budget line,
no duplicate check, no specification standard, and no status. Everything downstream inherits that.

**Action sequence.**

1. Requester raises the requisition against a **project** and a **WBS / BOQ activity**. Both mandatory.
2. Enter item lines from the material catalogue: item code, specification, brand or "or equivalent",
   unit of measure, quantity, required-on-site date, delivery location.
3. System auto-checks **stock first**: is this item already available at the central store or another
   site store? If so, it proposes a transfer instead of a purchase.
4. System runs the **duplicate check**: same item, same project, same activity, within the configured
   window — and shows the requester the matching prior requisition before allowing submission.
5. System runs the **budget check** (FIN-BCC-02) and displays: budget line, budgeted, committed, spent,
   remaining, and the effect of this request. Result is one of *within budget*, *within tolerance*, or
   *over budget*.
6. Requester attaches justification, site photographs, or the technical specification.
7. Requisition is numbered (PR-YYYY-nnnnn) and submitted. Status: *Submitted*.
8. Firehiwot reviews the technical specification, corrects it with the site if needed, and either
   validates or returns it with a reason.
9. Urgency is classified from a fixed list — **not free text** — because urgency determines the route:
   *Normal*, *Priority*, *Emergency (work stopped)*.
10. Validated requisition routes automatically: to FIN-P2P-02 for quoting, or to a stock transfer, or
    to a framework-agreement direct order if the item is on an active price agreement (FIN-P2P-08).

**Definition of Done.**

- [ ] Project and WBS/BOQ activity attached
- [ ] Every line has item code, specification, quantity, UoM and required date
- [ ] Stock availability checked and result recorded
- [ ] Duplicate check run and result recorded (including a deliberate override with reason)
- [ ] Budget position displayed and recorded on the requisition
- [ ] Urgency classified from the controlled list
- [ ] Technical validation by Firehiwot recorded
- [ ] Requisition numbered and routed

**System blocks.** Cannot submit without project and activity. Cannot submit an over-budget requisition
without selecting an over-budget reason — which then forces the higher approval tier (FIN-GOV-01).
Emergency classification is permitted but is **always** logged to the exception register and reported
to Mesael weekly, so that "emergency" cannot quietly become the normal route.

---

### FIN-P2P-02 — Run the quotation / proforma cycle

**Owner:** Samuel · **Trigger:** Validated requisition needing sourcing · **Frequency:** Daily

**Today.** Samuel visits suppliers and collects **sealed** proformas — 3–4 for standard material, up
to 10–20 for unfamiliar machinery — brings them back, and opens them together with Firehiwot. [C] When
a request is marked urgent, Firehiwot sometimes collects quotes herself, and then neither is sure who
owns the follow-up. [C] Long-standing suppliers have begun refusing to issue proformas because they
are repeatedly asked and repeatedly not selected. [C]

**Why it fails.** Two people can own the same sourcing task simultaneously. The sealed-envelope ritual
is a genuine control — it should be preserved — but it is implemented on paper and therefore cannot be
audited, and it is applied indiscriminately to commodity items where it destroys supplier goodwill for
no gain.

**Action sequence.**

1. System assigns the RFQ to **exactly one owner**. This is the resolution of Samuel's complaint: a
   requisition has one sourcing owner at any moment, visible to everyone. Reassignment is possible but
   is an explicit, logged action.
2. If the item is on an **active framework price agreement** (FIN-P2P-08), the system skips quoting
   entirely and proposes a direct order at the agreed price. **This is what protects the supplier
   relationship** — cement and rebar stop being re-quoted every time.
3. Otherwise the system creates the RFQ with the specification and required date, and selects invitees
   from the approved vendor list, honouring the minimum-quotes rule for the value band.
4. Send the RFQ. Suppliers respond by portal upload, email, or Samuel photographs and uploads the
   paper proforma against the correct supplier line.
5. **Sealed mode:** quoted prices are hidden from every user, including the sourcing owner, until the
   configured closing time or until the minimum number of responses is received. The digital equivalent
   of the sealed envelope, and this time it is provable.
6. Record each quote: unit price, total, tax treatment, validity date, delivery lead time, warranty,
   payment terms.
7. Record non-responses and refusals with reason — this is the data that will eventually prove supplier
   fatigue quantitatively rather than anecdotally.
8. At opening, the system logs who opened, when, and which quotes were visible.
9. If fewer than the minimum quotes are obtained, the requisition proceeds only via the documented
   single-source route, with reason and higher approval.

**Definition of Done.**

- [ ] Single named sourcing owner throughout
- [ ] Framework-agreement check performed first
- [ ] Minimum quotes obtained for the value band, or single-source justification recorded and approved
- [ ] Every quote captured with price, validity, lead time and tax treatment
- [ ] Sealed until opening; opening event logged with user and timestamp
- [ ] Non-responses recorded

**System blocks.** No user can view sealed prices before the opening event. A second person cannot
independently open a parallel RFQ on the same requisition — the system will show them the existing one.

---

### FIN-P2P-03 — Evaluate quotations and select the supplier

**Owner:** **Dembi (Finance Head) — not Leta** · **Trigger:** RFQ closed · **Frequency:** Daily

**Today.** Proformas are handed to the finance department, which "selects the lowest/best price". [C]
In practice this is Leta — the same person who then executes the payment. [C]

**Why it fails.** This is finding F-04 in its most concrete form. The person selecting who receives
company money is the person who sends it. There is no evidence of any problem having occurred; there is
simply no mechanism that would reveal one. Separating selection from execution costs the company
nothing and closes the exposure.

**Action sequence.**

1. System builds the **comparison matrix** automatically: suppliers across, line items down, with unit
   price, total, tax treatment, delivery lead time, payment terms and validity.
2. System normalises for comparison — quantity, unit of measure, VAT-inclusive versus exclusive,
   delivery cost included or not. A cheaper price that excludes delivery is not cheaper, and the matrix
   must say so.
3. System highlights: lowest total, lowest evaluated cost, fastest delivery, and any quote that has
   expired or will expire before the expected approval date.
4. Technical evaluation by Firehiwot: does each offer actually meet the specification? Non-compliant
   offers are excluded with a recorded reason.
5. Commercial evaluation and recommendation by Dembi, with a written justification. **If the
   recommendation is not the lowest compliant price, the justification is mandatory** and is surfaced
   to the approver.
6. System shows the budget effect at selection: this selection consumes X of the remaining budget on
   this line.
7. Selection is submitted for approval per the authority matrix (FIN-GOV-01).
8. On approval, unsuccessful suppliers are notified through the system — closing the loop that
   currently causes silent supplier fatigue.

**Definition of Done.**

- [ ] Normalised comparison matrix generated and attached to the transaction permanently
- [ ] Technical compliance assessed per quote, exclusions justified
- [ ] Recommendation recorded with justification where not lowest compliant
- [ ] Quote validity confirmed as still live at selection
- [ ] Budget effect displayed and recorded
- [ ] Selection approved per matrix
- [ ] Selector is **not** the person who will execute the payment

**System blocks.** The system refuses a selection where the selecting user is also assigned as the
payment executor. Selection of an expired quote is refused; it must be re-confirmed by the supplier
first.

---

### FIN-P2P-04 — Raise the purchase order and register the commitment

**Owner:** Samuel · **Trigger:** Approved supplier selection · **Frequency:** Per purchase

**Today.** **This task does not exist.** [C] There is no purchase order in any interview. The company
goes from an approved proforma directly to a bank transfer. Which means at no point does anyone know
what Mesael has *committed to spend* — only what it has already spent.

**Why it fails (its absence).** Committed-but-unpaid spend is invisible. Two people can commit the
same budget line twice. Cash forecasting is impossible. The budget looks healthy right up until the
invoices arrive.

**Action sequence.**

1. Generate the purchase order from the approved selection — no re-typing; the PO inherits the
   requisition, quote, project, activity, budget line and specification.
2. PO carries: supplier, delivery address and site, required date, prices, tax treatment, withholding
   applicability, payment terms, and the **agreed payment trigger** (on delivery, on invoice, advance).
3. Record whether an advance is being given, and if so the percentage and the recovery mechanism.
4. System **registers the commitment** against the budget line (FIN-BCC-03): the money is now reserved,
   not merely planned.
5. PO is numbered (PO-YYYY-nnnnn), approved per matrix, and issued to the supplier through the system.
6. Supplier bank details are pulled from the supplier master (FIN-P2P-08) — **not collected fresh from
   the supplier at payment time**, which is how bank-detail fraud enters companies.
7. PO status tracks: *Issued → Partially received → Fully received → Invoiced → Paid → Closed*.
8. Amendments are versioned; the original is never overwritten.

**Definition of Done.**

- [ ] PO generated from the approved selection with no manual re-entry of price or specification
- [ ] Commitment registered against the correct budget line
- [ ] Supplier bank details sourced from the verified supplier master
- [ ] Payment trigger and any advance terms explicitly recorded
- [ ] PO issued and acknowledged
- [ ] PO number is the reference on every downstream document

**System blocks.** No payment can be made against a supplier without a PO or an approved
no-PO exception. Bank details entered manually at payment time are refused.

---

### FIN-P2P-05 — Confirm goods receipt and perform the three-way match

**Owner:** Site store keeper or John · **Trigger:** Delivery to site · **Frequency:** Per delivery

**Today.** Samuel receives goods and delivers them to site; the site confirms receipt in a Telegram
group — and this confirmation "often lags". [C] Kalkidan then tries to reconcile documents that arrive
late and incomplete. [C]

**Why it fails.** This is the control that converts "we paid someone" into "we received what we paid
for". Today it is a chat message that may or may not appear. Combined with F-02 — payment before
documents — the company can and does pay for deliveries whose arrival is never independently confirmed
in any durable record. [I]

**Action sequence.**

1. Receiver opens the PO on a mobile device at the point of delivery.
2. Record actual quantity received per line — which may differ from ordered.
3. Record condition, and raise rejections or short-deliveries with reason and photograph.
4. Attach the delivery note and photographs of the goods and the delivery vehicle where applicable.
5. System generates a **Goods Receiving Note** (GRN-YYYY-nnnnn) and posts the quantity into the store
   inventory of the receiving location.
6. Attach or capture the supplier invoice / receipt against the same PO.
7. System performs the **three-way match**: PO quantity and price ↔ GRN quantity ↔ invoice quantity
   and price. Variances outside tolerance are flagged, not silently accepted.
8. Where a variance exists, it is routed for resolution — accept, dispute with supplier, or partial
   payment — with a decision and a decider recorded.
9. On a clean match, the payment becomes eligible (FIN-P2P-06). **Not before.**

**Definition of Done.**

- [ ] GRN raised with actual quantities, on-site, at time of delivery
- [ ] Delivery note and supplier invoice attached
- [ ] Three-way match executed with a *matched* or *variance-resolved* result
- [ ] Inventory updated at the receiving location
- [ ] Project cost consumption linked to the WBS activity
- [ ] Any rejection or shortage recorded with evidence

**System blocks.** Payment against a PO with no GRN is refused, except by the emergency-advance route
(which requires higher approval, a stated reason, and creates a mandatory follow-up task to complete
the GRN within a configured deadline — with escalation to Dembi and Mesael if it is missed).

---

### FIN-P2P-06 — Approve the supplier payment

**Owner:** Per the authority matrix · **Trigger:** Matched, payable transaction · **Frequency:**
Continuous

**Today.** Every payment reaches Mesael. If he is present, he signs paper. If he is not, the decision
waits until he can be reached by phone. [C] Approvals for subcontract work go by Telegram to two people
at once. [C]

**Why it fails.** It is the company's largest single delay, its largest single-point-of-failure, and —
per Mesael himself — a health issue. [C] Note carefully: the fix is *not* removing the owner's
authority. It is giving him a mobile approval queue with complete information, and giving Dembi a
defined ceiling underneath him so that routine payments never reach the owner at all.

**Action sequence.**

1. System assembles the approval package automatically and completely: requisition, comparison matrix,
   selection justification, PO, GRN, invoice, match result, budget position, project, activity,
   supplier history, and the full approval trail so far.
2. System determines the approval route from the authority matrix (FIN-GOV-01) on amount, transaction
   type, project, budget status and urgency. The route is shown to the requester up front, so nobody
   has to ask "who needs to sign this?"
3. Route to the first approver's queue — web and mobile, with push notification.
4. Approver sees, before deciding: amount, payee, project, budget remaining after this payment, whether
   it is within budget, whether documents are complete, and any exception flags.
5. Approver acts: **approve**, **reject with reason**, or **return for information** with a question
   routed back to the originator.
6. If the amount exceeds the current approver's ceiling, the system escalates automatically to the
   next tier. Nobody has to know the rules; the system applies them.
7. Where the route requires two approvers (as with subcontract payments today), the system requires
   both, records them separately in order, and **does not** treat one as sufficient.
8. Each approval records identity, timestamp, device, and the exact document version approved.
9. If documents change after approval, the approval is invalidated and re-requested. Silently.
   Automatically. No exceptions.
10. Approved payments enter the payment run queue (FIN-TRE-03).

**Definition of Done.**

- [ ] Complete approval package assembled — no approver ever decides on partial information
- [ ] Route determined from the matrix, not chosen by a person
- [ ] Every required approver has acted; none skipped
- [ ] Each approval carries identity, timestamp and document version
- [ ] Rejections carry a reason and return to a named owner
- [ ] Approval is non-repudiable and permanently attached to the transaction

**System blocks.** Approval is refused where mandatory documents are missing (see the attachment matrix,
Section 8.3); where the approver is the requester; where the approver's ceiling is exceeded; or where
the budget line is exhausted and no over-budget reason has been approved.

---

### FIN-P2P-07 — Execute the supplier payment and apply withholding

**Owner:** Leta · **Trigger:** Approved payment · **Frequency:** Continuous

**Today.** Leta executes RTGS. Samuel obtains the supplier's bank details and hands them to finance at
payment time. [C] **Whether withholding tax is applied and remitted is not described by anyone.** [G]

**Why it fails.** Two separate risks. First, bank details arriving fresh at payment time, on paper,
outside any verified master record, is precisely the vector for payment redirection. Second, if
withholding is being applied it is invisible in the described process, and if it is not being applied,
the company is carrying an unquantified statutory exposure.

**Action sequence.**

1. Execute the treasury steps in FIN-TRE-03 (maker-checker, mandate, duplicate check, bank reference).
2. System computes the tax treatment **automatically** from the configuration (FIN-TAX-01) and the
   supplier's registration status: VAT recoverable or not, withholding applicable or not, at the
   configured rate and threshold.
3. Compute the net payable: gross − withholding − advance recovery − retention − any agreed deduction.
4. Present the deduction breakdown to the approver *before* execution, and to the supplier *with* the
   payment advice.
5. Execute the net payment.
6. **Simultaneously** create the withholding liability and the withholding certificate obligation
   (feeding FIN-TAX-05). The liability is created by the payment, not remembered at month end.
7. Issue the withholding certificate to the supplier and record its issue.
8. Update the PO status and reduce the outstanding commitment (FIN-BCC-03).
9. Generate the payment voucher (FIN-GLR-01) and post (FIN-GLR-03).

**Definition of Done.**

- [ ] Net payable computed by the system, with every deduction itemised and visible
- [ ] Withholding liability created at the moment of payment
- [ ] Withholding certificate issued and recorded
- [ ] Payment advice sent to supplier
- [ ] PO commitment reduced by the paid amount
- [ ] PV generated and ledger + project cost posted the same day
- [ ] Bank reference and confirmation attached

**System blocks.** Payment to bank details that do not match the verified supplier master is refused.
A change to supplier bank details is itself an approval-requiring event (FIN-P2P-08) and freezes
payments to that supplier until approved.

---

### FIN-P2P-08 — Maintain the supplier master and approved vendor list

**Owner:** Samuel (data) + Dembi (approval) · **Trigger:** New supplier, or change · **Frequency:**
Ongoing

**Today.** No supplier master exists. [C] Supplier bank details are collected per transaction. [C]
Price history exists only in Samuel's memory and in loose paper proformas. [C] Long-term suppliers are
being lost to proforma fatigue. [C]

**Why it fails (its absence).** Without a supplier master there is no price history, no performance
record, no verified bank detail, and no framework agreement — so every purchase starts from zero and
the company re-buys its own knowledge every time.

**Action sequence.**

1. Register the supplier: legal name, trade name, TIN, VAT registration status, address, contacts,
   category of supply.
2. Attach the business licence, VAT certificate and any trade registration.
3. Record bank details **with evidence** — a bank letter or stamped account confirmation, not a
   handwritten note.
4. Bank detail entry and every subsequent change requires second-person verification and Dembi's
   approval. Changes are versioned with who, when, and evidence.
5. Classify the supplier: approved, conditional, or blocked, with reason and review date.
6. Record framework or master price agreements: item, agreed price, validity period, minimum order,
   delivery terms. **This is the mechanism that ends the proforma churn on commodity items.**
7. Accumulate performance automatically from operational data — quotes requested versus won, on-time
   delivery percentage, rejection rate, price trend, invoice-match accuracy.
8. Maintain price history per item per supplier, so the comparison matrix in FIN-P2P-03 can flag a
   quote that is out of line with the market.
9. Periodic review of the approved list by Dembi.

**Definition of Done.**

- [ ] Supplier record complete with TIN and VAT status (both required for correct tax treatment)
- [ ] Licence and registration documents attached and in date
- [ ] Bank details evidenced, second-person verified, and Dembi-approved
- [ ] Category and approval status set with a review date
- [ ] Framework prices recorded where they exist
- [ ] Performance metrics accruing automatically

**System blocks.** Purchase from a *Blocked* supplier is refused. Payment is refused where the supplier
has no verified TIN, because the tax treatment cannot then be determined correctly. An expired licence
raises a warning at PO stage and a block at the configured severity.

---

## C — Subcontracts

### FIN-SUB-01 — Register the subcontract and its financial terms

**Owner:** Firehiwot (preparation) + Dembi (financial terms) · **Trigger:** Subcontract award
· **Frequency:** Per subcontract

**Today.** Agreements are signed by the site Project Manager or by Firehiwot — *"I am the one
representing the company signing the agreement"* [C] — and it is explicitly unclear which value
threshold allows a site PM, versus Firehiwot, versus the CEO, to finalise a subcontract. [G]

**Why it fails.** People are binding the company financially without a documented mandate, and the
financial terms that govern every later payment — advance, retention, rates — live only in the paper
agreement.

**Action sequence.**

1. Register the subcontractor as a party (as FIN-P2P-08: TIN, VAT status, licence, evidenced bank
   details).
2. Create the subcontract record against the project: scope, start and end dates, contract value.
3. Enter the **priced BOQ / rate schedule** line by line. This is what future measurements are valued
   against, so it must be data, not an attachment.
4. Enter the financial terms explicitly and as structured fields:
   - advance payment percentage and its recovery method (pro-rata / front-loaded / on a defined
     schedule)
   - retention percentage, retention ceiling, and release conditions
   - withholding tax applicability
   - payment period after certification
   - penalty / liquidated damages basis
   - price adjustment or escalation basis, if any
5. Attach the signed agreement and any guarantees or securities.
6. Route for signature authority per the matrix (FIN-GOV-01) — **this closes the open question about
   who may sign what**, once the thresholds are set.
7. Register the contract value as a commitment against the project budget (FIN-BCC-03).
8. Status: *Draft → Approved → Active → Completed → Closed*.

**Definition of Done.**

- [ ] Subcontractor registered with verified TIN and bank details
- [ ] Priced BOQ entered as structured lines
- [ ] Advance, retention, withholding and payment terms captured as fields, not prose
- [ ] Signed agreement attached
- [ ] Signature authority validated against the matrix
- [ ] Commitment registered against the project budget

**System blocks.** No subcontract payment can be raised against a contract that is not *Active*. No
contract can be activated without a priced BOQ.

---

### FIN-SUB-02 — Pay and record the subcontract advance

**Owner:** Leta · **Trigger:** Approved advance under an active subcontract · **Frequency:** Per
contract

**Today.** Not described. [G] Given that machinery rentals are paid 100% in advance [C], advances are
clearly part of Mesael's commercial practice, but the subcontract advance mechanism is undocumented.

**Action sequence.**

1. Raise the advance request against the subcontract, at the contracted percentage. The system
   calculates the amount; it is not typed.
2. Verify any required advance payment guarantee is in place and in date, and attach it.
3. Route for approval per matrix.
4. Execute payment (FIN-TRE-03), applying withholding where the configuration requires.
5. Post the advance to an **advance/prepayment account, not to project cost**. It is not an expense
   yet; it is money the subcontractor owes back in work.
6. Create the **recovery schedule** so every future certificate automatically recovers a portion.
7. Show the outstanding advance balance on the subcontract dashboard at all times.

**Definition of Done.**

- [ ] Advance calculated from the contract terms
- [ ] Guarantee verified and attached where required
- [ ] Posted to advances, not to cost
- [ ] Recovery schedule created and active
- [ ] Outstanding advance balance visible on the contract

**System blocks.** No advance may be paid beyond the contracted percentage. No second advance without
explicit re-approval at the higher tier. Contract closure is refused while an advance balance remains
unrecovered.

---

### FIN-SUB-03 — Receive and verify the measurement / take-off

**Owner:** John or the site engineer, verified by the consultant · **Trigger:** Subcontractor completes
a phase · **Frequency:** Per payment cycle

**Today.** The site engineer creates the request; the PM reviews it against the agreement and pricing;
inspection and test results are attached by administrative staff; measurement and take-off sheets are
supposed to be prepared at site — and frequently are not, or arrive incomplete. [C] Kalkidan
specifically lists "missing take-off measurements" as a recurring problem. [C]

**Action sequence.**

1. Subcontractor or site engineer submits the measurement for the period, **line by line against the
   contract BOQ** — not as a lump sum.
2. Enter quantity completed this period per BOQ line; system shows cumulative-to-date and the
   remaining contract quantity.
3. System blocks any line whose cumulative quantity would exceed the contracted quantity, unless a
   variation (FIN-BCC-04) has been approved.
4. Attach the supporting evidence set: take-off sheets, joint measurement records, inspection request
   and result, laboratory test results, and site photographs.
5. Site engineer certifies the measurement; PM (John) reviews and endorses.
6. Consultant — internal or external — verifies. Their verification is a distinct, recorded step with
   an identified person, because today this role is doing critical financial work with no defined
   boundary. [C]
7. Any disputed quantity is recorded as *disputed* and excluded from the current certificate rather
   than holding up the whole payment.

**Definition of Done.**

- [ ] Measurement entered per BOQ line with cumulative tracking
- [ ] No line exceeds contract quantity without an approved variation
- [ ] Inspection and test results attached — mandatory, no exception
- [ ] Site engineer certification recorded
- [ ] PM endorsement recorded
- [ ] Consultant verification recorded with a named verifier
- [ ] Disputes isolated and carried forward, not blocking the undisputed portion

**System blocks.** A certificate (FIN-SUB-04) cannot be generated from an unverified measurement. Test
results are a hard requirement where the BOQ line is configured as test-dependent — this is a quality
control that happens to be enforced by the finance workflow, which is exactly how it should work.

---

### FIN-SUB-04 — Produce the interim payment certificate

**Owner:** Dembi · **Trigger:** Verified measurement · **Frequency:** Per cycle

**Today.** An internal consultant prepares payment sheets with "DB percentage calculations" in Excel.
[C] The consultant sits outside finance and outside a defined role boundary. [C]

**Why it fails.** The document that determines how much money leaves the company is produced outside
the finance function, in a spreadsheet, by someone whose authority is undefined. Whether retention and
advance recovery are inside those calculations is unknown. [G]

**Action sequence.**

1. System generates the certificate from the verified measurement — gross work value this period, and
   cumulative to date.
2. Apply, automatically, from the contract terms in FIN-SUB-01:
   - less: advance recovery per the schedule
   - less: retention at the contracted percentage, up to the ceiling
   - less: withholding tax at the configured rate
   - less: any penalties, back-charges, materials issued to the subcontractor, or agreed deductions
   - less: previously certified amounts
3. Produce the net payable, with **every deduction shown as a separate line** — to the subcontractor
   as well as internally. Deduction disputes are far cheaper to resolve before payment than after.
4. Attach the measurement, verifications, test results and the deduction computation.
5. Number the certificate (IPC-<contract>-nn) and version it.
6. Present the project budget effect and the cumulative contract position: contract value, certified to
   date, retained to date, advance outstanding, remaining contract value.
7. Route for approval (FIN-SUB-05).

**Definition of Done.**

- [ ] Certificate generated by the system from verified measurement — no manual value entry
- [ ] All deductions applied automatically from contract terms and individually itemised
- [ ] Cumulative position reconciles: certified to date ≤ contract value + approved variations
- [ ] Complete evidence set attached
- [ ] Certificate numbered and versioned
- [ ] Subcontractor issued a copy showing the deduction breakdown

**System blocks.** Manual override of a system-calculated deduction requires an approval one tier above
the certificate's own approval level, with a mandatory reason recorded in the exception register.

---

### FIN-SUB-05 — Approve the subcontractor payment

**Owner:** Mesael and Dembi (currently both) · **Trigger:** Issued certificate · **Frequency:** Per
cycle

**Today.** The request is sent by Telegram, simultaneously, to the GM and the DGM. [C] Then it must
wait for a Monday to be handed to finance. [C]

**Why it fails.** Parallel chat approval to two people produces no reliable record of who approved,
in what order, on what information, or whether both actually did. And the Monday rule means an approval
obtained on Tuesday waits six days to become money.

**Action sequence.**

1. System routes the certificate per the authority matrix — sequential or parallel dual approval,
   whichever Mesael and Dembi confirm is intended.
2. Each approver sees the full package: certificate, deductions, measurement, test results, budget
   position, contract cumulative position, and the subcontractor's payment history.
3. Each approves, rejects with reason, or returns for information — individually and identifiably.
4. Where dual approval is required, **both** must complete. The certificate does not become payable on
   one.
5. Approval is recorded against the exact certificate version. A revised certificate re-triggers
   approval from the start.
6. On full approval, the certificate becomes payable and enters the payment queue.
7. **The Monday rule is replaced by a configured payment calendar** — if Mesael confirms it is real
   policy, it becomes a scheduled payment run that everyone can plan around and that shows a
   countdown; if it is a coping mechanism, it is removed and payments flow continuously. Either way it
   stops being an unwritten rule that only some staff know about.

**Definition of Done.**

- [ ] Every required approver has acted individually and identifiably
- [ ] Approval recorded against a specific certificate version
- [ ] Full package was available to each approver
- [ ] Payment run date assigned and visible to the subcontractor and the site
- [ ] Rejections carry reasons and route back to a named owner

**System blocks.** Approval outside the matrix is impossible. An amended certificate voids prior
approvals automatically.

---

### FIN-SUB-06 — Execute the subcontractor payment

**Owner:** Leta · **Trigger:** Approved certificate · **Frequency:** Per cycle

**Action sequence.**

1. Execute per FIN-TRE-03, including maker-checker and duplicate control.
2. Post the gross work value to **project cost against the correct BOQ activity** — not the net payment
   amount. Cost and cash are different numbers and both must be right.
3. Post retention to a retention liability account, tracked per contract.
4. Post advance recovery against the advance account, reducing the outstanding balance.
5. Post the withholding liability and issue the certificate to the subcontractor.
6. Update the contract cumulative position.
7. Generate the PV (FIN-GLR-01) and post to the ledger (FIN-GLR-03).
8. Notify the subcontractor with the full payment advice.

**Definition of Done.**

- [ ] Gross value posted to project cost; net amount paid
- [ ] Retention held and visible as a per-contract liability
- [ ] Advance recovery applied and advance balance reduced
- [ ] Withholding liability raised and certificate issued
- [ ] Contract cumulative position updated
- [ ] PV generated and ledger posted same-day

**System blocks.** Paying more than the certified net is impossible. Paying a certificate twice is
impossible.

---

### FIN-SUB-07 — Subcontract final account and retention release

**Owner:** Dembi · **Trigger:** Completion, or defect liability expiry · **Frequency:** Per contract

**Today.** Not described by anyone. [G] Which means retention money — if it is being held at all — may
be sitting on the balance sheet with no process that releases it, or worse, may not be tracked
per-contract at all.

**Action sequence.**

1. Compile the final account: total certified, total variations approved, total deductions, total paid,
   retention held, advance recovered, penalties applied.
2. Verify completion: handover certificate, snag list closed, test results complete, as-built documents
   received.
3. Confirm the advance is fully recovered. Any unrecovered balance becomes a recoverable debt and must
   be settled before release.
4. Release the first retention portion at practical completion per contract terms.
5. Open the defect liability period with an automatic reminder at expiry.
6. At expiry, verify no outstanding defects, then release the second retention portion.
7. Route each release for approval per matrix.
8. Close the contract; freeze the record; archive the document set.
9. Write the subcontractor's final performance record — on-time, quality, disputes, defects — into the
   vendor master for future selection.

**Definition of Done.**

- [ ] Final account agreed and signed by both parties
- [ ] Advance fully recovered or formally settled
- [ ] Retention released in accordance with contract terms, with approvals
- [ ] Defect liability period tracked to expiry with evidence of no outstanding defects
- [ ] Contract closed and archived
- [ ] Performance record written to the vendor master

**System blocks.** Contract closure is refused with an unrecovered advance, an unreleased or
unexplained retention balance, or an open defect. Retention release is refused before the contractual
date without an approval one tier higher.

---

## D — Rentals and Equipment Finance

> This group addresses finding **F-07**, which we assess as Mesael's largest quantifiable and
> currently invisible financial leak.

### FIN-RNT-01 — Register the rental agreement and its financial basis

**Owner:** Firehiwot · **Trigger:** Approved machinery request · **Frequency:** Per rental

**Today.** Firehiwot processes the specification, sources the lessor, prepares and signs the agreement,
and finance pays 100% in advance based on **estimated hours**. [C]

**Action sequence.**

1. Register the lessor as a party with verified TIN and bank details.
2. Create the rental agreement against the project and WBS activity: equipment type, identification or
   plate number, capacity.
3. Record the **charging basis explicitly** — per hour, per day, per month, or lump sum — and the rate.
4. Record the estimated quantity (hours/days), the minimum guaranteed quantity if any, and the
   resulting estimated value.
5. Record what the rate includes and excludes: operator, fuel, mobilisation, demobilisation,
   maintenance, idle-time treatment, breakdown treatment.
6. Record the **advance percentage and — critically — the reconciliation basis**: what happens if
   actual usage is below estimate. This single field is the fix for F-07.
7. Record the agreed evidence for hours: hour-meter photograph, signed daily log, GPS/telematics if
   available.
8. Attach the signed agreement.
9. Route for approval per matrix; register the commitment against the budget.

**Definition of Done.**

- [ ] Charging basis, rate, estimated quantity and total recorded as structured fields
- [ ] Inclusions and exclusions explicitly recorded
- [ ] Advance percentage **and** reconciliation basis recorded
- [ ] Evidence standard for hour verification agreed and recorded
- [ ] Signed agreement attached, signature authority validated
- [ ] Commitment registered

**System blocks.** A rental agreement cannot be activated without a reconciliation basis. An agreement
with an advance above the configured percentage requires owner-level approval.

---

### FIN-RNT-02 — Pay the rental advance

**Owner:** Leta · **Trigger:** Approved active rental agreement · **Frequency:** Per rental

**Today.** 100% of the estimated value is paid up front. [C]

**Why it fails.** A 100% advance transfers all performance risk to Mesael. If the equipment breaks
down, arrives late, or works fewer hours than estimated, the company has already paid. Nothing in the
described process recovers the difference.

**Action sequence.**

1. Raise the advance from the agreement — the system calculates from the recorded percentage.
2. Where the advance exceeds the configured threshold percentage, the system **requires** owner
   approval and displays the exposure explicitly: "ETB X paid in advance against unperformed service."
3. Approve and execute (FIN-TRE-03), applying withholding per configuration.
4. Post to **prepaid rental (an asset), not to project cost.** Cost is recognised as hours are actually
   consumed. This is the accounting change that makes the leak visible.
5. Open the usage account for the agreement: advance paid, hours consumed to date, value consumed,
   prepaid balance remaining.
6. Set the reconciliation task (FIN-RNT-05) to trigger at agreement end or at off-hire.

**Definition of Done.**

- [ ] Advance calculated from the agreement, not typed
- [ ] Exposure displayed to the approver in monetary terms
- [ ] Posted to prepaid rental, not to expense
- [ ] Usage account opened with a running prepaid balance
- [ ] Reconciliation task scheduled and owned

**System blocks.** Advance above the agreed percentage is refused. A second advance on the same
agreement requires the reconciliation of the first.

---

### FIN-RNT-03 — Capture and certify actual operating hours

**Owner:** Site (capture), John (certification) · **Trigger:** Daily during hire · **Frequency:** Daily

**Today.** Hours are tracked informally against thresholds like 200 and 300 hours, and Firehiwot names
"hardships in tracking exact operating hours" as a pain point. [C] The dispute mechanism between site
managers and lessors is explicitly unclear. [G]

**Action sequence.**

1. Site records daily usage against the rental agreement: start meter, end meter, hours worked, idle
   hours, breakdown hours, operator name.
2. Attach the agreed evidence — typically a photograph of the hour meter, captured on a mobile device.
3. Record downtime with cause and whether it is chargeable under the agreement's terms.
4. System accumulates: hours to date, value consumed to date, prepaid balance remaining, and projected
   end date at the current rate of use.
5. Site supervisor or PM certifies the daily or weekly log. The lessor's representative
   counter-acknowledges where the agreement requires it.
6. System raises alerts: at configured percentage of estimated hours consumed; when the agreement is
   near expiry; and when idle or breakdown hours exceed the agreed tolerance.
7. Disputed hours are logged as *disputed* with evidence from both sides and routed to Dembi.

**Definition of Done.**

- [ ] Daily log entered for every hire day, with no unexplained gaps
- [ ] Meter evidence attached per the agreed standard
- [ ] Idle and breakdown hours separated from productive hours
- [ ] Log certified by a named site supervisor or PM
- [ ] Running consumed-versus-prepaid position current
- [ ] Disputes logged with evidence rather than resolved verbally

**System blocks.** Off-hire (FIN-RNT-04) cannot be processed with missing log days. An extension cannot
be approved without a current usage position.

---

### FIN-RNT-04 — Approve extensions and off-hire

**Owner:** Firehiwot (raise) + Dembi (approve) · **Trigger:** Approaching expiry, or work complete
· **Frequency:** Per event

**Today.** Managed manually; Firehiwot describes difficulty managing extensions and returns before
agreements expire. [C]

**Action sequence.**

**Extension:**
1. System alerts before expiry, showing hours consumed, hours remaining, and prepaid balance.
2. Requester raises the extension with additional quantity, revised end date, and justification.
3. System shows the budget effect and the revised total rental cost for the project.
4. Approve per matrix; amend the agreement as a new version; register the additional commitment.
5. Pay any additional advance per FIN-RNT-02.

**Off-hire:**
1. Site raises the off-hire with the final meter reading and evidence.
2. Record the equipment condition on return; note any damage claim with photographs.
3. Lessor acknowledges the final reading — or the disagreement is logged as a dispute.
4. System computes final consumed hours and final value.
5. Off-hire triggers FIN-RNT-05 automatically. It is not optional and not manual.

**Definition of Done.**

- [ ] Extension: approved before expiry, agreement versioned, commitment updated, budget effect recorded
- [ ] Off-hire: final meter reading captured with evidence and lessor acknowledgement
- [ ] Condition on return recorded, damage claims raised
- [ ] Reconciliation task automatically created and assigned

**System blocks.** Equipment cannot remain in *On hire* status past the agreement end date without
either an approved extension or an off-hire — the system escalates daily to Firehiwot and Dembi until
one exists.

---

### FIN-RNT-05 — Reconcile the advance against actual usage and settle

**Owner:** Dembi · **Trigger:** Off-hire or agreement end · **Frequency:** Per rental

**Today.** **This task does not exist.** [G] It is the missing step that makes F-07 invisible.

**Action sequence.**

1. System compiles: advance paid, total certified hours, rate, value consumed, and the difference.
2. Three outcomes, each with a defined path:
   - **Under-consumed** — the lessor owes a refund, or the balance is credited against another hire.
     A **recovery action is raised with an owner and a deadline.** It does not simply sit there.
   - **Over-consumed** — additional payment is due; it goes through the normal approval and payment
     path.
   - **Matched within tolerance** — settle and close.
3. Recognise the actual cost into project cost against the WBS activity, clearing the prepaid balance.
4. Where a refund is not recoverable in cash, record it explicitly as a **rental variance loss**,
   attributed to the project and to the person who set the estimate. Not to punish anyone — to make the
   estimating error visible so the next estimate is better.
5. Write the lessor's performance record: availability, breakdowns, hour disputes, condition on return.
6. Close the agreement and archive.
7. Feed the estimate-versus-actual variance into the rental estimating benchmark for future requests.

**Definition of Done.**

- [ ] Advance versus actual computed and the difference explicitly classified
- [ ] Recovery, additional payment, or documented write-off completed — never simply left open
- [ ] Prepaid balance cleared to zero
- [ ] Actual cost recognised against the correct project and activity
- [ ] Variance recorded and attributed
- [ ] Lessor performance recorded; agreement closed

**System blocks.** A rental agreement cannot reach *Closed* with a non-zero prepaid balance. Period
close (FIN-GLR-05) reports every open prepaid rental balance to Dembi and Mesael, so no advance can
quietly age out of view.

> **Expected impact.** With the interviews indicating routine 100% advances against estimates, on
> thresholds of 200–300 hours, this single task converts an entire class of loss from invisible to
> measured. We would recommend it be built in the first delivery phase, ahead of features that are
> more visible but worth less.

---

## E — Petty Cash

### FIN-PCH-01 — Establish and assign the petty cash float

**Owner:** Dembi · **Trigger:** Float creation or change · **Frequency:** Rare

**Today.** Petty cash exists as a physical box managed by Leta. [C] The ceiling is disputed — cited as
ETB 50,000–60,000 by Samuel [C], listed as an unanswered question by Leta. [G]

**Action sequence.**

1. Create the fund: name, location (head office or named site), currency, custodian, and a **named
   backup custodian**.
2. Set the float amount and the **single-transaction ceiling** — the amount above which a formal bank
   transfer is mandatory. This is the number that must be confirmed with Dembi and Mesael.
3. Set the permitted expense categories. Petty cash should not be able to pay for materials that belong
   in the procurement process.
4. Set the replenishment trigger threshold and the maximum days between acquittals.
5. Owner approval of the float and ceiling; record it.
6. Issue the float and record the opening balance.

**Definition of Done.**

- [ ] Fund created with a named custodian and backup
- [ ] Float amount and single-transaction ceiling set and approved
- [ ] Permitted categories restricted
- [ ] Replenishment and acquittal rules configured
- [ ] Opening balance recorded and acknowledged by the custodian

**System blocks.** A payment above the ceiling cannot be made from petty cash — the system routes it to
the bank transfer process instead. Splitting one expense into several below-ceiling transactions is
detected and flagged (same payee, same day, same category).

---

### FIN-PCH-02 — Disburse petty cash against an authorised request

**Owner:** Leta (custodian) · **Trigger:** Approved small expense · **Frequency:** Daily

**Today.** Cash goes out for site transport, ride fees, urgent fuel, office consumables. [C] Receipts
come back afterwards. [C] Reception buys stationery and kitchen supplies against office cash. [C]

**Action sequence.**

1. Requester raises a petty cash request on mobile: amount, purpose, category, project or overhead,
   and expected date of acquittal.
2. System validates: within ceiling, within permitted category, requester has no overdue unacquitted
   advance.
3. Approve per matrix — a low threshold, so this genuinely does not reach Mesael.
4. Custodian disburses and records: amount, recipient, date, and the recipient's acknowledgement
   (signature capture or PIN).
5. System creates the **acquittal obligation** with a due date at the moment the cash is handed over.
6. Running fund balance updates immediately.

**Definition of Done.**

- [ ] Request approved before the cash moves — not after
- [ ] Within ceiling and permitted category
- [ ] Recipient acknowledgement captured
- [ ] Acquittal obligation created with a due date and an owner
- [ ] Fund balance updated in real time

**System blocks.** A requester with an overdue acquittal cannot receive further petty cash until it is
cleared. This one rule, on its own, ends most petty cash leakage.

---

### FIN-PCH-03 — Acquit petty cash and close the daily count

**Owner:** Leta · **Trigger:** Expense incurred; end of day · **Frequency:** Daily

**Today.** Daily reports "balance the cash box back to zero". [C] That is a cash count, not an
acquittal — it proves the physical money adds up, not that the spending was authorised or documented.

**Action sequence.**

1. Recipient submits the acquittal: actual amount spent, receipt photograph, vendor name, and vendor
   TIN where a formal receipt exists.
2. Return any unspent balance; the system records the return and adjusts the fund.
3. Custodian verifies the receipt against the disbursement and accepts or queries it.
4. System codes the expense to the project, WBS activity or overhead account, and applies the correct
   tax treatment.
5. **Daily close:** custodian enters the physical cash count. System computes: opening + replenishments
   − disbursements + returns = expected. Expected versus counted must reconcile.
6. Any difference is recorded as a **cash overage or shortage** with an explanation, and is escalated
   above a configured amount. Differences are never absorbed silently.
7. Custodian signs off the daily close; a second person reviews it periodically per the configured
   frequency.

**Definition of Done.**

- [ ] Every disbursement is either acquitted with a receipt or has an overdue flag visible to Dembi
- [ ] Unspent balances returned and recorded
- [ ] Every acquitted expense coded to a project or overhead with tax treatment applied
- [ ] Physical count matches the system balance, or the difference is documented and escalated
- [ ] Daily close signed
- [ ] Ledger posting created — same day, not at month end

**System blocks.** The day cannot close with an unexplained difference. The custodian cannot both
disburse and independently review their own close.

---

### FIN-PCH-04 — Replenish the float and govern the emergency cash route

**Owner:** Dembi · **Trigger:** Threshold reached, or an emergency · **Frequency:** Weekly / as needed

**Today.** Replenishment is undescribed. [G] The emergency route is vivid and uncontrolled: when
machinery or vehicles stop for want of payment, **reception is dispatched to the bank**; if she is
unavailable, finance staff go themselves. [C] Separately, the purchaser pays garages by mobile banking
for amounts around ETB 15,000 when petty cash is impractical. [C]

**Why it fails.** Three different people, using three different instruments, can move company money
outside any documented control, under time pressure, with no pre-authorisation. This is finding F-11.

**Action sequence.**

**Replenishment:**
1. System triggers at the threshold, generating the replenishment request from acquitted expenses.
2. Only **acquitted** expenses count towards replenishment. Unacquitted advances are not reimbursed —
   this is what forces documentation discipline without anyone having to nag.
3. Approve per matrix; execute the transfer or cash withdrawal; record and update the float.

**Emergency route — replacing the bank run:**
1. Requester raises an **Emergency Payment** with a mandatory reason from a controlled list, the
   downtime cost, and evidence (photograph of the stopped equipment, garage assessment).
2. Route to a fast-track queue with a target response time measured in minutes, on mobile, to whoever
   currently holds authority — Mesael, or Dembi under delegation (FIN-GOV-03).
3. On approval, execute **electronically**. The purpose of the fast-track queue is to make the
   electronic path faster than sending a person to a branch, which is the only durable way to end the
   physical bank run.
4. Where a physical bank visit is genuinely unavoidable, the system issues a **cash movement
   authorisation**: named authorised carrier, amount, purpose, expected duration, and a mandatory
   confirmation on return. Reception staff are not on the list of permitted carriers.
5. Every emergency payment is logged to the exception register, reported weekly to Mesael with the
   reason, and analysed monthly: if the same reason recurs, the underlying process is fixed rather than
   the exception being used repeatedly.
6. Mobile-banking garage payments are brought inside this route with their own category and ceiling
   (FIN-RNT / fleet), so they stop being a fourth invisible channel.

**Definition of Done.**

- [ ] Replenishment covers acquitted expenses only
- [ ] Every emergency payment has a reason, evidence, and an approval before the money moves
- [ ] Electronic execution used unless a physical visit is authorised in writing
- [ ] Any physical cash movement has a named authorised carrier and a return confirmation
- [ ] No non-finance staff member appears as a carrier or executor
- [ ] Emergency register reviewed weekly and root causes actioned monthly

**System blocks.** Reception and other non-finance roles cannot be selected as cash carriers or payment
executors — enforced by role, not by memory. Emergency payments above the configured amount require
Mesael personally regardless of any standing delegation.

---

## F — Payroll

> Payroll is the largest single recurring outflow the CEO named — *"I pay nearly 6 to 8 million Birr in
> wages"* [C] — and it is the least documented process in the entire interview set. Almost everything
> in this group is [G]. We have specified it to a defensible standard and flagged every assumption.

### FIN-PAY-01 — Maintain payroll master data

**Owner:** Dembi · **Trigger:** Hire, change, termination · **Frequency:** Ongoing

**Today.** Not described. Kalkidan states explicitly that she does **not** do payroll — Leta does. [C]
Contract renewals are handled manually by administrative staff, in the absence of an HR function. [C]

**Action sequence.**

1. Maintain the employee record: identity, TIN, pension membership number, bank account, employment
   type (permanent, contract, daily labour), start date, contract end date.
2. Record the salary structure: basic salary, allowances by type (transport, housing, hardship, site,
   fuel), overtime eligibility and rate basis.
3. Record deduction rules: employment income tax, pension employee contribution, employer pension
   contribution, loans and advances, union or other deductions.
4. Record cost allocation: which project and WBS activity, or overhead, each employee's cost is charged
   to. **Site staff costs are project costs and must reach project cost reports**, or project
   profitability is wrong by construction.
5. Every change requires effective-dating and approval — no retroactive silent edits.
6. Contract end dates raise renewal reminders ahead of expiry.

**Definition of Done.**

- [ ] Every active employee has TIN, pension number and verified bank account
- [ ] Salary structure and allowances recorded as structured fields
- [ ] Cost allocation to project or overhead set for every employee
- [ ] All changes effective-dated and approved
- [ ] No employee record incomplete at payroll run time

**System blocks.** Payroll cannot run for an employee with incomplete tax or bank data. Ad-hoc salary
changes outside the approval route are impossible.

---

### FIN-PAY-02 — Collect and certify attendance and timesheets

**Owner:** John and site supervisors · **Trigger:** Payroll period · **Frequency:** Daily capture,
monthly certification

**Today.** Timesheets exist as paper documents that reach Kalkidan late and sometimes missing. [C]
Daily manpower counts are reported through Telegram groups. [C]

**Action sequence.**

1. Site captures daily attendance per employee and per daily-labour worker, against project and
   activity.
2. Record overtime separately, with the reason and a pre-approval where the configuration requires one.
3. Record absence, leave and its type.
4. Supervisor certifies the daily record; the PM certifies the period record.
5. System reconciles daily labour counts against the daily site report (which already exists in the
   Telegram practice) — a discrepancy between "40 workers on site" in the daily report and 46 on the
   payroll is exactly the kind of thing that is currently undetectable. [I]
6. Certified timesheets close the period and feed the payroll run.

**Definition of Done.**

- [ ] Attendance recorded for every payroll-eligible person for every working day
- [ ] Overtime separately recorded and pre-approved where required
- [ ] Supervisor and PM certification recorded
- [ ] Daily labour reconciled against site reports, discrepancies explained
- [ ] Period closed and locked before the payroll run

**System blocks.** Payroll cannot run on an uncertified period. Post-certification changes require
re-certification.

---

### FIN-PAY-03 — Run and check the payroll

**Owner:** Leta · **Trigger:** Certified period · **Frequency:** Monthly

**Action sequence.**

1. Run payroll for the period from master data and certified timesheets.
2. Compute per employee: gross, allowances (taxable and non-taxable separately), overtime, employment
   income tax per the configured bands, employee pension, employer pension, other deductions, and net
   pay.
3. Produce the exception report **before** anyone looks at the totals: new joiners, leavers, net pay
   varying more than a configured percentage from last period, zero or negative net pay, duplicate bank
   accounts across employees, employees absent all period but still paid.
4. Preparer reviews and clears every exception with a recorded explanation.
5. Produce the payroll register, the bank payment file, the payslips, and the statutory schedules.
6. Produce the **cost allocation report** showing payroll cost by project and activity, which posts to
   project cost, not only to a general salaries account.
7. Independent check by a second person — Kalkidan checking Leta's run, or the reverse.

**Definition of Done.**

- [ ] Payroll computed from certified data only
- [ ] Every exception cleared with a recorded explanation
- [ ] Register, bank file, payslips and statutory schedules produced
- [ ] Cost allocated by project and activity
- [ ] Independent check completed by a person who did not prepare it
- [ ] Control totals agree: gross − deductions = net = bank file total

**System blocks.** The bank file cannot be produced with uncleared exceptions or with control totals
that do not agree.

---

### FIN-PAY-04 — Approve and disburse payroll

**Owner:** Mesael (approval) → Leta (execution) · **Trigger:** Checked payroll · **Frequency:** Monthly

**Action sequence.**

1. Route the payroll for approval with the summary, the period-on-period variance analysis, the
   exception clearances, and the cost-by-project breakdown.
2. Approver sees total gross, total net, total statutory liabilities, headcount movement, and the
   variance against the prior period and against budget.
3. On approval, generate and release the bank payment file under maker-checker (FIN-TRE-03).
4. Distribute payslips.
5. Post: gross to project cost and overhead, net to bank, statutory amounts to liability accounts.
6. Create the statutory payment obligations with their due dates automatically (feeding FIN-PAY-05).
7. Lock the payroll period.

**Definition of Done.**

- [ ] Approved with full variance information available to the approver
- [ ] Bank file released under maker-checker
- [ ] Payslips distributed
- [ ] Ledger and project cost postings complete
- [ ] Statutory liabilities raised with due dates
- [ ] Period locked; any subsequent change is an off-cycle adjustment with its own approval

**System blocks.** A locked payroll period cannot be edited. Off-cycle payments require separate
approval and are reported.

---

### FIN-PAY-05 — File and pay employment tax and pension

**Owner:** Yamrot · **Trigger:** Payroll locked · **Frequency:** Monthly, to a statutory deadline

**Today.** Not described. [G] Yamrot handles sales and purchase declarations; whether she also handles
employment tax and pension is unstated.

**Action sequence.**

1. System generates the employment income tax schedule and the pension schedule from the locked
   payroll — no re-keying into Excel.
2. Reconcile the schedules to the payroll register and to the ledger liability balances. All three must
   agree before filing.
3. File through the Revenues Authority portal and with the pension agency in the required format.
4. Record the filing: date, reference, and the acknowledgement document attached.
5. Pay the liabilities; record the payment reference and attach the receipt.
6. Clear the liability accounts.
7. Deadline monitoring with escalating reminders — and, if a deadline passes, a penalty-exposure alert
   to Dembi and Mesael rather than silence.

**Definition of Done.**

- [ ] Schedules generated from the system, not rebuilt in Excel
- [ ] Payroll register, schedule and ledger liability agree exactly
- [ ] Filed before the statutory deadline, with the acknowledgement attached
- [ ] Paid, with the receipt attached
- [ ] Liability accounts cleared to zero
- [ ] No open statutory obligation past its due date

**System blocks.** Period close is refused with an unfiled statutory return past its deadline; the
exception appears on the CEO dashboard.

---

## G — Order to Cash

### FIN-OTC-01 — Establish the client contract billing plan

**Owner:** Dembi · **Trigger:** Contract award · **Frequency:** Per contract

**Today.** The contract exists as a paper agreement. Yamrot reads it to work out which payment stage
applies when someone tells her to issue a receipt. [C] There is no structured billing plan.

**Why it fails.** If the billing plan is not data, nothing can tell the company that a milestone has
been reached and not billed. Revenue is claimed when someone remembers to claim it.

**Action sequence.**

1. Register the client: legal name, TIN, VAT status, whether a government body (this changes the
   documentation and collection route), contacts, and the paying office address.
2. Create the contract: value, currency, start and end dates, contract type, and the applicable
   contract form.
3. Enter the **billing plan as structured milestones** — advance, 1st, 2nd, 3rd payment and so on, as
   Yamrot describes them [C] — each with its trigger condition, percentage or amount, and required
   certification.
4. Record the financial terms: advance percentage and recovery, retention percentage and release
   conditions, payment period, VAT treatment, withholding the client will deduct at source, and any
   price adjustment clause.
5. Record any required securities: bid bond release, performance guarantee, advance payment guarantee,
   with values and expiry dates (linking to FIN-CMF-03).
6. Attach the signed contract and all annexes.
7. Approve and activate. Contract value becomes the project revenue baseline (feeding FIN-BCC-01).

**Definition of Done.**

- [ ] Client registered with TIN and VAT status
- [ ] Every billing milestone entered with trigger, value and certification requirement
- [ ] Advance, retention, withholding and payment terms captured as fields
- [ ] Guarantees registered with expiry dates
- [ ] Signed contract attached
- [ ] Revenue baseline established for the project

**System blocks.** No client invoice can be raised outside the registered billing plan without an
explicit exception approval.

---

### FIN-OTC-02 — Certify a billing milestone and raise the client invoice

**Owner:** Dembi · **Trigger:** Milestone condition met · **Frequency:** Per milestone

**Today.** **The trigger is a verbal instruction from any one of three people** — Mesael, Dembi or
Leta. [C] Nothing checks whether the milestone was certified, whether it was already billed, or
whether the amount matches the contract.

**Why it fails.** This is finding F-12. Revenue — the company's own money coming in — depends on
someone remembering. Under-billing is invisible; double-billing is possible; premature billing creates
a tax liability before the cash arrives.

**Action sequence.**

1. System monitors milestone conditions against project progress (FIN-BCC-03, project measurements)
   and **raises the billing opportunity itself** when a milestone becomes due. Nobody has to remember.
2. Assemble the certification evidence: progress measurement, consultant or client-engineer
   certification, and any required test or handover documents.
3. System computes the invoice: milestone value, less advance recovery, less retention the client will
   hold, plus VAT per configuration, less any withholding the client will deduct at source — showing
   both the invoice value and the expected cash receipt, which are different numbers.
4. Check against the contract: this milestone has not already been billed; cumulative billing does not
   exceed contract value plus approved variations.
5. Route for approval per the authority matrix. **This replaces the "any of three people can say so"
   trigger with a single defined authority.**
6. On approval, generate the client invoice with a sequential number and issue it.
7. Register the receivable with a due date computed from the contract payment period.
8. Trigger FIN-OTC-03 for the official tax receipt.

**Definition of Done.**

- [ ] Milestone certified with evidence attached before invoicing
- [ ] Invoice computed by the system from contract terms, not typed
- [ ] Duplicate-milestone check passed
- [ ] Cumulative billing within contract value plus approved variations
- [ ] Approved by the single defined authority
- [ ] Invoice numbered, issued, and receivable registered with a due date
- [ ] Expected net cash receipt shown alongside the gross invoice value

**System blocks.** Billing the same milestone twice is impossible. Billing beyond the contract value
requires an approved variation. Invoicing without certification evidence is refused.

---

### FIN-OTC-03 — Issue the official tax receipt

**Owner:** Yamrot · **Trigger:** Approved client invoice · **Frequency:** Per milestone

**Today.** Yamrot cuts the receipt from a paper book on instruction, stating the exact payment stage,
then emails copies back to the three instructors. [C]

**Why it fails.** Not the issuing itself — Yamrot's process is careful and she knows the contract
stages. The failure is upstream: she is executing an instruction that has not been validated against
anything, and the receipt book itself is not sequentially controlled in any system.

**Action sequence.**

1. System presents Yamrot the approved invoice with the payment stage already determined from the
   contract — she confirms rather than derives it.
2. Allocate the next sequential receipt number from the registered receipt book (as FIN-TRE-04 controls
   cheque books).
3. Issue the receipt in the format required by the Revenues Authority, carrying the correct TIN, VAT
   treatment, payment stage description and contract reference.
4. Attach the scan of the physical receipt to the invoice record.
5. System distributes copies automatically to Mesael, Dembi, Leta and the project — replacing the
   manual email distribution she does today.
6. Register the sale into the monthly sales aggregation for tax (FIN-TAX-02) **at this moment**, not by
   re-typing at month end.
7. Handle voided or spoiled receipts explicitly: reason, retention of the physical copy, and no gap in
   the sequence.

**Definition of Done.**

- [ ] Receipt issued only against an approved invoice
- [ ] Sequential number allocated from a registered book; no gaps unexplained
- [ ] Correct TIN, VAT treatment and payment stage on the document
- [ ] Scan attached to the transaction
- [ ] Distribution completed automatically
- [ ] Sale registered into the tax aggregation immediately
- [ ] Voids recorded with reason and physical retention

**System blocks.** A receipt cannot be issued without an approved invoice. A receipt number cannot be
re-used or skipped without a recorded void.

---

### FIN-OTC-04 — Dispatch the original and track custody

**Owner:** Yamrot · **Trigger:** Receipt issued · **Frequency:** Per receipt

**Today.** The original physical receipt is routed to the site or the client office; for government
contracts a **runner delivers it and returns with the payment cheque**. [C] The identity of the runner
is an explicit open question. [G]

**Why it fails.** A negotiable instrument — a cheque for a construction progress payment — is being
carried by an unidentified person with no custody record on either leg of the journey.

**Action sequence.**

1. Create the dispatch record: document, destination office, recipient name and title, expected
   delivery date, and the **named carrier** — who must be an authorised individual, not "whoever is
   available".
2. Carrier acknowledges receipt of the document at handover.
3. Capture proof of delivery: the client's stamp, signature, or an inward registration number from the
   client's own registry. Government offices normally register incoming documents — that registration
   number is the strongest proof of delivery available and should be captured every time.
4. Record the outcome: delivered and awaiting payment, delivered with cheque collected, or rejected
   with reason.
5. If a cheque is collected, record it immediately on the mobile device — cheque number, amount, date,
   drawer bank — creating the custody chain before the carrier returns to the office.
6. On return, the cheque is handed to finance and the handover is acknowledged by both parties.
7. Escalate any dispatch not acknowledged within the configured period.

**Definition of Done.**

- [ ] Named authorised carrier recorded for every dispatch
- [ ] Proof of delivery captured, ideally with the client's inward registration reference
- [ ] Any collected cheque recorded at the point of collection, not at the point of return
- [ ] Handover to finance acknowledged by both parties
- [ ] No dispatch remains open beyond its escalation period

**System blocks.** A cheque cannot be recorded as received into finance without a matching collection
record and an acknowledged handover.

---

### FIN-OTC-05 — Record collection and bank the cheque

**Owner:** Leta · **Trigger:** Cheque or transfer received · **Frequency:** Per collection

**Action sequence.**

1. Record the receipt: instrument, amount, date, drawer, cheque number or transfer reference.
2. **Apply it to the specific invoice**, not to the client as an undifferentiated balance. Part
   payments are applied line by line and the residual stays visible.
3. Reconcile the amount received against the amount expected: where the client has deducted withholding
   or retention, record each deduction separately and — for withholding — record the client's
   withholding certificate as receivable, because that certificate is a claimable tax asset.
4. Where the received amount differs from expectation without explanation, raise a query task assigned
   to a named person with a deadline.
5. Deposit; record the deposit slip and the bank account; attach the slip.
6. Track clearance from the bank statement import; a bounced cheque reopens the receivable and
   escalates immediately.
7. Post: bank debit, receivable credit, retention receivable and withholding receivable recognised
   separately.
8. Update the receivables ageing (FIN-OTC-06) and the cash position (FIN-TRE-02).

**Definition of Done.**

- [ ] Receipt applied to specific invoices
- [ ] Every deduction by the client identified and separately recorded
- [ ] Client withholding certificate obtained or chased
- [ ] Deposited, with the slip attached, and tracked to *Cleared*
- [ ] Ledger posted with retention and withholding recognised as assets, not lost
- [ ] Receivables ageing and cash position updated

**System blocks.** A cheque cannot sit in *Received* status beyond the configured banking deadline
without escalation — cash in a drawer is a risk, not an asset.

---

### FIN-OTC-06 — Manage receivables ageing and client-held retention

**Owner:** Dembi · **Trigger:** Continuous · **Frequency:** Weekly review

**Today.** **This does not exist.** [I] Nothing described tracks what Mesael is owed, by whom, or for
how long. For a company whose work is "predominantly conducted with government entities" [C] — which
are characteristically slow payers — this is the most consequential absence in the money-in side of the
business.

**Why it matters commercially.** The cash pressure that produces urgent bank runs, the Monday payment
batch, and the owner's need to personally gate every disbursement is at least partly a *receivables*
problem being managed as a *payments* problem. You cannot fix payment sequencing without knowing when
money is coming in.

**Action sequence.**

1. Maintain the live receivables register: every issued invoice, its due date, amount, amount received,
   and balance.
2. Age automatically into buckets: current, 1–30, 31–60, 61–90, 90+ days overdue.
3. Track client-held **retention separately** from ordinary receivables, with the expected release date
   from the contract terms — retention is a receivable with a long fuse, and it is routinely forgotten.
4. Track outstanding **client withholding certificates**, which are claimable against tax and therefore
   real money.
5. Automatic escalation ladder: reminder before due, follow-up on due date, escalation to Dembi, then
   to Mesael, then a formal letter generated from the system.
6. Record every collection contact — date, person, what they said, what they promised — so the
   follow-up history is institutional rather than personal.
7. Weekly receivables review with Dembi; monthly to Mesael, with the expected collection profile
   feeding the cash forecast in FIN-TRE-02.
8. Flag disputed amounts separately so genuine disputes do not hide inside ordinary ageing.

**Definition of Done.**

- [ ] Every issued invoice appears with a due date and current balance
- [ ] Ageing current as of today, not as of the last month-end
- [ ] Retention tracked separately with expected release dates
- [ ] Withholding certificates tracked to collection
- [ ] Escalation ladder running automatically with contacts logged
- [ ] Expected collections feeding the cash forecast
- [ ] Disputes flagged and separately owned

**System blocks.** None — this is a monitoring task. But an overdue receivable above a configured age
and value appears permanently on the CEO dashboard until it is resolved or formally written off with
approval.

---

## H — Tax and Statutory Compliance

> **Important caveat.** Every rate, threshold and deadline in this group is a **configuration
> placeholder marked [A]**. Ethiopian tax law has changed materially in recent years, and Mesael's
> obligations depend on its VAT registration status, its contractor category and the nature of its
> clients. These must be validated with Yamrot and against current law before build. The *process*
> definitions below hold regardless of what the numbers turn out to be — which is exactly why rates
> are configuration and not code.

### FIN-TAX-01 — Maintain the tax configuration

**Owner:** Yamrot + Dembi · **Trigger:** Law change, rate change, registration change · **Frequency:**
Rare, high impact

**Today.** The tax knowledge lives in Yamrot's head and in her Excel sheets. [C] She resolves errors by
travelling to the tax office in person. [C]

**Action sequence.**

1. Register each applicable tax type with: name, basis, rate or band table, threshold, filing frequency,
   filing deadline rule, payment deadline rule, required form or format, and effective-from date.
2. Placeholder set to be validated [A]: VAT on sales and purchases; withholding tax on payments to
   suppliers and subcontractors, with its threshold; employment income tax bands; employee and employer
   pension contributions; business profit tax; and any turnover-based or sector-specific charge
   applicable to construction.
3. Record Mesael's own registration data: TIN, VAT registration number and effective date, tax centre,
   fiscal year definition, and filing calendar.
4. Version every rate with effective dates, so a transaction is always taxed at the rate in force on
   its own date — not the rate in force when it was eventually posted. Given that posting currently
   runs 1–2 months late [C], this is not a theoretical concern.
5. Map each tax type to its ledger liability and receivable accounts.
6. Maintain the compliance calendar with all filing and payment deadlines and their owners.

**Definition of Done.**

- [ ] Every applicable tax type configured with rate, threshold, frequency and deadline
- [ ] All rates effective-dated and versioned
- [ ] Company registration data recorded
- [ ] Ledger account mapping complete
- [ ] Compliance calendar populated with owners and reminders
- [ ] Configuration reviewed and signed off by Yamrot and Dembi

**System blocks.** A transaction type with no tax configuration cannot be posted — this prevents
untaxed or wrongly taxed transactions entering the ledger silently.

---

### FIN-TAX-02 — Aggregate monthly sales

**Owner:** Yamrot · **Trigger:** Month end · **Frequency:** Monthly

**Today.** Yamrot aggregates total monthly sales in Excel and declares them on the portal. [C]

**Action sequence.**

1. System aggregates all issued receipts and invoices for the tax period **from the transactions
   themselves** (FIN-OTC-03) — no re-typing, no Excel intermediate.
2. Classify by VAT treatment: standard-rated, zero-rated, exempt, out of scope.
3. Reconcile three ways: receipt book sequence (no gaps), sales ledger, and the tax schedule. All three
   must agree.
4. Handle credit notes, voided receipts and adjustments explicitly.
5. Produce the sales schedule in the exact format the portal requires.
6. Yamrot reviews and confirms.

**Definition of Done.**

- [ ] Every issued receipt in the period is included, and the sequence has no unexplained gaps
- [ ] VAT classification applied per line
- [ ] Sales ledger, receipt sequence and tax schedule reconcile exactly
- [ ] Credit notes and voids treated correctly
- [ ] Schedule produced in portal format without manual re-entry

**System blocks.** The declaration cannot be prepared with an unexplained gap in the receipt sequence.

---

### FIN-TAX-03 — Aggregate monthly purchases

**Owner:** Yamrot · **Trigger:** Month end · **Frequency:** Monthly

**Today.** This is the worst data path in the company. Site staff type paper purchase receipts into
local Excel sheets, email them to Yamrot, and she aggregates them for the portal. [C] Meanwhile
Kalkidan separately prepares tax schedules from Peachtree. [C] Two lineages, one statutory number,
nothing reconciling them.

**Action sequence.**

1. System aggregates purchases from **posted transactions with attached supplier receipts** — the
   procurement and petty cash processes have already captured them at source (FIN-P2P-05, FIN-PCH-03).
   The site Excel step disappears entirely.
2. Validate each purchase for claimability: supplier TIN present, supplier VAT-registered, receipt is a
   valid tax invoice, and the receipt is within the claimable period.
3. **Produce the non-claimable report** — purchases where the receipt is missing, invalid, or from an
   unregistered supplier. This report has direct monetary value: every line on it is VAT the company
   paid and cannot reclaim.
4. Classify by VAT treatment and by input-tax claimability.
5. Reconcile to the purchase ledger and to project cost.
6. Produce the schedule in portal format.

**Definition of Done.**

- [ ] Purchases sourced from posted transactions, never from a re-typed spreadsheet
- [ ] Every purchase validated for claimability with supplier TIN verified
- [ ] Non-claimable report produced, quantified, and routed to Dembi with the responsible site named
- [ ] Reconciled to the purchase ledger and project cost
- [ ] Schedule produced in portal format

**System blocks.** No manual addition of a purchase to the tax schedule without an attached receipt and
a supplier record — the route by which unsupported numbers currently enter the declaration is closed.

---

### FIN-TAX-04 — Prepare and file the VAT declaration

**Owner:** Yamrot · **Trigger:** Sales and purchase aggregation complete · **Frequency:** Monthly, to
deadline

**Action sequence.**

1. Compile the declaration: output VAT from sales, input VAT from claimable purchases, net payable or
   creditable, and any brought-forward credit.
2. Reconcile the declaration to the ledger VAT control accounts. A difference must be explained before
   filing, not after.
3. Second-person review — Kalkidan reviewing Yamrot's declaration. Today, nobody reviews it. [C]
4. Approve per the authority matrix.
5. File on the portal; capture the acknowledgement reference and attach the confirmation.
6. Pay any liability; attach the payment receipt.
7. Clear the VAT control accounts to the balance carried forward.
8. Archive the complete declaration pack: schedules, supporting listings, acknowledgement, payment
   proof.

**Definition of Done.**

- [ ] Declaration reconciles to the ledger control accounts exactly
- [ ] Independently reviewed and approved before filing
- [ ] Filed before the deadline with the acknowledgement attached
- [ ] Paid with the receipt attached
- [ ] Control accounts cleared
- [ ] Complete pack archived and retrievable in one action

**System blocks.** Period close is refused with an unfiled declaration past its deadline. Filing is
refused with an unexplained reconciling difference.

---

### FIN-TAX-05 — Prepare and file withholding tax

**Owner:** Yamrot · **Trigger:** Payments made in the period · **Frequency:** Monthly

**Today.** **Not described by anyone.** [G] Withholding does not appear in any interview account of the
payment process. Given the volume of supplier and subcontractor payments described, this is either
happening invisibly or not happening.

**Action sequence.**

1. System compiles all withholding raised during the period, generated automatically at payment time by
   FIN-P2P-07 and FIN-SUB-06.
2. Reconcile to the withholding liability account balance.
3. Confirm a withholding certificate was issued to every affected payee, and chase any that were not.
4. Produce the schedule by payee with TIN, gross, rate and amount withheld.
5. Review, approve, and file to the deadline.
6. Pay and attach the receipt; clear the liability.
7. Separately track **withholding suffered** — amounts clients deducted from Mesael's own invoices
   (FIN-OTC-05) — and confirm each has a certificate, because these are claimable against the company's
   own tax.

**Definition of Done.**

- [ ] All withholding raised at payment time is included; none added manually at month end
- [ ] Schedule reconciles to the liability account
- [ ] Certificate issued to every payee
- [ ] Filed and paid to deadline with evidence attached
- [ ] Withholding suffered tracked with certificates obtained
- [ ] Liability cleared to zero

**System blocks.** A payment subject to withholding cannot be executed without the withholding being
computed and the liability raised in the same transaction.

---

### FIN-TAX-06 — Obtain and track tax clearance certificates

**Owner:** Yamrot · **Trigger:** Renewal date, or a tender requirement · **Frequency:** Periodic

**Today.** Yamrot obtains tax clearances and settles tax payments as part of her role. [C] There is no
tracking of expiry.

**Why it matters commercially.** A lapsed tax clearance disqualifies a bid. This is not an
administrative detail — it is the difference between being able to tender and not.

**Action sequence.**

1. Register each certificate type required: tax clearance, VAT registration, business licence,
   contractor registration and grade, pension registration.
2. Record issue date, expiry date, issuing authority, reference number, and attach the document.
3. Set the reminder ladder well ahead of expiry — with lead times long enough to actually complete
   renewal, set from Yamrot's real experience of how long each takes.
4. Track the renewal application through to issue.
5. Make current certificates available for attachment to bid submissions in one action (FIN-CMF-03),
   instead of being hunted for under deadline pressure.

**Definition of Done.**

- [ ] Every required certificate registered with expiry and document attached
- [ ] Reminders configured with realistic lead times
- [ ] No certificate expired or expiring inside the reminder window without an active renewal
- [ ] Current versions attachable to bids in one action

**System blocks.** Bid submission (FIN-CMF-02) warns, and at the configured severity blocks, where a
required certificate is expired.

---

### FIN-TAX-07 — Manage assessments, corrections and penalties

**Owner:** Yamrot · **Trigger:** Assessment, query or error · **Frequency:** As arising

**Today.** Yamrot goes to the tax office in person when discrepancies or errors need correction. [C]
There is no record of what was queried, what was resolved, or what it cost.

**Action sequence.**

1. Register the case: type, period, tax type, amount in question, authority reference, date received.
2. Attach the assessment or query notice.
3. Assign an owner and a response deadline; statutory response windows are short and missing one is
   expensive.
4. Record the analysis: is the assessment correct, partly correct, or wrong, and on what evidence.
5. Record actions taken — correspondence, office visits, documents submitted — with dates.
6. Record the outcome: accepted, amended, appealed, or waived.
7. Post any additional tax, interest or penalty, **and record the root cause** — late filing, missing
   receipt, wrong classification — so the same cause can be counted and fixed.
8. Report the cumulative cost of tax penalties to Mesael quarterly. This number is currently unknown to
   anyone. [I]

**Definition of Done.**

- [ ] Case registered with the notice attached and a named owner
- [ ] Response filed within the statutory window
- [ ] Outcome recorded with supporting correspondence
- [ ] Financial effect posted
- [ ] Root cause recorded and categorised
- [ ] Case closed, or an appeal tracked to conclusion

**System blocks.** None — but an open case past its response deadline escalates to Dembi and Mesael
daily.

---

## I — Ledger, Close and Reporting

### FIN-GLR-01 — Generate the payment voucher

**Owner:** System (currently Kalkidan) · **Trigger:** Payment executed · **Frequency:** Per payment

**Today.** Kalkidan cuts cash payment vouchers **from bank statements or transaction dates**, after the
fact, and files them physically in box files 1–7. [C] Leta separately assigns PV codes and posts them
into a Telegram group. [C]

**Why it fails.** The voucher is being created from the bank statement, which means the bank statement
is the source of truth about the company's own payments. Two people are also assigning voucher
references in two different places, which is a reconciliation problem waiting to be discovered.

**Action sequence.**

1. On payment execution (FIN-TRE-03), the system generates the payment voucher **automatically and
   immediately**, from the transaction — not from the statement.
2. Allocate a sequential PV number from a controlled series, per payment type and fiscal period.
3. The PV carries, without re-entry: payee, amount, deductions, bank details, payment method and
   reference, project, WBS activity, budget line, cost code, ledger accounts, approval trail, and links
   to every supporting document.
4. Generate the PDF; make it printable for anyone who still wants paper.
5. Post the accounting entries (FIN-GLR-03) in the same transaction.
6. Notify the requester and the project with the PV reference — this replaces Leta's manual Telegram
   posting, and the reference now points to a record rather than to a message.

**Definition of Done.**

- [ ] PV generated automatically at payment, same day, no exceptions
- [ ] Sequential number allocated with no gaps
- [ ] All references populated automatically from the source transaction
- [ ] Every supporting document linked, not merely mentioned
- [ ] Ledger posting created in the same transaction
- [ ] PV retrievable by number, payee, project or date in one search

**System blocks.** No payment can exist without a PV. No PV can exist without a payment. The pair is
created atomically — this is what makes the reconstruction-from-bank-statement approach unnecessary.

---

### FIN-GLR-02 — Verify the document set against the transaction

**Owner:** Kalkidan · **Trigger:** Before approval, not after payment · **Frequency:** Per transaction

**Today.** Kalkidan checks whether the required attachments match and whether prices line up with the
signed agreements. [C] She does this **after** the money has gone, and then chases the missing pieces:
*"You might find payment requested with just a single piece of paper, and we have to push them back to
fulfil the rest."* [C]

**Why it fails.** Her check is a good check performed at the wrong moment. Verification after payment
can only detect a problem; verification before payment can prevent it. This task is simply moved
upstream — which is the single change with the largest effect in this entire document.

**Action sequence.**

1. System applies the **mandatory attachment matrix** (Section 8.3) by transaction type: it knows what
   a subcontract payment needs versus what a fuel purchase needs.
2. Missing documents are shown to the requester at submission — not discovered by Kalkidan a month
   later.
3. Kalkidan verifies content, which is the part only a person can do: prices match the agreement,
   quantities match the delivery, the agreement is signed and in date, the receipt is a valid tax
   invoice with a TIN, and the payee matches the contracted party.
4. She records a verification result: verified, or queried with a specific reason routed back to a
   named owner with a deadline.
5. Verification is a **prerequisite for approval** in the workflow, not a step after payment.
6. Where an emergency payment bypasses full verification, the system creates a mandatory follow-up with
   a deadline, escalating to Dembi and Mesael if unmet — and the payee's next payment is blocked until
   it clears.

**Definition of Done.**

- [ ] Attachment matrix satisfied for the transaction type
- [ ] Content verification recorded by a named verifier before approval
- [ ] Queries routed with reasons, owners and deadlines
- [ ] No transaction proceeds to approval unverified except through the logged emergency route
- [ ] Every emergency bypass has a closed follow-up

**System blocks.** Approval is unavailable on an unverified transaction. The emergency route exists, is
visible, is counted, and is reported — so it can be used when genuinely needed without becoming the
normal path.

---

### FIN-GLR-03 — Post to the ledger and project cost

**Owner:** System, reviewed by Kalkidan · **Trigger:** Every financial event · **Frequency:** Real time

**Today.** Kalkidan batch-posts into Peachtree monthly, or every one to two months, from accumulated
paper. [C] She is highly comfortable with Peachtree. [C]

**Action sequence.**

1. Every financial event generates its ledger entry **at the moment it occurs** — receipt, payment,
   accrual, payroll, depreciation, tax.
2. Each entry posts simultaneously to the **general ledger** and to **project cost** against the WBS
   activity and cost code. One entry, two views. This is what makes real-time project profitability
   possible and it is impossible in the current arrangement.
3. Apply the correct accounting treatment automatically: advances to prepayments not expense, retention
   to liability, rental advances to prepaid, and so on as specified throughout this document.
4. Kalkidan reviews the posting journal daily, focusing on exceptions rather than re-entering data.
5. Manual journals are permitted but require a reason, supporting documentation, and approval — and are
   listed separately in the close pack.
6. **Peachtree handling** — the answer depends on SRS question Q8, and both paths are supported:
   - *Peachtree remains the statutory ledger:* the system produces a validated, reconciled export in
     Peachtree's import format on a defined cycle, with a reconciliation report proving both sides
     agree. Kalkidan reviews and imports. She keeps the tool she is expert in.
   - *The system replaces Peachtree:* a mapped chart of accounts, a controlled opening-balance
     migration, and a parallel-run period where both are maintained and reconciled before cutover.
7. Until Q8 is answered, **assume integration, not replacement** [A] — it is the lower-risk path and it
   respects Kalkidan's expertise rather than discarding it.

**Definition of Done.**

- [ ] Every financial event posted the day it occurs, with no batch backlog
- [ ] GL and project cost posted from the same entry
- [ ] Correct treatment applied automatically for advances, retention and prepayments
- [ ] Daily journal reviewed; exceptions cleared
- [ ] Manual journals justified, documented and approved
- [ ] Peachtree export reconciled and accepted, or migration parallel-run reconciled

**System blocks.** Posting to a closed period is refused. An unbalanced entry cannot be saved. An entry
with no project or overhead allocation cannot be saved.

---

### FIN-GLR-04 — Maintain the fixed asset register and depreciation

**Owner:** Kalkidan · **Trigger:** Acquisition, disposal, month end · **Frequency:** Monthly

**Today.** Not described. [G] Mesael owns vehicles and machinery [C] and reconciles equipment rentals
personally [C], so assets clearly exist — but no register was mentioned by anyone.

**Action sequence.**

1. Register each asset on acquisition, from the purchase transaction: description, class, serial or
   plate number, acquisition date, cost, supplier, and PO reference.
2. Record location, custodian, assigned project, and insurance and licence expiry dates.
3. Set the depreciation method, useful life and residual value per the configured tax and accounting
   policy [A].
4. Run depreciation monthly, posting to the correct expense account and allocating to the project the
   asset is deployed on where applicable.
5. Record additions, improvements, transfers between sites, impairment and disposal, each with approval
   and gain or loss computation.
6. Perform a periodic physical verification against the register, recording exceptions.
7. Link the register to fleet operations — mileage, servicing, fuel — so that total cost of ownership
   per machine becomes visible. Samuel's servicing payments and Mesael's rental reconciliation both
   land here.

**Definition of Done.**

- [ ] Every asset registered at acquisition, directly from the purchase transaction
- [ ] Class, life, method and residual set
- [ ] Depreciation run and posted for the period
- [ ] Custodian, location and project assignment current
- [ ] Disposals approved with gain or loss computed
- [ ] Register reconciles to the ledger control account
- [ ] Physical verification exceptions recorded and resolved

**System blocks.** Period close is refused with depreciation unrun. A disposal without approval is
refused.

---

### FIN-GLR-05 — Perform the period close

**Owner:** Kalkidan · **Trigger:** Period end · **Frequency:** Monthly

**Today.** Close is a scramble against a backlog of unposted paper, because posting runs one to two
months behind. [C]

**Action sequence.**

1. System runs the close checklist and shows what is blocking, in order.
2. Verify: all bank accounts reconciled (FIN-TRE-05); petty cash counts closed (FIN-PCH-03); payroll
   locked (FIN-PAY-04); depreciation run (FIN-GLR-04); accruals for goods received not invoiced posted;
   prepayments amortised; rental prepaid balances reviewed (FIN-RNT-05); tax declarations filed
   (FIN-TAX-04, 05); intercompany or owner accounts classified (FIN-TRE-06); no unverified transaction
   older than the tolerance; no unclassified suspense balance.
3. Review the exception register (FIN-GOV-04) for the period and clear or carry forward each item with
   a reason.
4. Produce the trial balance and review control account reconciliations: receivables, payables,
   retention, advances, VAT, withholding, payroll liabilities, prepaid rentals.
5. Review project cost postings for completeness — any project with cost but no revenue recognition, or
   vice versa, is flagged.
6. Dembi reviews; Kalkidan closes and locks the period.
7. Any post-close adjustment is a formal prior-period adjustment with approval, never a silent edit.

**Definition of Done.**

- [ ] Every checklist item complete or formally waived with approval
- [ ] All control accounts reconciled and supported by a schedule
- [ ] Exception register cleared or carried with reasons
- [ ] Trial balance balanced and reviewed
- [ ] Period locked with the close date and closer recorded
- [ ] **Close completed within the target number of working days after period end** — the target being
      the real measure of whether the finance function is working

**System blocks.** Close is refused with an unreconciled bank account, an unfiled overdue tax return,
or an unlocked payroll.

---

### FIN-GLR-06 — Produce financial statements and management reports

**Owner:** Kalkidan · **Trigger:** Period close · **Frequency:** Monthly

**Today.** Kalkidan prepares profit and loss, balance sheet and reports for internal and external
auditors. [C] They describe a company one to two months in the past. [C]

**Action sequence.**

1. Generate the statutory set from the closed ledger: profit and loss, balance sheet, and supporting
   schedules.
2. Generate the management set, which is the set Mesael actually needs to run the business:
   - project profitability — contract value, certified revenue, cost to date, committed cost, forecast
     cost to complete, forecast margin against the target margin used in the bid (FIN-CMF-01)
   - cash position and 30-day forecast
   - receivables ageing and collection performance
   - payables and commitments outstanding
   - budget variance by project and cost category
   - overhead against turnover
   - payroll cost by project and as a percentage of revenue
3. Produce comparatives: prior period, year to date, and against budget.
4. Add commentary on material variances — a number without an explanation generates a phone call, which
   is the very thing this system exists to reduce.
5. Dembi reviews; issue to Mesael on a fixed date every month.
6. Maintain the drill-down path: every figure on every report traces to its transactions and their
   attached documents in one click.

**Definition of Done.**

- [ ] Statutory statements produced from the closed period
- [ ] Management pack produced with comparatives
- [ ] Project profitability reported for every active project
- [ ] Material variances explained in writing
- [ ] Issued on the committed date
- [ ] Every figure drills down to source transactions and documents

**System blocks.** Reports from an unclosed period are always watermarked *provisional* — never
presented as final.

---

### FIN-GLR-07 — Support audit and maintain the archive

**Owner:** Kalkidan · **Trigger:** Audit, or continuous · **Frequency:** Annual and on demand

**Today.** Physical documents live in numbered box files 1–7, organised chronologically and
numerically. [C] An internal auditor reviews before external audit. [C] Yamrot, titled "Auditor",
performs no audit. [C]

**Action sequence.**

1. Every document is attached to its transaction at the moment it is created or received — the archive
   is a by-product of the workflow, not a separate filing exercise.
2. Maintain the physical box-file reference **alongside** the digital record during transition, so a
   document can be found in either. Do not force an abrupt abandonment of a system that currently
   works.
3. Retain per the configured retention policy [A]; retention is enforced, not left to judgement.
4. On an audit request, produce the complete transaction pack — request, approvals, quotes, PO, GRN,
   invoice, PV, payment evidence, ledger entries — as a single export.
5. Provide auditors read-only access scoped to the audit period rather than emailing documents around.
6. Track audit findings as tasks with owners, deadlines and closure evidence.
7. Restrict sensitive records by role. Note that the interview material itself contains sensitive
   statements about performance, restructuring and the owner's health [C] — access to that material is
   controlled and it is excluded from client-facing deliverables.

**Definition of Done.**

- [ ] Every transaction has its complete document set attached and retrievable
- [ ] Physical and digital references cross-linked during transition
- [ ] Audit packs produced in a single export, without manual assembly
- [ ] Auditor access scoped and logged
- [ ] Findings tracked to closure with evidence
- [ ] Retention and access rules enforced by the system

**System blocks.** Deletion of a posted transaction or its documents is impossible. Corrections are
made by reversal, which leaves both entries visible.

---

## J — Budget and Cost Control

> This group addresses finding **F-03**. It is the group that turns finance from a payment-processing
> function into a control function.

### FIN-BCC-01 — Establish the project budget baseline from the winning bid

**Owner:** Dembi · **Trigger:** Contract award · **Frequency:** Per project

**Today.** **This does not exist.** [C] Mesael prices bids personally — cost breakdown, tax, overhead,
and a target margin of about 20% [C] — but nothing described carries that pricing forward into an
operational budget. The estimate wins the job and is then set aside.

**Why it fails.** Without a baseline there is nothing to compare actual spending against, so
overspending cannot be detected, only discovered. Mesael's complaint about "unbudgeted operational
losses due to weak internal cost tracking" [C] describes exactly this absence.

**Action sequence.**

1. Import the winning bid estimate (FIN-CMF-01) as the project budget baseline, structured by BOQ item,
   WBS activity and cost code.
2. Break each budget line into cost categories: material, labour, subcontract, equipment and rental,
   overhead allocation, and contingency.
3. Record the target margin embedded in the bid — the ~20% Mesael works to [C] — as an explicit
   measurable figure, so actual margin can be tracked against intent every month.
4. Set the project cash flow plan: expected billing milestones (FIN-OTC-01) against expected cost
   timing.
5. Baseline approval by Mesael. The baseline is then **frozen**; all later change is a tracked revision
   (FIN-BCC-04), so the original commercial intent is never quietly overwritten.
6. Publish the budget to the project team so requesters can see their own budget position before
   raising a request.

**Definition of Done.**

- [ ] Baseline imported from the winning bid without re-keying
- [ ] Structured by BOQ, WBS and cost code, split by cost category
- [ ] Target margin recorded as a tracked figure
- [ ] Cash flow plan set against billing milestones
- [ ] Approved and frozen
- [ ] Visible to the project team

**System blocks.** A project cannot receive a purchase requisition, subcontract or rental commitment
without an approved budget baseline — or an explicit, approved, time-limited exception during
mobilisation.

---

### FIN-BCC-02 — Validate a request against budget

**Owner:** System · **Trigger:** Every request with a cost effect · **Frequency:** Continuous

**Today.** **No request is validated against a budget, anywhere in any process.** [C] Kalkidan states
it directly; Firehiwot describes the consequences daily.

**Action sequence.**

1. On every requisition, subcontract, rental, variation or expense, the system identifies the budget
   line from project + WBS activity + cost code.
2. Compute and display, before submission: budgeted, committed, actual spent, remaining, this request,
   remaining after this request.
3. Return a status: **within budget**, **within tolerance** (configurable percentage), or **over
   budget**.
4. Over budget does **not** mean blocked — construction does not work that way. It means the request
   requires a stated reason, from a controlled list, and routes to a higher approval tier that sees the
   budget position explicitly.
5. Record the budget position **on the transaction permanently**, so anyone reviewing it later sees
   what the approver saw at the time.
6. Feed every over-budget event into the budget variance report (FIN-BCC-05) and the exception register.

**Definition of Done.**

- [ ] Budget line identified for every cost-bearing request
- [ ] Full budget position displayed before submission
- [ ] Status returned and recorded on the transaction
- [ ] Over-budget requests carry a reason and route to the higher tier
- [ ] Position stored immutably with the transaction

**System blocks.** No request may be submitted without a budget line. No approval may be given on an
over-budget request without a reason. **No approver ever sees a request without also seeing its budget
effect** — this is the single rule that converts approval from a signature into a decision.

---

### FIN-BCC-03 — Track commitments and actuals

**Owner:** System · **Trigger:** Continuous · **Frequency:** Real time

**Today.** Not tracked. [C] The company knows what it has paid, roughly, one to two months later.

**Action sequence.**

1. Register a commitment when a PO is issued (FIN-P2P-04), a subcontract is activated (FIN-SUB-01), or
   a rental is agreed (FIN-RNT-01).
2. Reduce the commitment and raise the actual as goods are received, work is certified, or hours are
   consumed.
3. Maintain per budget line: budget, committed, actual, invoiced, paid, remaining.
4. Recognise cost at the correct moment — on receipt or certification, not on payment. Cost and cash
   are tracked separately and both are visible.
5. Release commitments that will not be fulfilled — cancelled POs, unused rental extensions — so the
   budget is not held hostage by dead commitments.
6. Age open commitments and report those beyond expected delivery.

**Definition of Done.**

- [ ] Every PO, subcontract and rental registers a commitment at approval
- [ ] Commitments convert to actuals on receipt or certification
- [ ] Budget line position current in real time
- [ ] Cancelled commitments released
- [ ] Aged commitments reported

**System blocks.** A commitment cannot exceed the approved budget line without the over-budget route.

---

### FIN-BCC-04 — Manage revisions, variations and price escalation

**Owner:** Dembi · **Trigger:** Scope change, client variation, or market price movement
· **Frequency:** As arising

**Today.** Mesael describes significant financial strain from price escalation — fuel and naphtha
prices "jumping rapidly" — and says the losses are unbudgeted "because field reporting is delayed and
unquantified". [C]

**Why it fails.** Escalation is not the problem; *unquantified* escalation is. A price rise the company
can see and measure is a commercial issue to be managed, claimed, or repriced. A price rise it cannot
see is a silent margin loss discovered at the end of the project.

**Action sequence.**

1. Raise the change: client variation, internal scope change, estimating error, or price escalation —
   classified, because the four have completely different commercial consequences.
2. Quantify the cost effect by budget line and the revenue effect if it is claimable from the client.
3. For a **client variation**, link it to the contract variation process so the additional revenue is
   billed rather than absorbed — this is money the company is currently at risk of doing work for and
   never invoicing. [I]
4. For **price escalation**, record the item, the old price, the new price, the source and the date,
   and compute the effect on remaining budgeted quantities across every affected project at once.
5. Check the contract for a price adjustment clause; if one exists, generate the claim.
6. Route for approval; on approval, revise the budget as a **new version** — the baseline stays intact
   and the variance history stays visible.
7. Report the cumulative effect of all revisions on the project's forecast margin against the bid
   target.

**Definition of Done.**

- [ ] Change classified by type
- [ ] Cost and revenue effects quantified by budget line
- [ ] Client-claimable variations linked to the billing plan
- [ ] Price escalation recorded with source and applied across all affected projects
- [ ] Contract price-adjustment entitlement checked and claimed where available
- [ ] Budget revised as a version; baseline preserved
- [ ] Forecast margin updated and reported

**System blocks.** A budget revision without an approved change record is impossible — this is what
prevents a budget being quietly enlarged to accommodate overspending after the fact.

---

### FIN-BCC-05 — Report project cost, forecast and profitability

**Owner:** Dembi · **Trigger:** Weekly and at close · **Frequency:** Weekly

**Today.** Not produced. [C] Mesael personally cross-checks stock and rental usage against site reports
[C] — doing by hand, sporadically, what this task does continuously.

**Action sequence.**

1. Produce, per project: budget, committed, actual, forecast cost to complete, forecast final cost,
   certified revenue, forecast final revenue, forecast margin, and the variance against the bid target
   margin.
2. Break down by cost category and by BOQ or WBS activity, so an overrun is located, not merely
   detected.
3. Show cost performance against physical progress — spending 60% of the budget at 40% completion is
   the signal that matters, and it is available today only in Mesael's head, for the projects he
   happens to have visited.
4. Highlight the top variances with their drivers.
5. Produce a project cash flow: certified and collected against spent and committed.
6. Portfolio view across all projects for Mesael, with the ability to drill from portfolio to project
   to activity to transaction to document.
7. Weekly review with Dembi; monthly with Mesael.

**Definition of Done.**

- [ ] Every active project reported with budget, commitment, actual and forecast
- [ ] Forecast final margin computed and compared to the bid target
- [ ] Cost performance shown against physical progress
- [ ] Top variances identified with drivers
- [ ] Portfolio view with full drill-down
- [ ] Reviewed and actioned, with actions tracked

**System blocks.** None — but any project whose forecast margin falls below a configured threshold
raises a permanent alert to Dembi and Mesael until it is addressed.

---

## K — Governance, Authority and Audit

### FIN-GOV-01 — Maintain the approval authority matrix

**Owner:** Mesael · **Trigger:** Setup, and on change · **Frequency:** Rare, highest impact

**Today.** No documented matrix exists. [G] Everything reaches Mesael. Dembi's ceiling is unknown.
Site and PM spending authority is unknown. Subcontract signature authority is explicitly unclear. [C]

**Why this is the first thing to build.** Every other control in this document reads its rules from
here. Build this first and configurable, and the remaining open questions stop being blockers — they
become values to be entered at user acceptance testing rather than assumptions to be coded now.

**Action sequence.**

1. Define transaction types: purchase requisition, purchase order, supplier payment, subcontract award,
   subcontract certificate, rental agreement, rental advance, petty cash, emergency payment, payroll,
   client invoice, credit note, budget revision, bid submission, write-off, owner drawing.
2. For each, define approval tiers by amount band — with **Ethiopian Birr thresholds to be set with
   Mesael and Dembi** [G].
3. Define the approvers per tier and whether approval is sequential or parallel, and whether dual
   approval is required.
4. Define **owner-reserved decisions** — categories Mesael keeps regardless of amount. This is SRS
   question Q1 and it is his decision alone.
5. Define modifiers that change the route: over-budget, emergency, single-source, new supplier,
   bank-detail change, manual deduction override.
6. Define escalation on inaction: if an approver does not act within the target time, what happens —
   reminder, escalation, or automatic delegation.
7. Approve, version and effective-date the matrix. Every change is itself an approved, logged change.
8. Publish it. Everyone should be able to see who approves what — the current situation, where the
   rules are known only by experience, is itself a source of delay.

**Definition of Done.**

- [ ] Every transaction type has a defined route with amount bands
- [ ] Owner-reserved categories defined by Mesael personally
- [ ] Route modifiers configured
- [ ] Escalation on inaction configured with target times
- [ ] Matrix versioned, effective-dated and approved
- [ ] Published and visible to all staff

**System blocks.** No transaction type may exist without a route. No approval may occur outside the
matrix — the system does not permit a person to approve something they are not authorised to approve,
which is a protection for the approver as much as for the company.

---

### FIN-GOV-02 — Route, record and evidence an approval

**Owner:** System · **Trigger:** Every approval · **Frequency:** Continuous

**Today.** Approvals happen on paper signatures, by telephone, and by Telegram messages sent to two
people at once. [C]

**Action sequence.**

1. Determine the route from FIN-GOV-01 automatically, and show it to the requester on submission — so
   nobody has to ask who signs, or chase the wrong person.
2. Deliver to the approver's queue with a push notification, on mobile, with the complete package.
3. Approver acts with authenticated identity — the login is the signature.
4. Record: approver, action, timestamp in Africa/Addis_Ababa, device, IP, the exact document version,
   and any comment.
5. Bind the approval cryptographically to the document set so that a later change to any attachment
   invalidates it automatically.
6. Track and report time-to-approve per approver and per transaction type. **This turns the
   bottleneck from a complaint into a measurement**, which is the only way it will ever actually be
   fixed.
7. Telegram may remain as a *notification* channel during transition — a message that says "you have a
   payment to approve, tap here". The approval itself never happens in Telegram again.

**Definition of Done.**

- [ ] Route applied automatically and shown to the requester
- [ ] Approver acted with authenticated identity
- [ ] Full evidence recorded and immutable
- [ ] Approval bound to the exact document version
- [ ] Time-to-approve measured and reported
- [ ] No approval exists outside the system

**System blocks.** Verbal, telephone and chat approvals cannot be entered retrospectively as system
approvals. If the owner authorises by phone in a genuine emergency, that is recorded as an
*emergency verbal authorisation* — a distinct, visible, counted category requiring written
confirmation within a defined period — not disguised as a normal approval.

---

### FIN-GOV-03 — Administer delegation and substitute authority

**Owner:** Mesael · **Trigger:** Absence, travel, illness, or standing arrangement · **Frequency:** As
needed

**Today.** When Mesael is off-site, decisions wait until he can be reached by phone. [C] The context
confirms Dembi can approve authorised requests when the owner is unavailable, but "the exact monetary
thresholds and request categories for DGM approval have not yet been defined". [C][G]

**Why this task matters more than any other single feature.** Mesael says the load is affecting his
health. [C] Delegation is the mechanism that reduces it. But delegation without a record is exactly
what the company already has, and it is why nobody can prove who authorised what. This task makes
delegation **safe** — which is what makes it acceptable to the owner.

**Action sequence.**

1. Create the delegation: from whom, to whom, which transaction types, up to what amount, and — always
   — a **start and end date**. Open-ended delegations are not permitted.
2. Optionally define an automatic trigger: activate if the primary approver has not acted within N
   hours. This directly addresses SRS question Q3.
3. Define what is **never** delegated — the owner-reserved categories from FIN-GOV-01.
4. Mesael approves the delegation; it is logged.
5. While active, the system routes automatically to the delegate and marks every such approval
   distinctly.
6. **The audit record distinguishes a Dembi approval made as Finance Head from a Dembi approval made
   under temporary owner delegation.** These are different acts with different authority and the record
   must say which. This requirement comes directly from the system context. [C]
7. Notify the primary of every decision taken under delegation, so the owner keeps visibility without
   keeping the workload.
8. On expiry, authority reverts automatically. Extension is a new approved delegation, not a silent
   continuation.
9. Report all delegated approvals to Mesael weekly.

**Definition of Done.**

- [ ] Delegation defined with scope, ceiling and mandatory end date
- [ ] Owner-reserved categories excluded
- [ ] Approved by the delegating authority
- [ ] Delegated approvals distinctly marked in the audit trail, by authority basis
- [ ] Primary notified of every delegated decision
- [ ] Automatic reversion on expiry
- [ ] Weekly report to the owner

**System blocks.** Delegation beyond the delegator's own authority is impossible. Sub-delegation is
impossible unless explicitly enabled. Owner-reserved categories cannot be delegated by anyone,
including by the delegate.

---

### FIN-GOV-04 — Maintain the audit trail and exception register

**Owner:** System, monitored by Dembi · **Trigger:** Continuous · **Frequency:** Real time

**Today.** No system audit trail exists. Evidence is paper, Telegram messages, and memory. [C] There is
no independent internal audit function. [C]

**Action sequence.**

1. Log every material action immutably: who, what, when, from where, before-value and after-value.
2. Make the trail append-only. Nothing is deleted; corrections are reversals and both entries remain
   visible.
3. Maintain the **exception register** — every deviation, in one place, each with an owner and a
   status:
   - emergency payments
   - single-source purchases
   - over-budget approvals
   - payments made before documents were complete
   - manual overrides of calculated deductions
   - duplicate-request overrides
   - petty cash overages and shortages
   - supplier bank-detail changes
   - approvals under delegation
   - post-approval document changes
   - overdue acquittals
   - unreconciled bank items
4. Every exception carries a reason from a controlled list, so exceptions can be **counted by cause**.
5. Weekly exception review by Dembi; monthly summary to Mesael.
6. Run standing analytics: same supplier and same amount paid twice; a supplier bank account shared
   with an employee bank account; payments just below an approval threshold (threshold-splitting);
   requisitions repeatedly raised and cancelled; approvals given within seconds of receipt on
   high-value items.
7. Findings become tasks with owners and deadlines.
8. **Where an independent internal audit function is established** — SRS question Q10 — this is the
   evidence base it works from. Until then, the register at least makes exceptions visible to
   management, which is more than exists today.

**Definition of Done.**

- [ ] Every material action logged immutably with before and after values
- [ ] Every exception captured with a controlled reason code and a named owner
- [ ] Weekly review completed; monthly summary issued
- [ ] Analytics run and findings actioned
- [ ] No exception open beyond its target age without escalation

**System blocks.** Audit records cannot be edited or deleted by any user, including administrators.

---

## L — Commercial Finance

### FIN-CMF-01 — Build the bid cost estimate, tax loading and target margin

**Owner:** Mesael · **Trigger:** Tender opportunity · **Frequency:** Per bid

**Today.** Mesael personally prepares bid proposals, calculates cost breakdowns, factors in tax,
adds overhead, and embeds a target net profit of about 20%. [C] He describes the method concretely:
taking a 10 Birr contract, accounting for tax down to 8.50 Birr, and deriving profit and overhead from
there. [C] It is done manually, by one person, on paper and in basic spreadsheets. [C]

**Why it matters to finance.** This is where every project's financial outcome is actually decided. An
error here cannot be recovered by any amount of downstream control. And because the estimate is never
carried into an operational budget (FIN-BCC-01), the company currently has no way of knowing whether
its estimating is any good.

**Action sequence.**

1. Register the opportunity: client, project, tender number, submission deadline, bid security
   requirement, and the required qualification documents.
2. Build the estimate by BOQ item: quantity, and unit rate built up from material, labour, equipment,
   subcontract and indirect components.
3. Draw rates from **historical actual cost** on completed projects — the single most valuable thing an
   estimating module can offer, and something Mesael cannot have today because actual cost by activity
   is not captured.
4. Apply overhead at the configured rate; apply the tax treatment; apply the target margin — reproducing
   Mesael's existing method exactly, but computed rather than hand-worked.
5. Run sensitivity: what the margin becomes if key material prices rise by a given percentage. Given
   the fuel escalation he describes [C], this converts a known risk into a priced one.
6. Record assumptions and exclusions explicitly — these are what claims are later built on.
7. Compute the bid cash flow: when money goes out against when milestones bring money in, including the
   advance. A profitable project with the wrong cash profile is still a problem.
8. Produce the bid summary: total cost, overhead, tax, margin percentage and value, and the final bid
   price.

**Definition of Done.**

- [ ] Estimate built by BOQ item with rate build-ups, not a single lump figure
- [ ] Historical actual rates referenced where available
- [ ] Overhead, tax and target margin applied and each separately visible
- [ ] Sensitivity analysis run on the main cost drivers
- [ ] Assumptions and exclusions recorded
- [ ] Bid cash flow produced
- [ ] Summary reviewed by Mesael

**System blocks.** A bid cannot be submitted without a completed estimate — which prevents pricing
being reconstructed after the fact.

---

### FIN-CMF-02 — Approve the bid price and record the commitment

**Owner:** Mesael · **Trigger:** Completed estimate · **Frequency:** Per bid

**Action sequence.**

1. Route the bid for approval with the estimate, the margin, the cash flow, the assumptions and the
   sensitivity.
2. Verify readiness: all required certificates current (FIN-TAX-06), bid security arranged
   (FIN-CMF-03), and the required experience and qualification documents attached.
3. Mesael approves the final price, including any strategic decision to bid below the standard target
   margin — recorded explicitly, with a reason, so that the project is later judged against the margin
   it was actually bid at rather than against a standard it was never intended to meet.
4. Record the submission: date, method, and the acknowledgement.
5. Track the outcome: won, lost, cancelled, or disqualified — with the reason, and with competitor
   pricing where it becomes known.
6. On award, trigger FIN-OTC-01 and FIN-BCC-01 so the estimate flows straight into the contract and the
   budget with no re-keying.
7. Maintain bid win-rate and margin analytics — bids won versus lost by client, by value band, by
   margin.

**Definition of Done.**

- [ ] Approved by Mesael with the final margin explicitly recorded
- [ ] Any below-target margin decision documented with a reason
- [ ] Compliance and security requirements verified before submission
- [ ] Submission recorded with acknowledgement
- [ ] Outcome recorded with reason
- [ ] On award, contract and budget created from the estimate automatically

**System blocks.** Submission is blocked where a mandatory certificate is expired (configurable
severity).

---

### FIN-CMF-03 — Manage bid securities and guarantees

**Owner:** Dembi · **Trigger:** Bid or contract requirement · **Frequency:** Per bid or contract

**Today.** Not described by anyone. [G] Public-sector construction work in Ethiopia normally requires
bid security, performance guarantees and advance payment guarantees. The interviews show government
clients [C] but no guarantee process.

**Why it matters financially.** Guarantees tie up cash or credit lines, they expire, and an expired
performance guarantee on a live contract is a genuine commercial exposure. An unreleased bid bond on a
lost tender is money sitting idle that nobody is asking for back.

**Action sequence.**

1. Register each instrument: type (bid security, performance, advance payment, retention guarantee),
   beneficiary, value, issuing bank, issue date, expiry date, and the cash margin or collateral held
   against it.
2. Record the cash effect — margin deposits are restricted cash and must not appear as available
   balance in FIN-TRE-02.
3. Attach the instrument document.
4. Track validity with reminders ahead of expiry, and extend where the contract requires it.
5. Track release: on tender loss, on contract completion, or on advance recovery, **raise the release
   action with an owner and chase it**. This is the step that recovers money nobody is currently
   watching.
6. Record any call or forfeiture with its cause.
7. Report total guarantee exposure and the associated restricted cash to Mesael.

**Definition of Done.**

- [ ] Every instrument registered with values, dates and collateral
- [ ] Restricted cash excluded from available balance
- [ ] Documents attached
- [ ] Expiry monitored with extension where required
- [ ] Release actively pursued and confirmed on every eligible instrument
- [ ] Total exposure reported

**System blocks.** Contract closure is refused with an outstanding unreleased guarantee.

---

### FIN-CMF-04 — Register the awarded contract and its financial terms

**Owner:** Dembi · **Trigger:** Award · **Frequency:** Per award

**Action sequence.**

1. Create the contract record from the winning bid, carrying the estimate forward without re-entry.
2. Record all financial and commercial terms as structured fields: value, advance, retention, payment
   period, price adjustment, liquidated damages, extension-of-time provisions, insurance requirements,
   and the defect liability period.
3. Attach the signed contract and every annex.
4. Trigger FIN-OTC-01 (billing plan) and FIN-BCC-01 (budget baseline).
5. Register required guarantees and insurances with their expiry dates.
6. Assign the project team and the finance responsibilities for the contract.
7. Set up the contract compliance calendar: reporting obligations, insurance renewals, guarantee
   expiries, milestone dates.

**Definition of Done.**

- [ ] Contract created from the bid with no re-keying
- [ ] All financial terms captured as fields rather than buried in an attached PDF
- [ ] Signed contract and annexes attached
- [ ] Billing plan and budget baseline created
- [ ] Guarantees and insurances registered with expiries
- [ ] Responsibilities assigned and the compliance calendar set

**System blocks.** No project transaction may occur against a contract that is not registered and
active.

---

## 8. Cross-cutting rules

### 8.1 The five rules that carry most of the value

If everything else in this document were dropped and only these five were implemented, the majority of
the finance pain described in the interviews would be resolved.

| # | Rule | Fixes |
|---|---|---|
| **R1** | **No payment without its required documents attached.** | F-02 — the root cause of the accounting backlog, the tax exposure, and the chasing |
| **R2** | **No approval without the budget effect displayed.** | F-03 — unbudgeted and duplicate requests |
| **R3** | **The person who approves, the person who pays, and the person who reconciles are three different people.** | F-04, F-11 — segregation of duties |
| **R4** | **Every advance is reconciled against actual delivery before the record closes.** | F-07 — the rental leak, and subcontract advances |
| **R5** | **Approval authority is configuration, and every approval is evidenced.** | F-01, F-05, F-06 — the owner bottleneck, Telegram approvals, phone authorisations |

### 8.2 Document numbering

Every finance document carries a system-allocated sequential number. No number is typed by a user, none
is re-used, and gaps are impossible without a recorded void.

| Document | Format | Allocated at |
|---|---|---|
| Purchase requisition | PR-YYYY-nnnnn | Submission |
| Request for quotation | RFQ-YYYY-nnnnn | RFQ creation |
| Purchase order | PO-YYYY-nnnnn | PO approval |
| Goods receiving note | GRN-YYYY-nnnnn | Receipt at site |
| Payment voucher | PV-YYYY-nnnnn | Payment execution |
| Interim payment certificate | IPC-<contract>-nn | Certificate generation |
| Client invoice | INV-YYYY-nnnnn | Invoice approval |
| Official receipt | From the registered receipt book | Receipt issue |
| Cheque | From the registered cheque book | Cheque issue |
| Petty cash voucher | PCV-YYYY-nnnnn | Disbursement |
| Journal voucher | JV-YYYY-nnnnn | Manual journal |
| Rental agreement | RA-YYYY-nnn | Agreement approval |
| Subcontract | SC-YYYY-nnn | Contract approval |

### 8.3 The mandatory attachment matrix

This is rule R1 made concrete. The system refuses approval where a required document is absent.

| Transaction | Mandatory before approval | Mandatory before close |
|---|---|---|
| Material purchase | Requisition, comparison matrix (or framework agreement reference), selection approval, PO | GRN, supplier invoice/receipt with TIN, three-way match, bank confirmation |
| Emergency purchase | Emergency justification, evidence of the stoppage, verbal-authorisation record | All of the above within the configured deadline |
| Subcontract certificate | Signed agreement, priced BOQ, measurement, inspection result, test result, consultant verification, deduction computation | Bank confirmation, withholding certificate issued |
| Subcontract advance | Signed agreement, advance guarantee (where required) | Recovery schedule active |
| Rental advance | Signed agreement, charging basis, reconciliation basis | Hour logs, off-hire record, reconciliation completed |
| Petty cash | Approved request within ceiling and category | Receipt with vendor name and TIN, or a documented shortfall |
| Payroll | Certified timesheets, exception clearances, independent check | Bank confirmation, payslips issued, statutory schedules generated |
| Client invoice | Milestone certification, progress measurement, contract reference | Official receipt issued, dispatch proof of delivery |
| Tax payment | Reconciled declaration, independent review | Portal acknowledgement, payment receipt |
| Fleet servicing | Mileage/hour reading evidence, approved garage, quotation | Service report, parts list, invoice |

### 8.4 Leakage points closed

Mapping Section 3.3's ten leakage routes to the tasks that close them.

| Leak | Closed by |
|---|---|
| Mobile-banking garage payments | FIN-PCH-04, FIN-GLR-04 (fleet cost capture), authority matrix |
| Urgent bank runs by reception | FIN-PCH-04 — role-based block plus a fast-track electronic route |
| Petty cash disbursed before documentation | FIN-PCH-02, FIN-PCH-03 — acquittal obligation and the overdue block |
| 100% rental advances | FIN-RNT-02, FIN-RNT-05 — prepaid accounting and mandatory reconciliation |
| Payment before supporting documents | R1, FIN-GLR-02 — verification moved before approval |
| Duplicate requisitions | FIN-P2P-01 — duplicate detection at submission |
| Urgent purchases bypassing quotes | FIN-P2P-02 — framework agreements plus a logged single-source route |
| Office consumables outside control | FIN-PCH-01 — category restriction and ceiling |
| Owner drawings mixed with expenses | FIN-TRE-06 — four-way classification |
| Silent price escalation | FIN-BCC-04 — escalation recorded, applied and claimed |

### 8.5 The target segregation of duties matrix

Compare against the as-is matrix in Section 6. The change is achieved almost entirely by moving two
responsibilities — vendor selection moves from Leta to Dembi, and payment release requires a second
person — plus removing two people from the payment path entirely.

| Duty | Mesael | Dembi | Leta | Kalkidan | Firehiwot | Samuel | Site/John | Likke |
|---|---|---|---|---|---|---|---|---|
| Initiate | | | | | ● | ● | ● | |
| Technical validation | | | | | ● | | ● | |
| Sourcing | | | | | | ● | | |
| Vendor selection | ○ | ● | | | ○ | | | |
| Verification | | | | ● | | | | |
| Approve | ● | ● | | | | | | |
| Execute (maker) | | | ● | | | | | |
| Release (checker) | | ● | | ● | | | | |
| Record | | | | ● | | | | |
| Reconcile | | | | ● | | | | |
| Receive goods | | | | | | | ● | |

● primary  ○ contributing

**What changed and why it is achievable:**

1. Leta no longer selects vendors — that moves to Dembi, who already reviews the commercial position.
2. Leta prepares payments; a second person releases them. No single person completes a payment.
3. Kalkidan verifies **before** approval instead of reconstructing after payment. Same work, moved
   earlier, worth far more.
4. Samuel and Likke leave the payment execution path entirely.
5. Mesael approves within his reserved categories and above Dembi's ceiling — and stops seeing routine
   payments at all.

None of this requires additional headcount. It is a re-ordering of work the same people already do.

---

## 9. Finance metrics for the CEO

Mesael asked specifically for measurable information about performance and for the ability to see the
business without being inside every transaction. [C] These are the finance measures the system produces
as a by-product of the tasks above — not as extra data entry.

### 9.1 Control health

| Metric | Why it matters | Target direction |
|---|---|---|
| Payments made before complete documentation | Direct measure of F-02 | To zero |
| Average days from payment to ledger posting | Currently 30–60 days [C] | To same-day |
| Requests submitted without a budget line | Direct measure of F-03 | To zero |
| Over-budget approvals, by project and reason | Where margin actually goes | Falling and explained |
| Emergency payments per month, by reason | Whether the exception is becoming the rule | Falling |
| Duplicate-request detections | Money not spent twice | Rising then falling |
| Open petty cash acquittals over the deadline | Cash discipline | To zero |
| Unreconciled bank items over 7 days | Whether the books reflect reality | To zero |

### 9.2 Speed — the bottleneck, measured

| Metric | Why it matters |
|---|---|
| Average time from request to approval, by approver | Turns "approvals are slow" into a number per person, including the owner |
| Average time from approval to payment | Measures the Monday effect directly |
| Requests waiting on the owner right now | The bottleneck, live |
| Percentage of payments approved under delegation | Whether delegation is actually reducing the owner's load |
| Procurement lead time, request to site delivery | The number the sites actually care about |

### 9.3 Money

| Metric | Why it matters |
|---|---|
| Cash position and 30-day forecast | Currently unknown until a machine stops |
| Receivables ageing, and days sales outstanding | Currently not tracked at all |
| Retention held by clients, with release dates | Money the company has earned and is not chasing |
| Unrecovered rental and subcontract advances | Finding F-07, quantified |
| Forecast margin against bid margin, by project | Whether the 20% target is actually being achieved |
| Non-claimable VAT from missing or invalid receipts | Real money lost to paperwork, quantified for the first time |
| Cumulative tax penalties, by root cause | Currently unknown to anyone |
| Guarantee exposure and restricted cash | Cash tied up and not being released |

### 9.4 A note on using these to evaluate people

Mesael asked for objective employee performance measurement. [C] Several metrics above are
role-attributable — approval turnaround, document completeness, acquittal timeliness, delivery
reliability. Two cautions we would put on the record now rather than later:

- These measure **process compliance**, which is a real and useful signal, but not the whole of a
  person's contribution.
- The system should present evidence for a human decision. It should not compute an outcome. This is
  already fixed as a design constraint in the SRS (FR-10-011) and we would keep it.

---

## 10. Assumptions, open questions, and what we could not know

### 10.1 Assumptions we have made [A]

Each of these is a design decision taken so that work can proceed. Each needs a yes or no. None of them
is expensive to change **if changed before build**.

| # | Assumption | If wrong |
|---|---|---|
| A-01 | Peachtree remains the statutory ledger for the first release; the system integrates rather than replaces | Replacement is a materially different scope — SRS Q8 |
| A-02 | Withholding tax applies to supplier and subcontractor payments and must be automated | If Mesael's client and supplier mix makes it inapplicable, FIN-TAX-05 simplifies |
| A-03 | Subcontracts carry retention and advance recovery | If they do not, FIN-SUB-04 and 07 simplify substantially — but we consider this unlikely |
| A-04 | The Monday-only rule is a coping mechanism, not policy — so we replace it with a configurable payment calendar | Either answer is supported; we need to know which — SRS Q4 |
| A-05 | Petty cash single-transaction ceiling is in the ETB 50,000–60,000 region | The number is configuration; only the value changes |
| A-06 | Dembi will accept a defined approval ceiling below the owner's | If the owner will not delegate, the bottleneck stays and the system cannot fix it — we would say so plainly |
| A-07 | Site connectivity is sufficient for mobile capture of GRNs, hour logs and petty cash acquittals | Offline-and-sync is a significant additional scope — SRS Q14 |
| A-08 | Ethiopian VAT, withholding, employment tax and pension apply in their standard forms | Rates and thresholds are configuration; the process definitions hold either way |
| A-09 | The finance interface is primarily English, with Amharic for site-facing capture | Full multilingual coverage changes UI scope — SRS Q15 |
| A-10 | Fiscal year and tax periods follow the Ethiopian fiscal calendar | Reporting period configuration only |

### 10.2 Questions for Mesael

Short, and answerable in one sitting. These four unlock the largest amount of design.

1. **Which financial decisions do you want to keep permanently, whatever the amount?** (SRS Q1)
2. **Up to what amount, and for which types of request, should Dembi be able to approve without you?**
   (SRS Q2)
3. **When you are unreachable, should authority pass to Dembi automatically after a set number of
   hours, or only when you say so?** (SRS Q3)
4. **Does Peachtree remain the official ledger, with the new system feeding it — or does the new system
   take over?** (SRS Q8)

### 10.3 What we could not determine from the material available [G]

Stated plainly, because a consultant who pretends to know these is not worth hiring.

1. Whether withholding tax is currently applied to supplier and subcontractor payments at all.
2. Whether subcontracts carry retention, and whether retention is tracked per contract.
3. How subcontract advances are given and recovered, if they are.
4. Whether rental advances are ever reconciled against actual hours — we found no evidence of it.
5. The petty cash ceiling, definitively.
6. The payroll process in any detail — the largest recurring outflow in the company is the least
   documented process in the interview set.
7. How owner drawings are currently treated.
8. Whether an independent internal audit function exists; Kalkidan names an "internal auditor" but
   Yamrot, who holds the title, does not audit.
9. Whether bank transfers use a formal bank token or voice confirmation only.
10. Who the runner is who carries receipts and collects client cheques.
11. Whether "Mikiyas" is a person at the bank, a garbled reference to Mesael, or someone else.
12. Whether the Monday rule is policy.
13. Receivables position — nobody described tracking it.
14. Guarantee and bid security practice.
15. Whether Firehiwot, John, or site engineers hold any spending authority at all.

### 10.4 How we have handled the Dembi gap

Every number that Dembi would have given us is **configuration**, not code:

- Approval ceilings — configured in FIN-GOV-01, set at user acceptance testing
- Delegation rules and triggers — configured in FIN-GOV-03
- Petty cash ceilings and categories — configured in FIN-PCH-01
- Tax rates, thresholds and deadlines — configured in FIN-TAX-01
- Retention, advance and withholding percentages — held per contract in FIN-SUB-01 and FIN-OTC-01
- Payment calendar — configured, whichever way Q4 is answered

This means the finance module can be **designed and built in full** without Dembi's answers, and
configured correctly the day they arrive. What we would still strongly recommend is a single session
with Dembi in the first week — ninety minutes would be enough — because a wrong assumption discovered
at user acceptance testing is cheap, while a wrong assumption discovered after go-live is not.

---

## 11. Recommended build sequence for the finance module

Ordered by control value per unit of effort, not by visibility.

### Phase 1 — The spine (nothing else works without it)

| Task | Why first |
|---|---|
| FIN-GOV-01, 02, 03, 04 | Every other control reads its rules from the authority matrix. Building it first makes the open questions harmless. |
| FIN-BCC-01, 02 | Rule R2. Budget visibility at the point of approval changes the nature of every request in the company. |
| FIN-P2P-01 | The highest-volume transaction, with duplicate and budget checking, is where the volume of pain is. |
| FIN-GLR-01, 02 | Rule R1. Verification before approval, and the payment voucher generated automatically. |

**What Mesael experiences at the end of Phase 1:** approvals arrive on his phone, complete, with the
budget effect visible, and routine ones stop arriving at all.

### Phase 2 — Close the leaks

| Task | Why |
|---|---|
| FIN-RNT-01 → 05 | The largest quantifiable invisible loss. Highest value per unit of effort in the entire module. |
| FIN-PCH-01 → 04 | Ends the reception bank runs and the unacquitted cash. Small build, large control gain. |
| FIN-TRE-03, 04, 05 | Maker-checker, cheque control, and bank reconciliation as verification rather than as discovery. |
| FIN-P2P-02 → 08 | Framework agreements end the proforma churn and repair the supplier relationships. |

### Phase 3 — The full cycle

| Task | Why |
|---|---|
| FIN-SUB-01 → 07 | Retention, advance recovery and certification brought under control. |
| FIN-OTC-01 → 06 | Billing triggered by milestones rather than by memory; receivables visible for the first time. |
| FIN-TAX-01 → 07 | The Excel-to-portal path is eliminated; declarations come from posted transactions. |
| FIN-GLR-03 → 07 | Real-time posting, Peachtree integration, close and reporting. |

### Phase 4 — Complete and optimise

| Task | Why |
|---|---|
| FIN-PAY-01 → 05 | Requires the payroll discovery session that has not yet happened. |
| FIN-CMF-01 → 04 | Estimating improves once Phase 3 has produced real historical cost data — building it earlier would mean estimating against nothing. |
| FIN-BCC-03, 04, 05 | Full commitment tracking and profitability forecasting. |
| FIN-TRE-01, 02, 06 | Treasury refinement and owner capital separation. |

---

## 12. Closing assessment

Mesael's finance problem is not that its people are doing the wrong things. Reading the eight
interviews closely, the striking thing is how much these five people are holding together with paper,
Telegram and personal diligence. Kalkidan's document checking is careful. Yamrot's grasp of contract
payment stages is exact. Leta's cash discipline is real. Samuel understands precisely why the
procurement channel needs a single owner and can explain it better than most consultants would.

The problem is **sequence**. Almost every finance control at Mesael exists, but happens after the money
has moved:

- Documents are verified — after payment.
- Transactions are recorded — one to two months after payment.
- Budgets are considered — after the spending.
- Advances are given — and never reconciled.
- Approvals are given — with no record that survives.

The finance module does not need to introduce new controls to this company. It needs to take the
controls that already exist in these people's heads and habits, and **move them to the front of the
transaction**, where they can prevent a problem instead of documenting one.

That is a smaller, more achievable, and far more valuable project than replacing how Mesael works. And
it is the reason the answer to the CEO's problem is not accounting software.

---

*Prepared for Mesael Construction. Contains sensitive interview material; internal distribution only.*
*All rates, thresholds and statutory references are configuration placeholders pending validation.*


