# VULN-005 – Missing / Weak Request Validation

**Related Issue:** #58

This document highlights the request validation vulnerability identified in Issue #58.
It provides clear instructions to test **only the affected and existing API endpoints** using intentionally invalid input to verify proper request validation.

All examples use **dummy values** and **localhost URLs**.

---

## Base URL

```
http://localhost:4000
```

---

## How to Test

Send malformed or invalid requests to the endpoints listed below.

### Expected Behavior

* API rejects invalid input
* API returns HTTP `400` or `422`
* API returns a clear validation error message
* No request reaches external services (Jira / Confluence) when validation fails

---

## Invalid Test Cases

### 1. Jira – Create Issue (Invalid Input)

**Endpoint**

```
POST http://localhost:4000/api/jira/issues
```

#### Invalid Payload #1 (Missing Required Fields)

```json
{
  "projectKey": "",
  "summary": "",
  "issueType": "Bug"
}
```

#### Invalid Payload #2 (Invalid projectKey Format)

```json
{
  "projectKey": "scrum",
  "summary": "Test issue",
  "issueType": "Bug"
}
```

**Expected Result**

```
400 Bad Request
```

Validation error indicating invalid or missing fields.
✅ Confirms `projectKey`, `summary`, and `issueType` validators are working.

---

### 2. Confluence – Validate Connection (Missing Body)

**Endpoint**

```
POST http://localhost:4000/api/confluence/validate
```

#### Invalid Payload

```json
{}
```

**Expected Result**

```
400 Bad Request
```

Validation error indicating required configuration fields are missing.
✅ Confirms request validators for Confluence connection are working.

---

## Validation Status

All tested endpoints correctly reject invalid requests.

This confirms that **request validation introduced for Issue #58 (VULN-005)** is functioning as intended and prevents malformed or abusive input.

---

