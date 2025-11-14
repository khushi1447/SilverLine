import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { getDelhiveryService, getEnvPickupAddress } from "../../../../../lib/delhivery";

// Import the extended session type
// import "@/types/next-auth";

export async function POST(request: NextRequest) {
  try {
    // Check admin session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get pickup details from environment
    const pickupAddress = getEnvPickupAddress();
    
    // Initialize Delhivery service
    const delhiveryService = getDelhiveryService();
    
    // Create pickup location with Delhivery
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

    if (result.success) {
      console.log('Delhivery pickup location created successfully:', {
        warehouseId: result.warehouseId,
        name: pickupAddress.name,
        city: pickupAddress.city,
        pin: pickupAddress.pin,
      });

      return NextResponse.json({
        success: true,
        warehouseId: result.warehouseId,
        message: 'Pickup location created successfully',
        details: {
          name: pickupAddress.name,
          address: pickupAddress.address,
          city: pickupAddress.city,
          state: pickupAddress.state,
          pin: pickupAddress.pin,
          phone: pickupAddress.phone,
          email: pickupAddress.email,
        }
      });
    } else {
      console.error('Failed to create Delhivery pickup location:', result.error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to create pickup location',
          details: {
            name: pickupAddress.name,
            address: pickupAddress.address,
            city: pickupAddress.city,
            state: pickupAddress.state,
            pin: pickupAddress.pin,
          }
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in create-pickup endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
