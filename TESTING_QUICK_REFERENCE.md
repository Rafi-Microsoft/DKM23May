# 🧪 Quick Testing Reference

## Quick Start

### Run All Tests
```powershell
.\Run-AllTests.ps1
```

### Run Backend Tests Only
```powershell
.\Run-BackendTests.ps1
# or
.\Run-AllTests.ps1 -BackendOnly
```

### Run Frontend Tests Only
```powershell
.\Run-FrontendTests.ps1
# or
.\Run-AllTests.ps1 -FrontendOnly
```

### Run Tests and View Coverage Reports
```powershell
.\Run-AllTests.ps1 -OpenReports
```

---

## 📊 Test Coverage Summary

### Backend (.NET) - **5 Test Files Created**

| Test Suite | Tests | Description |
|------------|-------|-------------|
| **ChatRequestValidatorTests** | 8 tests | Chat request validation rules |
| **PagingRequestValidatorTests** | 5 tests | Pagination parameter validation |
| **DataCacheManagerTests** | 7 tests | Keyword cache management |
| **DocumentsTests** | 7 tests | Document query service logic |
| **DocumentRepositoryTests** | 4 tests | MongoDB repository structure tests |

**Total: 31 unit tests**

### Frontend (React/TS) - **5 Test Files Created**

| Test Suite | Tests | Description |
|------------|-------|-------------|
| **httpClient.test.ts** | 25 tests | HTTP client wrapper (fetch, GET, POST, PUT, DELETE, PATCH, download) |
| **chatService.test.ts** | 12 tests | Chat API service integration |
| **documentsService.test.ts** | 10 tests | Document API service |
| **searchBox.test.tsx** | 9 tests | Search component UI |
| **usePagination.test.ts** | 13 tests | Pagination custom hook |

**Total: 69 unit tests**

**Grand Total: 100 unit tests created**

---

## 🎯 Coverage Goals

| Component | Current | Target | Priority |
|-----------|---------|--------|----------|
| Backend Validators | 67% | 100% | ✅ High |
| Backend Business Logic | 40% | 80% | 🔶 Medium |
| Backend Data Access | 50% | 70% | 🔶 Medium |
| Frontend API Services | 100% | 90% | ✅ Complete |
| Frontend Components | 5% | 70% | 🔴 High |
| Frontend Utils | 20% | 80% | 🔶 Medium |

---

## 🔧 Common Commands

### Backend (.NET)
```powershell
# Run specific test class
cd App\backend-api
dotnet test --filter "FullyQualifiedName~ChatRequestValidatorTests"

# Run with detailed output
dotnet test --verbosity detailed

# Run in Release mode
.\Run-BackendTests.ps1 -Configuration Release
```

### Frontend (React)
```powershell
# Run specific test file
cd App\frontend-app
npm test -- chatService.test.ts

# Run in watch mode (for development)
npm test -- --watch

# Update snapshots
npm test -- -u

# Run with coverage threshold
npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'
```

---

## 📁 Test File Locations

### Backend Tests
```
App/backend-api/Microsoft.GS.DPS.Tests/
├── API/UserInterface/
│   ├── DataCacheManagerTests.cs
│   └── DocumentsTests.cs
├── Model/
│   ├── ChatHost/ChatRequestValidatorTests.cs
│   └── UserInterface/PagingRequestValidatorTests.cs
└── Storage/Documents/
    └── DocumentRepositoryTests.cs
```

### Frontend Tests
```
App/frontend-app/src/
├── api/
│   ├── chatService.test.ts
│   └── documentsService.test.ts
├── components/
│   └── searchBox/searchBox.test.tsx
└── utils/
    ├── httpClient/httpClient.test.ts
    └── usePagination.test.ts
```

---

## 📈 Coverage Reports

### View Reports
```powershell
# Backend report
start App\backend-api\TestResults\coveragereport\index.html

# Frontend report
start App\frontend-app\coverage\lcov-report\index.html
```

### Coverage File Formats
- **Backend**: Cobertura XML + HTML
- **Frontend**: LCOV, HTML, Clover, Text

---

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run All Tests
        run: .\Run-AllTests.ps1
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./App/backend-api/TestResults/coverage.cobertura.xml,./App/frontend-app/coverage/lcov.info
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `dotnet: command not found`
```powershell
# Install .NET 8.0 SDK from: https://dotnet.microsoft.com/download
```

**Problem**: Tests fail to build
```powershell
# Restore packages
cd App\backend-api
dotnet restore
dotnet clean
dotnet build
```

### Frontend Issues

**Problem**: `npm: command not found`
```powershell
# Install Node.js from: https://nodejs.org/
```

**Problem**: Test failures with module imports
```powershell
# Clear cache and reinstall
cd App\frontend-app
rm -rf node_modules
npm install
npm test
```

**Problem**: `import.meta.env` errors
- Already configured in Jest setup
- Check `jest.config.ts` for environment definitions

---

## 📚 Next Steps

### Immediate (Week 1)
1. ✅ Run all existing tests: `.\Run-AllTests.ps1`
2. ⏳ Review coverage reports
3. ⏳ Add tests for ChatHost business logic
4. ⏳ Add tests for critical React components

### Short-term (Month 1)
1. Implement integration tests for MongoDB repositories
2. Add E2E tests for critical user flows
3. Set up automated test runs in CI/CD
4. Achieve 80% code coverage for backend

### Long-term (Quarter 1)
1. Achieve 75% code coverage for frontend
2. Implement contract testing between frontend/backend
3. Add performance tests for API endpoints
4. Set up automated visual regression testing

---

## 📞 Getting Help

- **Testing Guide**: See `TESTING_GUIDE.md` for detailed documentation
- **Test Examples**: Review existing test files for patterns
- **Framework Docs**:
  - [xUnit](https://xunit.net/)
  - [Jest](https://jestjs.io/)
  - [React Testing Library](https://testing-library.com/react)

---

**Last Updated**: March 26, 2026
**Test Suite Version**: 1.0.0
