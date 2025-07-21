## Manual docker run (if not using docker-compose)

If you need to run the container directly (not recommended for most workflows), make sure to publish the required ports:

```bash
docker run -it --rm \
  -p 3000:3000 -p 3005:3005 \
  -e DEPT_EMPLOYEE_ID="your_id" \
  -e DEPT_CORPORATION_ID="your_corp_id" \
  -e DEPT_DEFAULT_ACTIVITY_ID="your_activity_id" \
  -e DEPT_DEFAULT_PROJECT_ID="your_project_id" \
  -e DEPT_DEFAULT_COMPANY_ID="your_company_id" \
  -e DEPT_DEFAULT_BUDGET_ID="your_budget_id" \
  elmarkou/dept-hourbooking:latest
```

This ensures the MCP server is accessible on ports 3000 and 3005 from your host.

# Docker Container Management Guide

## Common Causes of Multiple Containers

### 1. **Running docker-compose up multiple times**

Each time you run `docker-compose up` without stopping the previous container, it may create a new one.

**Solution:**

```bash
# Always stop existing containers first
docker-compose down
# Then start fresh
docker-compose up -d
```

### 2. **Not using container_name in docker-compose.yml**

Without a fixed container name, Docker may create containers with random names.

**Solution:** ✅ Fixed - Added `container_name: dept-hourbooking` to docker-compose.yml

### 3. **Running docker run commands directly**

Using `docker run` instead of `docker-compose` creates separate containers.

**Solution:** Always use `docker-compose` for this project.

### 4. **Development workflow issues**

Repeatedly building and running during development.

**Solution:** Use the provided scripts:

- `./scripts/setup.sh` - Clean setup and start
- `./scripts/docker-cleanup.sh` - Clean up multiple containers

## Recommended Commands

### Daily Use

```bash
# Start the container
./scripts/setup.sh

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Development

```bash
# Rebuild and restart
docker-compose down
docker-compose up --build -d

# View container status
docker-compose ps
```

### Cleanup

```bash
# Clean up all containers and images
./scripts/docker-cleanup.sh

# Manual cleanup
docker container prune -f
docker image prune -f
```

## Monitoring

### Check running containers

```bash
docker ps
```

### Check all containers (including stopped)

```bash
docker ps -a
```

### Check Docker resource usage

```bash
docker system df
```

## Prevention Tips

1. **Always use docker-compose** instead of docker run
2. **Run cleanup scripts** before starting new containers
3. **Use the provided scripts/setup.sh** script for consistent startup
4. **Stop containers** when not needed: `docker-compose down`
5. **Monitor regularly** with `docker ps -a`

## Troubleshooting

If you still see multiple containers:

1. Run `./scripts/docker-cleanup.sh` to clean up
2. Check for any automation scripts or cron jobs
3. Verify you're not running multiple terminal sessions with docker commands
4. Check if any IDE or development tools are managing Docker containers automatically
