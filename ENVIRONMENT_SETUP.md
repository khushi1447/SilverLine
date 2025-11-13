# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="your-database-connection-string"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Payment Gateway Keys (if using Razorpay, PayPal, etc.)
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Optional: Delhivery Shipping Integration
DELHIVERY_BASE_URL="https://track.delhivery.com"
DELHIVERY_API_KEY="your-delhivery-api-key"
DELHIVERY_CLIENT_NAME="ElegantJewelry"

# Optional: Email Service (if using SendGrid, etc.)
SENDGRID_API_KEY="your-sendgrid-key"
```

## How to Create the .env.local File

1. **In your project root directory**, create a new file called `.env.local`
2. **Copy the template above** and replace the placeholder values with your actual configuration
3. **Save the file** - it should be in the same directory as your `package.json`

## Important Notes

- **Never commit `.env.local` to version control** - it's already in `.gitignore`
- **Restart your development server** after creating/modifying the `.env.local` file
- **The `NEXT_PUBLIC_` prefix** is required for variables that need to be accessible in the browser
- **Use strong, unique secrets** for production environments

## Testing the Configuration

After setting up the environment variables:

1. **Start your development server**: `npm run dev`
2. **Check the browser console** for any API connection errors
3. **Visit the home page** to see if products are loading from the API
4. **Check the admin dashboard** to see if stats are loading

## Troubleshooting

### Common Issues:

1. **"API URL not found"** - Check that `NEXT_PUBLIC_API_URL` is set correctly
2. **"Authentication failed"** - Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
3. **"Database connection failed"** - Check your `DATABASE_URL` format
4. **"Products not loading"** - Ensure your backend API is running and accessible

### Development vs Production:

- **Development**: Use `http://localhost:3000` for API URL
- **Production**: Use your actual domain (e.g., `https://yourdomain.com`)

## Next Steps

Once your environment is configured:

1. **Test the API integration** by visiting different pages
2. **Check that data is loading** from your backend APIs
3. **Verify authentication** is working properly
4. **Test the checkout flow** with real API calls

The application should now be fully integrated with your backend APIs!
