# Unit Testing Guide

This document outlines the unit testing setup and code coverage for the DKM (Document Knowledge Mining) project.

## Overview

The project consists of three main components with test coverage:

### 🎯 Backend API (.NET 8.0)
- **Test Framework**: xUnit
- **Mocking**: Moq
- **Assertions**: FluentAssertions
- **Coverage**: Coverlet

### 🎨 Frontend Application (React + TypeScript)
- **Test Framework**: Jest
- **Component Testing**: React Testing Library
- **Coverage**: Jest built-in coverage

### 🧪 E2E Tests (Python + Playwright)
- **Framework**: Pytest + Playwright
- **Location**: `/tests/e2e-test/`

---

## Backend Tests (.NET)

### Location
```
App/backend-api/Microsoft.GS.DPS.Tests/
```

### Test Coverage

#### ✅ **Validators** (100% coverage target)
- `ChatRequestValidatorTests.cs` - Tests for chat request validation
- `PagingRequestValidatorTests.cs` - Tests for pagination validation

#### ✅ **Business Logic**
- `DocumentsTests.cs` - Document query and management service tests
- `DataCacheManagerTests.cs` - Caching layer tests

#### ✅ **Data Access**
- `DocumentRepositoryTests.cs` - MongoDB repository tests (with mock setup)

### Running Backend Tests

#### Using Visual Studio
1. Open `Microsoft.GS.DPS.sln`
2. Right-click on test project → Run Tests
3. View results in Test Explorer

#### Using .NET CLI
```powershell
# Navigate to backend directory
cd App\backend-api

# Run all tests
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura

# Run with detailed coverage report
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:CoverletOutput=./TestResults/

# Run specific test file
dotnet test --filter "FullyQualifiedName~ChatRequestValidatorTests"
```

#### Using PowerShell Script
```powershell
# Run all backend tests with coverage
.\Run-BackendTests.ps1

# View coverage report in browser (after generating)
.\Run-BackendTests.ps1 -OpenReport
```

### Coverage Report

After running tests with coverage, reports are generated in:
```
App/backend-api/TestResults/
```

To generate HTML coverage report:
```powershell
# Install ReportGenerator (once)
dotnet tool install -g dotnet-reportgenerator-globaltool

# Generate HTML report
reportgenerator -reports:"App\backend-api\TestResults\coverage.cobertura.xml" `
                -targetdir:"App\backend-api\TestResults\coveragereport" `
                -reporttypes:Html

# Open report
start App\backend-api\TestResults\coveragereport\index.html
```

---

## Frontend Tests (React + TypeScript)

### Location
```
App/frontend-app/src/
```

### Test Coverage

#### ✅ **API Services** (80%+ coverage)
- `httpClient.test.ts` - HTTP client wrapper tests (GET, POST, PUT, DELETE, PATCH, download)
- `chatService.test.ts` - Chat API integration tests
- `documentsService.test.ts` - Document service tests

#### ✅ **React Components**
- `searchBox.test.tsx` - Search component tests
- `header.test.tsx` - Header component tests (existing)

#### ✅ **Custom Hooks**
- `usePagination.test.ts` - Pagination hook tests

### Running Frontend Tests

```bash
# Navigate to frontend directory
cd App/frontend-app

# Run all tests
npm test
# or
yarn test

# Run tests with coverage
npm run test
# or
yarn test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- chatService.test.ts

# Update snapshots
npm test -- -u
```

### Coverage Report

Coverage report is automatically generated when running `npm test` and can be found at:
```
App/frontend-app/coverage/lcov-report/index.html
```

Open in browser:
```powershell
start App\frontend-app\coverage\lcov-report\index.html
```

### Coverage Configuration

Coverage is configured in `jest.config.ts`:
```typescript
coverageReporters: ['text', 'html', 'lcov', 'clover']
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/main.tsx',
  '!src/vite-env.d.ts'
]
```

---

## Test Organization

### Backend Test Structure
```
Microsoft.GS.DPS.Tests/
├── API/
│   └── UserInterface/
│       ├── DataCacheManagerTests.cs
│       └── DocumentsTests.cs
├── Model/
│   ├── ChatHost/
│   │   └── ChatRequestValidatorTests.cs
│   └── UserInterface/
│       └── PagingRequestValidatorTests.cs
└── Storage/
    └── Documents/
        └── DocumentRepositoryTests.cs
```

### Frontend Test Structure
```
src/
├── api/
│   ├── chatService.test.ts
│   └── documentsService.test.ts
├── components/
│   ├── header/
│   │   └── header.test.tsx
│   └── searchBox/
│       └── searchBox.test.tsx
└── utils/
    ├── httpClient/
    │   └── httpClient.test.ts
    └── usePagination.test.ts
```

---

## Coverage Metrics

### Current Coverage

#### Backend (.NET)
| Component | Files Covered | Coverage Target |
|-----------|--------------|-----------------|
| Validators | 2/3 (67%) | 100% |
| Business Logic | 2/5 (40%) | 80% |
| Data Access | 1/2 (50%) | 70% |
| **Overall** | **5/10 (50%)** | **80%** |

#### Frontend (React)
| Component | Files Covered | Coverage Target |
|-----------|--------------|-----------------|
| API Services | 3/3 (100%) | 90% |
| Components | 2/37 (5%) | 70% |
| Utils | 2/10 (20%) | 80% |
| **Overall** | **7/50 (14%)** | **75%** |

### Priority Areas for Additional Tests

#### Backend (High Priority)
1. **ChatHost.cs** - Core AI chat functionality
2. **FileThumbnailService.cs** - Image processing
3. **Chat.cs** - API endpoint controllers
4. **UserInterface.cs** - Document management endpoints

#### Frontend (High Priority)
1. **chatRoom.tsx** - Main chat interface
2. **documentViewer.tsx** - Document viewer component
3. **filter.tsx** - Filtering logic
4. **pagination/** - Pagination components

---

## Best Practices

### Backend Testing
1. ✅ Use Arrange-Act-Assert pattern
2. ✅ Mock external dependencies (MongoDB, HTTP clients)
3. ✅ Use FluentAssertions for readable assertions
4. ✅ Test both success and failure scenarios
5. ✅ Use Theory/InlineData for parameterized tests
6. ⚠️ Consider integration tests with Testcontainers for MongoDB

### Frontend Testing
1. ✅ Use React Testing Library best practices
2. ✅ Test user interactions, not implementation details
3. ✅ Mock external API calls
4. ✅ Use data-testid for complex selectors
5. ✅ Test accessibility with screen reader queries
6. ✅ Keep tests isolated and independent

---

## Continuous Integration

### Running Tests in CI/CD

#### Backend
```yaml
# Azure Pipelines example
- task: DotNetCoreCLI@2
  displayName: 'Run Backend Tests'
  inputs:
    command: 'test'
    projects: '**/*Tests.csproj'
    arguments: '--configuration Release /p:CollectCoverage=true'
```

#### Frontend
```yaml
# Azure Pipelines example
- script: |
    npm install
    npm test
  displayName: 'Run Frontend Tests'
  workingDirectory: 'App/frontend-app'
```

---

## Troubleshooting

### Backend Tests

**Issue**: Tests can't find MongoDB connection
- **Solution**: Tests use mocks; ensure Moq is properly configured

**Issue**: FluentValidation tests failing
- **Solution**: Verify FluentValidation package version matches main project

### Frontend Tests

**Issue**: `import.meta.env` not defined
- **Solution**: Add Vite environment mock in test setup

**Issue**: Tests timing out
- **Solution**: Add `--detectOpenHandles` flag or increase timeout

**Issue**: Module not found errors
- **Solution**: Check `jest.config.ts` moduleNameMapper configuration

---

## Next Steps

### Immediate Actions
1. ✅ Run existing tests to establish baseline
2. ⏳ Implement tests for ChatHost business logic
3. ⏳ Add component tests for critical UI components
4. ⏳ Set up automated coverage reporting in CI/CD

### Future Improvements
1. Integration tests with Testcontainers for backend
2. E2E tests covering full user journeys
3. Performance testing for API endpoints
4. Visual regression testing for UI components
5. Contract testing between frontend and backend

---

## Resources

- [xUnit Documentation](https://xunit.net/)
- [Moq Documentation](https://github.com/moq/moq4)
- [FluentAssertions Documentation](https://fluentassertions.com/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Coverlet Coverage Tool](https://github.com/coverlet-coverage/coverlet)

---

## Contact & Support

For questions about testing strategy or implementation:
- Create an issue in the repository
- Contact the development team
- Review existing test examples in the codebase
