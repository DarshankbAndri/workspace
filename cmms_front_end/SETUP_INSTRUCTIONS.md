# Complete Setup Instructions - Full Stack Application

## 🎯 Project Overview

You now have a **complete full-stack travel reimbursement system**:

```
📦 Travel Reimbursement System
├── 📁 Backend (Spring Boot)
│   └── C:\workspace\travel-reimbursement-system
│       └── 26 Java classes + PostgreSQL
│
└── 📁 Frontend (React)
    └── C:\workspace\travel-reimbursement-frontend
        └── 15 components + Material UI
```

---

## 🔴 STEP 1: Setup Backend (If Not Already Done)

### 1.1 PostgreSQL Database

```sql
-- Create database
CREATE DATABASE travel_reimbursement;

-- Verify (optional)
\l  -- List all databases
```

### 1.2 Configure Backend

Navigate to backend folder:
```bash
cd C:\workspace\travel-reimbursement-system
```

Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/travel_reimbursement
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 1.3 Build & Run Backend

```bash
# Build project
mvn clean package

# Run application
mvn spring-boot:run
```

Expected output:
```
... Started TravelReimbursementSystemApplication ...
```

✅ Backend is ready at: `http://localhost:8080/api`

---

## 🔵 STEP 2: Setup Frontend

### 2.1 Navigate to Frontend

```bash
cd C:\workspace\travel-reimbursement-frontend
```

### 2.2 Install Dependencies

```bash
npm install
```

This installs:
- React 18
- Material UI
- React Router
- Axios
- And other dependencies

**Wait for completion** (2-5 minutes)

### 2.3 Start Frontend

```bash
npm start
```

Expected output:
```
Compiled successfully!

You can now view travel-reimbursement-frontend in the browser.
  Local:   http://localhost:3000
```

✅ Frontend is ready at: `http://localhost:3000`

---

## ✅ STEP 3: Test Complete Application

### 3.1 Verify Backend is Running

```bash
# In a terminal, test backend
curl http://localhost:8080/api/users

# Should return: []
```

### 3.2 Verify Frontend is Running

Open browser to: `http://localhost:3000`

You should see:
- ANDRITZ logo and branding
- Login form with 3 demo users
- Radio buttons for user selection

### 3.3 Test Complete Workflow

#### As Employee:
1. Select "Employee (Charlie Brown)"
2. Click "Login"
3. Click "New Claim"
4. Fill in:
   - Description: "Business trip to NYC"
   - Amount: "1500.00"
5. Click "Submit Claim"
6. Verify success message
7. Click "My Claims"
8. See claim with status "PENDING_MANAGER_APPROVAL"

#### As Manager (Switch User):
1. Click avatar → Logout
2. Select "Manager (Bob Smith)"
3. Click "Login"
4. Click "Approvals"
5. See employee's claim
6. Click "Approve"
7. Add comment: "Approved for travel"
8. Click "Approve"
9. See success message

#### As HR (Switch User):
1. Click avatar → Logout
2. Select "HR (Alice Johnson)"
3. Click "Login"
4. Click "Payments"
5. See claim with status "APPROVED"
6. Click "Mark Paid"
7. Confirm in dialog
8. See claim marked as "PAID"

✅ **Full workflow complete!**

---

## 📁 Project Structure

### Backend Location
```
C:\workspace\travel-reimbursement-system\
├── pom.xml                           # Maven configuration
├── README.md                         # Documentation
├── src/main/
│   ├── java/com/example/cmmsApplication/
│   │   ├── entity/                   # JPA entities (6 classes)
│   │   ├── dto/                      # Data Transfer Objects (4 classes)
│   │   ├── repository/               # Spring Data JPA (3 classes)
│   │   ├── service/                  # Business logic (2 classes)
│   │   ├── controller/               # REST endpoints (2 classes)
│   │   ├── exception/                # Exception handling (5 classes)
│   │   └── config/                   # Spring configuration (1 class)
│   └── resources/
│       └── application.properties   # Database config
└── target/                           # Compiled output
```

### Frontend Location
```
C:\workspace\travel-reimbursement-frontend\
├── package.json                      # Dependencies
├── public/
│   └── index.html                   # HTML entry point
└── src/
    ├── pages/                        # 6 page components
    ├── components/                   # Navbar component
    ├── services/                     # API calls
    ├── context/                      # Auth state
    ├── App.js                        # Main routing
    └── index.js                      # React entry
```

---

## 🔌 Backend Endpoints

All endpoints require JSON requests and return JSON responses.

### User Endpoints
```
GET    /api/users                 # List all users
GET    /api/users/{id}            # Get user by ID
POST   /api/users                 # Create user
PUT    /api/users/{id}            # Update user
```

### Claim Endpoints
```
POST   /api/claims?userId={id}           # Create claim
GET    /api/claims/my?userId={id}        # Get user's claims
GET    /api/claims/{id}                  # Get claim details
GET    /api/claims/pending?managerId={id} # Get pending claims
PUT    /api/claims/{id}/approve?managerId={id}         # Approve
PUT    /api/claims/{id}/reject?managerId={id}          # Reject
PUT    /api/claims/{id}/hr-approve?hrId={id}           # HR approve
PUT    /api/claims/{id}/pay?hrId={id}                   # Mark paid
```

---

## 🎨 Frontend Pages

| Page | Route | Role | Purpose |
|------|-------|------|---------|
| LoginPage | /login | All | Authentication |
| Dashboard | /dashboard | All | Main hub |
| CreateClaimPage | /create-claim | Employee | Create claims |
| MyClaimsPage | /my-claims | All | View claims |
| ManagerApprovalPage | /approvals | Manager | Approve claims |
| HRPaymentPage | /payments | HR | Process payments |

---

## 🚨 Troubleshooting

### Issue: Backend Won't Start

```
Error: Connection refused to localhost:5432
```

**Solution:**
1. Ensure PostgreSQL is running
2. Check database exists: `psql -U postgres -l`
3. Verify password in application.properties
4. Try: `psql -U postgres -d travel_reimbursement`

### Issue: Frontend Won't Connect to Backend

```
Error: (Failed to fetch) or Network Error
```

**Solution:**
1. Ensure backend is running: `mvn spring-boot:run`
2. Test endpoint: `curl http://localhost:8080/api/users`
3. Check frontend config in `src/services/api.js`
4. Check browser console (F12) for CORS errors

### Issue: Port Already in Use

```
Error: Address already in use
```

**Solution:**
```bash
# Find process using port
netstat -ano | findstr :3000    # Frontend
netstat -ano | findstr :8080    # Backend

# Kill process (Windows)
taskkill /PID <process-id> /F

# Or use different port
PORT=3001 npm start             # Frontend on 3001
```

### Issue: npm install Takes Too Long

```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Issue: Can't Login

**Check:**
1. Backend is running (8080)
2. Database has demo users
3. Check backend logs for errors
4. Verify demo user IDs (1, 2, 3)

---

## 👤 Demo Users

### User 1: HR
- **ID**: 1
- **Username**: alice
- **Email**: alice@example.com
- **Role**: HR
- **Department**: Human Resources

### User 2: Manager
- **ID**: 2
- **Username**: bob
- **Email**: bob@example.com
- **Role**: MANAGER
- **Department**: Engineering

### User 3: Employee
- **ID**: 3
- **Username**: charlie
- **Email**: charlie@example.com
- **Role**: EMPLOYEE
- **Department**: Engineering
- **Manager**: Bob (ID 2)

---

## 📊 Database Schema

### Users Table
- id, username, email, firstName, lastName, role, department, managerId, active, createdAt, updatedAt

### Claims Table
- id, userId, managerId, description, amount, status, rejectionReason, createdAt, submittedAt, approvedAt, paidAt, updatedAt

### Approvals Table
- id, claimId, approverId, role, status, comments, createdAt, approvedAt

---

## 🛠️ Development Commands

### Backend
```bash
cd travel-reimbursement-system

# Build
mvn clean package

# Run
mvn spring-boot:run

# Run tests
mvn test
```

### Frontend
```bash
cd travel-reimbursement-frontend

# Install
npm install

# Start
npm start

# Build
npm run build

# Test
npm test
```

---

## 🔒 Security Notes

### Current Implementation (Demo)
- ✅ Mock authentication
- ✅ Role-based UI navigation
- ✅ Protected routes
- ✅ No real passwords

### For Production, Add:
1. **JWT Authentication** - Secure tokens
2. **HTTPS** - Encrypted connections
3. **Password Hashing** - BCrypt (already configured)
4. **CORS** - Configure properly
5. **Rate Limiting** - Prevent abuse
6. **Input Validation** - Sanitize inputs
7. **Audit Logging** - Track changes

---

## 📈 Performance Tips

### Backend
```bash
# Build with optimizations
mvn clean package -DskipTests
```

### Frontend
```bash
# Production build
npm run build

# Analyze bundle
npm install --save-dev source-map-explorer
npx source-map-explorer 'build/static/js/*.js'
```

---

## 🚀 Deployment Options

### Backend (Spring Boot)
- **AWS EC2** - Run JAR on Linux
- **Docker** - Containerize with Docker
- **Heroku** - Deploy via Git
- **Azure** - App Service
- **Traditional Server** - Upload JAR and run

### Frontend (React)
- **AWS S3 + CloudFront** - Static hosting + CDN
- **Netlify** - Drag & drop deployment
- **Vercel** - Optimized for React
- **GitHub Pages** - Free hosting
- **Docker** - Containerize Nginx
- **AWS Amplify** - Full-stack hosting

---

## 📚 Documentation

### Backend Documentation
- [README.md](travel-reimbursement-system/README.md) - Full documentation
- [API_DOCUMENTATION.md](travel-reimbursement-system/API_DOCUMENTATION.md) - API reference
- [QUICKSTART.md](travel-reimbursement-system/QUICKSTART.md) - Quick start

### Frontend Documentation
- [README.md](travel-reimbursement-frontend/README.md) - Full documentation
- [QUICKSTART.md](travel-reimbursement-frontend/QUICKSTART.md) - Quick start
- [COMPONENT_DOCS.md](travel-reimbursement-frontend/COMPONENT_DOCS.md) - Components
- [DEPLOYMENT_GUIDE.md](travel-reimbursement-frontend/DEPLOYMENT_GUIDE.md) - Deploy

---

## ✨ Features Implemented

### Backend (26 Java Classes)
- ✅ User management with manager relationships
- ✅ Claim creation and submission
- ✅ Manager approval/rejection workflow
- ✅ HR payment processing
- ✅ Complete exception handling
- ✅ Input validation
- ✅ JPA/Hibernate ORM
- ✅ Spring Security framework

### Frontend (15 Components)
- ✅ Material UI design
- ✅ Role-based pages
- ✅ Form validation
- ✅ Real API integration
- ✅ Error handling
- ✅ Loading states
- ✅ Status indicators
- ✅ Responsive layout

---

## 🎓 Learning Path

1. **Understand Architecture**
   - Read backend README.md
   - Review entity relationships
   - Study REST API design

2. **Explore Backend Code**
   - Review entity classes
   - Study service layer logic
   - Check exception handling

3. **Explore Frontend Code**
   - Review page components
   - Study API service layer
   - Check state management

4. **Test Full Workflow**
   - Create as employee
   - Approve as manager
   - Pay as HR

5. **Customize Application**
   - Change colors/branding
   - Add new fields
   - Implement new features

---

## 🎯 Next Steps

1. **Verify Everything Works**
   ```bash
   # Terminal 1 - Backend
   cd travel-reimbursement-system
   mvn spring-boot:run
   
   # Terminal 2 - Frontend
   cd travel-reimbursement-frontend
   npm start
   ```

2. **Test Complete Workflow**
   - Login and create claim
   - Switch users and approve
   - Mark as paid

3. **Explore Code**
   - Review components
   - Study API integration
   - Check state management

4. **Customize**
   - Change colors
   - Add features
   - Improve UI

5. **Deploy** (when ready)
   - Follow DEPLOYMENT_GUIDE.md
   - Configure production URLs
   - Set up monitoring

---

## 📞 Support Resources

### If You Get Stuck:

1. **Backend Issues** → See [API_DOCUMENTATION.md](travel-reimbursement-system/API_DOCUMENTATION.md)
2. **Frontend Issues** → See [COMPONENT_DOCS.md](travel-reimbursement-frontend/COMPONENT_DOCS.md)
3. **Setup Issues** → Check [QUICKSTART.md](travel-reimbursement-frontend/QUICKSTART.md)
4. **Deployment** → Review [DEPLOYMENT_GUIDE.md](travel-reimbursement-frontend/DEPLOYMENT_GUIDE.md)
5. **Browser Console** → F12 → Press F12 to see errors
6. **Backend Logs** → Check terminal where mvn runs

---

## ✅ Verification Checklist

Before considering complete:

- [ ] PostgreSQL installed and running
- [ ] Backend builds without errors
- [ ] Backend server runs on port 8080
- [ ] Frontend installs without errors
- [ ] Frontend runs on port 3000
- [ ] Can login with all 3 demo users
- [ ] Can create claim as employee
- [ ] Can approve as manager
- [ ] Can mark paid as HR
- [ ] All navigation works
- [ ] Tables display correctly
- [ ] Forms validate properly
- [ ] Responsive on mobile view
- [ ] No console errors
- [ ] API calls succeed

---

## 🎉 Congratulations!

You now have a **complete, full-stack employee travel reimbursement system** with:

- ✅ Professional Spring Boot backend
- ✅ Modern React frontend
- ✅ Material UI design
- ✅ ANDRITZ company branding
- ✅ Complete workflow
- ✅ Full documentation

**Ready to use, customize, and deploy!** 🚀

---

**Setup Status**: ✅ Complete and Ready  
**Backend**: C:\workspace\travel-reimbursement-system  
**Frontend**: C:\workspace\travel-reimbursement-frontend  
**Last Updated**: April 21, 2026
