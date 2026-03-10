FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium --with-deps

# App
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:asgi_app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
