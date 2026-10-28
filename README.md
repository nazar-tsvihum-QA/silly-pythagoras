# Wikipedia Interface Language Change — Automated Test

Automated end-to-end test that verifies the functionality of changing the interface language on Wikipedia by an authenticated user, using **Playwright** and **TypeScript**.

---

## 📋 Test Case

### TC-LANG-001: Successful Interface Language Change

| Field              | Value                                                                 |
|--------------------|-----------------------------------------------------------------------|
| **Test Case ID**   | TC-LANG-001                                                           |
| **Title**          | Successful interface language change by an authenticated user         |
| **Priority**       | High                                                                  |
| **Type**           | Functional, E2E                                                       |
| **Automation**     | Automated (Playwright + TypeScript)                                   |

#### Preconditions
1. User has a valid Wikipedia account
2. User credentials are configured in the `.env` file
3. Internet connection is available
4. The user's current interface language is set to English (`en`)

#### Test Steps

| Step | Action                                                                                                  | Expected Result                                                               |
|------|---------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| 1    | Log in to Wikipedia with valid credentials                                                              | User is successfully logged in; username is visible in the interface           |
| 2    | Navigate to **Special:Preferences**                                                                     | The Preferences page opens on the "User profile" tab                          |
| 3    | Record the current interface language setting                                                           | The current language code is saved (e.g., `en`)                               |
| 4    | In the **"Internationalisation"** section, change the language to **French (`fr`)**                     | The language dropdown shows `fr` as the selected option                       |
| 5    | Click the **"Save"** button                                                                             | Preferences are saved; a success notification appears                         |
| 6    | Verify the language dropdown still shows `fr` after page reload                                         | The language setting persists after save                                      |
| 7    | Navigate to the **Main Page**                                                                           | The Main Page loads                                                           |
| 8    | Verify that the sidebar link "Main page" now shows **"Page d’accueil"** (French translation)           | Interface elements are displayed in French                                    |
| 9    | **(Cleanup)** Navigate back to Preferences and restore the original language                            | The original language is restored to avoid polluting the account state         |

#### Expected Result
After saving the language preference, all interface elements (sidebar links, navigation headings, menu items) are displayed in French.

---

## 🏗️ Project Structure

```
wikipedia-lang-change-test/
├── src/
│   ├── fixtures/
│   │   └── wiki.fixture.ts        # Custom Playwright fixtures (auth, page objects)
│   ├── pages/
│   │   ├── index.ts               # Barrel export for page objects
│   │   ├── login.page.ts          # Page Object: Wikipedia Login
│   │   ├── preferences.page.ts    # Page Object: Wikipedia Preferences
│   │   └── main.page.ts           # Page Object: Wikipedia Main Page
│   └── tests/
│       └── change-language.spec.ts # Test spec: language change verification
├── .env                           # Credentials (NOT committed to Git)
├── .env.example                   # Template for .env file
├── .gitignore
├── .dockerignore
├── Dockerfile                     # Docker image for running tests
├── docker-compose.yml             # Docker Compose for easy execution
├── package.json
├── playwright.config.ts           # Playwright configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **Docker** and **Docker Compose** (for containerized execution)
- A **Wikipedia account** (create one at https://en.wikipedia.org/wiki/Special:CreateAccount)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd wikipedia-lang-change-test

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Configure Credentials

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your Wikipedia credentials:
   ```env
   WIKI_USERNAME=your_wikipedia_username
   WIKI_PASSWORD=your_wikipedia_password
   ```

> ⚠️ **Important:** The `.env` file is included in `.gitignore` and will NOT be committed to Git. Never commit credentials to version control.

---

## ▶️ Running Tests

### Run Locally (Headless)

```bash
npm test
```

### Run Locally (Headed — with browser visible)

```bash
npm run test:headed
```

### Run in Debug Mode (Step-by-step with Playwright Inspector)

```bash
npm run test:debug
```

### Run in Docker

#### Option 1: Docker Compose (Recommended)

```bash
npm run docker:compose
# or directly:
docker compose up --build --abort-on-container-exit
```

#### Option 2: Docker CLI

```bash
# Build the image
npm run docker:build
# or: docker build -t wiki-lang-test .

# Run the tests
npm run docker:test
# or: docker run --env-file .env -v ./playwright-report:/app/playwright-report --shm-size=2g wiki-lang-test
```

---

## 📊 Test Reports

After test execution, an HTML report is generated in the `playwright-report/` directory.

### View the Report

```bash
# Open the HTML report in your default browser
npm run report
# or: npx playwright show-report
```

### Report Location

| Run Mode          | Report Location                                             |
|-------------------|-------------------------------------------------------------|
| **Local**         | `./playwright-report/index.html`                            |
| **Docker**        | `./playwright-report/index.html` (mounted from container)   |

> When running in Docker, the report is automatically copied to the host machine via the volume mount (`-v ./playwright-report:/app/playwright-report`). Simply open `playwright-report/index.html` in your browser after the container finishes.

---

## 🐳 Docker Details

The project uses the official [Playwright Docker image](https://playwright.dev/docs/docker) (`mcr.microsoft.com/playwright`) which comes with:
- Node.js
- All Playwright browsers pre-installed
- All required system dependencies for browser automation

Key Docker configuration:
- **`shm_size: 2gb`** — Chromium requires more than the default 64MB shared memory
- **Volume mount** — `./playwright-report:/app/playwright-report` ensures the HTML report persists on the host after the container exits
- **`--env-file .env`** — passes credentials to the container without baking them into the image

---

## 🔒 Security

- Credentials are stored in `.env` file (excluded from Git via `.gitignore`)
- The `.env.example` file provides a template without actual credentials
- Docker passes credentials via `--env-file` flag (not as build args)
- No sensitive data is baked into the Docker image

---

## 🧩 Architecture Decisions

### Page Object Pattern
Each Wikipedia page has a dedicated Page Object class (`LoginPage`, `PreferencesPage`, `MainPage`) that encapsulates all selectors and interactions. This provides:
- **Maintainability**: If Wikipedia's UI changes, only the Page Object needs updating
- **Readability**: Tests read like user stories, not DOM manipulation scripts
- **Reusability**: Page Objects can be shared across multiple tests

### Custom Fixtures
Playwright's fixture system is used to:
- Inject pre-configured Page Objects into tests
- Handle authentication as an opt-in fixture (`authenticatedPage`)
- Keep test files clean and focused on test logic

### Cleanup Step
The test restores the original language after verification to:
- Avoid polluting the shared Wikipedia account state
- Allow the test to be run repeatedly without manual intervention
- Follow the testing best practice of leaving the system in its original state
