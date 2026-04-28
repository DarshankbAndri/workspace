# Travel Reimbursement System - React Frontend

A professional React application for managing employee travel reimbursement claims built with Material UI, featuring role-based access control for Employees, Managers, and HR personnel.

## Features

### Employee Features
✅ Create new travel reimbursement claims  
✅ Submit claims for manager approval  
✅ Track claim status in real-time  
✅ View claim history and details  

### Manager Features
✅ View pending claims from team members  
✅ Approve or reject claims with comments  
✅ Provide feedback on claim decisions  

### HR Features
✅ View approved claims ready for payment  
✅ Mark approved claims as paid  
✅ Process bulk payments  

### Common Features
✅ Professional ANDRITZ branding  
✅ Responsive Material UI design  
✅ Real-time status updates  
✅ Form validation  
✅ Error handling  
✅ Role-based navigation  

## Tech Stack

- **React 18.2** - UI library with functional components
- **Material UI (MUI)** - Professional component library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Emotion** - CSS-in-JS styling

## Project Structure

```
src/
├── pages/
│   ├── LoginPage.js           # Authentication with demo users
│   ├── Dashboard.js           # Main dashboard with quick actions
│   ├── CreateClaimPage.js     # Form to create new claims
│   ├── MyClaimsPage.js        # List and view personal claims
│   ├── ManagerApprovalPage.js # Manager approval workflow
│   └── HRPaymentPage.js       # HR payment processing
├── components/
│   └── Navbar.js              # Top navigation with branding
├── services/
│   └── api.js                 # API calls with Axios
├── context/
│   └── AuthContext.js         # Authentication state management
├── App.js                     # Main routing and theme setup
└── index.js                   # React DOM render
```

## Installation & Setup

### Prerequisites
- Node.js 14+
- npm or yarn
- Backend API running on http://localhost:8080

### Installation

```bash
cd travel-reimbursement-frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## Configuration

### API Base URL
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### Theme Customization
Edit `src/App.js` theme configuration:
```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#003da5', // ANDRITZ Blue
    },
    secondary: {
      main: '#ffc107', // ANDRITZ Yellow
    },
  },
});
```

## Demo Users

Login with these pre-configured demo accounts:

### Employee
- **Username**: charlie
- **Email**: charlie@example.com
- **Role**: EMPLOYEE
- **Department**: Engineering

### Manager
- **Username**: bob
- **Email**: bob@example.com
- **Role**: MANAGER
- **Department**: Engineering

### HR
- **Username**: alice
- **Email**: alice@example.com
- **Role**: HR
- **Department**: Human Resources

## API Endpoints

### User
- `GET /users/{id}` - Get user details
- `POST /users` - Create new user

### Claims
- `POST /claims?userId={id}` - Create claim
- `POST /claims/{id}/submit?userId={id}` - Submit claim
- `GET /claims/my?userId={id}` - Get user's claims
- `GET /claims/{id}` - Get claim details
- `GET /claims/pending?managerId={id}` - Get pending claims (Manager)

### Approvals
- `PUT /claims/{id}/approve?managerId={id}` - Manager approve
- `PUT /claims/{id}/reject?managerId={id}` - Manager reject
- `PUT /claims/{id}/hr-approve?hrId={id}` - HR approve
- `PUT /claims/{id}/pay?hrId={id}` - Mark as paid

## Component Documentation

### Pages

#### LoginPage
- Simple mock authentication with radio buttons for user selection
- Pre-filled demo user credentials
- Form validation

#### Dashboard
- Welcome greeting with user's name
- Stats cards showing claim summary
- Quick action cards for role-based navigation
- Information section explaining the workflow

#### CreateClaimPage
- Form validation for description and amount
- Submit button with loading state
- Error handling with user-friendly messages
- Automatic redirect after successful submission

#### MyClaimsPage
- Table showing all user's claims
- Status chips with color coding
- View details modal for expanded claim information
- Comprehensive timeline (created, submitted, approved, paid)

#### ManagerApprovalPage
- List of pending claims from team members
- Modal dialog for approval/rejection decision
- Comments/reason field (required)
- Real-time updates after action

#### HRPaymentPage
- Stats showing ready-to-pay claims
- Table of approved claims
- Mark as paid action with confirmation
- Payment processing workflow

### Components

#### Navbar
- ANDRITZ company branding (logo + name)
- Dynamic navigation menu based on user role
- User profile dropdown with logout
- Sticky positioning for easy access

#### AuthContext
- Global authentication state management
- Login/logout functions
- LocalStorage persistence
- useAuth hook for component access

## Styling Approach

The application uses Material UI theming with:
- **Primary Color**: #003da5 (ANDRITZ Blue)
- **Secondary Color**: #ffc107 (ANDRITZ Yellow)
- **Success**: #4caf50 (Green)
- **Error**: #f44336 (Red)
- **Warning**: #ff9800 (Orange)

Material UI components automatically use the theme colors for consistency.

## Form Validation

- Description: Required, non-empty
- Amount: Required, must be > 0
- Comments: Required for approvals/rejections
- Email: Valid format

## Error Handling

All API errors are caught and displayed as Material UI Alert components:
- Network errors
- Validation errors
- Server errors (500)
- 404 errors

## State Management

### Global State (AuthContext)
- `isAuthenticated` - Login status
- `user` - Current user object
- `login(userData)` - Login function
- `logout()` - Logout function

### Local State (useState)
- Claims list and status
- Form field values
- Dialog/modal visibility
- Loading and error states

## Build & Deployment

### Development Build
```bash
npm start
```

### Production Build
```bash
npm run build
```

This creates optimized files in the `build/` directory.

### Deploy to Web Server
```bash
# Build first
npm run build

# Copy build directory to web server
```

## Performance Optimization

- Functional components with React.memo (if needed)
- useEffect for API calls
- Conditional rendering based on roles
- Lazy loading consideration for future

## Security Considerations

⚠️ **Current Implementation**: Demo mode with mock authentication

For production, implement:
1. **JWT Authentication** - Use JWT tokens instead of direct user objects
2. **HTTPS Only** - Ensure all API calls use HTTPS
3. **Secure Storage** - Use secure cookies instead of localStorage
4. **CORS Configuration** - Configure CORS properly on backend
5. **Input Sanitization** - Sanitize all user inputs
6. **Password Hashing** - Never store plain passwords

## Troubleshooting

### Backend Connection Error
```
Error: Connection refused to localhost:8080
```
**Solution**: Ensure backend API is running on port 8080

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Configure CORS on backend Spring Boot application

### Login Not Working
- Verify backend is running
- Check demo user IDs (should be 1, 2, 3)
- Check browser console for errors

### Claims Not Loading
- Verify user ID is correct
- Check backend logs
- Ensure user has proper role permissions

## Future Enhancements

- [ ] Real JWT authentication
- [ ] User profile page
- [ ] Claim status notifications
- [ ] Advanced filtering and search
- [ ] Bulk claim upload
- [ ] PDF export for claims
- [ ] Email notifications
- [ ] Audit logs
- [ ] Mobile responsive improvements
- [ ] Dark mode theme
- [ ] Localization (i18n)
- [ ] Payment gateway integration

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Clone the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

Proprietary - ANDRITZ

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend API documentation
3. Check browser console for errors
4. Contact development team

## API Integration Notes

### Base Configuration
- Base URL: `http://localhost:8080/api`
- Timeout: 5000ms
- Content-Type: application/json

### Error Response Format
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Description is required",
  "path": "/api/claims"
}
```

### Success Response Format
```json
{
  "id": 1,
  "description": "Business trip",
  "amount": 1500.00,
  "status": "APPROVED",
  ...
}
```

## Quick Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (not reversible)
npm run eject
```

---

**Version**: 1.0.0  
**Last Updated**: April 21, 2026  
**Maintained By**: Development Team
