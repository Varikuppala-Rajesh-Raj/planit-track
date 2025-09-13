# Subscription Management System

A complete full-stack subscription management system built with React, Node.js, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Run with Docker
```bash
# Clone and start all services
docker compose up --build

# The application will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
# Database: postgresql://postgres:password@localhost:5432/subscription_db
```

### Local Development Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your settings

# Database setup
npx prisma migrate dev --name init
npx prisma generate
npm run seed

# Start development server
npm run dev
```

#### Frontend
```bash
# Already running in Lovable - this is for local setup
npm install
npm run dev
```

## 📊 Import Dataset

To import the subscription dataset:

```bash
cd backend
npm run import-dataset
```

This reads `/mnt/data/SubscriptionUseCase_Dataset.xlsx` and populates the database.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Auth**: HTTP-only cookie authentication
- **State**: React Context for user state
- **API**: Axios with automatic cookie handling
- **UI**: Tailwind CSS + shadcn/ui components

### Backend (Node.js + Express + TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT tokens in HTTP-only cookies
- **Security**: Helmet, CORS, input validation
- **Logging**: Winston with structured logs

## 🔐 Authentication

- JWT tokens stored in HTTP-only cookies
- No localStorage usage anywhere
- Automatic token validation on protected routes
- Role-based access control (USER/ADMIN)

## 📱 API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Plans
- `GET /api/plans` - List all plans
- `GET /api/plans/:id` - Get plan details
- `POST /api/plans` - Create plan (admin)
- `PUT /api/plans/:id` - Update plan (admin)
- `DELETE /api/plans/:id` - Delete plan (admin)

### Subscriptions
- `GET /api/subscriptions` - User's subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription
- `POST /api/subscriptions/:id/renew` - Renew subscription

### Admin
- `GET /api/admin/analytics` - System analytics
- `GET /api/admin/audit-logs` - Audit trail

## 🗄️ Database Schema

- **Users**: Authentication and profile data
- **Plans**: Subscription plan definitions
- **Subscriptions**: User subscription records
- **AuditLogs**: Complete audit trail
- **UsageRecords**: Usage tracking metrics
- **Discounts**: Promotional codes and discounts

## ⚡ TODO: Implementation Tasks

### Payment Integration
- [ ] Integrate Stripe/PayPal payment processing
- [ ] Handle payment failures and retries
- [ ] Implement refund processing
- [ ] Add payment method management

### Business Logic
- [ ] Implement upgrade/downgrade pricing logic
- [ ] Add prorated billing calculations
- [ ] Create usage-based billing
- [ ] Build recommendation engine

### Notifications
- [ ] Email service integration
- [ ] SMS notifications
- [ ] In-app notification system
- [ ] Webhook endpoints for external integrations

### Advanced Features
- [ ] Usage quota enforcement
- [ ] Advanced analytics and reporting
- [ ] A/B testing framework
- [ ] Customer support ticketing

### Security & Performance
- [ ] Rate limiting
- [ ] Redis caching layer
- [ ] Database connection pooling
- [ ] API versioning

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
npm test
```

## 📦 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/subscription_db"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="http://localhost:5173"
DATASET_PATH="/mnt/data/SubscriptionUseCase_Dataset.xlsx"
```

## 👥 Default Users

After seeding:
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.