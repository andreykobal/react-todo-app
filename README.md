# TodoList Challenge

A Todo application built with React, Node.js, Express, and PostgreSQL, developed as part of a 1.5-hour coding challenge.

![ezgif-50a1a8546bae8b](https://github.com/user-attachments/assets/9852c51c-5cc8-480b-9e56-eaa34c2e1f05)

## Challenge Overview

This project is a solution to the TodoList Challenge, which was completed within the 1.5-hour timeframe. The challenge consisted of the following iterations:

### Iteration 1: Local Storage Implementation

- Tasks are saved and restored when the page is refreshed
- Implemented automated tests to verify persistence

### Iteration 2: Database Integration

- Connected the application to PostgreSQL database
- Set up Docker Compose configuration for easy deployment
- Created seed data for initial population of the database

### Iteration 3: Multi-user System

- Implemented user authentication system
- Added task status management with user restrictions
- Each user can only have one active task at a time
- Tasks can be assigned to multiple users

### Iteration 4: Popularity-based Task Sorting

- Added display of tasks sorted by popularity (least to most users)
- Real-time updates of task popularity
- Admin-only controls for task management
- Regular users can only interact with tasks, not manage them

## Tools and Technologies Used

- **Frontend**: React, Redux, React Router, Framer Motion, React Icons
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Real-time Updates**: WebSockets
- **Containerization**: Docker, Docker Compose
- **Testing**: Jest for unit tests

## Features

- Create, Read, Update, and Delete todos (admin only)
- Filter todos by status (admin only)
- Sort tasks by completion count (admin only)
- User authentication and role-based permissions
- Persistence with PostgreSQL database
- Docker Compose setup for easy deployment
- Real-time updates via WebSockets

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for local development)

## Getting Started

### Using Docker Compose (Recommended)

1. Clone the repository
2. Navigate to the project directory
3. Start the application using Docker Compose:

```bash
docker-compose up -d
```

This will:

- Start a PostgreSQL database container
- Build and start the application container
- Expose the app on port 8000

4. Access the application at http://localhost:8000

5. Seed the database with initial data (optional):

```bash
docker-compose exec app npm run seed
```

### Local Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
cd frontend && npm install
```

3. Set up PostgreSQL locally or use the Docker Compose file to start just the database:

```bash
docker-compose up -d postgres
```

4. Create a `.env` file in the root directory with the following:

```
PORT=8000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/todo_app
NODE_ENV=development
```

5. Create a `.env` file in the frontend directory with:

```
REACT_APP_API_URL=http://localhost:8000/api
```

6. Seed the database (optional):

```bash
npm run seed
```

7. Start the development server:

```bash
npm run dev
```

8. Access the application:
   - Backend API: http://localhost:8000
   - Frontend: http://localhost:3001

## API Endpoints

- `GET /api/todos`: Get all todos
- `GET /api/todos/:id`: Get a specific todo by ID
- `POST /api/todos`: Create a new todo (admin only)
- `PUT /api/todos/:id`: Update a todo (admin only)
- `PATCH /api/todos/:id/status`: Update a todo's status (user specific)
- `DELETE /api/todos/:id`: Delete a todo (admin only)
- `POST /api/auth/login`: User authentication
- `GET /api/auth/me`: Get current user info
