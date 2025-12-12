# OpenCash Gateway – Global P2P On/Off-Ramp Framework

A unified payment escrow gateway enabling P2P deposits and withdrawals for iGaming using local payment systems and a distributed PSP mesh network.

---

## Features

-   P2P On-Ramp (Cash → Tokens)
-   P2P Off-Ramp (Tokens → Cash)
-   Escrow-based settlement between players and PSP agents
-   Local payment frameworks per country
-   Automatic callbacks and verification
-   Compliance-aware routing
-   PSP mesh network load-balancing
-   Modular country plugins

---

# 1. Architecture

Player → OpenCash Gateway → PSP Agent → Payment Rail → Bank/Wallet
↑ ↓
Escrow Engine Callbacks

## Components

### OpenCash Core

-   Orchestrates deposits & withdrawals
-   Manages asset escrow
-   Selects and scores PSP agents
-   Sends callbacks to iGaming platforms (ex: Gamedock)

### PSP Mesh Network

Each agent provides:

-   Bank/wallet account (receiver)
-   Liquidity pool
-   Instant settlement ability
-   Reporting webhook
-   Trust score & availability

### Escrow Engine

-   Locks tokens until fiat confirmation
-   Releases tokens to PSP on successful payout
-   Reverses on timeout or dispute
-   Fraud & risk evaluation

---

# 2. INDIA (Reference Implementation)

## Supported Payment Rails

-   UPI (QR, Intent, VPA)
-   IMPS
-   NEFT
-   RTGS
-   BHIM

## Deposit Flow

1. Player enters amount.
2. OpenCash assigns PSP agent.
3. Display UPI QR / VPA or IMPS/NEFT/RTGS bank details.
4. Player transfers.
5. PSP/bank callback received.
6. Verify payment hash → credit user.
7. Reject if mismatch.

## Withdrawal Flow

1. Player enters UPI/BANK details.
2. PSP agent sends funds.
3. Player confirms receipt.
4. Escrow releases tokens to PSP.
5. Dispute-handling fallback.

---

# 3. COUNTRY-BY-COUNTRY PAYMENT FRAMEWORKS

---

# United States

## Payment Rails

-   ACH
-   RTP
-   FedNow
-   Zelle
-   CashApp / Venmo
-   Visa Direct / Mastercard Send

## Deposit

1. PSP agent provides bank/Zelle/CashApp.
2. Player transfers.
3. Aggregator webhook verifies (Plaid/ModernTreasury).
4. Credit user.

## Withdrawal

1. Player submits payout method.
2. PSP sends fiat → user confirms → escrow releases.

---

# United Kingdom

## Payment Rails

-   Faster Payments (FPS)
-   Open Banking A2A
-   BACS (avoid)

## Deposit

-   FPS or Open Banking redirect.
-   Callback verifies.

## Withdrawal

-   PSP → FPS → user confirmation → escrow release.

---

# European Union (SEPA Region)

## Payment Rails

-   SEPA SCT
-   SEPA Instant
-   Revolut / Wise
-   Trustly
-   iDEAL (NL)
-   Bancontact (BE)
-   Giropay (DE)

## Deposit

-   Show PSP IBAN → SCT Inst → callback.

## Withdrawal

-   PSP executes SCT Inst → confirmation → escrow release.

---

# United Arab Emirates

## Payment Rails

-   AANI
-   UAEFTS
-   IBAN payouts

## Deposit / Withdrawal

-   IBAN/AANI QR → instant settlement → escrow release.

---

# Singapore

## Payment Rails

-   PayNow
-   FAST

## Deposit

-   PayNow QR → callback.

## Withdrawal

-   PayNow/FAST → confirm → escrow release.

---

# Nigeria

## Payment Rails

-   NIP
-   USSD
-   Opay / Palmpay / Kuda

## Deposit

-   Bank/USSD transfer → NIBSS callback.

## Withdrawal

-   NIP → confirmation → escrow release.

---

# Indonesia

## Payment Rails

-   Virtual Accounts (VA)
-   QRIS
-   OVO/Dana/GoPay

## Deposit

-   VA or QRIS → callback.

## Withdrawal

-   Local e-wallet payout → confirmation.

---

# Philippines

## Payment Rails

-   InstaPay
-   PESONet
-   GCash
-   Maya

## Deposit

-   GCash QR or InstaPay → callback.

## Withdrawal

-   InstaPay → confirm → release.

---

# Brazil

## Payment Rails

-   PIX (QR / key)

## Deposit

-   PIX QR/key → instant callback.

## Withdrawal

-   PIX payout → confirmation.

---

# Mexico

## Payment Rails

-   SPEI
-   CoDi QR

## Deposit/Withdrawal

-   SPEI/CoDi → callback → confirmation → escrow release.

---

# South Africa

## Payment Rails

-   EFT Instant
-   Ozow
-   SnapScan

## Deposit

-   Bank/Ozow redirect → callback.

## Withdrawal

-   EFT → confirmation.

---

# 4. Universal Escrow Logic

## Deposits

-   Funds received → callback verified → tokens released to player.

## Withdrawals

-   PSP sends fiat → user confirms → tokens released to PSP.

## Timeouts

-   Automatic reversal
-   Escrow rollback
-   Dispute queue

---

# 5. Risk & Compliance

-   Velocity limits
-   Transaction pattern analysis
-   Duplicate-proofing
-   PSP trust scoring
-   AML monitoring
-   Geo-block enforcement
-   Sanction screening (when required)

---

# 6. Developer Integration

## PSP → OpenCash Webhook

```json
{
  "transaction_id": "ABC123",
  "amount": 5000,
  "currency": "INR",
  "status": "SUCCESS",
  "timestamp": "2025-01-01T12:00:00Z",
  "payer_reference": "user@upi"
}
{
  "user_id": "12991",
  "event": "DEPOSIT_SUCCESS",
  "amount": 5000,
  "currency": "INR",
  "oc_transaction_id": "OC34988341"
}
7. Extending to New Countries

To add a country:

Define payment rails

Add verification method

Configure PSP eligibility rules

Build webhook interpreter

Add currency-pair rules

Configure escrow thresholds

Test: under-pay, over-pay, timeout, duplicate

Modular structure example:
/countries/india.js
/countries/us.js
/countries/brazil.js
...

---

# 7. Plugin Architecture

- Country plugin registry with standardized interface
- Rails listing per country
- Session creation and callback handlers per rail
- PSP agent selection with trust scoring and availability

## Interface

```

CountryPlugin {
code: string
rails(): string[]
createDepositSession({ playerId, peerId, asset, amountFiat, rail })
depositCallback({ orderId, status })
createWithdrawSession({ playerId, peerId, asset, amountAsset, rail, payoutId })
withdrawCallback({ orderId, status })
}

```

## Endpoints

- `GET /opencash/country/rails?country=IN`
- `POST /opencash/country/deposit/session`
- `POST /opencash/country/deposit/callback`
- `POST /opencash/country/withdraw/session`
- `POST /opencash/country/withdraw/callback`

---

# 8. Escrow Lifecycle & State Machine

- States: `pending` → `funds_received` → `released` / `rejected`
- Timeouts: `POST /opencash/escrow/timeout` → reversal and dispute option
- Disputes: open, comment, escalate, resolve
- UI: linear steps per operation with explicit transitions and validation

---

# 9. PSP Mesh & Selection

- Agent attributes: rails, country, trust, online
- Selection policy: highest trust & online match for rail/country
- Fallback: next agent on failure

---

# 10. Global Country Requirements

- United States: ACH/RTP/FedNow, webhook verification, instant releases
- United Kingdom: FPS/Open Banking, redirect flows, callback confirmation
- European Union: SEPA SCT Inst, IBAN display, callback-based credit
- UAE: AANI/UAEFTS, IBAN QR, immediate settlement mapping
- Singapore: PayNow/FAST, QR and callback
- Nigeria: NIP/USSD, NIBSS callback parsing
- Indonesia: VA/QRIS, e-wallet payouts
- Philippines: InstaPay/PESONet, GCash/Maya QR
- Brazil: PIX QR/key, instant callback and payout
- Mexico: SPEI/CoDi QR, callback, confirmation, release
- South Africa: EFT Instant/Ozow/SnapScan, redirects and callbacks

All countries use the same escrow, dispute, and compliance framework with rail-specific payloads and webhook interpreters.
```
