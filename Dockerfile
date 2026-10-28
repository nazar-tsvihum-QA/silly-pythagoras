# ============================================================================
# Dockerfile for Wikipedia Language Change Test
# ============================================================================
# Uses the official Playwright Docker image which comes pre-installed with:
#   - Node.js
#   - All Playwright browsers and their system dependencies
#
# Build:   docker build -t wiki-lang-test .
# Run:     docker run --env-file .env -v ./playwright-report:/app/playwright-report wiki-lang-test
# ============================================================================

# Use the official Playwright image matching our @playwright/test version (1.64.1)
FROM mcr.microsoft.com/playwright:v1.64.1-noble

# Set working directory inside the container
WORKDIR /app

# Copy package files first (leverages Docker layer caching)
COPY package.json package-lock.json ./

# Install project dependencies (--frozen-lockfile ensures reproducible builds)
RUN npm ci

# Copy the rest of the project files
COPY tsconfig.json playwright.config.ts ./
COPY src/ ./src/

# Create directory for the report output
RUN mkdir -p /app/playwright-report

# Run the tests
# The command:
#   1. Runs Playwright tests in headless mode (default in Docker)
#   2. Generates HTML report in /app/playwright-report
#   3. The report directory is mounted as a volume to persist on the host
CMD ["npx", "playwright", "test"]
