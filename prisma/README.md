# Database Seeding Guide

This directory contains comprehensive seed files for the jewelry e-commerce application.

## Files

- `schema.prisma` - Main database schema
- `seed.ts` - Original minimal seed file (6 products)
- `comprehensive-seed.ts` - **New comprehensive seed file (120+ products)**
- `validate-seed.ts` - Data validation script
- `README.md` - This documentation

## Features of the Comprehensive Seed

### 📊 Data Volume
- **120+ Products** across 8 categories
- **26 Users** (1 admin + 25 customers)
- **45 Orders** with realistic order history
- **8 Categories** covering all jewelry types
- **200+ Reviews** with realistic ratings and comments
- **4 Active Coupons** with different discount types
- **20+ Settings** for store configuration
- **Addresses, Cart Items, Wishlist Items, and more**

### 💎 Realistic Product Data
- **Authentic jewelry names** (Diamond Solitaire Ring, Pearl Drop Earrings, etc.)
- **Realistic pricing** (₹99 - ₹4,999 range)
- **Proper categorization** (Engagement Rings, Necklaces, Earrings, etc.)
- **Detailed product information** (weight, size, materials)
- **Multiple product images** (2-4 per product)
- **Stock management** with random realistic quantities

### 👥 User & Customer Data
- **Diverse user profiles** with realistic names
- **Complete address information** for shipping/billing
- **Shopping cart contents** for active users
- **Wishlist items** across different products
- **Order history** with various statuses

### 🛒 Complete E-commerce Flow
- **Full order lifecycle** (pending → shipped → delivered)
- **Payment records** with different methods (credit card, UPI, etc.)
- **Shipping information** with tracking numbers
- **Applied coupons** and discount calculations
- **Tax and shipping cost calculations**

### ⭐ Rich Review System
- **Verified purchase reviews** with realistic ratings (4-5 stars mostly)
- **Helpful review titles and comments**
- **Review approval status** and helpful counts
- **Distribution across products** (60% of products have reviews)

## Usage

### Prerequisites
```bash
# Install dependencies if not already done
npm install

# Generate Prisma client
npm run db:generate
```

### Running the Comprehensive Seed

```bash
# Option 1: Run comprehensive seed (recommended)
npm run db:seed

# Option 2: Reset database and seed
npm run db:reset
# Then follow prompts and run:
npm run db:seed

# Option 3: Run original minimal seed
npm run db:seed-original
```

### Validation

After seeding, validate the data integrity:

```bash
npm run db:validate
```

This will check:
- ✅ Data relationships are correct
- ✅ All products have categories and images
- ✅ All orders have items and payments
- ✅ No orphaned records
- ✅ Realistic price ranges and stock levels
- ✅ Email uniqueness
- ✅ Business logic compliance

### Database Management

```bash
# View data in Prisma Studio
npm run db:studio

# Run migrations
npm run db:migrate

# Reset database (WARNING: Deletes all data)
npm run db:reset
```

## Data Structure Overview

### Categories (8)
1. Engagement Rings
2. Wedding Rings  
3. Necklaces
4. Earrings
5. Bracelets
6. Watches
7. Gemstone Jewelry
8. Men's Jewelry

### Sample Products by Category
- **Rings**: Classic Solitaire, Vintage Art Deco, Modern Halo, Three Stone
- **Necklaces**: Diamond Tennis, Pearl Strand, Gold Chain, Ruby Heart Pendant
- **Earrings**: Diamond Stud, Pearl Drop, Hoop Diamond, Chandelier Drop
- **Bracelets**: Diamond Tennis, Charm Bracelet, Gold Chain, Gemstone Beaded

### User Types
- **Admin User**: admin@jewelry-store.com (password: admin123)
- **Customer Users**: Generated with realistic names and emails (password: password123)

### Order Statuses Distribution
- PENDING (new orders)
- CONFIRMED (payment confirmed)
- PROCESSING (being prepared)
- SHIPPED (on the way)
- DELIVERED (completed)
- CANCELLED (cancelled orders)

### Payment Methods
- Credit Card (Stripe)
- Debit Card
- UPI (Indian payment system)
- Net Banking
- Digital Wallet
- Cash on Delivery

## Testing the Seed Data

1. **Start the application**: `npm run dev`
2. **Browse products**: Check if 120+ products are visible
3. **Login as admin**: admin@jewelry-store.com / admin123
4. **Login as customer**: Any generated user email / password123
5. **Check order history**: Verify orders show up correctly
6. **Test reviews**: Verify products have reviews
7. **Test coupons**: Try codes like WELCOME15, SUMMER25

## Customization

To modify the seed data:

1. **Edit `comprehensive-seed.ts`**
2. **Adjust data arrays** (names, categories, prices)
3. **Change quantities** (users, products, orders)
4. **Modify business logic** (discounts, shipping, tax rates)
5. **Re-run the seed**: `npm run db:seed`

## Troubleshooting

### Common Issues

**Error: "Module not found"**
```bash
npm install tsx --save-dev
```

**Error: "Database connection failed"**
- Check DATABASE_URL in .env file
- Ensure database server is running
- Run `npm run db:migrate` first

**Error: "Unique constraint violation"**
- Database already has data
- Run `npm run db:reset` to clear existing data

**Seed runs but creates fewer products**
- Check console output for errors
- Some products may be skipped due to naming conflicts
- Run validation: `npm run db:validate`

### Performance Notes

- Comprehensive seed takes 30-60 seconds to complete
- Creates ~1000+ database records across all tables
- Uses database transactions for data integrity
- Progress is logged to console during execution

## Production Considerations

⚠️ **Important**: This seed file is designed for development/testing only.

For production:
1. Remove or modify user passwords
2. Use real product images and descriptions
3. Configure proper payment gateway credentials
4. Set up real email service for notifications
5. Review and adjust all settings values