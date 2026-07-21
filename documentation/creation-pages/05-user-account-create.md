> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 5. Standalone User Account Creation

**Navigation/Route:** `/create-user` (protected by `USER_ROLE_ASSIGN`)  
**Purpose:** Creates an application user through the HR-oriented user service. This is separate from the richer employee form and can produce identity duplication if governance is unclear.

| Field | Frontend/API property | UI/Required | Purpose/example | Validation/source |
|---|---|---|---|---|
| Username | `username` | Text; mandatory | Login ID, `plant.admin2`. | UI rejects blank; backend uniqueness. |
| Email | `email` | Email; mandatory | Account contact/login recovery identity. | UI required/email control; backend email/uniqueness. |
| First Name | `firstName` | Text; mandatory | `Meera` | UI required. |
| Last Name | `lastName` | Text; mandatory | `Singh` | UI required. |
| Department | `department` | Text; mandatory | `Plant Administration` | UI required. |
| Role | `role` | Dropdown; mandatory | Base role assigned to account. | Static page options; default must be reviewed against backend accepted values. |
| Manager ID | `managerId` | Number; optional | Links a manager by numeric user/employee identifier. | No dropdown; incorrect IDs may fail backend validation. |

The page first resolves the current HR user context and calls the user creation service, ultimately using the mapped user API (`POST /api/users`). Success shows a temporary-password message returned by the server and redirects to the first permitted route. Never expose that temporary password in documentation or screenshots.

**Implementation issue:** This page uses direct MUI fields rather than project common form components and overlaps employee login creation.

