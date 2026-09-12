import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '../../../../src/lib/mailer';

interface BookingConfirmationRequest {
  traineeName: string;
  traineeEmail: string;
  traineePhone: string;
  bookingRef: string;
  departmentName: string;
  hospitalName: string;
  city: string;
  duration: string;
  amountPaid: number;
  paymentMethod: string;
  startDate: string;
}

// Sends the email over SMTP using the configured transactional mailbox
async function sendEmailNotification(
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { messageId } = await sendMail({ to, subject, html: htmlContent });
    return { success: true, messageId };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BookingConfirmationRequest;

    const {
      traineeName,
      traineeEmail,
      bookingRef,
      departmentName,
      hospitalName,
      city,
      duration,
      amountPaid,
      paymentMethod,
      startDate
    } = body;

    // Validate required fields
    if (!traineeEmail || !traineeName || !bookingRef) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, name, or booking reference' },
        { status: 400 }
      );
    }

    // Format amount for display
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amountPaid);

    // Create email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2F855A 0%, #276749 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
            .booking-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2F855A; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .amount-row { font-size: 18px; font-weight: bold; color: #2F855A; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 6px; margin-top: 20px; }
            .button { display: inline-block; background: #2F855A; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
            .highlight { background: #EBF7F1; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Payment Successful!</h1>
              <p style="margin: 10px 0; font-size: 14px;">Your TrainMedix Clinical Rotation Booking is Confirmed</p>
            </div>

            <div class="content">
              <p>Dear Dr. ${traineeName},</p>
              
              <p>Thank you for completing your payment! We're thrilled to confirm your clinical rotation booking with TrainMedix. Your specialized training has been successfully reserved.</p>

              <div class="highlight">
                <strong>Booking Confirmation Details</strong>
              </div>

              <div class="booking-details">
                <div class="detail-row">
                  <span class="label">Booking Reference:</span>
                  <span class="value" style="font-weight: bold; color: #2F855A;">${bookingRef}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Specialization Department:</span>
                  <span class="value">${departmentName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Hospital:</span>
                  <span class="value">${hospitalName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Location:</span>
                  <span class="value">${city}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Training Duration:</span>
                  <span class="value">${duration}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Expected Start Date:</span>
                  <span class="value">${startDate}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Method:</span>
                  <span class="value">${paymentMethod}</span>
                </div>
                <div class="detail-row amount-row">
                  <span class="label">Amount Paid:</span>
                  <span class="value">${formattedAmount}</span>
                </div>
              </div>

              <h3 style="color: #2F855A; margin-top: 25px;">What's Next?</h3>
              <ol>
                <li><strong>Hospital Verification (24-48 hours):</strong> The ${hospitalName} admin team will verify your medical credentials and documents. You'll receive an email once approved.</li>
                <li><strong>Pre-Rotation Orientation:</strong> Attend the mandatory online orientation covering hospital protocols, logbook procedures, and safety guidelines.</li>
                <li><strong>Onboarding at Hospital:</strong> Report to the hospital on your rotation start date with all original documents and ID proof.</li>
                <li><strong>Logbook Tracking:</strong> Track all procedures observed/assisted in your DMHCA-certified digital logbook throughout the rotation.</li>
                <li><strong>Certificate Issuance:</strong> Receive your official DMHCA certification upon successful completion and logbook approval.</li>
              </ol>

              <h3 style="color: #2F855A;">Important Information</h3>
              <ul>
                <li><strong>Cancellation Policy:</strong> Full refund available if cancelled within 7 days of payment</li>
                <li><strong>Rescheduling:</strong> Contact hospital admin to reschedule your rotation dates (subject to availability)</li>
                <li><strong>Document Submission:</strong> Ensure all required documents are uploaded in your TrainMedix dashboard</li>
                <li><strong>Support:</strong> Need help? Contact our support team at support@trainmedix.com or WhatsApp us for quick assistance</li>
              </ul>

              <div class="highlight">
                <p><strong>📋 Receipt & Documents</strong></p>
                <p>Your detailed payment receipt and booking confirmation have been automatically saved to your TrainMedix dashboard account. You can download them anytime for your records.</p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="https://trainmedix.com/dashboard/bookings" class="button">View Your Booking</a>
              </p>

              <p>We look forward to supporting your clinical development!</p>
              
              <p>Best regards,<br>
              <strong>TrainMedix Team</strong><br>
              Hospital Clinical Training Platform<br>
              DMHCA Accredited Programs</p>
            </div>

            <div class="footer">
              <p>This is an automated email from TrainMedix. Please do not reply to this email.</p>
              <p>For support, contact: support@trainmedix.com | WhatsApp: +91-XXXX-XXXX-XX</p>
              <p style="margin-top: 15px;">© 2026 TrainMedix. All rights reserved. | Privacy Policy | Terms of Service</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send confirmation email
    const emailResult = await sendEmailNotification(
      traineeEmail,
      `Payment Confirmed - TrainMedix Clinical Rotation Booking ${bookingRef}`,
      htmlContent
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking confirmation email sent successfully',
      messageId: emailResult.messageId,
      bookingRef
    });
  } catch (error: any) {
    console.error('Error in booking confirmation email:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
