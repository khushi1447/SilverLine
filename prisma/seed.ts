import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Rings' },
      update: {},
      create: {
        name: 'Rings',
        description: 'Elegant rings for every occasion',
        imageUrl: '/images/categories/rings.jpg',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Necklaces' },
      update: {},
      create: {
        name: 'Necklaces',
        description: 'Beautiful necklaces and pendants',
        imageUrl: '/images/categories/necklaces.jpg',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Earrings' },
      update: {},
      create: {
        name: 'Earrings',
        description: 'Stunning earrings for any style',
        imageUrl: '/images/categories/earrings.jpg',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Bracelets' },
      update: {},
      create: {
        name: 'Bracelets',
        description: 'Stylish bracelets and bangles',
        imageUrl: '/images/categories/bracelets.jpg',
      },
    }),
  ]);

  console.log('Categories created:', categories.length);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@jewelry.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@jewelry.com',
      password: hashedPassword,
      isAdmin: true,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      password: userPassword,
      phone: '+1234567890',
      isAdmin: false,
    },
  });

  console.log('Users created');

  // Create products
  const products = [
    {
      name: 'Diamond Solitaire Ring',
      description: 'A classic diamond solitaire ring featuring a brilliant cut diamond in a timeless setting.',
      shortDescription: 'Classic diamond solitaire ring',
      price: 2999.99,
      // comparePrice: 3499.99,
      // cost: 1500.00,
      // sku:'DSR-001',
      stock: 15,
      categoryId: categories[0].id, // Rings
      weight: 3.5,
      size: '6',
      certification: 'GIA',
      // status: 'active',
    },
    {
      name: 'Gold Tennis Bracelet',
      description: 'Elegant tennis bracelet with round diamonds set in 14K yellow gold.',
      shortDescription: 'Diamond tennis bracelet in gold',
      price: 1899.99,
      // comparePrice: 2199.99,
      // cost: 950.00,
      // sku:'GTB-002',
      stock: 8,
      categoryId: categories[3].id, // Bracelets
      weight: 12.3,
      size: '7 inches',
      certification: 'GIA',
      // status: 'active',
    },
    {
      name: 'Pearl Drop Earrings',
      description: 'Elegant freshwater pearl drop earrings with sterling silver hooks.',
      shortDescription: 'Freshwater pearl drop earrings',
      price: 299.99,
      // cost: 150.00,
      // sku:'PDE-003',
      stock: 25,
      categoryId: categories[2].id, // Earrings
      weight: 4.2,
      size: '1.5 inches',
      // status: 'active',
    },
    {
      name: 'Ruby Heart Pendant',
      description: 'Beautiful heart-shaped ruby pendant with white gold chain.',
      shortDescription: 'Ruby heart pendant necklace',
      price: 899.99,
      // cost: 450.00,
      // sku:'RHP-004',
      stock: 12,
      categoryId: categories[1].id, // Necklaces
      weight: 6.8,
      size: '18 inches',
      // status: 'active',
    },
    {
      name: 'Emerald Cocktail Ring',
      description: 'Statement emerald cocktail ring with halo of diamonds.',
      shortDescription: 'Emerald cocktail ring with diamonds',
      price: 3499.99,
      // cost: 1750.00,
      // sku:'ECR-005',
      stock: 6,
      categoryId: categories[0].id, // Rings
      weight: 8.1,
      size: '7',
      // status: 'active',
    },
    {
      name: 'Silver Chain Bracelet',
      description: 'Simple and elegant sterling silver chain bracelet.',
      shortDescription: 'Sterling silver chain bracelet',
      price: 149.99,
      // cost: 75.00,
      // sku:'SCB-006',
      stock: 30,
      categoryId: categories[3].id, // Bracelets
      weight: 8.5,
      size: '8 inches',
      // status: 'active',
    },
  ];

  const createdProducts = [];
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });
    createdProducts.push(product);
  }

  console.log('Products created:', createdProducts.length);

  // Create product images
  const productImages = [
    // Diamond Solitaire Ring
    { productId: createdProducts[0].id, url: '/images/1.jpg', altText: 'Diamond Solitaire Ring Front View', isPrimary: true, sortOrder: 1 },
    { productId: createdProducts[0].id, url: '/images/2.jpg', altText: 'Diamond Solitaire Ring Side View', isPrimary: false, sortOrder: 2 },
    
    // Gold Tennis Bracelet
    { productId: createdProducts[1].id, url: '/images/3.jpg', altText: 'Gold Tennis Bracelet', isPrimary: true, sortOrder: 1 },
    { productId: createdProducts[1].id, url: '/images/4.jpg', altText: 'Gold Tennis Bracelet Detail', isPrimary: false, sortOrder: 2 },
    
    // Pearl Drop Earrings
    { productId: createdProducts[2].id, url: '/images/5.jpg', altText: 'Pearl Drop Earrings', isPrimary: true, sortOrder: 1 },
    
    // Ruby Heart Pendant
    { productId: createdProducts[3].id, url: '/images/6.jpg', altText: 'Ruby Heart Pendant', isPrimary: true, sortOrder: 1 },
    { productId: createdProducts[3].id, url: '/images/7.jpg', altText: 'Ruby Heart Pendant Chain', isPrimary: false, sortOrder: 2 },
    
    // Emerald Cocktail Ring
    { productId: createdProducts[4].id, url: '/images/8.jpg', altText: 'Emerald Cocktail Ring', isPrimary: true, sortOrder: 1 },
    { productId: createdProducts[4].id, url: '/images/9.jpg', altText: 'Emerald Cocktail Ring Side', isPrimary: false, sortOrder: 2 },
    
    // Silver Chain Bracelet
    { productId: createdProducts[5].id, url: '/images/10.jpg', altText: 'Silver Chain Bracelet', isPrimary: true, sortOrder: 1 },
  ];

  for (const imageData of productImages) {
    await prisma.productImage.create({
      data: imageData,
    });
  }

  console.log('Product images created:', productImages.length);

  // Create user address
  await prisma.address.create({
    data: {
      userId: regularUser.id,
      type: 'BOTH',
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1234567890',
      isDefault: true,
    },
  });

  // Create a coupon
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      name: 'Welcome 10% Off',
      description: 'Welcome discount for new customers',
      discountType: 'PERCENTAGE',
      discountValue: 10.00,
      minOrderValue: 100.00,
      maxDiscount: 500.00,
      usageLimit: 100,
      usageCount: 0,
      perUserLimit: 1,
      isActive: true,
      expiresAt: new Date('2025-12-31'),
    },
  });

  // Create settings
  const settings = [
    { category: 'general', key: 'site_name', value: 'Jewelry Store', description: 'Website name' },
    { category: 'general', key: 'currency', value: 'INR', description: 'Default currency' },
    { category: 'shipping', key: 'free_shipping_threshold', value: '100', description: 'Free shipping minimum order' },
    { category: 'tax', key: 'default_tax_rate', value: '8.5', description: 'Default tax rate percentage' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Settings created');

  // Create some reviews
  await prisma.review.create({
    data: {
      userId: regularUser.id,
      productId: createdProducts[0].id,
      rating: 5,
      title: 'Absolutely stunning!',
      comment: 'This ring exceeded my expectations. The diamond is beautiful and the setting is perfect.',
      isVerified: true,
      isApproved: true,
    },
  });

  await prisma.review.create({
    data: {
      userId: regularUser.id,
      productId: createdProducts[1].id,
      rating: 4,
      title: 'Great quality',
      comment: 'Beautiful bracelet, exactly as described. Fast shipping too!',
      isVerified: true,
      isApproved: true,
    },
  });

  console.log('Reviews created');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });