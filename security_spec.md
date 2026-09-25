# Security Specification & Threat Model (Namma NyayaMitra AI)

This document establishes the rigorous Attribute-Based Access Control (ABAC) bounds, data invariants, and pentesting payloads designed to verify the security of the Firestore instance for Namma NyayaMitra.

## 1. Data Invariants

1.  **Strict Profile Ownership**: Users can only read, create, or update a profile document matching their exact Firebase Authentication UID (`/users/{userId}`). No third-party profiles can be read or modified.
2.  **Analyzed Scans Privacy**: Contract scans/analyses (`/analyses/{analysisId}`) are strictly confidential. A document can only be read, queried, or written if the `userId` field of the document matches the authenticated caller's UID. Blanket collection lists are completely denied unless forced by matching the exact owner UID.
3.  **Drafted agreements Privacy**: Generated drafts (`/contracts/{contractId}`) can only be managed (created, read, deleted) by the specific user who submitted the drafting forms. 
4.  **Immutability of Integrity Fields**: Audit timestamps (`createdAt`, `analyzedAt`) and security credentials (`userId`, `id`, `email`) must not be modifiable once inserted.
5.  **Strict ID Limits & Types**: Handled document identifiers must conform to standard regex character sets and size thresholds to prevent buffer or resource denial-of-service attempts.

---

## 2. The "Dirty Dozen" Threat Payloads

Here are 12 malicious payloads and queries that our `firestore.rules` MUST securely reject with a `PERMISSION_DENIED` status:

### Pile 1: Identity Spoofing & Profiling
1.  **Attack Profile Creation (Malicious UID)**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/users/proprietor_victim`
    *   *Payload*: `{ "userId": "proprietor_victim", "email": "victim@example.com", "displayName": "Victim Proprietor" }`
    *   *Outcome*: **PERMISSION_DENIED** (UID mismatch)

2.  **Attempting Administrator Claims Injection**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/users/hacker123`
    *   *Payload*: `{ "userId": "hacker123", "email": "hacker@example.com", "role": "admin", "isAdmin": true }`
    *   *Outcome*: **PERMISSION_DENIED** (Privilege escalation / shadow keys fail hasOnly)

### Pile 2: Scans Leakage & Poisoning
3.  **Cross-Tenant Scans Read (Direct Get)**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/analyses/analysis_from_kirana_store`
    *   *Target Doc*: has `userId == "kiranas_uid"`
    *   *Outcome*: **PERMISSION_DENIED** (Owner check failure on read)

4.  **Collection-Level Analytical Scraping (Blanket List)**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Query*: `db.collection('analyses').get()`
    *   *Outcome*: **PERMISSION_DENIED** (Insecure query without where filter matching personal UID)

5.  **Malicious ID Length Attack (Denial of Wallet)**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/analyses/` + (random junk string of 1.5 Kilobytes long)
    *   *Outcome*: **PERMISSION_DENIED** (Document ID fails size limits)

6.  **Spoofed Creation Owner (Stolen Identity insertion)**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/analyses/analysis_new`
    *   *Payload*: `{ "id": "analysis_new", "userId": "kiranas_uid", "documentType": "vendor", "overallRiskScore": 5, "analyzedAt": "2026-05-21T01:40:15Z" }`
    *   *Outcome*: **PERMISSION_DENIED** (Identity integrity mismatch)

### Pile 3: Draft Poisoning & Tampering
7.  **Siphoning Other User's Generated Contracts**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/contracts/secret_agreement_99`
    *   *Target Doc*: has `userId == "kiranas_uid"`
    *   *Outcome*: **PERMISSION_DENIED** (Mismatch read check)

8.  **Injecting Massive Garbage Data into Bodies**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/contracts/contract_hack`
    *   *Payload*: `{ "id": "contract_hack", "userId": "hacker123", "documentTitle": "Agreement", "documentBody": "X" * 200000, "createdAt": "2026-05-21T01:40:15Z" }`
    *   *Outcome*: **PERMISSION_DENIED** (Type size validation boundary breach)

9.  **Stale Client Timestamp Attack**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/contracts/contract_hack_2`
    *   *Payload*: `{ "id": "contract_hack_2", "userId": "hacker123", "documentTitle": "Agreement", "documentBody": "Short text", "createdAt": "1999-01-01T00:00:00Z" }`
    *   *Outcome*: **PERMISSION_DENIED** (Must use server timestamp)

### Pile 4: Improper Updates / State Tampering
10. **Immutability Breach (Overwriting Owner ID)**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/contracts/contract_hacker_own`
    *   *Payload (Update)*: Current owner is `hacker123`. Malicious payload updates `userId` to `victim_uid`.
    *   *Outcome*: **PERMISSION_DENIED** (immutability check on update)

11. **Malicious Empty Fields payload injection (Schema Bypass)**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/users/hacker123`
    *   *Payload Update*: Send empty `email` field
    *   *Outcome*: **PERMISSION_DENIED** (Schema requirements fails nulls or bounds)

12. **Bypassing Whitelist (Ghost field injection in Update)**:
    *   *Attacker auth.uid*: `hacker123`
    *   *Path*: `/contracts/contract_hacker_own`
    *   *Payload Update*: `{ "documentTitle": "New Title", "ghostField": "maliciousLeak" }`
    *   *Outcome*: **PERMISSION_DENIED** (diff.affectedKeys() check mismatch)
