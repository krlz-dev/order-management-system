# Order Management System

A full-stack order management application built with modern technologies, featuring a React.js frontend and Java backend with clean architecture principles.

## 🏗️ Architecture Overview

This application follows a **Hexagonal Architecture** pattern with clean separation of concerns:

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

### Backend (Spring Boot)
Clean architecture with:

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic implementation
- **Repositories**: Data access abstraction
- **Entities**: Domain models

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

1. **Hexagonal Architecture**: Ensures clean separation of concerns and testability
2. **Zustand over Redux**: Simpler state management with less boilerplate
3. **Java 21**: Modern Java features like pattern matching and virtual threads
4. **In-Memory Database**: H2 for quick setup and development
5. **TypeScript**: Type safety across frontend and shared types
6. **Server-Side Calculation**: Total prices calculated on backend for security
7. **UUID Identifiers**: Better for distributed systems and security

## 🚀 Deployment Considerations

### Production Enhancements
- Replace H2 with PostgreSQL/MySQL
- Add authentication and authorization
- Implement caching (Redis)
- Add monitoring and logging
- Container deployment (Docker)
- CI/CD pipeline setup

## 🤖 AI Assistance Usage

This project was developed with AI coding assistance for:

- **Code Generation**: Boilerplate code for CRUD operations
- **Architecture Decisions**: Hexagonal architecture implementation
- **API Design**: RESTful endpoint structure and OpenAPI documentation
- **Frontend Components**: React component structure and Zustand integration
- **Testing**: Unit test case generation and sample data creation

### Reflections on AI Usage
- **Strengths**: Rapid prototyping and boilerplate generation
- **Manual Adjustments**: Business logic refinement and architecture decisions
- **Code Review**: All AI-generated code was reviewed and refactored for maintainability

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