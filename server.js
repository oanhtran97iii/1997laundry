const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const botManager = require('./bot_manager');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'brain.db');

// --- Helper: Get Resend API Key ---
function getResendApiKey() {
    // 1. Try environment variable
    if (process.env.RESEND_API_KEY) {
        return process.env.RESEND_API_KEY.trim();
    }
    // 2. Try resend_config.txt fallback
    const configPath = path.join(__dirname, 'resend_config.txt');
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
            from: "Nice Fold Saigon <hi@nicefoldsaigon.vn>",
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

        // Log to email_log.txt
        const logLine = `${new Date().toISOString().replace('T', ' ').substring(0, 19)} | To: ${toEmail} | Subject: ${subject} | HTTP Code: ${response.status} | Response: ${JSON.stringify(resData)}\n`;
        fs.appendFileSync(path.join(__dirname, 'email_log.txt'), logLine, 'utf8');

        if (response.ok) {
            console.log(`Email sent successfully to ${toEmail}`);
            return true;
        } else {
            console.error(`Failed to send email to ${toEmail}:`, resData);
            return false;
        }
    } catch (err) {
        console.error(`Failed to send email via Resend to ${toEmail}:`, err);
        const logLine = `${new Date().toISOString().replace('T', ' ').substring(0, 19)} | To: ${toEmail} | Subject: ${subject} | Error: ${err.message}\n`;
        fs.appendFileSync(path.join(__dirname, 'email_log.txt'), logLine, 'utf8');
        return false;
    }
}

// --- Email Templates ---
const EMAIL_1_SUBJECT = "Welcome to Nice Fold Saigon! 🧼";
const EMAIL_1_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="Nice Fold Saigon" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Thank you for sharing your laundry preferences with us!</p>
  <p>Welcome to Nice Fold Saigon, a premium laundry service designed specifically for travelers and hotel guests in Ho Chi Minh City. Our mission is simple: to make your stay completely hassle-free by taking care of your laundry with the highest standards of hygiene and reliability.</p>
  
  <p>We have saved your preferences. When you are ready to get your laundry done, here is what you can look forward to:</p>
  <ul>
    <li><strong>100% Separate Wash</strong>: We guarantee your clothes are washed separately in dedicated machines. We never mix garments of different customers, ensuring absolute hygiene.</li>
    <li><strong>Checkout Guarantee</strong>: We are the only laundry service in Saigon that guarantees to deliver your clean clothes back to your hotel before your checkout time. No stress about missing flights.</li>
  </ul>
  
  <p>Keep an eye on your inbox—over the next few days, we'll share a few travel hacks to help you avoid common laundry traps in Saigon.</p>
  <p>Welcome to Nice Fold!</p>
  <p>Best regards,<br><strong>The Nice Fold Saigon Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

const EMAIL_2_SUBJECT = "Travel Hack: How to save space and laundry fees in Saigon ✈️";
const EMAIL_2_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="Nice Fold Saigon" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Here is a quick tip to make your stay in Saigon easier: try packing light. Carrying heavy bags through Ho Chi Minh City's busy streets is no fun. Packing light is easy if you wash your clothes on-the-go.</p>
  <p>However, keep these two things in mind when washing clothes in Saigon:</p>
  <ol>
    <li><strong>Hotel Laundry</strong>: It is convenient, but hotels usually charge <em>per piece</em>, which quickly adds up and can double your budget.</li>
    <li><strong>Street Laundry</strong>: While very cheap, they often mix garments from multiple customers to save costs. This compromises hygiene.</li>
  </ol>
  <p>At Nice Fold Saigon, we wash each customer's clothes 100% separately to ensure absolute cleanliness, and we coordinate directly with your hotel front desk for drop-off and pickup. You get your clothes back same-day without any hassle.</p>
  <p>Have a wonderful trip in Vietnam!</p>
  <p>Best regards,<br><strong>The Nice Fold Saigon Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

const EMAIL_3_SUBJECT = "Get your laundry done in Saigon (Same-day & Express delivery) ⚡";
const EMAIL_3_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="Nice Fold Saigon" style="max-width: 150px;">
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
  <p><strong>Why choose Nice Fold Saigon?</strong></p>
  <ul>
    <li><strong>Checkout Guarantee</strong>: We promise to return your laundry before your hotel checkout time so you can catch your flight.</li>
    <li><strong>100% Separate Wash</strong>: We wash every order individually—never mixed with others.</li>
  </ul>
  <p>Book your slot now and pay securely online:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://nicefoldsaigon.vn/booking.html" style="background-color: #ff66c5; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Book Now & Pay</a>
  </p>
  <p>Best regards,<br><strong>The Nice Fold Saigon Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

const ORDER_CONFIRMATION_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="Nice Fold Saigon" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Thank you for choosing Nice Fold Saigon! Your order <strong>#{booking_code}</strong> has been successfully created and is being processed.</p>
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
  <p>Best regards,<br><strong>The Nice Fold Saigon Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

const ORDER_COMPLETED_SUBJECT = "Payment Confirmed & Thank you! - Nice Fold Saigon 🌸";
const ORDER_COMPLETED_HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://nicefoldsaigon.vn/logo.png" alt="Nice Fold Saigon" style="max-width: 150px;">
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
    <a href="https://maps.app.goo.gl/NiceFoldSaigon" style="background-color: #041d40; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Leave a Google Review ★★★★★</a>
  </p>
  <p>Thank you again, and have a safe and wonderful trip!</p>
  <p>Best regards,<br><strong>The Nice Fold Saigon Team</strong><br><a href="https://nicefoldsaigon.vn" style="color: #041d40; text-decoration: none;">nicefoldsaigon.vn</a></p>
</div>
`;

// Helper for booking mail triggering
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

    sendEmailViaResend(email, `Booking Confirmation #${bookingCode} - Nice Fold Saigon 🛎️`, emailBody);
}

// Helper for payment confirmation mail
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

// Trigger standard email sequence (welcome and travel tips)
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

    // If test mode is active (+test in email), send emails 2 and 3 immediately
    if (email.toLowerCase().includes("+test")) {
        console.log(`Test mode active for ${email}. Sending Email 2 and 3 immediately.`);
        setTimeout(() => {
            sendEmailViaResend(email, EMAIL_2_SUBJECT, EMAIL_2_HTML.replace('{name}', name));
        }, 3000);
        setTimeout(() => {
            sendEmailViaResend(email, EMAIL_3_SUBJECT, EMAIL_3_HTML.replace('{name}', name));
        }, 6000);
        return;
    }

    // Schedule email 2 (48h) and email 3 (72h) in background
    setTimeout(() => {
        sendEmailViaResend(email, EMAIL_2_SUBJECT, EMAIL_2_HTML.replace('{name}', name));
    }, 48 * 3600 * 1000);

    setTimeout(() => {
        sendEmailViaResend(email, EMAIL_3_SUBJECT, EMAIL_3_HTML.replace('{name}', name));
    }, 72 * 3600 * 1000);
}

// --- Database Connection Setup ---
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to the SQLite database.');
        initializeAndMigrateDb();
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

// Database Initialization and Schema Migrations
async function initializeAndMigrateDb() {
    try {
        await dbRun("PRAGMA foreign_keys = ON;");

        // 1. Create tables
        await dbRun(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('physical', 'digital', 'service')),
                price REAL NOT NULL,
                description TEXT,
                stock_quantity INTEGER,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await dbRun(`
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT UNIQUE,
                zalo TEXT UNIQUE,
                email TEXT,
                hotel TEXT,
                room TEXT,
                registration_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await dbRun(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                booking_code TEXT,
                customer_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                order_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        `);

        // Check for new columns and migrate
        const columnsInfo = await dbQuery("PRAGMA table_info(orders);");
        const existingColumns = columnsInfo.map(c => c.name);

        const newCols = {
            "collect_scheduled_time": "TEXT",
            "collected_time": "TEXT",
            "weighed_time": "TEXT",
            "wash_start_time": "TEXT",
            "dry_start_time": "TEXT",
            "fold_complete_time": "TEXT",
            "out_for_delivery_time": "TEXT",
            "delivered_time": "TEXT",
            "fold_report_photo_url": "TEXT",
            "delivery_proof_photo_url": "TEXT"
        };

        for (const [colName, colType] of Object.entries(newCols)) {
            if (!existingColumns.includes(colName)) {
                console.log(`Adding column ${colName} to orders table...`);
                await dbRun(`ALTER TABLE orders ADD COLUMN ${colName} ${colType};`);
            }
        }

        // 2. Insert Default Products if empty
        const prodCount = await dbGet("SELECT COUNT(*) as count FROM products;");
        if (prodCount.count === 0) {
            const defaultProducts = [
                ["Standard Wash & Fold (24h)", "service", 40000, "Standard wash & fold laundry service. Min weight 3kg.", null],
                ["Same-day Wash & Fold (8h-12h)", "service", 50000, "Same-day express wash & fold service. Min weight 4kg.", null],
                ["Express Wash & Fold (4h)", "service", 70000, "Super express wash & fold laundry service. Min weight 4kg.", null],
                ["Shoes Cleaning", "service", 150000, "Premium shoe cleaning and sanitization. Min 1 pair.", null],
                ["Topper Cleaning", "service", 60000, "Topper mattress cleaning service. Min weight 1kg.", null],
                ["Curtain Cleaning", "service", 50000, "Curtain cleaning service. Min weight 1kg.", null],
                ["Beddings & Linens", "service", 40000, "Bedding, sheet, and linen cleaning. Min weight 3kg.", null]
            ];

            for (const p of defaultProducts) {
                await dbRun(
                    `INSERT INTO products (name, type, price, description, stock_quantity) VALUES (?, ?, ?, ?, ?)`,
                    p
                );
            }
            console.log("Inserted default products successfully.");
        }

        console.log("Database schema initialized and migrated successfully.");
    } catch (e) {
        console.error("Database migration/initialization failed:", e);
    }
}

// --- Initialize Express Server ---
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Basic Authentication Middleware ---
const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Nice Fold Saigon Admin"');
        return res.status(401).send('Authentication required');
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    const ADMIN_USER = process.env.ADMIN_USER || 'nf-admin';
    const ADMIN_PASS = process.env.ADMIN_PASS || 'nicefoldsg@190';

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Nice Fold Saigon Admin"');
    return res.status(401).send('Invalid credentials');
};

// --- Compatibility Routing for api.php endpoints ---
app.all('/api.php', async (req, res) => {
    const action = req.query.action || req.body.action || '';
    const method = req.method;

    // Protect admin actions with Basic Auth
    const adminActions = ['orders', 'customers', 'save-product', 'save-customer', 'save-order', 'delete'];
    if (adminActions.includes(action)) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Nice Fold Saigon Admin API"');
            return res.status(401).send('Authentication required');
        }
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const user = auth[0];
        const pass = auth[1];
        const ADMIN_USER = process.env.ADMIN_USER || 'nf-admin';
        const ADMIN_PASS = process.env.ADMIN_PASS || 'nicefoldsg@190';
        if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Nice Fold Saigon Admin API"');
            return res.status(401).send('Invalid credentials');
        }
    }

    try {
        switch (action) {
            case 'products': {
                const products = await dbQuery("SELECT * FROM products ORDER BY id DESC");
                return res.json(products);
            }

            case 'test-email': {
                const to = req.query.to || 'oanhtran.197@gmail.com';
                const result = await sendEmailViaResend(to, "Node.js Resend Live Test", "<p>Testing Resend from Express Node.js backend.</p>");
                return res.json({ success: result, message: result ? "Sent successfully!" : "Failed to send. Check email_log.txt." });
            }

            case 'customers': {
                try {
                    const n8nUrl = process.env.N8N_ADMIN_CUSTOMERS_URL || "https://hoangoanh.app.n8n.cloud/webhook/admin-customers";
                    const response = await fetch(n8nUrl, { signal: AbortSignal.timeout(3000) });
                    let customers = await response.json();
                    if (!Array.isArray(customers)) customers = [customers];

                    // Merge with SQLite local database customers
                    const dbCusts = await dbQuery("SELECT * FROM customers ORDER BY id DESC");
                    const seenPhones = {};
                    const merged = [];

                    for (const c of dbCusts) {
                        const phoneClean = (c.phone || '').replace(/\D/g, '');
                        const d = {
                            id: c.id,
                            "ID Khách hàng": c.id,
                            name: c.name,
                            "Tên khách hàng": c.name,
                            phone: c.phone,
                            "Số điện thoại / Zalo / WA": c.phone,
                            email: c.email,
                            "Email": c.email,
                            hotel: c.hotel,
                            "Địa chỉ khách sạn": c.hotel,
                            room: c.room,
                            "Số phòng": c.room,
                            registration_date: c.registration_date,
                            "Ngày đăng ký": c.registration_date
                        };
                        merged.push(d);
                        if (phoneClean) seenPhones[phoneClean] = d;
                    }

                    for (const c of customers) {
                        const phone = c.phone || c["Số điện thoại / Zalo / WA"] || c.C || '';
                        const phoneClean = phone.replace(/\D/g, '');
                        if (phoneClean && seenPhones[phoneClean]) {
                            const localC = seenPhones[phoneClean];
                            for (const [k, v] of Object.entries(c)) {
                                if (!localC[k] || localC[k] === null) {
                                    localC[k] = v;
                                }
                            }
                        } else {
                            merged.push(c);
                            if (phoneClean) seenPhones[phoneClean] = c;
                        }
                    }
                    return res.json(merged);
                } catch (e) {
                    console.error(`n8n customers webhook failed: ${e.message}. Falling back to SQLite.`);
                    const customers = await dbQuery("SELECT * FROM customers ORDER BY id DESC");
                    return res.json(customers);
                }
            }

            case 'orders': {
                try {
                    const n8nUrl = process.env.N8N_ADMIN_ORDERS_URL || "https://hoangoanh.app.n8n.cloud/webhook/admin-orders";
                    const response = await fetch(n8nUrl, { signal: AbortSignal.timeout(3000) });
                    let orders = await response.json();
                    if (!Array.isArray(orders)) orders = [orders];

                    // Fetch SQLite local orders
                    const dbOrders = await dbQuery(`
                        SELECT o.*, c.name as customer_name, c.phone as phone, c.email as email, c.hotel as hotel, c.room as room, p.name as product_name, p.type as product_type
                        FROM orders o
                        LEFT JOIN customers c ON o.customer_id = c.id
                        LEFT JOIN products p ON o.product_id = p.id
                        ORDER BY o.id DESC
                    `);

                    const formattedDbOrders = dbOrders.map(d => {
                        const orderObj = { ...d };
                        if (d.booking_code) {
                            orderObj.id = d.booking_code;
                            orderObj["Mã đặt lịch"] = d.booking_code;
                            orderObj["Tên khách sạn & Địa chỉ"] = d.hotel || "";
                            orderObj["Số phòng"] = d.room || "";
                            orderObj["SĐT liên hệ (ID Khách)"] = d.phone || "";
                            orderObj["Thời gian nhận"] = d.order_date || "";
                            orderObj["Gói giặt"] = d.product_name || "";
                            orderObj["Tổng tiền bill tạm tính"] = d.amount || 0;
                            orderObj["Trạng thái đơn"] = d.status || "Chờ XN";
                            orderObj.email = d.email || "";
                        }
                        return orderObj;
                    });

                    // Merge lists by booking code
                    const seenCodes = new Set();
                    const mergedOrders = [];

                    for (const o of formattedDbOrders) {
                        const code = String(o.id || o["Mã đặt lịch"] || o.booking_code || '').trim().toUpperCase();
                        if (!seenCodes.has(code)) {
                            mergedOrders.push(o);
                            if (code) seenCodes.add(code);
                        }
                    }

                    for (const o of orders) {
                        const code = String(o.id || o["Mã đặt lịch"] || o.booking_code || '').trim().toUpperCase();
                        if (!seenCodes.has(code)) {
                            mergedOrders.push(o);
                            if (code) seenCodes.add(code);
                        }
                    }

                    return res.json(mergedOrders);
                } catch (e) {
                    console.error(`n8n orders webhook failed: ${e.message}. Falling back to SQLite.`);
                    const dbOrders = await dbQuery(`
                        SELECT o.*, c.name as customer_name, c.phone as phone, c.email as email, c.hotel as hotel, c.room as room, p.name as product_name, p.type as product_type
                        FROM orders o
                        LEFT JOIN customers c ON o.customer_id = c.id
                        LEFT JOIN products p ON o.product_id = p.id
                        ORDER BY o.id DESC
                    `);

                    const formattedOrders = dbOrders.map(d => {
                        const orderObj = { ...d };
                        if (d.booking_code) {
                            orderObj.id = d.booking_code;
                            orderObj["Mã đặt lịch"] = d.booking_code;
                            orderObj["Tên khách sạn & Địa chỉ"] = d.hotel || "";
                            orderObj["Số phòng"] = d.room || "";
                            orderObj["SĐT liên hệ (ID Khách)"] = d.phone || "";
                            orderObj["Thời gian nhận"] = d.order_date || "";
                            orderObj["Gói giặt"] = d.product_name || "";
                            orderObj["Tổng tiền bill tạm tính"] = d.amount || 0;
                            orderObj["Trạng thái đơn"] = d.status || "Chờ XN";
                            orderObj.email = d.email || "";
                        }
                        return orderObj;
                    });
                    return res.json(formattedOrders);
                }
            }

            case 'survey': {
                const body = req.body;
                const name = body['entry.978937613'] || body['entry_978937613'] || 'Guest';
                const phone = body['entry.1507224408'] || body['entry_1507224408'] || '';
                const email = body['entry.564072479'] || body['entry_564072479'] || '';
                const service = body['entry.1411190461'] || body['entry_1411190461'] || 'Laundry Service';
                const pickup = body['entry.1151563479'] || body['entry_1151563479'] || 'Pickup';

                // Forward to Google Forms asynchronously
                const googleFormUrl = process.env.GOOGLE_FORM_RESPONSE_URL || "https://docs.google.com/forms/d/e/1FAIpQLSfMTQAoppyHdDGNcGGiDWDI3Gonl6t1WkcbdlMQseX7ORg31g/formResponse";
                fetch(googleFormUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
                    body: new URLSearchParams(body).toString()
                }).catch(err => console.error("Google Forms forward error:", err.message));

                // Save to Database
                if (phone) {
                    const row = await dbGet("SELECT id FROM customers WHERE phone = ?", [phone]);
                    if (row) {
                        await dbRun("UPDATE customers SET name = ?, email = ? WHERE phone = ?", [name, email, phone]);
                    } else {
                        await dbRun("INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)", [name, phone, email]);
                    }
                }

                if (email) {
                    // Send Email 1 immediately and schedule sequence in background
                    setTimeout(() => triggerEmailSequence(name, email, service, 0, pickup, '-'), 0);
                }

                return res.json({ success: true });
            }

            case 'booking': {
                const body = req.body;
                const name = body.name || "Khách vãng lai";
                const phone = body.phone || "";
                const email = body.email || "";
                const hotel = body.hotelAddress || "";
                const room = body.roomNumber || "";
                const service = body.service || "";
                const amount = body.totalVnd || 0;
                const bookingCode = body.bookingCode || '';

                if (!bookingCode) {
                    return res.status(400).json({ error: "Missing booking code" });
                }

                // Check if customer exists based on phone
                let customerId;
                const custRow = await dbGet("SELECT id FROM customers WHERE phone = ?", [phone]);
                if (custRow) {
                    customerId = custRow.id;
                    await dbRun(
                        "UPDATE customers SET name = ?, email = ?, hotel = ?, room = ? WHERE id = ?",
                        [name, email, hotel, room, customerId]
                    );
                } else {
                    const result = await dbRun(
                        "INSERT INTO customers (name, phone, email, hotel, room) VALUES (?, ?, ?, ?, ?)",
                        [name, phone, email, hotel, room]
                    );
                    customerId = result.lastID;
                }

                // Match product ID
                const serviceClean = service.toLowerCase();
                let productId = 1; // standard
                if (serviceClean.includes("same-day") || serviceClean.includes("sameday")) {
                    productId = 2;
                } else if (serviceClean.includes("express")) {
                    productId = 3;
                } else if (serviceClean.includes("shoe")) {
                    productId = 4;
                } else if (serviceClean.includes("topper")) {
                    productId = 5;
                } else if (serviceClean.includes("curtain")) {
                    productId = 6;
                } else if (serviceClean.includes("bedding") || serviceClean.includes("linen")) {
                    productId = 7;
                } else {
                    const prodRow = await dbGet("SELECT id FROM products WHERE name LIKE ?", [`%${service}%`]);
                    if (prodRow) productId = prodRow.id;
                }

                await dbRun(
                    "INSERT INTO orders (booking_code, customer_id, product_id, amount, status) VALUES (?, ?, ?, ?, 'Chờ XN')",
                    [bookingCode, customerId, productId, amount]
                );

                // Trigger booking confirmation mail in background
                setTimeout(() => sendBookingConfirmation(name, email, service, amount, bookingCode, hotel, room), 0);

                // Send Telegram and Shipper notification
                try {
                    botManager.sendOrderAlert({
                        bookingCode: bookingCode,
                        name: name,
                        phone: phone,
                        service: service,
                        hotelAddress: hotel,
                        roomNumber: room,
                        pickupTime: body.pickupTime || new Date().toLocaleString(),
                        paymentMethod: body.paymentMethod || 'banktransfer',
                        totalVnd: amount,
                        lang: body.lang || 'en'
                    });
                } catch(err) {
                    console.error('Failed to trigger order alert:', err);
                }

                return res.json({ success: true, bookingCode: bookingCode });
            }

            case 'save-product': {
                const body = req.body;
                const itemId = body.id;

                if (itemId) {
                    // Update
                    await dbRun(
                        "UPDATE products SET name = ?, type = ?, price = ?, description = ?, stock_quantity = ? WHERE id = ?",
                        [body.name, body.type, body.price, body.description, body.stock_quantity, itemId]
                    );
                    return res.json({ success: true });
                } else {
                    // Create
                    const result = await dbRun(
                        "INSERT INTO products (name, type, price, description, stock_quantity) VALUES (?, ?, ?, ?, ?)",
                        [body.name, body.type, body.price, body.description, body.stock_quantity]
                    );
                    return res.json({ success: true, id: result.lastID });
                }
            }

            case 'save-customer': {
                const body = req.body;
                const itemId = body.id;

                if (itemId) {
                    // Update
                    await dbRun(
                        "UPDATE customers SET name = ?, phone = ?, zalo = ?, email = ?, hotel = ?, room = ?, registration_date = ? WHERE id = ?",
                        [body.name, body.phone, body.zalo, body.email, body.hotel, body.room, body.registration_date, itemId]
                    );
                    return res.json({ success: true });
                } else {
                    // Create
                    const result = await dbRun(
                        "INSERT INTO customers (name, phone, zalo, email, hotel, room, registration_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [body.name, body.phone, body.zalo, body.email, body.hotel, body.room, body.registration_date]
                    );
                    return res.json({ success: true, id: result.lastID });
                }
            }

            case 'save-order': {
                const body = req.body;
                const itemId = body.id || body.bookingCode || body.booking_code;

                if (itemId) {
                    // Update
                    const isDigit = /^\d+$/.test(String(itemId));
                    if (isDigit) {
                        await dbRun(
                            "UPDATE orders SET amount = ?, status = ? WHERE id = ?",
                            [body.amount, body.status, Number(itemId)]
                        );
                    } else {
                        await dbRun(
                            "UPDATE orders SET amount = ?, status = ? WHERE booking_code = ?",
                            [body.amount, body.status, itemId]
                        );
                    }
                    return res.json({ success: true });
                } else {
                    // Create
                    const productId = body.product_id;
                    const prod = await dbGet("SELECT type, stock_quantity FROM products WHERE id = ?", [productId]);

                    if (!prod) {
                        return res.status(400).json({ error: "Product not found" });
                    }

                    if (prod.type === 'physical') {
                        if (prod.stock_quantity === null || prod.stock_quantity <= 0) {
                            return res.status(400).json({ error: "Sản phẩm vật lý đã hết hàng (Out of stock)!" });
                        }
                        await dbRun("UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = ?", [productId]);
                    }

                    const bookingCode = body.booking_code || body.bookingCode || ('NF' + String(Math.floor(Date.now() / 1000)).slice(-4));
                    const result = await dbRun(
                        "INSERT INTO orders (booking_code, customer_id, product_id, amount, status, order_date) VALUES (?, ?, ?, ?, ?, ?)",
                        [bookingCode, body.customer_id, productId, body.amount, body.status || 'pending', body.order_date || new Date().toISOString()]
                    );

                    // Send confirmation email
                    const cust = await dbGet("SELECT name, email FROM customers WHERE id = ?", [body.customer_id]);
                    if (cust && cust.email) {
                        const prodRow = await dbGet("SELECT name FROM products WHERE id = ?", [productId]);
                        const prodName = prodRow ? prodRow.name : "Laundry Service";
                        setTimeout(() => sendBookingConfirmation(cust.name, cust.email, prodName, body.amount, bookingCode), 0);
                    }

                    return res.json({ success: true, id: result.lastID });
                }
            }

            case 'update-order': {
                const body = req.body;
                const itemId = body.id || body.bookingCode || body.booking_code;

                if (!itemId) {
                    return res.status(400).json({ error: "Missing item ID" });
                }

                let n8nSuccess = false;
                let n8nError = "";

                // Sync update order to n8n
                try {
                    const n8nUrl = process.env.N8N_UPDATE_ORDER_URL || "https://hoangoanh.app.n8n.cloud/webhook/update-order";
                    const response = await fetch(n8nUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
                        body: JSON.stringify({
                            bookingCode: String(itemId),
                            amount: body.amount,
                            status: body.status
                        }),
                        signal: AbortSignal.timeout(3000)
                    });
                    if (response.ok) n8nSuccess = true;
                } catch (e) {
                    n8nError = e.message;
                    console.error("n8n update order failed:", e.message);
                }

                // Query old order details first
                const oldOrder = await dbGet(`
                    SELECT o.status, o.booking_code, o.amount, p.name as product_name, c.name as cust_name, c.email as cust_email
                    FROM orders o
                    LEFT JOIN products p ON o.product_id = p.id
                    LEFT JOIN customers c ON o.customer_id = c.id
                    WHERE o.id = ? OR o.booking_code = ?
                `, [itemId, itemId]);

                const isDigit = /^\d+$/.test(String(itemId));
                if (isDigit) {
                    await dbRun("UPDATE orders SET amount = ?, status = ? WHERE id = ?", [body.amount, body.status, Number(itemId)]);
                } else {
                    await dbRun("UPDATE orders SET amount = ?, status = ? WHERE booking_code = ?", [body.amount, body.status, itemId]);
                }

                // Send payment confirmation email if transitioned to 'Hoàn thành'
                if (oldOrder && oldOrder.status !== 'Hoàn thành' && body.status === 'Hoàn thành') {
                    if (oldOrder.cust_email) {
                        const bCode = oldOrder.booking_code || itemId;
                        setTimeout(() => sendPaymentConfirmation(oldOrder.cust_name, oldOrder.cust_email, oldOrder.product_name, body.amount || oldOrder.amount, bCode), 0);
                    }
                }

                return res.json({ success: true, n8n_sync: n8nSuccess, n8n_error: n8nError });
            }

            case 'sepay-webhook': {
                const body = req.body;
                let content = body.content || body.description || '';
                const amount = body.transferAmount ? parseFloat(body.transferAmount) : 0;

                if (!content) {
                    return res.json({ success: false, message: "No transfer content found" });
                }

                const match = content.match(/(NF\d{4})/i);
                if (!match) {
                    return res.json({ success: false, message: "Could not match booking code in content" });
                }

                const bookingCode = match[1].toUpperCase();

                // Find old order details
                const oldOrder = await dbGet(`
                    SELECT o.status, o.booking_code, o.amount, p.name as product_name, c.name as cust_name, c.email as cust_email
                    FROM orders o
                    LEFT JOIN products p ON o.product_id = p.id
                    LEFT JOIN customers c ON o.customer_id = c.id
                    WHERE o.id = ? OR o.booking_code = ?
                `, [bookingCode, bookingCode]);

                await dbRun("UPDATE orders SET status = 'Hoàn thành' WHERE id = ? OR booking_code = ?", [bookingCode, bookingCode]);

                if (oldOrder && oldOrder.status !== 'Hoàn thành') {
                    if (oldOrder.cust_email) {
                        const finalCode = oldOrder.booking_code || bookingCode;
                        setTimeout(() => sendPaymentConfirmation(oldOrder.cust_name, oldOrder.cust_email, oldOrder.product_name, oldOrder.amount, finalCode), 0);
                    }
                }

                return res.json({ success: true, message: `Order ${bookingCode} completed` });
            }

            case 'delete': {
                const body = req.body;
                const itemId = body.id;
                const targetType = body.type;

                if (!itemId || !['orders', 'customers', 'products'].includes(targetType)) {
                    return res.status(400).json({ error: "Invalid delete request parameters" });
                }

                await dbRun(`DELETE FROM ${targetType} WHERE id = ?`, [itemId]);
                return res.json({ success: true });
            }

            default:
                return res.status(404).json({ error: `Action ${action} not supported or route not found` });
        }
    } catch (err) {
        console.error(`Error processing action ${action}:`, err);
        return res.status(500).json({ error: err.message });
    }
});

// --- Chatbot proxy endpoint for goClaw AI Agent (Bé Hai) ---
app.post('/api/chat', async (req, res) => {
    const { message, sessionId } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const sessId = sessionId || 'default-session';

    try {
        const payload = {
            messages: [{ role: 'user', content: message }]
        };

        const response = await fetch('http://localhost:3002/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 0efe653ca15f03f4ccec8f007cec08a3',
                'X-GoClaw-User-Id': sessId,
                'X-GoClaw-Agent-Id': 'be-hai-giat-say'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('goClaw completions API error:', errText);
            return res.status(response.status).json({ error: 'Failed to communicate with agent' });
        }

        const data = await response.json();
        const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        return res.json({ reply: reply || '' });
    } catch (err) {
        console.error('Chat proxy error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve Admin Static Files behind Auth
app.use('/admin', basicAuth, express.static(path.join(__dirname, 'admin')));

// Serve Static Site Files
app.use(express.static(path.join(__dirname)));

// Start Server
app.listen(PORT, () => {
    console.log(`Node.js Express Server is running on port ${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
    
    // Initialize bot automation
    try {
        botManager.init(app, db);
        console.log('Bot Manager automation initialized.');
    } catch(err) {
        console.error('Failed to initialize Bot Manager:', err);
    }
});
