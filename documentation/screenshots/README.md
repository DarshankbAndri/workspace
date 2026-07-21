# Screenshot Register

## Safety rules

- Use demo-only records.
- Never capture passwords, JWTs, authorization headers, refresh tokens, SMTP credentials, or private customer data.
- Crop browser developer tools and unrelated desktop content.
- Use numbered filenames matching figure references.

## Capture status

| Figure | Page | File | Status |
|---|---|---|---|
| 1.1 | Login/application entry | `01-login-page.png` | Captured and sanitized |
| 2.1 | Site create | - | Pending interactive capture |
| 3.1 | Employee create | - | Pending interactive capture |
| 8.1 | Equipment create | - | Pending interactive capture |
| 9.1 | Maintenance request create | - | Pending interactive capture |
| 10.1 | Assignment create | - | Pending interactive capture |
| 13.1 | Downtime create | - | Pending interactive capture |
| 15.1 | PM schedule create | - | Pending interactive capture |
| 16.1 | Spare part create | - | Pending interactive capture |

## Runtime limitation

The frontend (`http://localhost:3500`), backend, and database were reachable, and demo authentication was verified through the backend. The installed Edge build successfully captures public pages but is prevented by workstation policy from exposing its browser-automation/debugging endpoint. Authenticated screenshots could not be captured without embedding a token or password in an intermediate artifact, which was intentionally not done. The remaining figures must be captured interactively on an approved workstation/session.
