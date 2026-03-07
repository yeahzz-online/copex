# CMR Smart Presentation Portal

Production-ready educational presentation management system with role-based access for Admin, Faculty, Student, and Smartboard.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, React Router, Axios, Context API
- Backend: Node.js, Express.js, MongoDB (Mongoose), JWT (Access + Refresh), bcrypt, Nodemailer, optional Python SMTP bridge
- Cloud: AWS EC2, MongoDB/Atlas, S3, CloudFront, Nginx, PM2

## Folder Structure
```text
backend/
  app.js
  server.js
  .env.example
  config/
  controllers/
  routes/
  middlewares/
  models/
  services/
  utils/
  sql/schema.sql

frontend/
  index.html
  package.json
  .env.example
  tailwind.config.js
  src/
    components/
    pages/
    layouts/
    hooks/
    context/
    services/
    routes/
    styles/

docs/
  AWS_DEPLOYMENT.md
```

## Backend Quick Start
```bash
cd backend
npm install
cp .env.example .env
# ensure MongoDB is running and set MONGO_URI in .env
npm run dev
```

## Pre-Login Demo Accounts
Run Mongo demo seed:
```bash
cd backend
npm run seed:mongo
```

Use these credentials:
- Admin: `admin@cmrcet.ac.in` / `Admin@123`
- Faculty: `faculty.demo@cmrcet.ac.in` / `Faculty@123`
- Student: `22h51a0501@cmrcet.ac.in` / `Student@123`

## Optional Python Mailer Mode
- Set `MAIL_PROVIDER=python` in `backend/.env`
- Ensure Python 3 is installed and reachable with `PYTHON_BIN`
- Keep SMTP values configured (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)

## Frontend Quick Start
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Implemented Core Features
- Registration with role-aware email validation
  - Student regex: `^(2[1-5])h51[a-z]\d{4}@cmrcet\.ac\.in$`
  - Faculty regex: `^(?!\d+@)[a-z][a-z0-9._-]*@cmrcet\.ac\.in$`
- OTP email verification with 5-minute expiry
- Configurable OTP resend cooldown and secure OTP generation (`crypto.randomInt`)
- Optional Python SMTP bridge for email sending (`MAIL_PROVIDER=python`)
- Access token (1h) + refresh token (30d default) flow
- Refresh token persistence and revocation
- `verifyJWT` and `authorizeRoles(...roles)` middleware
- Student routes for home metrics, upload URL generation, and PPT listing
- Faculty routes for dashboard/classes/smartboard summary
- Admin protected routes for departments/classes/subjects/users/analytics
- Smartboard QR session + faculty authorization + smartboard token exchange
- S3 presigned upload flow and Office embed URL support
- Security stack: Helmet, CORS, rate limiting, centralized error handling

## SQL Schema
Use:
- [`backend/sql/schema.sql`](/C:/Users/manoh/Downloads/presentation/backend/sql/schema.sql)

## AWS Deployment
Use:
- [`docs/AWS_DEPLOYMENT.md`](/C:/Users/manoh/Downloads/presentation/docs/AWS_DEPLOYMENT.md)
