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

The public frontend was rechecked at the requested `http://localhost:6200` on 21 July 2026 and returned HTTP 200. During that pass, the configured backend at `http://localhost:4111/api` was not listening, so authenticated capture could not begin. The existing safe login image is retained. No token or password was embedded in an intermediate artifact to bypass authentication; the remaining figures must be captured interactively after the backend is available on an approved workstation/session.
