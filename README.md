# Order Management System

A full-stack order management application built with modern technologies, featuring a React.js frontend and Java backend with clean architecture principles.

## 🏗️ Architecture Overview

This application uses **Hexagonal Architecture** in the backend with a traditional React architecture in the frontend:

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React.js)    │◄──►│   (Java 21)     │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │    │ │   REST API  │ │
│ │   Pages     │ │    │ │  (Spring)   │ │
│ │   Zustand   │ │    │ └─────────────┘ │
│ └─────────────┘ │    │ ┌─────────────┐ │
│                 │    │ │  Business   │ │
│                 │    │ │   Logic     │ │
│                 │    │ └─────────────┘ │
│                 │    │ ┌─────────────┐ │
│                 │    │ │ Data Layer  │ │
│                 │    │ │ (In-Memory) │ │
│                 │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React.js 18+** with functional components and hooks
- **Zustand** for state management
- **TypeScript** for type safety
- **Vite** for fast development and build
- **Axios** for HTTP client communication
- **React Router** for navigation
- **Tailwind CSS** for styling

### Backend
- **Java 21** (managed via SDKMAN)
- **Spring Boot 3.x** with modern Java features
- **Spring Web** for REST API
- **Spring Data JPA** for data persistence
- **H2 Database** for in-memory storage
- **OpenAPI 3** with Swagger UI for API documentation
- **Maven** for dependency management

### Development Tools
- **SDKMAN** for Java version management
- **Node.js 18+** and **npm/yarn** for frontend tooling
- **Git** for version control

## 📋 Features

### Product Management
- ✅ Create, read, update, delete products
- ✅ Product attributes: ID (UUID), name, price, stock
- ✅ Input validation and error handling

### Order Management
- ✅ Create orders with multiple products
- ✅ Automatic total price calculation (server-side)
- ✅ Order listing and detailed views
- ✅ Stock validation during order creation

### User Management (Simplified)
- ✅ Fixed demo users for testing
- ✅ No authentication required per specifications

## 🚀 Getting Started

### Prerequisites

1. **Java 21** (install via SDKMAN):
   ```bash
   # Install SDKMAN if not already installed
   curl -s "https://get.sdkman.io" | bash
   
   # Install and use Java 21
   sdk install java 21.0.1-oracle
   sdk use java 21.0.1-oracle
   ```

2. **Node.js 18+**:
   ```bash
   # Check version
   node --version
   npm --version
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies and run:
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

3. The backend will be available at: `http://localhost:8080`

4. API documentation: `http://localhost:8080/swagger-ui.html`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. The frontend will be available at: `http://localhost:5173`

## 📡 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create new order

### Sample API Usage

#### Create Product
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "stock": 10
  }'
```

#### Create Order
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "items": [
      {
        "productId": "product-uuid",
        "quantity": 2
      }
    ]
  }'
```

## 🗂️ Project Structure

```
.
├── README.md
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── stores/           # Zustand stores
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── backend/
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   └── com/inform/orders/
    │   │   │       ├── api/          # REST controllers
    │   │   │       ├── application/  # Business logic/services
    │   │   │       ├── domain/       # Domain entities and repositories
    │   │   │       └── infrastructure/ # Data access implementation
    │   │   └── resources/
    │   └── test/
    ├── pom.xml
    └── target/
```

## 🔄 State Management

### Frontend (Zustand)
The application uses Zustand for efficient state management:

- **ProductStore**: Manages product CRUD operations
- **OrderStore**: Handles order creation and listing
- **UIStore**: Controls loading states and notifications

### Backend (Hexagonal Architecture)
Implements hexagonal architecture principles with:

- **Controllers** (Adapters): Handle HTTP requests/responses (outer layer)
- **Services** (Application): Business logic implementation (application layer)
- **Entities** (Domain): Core domain models and business rules
- **Repositories** (Ports): Data access abstraction interfaces
- **Repository Implementations**: Concrete data access adapters (infrastructure layer)

## 🧪 Testing

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
cd frontend
npm test
# or
yarn test
```

## 🔧 Development Commands

### Backend
- `./mvnw clean` - Clean build artifacts
- `./mvnw compile` - Compile source code
- `./mvnw test` - Run unit tests
- `./mvnw spring-boot:run` - Start development server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🎯 Key Design Decisions

1. **Hexagonal Architecture (Backend Only)**: Clean separation of concerns and testability in the Java backend
2. **Traditional React Architecture (Frontend)**: Component-based architecture with Zustand for state management
3. **Zustand over Redux**: Simpler state management with less boilerplate for frontend
4. **Java 21**: Modern Java features like pattern matching and virtual threads
5. **In-Memory Database**: H2 for quick setup and development
6. **TypeScript**: Type safety across frontend and shared types
7. **Server-Side Calculation**: Total prices calculated on backend for security
8. **UUID Identifiers**: Better for distributed systems and security

## 🚀 Deployment Considerations

### Production Enhancements
- Replace H2 with PostgreSQL/MySQL
- Add authentication and authorization
- Implement caching (Redis)
- Add monitoring and logging
- Container deployment (Docker)
- CI/CD pipeline setup

## 🤖 Note on AI Usage

### Documentation of AI Agent Usage

This project was developed with significant support from **Claude CLI**, Anthropic's AI-powered coding assistant. The AI agent was used strategically across different phases of development:

#### Areas Where Claude CLI Provided Support:

1. **Project Structure & Setup**
   - Generated initial project scaffolding for both frontend (React/Vite) and backend (Spring Boot)
   - Configured build tools and dependency management (Maven, npm)
   - Set up TypeScript configurations and ESLint rules

2. **Backend Development**
   - Generated boilerplate code for REST controllers and service classes
   - Implemented hexagonal architecture patterns with clean layer separation
   - Created JPA entities and repository interfaces following domain-driven design
   - Generated OpenAPI/Swagger documentation configuration

3. **Frontend Development**
   - Created React component structure and TypeScript interfaces
   - Implemented Zustand stores for state management
   - Generated API service layer with Axios integration
   - Built responsive UI components with Tailwind CSS

4. **Testing & Quality Assurance**
   - Generated unit test templates and sample test data
   - Created API integration tests and validation scenarios
   - Implemented error handling patterns across the application

### Quality Assessment & Reliability

**Strengths of AI Assistance:**
- ✅ Excellent for generating consistent, well-structured boilerplate code
- ✅ Reliable for implementing established patterns (REST APIs, React components)
- ✅ Strong support for configuration files and build tool setup
- ✅ Effective at maintaining coding standards and consistent naming conventions
- ✅ Helpful for generating comprehensive documentation and API specifications

**Limitations and Weaknesses:**
- ⚠️ Required manual review for business logic implementation details
- ⚠️ Needed human oversight for architectural decisions and technology choices
- ⚠️ Sometimes generated overly complex solutions that required simplification
- ⚠️ Required validation of best practices for security and performance considerations

### Manual Adjustments and Corrections

**Critical Human Interventions:**
1. **Architecture Decisions**: Final choice of hexagonal architecture, technology stack selection, and overall system design were human-driven decisions
2. **Business Logic**: Order calculation logic, stock validation, and data integrity rules were manually implemented and validated
3. **Error Handling**: Custom exception handling and validation logic were refined beyond AI suggestions
4. **Security Considerations**: Manual review and implementation of input validation and data sanitization
5. **Performance Optimizations**: Database query optimization and frontend state management efficiency improvements
6. **Code Refactoring**: Simplified AI-generated code to improve maintainability and readability

### Independence and Maintainability

**Human-Centric Approach:**
- 🎯 **Framework Selection**: All major technology choices (Spring Boot, React, Zustand, H2) were made by the human developer
- 🎯 **Design Patterns**: Implementation of hexagonal architecture (backend) and React patterns (frontend) were human-guided
- 🎯 **Code Organization**: Final project structure and module organization reflect human architectural vision
- 🎯 **Documentation**: This README and all technical documentation represent human understanding and explanation

**Maintainability Assurance:**
- All code follows established conventions and is fully documented
- No AI-specific dependencies or patterns that would hinder future development
- Clear separation between AI-assisted implementation and human-driven design
- Complete test coverage ensures reliability independent of how code was generated

### Responsible AI Usage

**Critical and Sensible Application:**
- AI was used as a productivity tool, not as a decision-maker for architecture or business logic
- All AI-generated code underwent thorough human review and testing
- Manual validation ensured compliance with security best practices
- Human expertise guided the overall solution design and implementation strategy

**Risk Recognition:**
- Acknowledged that AI-generated code requires validation for security vulnerabilities
- Recognized the need for human oversight in complex business logic implementation
- Understood limitations in AI's ability to make context-aware architectural decisions
- Maintained human responsibility for final code quality and system reliability

The final solution remains **completely understandable, maintainable, and extensible by any developer**, regardless of AI assistance used during development. The AI served as an advanced code generation tool, while all critical decisions, architecture, and business logic remain under human control and understanding.

## 📈 Future Enhancements

- [ ] Pagination for product and order lists
- [ ] Advanced search and filtering
- [ ] Real-time order status updates
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile-responsive design improvements
- [ ] Integration tests and E2E testing

## 📞 Contact

**INFORM GmbH Software Development**  
Contact: benjamin.schleinzer@inform-software.com

---

**Time Investment**: ~6-8 hours development time (as per exercise requirements)