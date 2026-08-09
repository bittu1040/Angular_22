# Angular + Express + MongoDB App

## Quick Start

1. Run Docker Compose:

   docker compose up -d

2. Open the app in your browser:

   http://localhost:4200

## Backend API

### Authentication

- POST /api/auth/register - register a new user

  Request body:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "secret123"
  }
  ```

- POST /api/auth/login - sign in and receive a JWT

  Request body:
  ```json
  {
    "email": "jane@example.com",
    "password": "secret123"
  }
  ```

- GET /api/auth/me - get the current user

  Headers:
  ```http
  Authorization: Bearer <token>
  ```

### User Management

- POST /api/users - create a user

  Request body:
  ```json
  {
    "name": "John Smith",
    "email": "john@example.com",
    "password": "secret123"
  }
  ```

- GET /api/users - list users

  Optional query parameters:
  ```text
  ?page=1&limit=10&search=john&role=user&status=active&sortBy=createdAt&sortOrder=desc
  ```

- GET /api/users/:id - get a user by ID

  No body required.

- PUT /api/users/:id - update a user by ID

  Request body:
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
  ```

- DELETE /api/users/:id - delete a user by ID

  No body required.

- GET /api/users/download - download user data

  Optional query parameters:
  ```text
  ?search=john&role=user&status=active
  ```

## Architecture

- frontend: Angular app served by Nginx
- backend: Express API on port 3000
- database: MongoDB on port 27017

## Simple

auth APIs:

POST /api/auth/register    Public
POST /api/auth/login       Public
GET  /api/auth/me          JWT required

And user APIs:

POST   /api/users          JWT required
GET    /api/users          JWT required
GET    /api/users/:id      JWT required
PUT    /api/users/:id      JWT required
DELETE /api/users/:id      JWT required
GET    /api/users/download JWT required

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
