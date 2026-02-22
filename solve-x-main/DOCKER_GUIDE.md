# Docker Guide for SolveX Monorepo

This guide covers how to build and run the SolveX application using Docker and Docker Compose.

## Prerequisites

- Docker installed (v20.10+)
- Docker Compose installed (v2.0+)

## Project Structure

```
solvex-monorepo/
├── backend/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development build
│   └── ...
├── frontend/
│   ├── Dockerfile              # Production build
│   └── ...
├── docker-compose.yml          # Production configuration
└── docker-compose.dev.yml      # Development configuration
```

---

## Development Environment

### Start Development Environment

The development environment includes:
- PostgreSQL database (port 5432)
- Backend with hot reload (port 8000) - automatically reloads on code changes
- Frontend with Vite dev server (port 3000) - automatically reloads on code changes

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start in detached mode (background)
docker-compose -f docker-compose.dev.yml up -d

# Build and start
docker-compose -f docker-compose.dev.yml up --build
```

**Note:** In development mode, both frontend and backend support **hot reload** - your code changes will automatically reload the services without needing to restart containers!

### Hot Reload / Auto-Reload in Development

Both services automatically reload when you make code changes:

**Backend (Go):**
- Changes to `.go` files automatically trigger a rebuild and restart
- Volume mounted: `./backend:/app` - your local code is synced to the container

**Frontend (React + Vite):**
- Vite's built-in Hot Module Replacement (HMR) instantly updates the browser
- Volume mounted: `./frontend:/app` - your local code is synced to the container
- Changes appear in browser within milliseconds

**To test hot reload:**
```bash
# 1. Start dev environment
docker-compose -f docker-compose.dev.yml up

# 2. Edit any file in backend/ or frontend/
# 3. Watch the logs - you'll see the service reload automatically
# 4. For frontend, check your browser - changes appear instantly
```

### Stop Development Environment

```bash
# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose -f docker-compose.dev.yml down -v
```

### Watch Logs in Real-Time (See Auto-Reload)

```bash
# All services - see hot reload messages
docker-compose -f docker-compose.dev.yml logs -f

# Backend only - watch Go app reload
docker-compose -f docker-compose.dev.yml logs -f backend

# Frontend only - watch Vite HMR updates
docker-compose -f docker-compose.dev.yml logs -f frontend

# Database logs
docker-compose -f docker-compose.dev.yml logs -f db
```

### Restart a Service

```bash
docker-compose -f docker-compose.dev.yml restart backend
docker-compose -f docker-compose.dev.yml restart frontend
```

### Access Services (Development)

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: localhost:5432
  - User: `postgres`
  - Password: `postgres`
  - Database: `solvex_dev`

### Development Database Access

Connect to the database:
```bash
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d solvex_dev
```

---

## Production Environment

### Build Production Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Start Production Environment

The production environment includes:
- Backend (port 8000) - connects to external Prisma database
- Frontend with Nginx (port 3000)

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Build and start
docker-compose up --build -d
```

### Stop Production Environment

```bash
# Stop services
docker-compose down

# Stop and remove all resources
docker-compose down --volumes --remove-orphans
```

### View Production Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Services (Production)

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

---

## Common Docker Commands

### Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop a container
docker stop <container-name>

# Remove a container
docker rm <container-name>

# Execute command in container
docker exec -it <container-name> sh
```

### Image Management

```bash
# List images
docker images

# Remove an image
docker rmi <image-name>

# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a
```

### Volume Management

```bash
# List volumes
docker volume ls

# Remove a volume
docker volume rm <volume-name>

# Remove all unused volumes
docker volume prune
```

### System Cleanup

```bash
# Remove all stopped containers, unused networks, dangling images
docker system prune

# Remove everything including unused images and volumes
docker system prune -a --volumes
```

---

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Find process using port
lsof -i :3000  # or :8000, :5432

# Kill the process
kill -9 <PID>
```

Or change the port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3001 to available port
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues (Dev)

```bash
# Restart database
docker-compose -f docker-compose.dev.yml restart db

# Check database logs
docker-compose -f docker-compose.dev.yml logs db

# Verify database is healthy
docker-compose -f docker-compose.dev.yml ps
```

### Reset Development Database

```bash
# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Start fresh
docker-compose -f docker-compose.dev.yml up
```

### Frontend Not Loading

```bash
# Rebuild frontend
docker-compose -f docker-compose.dev.yml build --no-cache frontend
docker-compose -f docker-compose.dev.yml up frontend

# Check node_modules
docker-compose -f docker-compose.dev.yml exec frontend npm install
```

### Backend Build Fails

```bash
# Clean Go cache
docker-compose -f docker-compose.dev.yml exec backend go clean -modcache

# Rebuild
docker-compose -f docker-compose.dev.yml build --no-cache backend
```

### Hot Reload Not Working

**Backend:**
```bash
# Check if volume is mounted correctly
docker-compose -f docker-compose.dev.yml exec backend ls -la /app

# Verify backend logs show file watching
docker-compose -f docker-compose.dev.yml logs -f backend

# Restart backend service
docker-compose -f docker-compose.dev.yml restart backend
```

**Frontend:**
```bash
# Check if Vite dev server is running
docker-compose -f docker-compose.dev.yml logs frontend

# Make sure you're accessing via http://localhost:3000
# Vite HMR requires websocket connection

# Restart frontend
docker-compose -f docker-compose.dev.yml restart frontend
```

**Both:**
```bash
# Rebuild volumes (if code changes aren't syncing)
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

---

## Environment Variables

### Development

Create `.env` file in backend directory with:
```env
PORT=8000
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=solvex_dev
```

### Production

Ensure backend `.env` has production database credentials (Prisma connection).

---

## Best Practices

1. **Always use specific compose files**:
   - Development: `docker-compose -f docker-compose.dev.yml`
   - Production: `docker-compose`

2. **In development, keep containers running for hot reload**:
   ```bash
   # Run in foreground to see reload messages
   docker-compose -f docker-compose.dev.yml up
   
   # Or run in background and watch logs
   docker-compose -f docker-compose.dev.yml up -d
   docker-compose -f docker-compose.dev.yml logs -f
   ```

3. **Rebuild after dependency changes** (package.json, go.mod):
   ```bash
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml build --no-cache
   docker-compose -f docker-compose.dev.yml up
   ```

4. **For code changes, no rebuild needed** - hot reload handles it automatically!

5. **Clean up regularly**:
   ```bash
   docker system prune
   ```

6. **View logs when debugging**:
   ```bash
   docker-compose logs -f
   ```

7. **Use health checks** to ensure services are ready before dependent services start

---

## Quick Reference

| Task | Command |
|------|---------|
| **Development** | |
| Start dev (with hot reload) | `docker-compose -f docker-compose.dev.yml up` |
| Start dev in background | `docker-compose -f docker-compose.dev.yml up -d` |
| Watch logs (see auto-reload) | `docker-compose -f docker-compose.dev.yml logs -f` |
| Stop dev | `docker-compose -f docker-compose.dev.yml down` |
| Rebuild dev | `docker-compose -f docker-compose.dev.yml up --build` |
| **Production** | |
| Start prod | `docker-compose up` |
| Stop prod | `docker-compose down` |
| Rebuild prod | `docker-compose up --build` |
| **Debugging** | |
| View logs | `docker-compose logs -f <service>` |
| Shell into container | `docker exec -it <container> sh` |
| Restart service | `docker-compose restart <service>` |
| **Cleanup** | |
| Clean everything | `docker system prune -a --volumes` |
