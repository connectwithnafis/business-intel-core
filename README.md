## 🧠 Business-Intel-Core

### Enterprise-Grade Reporting Engine Boilerplate (NestJS + Clean Architecture + PostgreSQL)

---

### 🚀 Overview

**Business-Intel-Core** is a modular, scalable boilerplate built with **NestJS**, following **Clean Architecture** principles to ensure long-term maintainability, testability, and enterprise-level extensibility.

This project is designed as a **Reporting Engine Core**, the foundation for advanced **Business Intelligence (BI)** solutions. Future plans include seamless **Power BI integration**, advanced data visualization pipelines, and distributed report serving capabilities.

---

### 🧩 Architecture

The system is structured following **Clean Architecture** and **Domain-Driven Design (DDD)** concepts.

```
├── src/
│   ├── api/                     # API Layer (HTTP Controllers & DTOs)
│   │   ├── controllers/
│   │   │   └── *.controller.ts  # HTTP endpoints (auth, profile, hello)
│   │   ├── dto/
│   │   │   ├── auth/            # Authentication DTOs
│   │   │   │   └── *.dto.ts     # Login & register DTOs
│   │   │   └── *.dto.ts         # Profile management DTOs
│   │   └── api.module.ts        # API module configuration
│   ├── application/             # Application Layer (Business Orchestration)
│   │   ├── __test__/
│   │   │   └── *.spec.ts        # Application layer tests
│   │   ├── auth/
│   │   │   ├── command/         # Auth commands & handlers
│   │   │   │   ├── *.command.ts # Create/delete auth user commands
│   │   │   │   └── handler/
│   │   │   │       └── *.handler.ts # Command handlers
│   │   │   ├── events/          # Auth domain events
│   │   │   │   └── *.event.ts   # User created/deleted events
│   │   │   ├── sagas/
│   │   │   │   └── *.saga.ts    # Registration flow orchestration
│   │   │   ├── decorators/
│   │   │   │   └── *.decorator.ts # Custom decorators (roles)
│   │   │   ├── guards/
│   │   │   │   └── *.guard.ts   # Authentication & authorization guards
│   │   │   ├── *.strategy.ts    # Auth strategies (JWT, local, Google OAuth)
│   │   │   └── auth.module.ts   # Auth module configuration
│   │   ├── decorators/
│   │   │   └── *.decorator.ts   # Global decorators (current user)
│   │   ├── interfaces/
│   │   │   └── *.interface.ts   # Application interfaces
│   │   ├── interceptors/
│   │   │   └── *.interceptor.ts # Request logging interceptors
│   │   ├── middlewere/
│   │   │   └── *.middleware.ts  # HTTP middleware (logging)
│   │   ├── services/
│   │   │   └── *.service.ts     # Application services (auth, profile, logger)
│   │   ├── profile/
│   │   │   ├── command/         # Profile commands & handlers
│   │   │   │   ├── *.command.ts # Profile commands
│   │   │   │   └── handler/
│   │   │   │       └── *.handler.ts # Command handlers
│   │   │   ├── events/          # Profile domain events
│   │   │   │   └── *.event.ts   # Profile events
│   │   │   └── profile.module.ts # Profile module configuration
│   │   └── application.module.ts # Application module aggregator
│   ├── domain/                  # Domain Layer (Pure Business Logic)
│   │   ├── __test__/
│   │   │   └── *.spec.ts        # Domain layer tests
│   │   ├── aggregates/          # Domain aggregates
│   │   ├── entities/
│   │   │   ├── *.ts             # Pure domain entities (Auth, Profile)
│   │   │   └── enums/           # Domain enums
│   │   │       └── *.enum.ts    # Role enums, etc.
│   │   ├── interfaces/
│   │   │   └── repositories/    # Repository contracts defined by domain
│   │   │       └── *.interface.ts # Repository interfaces
│   │   └── services/
│   │       └── *.service.ts     # Pure business logic services
│   ├── infrastructure/          # Infrastructure Layer (External Concerns)
│   │   ├── database/
│   │   │   ├── database.module.ts    # Database configuration
│   │   │   └── database.providers.ts # Database providers
│   │   ├── health/
│   │   │   └── *.check.ts       # Health check configurations
│   │   ├── logger/
│   │   │   └── logger.module.ts # Global logger module
│   │   ├── entities/
│   │   │   ├── *.entity.ts      # PostgreSQL entities (auth, profile)
│   │   │   └── index.ts         # Entity exports
│   │   └── repository/
│   │       └── *.repository.ts  # Repository implementations
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts           # Root application module
│   └── constants.ts            # Application constants
├── test/
│   ├── *.e2e-spec.ts           # End-to-end tests
│   ├── jest-e2e.json           # E2E test configuration
│   └── setup-e2e.ts            # E2E test setup
├── docker-compose*.yml         # Docker Compose configurations (dev, prod)
└── Dockerfile                  # Container definition
```

Each layer is **independent** and **loosely coupled**.
The **application** layer depends only on **domain**, while **infrastructure** and **presentation** plug in as adapters.

---

### ⚙️ Tech Stack

| Component             | Technology                        |
| --------------------- | --------------------------------- |
| **Framework**         | [NestJS](https://nestjs.com/)     |
| **Database**          | PostgreSQL                        |
| **ORM / Query Layer** | TypeORM                           |
| **Architecture**      | Clean Architecture + DDD          |
| **Language**          | TypeScript                        |
| **Logger**            | Built-in NestJS Logger / Winston  |
| **Environment**       | dotenv / config module            |
| **Testing**           | Jest                              |
| **Documentation**     | Swagger (auto-generated API docs) |

---

### 🏗️ Key Features

* 🧱 **Clean Architecture Template** — decoupled and modular structure
* 🔐 **Enterprise Security** — environment-based configuration and validation
* 📊 **BI-Ready Core** — designed for report generation, aggregation, and analytics
* ⚡ **Scalable Modules** — easy to extend for new data sources or reports
* 🧩 **PostgreSQL Integration** — strong transactional consistency
* 🧾 **Swagger Docs** — auto-generated REST API documentation
* 🔁 **Future-Proof** — foundation for Power BI, dashboards, and data pipelines

---

### 📦 Setup & Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-org>/business-intel-core.git
cd business-intel-core
```

#### 2️⃣ Install Dependencies

```bash
npm install
```

#### 3️⃣ Configure Environment

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=db_port
DB_USER=db_user
DB_PASS=db_password
DB_NAME=database_name

JWT_SECRET=your_jwt_secret_here_change_me
JWT_EXPIRES_IN=3600s

NODE_ENV=development
PORT=3000
```

#### 4️⃣ Run the Application

```bash
npm run start:dev
```

Visit:

* **API Docs:** [http://localhost:3000/api](http://localhost:3000/api)

---

### 🧪 Testing

```bash
npm run test
```

---

### 🧱 Project Modules (Current & Planned)

| Module                 | Description                           | Status      |
| ---------------------- | ------------------------------------- | ----------- |
| **Core**               | Domain entities & base use-cases      | ✅           |
| **Reports**            | Report generation engine              | 🚧          |
| **DataSource**         | Database / ETL integrations           | 🧩          |
| **Power BI Connector** | Microsoft BI embedding & dataset sync | 🗓️ Planned |
| **Auth & RBAC**        | Role-based user permissions           | 🧩          |
| **Scheduler**          | Report automation & background jobs   | 🗓️ Planned |

---

### 🧭 Design Principles

* **Independent of Frameworks** — NestJS is replaceable
* **Independent of UI/DB** — domain logic is persistent-agnostic
* **Testable Core** — business rules can be unit tested without dependencies
* **Separation of Concerns** — each layer focuses on one responsibility

---

### 📈 Future Roadmap

* [ ] Power BI REST API integration
* [ ] Configurable Report Templates
* [ ] Multi-Tenant Data Layer
* [ ] Event-Driven Report Triggers
* [ ] Role-Based Report Access
* [ ] Logging & Telemetry with ELK Stack

---

### 🧑‍💻 Contributing

Contributions, issues, and feature requests are welcome!
Please open a pull request or issue for discussions.

---

### 🪪 License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---
