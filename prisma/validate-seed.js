const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateSeedData() {
  console.log('🔍 Starting seed data validation...\n');

  try {
    // 1. Check basic counts
    console.log('📊 Data Counts:');
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const reviewCount = await prisma.review.count();
    const wishlistCount = await prisma.wishlistItem.count();
    const cartCount = await prisma.cartItem.count();
    const addressCount = await prisma.address.count();
    const couponCount = await prisma.coupon.count();
    const settingCount = await prisma.setting.count();
    const adminLogCount = await prisma.adminLog.count();
    const productImageCount = await prisma.productImage.count();
    const paymentCount = await prisma.payment.count();
    const shippingCount = await prisma.shipping.count();

    console.log(`   Users: ${userCount}`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Reviews: ${reviewCount}`);
    console.log(`   Wishlist Items: ${wishlistCount}`);
    console.log(`   Cart Items: ${cartCount}`);
    console.log(`   Addresses: ${addressCount}`);
    console.log(`   Coupons: ${couponCount}`);
    console.log(`   Settings: ${settingCount}`);
    console.log(`   Admin Logs: ${adminLogCount}`);
    console.log(`   Product Images: ${productImageCount}`);
    console.log(`   Payments: ${paymentCount}`);
    console.log(`   Shipping Records: ${shippingCount}\n`);

    // 2. Validate relationships
    console.log('🔗 Relationship Validation:');

    // Check if all products have at least one image
    const productsWithoutImages = await prisma.product.count({
      where: {
        images: {
          none: {}
        }
      }
    });
    console.log(`   Products without images: ${productsWithoutImages} ${productsWithoutImages === 0 ? '✅' : '❌'}`);

    // Check if all orders have order items
    const ordersWithoutItems = await prisma.order.count({
      where: {
        orderItems: {
          none: {}
        }
      }
    });
    console.log(`   Orders without items: ${ordersWithoutItems} ${ordersWithoutItems === 0 ? '✅' : '❌'}`);

    // Check if all orders have payments
    const ordersWithoutPayments = await prisma.order.count({
      where: {
        payments: {
          none: {}
        }
      }
    });
    console.log(`   Orders without payments: ${ordersWithoutPayments} ${ordersWithoutPayments === 0 ? '✅' : '❌'}`);

    // 3. Data quality checks
    console.log('\n📏 Data Quality Checks:');

    // Check price ranges
    const pricesOutOfRange = await prisma.product.count({
      where: {
        OR: [
          { price: { lt: 0 } },
          { price: { gt: 10000 } }
        ]
      }
    });
    console.log(`   Products with unrealistic prices: ${pricesOutOfRange} ${pricesOutOfRange === 0 ? '✅' : '⚠️'}`);

    // Check stock levels
    const negativeStock = await prisma.product.count({
      where: { stock: { lt: 0 } }
    });
    console.log(`   Products with negative stock: ${negativeStock} ${negativeStock === 0 ? '✅' : '❌'}`);

    // Check email uniqueness
    const duplicateEmails = await prisma.user.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    });
    console.log(`   Duplicate email addresses: ${duplicateEmails.length} ${duplicateEmails.length === 0 ? '✅' : '❌'}`);

    // Check order totals make sense
    const ordersWithBadTotals = await prisma.order.count({
      where: {
        OR: [
          { totalAmount: { lt: 0 } },
          { subtotal: { lt: 0 } }
        ]
      }
    });
    console.log(`   Orders with invalid totals: ${ordersWithBadTotals} ${ordersWithBadTotals === 0 ? '✅' : '❌'}`);

    // 4. Business logic validation
    console.log('\n💼 Business Logic Validation:');

    // Check if admin users exist
    const adminUsers = await prisma.user.count({
      where: { isAdmin: true }
    });
    console.log(`   Admin users: ${adminUsers} ${adminUsers > 0 ? '✅' : '❌'}`);

    // Check active coupons
    const activeCoupons = await prisma.coupon.count({
      where: { isActive: true }
    });
    console.log(`   Active coupons: ${activeCoupons} ${activeCoupons > 0 ? '✅' : '⚠️'}`);

    // Check products with reviews
    const productsWithReviews = await prisma.product.count({
      where: {
        reviews: {
          some: {}
        }
      }
    });
    const reviewPercentage = Math.round((productsWithReviews / productCount) * 100);
    console.log(`   Products with reviews: ${productsWithReviews}/${productCount} (${reviewPercentage}%) ${reviewPercentage > 20 ? '✅' : '⚠️'}`);

    // Check average rating calculation
    const avgRating = await prisma.review.aggregate({
      _avg: {
        rating: true
      }
    });
    console.log(`   Average review rating: ${avgRating._avg.rating?.toFixed(2)} ${(avgRating._avg.rating || 0) >= 3 ? '✅' : '⚠️'}`);

    // 5. Sample data verification
    console.log('\n🔍 Sample Data Verification:');

    // Show sample product with full relations
    const sampleProduct = await prisma.product.findFirst({
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          },
          take: 2
        },
        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
            cartItems: true
          }
        }
      }
    });

    if (sampleProduct) {
      console.log(`   Sample Product: "${sampleProduct.name}"`);
      console.log(`     Category: ${sampleProduct.category.name}`);
      console.log(`     Price: ₹${sampleProduct.price}`);
      console.log(`     Images: ${sampleProduct.images.length}`);
      console.log(`     Reviews: ${sampleProduct._count.reviews}`);
      console.log(`     In ${sampleProduct._count.wishlistItems} wishlists`);
      console.log(`     In ${sampleProduct._count.cartItems} carts`);
    }

    // Show sample order with relations
    const sampleOrder = await prisma.order.findFirst({
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        orderItems: {
          include: {
            product: {
              select: { name: true }
            }
          },
          take: 3
        },
        payments: true,
        shipping: true,
        coupon: {
          select: { code: true, discountType: true, discountValue: true }
        }
      }
    });

    if (sampleOrder) {
      console.log(`   Sample Order: ${sampleOrder.orderNumber}`);
      console.log(`     Customer: ${sampleOrder.user.firstName} ${sampleOrder.user.lastName}`);
      console.log(`     Status: ${sampleOrder.status}`);
      console.log(`     Items: ${sampleOrder.orderItems.length}`);
      console.log(`     Total: $${sampleOrder.totalAmount}`);
      console.log(`     Payment Status: ${sampleOrder.payments[0]?.status || 'N/A'}`);
      if (sampleOrder.coupon) {
        console.log(`     Coupon: ${sampleOrder.coupon.code} (${sampleOrder.coupon.discountType})`);
      }
    }

    console.log('\n✅ Validation completed successfully!');
    
    // Summary
    const issues = [
      productsWithoutImages,
      ordersWithoutItems,
      ordersWithoutPayments,
      negativeStock,
      duplicateEmails.length,
      ordersWithBadTotals
    ].reduce((sum, count) => sum + count, 0);

    console.log(`\n📋 Summary: ${issues === 0 ? 'All validation checks passed! 🎉' : `${issues} issue(s) found ⚠️`}`);

    if (productCount >= 100) {
      console.log(`🎯 Target achieved: ${productCount} products created (≥100 required)`);
    } else {
      console.log(`⚠️ Target not met: Only ${productCount} products created (<100 required)`);
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validateSeedData();