import nodemailer from 'nodemailer';
import { config } from './config';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // For production, use environment variables for email credentials
  // For development, you can use Gmail App Password or a service like SendGrid
  
  if (!process.env.SMTP_HOST) {
    console.warn('Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  tip: number;
  discount?: number;
  total: number;
  fulfilment: 'pickup' | 'delivery';
  slotStart?: Date;
  slotEnd?: Date;
  address?: {
    line1: string;
    city: string;
    postcode: string;
  };
  phone: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Email not sent - SMTP not configured. Order details:', {
        orderId: data.orderId,
        customerEmail: data.customerEmail,
      });
      return false;
    }

    // Format time slot
    let timeSlotText = '';
    if (data.slotStart && data.slotEnd) {
      const startTime = new Date(data.slotStart).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const endTime = new Date(data.slotEnd).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      timeSlotText = `${startTime} - ${endTime}`;
    }

    // Format items list
    const itemsList = data.items
      .map(item => {
        const itemTotal = (item.price * item.quantity) / 100;
        return `  • ${item.name} x${item.quantity} - £${itemTotal.toFixed(2)}`;
      })
      .join('\n');

    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FFD500; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .order-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .total { font-size: 20px; font-weight: bold; color: #FFD500; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #000; margin: 0;">Order Confirmed!</h1>
              <p style="color: #000; margin: 10px 0 0 0;">Thank you for your order, ${data.customerName}!</p>
            </div>
            <div class="content">
              <div class="order-details">
                <h2 style="margin-top: 0;">Order Details</h2>
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                
                <h3>Items Ordered:</h3>
                <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${itemsList}</pre>
                
                ${timeSlotText ? `<p><strong>Time Slot:</strong> ${timeSlotText}</p>` : ''}
                
                <p><strong>Fulfilment Type:</strong> ${data.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                
                ${data.fulfilment === 'delivery' && data.address ? `
                  <p><strong>Delivery Address:</strong><br>
                  ${data.address.line1}<br>
                  ${data.address.city}<br>
                  ${data.address.postcode}</p>
                ` : ''}
                
                <p><strong>Contact:</strong> ${data.phone}</p>
              </div>
              
              <div class="order-details">
                <h3 style="margin-top: 0;">Order Summary</h3>
                <p>Subtotal: £${(data.subtotal / 100).toFixed(2)}</p>
                ${data.deliveryFee > 0 ? `<p>Delivery Fee: £${(data.deliveryFee / 100).toFixed(2)}</p>` : ''}
                ${data.discount && data.discount > 0 ? `<p style="color: green;">Discount: -£${(data.discount / 100).toFixed(2)}</p>` : ''}
                ${data.tip > 0 ? `<p>Tip: £${(data.tip / 100).toFixed(2)}</p>` : ''}
                <p class="total">Total: £${(data.total / 100).toFixed(2)}</p>
              </div>
              
              <p style="margin-top: 20px;">
                ${data.fulfilment === 'delivery' 
                  ? 'We\'ll prepare your order and deliver it to your address during the selected time slot.'
                  : 'You can pick up your order from our restaurant during the selected time slot.'}
              </p>
              
              <p><strong>Restaurant Address:</strong><br>
              ${config.restaurant.name}<br>
              ${config.restaurant.address}</p>
              
              <p>If you have any questions, please contact us at your convenience.</p>
            </div>
            <div class="footer">
              <p>${config.restaurant.name} - Thank you for your order!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Order Confirmed!

Thank you for your order, ${data.customerName}!

Order Details:
- Order Number: ${data.orderNumber}
- Order Date: ${new Date().toLocaleDateString('en-GB')}
${timeSlotText ? `- Time Slot: ${timeSlotText}` : ''}
- Fulfilment Type: ${data.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}

Items Ordered:
${itemsList}

Order Summary:
- Subtotal: £${(data.subtotal / 100).toFixed(2)}
${data.deliveryFee > 0 ? `- Delivery Fee: £${(data.deliveryFee / 100).toFixed(2)}` : ''}
${data.discount && data.discount > 0 ? `- Discount: -£${(data.discount / 100).toFixed(2)}` : ''}
${data.tip > 0 ? `- Tip: £${(data.tip / 100).toFixed(2)}` : ''}
- Total: £${(data.total / 100).toFixed(2)}

${data.fulfilment === 'delivery' && data.address ? `
Delivery Address:
${data.address.line1}
${data.address.city}
${data.address.postcode}
` : ''}

Restaurant Address:
${config.restaurant.name}
${config.restaurant.address}

If you have any questions, please contact us at your convenience.
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || `"${config.restaurant.name}" <${process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber} - ${config.restaurant.name}`,
      text: emailText,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

export async function sendOrderRejectionEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Email not sent - SMTP not configured. Order details:', {
        orderId: data.orderId,
        customerEmail: data.customerEmail,
      });
      return false;
    }

    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .order-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #fff; margin: 0;">Order Cancelled</h1>
              <p style="color: #fff; margin: 10px 0 0 0;">We're sorry, ${data.customerName}</p>
            </div>
            <div class="content">
              <div class="order-details">
                <h2 style="margin-top: 0;">Order Details</h2>
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                
                <p>Unfortunately, we are unable to fulfill your order at this time. Your payment has been voided and you will not be charged.</p>
                
                <p>If you have any questions or would like to place a new order, please contact us:</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                
                <p>We apologize for any inconvenience and hope to serve you in the future.</p>
              </div>
              
              <p style="margin-top: 20px;">
                <strong>Restaurant Address:</strong><br>
                ${config.restaurant.name}<br>
                ${config.restaurant.address}
              </p>
            </div>
            <div class="footer">
              <p>${config.restaurant.name} - We're here to help!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Order Cancelled

We're sorry, ${data.customerName}!

Order Details:
- Order Number: ${data.orderNumber}
- Order Date: ${new Date().toLocaleDateString('en-GB')}

Unfortunately, we are unable to fulfill your order at this time. Your payment has been voided and you will not be charged.

If you have any questions or would like to place a new order, please contact us.

Restaurant Address:
${config.restaurant.name}
${config.restaurant.address}

We apologize for any inconvenience and hope to serve you in the future.
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || `"${config.restaurant.name}" <${process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `Order Cancelled - ${data.orderNumber} - ${config.restaurant.name}`,
      text: emailText,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order rejection email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send order rejection email:', error);
    return false;
  }
}

