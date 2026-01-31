"""gunicorn WSGI server configuration."""
import logging
import os
from multiprocessing import cpu_count

import environ

env = environ.Env(
    # set casting, default value
    DJANGO_DEBUG=(bool, False)
)

DEBUG = env("DJANGO_DEBUG")


def max_workers():
    """
    Calculate the number of workers.

    Priority:
    1. WEB_CONCURRENCY env var (explicit override)
    2. Debug mode: 2 workers
    3. Production: min(cpu_count() * 2 + 1, 4) - capped at 4 for memory efficiency
    """
    # Allow explicit override via environment variable
    web_concurrency = os.environ.get("WEB_CONCURRENCY")
    if web_concurrency:
        return int(web_concurrency)

    if DEBUG:
        return 2

    # Cap workers at 4 for memory-constrained environments (Render starter plans)
    # Each uvicorn worker can use 100-200MB+ of RAM
    return min(cpu_count() * 2 + 1, 4)


# Use PORT env var for Render/cloud deployments, default to 80 for local Docker
port = os.environ.get("PORT", "80")
bind = f"0.0.0.0:{port}"
max_requests = 1000
max_requests_jitter = 50  # Prevent all workers from restarting at once
accesslog = "-"
errorlog = "-"
workers = max_workers()
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120  # Increase timeout for slow requests


class HealthCheckFilter(logging.Filter):
    def filter(self, record):
        return not record.args['a'].startswith("ELB-HealthChecker")


def on_starting(server):
    server.log.access_log.addFilter(HealthCheckFilter())
