# Change Spec: Auth Session

This change introduces the mock auth session contract for the shell slice.

## Normative Requirements

### Login Request

`login(identifier, password)` MUST accept a JSON request body with exactly these fields:

```json
{
  "identifier": "employee",
  "password": "glintrise-123"
}
```

The implementation MUST accept only these identities:

| identifier | password | role |
| --- | --- | --- |
| `employee` | `glintrise-123` | `employee` |
| `director` | `glintrise-123` | `director` |
| `developer` | `glintrise-123` | `developer` |

Missing or non-string fields MUST fail with `VALIDATION_ERROR`.
Unknown identifiers MUST fail with `USER_NOT_FOUND`.
Known identifiers with a mismatched password MUST fail with `INVALID_CREDENTIALS`.

### Login Success Payload

Successful login MUST return:

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

### Get Session

`getSession(token)` MUST accept:

```json
{
  "token": "mock-session-token"
}
```

When the token is valid, `getSession(token)` MUST return the same `session` payload used by login success.

When the token is invalid, `getSession(token)` MUST return:

```json
{
  "error": {
    "code": "INVALID_SESSION",
    "message": "登录状态已失效，请重新登录"
  }
}
```

### Logout

`logout()` MUST accept no request body.

When logout succeeds, it MUST return:

```json
{
  "success": true
}
```

### Error Envelope

All failures MUST use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "账号或密码错误"
  }
}
```

The supported error codes are:

- `VALIDATION_ERROR`
- `USER_NOT_FOUND`
- `INVALID_CREDENTIALS`
- `INVALID_SESSION`

