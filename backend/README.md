# Todo App Backend

A robust and secure RESTful API for the Todo App built with Node.js, Express, and MongoDB.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt password hashing
- Express Validator
- CORS

## Features

- User authentication (register, login, profile)
- Task management (create, read, update, delete)
- Push notification support
- Secure routes with JWT
- Input validation
- Error handling middleware

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies

```bash
npm install
```

4. Create a `.env` file in the root of the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

### Running the Server

For development (with nodemon):

```bash
npm run dev
```

For production:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token
- `GET /api/auth/me` - Get user profile (protected)
- `PUT /api/auth/pushtoken` - Update push notification token (protected)

### Tasks

- `GET /api/tasks` - Get all tasks for the authenticated user (protected)
- `GET /api/tasks/:id` - Get a specific task by ID (protected)
- `POST /api/tasks` - Create a new task (protected)
- `PUT /api/tasks/:id` - Update a task (protected)
- `DELETE /api/tasks/:id` - Delete a task (protected)

### Notifications

- `GET /api/notifications` - Get pending notifications (protected)
- `POST /api/notifications/schedule` - Schedule a notification (protected)
- `PUT /api/notifications/:id/sent` - Mark notification as sent (protected)
- `GET /api/notifications/due` - Get due notifications (protected) 