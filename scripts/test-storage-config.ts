#!/usr/bin/env tsx

/**
 * Test script to validate storage configuration
 * Run this script to check if your storage setup is working correctly
 * 
 * Usage:
 * npx tsx scripts/test-storage-config.ts
 */

import { validateStorageConfig, getStorageInfo } from '../lib/storage/providers'

async function testStorageConfig() {
  console.log('🔍 Testing Storage Configuration...\n')
  
  // Get storage info
  const info = getStorageInfo()
  console.log('📊 Storage Provider Info:')
  console.log(`   Provider: ${info.provider}`)
  console.log(`   Configured: ${info.isConfigured ? '✅' : '❌'}`)
  console.log(`   Environment Variables:`)
  Object.entries(info.environment).forEach(([key, value]) => {
    console.log(`     ${key}: ${value || 'Not set'}`)
  })
  
  if (!info.isConfigured) {
    console.log('\n❌ Configuration Errors:')
    info.errors.forEach(error => {
      console.log(`   • ${error}`)
    })
    console.log('\n💡 Please check your .env.production file and ensure all required variables are set.')
    process.exit(1)
  }
  
  console.log('\n✅ Storage configuration is valid!')
  
  // Test upload directory for local storage
  if (info.environment.STORAGE_PROVIDER === 'local') {
    const fs = require('fs')
    const path = require('path')
    
    const uploadPath = info.environment.UPLOAD_BASE_PATH
    if (uploadPath) {
      try {
        if (!fs.existsSync(uploadPath)) {
          console.log(`\n📁 Creating upload directory: ${uploadPath}`)
          fs.mkdirSync(uploadPath, { recursive: true })
          console.log('✅ Upload directory created successfully')
        } else {
          console.log(`\n✅ Upload directory exists: ${uploadPath}`)
        }
        
        // Test write permissions
        const testFile = path.join(uploadPath, '.test-write')
        fs.writeFileSync(testFile, 'test')
        fs.unlinkSync(testFile)
        console.log('✅ Write permissions verified')
        
      } catch (error) {
        console.log(`\n❌ Error with upload directory: ${error}`)
        process.exit(1)
      }
    }
  }
  
  console.log('\n🎉 Storage configuration test completed successfully!')
}

// Run test if this script is executed directly
if (require.main === module) {
  testStorageConfig()
}

export { testStorageConfig }
