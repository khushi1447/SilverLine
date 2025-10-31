# Production Storage Setup Guide

This guide explains how to configure your jewelry e-commerce application for production storage on your VPS.

## 🎯 Overview

We've migrated from local development storage to a production-ready setup:

| Component | Development | Production |
|-----------|-------------|------------|
| **Storage Path** | `/root/jewelry-ecommerce/public/uploads/products` | `/var/www/jewelry-ecommerce/uploads/products` |
| **Public URL** | `/uploads/products/{filename}` | `https://silverline925.in/uploads/products/{filename}` |
| **Database URLs** | Relative paths | Absolute URLs |
| **Configuration** | Hardcoded | Environment variables |

## 🚀 Quick Setup

### 1. Run the Setup Script

```bash
npx tsx scripts/setup-production-storage.ts
```

This script will:
- ✅ Validate your environment variables
- 📁 Create the upload directory
- 🔍 Check for existing images that need migration
- 📋 Provide next steps

### 2. Update Nginx Configuration

Add this to your Nginx configuration:

```nginx
location /uploads/ {
    alias /var/www/jewelry-ecommerce/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Migrate Existing Images (if any)

If you have existing images with relative URLs:

```bash
npx tsx scripts/migrate-image-urls.ts
```

### 4. Restart Your Application

```bash
pm2 restart jewelry-app
```

### 5. Test the Configuration

```bash
npx tsx scripts/test-storage-config.ts
```

## 🔧 Environment Variables

Your `.env.production` file should contain:

```env
# Storage Configuration
STORAGE_PROVIDER=local
UPLOAD_BASE_PATH=/var/www/jewelry-ecommerce/uploads/products
UPLOAD_BASE_URL=https://silverline925.in/uploads/products
```

## 📁 Directory Structure

After setup, your directory structure will be:

```
/var/www/jewelry-ecommerce/
├── uploads/
│   └── products/
│       ├── 1234567890-abc123.jpg
│       ├── 1234567891-def456.jpg
│       └── ...
├── app/
├── lib/
└── ...
```

## 🔄 How It Works

### Upload Process

1. **File Upload**: User uploads image via API
2. **Storage**: File saved to `/var/www/jewelry-ecommerce/uploads/products/`
3. **URL Generation**: Full URL created: `https://silverline925.in/uploads/products/filename.jpg`
4. **Database**: Full URL stored in `ProductImage.url`

### URL Resolution

- **Development**: `/uploads/products/filename.jpg` (relative)
- **Production**: `https://silverline925.in/uploads/products/filename.jpg` (absolute)

## 🛠️ Storage Providers

The system supports multiple storage providers:

### Local Storage (Current Setup)
```env
STORAGE_PROVIDER=local
UPLOAD_BASE_PATH=/var/www/jewelry-ecommerce/uploads/products
UPLOAD_BASE_URL=https://silverline925.in/uploads/products
```

### Cloudinary
```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### AWS S3
```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET=your-bucket-name
```

### Vercel Blob
```env
STORAGE_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=your-token
```

## 🔍 Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   sudo chown -R www-data:www-data /var/www/jewelry-ecommerce/uploads/
   sudo chmod -R 755 /var/www/jewelry-ecommerce/uploads/
   ```

2. **Images Not Loading**
   - Check Nginx configuration
   - Verify file permissions
   - Check if files exist in the directory

3. **Migration Issues**
   - Run the migration script again
   - Check database for relative URLs: `SELECT * FROM "ProductImage" WHERE url NOT LIKE 'http%';`

### Debug Commands

```bash
# Check storage configuration
npx tsx scripts/test-storage-config.ts

# List files in upload directory
ls -la /var/www/jewelry-ecommerce/uploads/products/

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check application logs
pm2 logs jewelry-app
```

## 📊 Monitoring

### File System Monitoring
```bash
# Check disk usage
df -h /var/www/jewelry-ecommerce/uploads/

# Monitor file count
find /var/www/jewelry-ecommerce/uploads/products/ -type f | wc -l
```

### Database Monitoring
```sql
-- Check image URLs
SELECT url, COUNT(*) FROM "ProductImage" GROUP BY url LIKE 'http%';

-- Find products without images
SELECT p.id, p.name FROM "Product" p 
LEFT JOIN "ProductImage" pi ON p.id = pi."productId" 
WHERE pi.id IS NULL;
```

## 🔒 Security Considerations

1. **File Permissions**: Ensure proper ownership and permissions
2. **Nginx Security**: Add security headers and rate limiting
3. **File Validation**: The system already validates file types and sizes
4. **Access Control**: Consider adding authentication for admin uploads

## 📈 Performance Optimization

1. **Caching**: Nginx configuration includes 1-year cache headers
2. **Compression**: Enable gzip compression in Nginx
3. **CDN**: Consider using a CDN for better global performance
4. **Image Optimization**: Consider adding image compression/resizing

## 🆘 Support

If you encounter issues:

1. Run the test script: `npx tsx scripts/test-storage-config.ts`
2. Check the logs: `pm2 logs jewelry-app`
3. Verify file permissions and Nginx configuration
4. Ensure all environment variables are set correctly

---

**Note**: This setup is optimized for your VPS environment with Nginx serving static files. The configuration is production-ready and scalable.
