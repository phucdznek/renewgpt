# Tools Market — CDK API Documentation

## Overview

Tools Market provides a CDK (Code) redemption system for activating **ChatGPT Plus** and **ChatGPT Pro** subscriptions. This API allows you to redeem CDK codes and check their activation status.

## Base URL

```
https://toolsmarket.online
```

## Quick Start

1. Get a **CDK Code** from the admin (e.g. `TM-PLUS-XXXXXXXXXXXXXXXX`)
2. Get the user's **Access Token** from `https://chatgpt.com/api/auth/session`
3. Call `POST /redeem` with both values
4. Poll `GET /job/{job_id}?wait=30` until status is `done` or `failed`

---

## Endpoints

### POST /redeem

Redeem a CDK code to activate a ChatGPT subscription.

**Request:**

```json
{
  "cdk": "TM-PLUS-S2D3F4...",
  "access_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

| Field          | Type   | Required | Description                                |
| -------------- | ------ | -------- | ------------------------------------------ |
| `cdk`          | string | ✓        | The CDK code provided (TM- prefix)         |
| `access_token` | string | ✓        | User's ChatGPT access token (JWT)          |

> **How to get the access token:**
> 1. Log into [chatgpt.com](https://chatgpt.com)
> 2. Visit `https://chatgpt.com/api/auth/session`
> 3. Copy the `accessToken` field value (starts with `eyJ...`)

**Success Response — HTTP 200:**

```json
{
  "job_id": "a1b2c3d4e5f6...",
  "workflow": "plus",
  "status": "pending",
  "queue_position": 2,
  "estimated_wait_seconds": 540.0
}
```

**Error Responses:**

| HTTP Code | Error                        | Description                          |
| --------- | ---------------------------- | ------------------------------------ |
| 400       | Invalid or Used CDK          | Code is incorrect or already spent   |
| 401       | Unauthorized                 | (Internal) Invalid API integration   |
| 402       | Insufficient balance         | No credits remaining for this plan   |
| 500       | API Error                    | Upstream provider error              |

---

### GET /job/{job_id}

Check the status of an activation job. Supports **long-polling**.

**Parameters:**

| Parameter | Location | Required | Description                                         |
| --------- | -------- | -------- | --------------------------------------------------- |
| `job_id`  | URL path | ✓        | The job ID returned from `/redeem`                  |
| `wait`    | Query    | ✗        | Long-poll seconds (0–60, recommended: `30`)         |

**Example:**

```
GET /job/a1b2c3d4e5f6?wait=30
```

The server will hold the connection for up to `wait` seconds until the job completes, reducing the number of poll requests needed.

**Response:**

```json
{
  "job_id": "a1b2c3d4e5f6...",
  "status": "done",
  "workflow": "plus",
  "created_at": "2026-04-25T01:00:00Z",
  "completed_at": "2026-04-25T01:03:00Z"
}
```

**Job Statuses:**

| Status       | Description                              |
| ------------ | ---------------------------------------- |
| `pending`    | Queued, waiting to be processed          |
| `processing` | Currently being activated                |
| `done`       | ✅ Subscription activated successfully   |
| `failed`     | ❌ Activation failed (CDK is Auto-Restored) |

> [!TIP]
> **Automatic Restoration**: If a job status becomes `failed`, the associated CDK is automatically restored to "Available" status in our database. You can immediately try redeeming it again on a different account.

---

### GET /check/{cdk}

Check the status of a single CDK code without redeeming it.

**Example:**

```
GET /check/TM-PLUS-XXXXXXXXXXXXXXXX
```

**Response (unused):**

```json
{
  "cdk_status": "unused",
  "message": "This CDK is valid and ready to be used.",
  "workflow": "plus"
}
```

**Response (used & processing):**

```json
{
  "cdk_status": "processing",
  "status": "processing",
  "job_id": "a1b2c3d4...",
  "workflow": "plus"
}
```

---

### POST /check-bulk

Check the status of multiple CDK codes (max 100).

**Request:**

```json
{
  "cdks": [ "TM-PLUS-X1", "TM-PRO-Y2" ]
}
```

**Response:**

```json
{
  "results": [
    {
      "code": "TM-PLUS-X1",
      "cdk_status": "unused",
      "workflow": "plus"
    },
    {
      "code": "TM-PRO-Y2",
      "cdk_status": "used",
      "job_id": "a1b2...",
      "email": "user@example.com",
      "verified": "yes"
    }
  ]
}
```

---

### GET /balance

Fetch remaining credits for your workflows.

**Example:** `GET /balance`

**Response:**
```json
{
  "balances": {
    "plus": 45,
    "pro": 12
  }
}
```

---

## Integration Example (JavaScript)

```javascript
async function activate(cdk, token) {
    const BASE = 'https://toolsmarket.online';
    
    // 1. Redeem
    let res = await fetch(`${BASE}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdk, access_token: token })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // 2. Poll
    let job = data;
    while (job.status !== 'done' && job.status !== 'failed') {
        const poll = await fetch(`${BASE}/job/${job.job_id}?wait=30`);
        job = await poll.json();
    }
    
    if (job.status === 'done') console.log("Activated!");
    else console.error("Failed — CDK has been restored.");
}
```

---

## Important Notes

1. **CDK Prefix**: All codes start with `TM-`.
2. **One-Time Use**: Each CDK works exactly once per successful activation.
3. **Refunds**: If the upstream API returns `failed`, we automatically refund the credit and reactivate your CDK code.
4. **Access Tokens**: These expire frequently. Always ensure you have a fresh token before calling `/redeem`.

---

## Support

Contact the system owner via Telegram for keys or support.
