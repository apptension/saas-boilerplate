# Test Database Setup and Isolation

This document describes the database isolation mechanisms implemented to handle test database conflicts.

## Overview

The test suite includes smart database cleanup mechanisms that handle:
- Database lock conflicts when running tests sequentially
- Stale connection cleanup
- Support for both sequential and parallel test execution

## Features

### 1. Automatic Connection Cleanup

- **Per-test cleanup**: Connections are automatically closed after each test
- **Pre-test cleanup**: Connections are cleaned before each test runs
- **Session cleanup**: Final cleanup after all tests complete

### 2. Smart Connection Termination

The system only terminates **idle** database connections, not active ones:
- `idle`: Connection is idle
- `idle in transaction`: Transaction started but idle
- `idle in transaction (aborted)`: Aborted transaction

This ensures we don't kill active test operations.

### 3. Retry Logic

When database conflicts occur, the system:
1. Closes all connections
2. Terminates idle connections blocking the database
3. Waits with exponential backoff
4. Retries the operation

## Usage

### Sequential Test Execution (Default)

```bash
# Standard run - creates fresh database each time
pytest

# Faster runs - reuses database (recommended for local development)
pytest --reuse-db
```

### Parallel Test Execution

For parallel execution (e.g., with pytest-xdist), use:

```bash
# Force fresh database creation for each worker
pytest --create-db -n auto
```

### Manual Database Cleanup

If you encounter persistent database lock issues:

```bash
# Drop and recreate test database
pytest --create-db

# Or manually clean up via Docker
docker compose exec db psql -U backend -d postgres -c "DROP DATABASE IF EXISTS test_backend;"
```

## Configuration

Database isolation settings are configured in:
- `conftest.py`: Pytest fixtures and hooks
- `setup.cfg`: Pytest configuration options
- `scripts/runtime/run_tests.sh`: Test execution script

## How It Works

1. **Before tests**: `pytest_configure` hook closes any stale connections
2. **Before each test**: `pytest_runtest_setup` ensures clean connection state
3. **After each test**: `close_db_connections` fixture closes all connections
4. **After all tests**: `django_db_setup_cleanup` fixture performs final cleanup

## Troubleshooting

### "Database is being accessed by other users"

This usually means:
1. Another test process is running
2. A previous test didn't clean up properly
3. Database connections weren't closed

**Solution**: Wait a few seconds and try again, or use `--create-db` flag.

### "Database already exists"

This happens when:
1. A previous test run didn't complete cleanup
2. Database creation and destruction are racing

**Solution**: The system will automatically retry with cleanup. If persistent, use `--create-db`.

### "Database does not exist"

This happens when:
1. Database was dropped but recreation failed
2. Connection was terminated before database was created

**Solution**: Use `--create-db` to force fresh creation.

## Best Practices

1. **Local Development**: Use `--reuse-db` for faster test runs
2. **CI/CD**: Use default (fresh database) or `--create-db` for reliability
3. **Parallel Execution**: Always use `--create-db` with pytest-xdist
4. **Debugging**: If tests fail with database errors, run individual tests to isolate issues
