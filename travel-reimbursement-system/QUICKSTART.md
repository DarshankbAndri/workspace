# Quick Start Guide

## Prerequisites
- Java 17+
- PostgreSQL 12+
- Maven 3.6+
- Git (optional)

## Step 1: Set up PostgreSQL Database

### Windows
```bash
# Using PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE travel_reimbursement;

# Create user (if needed)
CREATE USER travel_user WITH PASSWORD 'travel_password';
ALTER ROLE travel_user SUPERUSER;
```

### MacOS / Linux
```bash
# Create database
createdb travel_reimbursement

# Or using psql
psql -U postgres -c "CREATE DATABASE travel_reimbursement;"
```

## Step 2: Configure Application

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/travel_reimbursement
spring.datasource.username=postgres
spring.datasource.password=your_password
```

Replace with your PostgreSQL credentials.

## Step 3: Build Project

```bash
# Navigate to project directory
cd travel-reimbursement-system

# Build with Maven
mvn clean package
```

## Step 4: Run Application

```bash
# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Using JAR file
java -jar target/travel-reimbursement-system-1.0.0.jar
```

## Step 5: Verify Application is Running

```bash
# Should return empty array (no users yet)
curl http://localhost:8080/api/users
```

Expected response:
```json
[]
```

## Step 6: Create Sample Data

### Option 1: Automatic (using data.sql)
- Enable in `application.properties`:
```properties
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always
```

### Option 2: Manual - Create Users

```bash
# Create HR User (Alice)
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "firstName": "Alice",
    "lastName": "Johnson",
    "role": "HR",
    "department": "HR"
  }'

# Create Manager User (Bob)
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@example.com",
    "firstName": "Bob",
    "lastName": "Smith",
    "role": "MANAGER",
    "department": "Engineering"
  }'

# Create Employee User (Charlie)
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "charlie",
    "email": "charlie@example.com",
    "firstName": "Charlie",
    "lastName": "Brown",
    "role": "EMPLOYEE",
    "department": "Engineering",
    "managerId": 2
  }'
```

## Step 7: Test the Workflow

### 1. Create a Claim
```bash
curl -X POST "http://localhost:8080/api/claims?userId=3" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Business trip to NYC",
    "amount": 1500.00
  }'
```

Save the returned claim ID (e.g., 1)

### 2. Submit the Claim
```bash
curl -X POST "http://localhost:8080/api/claims/1/submit?userId=3" \
  -H "Content-Type: application/json"
```

### 3. Manager Approves
```bash
curl -X PUT "http://localhost:8080/api/claims/1/approve?managerId=2" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "Looks good, approved!"
  }'
```

### 4. HR Approves
```bash
curl -X PUT "http://localhost:8080/api/claims/1/hr-approve?hrId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "Processing payment"
  }'
```

### 5. Mark as Paid
```bash
curl -X PUT "http://localhost:8080/api/claims/1/pay?hrId=1" \
  -H "Content-Type: application/json"
```

### 6. View Claim Status
```bash
curl http://localhost:8080/api/claims/1
```

Should show:
```json
{
  "id": 1,
  "status": "PAID",
  "paidAt": "2024-01-15T15:30:00",
  ...
}
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in application.properties
server.port=8081
```

### Database Connection Error
```
Error: Connection to localhost:5432 refused
```
Check:
1. PostgreSQL is running: `psql -U postgres`
2. Database exists: `\l` in psql
3. Credentials are correct in `application.properties`

### Maven Build Fails
```bash
# Clear Maven cache
rm -rf ~/.m2/repository

# Try building again
mvn clean package
```

### Java 17 Not Found
```bash
# Check Java version
java -version

# Install Java 17 if needed
# Download from: https://www.oracle.com/java/technologies/downloads/#java17
```

## Common Issues

| Issue | Solution |
|-------|----------|
| 404 Not Found on any endpoint | Check if server is running on correct port |
| 400 Bad Request | Check JSON format and required fields |
| 403 Forbidden | Check authorization (managerId, role) |
| 500 Internal Server Error | Check server logs |

## IDE Setup (IntelliJ IDEA)

1. Open project: File → Open → Select project folder
2. Maven will auto-download dependencies
3. Run: Right-click `TravelReimbursementSystemApplication` → Run
4. Application starts on port 8080

## IDE Setup (VS Code)

1. Open project folder
2. Install "Extension Pack for Java"
3. Open terminal: Ctrl + `
4. Run: `mvn spring-boot:run`

## Next Steps

- Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference
- Read [README.md](README.md) for architecture details
- Implement JWT authentication for production
- Add more comprehensive error handling
- Implement notification system
- Add file upload for receipts

## Support

For issues:
1. Check logs: `tail -f logs/application.log`
2. Review error messages in API responses
3. Verify database connectivity
4. Check Java version compatibility
