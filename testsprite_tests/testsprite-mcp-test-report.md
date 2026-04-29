# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** StudiFy
- **Date:** 2026-04-05
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

### 🔑 Authentication Flow
#### Test TC001 Sign up creates account and lands user on dashboard
- **Test Code:** [TC001_Sign_up_creates_account_and_lands_user_on_dashboard.py](./TC001_Sign_up_creates_account_and_lands_user_on_dashboard.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/20f9a6d3-5be4-4949-8d6e-193bce75687e
- **Status:** BLOCKED
- **Analysis / Findings:** Cannot render signup UI due to Next.js build error missing `./mockQuestions` in `src/lib/firebase.ts`.

#### Test TC002 Login grants access to dashboard
- **Test Code:** [TC002_Login_grants_access_to_dashboard.py](./TC002_Login_grants_access_to_dashboard.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/192eb295-45d8-4554-bc2d-bb3d34677980
- **Status:** BLOCKED
- **Analysis / Findings:** Missing `./mockQuestions` module blocks login UI from mounting.

#### Test TC003 Protected dashboard redirects to login when logged out
- **Test Code:** [TC003_Protected_dashboard_redirects_to_login_when_logged_out.py](./TC003_Protected_dashboard_redirects_to_login_when_logged_out.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/cb5213dd-abb2-4a95-bf1a-ae37abe8dd7b
- **Status:** BLOCKED
- **Analysis / Findings:** Blank application state due to build error preventing root layout.

#### Test TC012 Verify Email page shows verification instructions state
- **Test Code:** [TC012_Verify_Email_page_shows_verification_instructions_state.py](./TC012_Verify_Email_page_shows_verification_instructions_state.py)
- **Test Error:** TEST FAILURE
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/fabf5d99-d384-4b35-aa44-c566da796adc
- **Status:** ❌ Failed
- **Analysis / Findings:** Blank page rendered due to unhandled app crash preventing UI mounting.

#### Test TC014 Invalid credentials show login error
- **Test Code:** [TC014_Invalid_credentials_show_login_error.py](./TC014_Invalid_credentials_show_login_error.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/e2c79e2a-37ef-4aad-9451-c50af31233a1
- **Status:** BLOCKED
- **Analysis / Findings:** UI absent. Application blocks invalid credential validation entirely.

---

### 📊 Dashboard & Study Insights
#### Test TC004 Dashboard loads key insights blocks without crashing
- **Test Code:** [TC004_Dashboard_loads_key_insights_blocks_without_crashing.py](./TC004_Dashboard_loads_key_insights_blocks_without_crashing.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/aa926976-8f87-49de-9816-4ae71d534501
- **Status:** BLOCKED
- **Analysis / Findings:** Cannot reach Dashboard due to Next.js dev overlay preventing SPA render.

#### Test TC010 Dashboard chart interaction updates selected metric
- **Test Code:** [TC010_Dashboard_chart_interaction_updates_selected_metric.py](./TC010_Dashboard_chart_interaction_updates_selected_metric.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/a3a802c0-c4b4-428b-bda2-4d1fe1c06a29
- **Status:** BLOCKED
- **Analysis / Findings:** Charts and dashboard metrics entirely unreachable.

---

### 🛍️ Coin Shop & Gamification
#### Test TC005 Purchase an affordable shop item updates coin balance
- **Test Code:** [TC005_Purchase_an_affordable_shop_item_updates_coin_balance.py](./TC005_Purchase_an_affordable_shop_item_updates_coin_balance.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/1895ec5b-e89d-4394-a817-bb922b86ac42
- **Status:** BLOCKED
- **Analysis / Findings:** Coin shop unreachable.

#### Test TC008 Insufficient balance blocks purchase of expensive item
- **Test Code:** [TC008_Insufficient_balance_blocks_purchase_of_expensive_item.py](./TC008_Insufficient_balance_blocks_purchase_of_expensive_item.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/56514aee-a8d2-4b35-a16a-0a31043aec6d
- **Status:** BLOCKED
- **Analysis / Findings:** Missing import blocks test progression into shop views.

#### Test TC009 Shop items list is viewable for browsing
- **Test Code:** [TC009_Shop_items_list_is_viewable_for_browsing.py](./TC009_Shop_items_list_is_viewable_for_browsing.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/ab976171-edba-4d3c-9c4d-62ac7116b2a4
- **Status:** BLOCKED
- **Analysis / Findings:** Application fails to load the shop items collection.

#### Test TC011 Coin balance persists after navigating away and back to shop
- **Test Code:** [TC011_Coin_balance_persists_after_navigating_away_and_back_to_shop.py](./TC011_Coin_balance_persists_after_navigating_away_and_back_to_shop.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/77566d73-c912-46ec-ba8f-756744f20cf1
- **Status:** BLOCKED
- **Analysis / Findings:** Navigation logic blocked entirely by developer error overlay.

#### Test TC013 Canceling purchase leaves balance unchanged
- **Test Code:** [TC013_Canceling_purchase_leaves_balance_unchanged.py](./TC013_Canceling_purchase_leaves_balance_unchanged.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/3295973e-fb11-4b66-961c-b08d47fc1b7d
- **Status:** BLOCKED
- **Analysis / Findings:** Action impossible. Cannot verify unmutated balance.

---

### 🤖 AI Study Assistant
#### Test TC006 Study Assistant returns an AI response to first question
- **Test Code:** [TC006_Study_Assistant_returns_an_AI_response_to_first_question.py](./TC006_Study_Assistant_returns_an_AI_response_to_first_question.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/811e46b0-2d74-4e7c-ae5b-7e7bee811950
- **Status:** BLOCKED
- **Analysis / Findings:** Cannot open chat UI due to Next.js compilation issues.

#### Test TC007 Study Assistant follow-up stays in same conversation context in UI
- **Test Code:** [TC007_Study_Assistant_follow_up_stays_in_same_conversation_context_in_UI.py](./TC007_Study_Assistant_follow_up_stays_in_same_conversation_context_in_UI.py)
- **Test Error:** TEST BLOCKED
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0f2e2ef3-ec0f-42f4-a4dd-271325f42af2/75208618-2444-4d68-98c7-6da394d9086b
- **Status:** BLOCKED
- **Analysis / Findings:** Chat flow inaccessible.

---

## 3️⃣ Coverage & Matching Metrics

- **0.00%** of tests passed

| Requirement                | Total Tests | ✅ Passed | ❌ Failed/Blocked |
|----------------------------|-------------|-----------|-------------------|
| 🔑 Authentication Flow     | 5           | 0         | 5                 |
| 📊 Dashboard & Insights    | 2           | 0         | 2                 |
| 🛍️ Coin Shop               | 5           | 0         | 5                 |
| 🤖 AI Study Assistant      | 2           | 0         | 2                 |
| **Total**                  | **14**      | **0**     | **14**            |

---

## 4️⃣ Key Gaps / Risks

1. **FATAL CRASH / BUILD FAILURE:**
   The application is completely inoperable due to a missing file: `'./mockQuestions'` referenced in `src/lib/firebase.ts`. Because this file failed to load during the build phase/runtime chunk construction, Next.js blocks rendering the application UI entirely.
   
2. **RECOMMENDED ACTION:**
   Fix the missing import to restore base functionality. Remove the import entirely or add the corresponding file to the `src/lib/` or `src/data/` directory.

3. **TEST COVERAGE GAP:**
   Once the blocking issue is resolved, tests will be able to perform E2E assertion tracing, verify interactions, and calculate actual coverage. Currently, no logic can be assessed because `TC012` failed due to white screen, while all others are correctly flagged as BLOCKED.
