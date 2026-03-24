# Auth Session Spec

## Purpose

This spec defines the stable authentication session contract for the mock auth shell slice.

## Normative Requirements

### 1. Login Request

`login(identifier, password)` MUST accept a JSON request body with exactly these fields:

```json
{
  "identifier": "employee",
  "password": "glintrise-123"
}
```

The `identifier` field MUST be a required string.
The `password` field MUST be a required string.

The implementation MUST accept only these mock identities:

| identifier | password | role |
| --- | --- | --- |
| `employee` | `glintrise-123` | `employee` |
| `director` | `glintrise-123` | `director` |
| `developer` | `glintrise-123` | `developer` |

If `identifier` is not one of the supported identities, the operation MUST fail with `USER_NOT_FOUND`.
If `identifier` exists but `password` does not match the fixed password, the operation MUST fail with `INVALID_CREDENTIALS`.
If either field is missing, empty, or not a string, the operation MUST fail with `VALIDATION_ERROR`.
The implementation MUST create a session only when both the identifier and password match the fixed credential table exactly.

### 2. Login Success Payload

On success, `login(identifier, password)` MUST return a session payload with this shape:

```json
{
  "session": {
    "token": "mock-session-token",
    "user": {
      "id": "user-employee",
      "name": "内部员工",
      "role": "employee"
    }
  }
}
```

The `session` object MUST contain:

- `token`: a required non-empty string
- `user.id`: a required non-empty string
- `user.name`: a required non-empty string
- `user.role`: a required string equal to one of `employee`, `director`, or `developer`

The `token` value MAY be fixed for the mock implementation, but it MUST be persisted and returned consistently for the active session.

### 3. Get Session Request and Success Payload

`getSession(token)` MUST accept a request shape containing a single token value:

```json
{
  "token": "mock-session-token"
}
```

The `token` field MUST be a required non-empty string.

When the token is valid, `getSession(token)` MUST return the same session payload shape used by login success:

```json
{
  "session": {
    "token": "mock-session-token",
    "user": {
      "id": "user-employee",
      "name": "内部员工",
      "role": "employee"
    }
  }
}
```

### 4. Get Session Invalid-Session Error Payload

When `getSession(token)` cannot resolve a valid session, it MUST fail with `INVALID_SESSION` and return an error payload with this shape:

```json
{
  "error": {
    "code": "INVALID_SESSION",
    "message": "登录状态已失效，请重新登录"
  }
}
```

### 5. Logout Request and Success Payload

`logout()` MUST accept no request body.

When logout succeeds, it MUST return:

```json
{
  "success": true
}
```

### 6. Error Object Shape and Codes

All authentication failures MUST use the same error object envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "账号或密码错误"
  }
}
```

The `error` object MUST contain:

- `code`: a required string
- `message`: a required string suitable for direct display to the user

This spec MUST support at least these error codes:

- `VALIDATION_ERROR`
- `USER_NOT_FOUND`
- `INVALID_CREDENTIALS`
- `INVALID_SESSION`

