# API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
Currently, the API has basic security setup. For production, JWT authentication should be implemented.

---

## User Management API

### 1. Get All Users
**GET** `/users`

**Response:**
```json
[
  {
    "id": 1,
    "username": "alice.johnson",
    "email": "alice@example.com",
    "firstName": "Alice",
    "lastName": "Johnson",
    "role": "HR",
    "department": "Human Resources",
    "managerId": null,
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-01-15T10:00:00",
    "active": true
  }
]
```

### 2. Get User by ID
**GET** `/users/{id}`

**Path Parameters:**
- `id` (Long): User ID

**Response:** Single User object (same structure as above)

**Error Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: 1",
  "path": "/api/users/1"
}
```

### 3. Get User by Username
**GET** `/users/username/{username}`

**Path Parameters:**
- `username` (String): Username

**Response:** Single User object

### 4. Create User
**POST** `/users`

**Request Body:**
```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE",
  "department": "Engineering",
  "managerId": 2
}
```

**Validation Rules:**
- `username`: Required, must be unique
- `email`: Required, must be unique, valid email format
- `firstName`: Required
- `lastName`: Required
- `role`: Required (EMPLOYEE, MANAGER, HR, ADMIN)
- `department`: Required
- `managerId`: Optional, must be valid user ID

**Response:**
```json
{
  "id": 7,
  "username": "john.doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE",
  "department": "Engineering",
  "managerId": 2,
  "createdAt": "2024-01-15T11:00:00",
  "updatedAt": "2024-01-15T11:00:00",
  "active": true
}
```

**Status Code:** 201 Created

### 5. Update User
**PUT** `/users/{id}`

**Path Parameters:**
- `id` (Long): User ID

**Request Body:**
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "email": "jonathan@example.com",
  "department": "Sales",
  "managerId": 3,
  "active": true
}
```

**Response:** Updated User object

---

## Claims Management API

### 1. Create Claim (Draft)
**POST** `/claims`

**Query Parameters:**
- `userId` (Long): ID of employee creating claim

**Request Body:**
```json
{
  "description": "Business trip to New York for client meeting",
  "amount": 1500.00
}
```

**Validation Rules:**
- `description`: Required, non-blank
- `amount`: Required, must be greater than 0

**Response:**
```json
{
  "id": 5,
  "description": "Business trip to New York for client meeting",
  "amount": 1500.00,
  "status": "DRAFT",
  "rejectionReason": null,
  "userId": 3,
  "managerId": 2,
  "createdAt": "2024-01-15T12:00:00",
  "submittedAt": null,
  "approvedAt": null,
  "paidAt": null,
  "updatedAt": "2024-01-15T12:00:00"
}
```

**Status Code:** 201 Created

### 2. Submit Claim for Approval
**POST** `/claims/{id}/submit`

**Path Parameters:**
- `id` (Long): Claim ID

**Query Parameters:**
- `userId` (Long): ID of claim owner (for authorization)

**Response:**
```json
{
  "id": 5,
  "status": "PENDING_MANAGER_APPROVAL",
  "submittedAt": "2024-01-15T12:30:00"
  // ... other fields
}
```

**Error Cases:**
- Claim not found (404)
- User not authorized (403)
- Claim not in DRAFT status (400)

### 3. Get My Claims
**GET** `/claims/my`

**Query Parameters:**
- `userId` (Long): User ID

**Response:**
```json
[
  {
    "id": 5,
    "description": "Business trip to New York",
    "amount": 1500.00,
    "status": "PENDING_MANAGER_APPROVAL",
    // ... other fields
  },
  {
    "id": 6,
    "description": "Conference attendance",
    "amount": 2500.00,
    "status": "APPROVED",
    // ... other fields
  }
]
```

### 4. Get Pending Claims (Manager)
**GET** `/claims/pending`

**Query Parameters:**
- `managerId` (Long): Manager ID

**Response:** List of pending claims assigned to manager

**Authorization:** Only managers can access this endpoint

### 5. Get Claim Details
**GET** `/claims/{id}`

**Path Parameters:**
- `id` (Long): Claim ID

**Response:** Single Claim object with all details

### 6. Approve Claim (Manager)
**PUT** `/claims/{id}/approve`

**Path Parameters:**
- `id` (Long): Claim ID

**Query Parameters:**
- `managerId` (Long): ID of approving manager

**Request Body:**
```json
{
  "comments": "Approved for reimbursement. Amount looks reasonable."
}
```

**Validation:**
- `comments`: Required, non-blank

**Response:**
```json
{
  "id": 5,
  "status": "MANAGER_APPROVED",
  "approvedAt": "2024-01-15T13:00:00",
  // ... other fields
}
```

**Authorization Rules:**
- Only managers can approve
- Manager must be assigned to this claim
- Claim must be in PENDING_MANAGER_APPROVAL status

### 7. Reject Claim (Manager)
**PUT** `/claims/{id}/reject`

**Path Parameters:**
- `id` (Long): Claim ID

**Query Parameters:**
- `managerId` (Long): ID of rejecting manager

**Request Body:**
```json
{
  "comments": "Cannot approve. Missing required documentation."
}
```

**Response:**
```json
{
  "id": 5,
  "status": "REJECTED",
  "rejectionReason": "Cannot approve. Missing required documentation.",
  // ... other fields
}
```

### 8. Approve Claim (HR)
**PUT** `/claims/{id}/hr-approve`

**Path Parameters:**
- `id` (Long): Claim ID

**Query Parameters:**
- `hrId` (Long): ID of HR approver

**Request Body:**
```json
{
  "comments": "HR approved for payment processing"
}
```

**Authorization:**
- Only HR role can approve
- Claim must be in MANAGER_APPROVED status

**Response:**
```json
{
  "id": 5,
  "status": "APPROVED",
  "approvedAt": "2024-01-15T14:00:00",
  // ... other fields
}
```

### 9. Mark Claim as Paid (HR)
**PUT** `/claims/{id}/pay`

**Path Parameters:**
- `id` (Long): Claim ID

**Query Parameters:**
- `hrId` (Long): ID of HR processing payment

**Response:**
```json
{
  "id": 5,
  "status": "PAID",
  "paidAt": "2024-01-15T15:00:00",
  // ... other fields
}
```

**Authorization:**
- Only HR role can mark as paid
- Claim must be in APPROVED status

---

## Error Response Format

All errors follow this standard format:

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Description is required",
  "path": "/api/claims"
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input/validation error |
| 403 | Forbidden - Access denied/Authorization failed |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

### Common Error Messages

| Error | Status | Cause |
|-------|--------|-------|
| Resource not found | 404 | Invalid ID provided |
| Unauthorized access | 403 | User lacks permission or is not the owner |
| Invalid operation | 400 | Operation not allowed in current state |
| Username already exists | 400 | Duplicate username |
| Email already exists | 400 | Duplicate email |
| Validation failed | 400 | Invalid input data |

---

## Claim Status Workflow

```
DRAFT (Initial state)
  ↓ (User submits)
PENDING_MANAGER_APPROVAL (Waiting for manager decision)
  ├─ MANAGER_APPROVED (Manager approved)
  │   ↓ (Goes to HR)
  │   APPROVED (HR approved)
  │     ↓ (HR processes payment)
  │     PAID (Payment complete)
  │
  └─ REJECTED (Manager rejected)
```

---

## Rate Limiting

Currently not implemented. For production, implement appropriate rate limiting.

---

## Best Practices

1. **Always include `userId` or managerId** in query parameters for authorization
2. **Handle all error responses** - Check HTTP status codes
3. **Timestamps** - All timestamps are in UTC ISO 8601 format
4. **BigDecimal** - Amounts are represented as numbers with 2 decimal places
5. **Null fields** - Some fields may be null depending on claim status; handle gracefully
