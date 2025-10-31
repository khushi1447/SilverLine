import { PrismaClient, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Realistic jewelry data arrays
const jewelryNames = {
  rings: [
    'Classic Solitaire Engagement Ring', 'Vintage Art Deco Ring', 'Modern Halo Diamond Ring',
    'Three Stone Anniversary Ring', 'Emerald Cut Diamond Ring', 'Princess Cut Solitaire',
    'Round Brilliant Engagement Ring', 'Oval Diamond Halo Ring', 'Pear Shaped Diamond Ring',
    'Marquise Cut Engagement Ring', 'Cushion Cut Halo Ring', 'Radiant Cut Diamond Ring',
    'Asscher Cut Vintage Ring', 'Heart Shaped Diamond Ring', 'Twisted Band Engagement Ring',
    'Split Shank Diamond Ring', 'Pavé Diamond Band', 'Channel Set Diamond Ring',
    'Bezel Set Solitaire Ring', 'Cathedral Setting Ring', 'Tiffany Style Solitaire',
    'Rose Gold Engagement Ring', 'White Gold Classic Ring', 'Platinum Solitaire Ring',
    'Yellow Gold Vintage Ring', 'Two Tone Diamond Ring', 'Eternity Diamond Band',
    'Wedding Band Set', 'Matching Bridal Set', 'Stackable Diamond Ring'
  ],
  necklaces: [
    'Diamond Tennis Necklace', 'Pearl Strand Necklace', 'Gold Chain Necklace',
    'Diamond Pendant Necklace', 'Ruby Heart Pendant', 'Emerald Drop Necklace',
    'Sapphire Station Necklace', 'Diamond By The Yard', 'Vintage Pearl Choker',
    'Modern Bar Necklace', 'Infinity Symbol Pendant', 'Cross Diamond Pendant',
    'Layered Chain Necklace', 'Statement Collar Necklace', 'Delicate Chain Necklace',
    'Gemstone Cluster Necklace', 'Diamond Rivière', 'Pearl and Diamond Necklace',
    'Lariat Style Necklace', 'Chandelier Drop Necklace', 'Multi-Strand Pearl Necklace',
    'Gold Coin Necklace', 'Diamond Circle Pendant', 'Birthstone Necklace',
    'Name Plate Necklace', 'Initial Pendant Necklace', 'Charm Necklace',
    'Vintage Locket Necklace', 'Tassel Drop Necklace', 'Geometric Pendant Necklace'
  ],
  earrings: [
    'Diamond Stud Earrings', 'Pearl Drop Earrings', 'Hoop Diamond Earrings',
    'Chandelier Drop Earrings', 'Huggie Hoop Earrings', 'Geometric Stud Earrings',
    'Vintage Drop Earrings', 'Modern Linear Earrings', 'Cluster Diamond Earrings',
    'Teardrop Pearl Earrings', 'Statement Shoulder Dusters', 'Delicate Chain Earrings',
    'Gemstone Stud Earrings', 'Art Deco Fan Earrings', 'Floral Diamond Earrings',
    'Tassel Drop Earrings', 'Convertible Stud Earrings', 'Mismatched Earrings',
    'Ear Crawler Earrings', 'Jacket Stud Earrings', 'Leverback Earrings',
    'Threader Earrings', 'Cluster Pearl Earrings', 'Fringe Drop Earrings',
    'Button Pearl Earrings', 'Linear Bar Earrings', 'Vintage Chandelier Earrings',
    'Modern Geometric Earrings', 'Floral Stud Earrings', 'Diamond Halo Earrings'
  ],
  bracelets: [
    'Diamond Tennis Bracelet', 'Pearl Strand Bracelet', 'Gold Chain Bracelet',
    'Charm Bracelet', 'Bangle Set', 'Cuff Bracelet', 'Link Bracelet',
    'Beaded Gemstone Bracelet', 'Vintage Art Deco Bracelet', 'Modern Geometric Bracelet',
    'Diamond Line Bracelet', 'Flexible Diamond Bracelet', 'Pearl and Diamond Bracelet',
    'Stackable Bracelet Set', 'Leather Cord Bracelet', 'Mesh Chain Bracelet',
    'Byzantine Chain Bracelet', 'Rope Chain Bracelet', 'Curb Link Bracelet',
    'Figaro Chain Bracelet', 'Snake Chain Bracelet', 'Box Chain Bracelet',
    'Herringbone Bracelet', 'Omega Chain Bracelet', 'Cable Chain Bracelet',
    'Wheat Chain Bracelet', 'Popcorn Chain Bracelet', 'Singapore Chain Bracelet',
    'Anchor Chain Bracelet', 'Mariner Link Bracelet'
  ]
};

const gemstones = ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Amethyst', 'Topaz', 'Garnet', 'Opal', 'Aquamarine'];
const metals = ['14K Gold', '18K Gold', 'White Gold', 'Rose Gold', 'Platinum', 'Sterling Silver'];
const sizes = {
  rings: ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
  necklaces: ['16 inches', '18 inches', '20 inches', '22 inches', '24 inches', '26 inches', '28 inches', '30 inches'],
  earrings: ['0.5 inches', '1 inch', '1.5 inches', '2 inches', '2.5 inches', '3 inches'],
  bracelets: ['6.5 inches', '7 inches', '7.5 inches', '8 inches', '8.5 inches', '9 inches']
};

// User data
const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Isabella', 'Sophia', 'Jackson', 'Mia', 'Lucas', 'Harper', 'Ethan', 'Evelyn', 'Alexander', 'Abigail', 'Jacob', 'Emily', 'Michael', 'Elizabeth', 'Daniel', 'Mila', 'Henry', 'Ella', 'Owen', 'Avery', 'Sebastian', 'Sofia', 'Aiden', 'Camila', 'Matthew'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

// Address data
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'Seattle', 'Denver', 'Boston', 'Nashville', 'Portland'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'WA', 'CO', 'MA', 'TN', 'OR'];
const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'Elm St', 'First Ave', 'Second St', 'Third Ave', 'Maple St', 'Cedar Ave', 'Pine St', 'Washington Ave', 'Lincoln St', 'Jefferson Blvd', 'Madison Ave', 'Adams St'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomStock(): number {
  return Math.floor(Math.random() * 50) + 5;
}

function getRandomWeight(): number {
  return parseFloat((Math.random() * 20 + 1).toFixed(1));
}

function generateSKU(category: string, index: number): string {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(index).padStart(3, '0')}`;
}

function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function generateReviews(productId: number, userIds: number[]): any[] {
  const reviewCount = Math.floor(Math.random() * 5) + 1;
  const reviews = [];
  const reviewTitles = [
    'Absolutely love it!', 'Great quality', 'Beautiful piece', 'Exceeded expectations',
    'Perfect gift', 'Stunning design', 'Excellent craftsmanship', 'Highly recommend',
    'Amazing quality', 'Worth every penny', 'Beautiful and elegant', 'Perfect size'
  ];
  const reviewComments = [
    'This piece is absolutely stunning and exactly what I was looking for.',
    'The quality is exceptional and the craftsmanship is beautiful.',
    'Perfect for everyday wear or special occasions.',
    'Fast shipping and excellent customer service.',
    'The photos don\'t do justice to how beautiful this is in person.',
    'Great value for the price and excellent quality.',
    'Bought this as a gift and the recipient loved it.',
    'The design is elegant and timeless.',
    'High quality materials and beautiful finish.',
    'Would definitely purchase from this store again.'
  ];

  for (let i = 0; i < reviewCount; i++) {
    if (userIds.length > 0) {
      reviews.push({
        userId: getRandomElement(userIds),
        productId,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        title: getRandomElement(reviewTitles),
        comment: getRandomElement(reviewComments),
        isVerified: Math.random() > 0.3,
        isApproved: true,
        helpfulCount: Math.floor(Math.random() * 10)
      });
    }
  }

  return reviews;
}

async function main() {
  console.log('🚀 Starting comprehensive seed...');

  // Clean existing data (optional - remove if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.adminLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.shipping.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // 1. Create Categories
  console.log('📂 Creating categories...');
  const categoryData = [
    {
      name: 'Rings',
      description: 'Beautiful engagement rings for your special moment',
      imageUrl: '/images/categories/engagement-rings.jpg'
    },
    {
      name: 'Necklaces',
      description: 'Elegant necklaces and pendants for every occasion',
      imageUrl: '/images/categories/necklaces.jpg'
    },
    {
      name: 'Earrings',
      description: 'Stunning earrings to complete your look',
      imageUrl: '/images/categories/earrings.jpg'
    },
    {
      name: 'Bracelets',
      description: 'Beautiful bracelets and bangles',
      imageUrl: '/images/categories/bracelets.jpg'
    },
    {
      name: 'Watches',
      description: 'Luxury timepieces for discerning tastes',
      imageUrl: '/images/categories/watches.jpg'
    },
    {
      name: 'Pendants',
      description: 'Precious and semi-precious gemstone pieces',
      imageUrl: '/images/categories/gemstones.jpg'
    },
  ];

  const categories = [];
  for (const cat of categoryData) {
    const category = await prisma.category.create({ data: cat });
    categories.push(category);
  }
  console.log(`✅ Created ${categories.length} categories`);

  // 2. Create Users
  console.log('👥 Creating users...');
  const users = [];

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@jewelry-store.com',
      password: hashedAdminPassword,
      phone: '+1-555-0000',
      isAdmin: true
    }
  });
  users.push(adminUser);

  // Create regular users
  for (let i = 0; i < 25; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        password: hashedPassword,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        isAdmin: false
      }
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users`);

  // 3. Create Products (100+ products)
  console.log('💎 Creating products...');
  const products = [];
  let productIndex = 1;

  // Create products for each category
  for (const category of categories) {
    let productNames: string[] = [];
    let productSizes: string[] = [];
    
    // Determine product names and sizes based on category
    if (category.name.toLowerCase().includes('ring')) {
      productNames = jewelryNames.rings;
      productSizes = sizes.rings;
    } else if (category.name.toLowerCase().includes('necklace')) {
      productNames = jewelryNames.necklaces;
      productSizes = sizes.necklaces;
    } else if (category.name.toLowerCase().includes('earring')) {
      productNames = jewelryNames.earrings;
      productSizes = sizes.earrings;
    } else if (category.name.toLowerCase().includes('bracelet')) {
      productNames = jewelryNames.bracelets;
      productSizes = sizes.bracelets;
    } else {
      // For other categories, use a mix
      productNames = [...jewelryNames.rings, ...jewelryNames.necklaces].slice(0, 15);
      productSizes = [...sizes.rings, ...sizes.necklaces];
    }

    // Create 12-18 products per category
    const productsPerCategory = Math.floor(Math.random() * 7) + 12;
    
    for (let i = 0; i < productsPerCategory && productIndex <= 120; i++) {
      const baseName = getRandomElement(productNames);
      const metal = getRandomElement(metals);
      const gemstone = getRandomElement(gemstones);
      
      const productName = `${baseName} in ${metal}${Math.random() > 0.5 ? ` with ${gemstone}` : ''}`;
      const basePrice = getRandomPrice(99, 4999);
      const stock = getRandomStock();
      
      const comparePrice = Math.random() > 0.3 ? basePrice * (1.2 + Math.random() * 0.5) : null; // 30% chance of compare price
      const cost = basePrice * (0.4 + Math.random() * 0.3); // Cost between 40-70% of price
      const sku = `JWL-${String(productIndex).padStart(3, '0')}-${category.name.slice(0,3).toUpperCase()}`;
      const certification = Math.random() > 0.7 ? getRandomElement(['GIA Certified', 'AGS Certified', 'EGL Certified']) : null;
      const status = Math.random() > 0.1 ? 'ACTIVE' : 'DRAFT'; // 90% active, 10% draft

      const product = await prisma.product.create({
        data: {
          name: productName,
          description: `Exquisite ${productName.toLowerCase()} crafted with attention to detail. Features premium materials and exceptional craftsmanship. Perfect for special occasions or as a meaningful gift.`,
          shortDescription: `${baseName} in ${metal}`,
          price: basePrice,
          stock,
          lowStockThreshold: 5,
          categoryId: category.id,
          weight: getRandomWeight(),
          size: getRandomElement(productSizes),
          // certification
        }
      });

      products.push(product);

      // Create 2-4 images per product
      const imageCount = Math.floor(Math.random() * 3) + 2;
      for (let imgIndex = 1; imgIndex <= imageCount; imgIndex++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: `/images/products/product-${productIndex}-${imgIndex}.svg`,
            altText: `${productName} - View ${imgIndex}`,
            sortOrder: imgIndex,
            isPrimary: imgIndex === 1
          }
        });
      }

      productIndex++;
    }
  }
  console.log(`✅ Created ${products.length} products with images`);

  // 4. Create Addresses for users
  console.log('🏠 Creating addresses...');
  let addressCount = 0;
  for (const user of users.slice(1)) { // Skip admin user
    if (Math.random() > 0.3) { // 70% of users have addresses
      const addressTypes = Math.random() > 0.5 ? ['BILLING', 'SHIPPING'] : ['BOTH'];
      
      for (const type of addressTypes) {
        await prisma.address.create({
          data: {
            userId: user.id,
            type: type as any,
            firstName: user.firstName,
            lastName: user.lastName,
            company: Math.random() > 0.7 ? `${getRandomElement(['Tech', 'Design', 'Marketing', 'Solutions'])} Corp` : undefined,
            address1: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(streets)}`,
            address2: Math.random() > 0.7 ? `Apt ${Math.floor(Math.random() * 100) + 1}` : undefined,
            city: getRandomElement(cities),
            state: getRandomElement(states),
            postalCode: String(Math.floor(Math.random() * 90000) + 10000),
            country: 'US',
            phone: user.phone,
            isDefault: true
          }
        });
        addressCount++;
      }
    }
  }
  console.log(`✅ Created ${addressCount} addresses`);

  // 5. Create Coupons
  console.log('🎫 Creating coupons...');
  const couponData = [
    {
      code: 'WELCOME15',
      name: 'Welcome 15% Off',
      description: 'Welcome discount for new customers',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15.00,
      minOrderValue: 100.00,
      maxDiscount: 300.00,
      usageLimit: 1000,
      perUserLimit: 1,
      startsAt: new Date('2024-01-01'),
      expiresAt: new Date('2025-12-31'),
      isActive: true
    },
    {
      code: 'SUMMER25',
      name: 'Summer Sale 25% Off',
      description: 'Summer sale discount',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 25.00,
      minOrderValue: 200.00,
      maxDiscount: 500.00,
      usageLimit: 500,
      perUserLimit: 2,
      startsAt: new Date('2024-06-01'),
      expiresAt: new Date('2024-08-31'),
      isActive: true
    },
    {
      code: 'SAVE50',
      name: '₹50 Off Large Orders',
      description: 'Fixed discount for orders over ₹300',
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 50.00,
      minOrderValue: 300.00,
      usageLimit: 200,
      perUserLimit: 1,
      startsAt: new Date('2024-01-01'),
      expiresAt: new Date('2025-06-30'),
      isActive: true
    },
    {
      code: 'FREESHIP',
      name: 'Free Shipping',
      description: 'Free shipping on any order',
      discountType: DiscountType.FREE_SHIPPING,
      discountValue: 0.00,
      minOrderValue: 0.00,
      usageLimit: 100,
      perUserLimit: 3,
      startsAt: new Date('2024-01-01'),
      expiresAt: new Date('2025-12-31'),
      isActive: true
    }
  ];

  const coupons = [];
  for (const couponInfo of couponData) {
    const coupon = await prisma.coupon.create({ data: couponInfo });
    coupons.push(coupon);
  }
  console.log(`✅ Created ${coupons.length} coupons`);

  // 6. Create Orders
  console.log('🛒 Creating orders...');
  const orders = [];
  const regularUsers = users.slice(1); // Exclude admin
  
  for (let i = 0; i < 45; i++) {
    const user = getRandomElement(regularUsers);
    const orderProducts = [];
    const itemCount = Math.floor(Math.random() * 4) + 1; // 1-4 items per order
    
    // Select random products for this order
    for (let j = 0; j < itemCount; j++) {
      const product = getRandomElement(products);
      const quantity = Math.floor(Math.random() * 3) + 1;
      orderProducts.push({ product, quantity });
    }
    
    // Calculate totals
    const subtotal = orderProducts.reduce((sum, item) => 
      sum + (Number(item.product.price) * item.quantity), 0
    );
    const taxAmount = subtotal * 0.085; // 8.5% tax
    const shippingCost = subtotal > 100 ? 0 : 15.99;
    const discountAmount = Math.random() > 0.7 ? subtotal * 0.1 : 0; // 30% chance of discount
    const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;
    
    const orderStatus = getRandomElement(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']);
    
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        status: orderStatus as any,
        subtotal,
        taxAmount,
        shippingCost,
        discountAmount,
        totalAmount,
        couponId: discountAmount > 0 ? getRandomElement(coupons).id : undefined,
        couponCode: discountAmount > 0 ? getRandomElement(coupons).code : undefined,
        billingAddress: {
          firstName: user.firstName,
          lastName: user.lastName,
          address1: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(streets)}`,
          city: getRandomElement(cities),
          state: getRandomElement(states),
          postalCode: String(Math.floor(Math.random() * 90000) + 10000),
          country: 'US',
          phone: user.phone
        },
        shippingAddress: {
          firstName: user.firstName,
          lastName: user.lastName,
          address1: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(streets)}`,
          city: getRandomElement(cities),
          state: getRandomElement(states),
          postalCode: String(Math.floor(Math.random() * 90000) + 10000),
          country: 'US',
          phone: user.phone
        },
        customerNotes: Math.random() > 0.8 ? "Please handle with care" : undefined
      }
    });
    
    orders.push(order);
    
    // Create order items
    for (const { product, quantity } of orderProducts) {
      const price = Number(product.price);
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          price,
          totalPrice: price * quantity,
          productName: product.name,
          productSku: generateSKU(product.name, product.id),
          productImage: `/images/products/product-${product.id}-1.jpg`
        }
      });
    }
    
    // Create payment for the order
    const paymentMethod = getRandomElement(['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET']);
    const paymentStatus = orderStatus === 'DELIVERED' ? 'COMPLETED' : 
                         orderStatus === 'CANCELLED' ? 'FAILED' : 'PROCESSING';
    
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: paymentMethod as any,
        gateway: 'stripe',
        amount: totalAmount,
        currency: 'INR',
        status: paymentStatus as any,
        transactionId: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        paidAt: paymentStatus === 'COMPLETED' ? new Date() : undefined
      }
    });
    
    // Create shipping info for shipped/delivered orders
    if (['SHIPPED', 'DELIVERED'].includes(orderStatus)) {
      const shippingMethod = getRandomElement(['STANDARD', 'EXPRESS', 'OVERNIGHT']);
      const shippingStatus = orderStatus === 'DELIVERED' ? 'DELIVERED' : 'IN_TRANSIT';
      
      await prisma.shipping.create({
        data: {
          orderId: order.id,
          method: shippingMethod as any,
          cost: shippingCost,
          trackingNumber: `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`,
          carrier: getRandomElement(['FedEx', 'UPS', 'DHL', 'USPS']),
          status: shippingStatus as any,
          estimatedDelivery: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 days from now
          shippedAt: orderStatus === 'SHIPPED' ? new Date() : undefined,
          deliveredAt: orderStatus === 'DELIVERED' ? new Date() : undefined
        }
      });
    }
  }
  console.log(`✅ Created ${orders.length} orders with payments and shipping`);

  // 7. Create Reviews
  console.log('⭐ Creating reviews...');
  let reviewCount = 0;
  const userIds = regularUsers.map(u => u.id);
  
  for (const product of products) {
    if (Math.random() > 0.4) { // 60% of products have reviews
      const reviews = generateReviews(product.id, userIds);
      for (const reviewData of reviews) {
        try {
          await prisma.review.create({ data: reviewData });
          reviewCount++;
        } catch (error) {
          // Skip if user already reviewed this product
          console.log(`Skipping duplicate review for user ${reviewData.userId} and product ${reviewData.productId}`);
        }
      }
    }
  }
  console.log(`✅ Created ${reviewCount} reviews`);

  // 8. Create Wishlist Items
  console.log('❤️ Creating wishlist items...');
  let wishlistCount = 0;
  for (const user of regularUsers) {
    if (Math.random() > 0.5) { // 50% of users have wishlist items
      const wishlistSize = Math.floor(Math.random() * 8) + 1; // 1-8 items
      const userProducts = products.slice().sort(() => 0.5 - Math.random()).slice(0, wishlistSize);
      
      for (const product of userProducts) {
        try {
          await prisma.wishlistItem.create({
            data: {
              userId: user.id,
              productId: product.id
            }
          });
          wishlistCount++;
        } catch (error) {
          // Skip duplicates
        }
      }
    }
  }
  console.log(`✅ Created ${wishlistCount} wishlist items`);

  // 9. Create Cart Items
  console.log('🛍️ Creating cart items...');
  let cartCount = 0;
  for (const user of regularUsers) {
    if (Math.random() > 0.6) { // 40% of users have items in cart
      const cartSize = Math.floor(Math.random() * 5) + 1; // 1-5 items
      const cartProducts = products.slice().sort(() => 0.5 - Math.random()).slice(0, cartSize);
      
      for (const product of cartProducts) {
        try {
          await prisma.cartItem.create({
            data: {
              userId: user.id,
              productId: product.id,
              quantity: Math.floor(Math.random() * 3) + 1
            }
          });
          cartCount++;
        } catch (error) {
          // Skip duplicates
        }
      }
    }
  }
  console.log(`✅ Created ${cartCount} cart items`);

  // 10. Create Settings
  console.log('⚙️ Creating settings...');
  const settings = [
    { category: 'general', key: 'site_name', value: 'Luxury Jewelry Store', description: 'Website name', isPublic: true },
    { category: 'general', key: 'site_description', value: 'Premium jewelry and engagement rings', description: 'Site description', isPublic: true },
    { category: 'general', key: 'currency', value: 'INR', description: 'Default currency', isPublic: true },
    { category: 'general', key: 'timezone', value: 'America/New_York', description: 'Default timezone', isPublic: false },
    
    { category: 'shipping', key: 'free_shipping_threshold', value: '100', description: 'Free shipping minimum order', isPublic: true },
    { category: 'shipping', key: 'standard_shipping_rate', value: '15.99', description: 'Standard shipping rate', isPublic: true },
    { category: 'shipping', key: 'express_shipping_rate', value: '29.99', description: 'Express shipping rate', isPublic: true },
    { category: 'shipping', key: 'overnight_shipping_rate', value: '49.99', description: 'Overnight shipping rate', isPublic: true },
    
    { category: 'tax', key: 'default_tax_rate', value: '8.5', description: 'Default tax rate percentage', isPublic: false },
    { category: 'tax', key: 'tax_calculation', value: 'automatic', description: 'Tax calculation method', isPublic: false },
    
    { category: 'payment', key: 'stripe_publishable_key', value: 'pk_test_example', description: 'Stripe publishable key', isPublic: true },
    { category: 'payment', key: 'stripe_secret_key', value: 'sk_test_example', description: 'Stripe secret key', isPublic: false },
    { category: 'payment', key: 'paypal_client_id', value: 'paypal_client_example', description: 'PayPal client ID', isPublic: true },
    
    { category: 'email', key: 'smtp_host', value: 'smtp.gmail.com', description: 'SMTP host', isPublic: false },
    { category: 'email', key: 'smtp_port', value: '587', description: 'SMTP port', isPublic: false },
    { category: 'email', key: 'from_email', value: 'noreply@jewelry-store.com', description: 'From email address', isPublic: false },
    { category: 'email', key: 'support_email', value: 'support@jewelry-store.com', description: 'Support email', isPublic: true },
    
    { category: 'inventory', key: 'low_stock_threshold', value: '5', description: 'Low stock alert threshold', isPublic: false },
    { category: 'inventory', key: 'track_inventory', value: 'true', description: 'Enable inventory tracking', isPublic: false },
    
    { category: 'seo', key: 'meta_title', value: 'Luxury Jewelry Store - Premium Engagement Rings & Fine Jewelry', description: 'Meta title', isPublic: true },
    { category: 'seo', key: 'meta_description', value: 'Discover our collection of luxury jewelry, engagement rings, and fine accessories. Premium quality and exceptional craftsmanship.', description: 'Meta description', isPublic: true }
  ];

  for (const setting of settings) {
    await prisma.setting.create({ data: setting });
  }
  console.log(`✅ Created ${settings.length} settings`);

  // 11. Create Admin Logs
  console.log('📝 Creating admin logs...');
  const adminActions = ['create', 'update', 'delete', 'approve', 'reject'];
  const resources = ['product', 'user', 'order', 'coupon', 'category', 'review'];
  
  for (let i = 0; i < 25; i++) {
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: getRandomElement(adminActions),
        resource: getRandomElement(resources),
        resourceId: Math.floor(Math.random() * 100) + 1,
        oldValues: { status: 'pending' },
        newValues: { status: 'approved' },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  }
  console.log(`✅ Created 25 admin logs`);

  // Final Statistics
  console.log('\n🎉 Seed completed successfully!');
  console.log('📊 Final Statistics:');
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   📂 Categories: ${categories.length}`);
  console.log(`   💎 Products: ${products.length}`);
  console.log(`   🛒 Orders: ${orders.length}`);
  console.log(`   ⭐ Reviews: ${reviewCount}`);
  console.log(`   ❤️ Wishlist Items: ${wishlistCount}`);
  console.log(`   🛍️ Cart Items: ${cartCount}`);
  console.log(`   🏠 Addresses: ${addressCount}`);
  console.log(`   🎫 Coupons: ${coupons.length}`);
  console.log(`   ⚙️ Settings: ${settings.length}`);
  console.log(`   📝 Admin Logs: 25`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });