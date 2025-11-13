# Delhivery-Razorpay Integration Guide

## Overview

This guide documents the integration of Delhivery shipping services with Razorpay payment processing. When a user completes a successful Razorpay payment, the system automatically creates a Delhivery shipment for order delivery.

## Integration Flow

1. **User Payment**: User adds items to cart and proceeds with Razorpay payment
2. **Payment Verification**: System verifies Razorpay payment using signature verification
3. **Order Confirmation**: Payment status updated to 'COMPLETED', order status set to 'CONFIRMED'
4. **Automatic Shipment Creation**: Delhivery shipment created automatically after successful payment
5. **Tracking Updates**: Delhivery webhook updates order and shipping status in real-time

## Files Created/Modified

### Core Service Files
- `lib/delhivery.ts` - Delhivery API configuration and types
- `lib/services/delhivery.ts` - Delhivery shipment creation and tracking services
- `lib/services/payment.ts` - Updated to trigger Delhivery shipment after payment

### API Endpoints
- `app/api/delhivery/webhook/route.ts` - Webhook endpoint for Delhivery tracking updates

### Configuration
- `ENVIRONMENT_SETUP.md` - Updated with Delhivery configuration variables

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Delhivery Shipping Integration
DELHIVERY_BASE_URL="https://track.delhivery.com"
DELHIVERY_API_KEY="your-delhivery-api-key"
DELHIVERY_CLIENT_NAME="ElegantJewelry"
```

## Key Features

### 1. Automatic Shipment Creation
- Triggered immediately after successful Razorpay payment
- Uses order details (items, addresses, customer info) to create shipment
- Handles errors gracefully - payment success is not dependent on shipment creation

### 2. Real-time Tracking Updates
- Delhivery webhook endpoint receives tracking updates
- Automatically updates order and shipping status based on tracking data
- Maps Delhivery status codes to application status enums

### 3. Error Handling
- Shipment creation failures don't affect payment success
- Comprehensive logging for debugging
- Graceful fallback to manual shipping processing

## API Integration Details

### Shipment Creation
- **Endpoint**: Delhivery Create Shipment API
- **Trigger**: After successful Razorpay payment verification
- **Data**: Order details, customer info, shipping address, item details
- **Response**: Tracking number and shipment details

### Webhook Handling
- **Endpoint**: `/api/delhivery/webhook`
- **Method**: POST
- **Payload**: Tracking updates from Delhivery
- **Security**: Signature verification (implement based on Delhivery docs)

## Status Mapping

### Delhivery to Application Status Mapping
- `manifest` → Order: CONFIRMED, Shipping: PENDING
- `in_transit/dispatched/picked_up` → Order: SHIPPED, Shipping: SHIPPED
- `out_for_delivery` → Order: OUT_FOR_DELIVERY, Shipping: OUT_FOR_DELIVERY
- `delivered` → Order: DELIVERED, Shipping: DELIVERED
- `undelivered` → Order: FAILED, Shipping: FAILED
- `rto` → Order: RETURNED, Shipping: RETURNED
- `cancelled` → Order: CANCELLED, Shipping: CANCELLED

## Testing

### 1. Payment Flow Testing
1. Add items to cart
2. Proceed to checkout
3. Complete Razorpay payment
4. Verify shipment creation in logs
5. Check database for shipping record

### 2. Webhook Testing
1. Use Delhivery sandbox environment
2. Manually trigger webhook with test payload
3. Verify order status updates
4. Check shipping status changes

### 3. Error Scenario Testing
1. Test with invalid Delhivery API key
2. Test with malformed webhook payload
3. Verify payment still succeeds even if shipment creation fails

## Security Considerations

1. **API Key Management**: Store Delhivery API keys securely in environment variables
2. **Webhook Security**: Implement signature verification for webhook authenticity
3. **Error Logging**: Log errors without exposing sensitive data
4. **Rate Limiting**: Consider implementing rate limiting for webhook endpoint

## Production Deployment

1. **Environment Variables**: Ensure all Delhivery variables are set in production
2. **Webhook URL**: Configure Delhivery dashboard with production webhook URL
3. **SSL Certificate**: Ensure webhook endpoint uses HTTPS
4. **Monitoring**: Set up monitoring for shipment creation and webhook processing
5. **Backup Shipping**: Have manual shipping process as backup

## Troubleshooting

### Common Issues

1. **Shipment Creation Fails**
   - Check Delhivery API credentials
   - Verify order data completeness
   - Check network connectivity

2. **Webhook Not Receiving Updates**
   - Verify webhook URL configuration in Delhivery dashboard
   - Check webhook endpoint accessibility
   - Review server logs for webhook requests

3. **Status Updates Not Working**
   - Verify status mapping configuration
   - Check database connectivity
   - Review webhook payload format

### Debug Steps

1. Check application logs for Delhivery integration messages
2. Verify environment variables are loaded correctly
3. Test Delhivery API connectivity
4. Monitor webhook endpoint for incoming requests

## Next Steps

1. **Delhivery Account Setup**: Create Delhivery business account and obtain API keys
2. **Sandbox Testing**: Test integration in Delhivery sandbox environment
3. **Production Configuration**: Configure production Delhivery credentials
4. **Webhook Setup**: Configure webhook URL in Delhivery dashboard
5. **Monitoring**: Set up alerts for integration failures

## Support

For issues related to:
- **Delhivery API**: Contact Delhivery support or refer to their documentation
- **Payment Integration**: Check Razorpay integration guide
- **Application Issues**: Review application logs and error messages