#!/usr/bin/env tsx

/**
 * Migration script to convert relative image URLs to absolute URLs
 * Run this script after updating your environment variables
 * 
 * Usage:
 * npx tsx scripts/migrate-image-urls.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateImageUrls() {
  try {
    console.log('Starting image URL migration...')
    
    // Get the base URL from environment
    const baseUrl = process.env.UPLOAD_BASE_URL || 'https://silverline925.in/uploads/products'
    
    if (!baseUrl) {
      throw new Error('UPLOAD_BASE_URL environment variable is required')
    }
    
    console.log(`Using base URL: ${baseUrl}`)
    
    // Find all ProductImage records with relative URLs
    const imagesWithRelativeUrls = await prisma.productImage.findMany({
      where: {
        url: {
          not: {
            startsWith: 'http'
          }
        }
      }
    })
    
    console.log(`Found ${imagesWithRelativeUrls.length} images with relative URLs`)
    
    if (imagesWithRelativeUrls.length === 0) {
      console.log('No images need migration')
      return
    }
    
    // Update each image URL
    let updatedCount = 0
    for (const image of imagesWithRelativeUrls) {
      try {
        // Extract filename from relative URL
        const filename = image.url.split('/').pop()
        if (!filename) {
          console.warn(`Could not extract filename from URL: ${image.url}`)
          continue
        }
        
        // Create new absolute URL
        const newUrl = `${baseUrl}/${filename}`
        
        // Update the record
        await prisma.productImage.update({
          where: { id: image.id },
          data: { url: newUrl }
        })
        
        console.log(`Updated: ${image.url} → ${newUrl}`)
        updatedCount++
        
      } catch (error) {
        console.error(`Error updating image ${image.id}:`, error)
      }
    }
    
    console.log(`Migration completed. Updated ${updatedCount} images.`)
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateImageUrls()
}

export { migrateImageUrls }
