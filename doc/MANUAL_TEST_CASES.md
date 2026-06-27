# Manual Test Cases — MyExpertPay

**Version:** 1.0  
**Date:** 2026-06-27  
**Scope:** Covers all features completed through Phase 05-009 (Phases 01–04 + Forgot Password redesign).  
**Environment:** Local dev — `http://localhost:5173` (frontend) + `http://localhost:3001` (backend)

---

## How to use this document

| Column | Meaning |
|---|---|
| **TC-ID** | Unique test case identifier |
| **Steps** | Numbered actions to perform |
| **Expected** | What should happen |
| **Pass / Fail** | Tester fills in during the run |
| **Notes** | Defect ID or observation |

Legend: ✅ Pass · ❌ Fail · ⚠️ Partial

---

## 1. Authentication

### 1.1 Login — Email & Password

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-AUTH-001 | Successful login | 1. Navigate to `/login`<br>2. Enter valid email and password<br>3. Click **Sign In** | Redirected to `/` (Dashboard). User display name visible in nav. | | |
| TC-AUTH-002 | Wrong password | 1. Navigate to `/login`<br>2. Enter valid email, wrong password<br>3. Click **Sign In** | Red alert banner: *"Incorrect email or password"*. User stays on login page. | | |
| TC-AUTH-003 | Non-existent email | 1. Enter an email that has no account<br>2. Click **Sign In** | Same red alert as TC-AUTH-002 (no account enumeration). | | |
| TC-AUTH-004 | Empty email | 1. Leave email blank<br>2. Click **Sign In** | Inline field error under email. No network request fired. | | |
| TC-AUTH-005 | Invalid email format | 1. Type `notanemail` in email field<br>2. Click **Sign In** | Inline field error: email validation message. | | |
| TC-AUTH-006 | Empty password | 1. Enter valid email, leave password blank<br>2. Click **Sign In** | Inline field error under password. | | |
| TC-AUTH-007 | Show / hide password toggle | 1. Type any text in password field<br>2. Click the eye icon | Password text becomes visible. Clicking again hides it. | | |
| TC-AUTH-008 | Remember me checkbox | 1. Check *Remember me* (default on)<br>2. Login successfully<br>3. Close browser and reopen | Session is preserved. User is still logged in. | | |
| TC-AUTH-009 | Already logged in | 1. While authenticated, navigate to `/login` directly | Automatically redirected to `/`. Login page not shown. | | |
| TC-AUTH-010 | Submit button spinner | 1. Click **Sign In** with valid credentials | Button text changes to *"Signing in…"* with spinner while request is in flight. | | |

---

### 1.2 Login — Google OAuth

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-AUTH-011 | Sign in with Google | 1. Navigate to `/login`<br>2. Click **Sign in with Google** | Google OAuth popup / redirect. After consent, lands on Dashboard. | | |
| TC-AUTH-012 | Google button spinner | 1. Click **Sign in with Google** | Button shows spinner and is disabled until the OAuth flow resolves. | | |
| TC-AUTH-013 | Cancel Google consent | 1. Click **Sign in with Google**<br>2. Close or cancel the popup/consent screen | Returns to login page; generic error shown in alert. No crash. | | |

---

### 1.3 Register

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-AUTH-014 | Successful registration | 1. Navigate to `/register`<br>2. Fill in Full Name, Email, Password (≥8 chars), Confirm Password (matching)<br>3. Click **Create Account** | Account created. Redirected to `/`. | | |
| TC-AUTH-015 | Duplicate email | 1. Register with an email that already exists | Alert: *"Registration failed"* with email-already-in-use message. | | |
| TC-AUTH-016 | Password too short | 1. Enter a 5-character password | Inline field error: minimum 8 characters. | | |
| TC-AUTH-017 | Passwords don't match | 1. Enter different values in Password and Confirm Password | Inline field error on Confirm Password. | | |
| TC-AUTH-018 | Required fields empty | 1. Submit with all fields blank | All four fields show inline errors. | | |
| TC-AUTH-019 | Invalid email format | 1. Enter `badformat` as email | Inline email validation error. | | |
| TC-AUTH-020 | Show / hide password toggles | 1. Click eye icon on Password field<br>2. Click eye icon on Confirm Password field | Each field independently toggles visibility. | | |
| TC-AUTH-021 | Already logged in | 1. Navigate to `/register` while authenticated | Redirected to `/`. | | |
| TC-AUTH-022 | Submit button spinner | 1. Submit valid form | Button shows *"Creating account…"* with spinner during request. | | |
| TC-AUTH-023 | Link to Sign In | 1. Click *"Sign in"* link at top-right or bottom | Navigates to `/login`. | | |

---

### 1.4 Forgot Password

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-AUTH-024 | Successful reset email | 1. Navigate to `/forgot-password`<br>2. Enter a valid registered email<br>3. Click **Send reset link** | Success state shown: check icon, "Check your inbox" heading, the submitted email address bolded. | | |
| TC-AUTH-025 | Unknown email | 1. Enter an email not in the system<br>2. Submit | Error alert: *"Could not send reset link"*. | | |
| TC-AUTH-026 | Empty email field | 1. Click submit with blank email | Inline email field error. No network call. | | |
| TC-AUTH-027 | Invalid email format | 1. Type `nope` in the email field<br>2. Submit | Inline field error. | | |
| TC-AUTH-028 | "Try a different address" | 1. Reach the success state (TC-AUTH-024)<br>2. Click *"try a different address"* | Form resets to the empty email input. No page reload. | | |
| TC-AUTH-029 | Back to sign in — success state | 1. Reach the success state<br>2. Click **Back to sign in** button | Navigates to `/login`. | | |
| TC-AUTH-030 | "Remembered it? Sign in" link | 1. On the forgot password form, click *"Sign in"* at top-right | Navigates to `/login`. | | |
| TC-AUTH-031 | Submit spinner | 1. Submit valid email | Button shows *"Sending…"* with spinner. | | |
| TC-AUTH-032 | Already logged in | 1. Navigate to `/forgot-password` while authenticated | Redirected to `/`. | | |

---

## 2. Navigation & Layout

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-NAV-001 | Protected route — unauthenticated | 1. While logged out, navigate to `/` | Redirected to `/login`. | | |
| TC-NAV-002 | All nav links work | 1. Log in<br>2. Click each nav item: Dashboard, Bank Accounts, Cases, Recipients, Payments | Each route loads without error. Active link is visually highlighted. | | |
| TC-NAV-003 | Logout | 1. Trigger sign-out from nav (avatar or logout button)<br>2. Attempt to navigate to `/` | Redirected to `/login`. Auth state cleared. | | |
| TC-NAV-004 | 404 page | 1. Navigate to `/does-not-exist` | Not Found page renders. | | |
| TC-NAV-005 | Page title / branding | 1. Open any authenticated page | "MyExpertPay" logo / branding visible in header. | | |

---

## 3. Dashboard

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-DASH-001 | Welcome greeting | 1. Log in and land on Dashboard | Greeting shows the logged-in user's display name. | | |
| TC-DASH-002 | Account Summary tab (default) | 1. Land on Dashboard | "Account Summary" tab is active by default. Account summary widget and payment chart visible. | | |
| TC-DASH-003 | Switch to Activity Calendar tab | 1. Click *Activity Calendar* tab | Tab becomes active. Calendar widget renders without error. | | |
| TC-DASH-004 | Switch to Recent Messages tab | 1. Click *Recent Messages* tab | Tab becomes active. Recent messages widget renders. | | |
| TC-DASH-005 | Tab switching preserves layout | 1. Switch between all three tabs back and forth | No layout jumps or blank panels. Only the active tab's content is shown. | | |
| TC-DASH-006 | Account Summary — data loads | 1. Open Account Summary tab | Balance, payment totals, or key account metrics are displayed (or empty state if no data). | | |
| TC-DASH-007 | Payment Chart renders | 1. Open Account Summary tab | Recharts payment chart is visible. No JS error in console. | | |
| TC-DASH-008 | Activity Calendar renders | 1. Open Activity Calendar tab | Calendar grid renders with the current month. Payment activity days are highlighted. | | |
| TC-DASH-009 | Recent Messages — up to 5 shown | 1. Open Recent Messages tab | Up to 5 recent messages are listed. Each shows subject / snippet. | | |
| TC-DASH-010 | Dashboard loading state | 1. Open Dashboard on slow/throttled network | Spinner shown while data is fetching. No blank page. | | |

---

## 4. Bank Accounts

### 4.1 List & Layout

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-BANK-001 | List loads | 1. Navigate to `/bank-accounts` | Page renders. List of existing bank accounts shown in sidebar. | | |
| TC-BANK-002 | Empty state | 1. On an account with no bank accounts linked | Empty state message shown. | | |
| TC-BANK-003 | Account count | 1. View page header | Header shows count of verified accounts and pending accounts (e.g. *"3 verified · 1 pending"*). | | |
| TC-BANK-004 | Select account | 1. Click a bank account in the sidebar | Detail panel on the right updates to show that account's details. | | |
| TC-BANK-005 | Pagination | 1. If > 20 accounts exist, navigate to page 2 | Second page of accounts loads. Pagination controls work. | | |

---

### 4.2 Add Bank Account

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-BANK-006 | Open add form | 1. Click **Add Account** (or equivalent button) | Add Bank Account modal opens. | | |
| TC-BANK-007 | Successful add | 1. Enter valid 9-digit ABA routing number<br>2. Enter bank name<br>3. Enter account number and confirm (matching)<br>4. Select account type (Checking or Saving)<br>5. Submit | Modal closes. Toast confirms success. New account appears in sidebar list. | | |
| TC-BANK-008 | Invalid routing number | 1. Enter a 9-digit number that fails ABA checksum (e.g. `123456789`)<br>2. Submit | Inline error: *"Invalid routing number"*. No network call. | | |
| TC-BANK-009 | Routing number too short | 1. Enter fewer than 9 digits | Inline error on routing field. | | |
| TC-BANK-010 | Account numbers don't match | 1. Enter different values in Account Number and Confirm Account Number | Inline error on confirm field. | | |
| TC-BANK-011 | Required fields empty | 1. Submit blank form | All required fields show inline errors. | | |
| TC-BANK-012 | Nickname optional | 1. Leave Nickname blank<br>2. Submit otherwise valid form | Account created successfully without a nickname. | | |
| TC-BANK-013 | Nickname max length | 1. Enter 61+ characters in Nickname | Inline error (max 60 characters). | | |
| TC-BANK-014 | Cancel add | 1. Open modal, click Cancel / close (Escape or ×) | Modal closes. No account added. List unchanged. | | |

---

### 4.3 Edit Bank Account

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-BANK-015 | Open edit form | 1. Select an account in sidebar<br>2. Click **Edit** in detail panel | Edit modal opens with current account type and nickname pre-filled. | | |
| TC-BANK-016 | Edit account type | 1. Change account type (Checking ↔ Saving)<br>2. Submit | Modal closes. Detail panel reflects updated type. Toast confirms. | | |
| TC-BANK-017 | Edit nickname | 1. Change nickname<br>2. Submit | Nickname updated in the sidebar and detail panel. | | |
| TC-BANK-018 | Routing / account number not editable | 1. Open edit modal | Routing number and account number fields are not present (edit only exposes type + nickname). | | |
| TC-BANK-019 | Cancel edit | 1. Open edit modal, click Cancel | Modal closes. Account unchanged. | | |

---

### 4.4 Verify, Set Primary, Toggle Routing

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-BANK-020 | Verify account | 1. Select an unverified account<br>2. Click **Verify** in detail panel | Account status changes to verified. List updates. Toast shown. | | |
| TC-BANK-021 | Set as primary | 1. Select a non-primary account<br>2. Click **Set as Primary** | Account shows Primary badge. Previous primary loses badge. Toast shown. | | |
| TC-BANK-022 | Toggle receive payments | 1. Toggle *Receive Payments* switch on an account | Switch state updates. List refreshes. | | |
| TC-BANK-023 | Toggle send payments | 1. Toggle *Send Payments* switch on an account | Switch state updates. List refreshes. | | |

---

### 4.5 Delete Bank Account

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-BANK-024 | Delete triggers confirmation | 1. Click **Remove Account** (or delete icon) | Confirmation dialog appears: *"Are you sure?"* | | |
| TC-BANK-025 | Confirm delete | 1. Confirm the dialog | Account removed from list. Detail panel clears (shows next account or empty state). Toast confirms. | | |
| TC-BANK-026 | Cancel delete | 1. Dismiss the confirmation dialog | Account is not deleted. List unchanged. | | |

---

## 5. Cases

### 5.1 List

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-CASE-001 | List loads | 1. Navigate to `/cases` | Page renders. Existing cases listed. | | |
| TC-CASE-002 | Empty state | 1. On an account with no cases | Empty state shown. | | |
| TC-CASE-003 | Pagination | 1. If > 20 cases exist, navigate to next page | Pagination works. | | |

---

### 5.2 Add Case

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-CASE-004 | Open add form | 1. Click **Add Case** | Case form modal opens. | | |
| TC-CASE-005 | Successful add | 1. Enter valid case number<br>2. Enter NCP name<br>3. Optionally add children<br>4. Submit | Modal closes. New case appears in list. Toast confirms. | | |
| TC-CASE-006 | Invalid case number | 1. Enter a value that fails case-number format validation<br>2. Submit | Inline error: *"Invalid case number"*. | | |
| TC-CASE-007 | Required fields empty | 1. Submit blank form | Case number and NCP name show inline errors. | | |
| TC-CASE-008 | Add child | 1. Click *Add child* button<br>2. Enter child name | Child input appears and is included in payload. | | |
| TC-CASE-009 | Remove child | 1. Add at least one child<br>2. Click remove (×) next to a child | That child input is removed from the form. | | |
| TC-CASE-010 | Cancel add | 1. Open modal, press Escape | Modal closes. No case added. | | |

---

### 5.3 Edit Case

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-CASE-011 | Open edit form | 1. Click edit icon on a case | Edit modal opens with current values pre-filled. | | |
| TC-CASE-012 | Edit NCP name | 1. Change NCP name<br>2. Submit | List and detail updated. Toast confirms. | | |
| TC-CASE-013 | Edit children | 1. Add or remove a child<br>2. Submit | Children list updated. | | |
| TC-CASE-014 | Case number not editable | 1. Open edit modal | Case number field is read-only or absent. | | |

---

### 5.4 Delete Case

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-CASE-015 | Delete triggers confirmation | 1. Click delete icon on a case | Confirmation dialog appears. | | |
| TC-CASE-016 | Confirm delete | 1. Confirm | Case removed from list. Toast confirms. | | |
| TC-CASE-017 | Cancel delete | 1. Dismiss dialog | Case unchanged. | | |

---

## 6. Recipients

### 6.1 List

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-RECIP-001 | List loads | 1. Navigate to `/recipients` | Recipients listed as cards. | | |
| TC-RECIP-002 | Empty state | 1. No recipients added yet | Empty state message shown. | | |
| TC-RECIP-003 | Pagination | 1. > 20 recipients exist | Pagination controls render and navigate. | | |

---

### 6.2 Add Recipient

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-RECIP-004 | Open add form | 1. Click **Add Recipient** | Recipient form modal opens. | | |
| TC-RECIP-005 | Successful add | 1. Enter First Name, Last Name, valid Email<br>2. Optionally select a Case<br>3. Submit | Modal closes. Recipient appears in list. Toast confirms. | | |
| TC-RECIP-006 | Required fields empty | 1. Submit blank form | First name, last name, email show inline errors. | | |
| TC-RECIP-007 | Invalid email | 1. Enter `notanemail`<br>2. Submit | Inline email error. | | |
| TC-RECIP-008 | Case dropdown shows user's cases | 1. Open add form | Case dropdown contains only cases belonging to the logged-in user. | | |
| TC-RECIP-009 | Cancel | 1. Open modal, click Cancel | Modal closes. No recipient added. | | |

---

### 6.3 Edit Recipient

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-RECIP-010 | Open edit form | 1. Click edit icon on a recipient card | Form opens with current values pre-filled. | | |
| TC-RECIP-011 | Update name | 1. Change first or last name<br>2. Submit | Card updates. Toast confirms. | | |
| TC-RECIP-012 | Update email | 1. Change email to valid address<br>2. Submit | Email updated. | | |
| TC-RECIP-013 | Update linked case | 1. Change case in dropdown<br>2. Submit | Recipient's case updated. | | |

---

### 6.4 Delete Recipient

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-RECIP-014 | Delete triggers confirmation | 1. Click delete icon on a recipient | Confirmation dialog shown. | | |
| TC-RECIP-015 | Confirm delete | 1. Confirm | Recipient removed from list. Toast confirms. | | |
| TC-RECIP-016 | Cancel delete | 1. Dismiss dialog | Recipient unchanged. | | |

---

## 7. Payments

### 7.1 List

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-PAY-001 | List loads | 1. Navigate to `/payments` | Table renders with columns: Date, Recipient, Case Number, Status, Amount. | | |
| TC-PAY-002 | Empty state | 1. No payments exist | Empty state message shown. | | |
| TC-PAY-003 | Pagination | 1. > 20 payments exist | Pagination controls navigate pages. URL updates `?page=N`. | | |
| TC-PAY-004 | Page persists in URL | 1. Navigate to page 3 via pagination<br>2. Refresh the page | Page 3 is still shown (URL param preserved). | | |
| TC-PAY-005 | Payment status badge | 1. View the payments list | Each payment row shows a colour-coded status badge (all 10 statuses handled without error). | | |

---

### 7.2 Filters

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-PAY-006 | Filter by start date | 1. Set a start date in the date range picker | List refreshes. Only payments on or after that date shown. Page resets to 1. | | |
| TC-PAY-007 | Filter by end date | 1. Set an end date | Only payments on or before that date shown. | | |
| TC-PAY-008 | Filter by date range | 1. Set both start and end date | Only payments within the range shown. | | |
| TC-PAY-009 | Filter by single status | 1. Select one status in the MultiSelect | Only payments with that status shown. | | |
| TC-PAY-010 | Filter by multiple statuses | 1. Select two or more statuses | Payments with any of the selected statuses shown. | | |
| TC-PAY-011 | Combine date + status filters | 1. Set a date range AND select a status | Both filters applied simultaneously. | | |
| TC-PAY-012 | Clear all filters | 1. Apply any filter<br>2. Click **Clear Filters** | All filters removed. Full list returns. "Clear Filters" button disappears. | | |
| TC-PAY-013 | Clear button only shown with active filters | 1. Load page with no filters | "Clear Filters" button is not visible. | | |
| TC-PAY-014 | Filters persist in URL | 1. Apply a date range and status<br>2. Refresh the page | Filters are restored from URL params. | | |

---

### 7.3 Send / Request Money (disabled state)

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-PAY-015 | Send Money button is disabled | 1. View Payments page header | "Send Money" button is present but **disabled** (not clickable). Tooltip says "Coming soon". | | |
| TC-PAY-016 | Request Money button is disabled | 1. View Payments page header | "Request Money" button is present but **disabled**. Tooltip says "Coming soon". | | |

---

## 8. Data Isolation (Row-Level Security)

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-SEC-001 | Bank accounts scoped to user | 1. Log in as User A<br>2. Note account IDs<br>3. Log in as User B | User B cannot see User A's bank accounts. | | |
| TC-SEC-002 | Cases scoped to user | Same steps as TC-SEC-001 for cases | User B's case list contains no data from User A. | | |
| TC-SEC-003 | Recipients scoped to user | Same steps for recipients | User B cannot see User A's recipients. | | |
| TC-SEC-004 | Payments scoped to user | Same steps for payments | User B cannot see User A's payment history. | | |
| TC-SEC-005 | Direct API call rejected | 1. Note a bank account ID that belongs to User A<br>2. Authenticate as User B<br>3. Call `GET /api/banks/<userA-bank-id>` directly | API returns 404 (not 200 with User A's data). | | |

---

## 9. Cross-Cutting Concerns

| TC-ID | Scenario | Steps | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| TC-CROSS-001 | Loading spinners | 1. On a throttled network, open any data page | Spinner shown during initial data fetch. Page doesn't flash blank content. | | |
| TC-CROSS-002 | Error state | 1. Kill the backend server<br>2. Open Bank Accounts or Payments | Error message / `<ErrorMessage>` component shown. No crash. | | |
| TC-CROSS-003 | Toast on success | 1. Add / edit / delete any resource | Toast notification appears and auto-dismisses. | | |
| TC-CROSS-004 | Modal closes on success | 1. Submit any add or edit form | Modal closes after successful save. | | |
| TC-CROSS-005 | Escape key closes modal | 1. Open any modal<br>2. Press Escape | Modal closes without saving. | | |
| TC-CROSS-006 | Locale EN (default) | 1. Load any page with default locale | All UI text is in English. No missing-translation keys (blank strings or `[key]` placeholders). | | |

---

## 10. Pending Features — Not Yet Testable

> These features are implemented as stubs or are not yet built. Each is tracked in a GitHub issue. **Do not execute these test cases** until the linked issue is closed.

| Ref | Feature | One-line description | GitHub Issue |
|---|---|---|---|
| P05-001 | Send Money Modal | Clicking "Send Money" opens a modal form that calls `POST /api/payments/send`. | [#1](https://github.com/sheetstone/myexpectpay/issues/1) |
| P05-002 | Request Money Modal | Clicking "Request Money" opens a modal form that calls `POST /api/payments/request`. | [#2](https://github.com/sheetstone/myexpectpay/issues/2) |
| P05-003 | Messages Page | `/messages` shows full inbox with read/unread state, accordion expansion, and nav badge update. | [#3](https://github.com/sheetstone/myexpectpay/issues/3) |
| P05-004 | User Profile Page | `/profile` allows editing display name and changing password via Firebase re-auth. | [#4](https://github.com/sheetstone/myexpectpay/issues/4) |
| P05-005 | Account Settings Page | `/settings` has a language switcher (EN/DE/ES) and a confirmed delete-account flow. | [#5](https://github.com/sheetstone/myexpectpay/issues/5) |
| P05-006 | Delete User Endpoint | `DELETE /api/users/me` removes all user data in a single Postgres transaction. | [#6](https://github.com/sheetstone/myexpectpay/issues/6) |
| P05-007 | i18n DE / ES gap fill | DE and ES files are missing 36+ `bankAccount.*` keys; new feature keys not yet added. | [#7](https://github.com/sheetstone/myexpectpay/issues/7) |
| P05-008 | Mobile Responsive | All pages audited and fixed at 361 / 711 / 921 / 1201 px breakpoints. | [#8](https://github.com/sheetstone/myexpectpay/issues/8) |

---

*Generated 2026-06-27. Update Pass/Fail columns as testing progresses.*
