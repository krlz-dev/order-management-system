# Order Management System

A full-stack order management system built with Java Spring Boot backend and React.js frontend, developed as part of a Senior Full-Stack Developer coding task.

## 🏗️ Project Architecture

This project implements a clean layered architecture following Domain-Driven Design (DDD) principles with clear separation of concerns:

```
order-management-system/
├── backend/                 # Java Spring Boot API
│   ├── src/main/java/
│   │   ├── domain/         # Domain entities, value objects
│   │   ├── application/    # Use cases, services
│   │   ├── infrastructure/ # Database, external services
│   │   └── presentation/   # REST controllers, DTOs
│   └── src/test/java/      # Unit and integration tests
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API communication
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript type definitions
│   └── public/
└── .github/workflows/      # CI/CD configuration
```

## 📋 Requirements Implementation

### Product Management
- ✅ Create, update, delete, and list products
- ✅ Product attributes: id (UUID), name, price, stock
- ✅ Input validation and error handling

### Order Management
- ✅ Orders contain multiple products with quantities
- ✅ Server-side total price calculation
- ✅ List orders with detailed views
- ✅ Order status tracking

### User Management (Simplified)
- ✅ Static demo users for testing
- ✅ User context for orders

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Architecture**: Layered (Onion/Hexagonal inspired)
- **Database**: H2 (in-memory) / SQLite for persistence
- **Documentation**: OpenAPI/Swagger UI
- **Testing**: JUnit 5, Mockito
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: React Context API / Redux Toolkit
- **HTTP Client**: Axios
- **UI Components**: Custom components with CSS Modules
- **Testing**: Jest, React Testing Library
- **Build Tool**: Vite

### DevOps & Tooling
- **Monorepo Management**: NX or Turborepo
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier, SonarQube
- **Package Manager**: npm/yarn

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# Application available at http://localhost:3000
```

### Full Stack with Turborepo/NX
```bash
# Install dependencies for both projects
npm install

# Run both backend and frontend concurrently
npm run dev

# Run tests for all projects
npm run test

# Build all projects
npm run build
```

## 📊 API Documentation

The REST API follows RESTful principles with proper HTTP status codes:

### Products API
- `GET /api/products` - List all products (with pagination)
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders API
- `GET /api/orders` - List all orders
- `GET /api/orders/{id}` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status` - Update order status

### Users API (Simplified)
- `GET /api/users` - List demo users
- `GET /api/users/{id}` - Get user details

Full API documentation available at `/swagger-ui.html` when running the backend.

## 🏛️ Architecture Decisions

### Backend Architecture
- **Layered Architecture**: Clear separation between domain, application, and infrastructure layers
- **Dependency Injection**: Spring's IoC container for loose coupling
- **DTOs**: Separate data transfer objects for API contracts
- **Repository Pattern**: Abstraction over data access layer
- **Service Layer**: Business logic encapsulation

### Frontend Architecture
- **Component-Based**: Modular, reusable React components
- **Feature-Based Structure**: Organized by business features
- **Custom Hooks**: Reusable stateful logic
- **Type Safety**: Full TypeScript implementation
- **API Layer**: Centralized HTTP client configuration

### Design Patterns Used
- **Repository Pattern**: Data access abstraction
- **Strategy Pattern**: Different calculation strategies
- **Factory Pattern**: Entity creation
- **Observer Pattern**: Event handling
- **MVC Pattern**: Clear separation of concerns

## 🤖 AI Usage Documentation

### AI Tools Utilized
This project was developed with assistance from AI coding agents, specifically:

- **Claude/ChatGPT**: Architecture design, code generation, documentation
- **GitHub Copilot**: Code completion and boilerplate generation
- **Cursor**: Refactoring and code optimization

### AI Assistance Areas
1. **Architecture Design**: Initial project structure and layer separation
2. **Boilerplate Code**: Entity classes, repository interfaces, basic CRUD operations
3. **Test Case Generation**: Unit test templates and test data creation
4. **API Documentation**: OpenAPI specification generation
5. **Frontend Components**: React component structure and TypeScript types
6. **Code Review**: Identifying potential improvements and best practices

### Manual Refinements
- **Business Logic**: Core domain rules implemented manually
- **Error Handling**: Custom exception handling and validation logic
- **Performance Optimization**: Database queries and frontend rendering optimization
- **Security**: Authentication/authorization logic (if implemented)
- **Integration**: Manual testing and bug fixes

### AI Tool Assessment
**Strengths:**
- Excellent for generating boilerplate and repetitive code
- Helpful for architecture suggestions and best practices
- Good at creating comprehensive test suites
- Useful for documentation generation

**Limitations:**
- Required manual review for business-specific logic
- Needed adjustments for project-specific requirements
- Generated code sometimes lacked context-specific optimizations
- Required human oversight for security-critical components

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Domain logic, services, repositories
- **Integration Tests**: API endpoints, database operations
- **Test Coverage**: Minimum 80% code coverage
- **Test Data**: Factory pattern for test object creation

### Frontend Testing
- **Component Tests**: Individual component behavior
- **Integration Tests**: API communication, user flows
- **E2E Tests**: Critical user journeys (optional)
- **Test Coverage**: Component and utility function coverage

## 🔄 CI/CD Pipeline

GitHub Actions workflow includes:
- **Code Quality**: Linting, formatting checks
- **Testing**: Unit and integration test execution
- **Build**: Compilation and bundling
- **Dependency Scanning**: Security vulnerability checks
- **Performance**: Bundle size analysis

## 📈 Future Enhancements

### Immediate Improvements
- [ ] User authentication and authorization
- [ ] Advanced search and filtering
- [ ] Order history and tracking
- [ ] Inventory management alerts

### Advanced Features
- [ ] Real-time notifications (WebSockets)
- [ ] Export functionality (PDF, Excel)
- [ ] Analytics dashboard
- [ ] Multi-tenant support

### Technical Improvements
- [ ] Caching layer (Redis)
- [ ] Message queue for async processing
- [ ] Database migrations
- [ ] Performance monitoring
- [ ] Containerization (Docker)

## 🤝 Development Guidelines

### Code Quality Standards
- Follow SOLID principles
- Maintain high test coverage
- Use meaningful naming conventions
- Document complex business logic
- Regular code reviews

### Contribution Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Run full test suite
4. Create pull request with description
5. Code review and merge

## 📞 Support

For questions or issues, please refer to:
- API documentation at `/swagger-ui.html`
- Frontend component storybook (if implemented)
- Project issue tracker

---

**Note**: This project was developed as part of a coding assessment demonstrating full-stack development capabilities, clean architecture principles, and effective use of modern AI development tools.