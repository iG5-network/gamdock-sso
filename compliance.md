# Gamdock SSO — Global KYC, AML & Compliance Framework

A Unified, Region-Aware Identity Verification & Regulatory Compliance System for iGaming

---

# 1. Overview

This document defines the complete engineering specification for implementing **global KYC, AML, SOF, and responsible gaming compliance** in Gamdock SSO.

It is intended for backend engineers, compliance architects, fraud analysts, and product teams building region-aware verification workflows across Europe, North America, LATAM, APAC, and Africa/MENA.

The specification includes:

-   Regulatory requirements (per region & per country)
-   Verification flows (Tier0 → Tier3 + EDD)
-   Anti-fraud & geolocation enforcement
-   AML/PEP/sanctions screening
-   Source of funds/wealth controls
-   Security, cryptography & data governance
-   API & event schema designs
-   Monitoring, SLAs & KPIs
-   Manual review operations
-   Testing & audit readiness

---

# 2. System Architecture

User → SSO → KYC Engine → Verification Providers
↓
Compliance Rule Engine
↓
Decisioning + Risk Scoring
↓
Manual Review + Case Mgmt
↓
Evidence Storage (Encrypted)
↓
Regulatory Reports / Audit

### Key components

-   **KYC Engine**: Orchestrates verification steps based on region rules.
-   **Rules Engine**: Determines required documents, thresholds, identity checks per country.
-   **Risk Engine**: Assigns risk scores using behavioral, device, and transactional data.
-   **Compliance Services**: AML checks, sanctions, SOF, EDD escalation.
-   **Provider Layer**: OCR, MRZ, face match, liveness, PEP/AML vendors.
-   **Audit & Evidence Store**: Immutable logs + encrypted document storage.
-   **Manual Review Console**: Human investigation workflows.

---

# 3. Regulatory Overview (Global Principles)

Applies to all jurisdictions unless superseded by local law.

### 3.1 Age & Identity

-   No real-money play until age is verified.
-   Minimal onboarding allowed where permitted (MGA, some LATAM regions).

### 3.2 KYC Tiers

| Tier   | Use Case                       | Requirements                                     |
| ------ | ------------------------------ | ------------------------------------------------ |
| Tier 0 | Registration                   | DOB, email/wallet, soft sanctions check          |
| Tier 1 | Low deposit/play               | ID light checks, geolocation                     |
| Tier 2 | Withdrawals or higher deposits | ID + selfie + address proof                      |
| Tier 3 | High-volume/VIP                | SOF/SOW, enhanced due diligence                  |
| EDD    | Country/PEP/AML trigger        | SAR/STR review, bank statements, ownership proof |

### 3.3 Document principles

-   Government-issued only.
-   Proof of address ≤ 3 months (or 6 months where allowed).
-   ID must be unexpired.

### 3.4 AML Screening

-   OFAC, UN, EU, UK, local jurisdiction lists.
-   Screening at onboarding + weekly for active users.

### 3.5 SOF/SOW

Triggers:

-   Cumulative deposits > 2,000 (local currency) in 30 days.
-   Single deposit > 1,000.
-   First withdrawal > 500.

### 3.6 Retention & Logs

-   Standard: 5–10 years depending on region.
-   Evidence must be hash-linked for audit integrity.
-   Logs: immutable, append-only.

---

# 4. Regional Compliance Requirements

## 4.1 Europe

### United Kingdom (UKGC)

-   Age: 18+.
-   KYC must be completed before deposit/play (strict).
-   **Mandatory GAMSTOP** self-exclusion check.
-   ID: Passport, DL, EU ID.
-   Address: Utility, bank stmt, council tax.

### Malta (MGA)

-   Limited play before full KYC allowed (30 days).
-   Standard ID + address + SOF for VIP.

### Sweden (BankID)

-   BankID = instant KYC.
-   Spelpaus mandatory exclusion check.

### Germany (GGL)

-   ID verification before gameplay.
-   Strict deposit caps.
-   OASIS exclusion check required.

### Italy (ADM)

-   Codice Fiscale required.
-   ID + address + tax code validation.

### Spain (DGOJ)

-   ID before deposit.
-   Document verification before withdrawal.

### Netherlands (KSA)

-   CRUKS exclusion check.
-   ID before play.

---

## 4.2 North America

### United States (Federal + State)

-   Age: 21+ casino, 18/21 for sports.
-   Mandatory geolocation: GPS + IP + WiFi triangulation.
-   SSN (last 4) for identity matching.
-   Payment ownership verification.
-   AML reporting (SARs) per FinCEN.

### Canada (Ontario)

-   ID + address.
-   SOF for large payouts.

---

## 4.3 LATAM

### Brazil

-   **CPF mandatory**.
-   ID + address for withdrawals.
-   SOF for high-volume accounts.

### Mexico

-   CURP + ID.
-   Address required for payouts.

### Colombia

-   Cédula mandatory.

---

## 4.4 APAC

### India

-   Must geoblock illegal states.
-   PAN mandatory for payouts/tax.
-   Aadhaar only when lawful (avoid storing full number).
-   UPI/bank verification required.

### Philippines (PAGCOR)

-   Passport/PhilID.
-   AML checks mandatory.

### Singapore

-   SingPass for locals.
-   Foreigner access restricted.

### Australia

-   Online casino prohibited; sports allowed.

### New Zealand

-   ID + address.
-   AML reporting required.

---

## 4.5 Africa / MENA

### South Africa (FICA)

-   ID + proof of address.

### Kenya

-   National ID + mobile money validation.

### Nigeria

-   NIN + **BVN for bank verification**.

### UAE

-   Gambling prohibited; block entirely.

---

# 5. Advanced Fraud, Device, and Geolocation Controls

## 5.1 Geolocation Integrity

Use **multi-source validation**:

-   GPS
-   IP geolocation
-   Mobile carrier metadata
-   WiFi SSID triangulation
-   VPN/proxy detection (commercial + own heuristics)

Flag mismatches:

-   gps_country != ip_country
-   vpn_detected: true
-   device_timezone != claimed_country

## 5.2 Device Fingerprinting

Capture:

-   Browser + OS signature
-   Canvas fingerprint
-   Audio entropy
-   Local timezone
-   SIM country
-   Hardware concurrency

Used for:

-   Multi-account detection
-   Bot/automation detection
-   Device consistency scoring

## 5.3 Behavioral Biometrics (optional)

-   Typing cadence
-   Mouse movement entropy
-   Session velocity anomalies

---

# 6. Security, Privacy & Data Governance

## 6.1 Encryption & Cryptography

-   All documents stored encrypted with **AES-256** keys.
-   Use **cloud KMS / HSM** for key lifecycle.
-   Rotate keys quarterly.
-   Use separate keys per region where required (EU, India, etc.).

## 6.2 Data Residency

-   EU user data stays in EU zones.
-   India → store PAN locally if required.
-   Brazil → LGPD compliance.

## 6.3 Privacy & Consent

-   Explicit consent for biometrics (selfie/liveness).
-   User must accept data processing + retention policy.

## 6.4 GDPR Rights Support

Endpoints for:

-   Data access
-   Rectification
-   Erasure
-   Portability

## 6.5 Audit Trail

-   Every state transition written to append-only ledger.
-   Every document hashed (SHA-256) + timestamped.

---

# 7. KYC Verification Flows

## Flow A — Minimal Onboarding (Tier 0)

-   Collect DOB, email, country.
-   Sanctions soft check.
-   Limited play only.

## Flow B — Standard KYC (Tier 1–2)

1. Upload ID
2. Upload selfie (liveness)
3. Upload proof of address
4. Automatic checks:
    - OCR/MRZ
    - Face match
    - Document authenticity
    - PEP/sanctions
5. Manual review fallback.

## Flow C — Enhanced Due Diligence (EDD)

Triggered by:

-   PEP hit
-   Sanctions fuzzy match
-   High deposits (>25,000)
-   Suspicious activity

Requires:

-   3–6 months bank statements
-   Asset ownership docs
-   Income proof
-   SAR/STR escalation

## Flow D — National eID (BankID etc.)

-   Redirect to ID provider
-   Receive verified identity
-   Auto-complete KYC

---

# 8. Risk Scoring Engine

### Input signals

-   Deposit velocity
-   Device mismatch
-   Geo inconsistency
-   Image tampering detection
-   PEP/sanction proximity match
-   Transaction patterns
-   Payment method risk (prepaid cards, crypto)
-   Account age & behavior

### Output

risk_score: integer 0–100
risk_level: LOW | MEDIUM | HIGH | CRITICAL
recommended_action: PASS | REQUIRE_DOCS | EDD | BLOCK

---

# 9. Manual Review Operations

## Reviewer Console

Reviewer must see:

-   ID image, selfie, address proof
-   OCR/MRZ extracted fields
-   Face match %
-   Liveness score
-   Risk score breakdown
-   Document metadata (expiry, country)
-   Geo/device history
-   Payment activity

## Actions

-   approve
-   reject (with reason code)
-   request additional docs
-   escalate to EDD

## SLAs

-   High-risk: < 1 hour
-   Standard: < 24 hours

---

# 10. AML, PEP, Sanctions, SAR/STR

## 10.1 Screening

Sources:

-   OFAC
-   UN, EU
-   UK OFSI
-   Local PEP lists

## 10.2 Continuous Monitoring

-   Weekly re-screen of all active accounts.
-   Real-time triggers for new high-risk hits.

## 10.3 Suspicious Activity Detection

Triggers:

-   Structuring deposits
-   Rapid deposit/withdraw cycles
-   Use of multiple cards or wallets
-   Third-party payments
-   Inconsistent identity vs behavior

## 10.4 SAR/STR Workflow

1. Flag suspicious event
2. Create internal case
3. Attach all documents/evidence
4. Compliance review
5. File SAR with local FIU (FinCEN, FIU-IND, etc.)

---

# 11. API Specification

## POST /v1/kyc/register

Registers a new user.

## POST /v1/kyc/doc/upload

Uploads ID/address files.

## POST /v1/kyc/selfie

Uploads selfie + liveness.

## GET /v1/kyc/status

Returns:
{
"status": "PENDING|VERIFIED|FAILED",
"risk_score": 42,
"missing_steps": ["address"],
"actions": ["upload_address"]
}

## POST /v1/kyc/review/decision

For manual reviewers.

---

# 12. Monitoring, KPIs & SLAs

## KPIs

-   Auto-verification pass rate
-   Manual review throughput
-   Provider latency
-   False positives/negatives
-   Fraud detection rate
-   SAR cases filed

## Alerts

-   Provider failure > 5%
-   Manual queue > threshold
-   Sudden spike in failed verifications

---

# 13. Testing & QA

## Automated Tests

-   OCR accuracy & MRZ parsing
-   Face match thresholds
-   Liveness spoof tests
-   Document edge cases: glare, blur, crop
-   Geographic spoofing
-   VPN/proxy detection
-   Payment ownership mis-match

## Load Testing

-   Peak onboarding spikes (launch events).

## Chaos Testing

-   Provider outages
-   Timeouts
-   Partial failures

---

# 14. Engineer Playbooks

## Playbook: Provider Outage

-   Switch to backup provider
-   Queue pending verifications
-   Notify ops

## Playbook: KYC Rejection Appeal

-   Collect additional docs
-   Secondary reviewer assigned

## Playbook: Regulator Audit

-   Export evidence packets
-   Produce logs, timestamps, decisions
-   Provide SAR records

---

# 15. Appendices

## 15.1 Per-Country Document Checklist

(From original spec—IDs, Proof of Address, SOF requirements)

## 15.2 Detailed Workflows

-   UK
-   Sweden
-   USA (New Jersey)
-   India

---

# End of Document
