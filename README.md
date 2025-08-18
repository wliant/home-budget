# Home Budget App

A comprehensive web application for managing personal and household budgets, built with modern web technologies including React, TypeScript, and Spring Boot.

## 🚀 Features

- **Expense Tracking**: Record and categorize daily expenses with detailed information
- **Budget Management**: Set and monitor budgets for different categories and time periods
- **Category Organization**: Hierarchical category system for better expense organization
- **Recurring Expenses**: Support for recurring transactions with various frequencies
- **Visual Reports**: Interactive charts and graphs for expense analysis
- **Multiple Payment Methods**: Track expenses across different payment methods
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Instant updates and notifications for budget status

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - React component library for faster development
- **Vite** - Next generation frontend tooling
- **Axios** - HTTP client for API communication
- **Recharts** - Charting library for data visualization
- **Date-fns** - Modern JavaScript date utility library

### Backend
- **Java 17** - Programming language
- **Spring Boot 3** - Application framework
- **Spring Data JPA** - Data persistence layer
- **H2 Database** - In-memory database for development
- **PostgreSQL** - Production database (configurable)
- **Gradle** - Build automation tool

### Testing
- **Frontend Testing**:
  - Vitest - Fast unit test framework
  - React Testing Library - Testing utilities for React components
  - @testing-library/user-event - User interaction simulation
- **Backend Testing**:
  - JUnit 5 - Unit testing framework
  - Mockito - Mocking framework
  - Spring Boot Test - Integration testing

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Java JDK** (17 or higher)
- **Gradle** (7.0 or higher)
- **Docker** (optional, for containerized development)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/wliant/home-budget.git
cd home-budget
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd addon-app

# Build the application
./gradlew build

# Run the application
./gradlew bootRun
```

The backend server will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd web

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`

### 4. Database Setup (Optional)

For development, the application uses an in-memory H2 database by default. For production or persistent storage:

```bash
# Using Docker Compose for PostgreSQL
cd dev-infra
docker-compose up -d
```

## 🧪 Running Tests

### Frontend Tests

```bash
cd web

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Backend Tests

```bash
cd addon-app

# Run all tests
./gradlew test

# Run tests with coverage report
./gradlew test jacocoTestReport
```

## 📦 Building for Production

### Frontend Build

```bash
cd web
npm run build
```

The production-ready files will be in the `web/dist` directory.

### Backend Build

```bash
cd addon-app
./gradlew build
```

The JAR file will be generated in `addon-app/build/libs/`

### Docker Build (Optional)

```bash
# Build Docker images
docker build -t home-budget-backend ./addon-app
docker build -t home-budget-frontend ./web

# Run with Docker Compose
docker-compose up
```

## 📁 Project Structure

```
home-budget/
├── addon-app/                 # Backend Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/         # Java source files
│   │   │   └── resources/    # Application properties
│   │   └── test/             # Test files
│   └── build.gradle          # Gradle build configuration
├── web/                      # Frontend React application
│   ├── src/
│   │   ├── api/             # API integration
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── theme/           # Theme configuration
│   │   └── utils/           # Utility functions
│   ├── package.json         # NPM dependencies
│   └── vite.config.ts       # Vite configuration
├── dev-infra/               # Development infrastructure
│   └── docker-compose.yml   # Docker compose configuration
└── README.md               # Project documentation
```

## 🔑 API Endpoints

### Expenses
- `GET /api/expenses/user/{userId}` - Get all expenses for a user
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/{id}` - Update an expense
- `DELETE /api/expenses/{id}` - Delete an expense
- `GET /api/expenses/user/{userId}/monthly` - Get monthly expenses
- `GET /api/expenses/user/{userId}/monthly-summary` - Get monthly summary

### Categories
- `GET /api/categories/user/{userId}` - Get all categories for a user
- `POST /api/categories` - Create a new category
- `PUT /api/categories/{id}` - Update a category
- `DELETE /api/categories/{id}` - Delete a category

### Budgets
- `GET /api/budgets/user/{userId}` - Get all budgets for a user
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/{id}` - Update a budget
- `DELETE /api/budgets/{id}` - Delete a budget
- `GET /api/budgets/{id}/status` - Get budget status

## 🔐 Environment Variables

### Backend (.env or application.properties)
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/homebudget
spring.datasource.username=your_username
spring.datasource.password=your_password

# Server Configuration
server.port=8080
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=Home Budget App
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of Conduct
- Development workflow
- Submitting pull requests
- Reporting issues

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work - [wliant](https://github.com/wliant)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Material-UI team for the excellent component library
- Spring Boot team for the robust backend framework

## 📞 Support

For support, please:
1. Check the [documentation](docs/)
2. Search through [existing issues](https://github.com/wliant/home-budget/issues)
3. Create a new issue if needed

## 🚦 Project Status

This project is actively maintained and in continuous development. Check the [project board](https://github.com/wliant/home-budget/projects) for upcoming features and improvements.

---

Made with ❤️ by the Home Budget Team
