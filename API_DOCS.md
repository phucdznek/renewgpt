# Tools Market — CDK API Documentation

## Overview

Tools Market provides a CDK (Code) redemption system for activating **ChatGPT Plus** and other subscriptions. This API allows you to redeem CDK codes using account credentials (Direct Login) or check their status.

## Base URL

```
https://toolsmarket.online
```

## Quick Start

1. Get a **CDK Code** (e.g. `TM-PLUS-XXXXXXXXXXXXXXXX`)
2. Collect the user's **Email**, **Password**, and **TOTP Secret** (if 2FA is enabled)
3. Call `POST /redeem` with these values
4. Poll `GET /job/{job_id}?wait=30` until status is `success` or `failed`

---

## Endpoints

### POST /redeem

Redeem a CDK code to activate a subscription.

**Request:**

```json
{
  "cdk": "TM-PLUS-S2D3F4...",
  "email": "user@example.com",
  "password": "my_password123",
  "totp_secret": "JBSWY3DPEHPK3PXP"
}
```

| Field         | Type   | Required | Description                                  |
| ------------- | ------ | -------- | -------------------------------------------- |
| `cdk`         | string | ✓        | The CDK code provided                        |
| `email`       | string | ✓        | Account email                                |
| `password`    | string | ✓        | Account password                             |
| `totp_secret` | string | ✗        | 2FA Secret/Seed (if enabled on account)      |

**Success Response — HTTP 200:**

```json
{
  "job_id": "a1b2c3d4e5f6...",
  "status": "pending",
  "queue_position": 2,
  "estimated_wait_seconds": 540.0
}
```

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

**Response (Processing):**

```json
{
  "job_id": "a1b2c3d4e5f6...",
  "status": "processing",
  "stage": 3,
  "total_stages": 8,
  "stage_label": "Logging in...",
  "queue_position": 0
}
```

**Response (Success):**

```json
{
  "job_id": "a1b2c3d4e5f6...",
  "status": "success",
  "url": "https://families.google.com/invitation/..."
}
```

**Job Statuses:**

| Status       | Description                              |
| ------------ | ---------------------------------------- |
| `pending`    | Queued, waiting to be processed          |
| `processing` | Currently being activated                |
| `success`    | ✅ Subscription activated successfully   |
| `failed`     | ❌ Activation failed (CDK is Auto-Restored) |

---

### GET /check/{cdk}

Check the status of a single CDK code.

**Response:**

```json
{
  "cdk_status": "unused",
  "message": "This CDK is valid and ready to be used.",
  "workflow": "plus"
}
```

---

### POST /check-bulk

Check multiple CDK codes (max 100).

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
      "cdk_status": "completed",
      "job_id": "a1b2...",
      "workflow": "pro"
    }
  ]
}
```

---

## Important Notes

1. **Wait Parameter**: Always use `?wait=30` when polling to reduce server load and get faster updates.
2. **Success URL**: For some plans (like Google One), a `url` is returned on success. Users MUST visit this URL to complete the process.
3. **Refunds**: If status is `failed`, the CDK is automatically restored.

