# Angular + Express + MongoDB App

## Quick Start

1. Run Docker Compose:

   docker compose up -d

2. Open the app in your browser:

   http://localhost:4200

## Backend API

### Authentication

- POST /api/auth/register - register a new user
- POST /api/auth/login - sign in and receive a JWT
- GET /api/auth/me - get the current user  -- this requires token you received from login 

### User Management

- POST /api/users - create a user
- GET /api/users - list users
- GET /api/users/:id - get a user by ID
- PUT /api/users/:id - update a user by ID
- DELETE /api/users/:id - delete a user by ID
- GET /api/users/download - download user data

## Architecture

- frontend: Angular app served by Nginx
- backend: Express API on port 3000
- database: MongoDB on port 27017

## Simple Diagram

Browser -> `http://localhost:4200`

Frontend
  ├─ serves Angular UI
  └─ sends `/api/*` requests to backend

Backend
  ├─ handles `/api/auth/*` and `/api/users/*`
  └─ talks to MongoDB

MongoDB
  └─ stores user data

## Notes

- Authentication uses JWT tokens.
- User data is stored in MongoDB.

## Run without Docker

From `backend`:

   npm install
   npm start

From `frontend`:

   npm install
   npm start
