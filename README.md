# TradeConnect - B2B Marketplace

A full-stack B2B marketplace web application built for learning purposes. Connect buyers with verified sellers across industries.

## 🏗️ Architecture

```
b2b-marketplace/
├── backend/                    # Node.js + Express API
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Route handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── inquiryController.js
│   │   ├── categoryController.js
│   │   ├── adminController.js
│   │   └── sellerController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT auth + role-based access
│   │   └── upload.js          # Multer file upload
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   └── Inquiry.js
│   ├── routes/                # Express route definitions
│   ├── seeds/seed.js          # Database seeder
│   ├── uploads/               # Local image storage
│   ├── server.js              # App entry point
│   ├── .env                   # Environment variables
│   └── package.json
├── frontend/                   # React + Tailwind CSS
│   ├── public/index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # LoadingSpinner, ProtectedRoute
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   └── products/      # ProductCard
│   │   ├── context/AuthContext.js
│   │   ├── pages/             # All page components
│   │   ├── services/api.js    # Axios API client
│   │   ├── App.js             # Router + layout
│   │   ├── index.js
│   │   └── index.css          # Tailwind + custom classes
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## 🚀 Features

### User Roles
- **Buyer**: Browse products, search, send inquiries, view inquiry history
- **Seller**: Manage products (CRUD), upload images, view/respond to buyer inquiries
- **Admin**: User management, seller approval, product moderation, analytics dashboard

### Core Features
- JWT-based authentication with bcrypt password hashing
- Role-based route protection (frontend + backend)
- Product search with keyword + category filtering
- Category-based product organization
- Inquiry system (buyer → seller communication)
- Seller approval workflow
- Product moderation (admin approval)
- Featured products & sellers
- Image upload (local storage)
- Responsive design (mobile-friendly)

## 📋 Prerequisites

### Local Development
- **Node.js** v16+ and npm
- **MongoDB** (local or MongoDB Atlas)

### Docker Deployment
- **Docker** and **Docker Compose**

## ⚙️ Setup Instructions

### 1. Clone / Navigate to the project

```bash
cd b2b-marketplace
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Edit `backend/.env`:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/b2b_marketplace
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

> **Note**: For MongoDB Atlas, replace `MONGODB_URI` with your connection string.

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 10 product categories
- 1 admin user
- 3 seller accounts (pre-approved)
- 3 buyer accounts
- 15+ sample products
- Sample inquiries

### 5. Start the Backend

```bash
cd backend
npm run dev    # Development with nodemon
# or
npm start      # Production
```

Backend runs on `http://localhost:5001`

### 6. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 7. Start the Frontend

```bash
cd frontend
npm start
```

Frontend runs on `http://localhost:3000`

## 🐳 Docker Deployment

### Quick Start (Recommended)

```bash
# 1. Build and start all services (app + MongoDB)
docker-compose up -d --build

# 2. Seed the database with demo data (run once)
docker-compose --profile seed run --rm seed

# 3. Open the app
open http://localhost:5001
```

### Docker Commands

```bash
# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build
```

### Production Deployment

For deploying to a cloud server (AWS, DigitalOcean, Railway, Render, etc.):

1. Set environment variables on your hosting platform:
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<strong-random-secret>
   JWT_EXPIRE=7d
   ```

2. Build and run the Docker image:
   ```bash
   docker build -t b2b-marketplace .
   docker run -p 5001:5001 --env-file .env b2b-marketplace
   ```

3. Or deploy directly using `docker-compose.yml` on your server.

> **Note:** For production, use MongoDB Atlas instead of the containerized MongoDB, and set a strong `JWT_SECRET`.

---

## 🔑 Demo Credentials

| Role   | Email                    | Password   |
|--------|--------------------------|------------|
| Admin  | admin@b2bmarket.com      | admin123   |
| Seller | rajesh@steelworks.com    | seller123  |
| Seller | priya@techcomp.com       | seller123  |
| Seller | amit@chemtrade.com       | seller123  |
| Seller | sunita@fabricworld.com   | seller123  |
| Buyer  | meera@buyer.com          | buyer123   |
| Buyer  | arjun@buyer.com          | buyer123   |
| Buyer  | deepa@buyer.com          | buyer123   |

## 📡 API Endpoints

### Authentication
| Method | Endpoint                | Description          | Auth |
|--------|-------------------------|----------------------|------|
| POST   | `/api/auth/register`    | Register new user    | No   |
| POST   | `/api/auth/login`       | Login                | No   |
| GET    | `/api/auth/me`          | Get current user     | Yes  |
| PUT    | `/api/auth/profile`     | Update profile       | Yes  |
| PUT    | `/api/auth/change-password` | Change password  | Yes  |

### Products
| Method | Endpoint                          | Description              | Auth   |
|--------|-----------------------------------|--------------------------|--------|
| GET    | `/api/products`                   | List products (search, filter, paginate) | No |
| GET    | `/api/products/:id`               | Get product detail       | No     |
| GET    | `/api/products/seller/my-products`| Seller's own products    | Seller |
| POST   | `/api/products`                   | Create product           | Seller |
| PUT    | `/api/products/:id`               | Update product           | Seller |
| DELETE | `/api/products/:id`               | Delete product           | Seller |

**Query Parameters for GET /api/products:**
- `search` - Keyword search (name, description, tags)
- `category` - Category slug
- `sort` - `newest`, `price_asc`, `price_desc`, `popular`, `name`
- `featured` - `true` for featured only
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

### Categories
| Method | Endpoint              | Description        | Auth |
|--------|-----------------------|--------------------|------|
| GET    | `/api/categories`     | List all categories| No   |
| GET    | `/api/categories/:id` | Get category       | No   |

### Inquiries
| Method | Endpoint                          | Description              | Auth   |
|--------|-----------------------------------|--------------------------|--------|
| POST   | `/api/inquiries`                  | Send inquiry             | Buyer  |
| GET    | `/api/inquiries/my-inquiries`     | Buyer's inquiries        | Buyer  |
| GET    | `/api/inquiries/seller-inquiries` | Seller's received inquiries | Seller |
| GET    | `/api/inquiries/:id`              | Get inquiry detail       | Yes    |
| PUT    | `/api/inquiries/:id/respond`      | Respond to inquiry       | Seller |
| PUT    | `/api/inquiries/:id/read`         | Mark as read             | Seller |

### Sellers (Public)
| Method | Endpoint                    | Description            | Auth |
|--------|-----------------------------|------------------------|------|
| GET    | `/api/sellers/featured`     | Featured sellers       | No   |
| GET    | `/api/sellers/:id`          | Seller profile         | No   |
| GET    | `/api/sellers/:id/products` | Seller's products      | No   |

### Admin
| Method | Endpoint                            | Description            | Auth  |
|--------|-------------------------------------|------------------------|-------|
| GET    | `/api/admin/analytics`              | Dashboard analytics    | Admin |
| GET    | `/api/admin/users`                  | List all users         | Admin |
| PUT    | `/api/admin/users/:id/approve`      | Approve/reject seller  | Admin |
| PUT    | `/api/admin/users/:id/toggle-active`| Activate/deactivate user | Admin |
| GET    | `/api/admin/products`               | List all products      | Admin |
| PUT    | `/api/admin/products/:id/approve`   | Approve/reject product | Admin |
| PUT    | `/api/admin/products/:id/feature`   | Toggle featured status | Admin |
| DELETE | `/api/admin/products/:id`           | Delete product         | Admin |

## 🏛️ Data Models

### User
- name, email, password (hashed), phone, role (buyer/seller/admin)
- Seller fields: companyName, companyDescription, companyAddress, gstNumber, establishedYear, employeeCount
- Flags: isActive, isApproved (for sellers)

### Product
- name, slug, description, shortDescription
- category (ref), seller (ref)
- priceMin, priceMax, priceUnit
- moq, moqUnit
- images[], specifications[], tags[]
- Flags: isActive, isApproved, isFeatured
- viewCount, inquiryCount

### Category
- name, slug, description, icon, isActive

### Inquiry
- buyer (ref), seller (ref), product (ref)
- subject, message, quantity, quantityUnit
- buyerPhone, buyerCompany, deliveryLocation
- status (pending/read/responded/closed)
- sellerResponse, respondedAt

## 🔒 Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- Role-based middleware for route protection
- Input validation on all endpoints
- File upload size limits (5MB)
- CORS configured for development

## 🎨 Design Decisions

1. **Separation of Concerns**: Controllers handle request/response, models handle data, middleware handles cross-cutting concerns
2. **RESTful API**: Standard HTTP methods and status codes
3. **Slug-based URLs**: Products and categories use slugs for SEO-friendly URLs
4. **Approval Workflow**: Sellers and products require admin approval before going live
5. **Inquiry System**: Structured buyer-seller communication tied to specific products
6. **Responsive Design**: Tailwind CSS utility classes for mobile-first responsive layout

## 🛠️ Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 18, Tailwind CSS 3      |
| Backend   | Node.js, Express              |
| Database  | MongoDB, Mongoose             |
| Auth      | JWT, bcrypt                   |
| Uploads   | Multer (local storage)        |
| HTTP      | Axios                         |
| Routing   | React Router v6               |
| DevOps    | Docker, Docker Compose        |

## 📝 License

This project is for **learning and internal use only**.
