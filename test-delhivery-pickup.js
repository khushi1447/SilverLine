// Test script for Delhivery createPickup functionality
const { getDelhiveryService, getEnvPickupAddress } = require('./lib/delhivery.ts');

async function testCreatePickup() {
  try {
    console.log('Testing Delhivery createPickup functionality...');
    
    // Get pickup address from environment
    const pickupAddress = getEnvPickupAddress();
    console.log('Pickup address from environment:', pickupAddress);
    
    // Initialize Delhivery service
    const delhiveryService = getDelhiveryService();
    console.log('Delhivery service initialized');
    
    // Test create pickup
    console.log('Creating pickup location with Delhivery...');
    const result = await delhiveryService.createPickup({
      name: pickupAddress.name,
      address: pickupAddress.address,
      city: pickupAddress.city,
      state: pickupAddress.state,
      pin: pickupAddress.pin,
      country: pickupAddress.country,
      phone: pickupAddress.phone,
      email: pickupAddress.email,
      type: 'pickup',
    });
    
    console.log('Create pickup result:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS: Pickup location created successfully');
      console.log('Warehouse ID:', result.warehouseId);
    } else {
      console.log('❌ FAILED: Could not create pickup location');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ ERROR in test:', error.message);
  }
}

// Run the test
testCreatePickup();