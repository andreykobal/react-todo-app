# React Todo App with PostgreSQL

A Todo application built with React, Node.js, Express, and PostgreSQL.

## Features

- Create, Read, Update, and Delete todos
- Filter todos by status (All, Complete, Incomplete)
- Persistence with PostgreSQL database
- Docker Compose setup for easy deployment

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
- `POST /api/todos`: Create a new todo
- `PUT /api/todos/:id`: Update a todo
- `DELETE /api/todos/:id`: Delete a todo
