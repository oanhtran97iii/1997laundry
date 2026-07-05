import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 3001;
const HOST = '127.0.0.1'; // Bind to localhost only for security

// Resolve DB path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../brain.db');
console.log(`[${new Date().toISOString()}] MCP Server using DB at: ${DB_PATH}`);

// --- Database Setup ---
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error(`[${new Date().toISOString()}] Database connection failed:`, err);
    } else {
        console.log(`[${new Date().toISOString()}] Connected to SQLite database.`);
    }
});

// Run DB queries as Promises
function dbQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// --- Helper: Get Resend API Key ---
function getResendApiKey() {
    if (process.env.RESEND_API_KEY) {
        return process.env.RESEND_API_KEY.trim();
    }
    const configPath = path.join(__dirname, '../resend_config.txt');
    if (fs.existsSync(configPath)) {
        try {
            return fs.readFileSync(configPath, 'utf8').trim();
        } catch (e) {
            console.error('Error reading resend_config.txt:', e);
        }
    }
    return '';
}

// --- Helper: Send email via Resend ---
async function sendEmailViaResend(toEmail, subject, htmlContent) {
    const apiKey = getResendApiKey();
    if (!apiKey) {
        console.error('Resend API key is empty or not found.');
        return false;
    }

    try {
        const payload = {
            from: "1997 Laundry <hi@nicefoldsaigon.vn>",
            to: [toEmail],
            subject: subject,
            html: htmlContent
        };

        const response = await fetch("https://api.resend.com/emails", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify(payload)
        });

        const resText = await response.text();
        let resData = {};
        try {
            resData = JSON.parse(resText);
        } catch (e) {
            resData = { raw: resText };
        }

        // Log to email_log.txt in parent directory
        const logLine = `${new Date().toISOString().replace('T', ' ').substring(0, 19)} | To: ${toEmail} | Subject: ${subject} | HTTP Code: ${response.status} | Response: ${JSON.stringify(resData)}\n`;
        fs.appendFileSync(path.join(__dirname, '../email_log.txt'), logLine, 'utf8');

        return response.ok;
    } catch (err) {
        console.error(`Failed to send email via Resend to ${toEmail}:`, err);
        return false;
    }
}

// Email templates
const EMAIL_1_SUBJECT = "Welcome to 1997 Laundry! 🧼";
const EMAIL_1_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="1997 Laundry" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Thank you for sharing your laundry preferences with us!</p>
  <p>Welcome to 1997 Laundry, a premium laundry service designed specifically for travelers and hotel guests in Ho Chi Minh City. Our mission is simple: to make your stay completely hassle-free by taking care of your laundry with the highest standards of hygiene and reliability.</p>
  
  <p>We have saved your preferences. When you are ready to get your laundry done, here is what you can look forward to:</p>
  <ul>
    <li><strong>100% Separate Wash</strong>: We guarantee your clothes are washed separately in dedicated machines. We never mix garments of different customers, ensuring absolute hygiene.</li>
    <li><strong>Checkout Guarantee</strong>: We are the only laundry service in Saigon that guarantees to deliver your clean clothes back to your hotel before your checkout time. No stress about missing flights.</li>
  </ul>
  
  <p>Keep an eye on your inbox—over the next few days, we'll share a few travel hacks to help you avoid common laundry traps in Saigon.</p>
  <p>Welcome to 1997 Laundry!</p>
  <p>Best regards,<br><strong>The 1997 Laundry Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

const EMAIL_2_SUBJECT = "Travel Hack: How to save space and laundry fees in Saigon ✈️";
const EMAIL_2_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="1997 Laundry" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Here is a quick tip to make your stay in Saigon easier: try packing light. Carrying heavy bags through Ho Chi Minh City's busy streets is no fun. Packing light is easy if you wash your clothes on-the-go.</p>
  <p>However, keep these two things in mind when washing clothes in Saigon:</p>
  <ol>
    <li><strong>Hotel Laundry</strong>: It is convenient, but hotels usually charge <em>per piece</em>, which quickly adds up and can double your budget.</li>
    <li><strong>Street Laundry</strong>: While very cheap, they often mix garments from multiple customers to save costs. This compromises hygiene.</li>
  </ol>
  <p>At 1997 Laundry, we wash each customer's clothes 100% separately to ensure absolute cleanliness, and we coordinate directly with your hotel front desk for drop-off and pickup. You get your clothes back same-day without any hassle.</p>
  <p>Have a wonderful trip in Vietnam!</p>
  <p>Best regards,<br><strong>The 1997 Laundry Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

const EMAIL_3_SUBJECT = "Get your laundry done in Saigon (Same-day & Express delivery) ⚡";
const EMAIL_3_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="1997 Laundry" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>If you need your laundry done quickly in Ho Chi Minh City, check us out.</p>
  <p>We offer 3 simple wash & fold packages designed specifically for hotel guests:</p>
  <ul>
    <li><strong>Express Wash & Fold (4h)</strong> - 70,000 VND / kg: Perfect if you are checking out today. We collect and deliver back to your hotel lobby within 4 hours.</li>
    <li><strong>Same-day Wash & Fold (8h-12h)</strong> - 50,000 VND / kg: Our most popular package for standard travelers.</li>
    <li><strong>Standard Wash & Fold (24h)</strong> - 40,000 VND / kg.</li>
  </ul>
  <p>We also offer Premium Shoe Cleaning at 150,000 VND / pair to refresh your walking shoes.</p>
  <p><strong>Why choose 1997 Laundry?</strong></p>
  <ul>
    <li><strong>Checkout Guarantee</strong>: We promise to return your laundry before your hotel checkout time so you can catch your flight.</li>
    <li><strong>100% Separate Wash</strong>: We wash every order individually—never mixed with others.</li>
  </ul>
  <p>Book your slot now and pay securely online:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://nicefoldsaigon.vn/booking.html" style="background-color: #ff66c5; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Book Now & Pay</a>
  </p>
  <p>Best regards,<br><strong>The 1997 Laundry Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

const ORDER_CONFIRMATION_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="1997 Laundry" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Thank you for choosing 1997 Laundry! Your order <strong>#{booking_code}</strong> has been successfully created and is being processed.</p>
  <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 6px; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #041d40;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 5px 0; font-weight: bold; color: #4a5568;">Order ID:</td>
        <td style="padding: 5px 0; text-align: right;">#{booking_code}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-weight: bold; color: #4a5568;">Service:</td>
        <td style="padding: 5px 0; text-align: right;">{product_name}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-weight: bold; color: #4a5568;">Estimated Bill:</td>
        <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #ff66c5;">{amount} VND</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-weight: bold; color: #4a5568;">Hotel & Room:</td>
        <td style="padding: 5px 0; text-align: right;">{hotel} (Room: {room})</td>
      </tr>
    </table>
  </div>
  <p><strong>Next Steps & Delivery Instructions:</strong></p>
  <ul>
    <li><strong>Pickup</strong>: We will pick up your laundry at your hotel lobby or reception at the scheduled time.</li>
    <li><strong>100% Separate Wash</strong>: Your clothes will be washed separately in dedicated machines to guarantee absolute hygiene.</li>
    <li><strong>Checkout Guarantee</strong>: We will deliver your clean clothes back to your hotel reception before your checkout time so you can travel worry-free.</li>
  </ul>
  <p>If you have any questions, feel free to contact us via WhatsApp or Zalo.</p>
  <p>Best regards,<br><strong>The 1997 Laundry Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

const ORDER_COMPLETED_SUBJECT = "Payment Confirmed & Thank you! - 1997 Laundry 🌸";
const ORDER_COMPLETED_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="1997 Laundry" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Your payment for order <strong>#{booking_code}</strong> has been successfully received and confirmed. Thank you very much!</p>
  <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 6px; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #041d40;">Payment Confirmation</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 5px 0; font-weight: bold; color: #4a5568;">Order ID:</td>
        <td style="padding: 5px 0; text-align: right;">#{booking_code}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-weight: bold; color: #4a5568;">Service:</td>
        <td style="padding: 5px 0; text-align: right;">{product_name}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-weight: bold; color: #4a5568;">Amount Paid:</td>
        <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #ff66c5;">{amount} VND</td>
      </tr>
    </table>
  </div>
  <p>Your clean clothes have been returned fresh and smelling wonderful! We hope we made your stay in Saigon easier and more comfortable.</p>
  <p>If you liked our service, we would be extremely grateful if you could take 10 seconds to share your experience on our Google Maps profile:</p>
  <p style="text-align: center; margin: 25px 0;">
    <a href="https://maps.app.goo.gl/1997 LaundrySaigon" style="background-color: #041d40; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Leave a Google Review ★★★★★</a>
  </p>
  <p>Thank you again, and have a safe and wonderful trip!</p>
  <p>Best regards,<br><strong>The 1997 Laundry Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

function sendBookingConfirmation(name, email, productName, amount, bookingCode, hotel = '-', room = '-') {
    if (!email) return;
    const formattedAmount = Number(amount).toLocaleString('vi-VN').replace(/,/g, '.');
    const emailBody = ORDER_CONFIRMATION_HTML
        .replace('{name}', name)
        .replace('{product_name}', productName)
        .replace('{amount}', formattedAmount)
        .replace('{hotel}', hotel)
        .replace('{room}', room)
        .replace('{booking_code}', bookingCode);

    sendEmailViaResend(email, `Booking Confirmation #${bookingCode} - 1997 Laundry 🛎️`, emailBody);
}

function sendPaymentConfirmation(name, email, productName, amount, bookingCode) {
    if (!email) return;
    const formattedAmount = Number(amount).toLocaleString('vi-VN').replace(/,/g, '.');
    const emailBody = ORDER_COMPLETED_HTML
        .replace('{name}', name)
        .replace('{product_name}', productName)
        .replace('{amount}', formattedAmount)
        .replace('{booking_code}', bookingCode);

    sendEmailViaResend(email, ORDER_COMPLETED_SUBJECT, emailBody);
}

function triggerEmailSequence(name, email, serviceName = "Laundry Service", amountVal = 0, hotelAddress = "-", roomNumber = "-") {
    if (!email) return;
    const formattedAmount = Number(amountVal).toLocaleString('vi-VN').replace(/,/g, '.');
    const email1Content = EMAIL_1_HTML
        .replace('{name}', name)
        .replace('{service}', serviceName)
        .replace('{amount}', formattedAmount)
        .replace('{hotel}', hotelAddress)
        .replace('{room}', roomNumber);

    sendEmailViaResend(email, EMAIL_1_SUBJECT, email1Content);

    if (email.toLowerCase().includes("+test")) {
        setTimeout(() => {
            sendEmailViaResend(email, EMAIL_2_SUBJECT, EMAIL_2_HTML.replace('{name}', name));
        }, 3000);
        setTimeout(() => {
            sendEmailViaResend(email, EMAIL_3_SUBJECT, EMAIL_3_HTML.replace('{name}', name));
        }, 6000);
        return;
    }

    setTimeout(() => {
        sendEmailViaResend(email, EMAIL_2_SUBJECT, EMAIL_2_HTML.replace('{name}', name));
    }, 48 * 3600 * 1000);

    setTimeout(() => {
        sendEmailViaResend(email, EMAIL_3_SUBJECT, EMAIL_3_HTML.replace('{name}', name));
    }, 72 * 3600 * 1000);
}

// --- Dynamic MCP Server Instantiation Helper ---
function createMcpServer() {
    const server = new McpServer({
        name: "nice-fold-saigon-mcp",
        version: "1.0.0",
    });

    // Helper for logger
    const logCall = (toolName, args) => {
        console.log(`[${new Date().toISOString()}] Tool called: ${toolName} with args: ${JSON.stringify(args)}`);
    };

    // 1. Tool: update_order_status
    server.tool(
      "update_order_status",
      {
        booking_code: z.string().describe("Mã đặt lịch cần cập nhật, ví dụ: LTT1234"),
        status: z.string().describe("Trạng thái mới: Đang giặt, Đang sấy, Đã xếp, Đang giao, Hoàn thành, Chờ XN"),
        weight_kg: z.number().optional().describe("Cân nặng thực tế (đơn vị kg) để tính lại tiền"),
        photo_url: z.string().optional().describe("Link ảnh chụp báo cáo / bằng chứng giao nhận")
      },
      async ({ booking_code, status, weight_kg, photo_url }) => {
        logCall("update_order_status", { booking_code, status, weight_kg, photo_url });
        const bCode = booking_code.trim().toUpperCase();
        
        try {
            // Find existing order
            const order = await dbGet(`
                SELECT o.*, p.price as base_price, p.name as product_name, c.name as cust_name, c.email as cust_email
                FROM orders o
                LEFT JOIN products p ON o.product_id = p.id
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.booking_code = ? OR o.id = ?
            `, [bCode, bCode]);

            if (!order) {
                return {
                    content: [{ type: "text", text: JSON.stringify({ success: false, message: `Không tìm thấy đơn hàng với mã ${bCode}` }) }]
                };
            }

            // Calculate amount if weight is updated
            let finalAmount = order.amount;
            if (weight_kg !== undefined) {
                if (weight_kg <= 0) {
                    return {
                        content: [{ type: "text", text: JSON.stringify({ success: false, message: "Cân nặng phải lớn hơn 0" }) }]
                    };
                }
                finalAmount = weight_kg * order.base_price;
            }

            // Update database query
            let query = "UPDATE orders SET status = ?, amount = ?";
            let params = [status, finalAmount];

            // Map status to specific timestamp columns
            const statusMap = {
                "Đang giặt": "wash_start_time",
                "Đang sấy": "dry_start_time",
                "Đã xếp": "fold_complete_time",
                "Đang giao": "out_for_delivery_time",
                "Hoàn thành": "delivered_time"
            };

            if (statusMap[status]) {
                query += `, ${statusMap[status]} = ?`;
                params.push(new Date().toISOString());
            }

            if (photo_url) {
                if (status === "Đã xếp") {
                    query += ", fold_report_photo_url = ?";
                    params.push(photo_url);
                } else if (status === "Hoàn thành" || status === "Đang giao") {
                    query += ", delivery_proof_photo_url = ?";
                    params.push(photo_url);
                }
            }

            query += " WHERE booking_code = ? OR id = ?";
            params.push(bCode, bCode);

            await dbRun(query, params);

            // Send payment confirmation email if status transitions to completed
            if (order.status !== 'Hoàn thành' && status === 'Hoàn thành') {
                if (order.cust_email) {
                    setTimeout(() => sendPaymentConfirmation(order.cust_name, order.cust_email, order.product_name, finalAmount, bCode), 0);
                }
            }

            return {
                content: [{ type: "text", text: JSON.stringify({
                    success: true,
                    message: `Đã cập nhật đơn hàng ${bCode} thành trạng thái: ${status}`,
                    booking_code: bCode,
                    new_status: status,
                    new_amount: finalAmount
                }) }]
            };
        } catch (err) {
            return {
                content: [{ type: "text", text: JSON.stringify({ success: false, message: `Lỗi hệ thống: ${err.message}` }) }]
            };
        }
      }
    );

    // 2. Tool: manage_waitlist
    server.tool(
      "manage_waitlist",
      {
        action: z.enum(["list", "confirm"]).describe("Hành động cần làm: 'list' (xem danh sách chờ) hoặc 'confirm' (xác nhận khách hàng)"),
        phone: z.string().optional().describe("Số điện thoại khách cần xác nhận (Bắt buộc nếu action là 'confirm')")
      },
      async ({ action, phone }) => {
        logCall("manage_waitlist", { action, phone });

        try {
            if (action === "list") {
                const customers = await dbQuery("SELECT id, name, phone, email, registration_date FROM customers ORDER BY id DESC LIMIT 50");
                return {
                    content: [{ type: "text", text: JSON.stringify({
                        success: true,
                        count: customers.length,
                        customers: customers
                    }) }]
                };
            } else if (action === "confirm") {
                if (!phone) {
                    return {
                        content: [{ type: "text", text: JSON.stringify({ success: false, message: "Thiếu số điện thoại để xác nhận" }) }]
                    };
                }
                const cleanPhone = phone.trim();
                const cust = await dbGet("SELECT * FROM customers WHERE phone = ? OR phone LIKE ?", [cleanPhone, `%${cleanPhone}`]);
                if (!cust) {
                    return {
                        content: [{ type: "text", text: JSON.stringify({ success: false, message: `Không tìm thấy khách hàng với SĐT ${cleanPhone} trong database` }) }]
                    };
                }

                if (cust.email) {
                    setTimeout(() => triggerEmailSequence(cust.name, cust.email, "Premium Hotel Laundry Service", 0, cust.hotel || '-', cust.room || '-'), 0);
                    return {
                        content: [{ type: "text", text: JSON.stringify({
                            success: true,
                            message: `Xác nhận khách hàng ${cust.name} thành công. Chuỗi email chăm sóc tự động đã được kích hoạt.`,
                            customer: cust
                        }) }]
                    };
                } else {
                    return {
                        content: [{ type: "text", text: JSON.stringify({
                            success: true,
                            message: `Xác nhận khách hàng ${cust.name} thành công. Không gửi email do thiếu địa chỉ email.`,
                            customer: cust
                        }) }]
                    };
                }
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: JSON.stringify({ success: false, message: `Lỗi hệ thống: ${err.message}` }) }]
            };
        }
      }
    );

    // 3. Tool: reconcile_payment_manually
    server.tool(
      "reconcile_payment_manually",
      {
        booking_code: z.string().describe("Mã đặt lịch cần xác nhận thanh toán thủ công, ví dụ: LTT1234"),
        actual_amount: z.number().optional().describe("Số tiền thực tế nhận được (đơn vị VND)")
      },
      async ({ booking_code, actual_amount }) => {
        logCall("reconcile_payment_manually", { booking_code, actual_amount });
        const bCode = booking_code.trim().toUpperCase();

        try {
            const order = await dbGet(`
                SELECT o.*, p.name as product_name, c.name as cust_name, c.email as cust_email
                FROM orders o
                LEFT JOIN products p ON o.product_id = p.id
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.booking_code = ? OR o.id = ?
            `, [bCode, bCode]);

            if (!order) {
                return {
                    content: [{ type: "text", text: JSON.stringify({ success: false, message: `Không tìm thấy đơn hàng với mã ${bCode}` }) }]
                };
            }

            const finalAmount = actual_amount !== undefined ? actual_amount : order.amount;

            await dbRun(`
                UPDATE orders 
                SET status = 'Hoàn thành', amount = ?, delivered_time = ?
                WHERE booking_code = ? OR id = ?
            `, [finalAmount, new Date().toISOString(), bCode, bCode]);

            if (order.cust_email) {
                setTimeout(() => sendPaymentConfirmation(order.cust_name, order.cust_email, order.product_name, finalAmount, bCode), 0);
            }

            return {
                content: [{ type: "text", text: JSON.stringify({
                    success: true,
                    message: `Xác nhận thanh toán thủ công thành công cho đơn ${bCode}`,
                    booking_code: bCode,
                    status: "Hoàn thành",
                    amount_confirmed: finalAmount,
                    email_sent: !!order.cust_email
                }) }]
            };
        } catch (err) {
            return {
                content: [{ type: "text", text: JSON.stringify({ success: false, message: `Lỗi hệ thống: ${err.message}` }) }]
            };
        }
      }
    );

    // 4. Tool: get_order_details
    server.tool(
      "get_order_details",
      {
        booking_code: z.string().describe("Mã đặt lịch cần tra cứu, ví dụ: LTT1234")
      },
      async ({ booking_code }) => {
        logCall("get_order_details", { booking_code });
        const bCode = booking_code.trim().toUpperCase();

        try {
            const order = await dbGet(`
                SELECT o.booking_code, o.status, o.amount, o.order_date,
                       p.name as product_name, 
                       c.hotel, c.room
                FROM orders o
                LEFT JOIN products p ON o.product_id = p.id
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.booking_code = ? OR o.id = ?
            `, [bCode, bCode]);

            if (!order) {
                return {
                    content: [{ type: "text", text: JSON.stringify({ success: false, message: `Không tìm thấy thông tin đơn hàng với mã ${bCode}` }) }]
                };
            }

            // Expose ONLY safe and non-sensitive data
            const safeOrderDetails = {
                success: true,
                booking_code: order.booking_code,
                status: order.status,
                service: order.product_name,
                hotel: order.hotel || '-',
                room: order.room || '-',
                amount: order.amount,
                date: order.order_date
            };

            return {
                content: [{ type: "text", text: JSON.stringify(safeOrderDetails) }]
            };
        } catch (err) {
            return {
                content: [{ type: "text", text: JSON.stringify({ success: false, message: `Lỗi hệ thống: ${err.message}` }) }]
            };
        }
      }
    );

    // 5. Tool: get_unread_business_signals
    server.tool(
      "get_unread_business_signals",
      {},
      async () => {
        logCall("get_unread_business_signals", {});

        try {
            const newOrders = await dbQuery(`
                SELECT o.booking_code, c.name as customer_name, p.name as service, 
                       c.hotel, c.room, o.amount, o.order_date as date
                FROM orders o
                LEFT JOIN customers c ON o.customer_id = c.id
                LEFT JOIN products p ON o.product_id = p.id
                WHERE o.agent_notified = 0 OR o.agent_notified IS NULL
                ORDER BY o.id ASC
            `);

            const newPayments = await dbQuery(`
                SELECT id as transaction_id, reference_code, transfer_amount as amount, 
                       content, gateway, transaction_date as date
                FROM sepay_transactions
                WHERE agent_notified = 0 OR agent_notified IS NULL
                ORDER BY id ASC
            `);

            const missingItems = await dbQuery(`
                SELECT id as missing_item_id, booking_code, photo_path, date_added as date
                FROM missing_items
                WHERE (agent_notified = 0 OR agent_notified IS NULL) AND is_resolved = 0
                ORDER BY id ASC
            `);

            return {
                content: [{ type: "text", text: JSON.stringify({
                    success: true,
                    new_orders: newOrders,
                    new_payments: newPayments,
                    missing_items: missingItems
                }) }]
            };
        } catch (err) {
            return {
                content: [{ type: "text", text: JSON.stringify({ success: false, message: `Lỗi hệ thống: ${err.message}` }) }]
            };
        }
      }
    );

    // 6. Tool: acknowledge_business_signals
    server.tool(
      "acknowledge_business_signals",
      {
        booking_codes: z.array(z.string()).optional().describe("Mảng mã đơn hàng cần xác nhận đã thông báo, ví dụ: ['LTT1234']"),
        transaction_ids: z.array(z.number()).optional().describe("Mảng ID giao dịch SePay cần xác nhận đã thông báo, ví dụ: [1, 2]"),
        missing_item_ids: z.array(z.number()).optional().describe("Mảng ID báo cáo đồ thiếu cần xác nhận đã thông báo, ví dụ: [1]")
      },
      async ({ booking_codes, transaction_ids, missing_item_ids }) => {
        logCall("acknowledge_business_signals", { booking_codes, transaction_ids, missing_item_ids });

        try {
            let updatedOrders = 0;
            let updatedPayments = 0;
            let updatedMissingItems = 0;

            if (booking_codes && booking_codes.length > 0) {
                const placeholders = booking_codes.map(() => '?').join(',');
                const res = await dbRun(
                    `UPDATE orders SET agent_notified = 1 WHERE booking_code IN (${placeholders})`,
                    booking_codes
                );
                updatedOrders = res.changes || 0;
            }

            if (transaction_ids && transaction_ids.length > 0) {
                const placeholders = transaction_ids.map(() => '?').join(',');
                const res = await dbRun(
                    `UPDATE sepay_transactions SET agent_notified = 1 WHERE id IN (${placeholders})`,
                    transaction_ids
                );
                updatedPayments = res.changes || 0;
            }

            if (missing_item_ids && missing_item_ids.length > 0) {
                const placeholders = missing_item_ids.map(() => '?').join(',');
                const res = await dbRun(
                    `UPDATE missing_items SET agent_notified = 1 WHERE id IN (${placeholders})`,
                    missing_item_ids
                );
                updatedMissingItems = res.changes || 0;
            }

            return {
                content: [{ type: "text", text: JSON.stringify({
                    success: true,
                    message: "Đã xác nhận các tín hiệu kinh doanh thành công",
                    updated_orders: updatedOrders,
                    updated_payments: updatedPayments,
                    updated_missing_items: updatedMissingItems
                }) }]
            };
        } catch (err) {
            return {
                content: [{ type: "text", text: JSON.stringify({ success: false, message: `Lỗi hệ thống: ${err.message}` }) }]
            };
        }
      }
    );

    return server;
}

// Map to store transports dynamically by session ID
const transports = {};

// Helper to check if a request is initialize
function isInitializeRequest(body) {
    return body && body.method === 'initialize';
}

// --- Initialize Express ---
const app = express();
app.use(cors());
app.use(express.json());

// 1. POST Endpoint - handles JSON-RPC calls and initializations
app.post('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    
    try {
        let transport;
        if (sessionId && transports[sessionId]) {
            transport = transports[sessionId];
        } else if (!sessionId && isInitializeRequest(req.body)) {
            // Create a fresh transport for this new session
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                onsessioninitialized: (sid) => {
                    console.log(`[${new Date().toISOString()}] Session initialized with ID: ${sid}`);
                    transports[sid] = transport;
                }
            });

            transport.onclose = () => {
                const sid = transport.sessionId;
                if (sid && transports[sid]) {
                    console.log(`[${new Date().toISOString()}] Session ${sid} closed, removing transport`);
                    delete transports[sid];
                }
            };

            // Instantiate a new stateful McpServer for this session
            const server = createMcpServer();
            await server.connect(transport);
            
            await transport.handleRequest(req, res, req.body);
            return;
        } else {
            res.status(400).json({
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: 'Bad Request: No valid session ID provided'
                },
                id: null
            });
            return;
        }

        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP POST:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error'
                },
                id: null
            });
        }
    }
});

// 2. GET Endpoint - handles SSE streams for established sessions
app.get('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
    }

    console.log(`[${new Date().toISOString()}] Establishing SSE stream for session: ${sessionId}`);
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
});

// 3. DELETE Endpoint - handles session termination
app.delete('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
    }

    console.log(`[${new Date().toISOString()}] Terminating session: ${sessionId}`);
    try {
        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
    } catch (error) {
        console.error('Error handling session termination:', error);
        if (!res.headersSent) {
            res.status(500).send('Error processing session termination');
        }
    }
});

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`[${new Date().toISOString()}] Streamable HTTP MCP Server listening on http://${HOST}:${PORT}/mcp`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down MCP server...');
    for (const sessionId in transports) {
        try {
            await transports[sessionId].close();
            delete transports[sessionId];
        } catch (error) {
            console.error(`Error closing session ${sessionId}:`, error);
        }
    }
    process.exit(0);
});
