# Quick Start Guide - React Frontend

## Prerequisites

- Node.js 14+ installed
- npm or yarn
- Backend API running on http://localhost:8080

## Installation Steps

### 1. Install Dependencies

```bash
cd travel-reimbursement-frontend
npm install
```

### 2. Start Development Server

```bash
npm start
```

The app will automatically open at `http://localhost:3000`

### 3. Login

Select a demo user role:
- **Employee** - For creating and managing claims
- **Manager** - For approving/rejecting claims
- **HR** - For payment processing

Click "Login" button

## Testing the Application

### As an Employee

1. **Create Claim**
   - Click "New Claim" in navbar
   - Enter description and amount
   - Click "Submit Claim"

2. **View My Claims**
   - Click "My Claims" in navbar
   - View all submitted claims with status
   - Click "View" to see details

### As a Manager

1. **View Pending Claims**
   - Click "Approvals" in navbar
   - See all pending claims from team

2. **Approve Claim**
   - Click "Approve" button
   - Add comments
   - Click "Approve"

3. **Reject Claim**
   - Click "Reject" button
   - Add rejection reason
   - Click "Reject"

### As HR

1. **View Approved Claims**
   - Click "Payments" in navbar
   - See claims ready for payment

2. **Mark as Paid**
   - Click "Mark Paid" button
   - Confirm in dialog
   - Claim marked as paid

## File Structure

```
src/
├── pages/
│   ├── LoginPage.js           # Login screen
│   ├── Dashboard.js           # Main dashboard
│   ├── CreateClaimPage.js     # Create claim form
│   ├── MyClaimsPage.js        # List claims
│   ├── ManagerApprovalPage.js # Manager approval
│   └── HRPaymentPage.js       # HR payments
├── components/
│   └── Navbar.js              # Navigation bar
├── services/
│   └── api.js                 # API calls
├── context/
│   └── AuthContext.js         # Auth state
├── App.js                     # Main app
└── index.js                   # Entry point
```

## API Configuration

Backend URL is configured in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

If your backend is on a different port, update this URL.

## Available Features

### User Roles

**Employee**
- ✓ Create claims
- ✓ Submit for approval
- ✓ View personal claims
- ✓ Track status

**Manager**
- ✓ View pending claims
- ✓ Approve claims
- ✓ Reject claims
- ✓ Add comments

**HR**
- ✓ View approved claims
- ✓ Mark as paid
- ✓ Payment processing

### Claim Statuses

- **DRAFT** - Initial state (not submitted)
- **SUBMITTED** - In system
- **PENDING_MANAGER_APPROVAL** - Waiting for manager
- **MANAGER_APPROVED** - Approved by manager
- **APPROVED** - Approved by HR
- **REJECTED** - Rejected at any stage
- **PAID** - Payment processed

## Troubleshooting

### Port 3000 Already in Use

```bash
# Use a different port
PORT=3001 npm start
```

### Backend Not Responding

**Error**: Connection refused to localhost:8080

**Solution**: Start the backend API:
```bash
cd travel-reimbursement-system
mvn spring-boot:run
```

### CORS Error

**Error**: Access to XMLHttpRequest blocked by CORS policy

This shouldn't happen as the backend allows all origins. If it does:
1. Check backend is running
2. Check base URL in `api.js`
3. Clear browser cache

### No Claims Appearing

1. Create a new claim as employee
2. Switch to manager role
3. Click "Approvals" to see pending claims

## Build for Production

```bash
npm run build
```

Creates optimized build in `build/` folder ready for deployment.

## Environment Variables

Create `.env` file:

```
REACT_APP_API_URL=http://localhost:8080/api
```

Then use in code:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL;
```

## Material UI Customization

Edit theme in `src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#003da5', // Change primary color
    },
    secondary: {
      main: '#ffc107', // Change secondary color
    },
  },
});
```

## Performance Tips

1. Use React DevTools browser extension
2. Check Network tab for slow API calls
3. Use browser Performance tab
4. Check for console errors

## Common Tasks

### Change API URL
- Edit `src/services/api.js`
- Update `API_BASE_URL`

### Modify Theme Colors
- Edit `src/App.js`
- Update palette in `createTheme()`

### Add New Page
1. Create file in `src/pages/`
2. Create a component
3. Add route in `src/App.js`
4. Add navigation link in `src/components/Navbar.js`

### Change Demo Users
- Edit `src/pages/LoginPage.js`
- Update `demoUsers` object

## Development Workflow

1. Make changes to source files
2. Save file (auto-refresh enabled)
3. Check browser for changes
4. For errors, check console (F12)
5. Test all functionality

## Need Help?

1. **Can't login**: Check demo user credentials in LoginPage.js
2. **Slow response**: Backend might be slow, check backend logs
3. **Styling issues**: Clear browser cache (Ctrl+Shift+Delete)
4. **State issues**: Check React DevTools for component state

## Next Steps

1. Customize company logo/colors
2. Add more form fields
3. Implement real authentication
4. Add email notifications
5. Deploy to production server

---

**Enjoy using the Travel Reimbursement System!** 🚀
