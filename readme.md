# Angular + Express + MongoDB App

## Overview

This project has:

- Frontend: Angular app served at http://localhost:4200
- Backend: Express API at http://localhost:3000
- Database: MongoDB

## Authentication flow

The backend uses JWT-based authentication with two tokens:

- Access token: short-lived JWT returned in the API response body
- Refresh token: long-lived JWT stored in an HTTP-only cookie named refreshToken

How it works:

1. Register or login to get an access token.
2. Send the access token in the Authorization header on protected routes.
3. When the access token expires, call the refresh endpoint with the refresh cookie attached.
4. The backend returns a new access token and rotates the refresh token.

Example header:

```http
Authorization: Bearer <access_token>
```

Example cookie:

```http
refreshToken=<refresh_token>; HttpOnly; Secure; SameSite=Strict
```

---

## Auth API

### 1) Register user

Endpoint:

```http
POST /api/auth/register
```

Request payload:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Successful response:

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64fd9d3a7d3f1f2a4c8d1234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2026-08-16T12:00:00.000Z"
    }
  }
}
```

Notes:

- Password must be at least 6 characters.
- The client receives an access token in `data.accessToken`.
- A refresh token is also stored in the `refreshToken` cookie.

### 2) Login user

Endpoint:

```http
POST /api/auth/login
```

Request payload:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Successful response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64fd9d3a7d3f1f2a4c8d1234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "status": "active"
    }
  }
}
```

Notes:

- This returns a fresh access token for the authenticated user.
- The refresh token is set as the `refreshToken` HTTP-only cookie.

### 3) Refresh access token

Endpoint:

```http
POST /api/auth/refresh-token
```

Request:

- No JSON body required
- Send the refresh token cookie automatically from the browser

Successful response:

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...new-token..."
  }
}
```

Notes:

- The server verifies the refresh token from the cookie.
- It rotates the refresh token and sends a new access token.

### 4) Get current user

Endpoint:

```http
GET /api/auth/me
```

Headers:

```http
Authorization: Bearer <access_token>
```

Successful response:

```json
{
  "success": true,
  "data": {
    "_id": "64fd9d3a7d3f1f2a4c8d1234",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2026-08-16T12:00:00.000Z",
    "updatedAt": "2026-08-16T12:00:00.000Z"
  }
}
```

### 5) Logout user

Endpoint:

```http
POST /api/auth/logout
```

Request:

- No JSON body required
- The cookie is read from the request automatically

Successful response:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

Notes:

- The backend clears the refresh token cookie.
- It also removes the stored refresh token from the user record.

---

## Task API

All task routes are protected and require the access token in the Authorization header.

### Create task

Endpoint:

```http
POST /api/tasks/createTask
```

Headers:

```http
Authorization: Bearer <access_token>
```

Request payload:

```json
{
  "title": "Finish Angular dashboard",
  "description": "Complete the login screen and task list UI"
}
```

Successful response:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "64fd9d3a7d3f1f2a4c8d9999",
    "title": "Finish Angular dashboard",
    "description": "Complete the login screen and task list UI",
    "status": "pending",
    "user": "64fd9d3a7d3f1f2a4c8d1234",
    "createdAt": "2026-08-16T12:05:00.000Z",
    "updatedAt": "2026-08-16T12:05:00.000Z"
  }
}
```

### Get all tasks for logged-in user

Endpoint:

```http
GET /api/tasks/myTasks
```

Headers:

```http
Authorization: Bearer <access_token>
```

Successful response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "64fd9d3a7d3f1f2a4c8d9999",
      "title": "Finish Angular dashboard",
      "description": "Complete the login screen and task list UI",
      "status": "pending",
      "user": "64fd9d3a7d3f1f2a4c8d1234",
      "createdAt": "2026-08-16T12:05:00.000Z",
      "updatedAt": "2026-08-16T12:05:00.000Z"
    }
  ]
}
```

### Get task by ID

Endpoint:

```http
GET /api/tasks/tasks/:id
```

Headers:

```http
Authorization: Bearer <access_token>
```

Successful response:

```json
{
  "success": true,
  "data": {
    "_id": "64fd9d3a7d3f1f2a4c8d9999",
    "title": "Finish Angular dashboard",
    "description": "Complete the login screen and task list UI",
    "status": "pending",
    "user": "64fd9d3a7d3f1f2a4c8d1234",
    "createdAt": "2026-08-16T12:05:00.000Z",
    "updatedAt": "2026-08-16T12:05:00.000Z"
  }
}
```

### Update task

Endpoint:

```http
PUT /api/tasks/tasks/:id
```

Headers:

```http
Authorization: Bearer <access_token>
```

Request payload:

```json
{
  "title": "Finish Angular dashboard v2",
  "description": "Complete the login screen and task list UI and fix bugs",
  "status": "completed"
}
```

Successful response:

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "64fd9d3a7d3f1f2a4c8d9999",
    "title": "Finish Angular dashboard v2",
    "description": "Complete the login screen and task list UI and fix bugs",
    "status": "completed",
    "user": "64fd9d3a7d3f1f2a4c8d1234",
    "createdAt": "2026-08-16T12:05:00.000Z",
    "updatedAt": "2026-08-16T12:20:00.000Z"
  }
}
```

### Delete task

Endpoint:

```http
DELETE /api/tasks/tasks/:id
```

Headers:

```http
Authorization: Bearer <access_token>
```

Successful response:

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Project run

### Docker

```bash
docker compose up -d
```

Open:

```text
http://localhost:4200
```

### Local backend

```bash
cd backend
npm install
npm start
```

### Local frontend

```bash
cd frontend
npm install
npm start
```

## Notes

- Registration and login return an access token.
- The backend stores the refresh token in a secure HTTP-only cookie.
- Protected routes require Authorization: Bearer <access_token>.
- Task routes are route-protected and tied to the authenticated user. 




                         REGISTER
                            │
                            ▼
                    Create User in MongoDB
                            │
                            ▼
                       LOGIN
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
        ACCESS TOKEN                REFRESH TOKEN
              │                           │
              ▼                           ▼
    Angular memory/localStorage     HTTP-only Cookie
              │                           │
              │                           ▼
              │                      MongoDB
              │                 user.refreshToken
              │
              ▼
       CREATE / UPDATE TASK
              │
              │ Authorization:
              │ Bearer <accessToken>
              ▼
        Auth Middleware
              │
              ▼
       Access Token Valid?
          │           │
         YES          NO
          │           │
          ▼           ▼
     Task API       401
                      │
                      ▼
             POST /auth/refresh-token
             withCredentials: true
                      │
                      ▼
             Browser sends cookie
                      │
                      ▼
             Backend validates
             refreshToken
                      │
                      ▼
             New accessToken
                      │
                      ▼
             Angular replaces
             old accessToken
                      │
                      ▼
              Retry original API
                      │
                      ▼
                    SUCCESS


                         LOGOUT
                            │
                            ▼
                POST /api/auth/logout
                 withCredentials: true
                            │
                            ▼
                 Browser sends refresh
                      token cookie
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      MongoDB:                       Browser:
      refreshToken = null            clear cookie
              │                           │
              └─────────────┬─────────────┘
                            ▼
                 Angular removes
                   accessToken
                            │
                            ▼
                  Redirect to /login
                            │
                            ▼
                       LOGGED OUT