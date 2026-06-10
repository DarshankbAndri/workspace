# Frontend Component Documentation

## Page Components

### LoginPage (`src/pages/LoginPage.js`)

Simple authentication interface with demo user selection.

**Features:**
- Radio button selection for user roles
- Pre-filled demo user credentials
- Form validation
- Company branding

**Props:** None (uses context)

**State:**
- `formData` - User input (username, email, firstName, lastName, role, userId)
- `error` - Error message display

**Usage:**
```jsx
<Route path="/login" element={<LoginPage />} />
```

---

### Dashboard (`src/pages/Dashboard.js`)

Main dashboard after login with quick action cards.

**Features:**
- Welcome message
- Stats cards (total claims, pending, approved, amount)
- Role-based quick action cards
- Information section

**Props:** None (uses context for user role)

**Conditional Features:**
- Create Claim - Employee only
- My Claims - Employee & Manager only
- Pending Approvals - Manager only
- Process Payments - HR only

**Usage:**
```jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

### CreateClaimPage (`src/pages/CreateClaimPage.js`)

Form to create and submit new claims.

**Features:**
- Description text area
- Amount input field
- Form validation
- Loading state
- Success message
- Auto-redirect on submit

**Props:** None (uses API and context)

**State:**
- `formData` - Form inputs (description, amount)
- `loading` - Submit state
- `success` - Success message
- `error` - Error message

**Validation:**
- Description required and non-empty
- Amount required and > 0

**Usage:**
```jsx
<Route path="/create-claim" element={
  <ProtectedRoute>
    <CreateClaimPage />
  </ProtectedRoute>
} />
```

---

### MyClaimsPage (`src/pages/MyClaimsPage.js`)

Table view of user's claims with details modal.

**Features:**
- Responsive table
- Status chips with colors
- View details button
- Details modal with full information
- Timestamps for all statuses

**Props:** None (uses API and context)

**State:**
- `claims` - Array of claim objects
- `loading` - Data fetch state
- `selectedClaim` - Currently viewed claim
- `openDialog` - Modal visibility

**Table Columns:**
- ID
- Description
- Amount
- Status
- Created Date
- Action button

**Modal Shows:**
- Full description
- Amount
- Status
- Rejection reason (if applicable)
- Created, submitted, approved, paid dates

**Usage:**
```jsx
<Route path="/my-claims" element={
  <ProtectedRoute>
    <MyClaimsPage />
  </ProtectedRoute>
} />
```

---

### ManagerApprovalPage (`src/pages/ManagerApprovalPage.js`)

Claims awaiting manager approval with approval workflow.

**Features:**
- Pending claims table
- Approve button with comments dialog
- Reject button with reason dialog
- Real-time status updates
- Employee information display

**Props:** None (uses API and context)

**State:**
- `claims` - Pending claims array
- `loading` - Data fetch state
- `selectedClaim` - Claim being reviewed
- `openDialog` - Modal visibility
- `dialogAction` - 'approve' or 'reject'
- `comments` - Manager input
- `submitting` - Action submit state

**Approve Flow:**
1. Click "Approve" button
2. Modal opens
3. Enter approval comments (required)
4. Click "Approve" to submit
5. Page refreshes and shows success

**Reject Flow:**
1. Click "Reject" button
2. Modal opens
3. Enter rejection reason (required)
4. Click "Reject" to submit
5. Page refreshes and shows success

**Usage:**
```jsx
<Route path="/approvals" element={
  <ProtectedRoute>
    <ManagerApprovalPage />
  </ProtectedRoute>
} />
```

---

### HRPaymentPage (`src/pages/HRPaymentPage.js`)

Payment processing for approved claims.

**Features:**
- Stats cards (ready to pay, total amount, already paid)
- Approved claims table
- Mark as paid button
- Payment confirmation modal
- Status filtering

**Props:** None (uses API and context)

**State:**
- `claims` - Claims array
- `loading` - Data fetch state
- `selectedClaim` - Claim being paid
- `openDialog` - Modal visibility
- `submitting` - Payment submit state

**Stats Displayed:**
- Count of ready-for-payment claims
- Total amount to be paid
- Count of already-paid claims

**Payment Flow:**
1. Click "Mark Paid" button
2. Confirmation modal appears
3. Verify claim details
4. Click "Mark as Paid"
5. Claim status updated to PAID

**Usage:**
```jsx
<Route path="/payments" element={
  <ProtectedRoute>
    <HRPaymentPage />
  </ProtectedRoute>
} />
```

---

## Components

### Navbar (`src/components/Navbar.js`)

Top navigation bar with company branding and user menu.

**Features:**
- ANDRITZ company logo (yellow box with "A")
- Company name
- Dynamic navigation links based on user role
- User profile avatar dropdown
- Logout functionality
- Sticky positioning

**Nav Links:**
- Dashboard (all users)
- New Claim (all users)
- My Claims (all users)
- Approvals (Manager only)
- Payments (HR only)

**User Menu Options:**
- Display email (disabled)
- Logout button

**Props:**
```jsx
// Imported from context
const { user, logout } = useAuth();
```

**Usage:**
```jsx
import Navbar from './components/Navbar';

// In App.js
{isAuthenticated && <Navbar />}
```

---

## Context

### AuthContext (`src/context/AuthContext.js`)

Global authentication state management.

**Provided Values:**
```javascript
{
  isAuthenticated: boolean,
  user: {
    userId: number,
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN',
    department: string
  },
  login: (userData) => void,
  logout: () => void,
  loading: boolean
}
```

**Usage:**
```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  return (
    <>
      {isAuthenticated && <p>Hello {user.firstName}</p>}
    </>
  );
}
```

**Features:**
- Automatic user restoration from localStorage
- Login function saves user to localStorage
- Logout function clears user data
- Loading state for initialization

---

## Services

### API Service (`src/services/api.js`)

Axios instance and API functions.

**Configured:**
- Base URL: `http://localhost:8080/api`
- Timeout: 5000ms
- Content-Type: application/json

**User Functions:**
```javascript
getUserById(userId)
createUser(userData)
```

**Claim Functions:**
```javascript
createClaim(userId, claimData)
submitClaim(claimId, userId)
getMyClaimsById(userId)
getClaimById(claimId)
getPendingClaimsByManager(managerId)  // Note: used for all pending claims
approveClaim(claimId, managerId, approvalData)
rejectClaim(claimId, managerId, approvalData)
approveClaimByHR(claimId, hrId, approvalData)
markClaimAsPaid(claimId, hrId)
```

**Usage:**
```jsx
import { createClaim, getMyClaimsById } from '../services/api';

// Create claim
const response = await createClaim(userId, {
  description: 'Business trip',
  amount: 1500.00
});

// Get user claims
const claims = await getMyClaimsById(userId);
```

---

## Common Patterns

### Protected Route

```jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### API Call with Error Handling

```jsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [data, setData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await getMyClaimsById(userId);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [userId]);
```

### Form Validation

```jsx
const validateForm = () => {
  if (!formData.description.trim()) {
    setError('Description is required');
    return false;
  }
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    setError('Amount must be greater than 0');
    return false;
  }
  return true;
};
```

### Status Color Mapping

```jsx
const getStatusColor = (status) => {
  const statusColors = {
    DRAFT: 'default',
    PENDING_MANAGER_APPROVAL: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    PAID: 'success',
  };
  return statusColors[status] || 'default';
};
```

---

## Material UI Components Used

- `AppBar` - Top navigation
- `Toolbar` - Container in AppBar
- `TextField` - Input fields
- `Button` - Action buttons
- `Table/TableContainer/TableHead/TableBody/TableCell/TableRow` - Data table
- `Chip` - Status badges
- `Dialog/DialogTitle/DialogContent/DialogActions` - Modals
- `Alert` - Error/success messages
- `CircularProgress` - Loading spinner
- `Paper` - Card containers
- `Box` - Flex layout container
- `Container` - Page width limiter
- `Grid` - Grid layout
- `Card/CardContent/CardActions` - Card components
- `Avatar` - User avatar
- `Menu/MenuItem` - Dropdown menus
- `Divider` - Visual separator
- `Typography` - Text styling

---

## Responsive Design

All pages use Material UI's responsive grid system:

```jsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3+ columns
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Content */}
  </Grid>
</Grid>
```

Breakpoints:
- `xs` - Extra small (0px) - Mobile
- `sm` - Small (600px) - Tablet portrait
- `md` - Medium (960px) - Tablet landscape
- `lg` - Large (1280px) - Desktop
- `xl` - Extra large (1920px) - Large desktop

---

## Color Scheme

- **Primary**: #003da5 (ANDRITZ Blue)
- **Secondary**: #ffc107 (ANDRITZ Yellow)
- **Success**: #4caf50 (Green)
- **Error**: #f44336 (Red)
- **Warning**: #ff9800 (Orange)
- **Info**: #2196f3 (Blue)

---

**Last Updated**: April 21, 2026
