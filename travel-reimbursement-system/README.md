# Travel Reimbursement System

A comprehensive Spring Boot application for managing employee travel reimbursement claims with role-based approval workflows.

## Project Structure

```
travel-reimbursement-system/
├── src/main/
│   ├── java/com/example/travelreimbursement/
│   │   ├── entity/              # JPA entities (User, Claim, Approval)
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── service/             # Business logic (UserService, ClaimService)
│   │   ├── controller/          # REST API controllers
│   │   ├── exception/           # Exception handling
│   │   ├── config/              # Spring configurations
│   │   └── TravelReimbursementSystemApplication.java  # Main entry point
│   └── resources/
│       ├── application.properties  # Configuration
│       └── data.sql              # Sample data (optional)
├── pom.xml                       # Maven configuration
└── README.md                     # This file
```

## Features

### Employee Features
- Create and submit travel reimbursement claims
- View personal claim history and status
- Track claim approvals

### Manager Features
- View pending claims from team members
- Approve or reject claims with comments
- Review claim history

### HR Features
- Approve manager-approved claims
- Mark approved claims as paid
- Generate reports (future feature)

## Architecture

- **Layered Architecture**: Controller → Service → Repository → Entity
- **JPA/Hibernate**: ORM for database operations
- **Spring Security**: Basic security setup
- **RESTful APIs**: Standard HTTP methods and status codes
- **Exception Handling**: Centralized error handling with custom exceptions
- **Validation**: Input validation using Jakarta Validation

## Technology Stack

- **Java**: 17
- **Spring Boot**: 3.1.0
- **Spring Data JPA**: Database access
- **Spring Security**: Authentication & Authorization
- **PostgreSQL**: Database
- **Lombok**: Reduce boilerplate code
- **Maven**: Build tool

## Setup Instructions

### Prerequisites

- Java 17 or higher
- PostgreSQL 12 or higher
- Maven 3.6 or higher

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE travel_reimbursement;
```

2. Update database credentials in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/travel_reimbursement
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### Build & Run

1. Clone/download the project

2. Build the project:
```bash
mvn clean package
```

3. Run the application:
```bash
mvn spring-boot:run
```

4. Access the API at: `http://localhost:8080/api`

## API Endpoints

### User Management
```
GET    /api/users                      # Get all users
GET    /api/users/{id}                 # Get user by ID
GET    /api/users/username/{username}  # Get user by username
POST   /api/users                      # Create new user
PUT    /api/users/{id}                 # Update user
```

### Claims Management
```
POST   /api/claims                     # Create claim (draft)
POST   /api/claims/{id}/submit         # Submit claim for manager approval
GET    /api/claims/my?userId={id}      # Get my claims
GET    /api/claims/{id}                # Get claim details
GET    /api/claims/pending?managerId={id}  # Get pending claims
PUT    /api/claims/{id}/approve        # Approve claim (Manager)
PUT    /api/claims/{id}/reject         # Reject claim (Manager)
PUT    /api/claims/{id}/hr-approve     # Approve claim (HR)
PUT    /api/claims/{id}/pay            # Mark as paid (HR)
```

## Data Models

### User Entity
- id (Long)
- username (String, unique)
- email (String, unique)
- firstName (String)
- lastName (String)
- role (UserRole: EMPLOYEE, MANAGER, HR, ADMIN)
- department (String)
- manager (User) - Self-referencing relationship
- createdAt (LocalDateTime)
- updatedAt (LocalDateTime)
- active (Boolean)

### Claim Entity
- id (Long)
- user (User) - Employee filing the claim
- manager (User) - Manager for approval
- description (String)
- amount (BigDecimal)
- status (ClaimStatus: DRAFT, SUBMITTED, PENDING_MANAGER_APPROVAL, MANAGER_APPROVED, PENDING_HR_APPROVAL, APPROVED, REJECTED, PAID)
- rejectionReason (String, optional)
- createdAt (LocalDateTime)
- submittedAt (LocalDateTime, optional)
- approvedAt (LocalDateTime, optional)
- paidAt (LocalDateTime, optional)
- updatedAt (LocalDateTime)

### Approval Entity
- id (Long)
- claim (Claim)
- approver (User)
- role (UserRole: MANAGER, HR)
- status (ApprovalStatus: PENDING, APPROVED, REJECTED)
- comments (String)
- createdAt (LocalDateTime)
- approvedAt (LocalDateTime, optional)

## Claim Approval Workflow

```
DRAFT
  ↓
SUBMITTED → PENDING_MANAGER_APPROVAL
  ↓
MANAGER_APPROVED → PENDING_HR_APPROVAL
  ↓
APPROVED → PAID
  ↓
(or REJECTED at manager stage)
```

## Exception Handling

The application includes comprehensive exception handling:

- **ResourceNotFoundException**: Resource not found (404)
- **UnauthorizedAccessException**: Access denied (403)
- **InvalidOperationException**: Invalid operation (400)
- **MethodArgumentNotValidException**: Validation errors (400)

All exceptions are handled by `GlobalExceptionHandler` which returns structured JSON responses.

## Sample API Requests

### Create User
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE",
    "department": "Engineering"
  }'
```

### Create Claim
```bash
curl -X POST "http://localhost:8080/api/claims?userId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Business trip to New York",
    "amount": 1500.00
  }'
```

### Submit Claim
```bash
curl -X POST "http://localhost:8080/api/claims/1/submit?userId=1" \
  -H "Content-Type: application/json"
```

### Approve Claim
```bash
curl -X PUT "http://localhost:8080/api/claims/1/approve?managerId=2" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "Approved for reimbursement"
  }'
```

## Validation Rules

### Claims
- Description: Required, non-blank
- Amount: Required, must be positive
- Status transitions are validated

### Users
- Username: Unique, required
- Email: Unique, required
- Role: Required (EMPLOYEE, MANAGER, HR, ADMIN)

## Security Considerations

⚠️ **Current Implementation**: The security is configured with basic setup. For production:

1. Implement JWT-based authentication
2. Add role-based access control (RBAC)
3. Implement user authentication endpoints
4. Add HTTPS/SSL configuration
5. Implement rate limiting
6. Add audit logging

## Future Enhancements

- [ ] JWT authentication
- [ ] Advanced reporting and analytics
- [ ] Email notifications
- [ ] File upload for receipts
- [ ] Multi-level approval workflows
- [ ] Budget tracking per department
- [ ] Claim templates
- [ ] Mobile app

## Testing

Run unit and integration tests:
```bash
mvn test
```

## License

This project is provided as-is for educational purposes.

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.
