# Frontend Setup & Deployment Guide

## Local Development Setup

### Step 1: Prerequisites
- Node.js 14+ ([Download](https://nodejs.org/))
- npm or yarn
- Git (optional)
- Backend API running on http://localhost:8080

### Step 2: Install Dependencies
```bash
cd travel-reimbursement-frontend
npm install
```

Expected output:
```
added 1234 packages in 45s
```

### Step 3: Start Development Server
```bash
npm start
```

Expected output:
```
Compiled successfully!

You can now view travel-reimbursement-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

### Step 4: Test in Browser
1. Open http://localhost:3000
2. Select "Employee" demo user
3. Click "Login"
4. Verify Dashboard loads

## Environment Configuration

### Create .env File
```bash
# Copy example to actual file
cp .env.example .env

# Or create manually
```

### .env File Content
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_API_TIMEOUT=5000
REACT_APP_NAME=Travel Reimbursement System
REACT_APP_COMPANY=ANDRITZ
```

### Using Environment Variables in Code
```javascript
// In components
const API_URL = process.env.REACT_APP_API_URL;
const TIMEOUT = process.env.REACT_APP_API_TIMEOUT;
```

## Testing the Application

### Test Workflow - Create to Paid

#### As Employee:
1. Login with employee account
2. Click "New Claim"
3. Fill in:
   - Description: "Business trip to NYC"
   - Amount: "1500.00"
4. Click "Submit Claim"
5. Verify success message
6. Click "My Claims"
7. Verify claim appears with status "PENDING_MANAGER_APPROVAL"

#### As Manager (Switch User):
1. Logout (click avatar → Logout)
2. Login with manager account
3. Click "Approvals"
4. See the claim from employee
5. Click "Approve" button
6. Add comment: "Looks good"
7. Click "Approve"
8. Verify success message

#### As HR (Switch User):
1. Logout
2. Login with HR account
3. Click "Payments"
4. See the claim (status should be APPROVED)
5. Click "Mark Paid"
6. Confirm in dialog
7. Verify claim marked as PAID

## Build for Production

### Create Optimized Build
```bash
npm run build
```

This creates:
- Optimized/minified JavaScript
- Optimized CSS
- Source maps for debugging
- Output in `build/` folder

### Build Output
```
build/
├── index.html          # Main HTML file
├── static/
│   ├── js/
│   │   ├── main.xxxxx.js
│   │   └── runtime.xxxxx.js
│   ├── css/
│   │   └── main.xxxxx.css
│   └── media/          # Images, fonts
└── favicon.ico
```

### Deploy to Web Server

#### Option 1: Static Hosting (Nginx, Apache, S3)
```bash
# Build
npm run build

# Copy build folder to web server public directory
# Configure server to serve index.html for all routes (SPA)
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/travel-reimbursement;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Option 2: Heroku Deployment
```bash
# Create Heroku app
heroku create my-app-name

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option 3: Docker
```dockerfile
# Dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t travel-reimbursement-frontend .
docker run -p 80:80 travel-reimbursement-frontend
```

## Performance Optimization

### Tips to Improve Performance
1. **Code Splitting**: Lazy load routes
2. **Minification**: npm run build does this automatically
3. **Gzip Compression**: Configure on web server
4. **Caching**: Set proper cache headers
5. **CDN**: Serve assets from CDN
6. **Image Optimization**: Compress images before adding

### Analyze Bundle Size
```bash
# Install analyzer
npm install --save-dev source-map-explorer

# Analyze
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

## Troubleshooting Deployment

### Issue: Blank Page or 404
**Solution**: Ensure all routes redirect to index.html
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Issue: API Calls Failing After Deploy
**Solution**: Update REACT_APP_API_URL in .env
```
REACT_APP_API_URL=https://api.yourdomain.com
```

Rebuild:
```bash
npm run build
```

### Issue: CORS Errors
**Solution**: Ensure backend has proper CORS headers
```java
// Spring Boot
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        // ...
    }
}
```

### Issue: Source Maps in Production
Don't generate source maps for security:
```bash
# Set before build
GENERATE_SOURCEMAP=false npm run build
```

## Monitoring in Production

### Enable Error Tracking
Integrate Sentry or similar:
```bash
npm install @sentry/react
```

### Monitor API Performance
Use tools like:
- Datadog
- New Relic
- CloudWatch
- AppDynamics

### View Logs
Check browser console and backend logs for issues.

## Continuous Integration/Deployment

### GitHub Actions Example
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - name: Deploy
        run: |
          # Add your deployment script here
```

## Version Management

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update to latest major version
npm install package-name@latest
```

### Lock Dependencies
```bash
# package-lock.json is automatically generated
# Commit to version control to ensure reproducible installs
git add package-lock.json
git commit -m "Update dependencies"
```

## Environment Specific Configuration

### Development
```
REACT_APP_API_URL=http://localhost:8080/api
```

### Staging
```
REACT_APP_API_URL=https://staging-api.yourdomain.com
```

### Production
```
REACT_APP_API_URL=https://api.yourdomain.com
```

## Security Checklist

- [ ] Remove all console.logs before deployment
- [ ] Set proper CORS headers on backend
- [ ] Use HTTPS in production
- [ ] Implement proper authentication (JWT)
- [ ] Sanitize user inputs
- [ ] Remove sensitive data from localStorage
- [ ] Set Content Security Policy headers
- [ ] Update all dependencies regularly
- [ ] Implement rate limiting on API
- [ ] Enable GZIP compression
- [ ] Use security headers (X-Frame-Options, X-Content-Type-Options)

## Monitoring Checklist

- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics
- [ ] Monitor API response times
- [ ] Track user interactions
- [ ] Set up uptime monitoring
- [ ] Create dashboard for metrics
- [ ] Set up alerts for critical issues
- [ ] Review logs regularly

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Monitor performance metrics
- [ ] Clean up unused code
- [ ] Update documentation
- [ ] Test in different browsers
- [ ] Test on mobile devices

### Backup Strategy
- [ ] Version control all code
- [ ] Backup environment variables
- [ ] Backup database (backend)
- [ ] Regular deployment practice

## Support & Scaling

### As Users Grow
1. **Frontend Caching**: Implement service workers
2. **Lazy Loading**: Load components on demand
3. **CDN**: Serve static assets from CDN
4. **Backend Scaling**: Ensure backend can handle load
5. **Database Optimization**: Add indexes, optimize queries

### Disaster Recovery
1. Keep backups of all environments
2. Document deployment process
3. Test recovery procedures
4. Maintain detailed logs
5. Have rollback plan

---

**Last Updated**: April 21, 2026
