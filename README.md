# Jewelry E-commerce Platform

A comprehensive jewelry e-commerce platform built with Next.js 15, TypeScript, Prisma, and NextAuth.js.

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React hooks and context
- **Form Handling**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or pnpm

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jewelry-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/jewelry_db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
jewelry-ecommerce/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── cart/          # Cart management
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order processing
│   │   ├── reviews/       # Review system
│   │   ├── users/         # User management
│   │   ├── coupons/       # Coupon system
│   │   ├── addresses/     # Address management
│   │   ├── shipping/      # Shipping management
│   │   └── settings/      # Application settings
│   ├── admin/             # Admin panel pages
│   ├── login/             # Authentication pages
│   └── signup/            # Registration pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── contexts/             # React context providers
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🔐 Authentication Flow

### User Registration
1. User fills out registration form with validation
2. Password is hashed using bcryptjs
3. User account is created in database
4. User is redirected to login page

### User Login
1. User enters email and password
2. Credentials are validated against database
3. NextAuth creates a secure session
4. User is redirected based on role (admin/user)

### Cart Management
1. **Guest Users**: Cart stored in localStorage
2. **Authenticated Users**: Cart stored in database
3. **Cart Merging**: Guest cart automatically merged on login

## 📚 API Documentation

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | User registration | No |
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth endpoints | No |

### Cart Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/cart` | Get user cart | Yes |
| `PUT` | `/api/cart` | Update entire cart | Yes |
| `PUT` | `/api/cart/[productId]` | Update specific item | Yes |
| `DELETE` | `/api/cart/[productId]` | Remove item | Yes |
| `POST` | `/api/cart/merge` | Merge guest cart | Yes |

### Product Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/products` | List products with pagination, search, and filters | No |
| `POST` | `/api/products` | Create product | Admin |
| `GET` | `/api/products/[id]` | Get single product with reviews and stats | No |
| `PUT` | `/api/products/[id]` | Update product | Admin |
| `DELETE` | `/api/products/[id]` | Delete product | Admin |
| `GET` | `/api/products/search` | Advanced search with multiple criteria | No |
| `GET` | `/api/products/[id]/images` | Get product images | No |
| `POST` | `/api/products/[id]/images` | Add product image | Admin |
| `PUT` | `/api/products/[id]/images` | Update product images | Admin |

### Category Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/categories` | List categories with optional product inclusion | No |
| `POST` | `/api/categories` | Create category | Admin |
| `GET` | `/api/categories/[id]` | Get category with paginated products | No |
| `PUT` | `/api/categories/[id]` | Update category | Admin |
| `DELETE` | `/api/categories/[id]` | Delete category | Admin |

### Wishlist Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/wishlist` | Get user's wishlist items | Yes |
| `POST` | `/api/wishlist` | Add item to wishlist | Yes |
| `GET` | `/api/wishlist/[productId]` | Check if product is in wishlist | Yes |
| `POST` | `/api/wishlist/[productId]` | Toggle wishlist item (add/remove) | Yes |
| `DELETE` | `/api/wishlist/[productId]` | Remove item from wishlist | Yes |

### Order Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/orders` | List orders (user's own or all for admin) | Yes |
| `POST` | `/api/orders` | Create new order (supports guest checkout) | Yes |
| `GET` | `/api/orders/[id]` | Get order details | Yes |
| `PUT` | `/api/orders/[id]` | Update order status | Admin |

### Payment Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/payments` | Create payment record | Yes |
| `PUT` | `/api/payments` | Update payment status | Admin |

### Coupon System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/coupons/validate` | Validate coupon code and calculate discount | No |

### Address Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/addresses` | Get user's addresses | Yes |
| `POST` | `/api/addresses` | Create new address | Yes |
| `PUT` | `/api/addresses/[id]` | Update address | Yes |
| `DELETE` | `/api/addresses/[id]` | Delete address | Yes |

### Review System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/reviews` | Get reviews with filtering and pagination | No |
| `POST` | `/api/reviews` | Create product review | Yes |
| `GET` | `/api/reviews/[id]` | Get specific review | No |
| `PUT` | `/api/reviews/[id]` | Update review (user or admin) | Yes |
| `DELETE` | `/api/reviews/[id]` | Delete review | Yes |
| `POST` | `/api/reviews/[id]/helpful` | Mark review as helpful | Yes |

### User Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users` | List users | Admin |
| `GET` | `/api/users/[id]` | Get user details | Yes |
| `PUT` | `/api/users/[id]` | Update user profile | Yes |
| `DELETE` | `/api/users/[id]` | Delete user | Admin |

### Coupon Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/coupons` | List coupons | Admin |
| `POST` | `/api/coupons` | Create coupon | Admin |
| `GET` | `/api/coupons/[id]` | Get coupon details | Admin |
| `PUT` | `/api/coupons/[id]` | Update coupon | Admin |
| `DELETE` | `/api/coupons/[id]` | Delete coupon | Admin |

### Shipping Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/shipping/methods` | Get available shipping methods | No |
| `POST` | `/api/shipping/calculate` | Calculate shipping costs | No |

### Settings Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/settings` | Get application settings | No |
| `POST` | `/api/settings` | Create setting | Admin |
| `GET` | `/api/settings/[key]` | Get specific setting | No |
| `PUT` | `/api/settings/[key]` | Update setting | Admin |
| `DELETE` | `/api/settings/[key]` | Delete setting | Admin |

## 🗄️ Database Schema

The application uses a comprehensive Prisma schema with the following main models:

- **User**: User accounts with authentication
- **Product**: Product catalog with images and categories
- **CartItem**: Shopping cart items
- **Order**: Order management with status tracking
- **Payment**: Payment processing and tracking
- **Review**: Product reviews and ratings
- **Wishlist**: User wishlist functionality
- **Coupon**: Discount and promotion system
- **Address**: User address management
- **Shipping**: Shipping information and tracking
- **Setting**: Application configuration

## 🔒 Security Features

- Input validation with Zod
- Password hashing with bcryptjs
- SQL injection prevention (Prisma handles this)
- XSS protection
- CSRF tokens where needed
- Role-based access control
- Session management with NextAuth.js

## 🚀 Performance Optimization

- Implement pagination for large datasets
- Use database indexes for search queries
- Image optimization for product photos
- Caching for frequently accessed data
- Efficient database queries with Prisma

## 📦 Deployment

### Environment Setup
1. Set up production database
2. Configure environment variables
3. Set up NextAuth secret
4. Configure domain in NEXTAUTH_URL

### Build and Deploy
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository. 