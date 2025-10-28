import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"Nomad Stop" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Customer receipt email
export async function sendCustomerReceipt(order: {id: string; customerName: string; customerEmail: string; items: Array<{name: string; quantity: number; price: number}>; total: number; fulfilment: string; createdAt?: Date; slotStart?: Date}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ea580c;">Nomad Stop - Order Confirmation</h1>
      
      <p>Dear ${order.customerName},</p>
      
      <p>Thank you for your order! We've received your payment and are preparing your delicious meal.</p>
      
      <h2>Order Details</h2>
      <p><strong>Order Number:</strong> ${order.id}</p>
      <p><strong>Order Time:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
      <p><strong>Fulfilment:</strong> ${order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</p>
      ${order.slotStart ? `<p><strong>Time Slot:</strong> ${new Date(order.slotStart).toLocaleString()}</p>` : ''}
      
      <h3>Items Ordered</h3>
      <ul>
        ${order.items.map((item: {name: string; quantity: number; price: number}) => `
          <li>${item.name} x${item.quantity} - £${(item.price / 100).toFixed(2)}</li>
        `).join('')}
      </ul>
      
      <h3>Total: £${(order.total / 100).toFixed(2)}</h3>
      
      <p>We'll notify you when your order is ready for ${order.fulfilment === 'delivery' ? 'delivery' : 'pickup'}.</p>
      
      <p>Thank you for choosing Nomad Stop!</p>
    </div>
  `;

  return await sendEmail({
    to: order.customerEmail || 'customer@example.com',
    subject: `Order Confirmation - ${order.id}`,
    html,
  });
}

// Kitchen ticket email
export async function sendKitchenTicket(order: {id: string; customerName: string; customerPhone: string; items: Array<{name: string; quantity: number; price: number; allergens?: string}>; fulfilment: string; notes?: string; slotStart?: Date; total: number}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ea580c;">NEW ORDER - Kitchen Ticket</h1>
      
      <h2>Order #${order.id}</h2>
      <p><strong>Customer:</strong> ${order.customerName}</p>
      <p><strong>Phone:</strong> ${order.customerPhone}</p>
      <p><strong>Type:</strong> ${order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</p>
      ${order.slotStart ? `<p><strong>Time Slot:</strong> ${new Date(order.slotStart).toLocaleString()}</p>` : ''}
      
      <h3>Items to Prepare</h3>
      <ul>
        ${order.items.map((item: {name: string; quantity: number; price: number; allergens?: string}) => `
          <li>${item.name} x${item.quantity}</li>
          ${item.allergens ? `<small>Allergens: ${item.allergens}</small>` : ''}
        `).join('')}
      </ul>
      
      <h3>Special Instructions</h3>
      ${order.notes ? `<p>${order.notes}</p>` : '<p>No special instructions</p>'}
      
      <p><strong>Total: £${(order.total / 100).toFixed(2)}</strong></p>
    </div>
  `;

  return await sendEmail({
    to: 'kitchen@nomadstop.com',
    subject: `Kitchen Ticket - Order #${order.id}`,
    html,
  });
}

// Order status change notification to admin
export async function sendAdminNotification(order: {id: string; customerName: string; customerPhone: string; customerEmail?: string; items: Array<{name: string; quantity: number; price: number}>; total: number; fulfilment: string}, oldStatus: string, newStatus: string): Promise<boolean> {
  const statusMessages: { [key: string]: string } = {
    preparing: 'The order has been marked as preparing',
    ready: 'The order has been marked as ready',
    completed: 'The order has been completed',
    rejected: 'The order has been rejected',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #d4a373;">Nomad Stop - Order Status Change</h1>
      <p>Dear Admin,</p>
      <p>${statusMessages[newStatus] || `Order status changed from ${oldStatus} to ${newStatus}`}</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order Number:</strong> #${order.id}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Phone:</strong> ${order.customerPhone}</p>
        ${order.customerEmail ? `<p><strong>Email:</strong> ${order.customerEmail}</p>` : ''}
        <p><strong>Status:</strong> ${oldStatus} → ${newStatus}</p>
        <p><strong>Total:</strong> £${(order.total / 100).toFixed(2)}</p>
      </div>
      <h3>Items</h3>
      <ul>
        ${order.items.map((item: {name: string; quantity: number; price: number}) => `
          <li>${item.name} x${item.quantity} - £${(item.price / 100).toFixed(2)}</li>
        `).join('')}
      </ul>
    </div>
  `;

  return await sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@nomadstop.com',
    subject: `Order Status Changed - #${order.id}`,
    html,
  });
}
