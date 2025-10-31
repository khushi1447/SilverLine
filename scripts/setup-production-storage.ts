#!/usr/bin/env tsx

/**
 * Production Storage Setup Script
 * This script handles the complete migration to production storage configuration
 * 
 * Usage:
 * npx tsx scripts/setup-production-storage.ts
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupProductionStorage() {
  console.log('🚀 Setting up Production Storage Configuration...\n')
  
  try {
    // Step 1: Validate environment variables
    console.log('1️⃣ Validating environment variables...')
    const requiredVars = [
      'UPLOAD_BASE_PATH',
      'UPLOAD_BASE_URL',
      'STORAGE_PROVIDER'
    ]
    
    const missingVars = requiredVars.filter(varName => !process.env[varName])
    if (missingVars.length > 0) {
      console.log(`❌ Missing required environment variables: ${missingVars.join(', ')}`)
      console.log('💡 Please ensure your .env.production file is properly configured.')
      process.exit(1)
    }
    
    console.log('✅ Environment variables validated')
    
    // Step 2: Create upload directory
    console.log('\n2️⃣ Setting up upload directory...')
    const uploadPath = process.env.UPLOAD_BASE_PATH!
    
    if (!existsSync(uploadPath)) {
      console.log(`📁 Creating directory: ${uploadPath}`)
      mkdirSync(uploadPath, { recursive: true })
      console.log('✅ Upload directory created')
    } else {
      console.log('✅ Upload directory already exists')
    }
    
    // Step 3: Test write permissions
    console.log('\n3️⃣ Testing write permissions...')
    try {
      const testFile = path.join(uploadPath, '.test-write')
      require('fs').writeFileSync(testFile, 'test')
      require('fs').unlinkSync(testFile)
      console.log('✅ Write permissions verified')
    } catch (error) {
      console.log(`❌ Write permission test failed: ${error}`)
      process.exit(1)
    }
    
    // Step 4: Check for existing images that need migration
    console.log('\n4️⃣ Checking for existing images...')
    const existingImages = await prisma.productImage.findMany({
      where: {
        url: {
          not: {
            startsWith: 'http'
          }
        }
      }
    })
    
    if (existingImages.length > 0) {
      console.log(`📸 Found ${existingImages.length} images with relative URLs`)
      console.log('🔄 These will be migrated to absolute URLs when you run the migration script')
    } else {
      console.log('✅ No images need migration')
    }
    
    // Step 5: Display configuration summary
    console.log('\n5️⃣ Configuration Summary:')
    console.log(`   Storage Provider: ${process.env.STORAGE_PROVIDER}`)
    console.log(`   Upload Path: ${process.env.UPLOAD_BASE_PATH}`)
    console.log(`   Base URL: ${process.env.UPLOAD_BASE_URL}`)
    
    // Step 6: Provide next steps
    console.log('\n📋 Next Steps:')
    console.log('1. Update your Nginx configuration to serve files from the new path:')
    console.log(`   location /uploads/ {`)
    console.log(`       alias ${process.env.UPLOAD_BASE_PATH}/;`)
    console.log(`   }`)
    console.log('')
    console.log('2. If you have existing images, run the migration script:')
    console.log('   npx tsx scripts/migrate-image-urls.ts')
    console.log('')
    console.log('3. Restart your application:')
    console.log('   pm2 restart jewelry-app')
    console.log('')
    console.log('4. Test the configuration:')
    console.log('   npx tsx scripts/test-storage-config.ts')
    
    console.log('\n🎉 Production storage setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupProductionStorage()
}

export { setupProductionStorage }
