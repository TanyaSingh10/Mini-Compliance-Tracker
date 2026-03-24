# Mini Compliance Tracker

A simple full-stack web app to manage compliance tasks for multiple clients.

## Features

- View clients
- View tasks for a selected client
- Add new tasks
- Update task status
- Filter tasks by status and category
- Highlight overdue pending tasks

## Tech Stack

- **Frontend:** React, Vite, Axios, CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Neon)
- **Deployment:** Vercel, Render
- **ORM:** Prisma
- **Version Control:** Git, GitHub

## Setup Instructions

### Clone repo
```bash
https://github.com/TanyaSingh10/Mini-Compliance-Tracker.git
cd mini-compliance-tracker
```

## Backend Setup
cd backend
npm install

Create .env:

DATABASE_URL=your_database_url
PORT=5000

Run migrations:
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm run dev

## Frontend Setup
cd ../frontend
npm install

Create .env:

VITE_API_BASE_URL=http://localhost:5050

Run frontend:
npm run dev

## API Endpoints:
GET /api/clients
GET /api/clients/:clientId/tasks
POST /api/tasks
PATCH /api/tasks/:taskId/status

## Tradeoffs:
Kept authentication out to stay within assignment scope.
Used simple status values instead of a more complex workflow engine.
Used a minimal UI to prioritize working end-to-end functionality.

## Assumptions:
Only internal team users use the app.
Each task belongs to one client.
Task status is either Pending or Completed.

## Live Links:
Frontend: https://mini-compliance-tracker-1yrf-mgg2n9yod.vercel.app/
Backend: https://mini-compliance-tracker-osve.onrender.com
