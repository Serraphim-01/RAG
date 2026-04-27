# Group Assignment Roulette

A full-stack React application with Docker support that randomly assigns names to 4 groups (North, East, South, West) using a roulette wheel interface.

## Features

- 🎯 **Interactive Roulette Wheel** - Beautiful animated spinning wheel
- ⚖️ **Balanced Assignment** - Ensures equal distribution across all groups
- 🚫 **One Spin Per User** - Names can only be assigned once
- 💾 **PostgreSQL Database** - Persistent storage of all assignments
- 📊 **Live Statistics** - Real-time group counts and totals
- 📥 **CSV Export** - Download assignment data as CSV
- 🐳 **Docker Support** - Easy deployment with Docker Compose

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development without Docker)

## Quick Start with Docker

1. **Clone or navigate to the project directory:**
   ```bash
   cd "c:\Users\oyeje\Desktop\Code File\RAG"
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove all data:**
   ```bash
   docker-compose down -v
   ```

## Local Development (Without Docker)

### Database Setup

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE group_assignment;
   ```

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=group_assignment
DB_USER=postgres
DB_PASSWORD=your_password
```

Start the server:
```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start the app:
```bash
npm start
```

Access at: http://localhost:3000

## API Endpoints

- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create new assignment (body: `{ "name": "John" }`)
- `GET /api/stats` - Get group statistics
- `DELETE /api/assignments` - Clear all assignments
- `DELETE /api/assignments/:id` - Delete specific assignment

## Project Structure

```
RAG/
├── backend/
│   ├── server.js          # Express server
│   ├── db.js              # Database connection
│   ├── package.json       # Backend dependencies
│   ├── Dockerfile         # Backend Docker image
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   └── index.js       # React entry point
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── package.json       # Frontend dependencies
│   ├── Dockerfile         # Frontend Docker image
│   └── nginx.conf         # Nginx configuration
├── docker-compose.yml     # Docker orchestration
└── README.md              # This file
```

## How It Works

### Balanced Random Assignment

The algorithm ensures fair distribution:
1. Counts current members in each group
2. Finds the minimum count across all groups
3. Identifies groups with the minimum count
4. Randomly assigns to one of those groups

This guarantees:
- First 4 people: Each group gets exactly 1 person
- Next 4 people: Each group gets another person
- And so on...

### Database Schema

```sql
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  group_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Docker Commands

### Build and start:
```bash
docker-compose up --build
```

### Start in background:
```bash
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f
```

### Stop services:
```bash
docker-compose down
```

### Remove volumes (delete data):
```bash
docker-compose down -v
```

### Rebuild specific service:
```bash
docker-compose build backend
docker-compose up -d backend
```

## Troubleshooting

### Port already in use:
Change the port in `docker-compose.yml`:
```yaml
ports:
  - "3001:80"  # Change 3000 to 3001
```

### Database connection error:
Wait for PostgreSQL to fully start (check health status):
```bash
docker-compose ps
```

### Rebuild after code changes:
```bash
docker-compose up --build
```

## License

MIT
