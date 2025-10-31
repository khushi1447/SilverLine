import { NextRequest, NextResponse } from "next/server"
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      )
    }

    // Log the contact form data (this will always work)
    console.log('=== NEW CONTACT FORM SUBMISSION ===')
    console.log('Name:', name)
    console.log('Email:', email)
    console.log('Subject:', subject)
    console.log('Message:', message)
    console.log('Timestamp:', new Date().toISOString())
    console.log('=====================================')

    // Try to send email if configuration is available
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        // Create transporter (using Gmail SMTP)
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        // Email content
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: 'ac@silverline925.in',
          subject: `Contact Form: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
                New Contact Form Submission - Silver Line
              </h2>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Contact Details</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
              </div>
              
              <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h3 style="color: #374151; margin-top: 0;">Message</h3>
                <p style="line-height: 1.6; color: #4b5563;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  This message was sent from the Silver Line contact form on ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          `,
          text: `
            New Contact Form Submission - Silver Line
            
            Name: ${name}
            Email: ${email}
            Subject: ${subject}
            
            Message:
            ${message}
            
            Sent on: ${new Date().toLocaleString()}
          `,
        }

        // Send email
        const result = await transporter.sendMail(mailOptions)
        console.log('Email sent successfully:', result.messageId)

        return NextResponse.json({
          success: true,
          message: "Message sent successfully! We'll get back to you soon."
        })

      } catch (emailError) {
        console.error('Email sending failed, but contact data is logged:', emailError)
        // Continue to success response since data is logged
      }
    } else {
      console.log('Email configuration not set up. Contact data logged above.')
    }

    // Always return success since we've logged the data
    return NextResponse.json({
      success: true,
      message: "Message received! We'll get back to you soon. (Contact data logged for manual follow-up)"
    })

  } catch (error) {
    console.error('Error processing contact form:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process message. Please try again or contact us directly at ac@silverline925.in" 
      },
      { status: 500 }
    )
  }
}
