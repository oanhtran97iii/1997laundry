const fs = require('fs');
const path = require('path');
const https = require('https');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');

// Telegram Config
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8784409366:AAHjl9UOY6ujZs-Yi_d7BHj0cXjIw1na1EI';
const ADMIN_CHAT_ID = '874597419';

const GROUPS = {
  DON_NHAN: '-5534415575',
  BILL_PICKUP: '-5346503762',
  XEP_DO: '-5484161176',
  DON_GIAO: '-5331350195',
  CHECK_THANH_TOAN: '-5390540854',
  REPORT_DON: '-5415043824',
  REPORT_DOANH_THU: '-5453952425'
};

// Global variables for SQLite DB & WhatsApp Sock
let db = null;
let sock = null;
let isWaConnected = false;

// --- TELEGRAM HELPER FUNCTIONS ---
function sendTelegramMessage(chatId, text, replyToMessageId = null) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  if (replyToMessageId) {
    payload.reply_to_message_id = replyToMessageId;
  }
  
  const postData = JSON.stringify(payload);
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', (err) => {
      console.error('sendTelegramMessage error:', err);
      resolve(null);
    });
    req.write(postData);
    req.end();
  });
}

function sendTelegramPhoto(chatId, photoPathOrFileId, caption, replyToMessageId = null) {
  // If it's a file ID, we can send it directly via JSON
  if (typeof photoPathOrFileId === 'string' && !photoPathOrFileId.startsWith('/')) {
    const payload = {
      chat_id: chatId,
      photo: photoPathOrFileId,
      caption: caption,
      parse_mode: 'HTML'
    };
    if (replyToMessageId) {
      payload.reply_to_message_id = replyToMessageId;
    }
    const postData = JSON.stringify(payload);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_TOKEN}/sendPhoto`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    return new Promise(resolve => {
      const req = https.request(options, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve(JSON.parse(body || '{}')));
      });
      req.on('error', () => resolve(null));
      req.write(postData);
      req.end();
    });
  }

  // Local file upload requires multipart (handle simply or let telegram fetch via URL if served statically)
  const staticUrl = `https://nicefoldsaigon.vn${photoPathOrFileId}`;
  return sendTelegramPhoto(chatId, staticUrl, caption, replyToMessageId);
}

function downloadTelegramFile(fileId) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.ok && json.result && json.result.file_path) {
            const filePath = json.result.file_path;
            const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
            const ext = path.extname(filePath) || '.jpg';
            const localFilename = `${fileId}${ext}`;
            
            const uploadsDir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            const localPath = path.join(uploadsDir, localFilename);
            const file = fs.createWriteStream(localPath);
            https.get(fileUrl, (fileRes) => {
              fileRes.pipe(file);
              file.on('finish', () => {
                file.close();
                resolve(`/uploads/${localFilename}`);
              });
            }).on('error', (err) => {
              fs.unlink(localPath, () => {});
              reject(err);
            });
          } else {
            reject(new Error('Failed to get file path from Telegram'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Helper to query database in Promise
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// --- STATE MACHINE STATUS LABELS ---
const STATUS_LABELS = {
  'Chờ lấy': 'Chờ lấy (Shipper đang qua lấy đồ / Shipper is on the way to collect)',
  'Đã lấy': 'Đã lấy đồ (Đang vận chuyển về tiệm / Collected & arriving at laundry room)',
  'Đang giặt': 'Đang giặt sấy (Washing / drying / folding)',
  'Chờ giao': 'Đang chờ giao (Đã giặt xong, sẵn sàng đi giao / Folded & ready for delivery)',
  'Đã giao': 'Đã giao thành công (Delivered successfully! 🎉)'
};

// --- WHATSAPP HELPER FUNCTIONS ---
async function startWhatsAppBot() {
  const authPath = path.join(__dirname, 'auth_info_baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  
  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('--- WhatsApp QR Code Available ---');
      const qrPath = path.join(__dirname, 'uploads', 'qr.png');
      fs.mkdirSync(path.dirname(qrPath), { recursive: true });
      await qrcode.toFile(qrPath, qr, { scale: 8 });
      console.log(`QR code saved to ${qrPath}. Please scan at https://nicefoldsaigon.vn/uploads/qr.png`);
      
      // Notify admin Telegram chat about QR Code
      sendTelegramMessage(ADMIN_CHAT_ID, `⚠️ <b>WhatsApp Gateway is disconnected.</b>\nPlease scan this QR code to authenticate: https://nicefoldsaigon.vn/uploads/qr.png`);
    }
    
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('WhatsApp connection closed, reconnecting: ', shouldReconnect);
      isWaConnected = false;
      if (shouldReconnect) {
        setTimeout(startWhatsAppBot, 5000);
      }
    } else if (connection === 'open') {
      console.log('WhatsApp connection opened successfully!');
      isWaConnected = true;
      const qrPath = path.join(__dirname, 'uploads', 'qr.png');
      if (fs.existsSync(qrPath)) {
        fs.unlinkSync(qrPath);
      }
      sendTelegramMessage(ADMIN_CHAT_ID, `✅ <b>WhatsApp Gateway has connected successfully!</b>`);
    }
  });
}

async function sendWhatsAppConfirmation(phone, messageText, localPhotoUrl) {
  if (!sock || !isWaConnected) {
    console.error('WhatsApp bot is not connected. Cannot send confirmation.');
    return false;
  }
  
  // Clean phone number
  let cleanPhone = phone.replace(/\D/g, ''); // keep only digits
  if (!cleanPhone.endsWith('@s.whatsapp.net')) {
    cleanPhone = `${cleanPhone}@s.whatsapp.net`;
  }
  
  try {
    if (localPhotoUrl) {
      const absolutePhotoPath = path.join(__dirname, localPhotoUrl);
      if (fs.existsSync(absolutePhotoPath)) {
        await sock.sendMessage(cleanPhone, { 
          image: fs.readFileSync(absolutePhotoPath), 
          caption: messageText 
        });
        console.log(`WhatsApp photo confirmation sent successfully to ${cleanPhone}`);
        return true;
      }
    }
    
    await sock.sendMessage(cleanPhone, { text: messageText });
    console.log(`WhatsApp text confirmation sent successfully to ${cleanPhone}`);
    return true;
  } catch (e) {
    console.error('Error sending WhatsApp message:', e);
    return false;
  }
}

// --- AUTOMATION TRIGGERS ---

// Triggered when client creates a booking online
async function sendOrderAlert(order) {
  const isVi = order.lang === 'vi';
  
  const text = `🛎️ <b>ĐƠN HÀNG MỚI / NEW ORDER</b>
---------------------------------------
📌 Mã đơn: <code>${order.bookingCode}</code>
👤 Khách hàng: <b>${order.name}</b>
📞 SĐT liên hệ: <code>${order.phone}</code>
📦 Gói dịch vụ: <b>${order.service}</b>
🏢 Khách sạn: ${order.hotelAddress}
🚪 Số phòng: ${order.roomNumber}
⏰ Thời gian nhận đồ: ${order.pickupTime}
💵 Thanh toán: ${order.paymentMethod === 'cash' ? 'Tiền mặt (Cash)' : 'Chuyển khoản (Bank Transfer)'}
💰 Tổng cước tạm tính: <b>${(order.totalVnd || 0).toLocaleString('vi-VN')} VND</b>`;

  // 1. Post to "Đơn Nhận" group
  const res1 = await sendTelegramMessage(GROUPS.DON_NHAN, text);
  if (res1 && res1.result && res1.result.message_id) {
    await dbRun(
      "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'pickup')",
      [order.bookingCode, res1.result.message_id, GROUPS.DON_NHAN]
    );
  }

  // 2. Post to "Report Đơn" group
  sendTelegramMessage(GROUPS.REPORT_DON, text);

  // 3. DM alert to Shipper on duty
  sendTelegramMessage(ADMIN_CHAT_ID, `🛵 <b>BẠN CÓ ĐƠN HÀNG MỚI CẦN ĐI LẤY:</b>\n\n${text}`);
}

// AI Socks Vision Matcher
async function runSocksAIComparison(newSockPath, candidates) {
  if (candidates.length === 0) return null;
  
  try {
    // Construct GoClaw OpenAI compat payload with images
    const messages = [
      {
        role: 'system',
        content: 'You are an AI assistant specialized in visual match analysis for missing clothing items (socks). Compare the target sock with the candidates. Determine if any candidate matches the target sock (fabric color, pattern, logo, length). Respond ONLY with a JSON object in this format: {"match": true/false, "matched_booking_code": "NFxxxx" or null, "confidence_score": 0.0-1.0, "reason": "short explanation"}. Do not return any other text.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Here is the target missing sock image:'
          },
          {
            type: 'image_url',
            image_url: {
              url: `https://nicefoldsaigon.vn${newSockPath}`
            }
          },
          {
            type: 'text',
            text: `Compare it with these candidate sock images:\n` + 
                  candidates.map((c, i) => `Candidate ${i+1} (Booking Code: ${c.booking_code}): https://nicefoldsaigon.vn${c.photo_path}`).join('\n')
          }
        ]
      }
    ];

    // Call GoClaw local completions endpoint
    const response = await fetch('http://localhost:3002/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 0efe653ca15f03f4ccec8f007cec08a3',
      },
      body: JSON.stringify({
        messages: messages,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      console.error('GoClaw AI Vision request failed:', await response.text());
      return null;
    }

    const data = await response.json();
    const rawReply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    
    // Parse json reply safely
    const cleanJsonStr = rawReply.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJsonStr);
  } catch (err) {
    console.error('Socks AI Comparison error:', err);
    return null;
  }
}

// --- TELEGRAM WEBHOOK CONTROLLER ---
async function handleTelegramUpdate(update) {
  if (!update) return;

  const message = update.message || update.edited_message;
  if (!message) return;

  const chatId = String(message.chat.id);
  const text = (message.text || message.caption || '').trim();
  const replyTo = message.reply_to_message;

  // --- 1. DYNAMIC STATUS INQUIRY IN ANY GROUP ---
  const bookingCodeMatch = text.match(/\b(NF|nf)\d{4}\b/i);
  if (bookingCodeMatch && !replyTo) {
    const bookingCode = bookingCodeMatch[0].toUpperCase();
    try {
      const order = await dbGet(
        `SELECT o.booking_code, o.order_status, o.amount, p.name as product_name, c.name as cust_name, c.hotel, c.room
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         JOIN products p ON o.product_id = p.id
         WHERE o.booking_code = ?`,
        [bookingCode]
      );

      if (order) {
        const readableStatus = STATUS_LABELS[order.order_status] || order.order_status;
        const responseText = `🔍 <b>TRUY VẤN ĐƠN HÀNG / ORDER STATUS:</b>
---------------------------------------
📌 Mã đơn: <code>${order.booking_code}</code>
👤 Khách hàng: <b>${order.cust_name}</b>
🏢 Khách sạn: ${order.hotel} (Phòng: ${order.room})
📦 Dịch vụ: ${order.product_name}
💵 Chi phí: ${(order.amount || 0).toLocaleString('vi-VN')} VND
🚨 <b>Tình trạng:</b> <u>${readableStatus}</u>`;
        
        sendTelegramMessage(chatId, responseText, message.message_id);
      } else {
        sendTelegramMessage(chatId, `❌ Không tìm thấy đơn hàng có mã <code>${bookingCode}</code> trong hệ thống.`, message.message_id);
      }
    } catch (e) {
      console.error('Order inquiry query failed:', e);
    }
    return;
  }

  // --- 2. MULTI-STAGE STATE MACHINE UPDATES VIA REPLY ---
  if (replyTo) {
    const replyMsgId = replyTo.message_id;
    try {
      // Find the mapped booking_code
      const mapping = await dbGet(
        "SELECT booking_code, message_type FROM order_telegram_mappings WHERE telegram_message_id = ?",
        [replyMsgId]
      );

      if (mapping) {
        const bookingCode = mapping.booking_code;
        const currentOrder = await dbGet(
          "SELECT o.*, c.name, c.phone, c.hotel, c.room FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.booking_code = ?",
          [bookingCode]
        );

        if (currentOrder) {
          // --- STAGE 2: Shipper Pickup Photo Reply in DON_NHAN ---
          if (chatId === GROUPS.DON_NHAN && mapping.message_type === 'pickup' && message.photo) {
            const largestPhoto = message.photo[message.photo.length - 1];
            const localPath = await downloadTelegramFile(largestPhoto.file_id);
            
            await dbRun(
              "UPDATE orders SET order_status = 'Đã lấy', pickup_photo_url = ? WHERE booking_code = ?",
              [localPath, bookingCode]
            );

            sendTelegramMessage(chatId, `✅ Đã nhận đồ đơn hàng <b>#${bookingCode}</b>! Cập nhật trạng thái thành: <b>Đã lấy đồ</b>.`, message.message_id);
            
            // Forward alert to BILL_PICKUP group
            const billText = `🧺 <b>ĐỒ ĐÃ VỀ TIỆM / CLOTHES RECEIVED</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code>
👤 Khách hàng: <b>${currentOrder.name}</b>
🚨 <i>Vui lòng cân đồ, lên hóa đơn giấy và chụp ảnh reply tin nhắn này kèm cân nặng (VD: "4.2kg") để xác nhận giặt!</i>`;
            
            const res2 = await sendTelegramPhoto(GROUPS.BILL_PICKUP, largestPhoto.file_id, billText);
            if (res2 && res2.result && res2.result.message_id) {
              await dbRun(
                "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'bill')",
                [bookingCode, res2.result.message_id, GROUPS.BILL_PICKUP]
              );
            }
          }

          // --- STAGE 3: Washer Bill Photo Reply in BILL_PICKUP ---
          else if (chatId === GROUPS.BILL_PICKUP && mapping.message_type === 'bill' && message.photo) {
            const largestPhoto = message.photo[message.photo.length - 1];
            const localPath = await downloadTelegramFile(largestPhoto.file_id);
            
            // Parse weight from text comment
            let weight = 0;
            const weightMatch = text.match(/(\d+(\.\d+)?)\s*(kg|kg\b|kilo)/i);
            if (weightMatch) {
              weight = parseFloat(weightMatch[1]);
            }

            await dbRun(
              "UPDATE orders SET order_status = 'Đang giặt', bill_photo_url = ?, weight = ? WHERE booking_code = ?",
              [localPath, weight, bookingCode]
            );

            sendTelegramMessage(chatId, `🧼 Ghi nhận đơn <b>#${bookingCode}</b> có cân nặng: <b>${weight || 'Chưa rõ'} kg</b>. Trạng thái: <b>Đang giặt sấy</b>.`, message.message_id);

            // Forward to XEP_DO group
            const foldText = `🧼 <b>ĐANG GIẶT / WASHING & FOLDING</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code>
👤 Khách hàng: <b>${currentOrder.name}</b>
⚖️ Cân nặng: ${weight} kg
🚨 <i>Sau khi giặt xong và xếp quần áo ngăn nắp, chụp hình gói đồ hoàn chỉnh reply tin nhắn này kèm chữ "xong" hoặc "done"!</i>`;
            
            const res3 = await sendTelegramPhoto(GROUPS.XEP_DO, largestPhoto.file_id, foldText);
            if (res3 && res3.result && res3.result.message_id) {
              await dbRun(
                "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'fold')",
                [bookingCode, res3.result.message_id, GROUPS.XEP_DO]
              );
            }
          }

          // --- STAGE 4: Folding Complete Reply in XEP_DO ---
          else if (chatId === GROUPS.XEP_DO && mapping.message_type === 'fold' && (text.toLowerCase().includes('done') || text.toLowerCase().includes('xong'))) {
            let localPath = null;
            let photoFileId = null;
            if (message.photo) {
              const largestPhoto = message.photo[message.photo.length - 1];
              photoFileId = largestPhoto.file_id;
              localPath = await downloadTelegramFile(photoFileId);
            }

            await dbRun(
              "UPDATE orders SET order_status = 'Chờ giao' WHERE booking_code = ?",
              [bookingCode]
            );

            sendTelegramMessage(chatId, `📦 Đơn hàng <b>#${bookingCode}</b> đã xếp xong! Trạng thái: <b>Chờ giao</b>.`, message.message_id);

            // Trigger Delivery alert in DON_GIAO group
            const delText = `🛵 <b>YÊU CẦU GIAO HÀNG / DELIVERY REQUEST</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code>
👤 Khách hàng: <b>${currentOrder.name}</b>
📞 SĐT: <code>${currentOrder.phone}</code>
🏢 Khách sạn: ${currentOrder.hotel}
🚪 Số phòng: ${currentOrder.room}
🚨 <i>Shipper giao hàng chụp ảnh và reply tin nhắn này kèm chữ "done" hoặc "xong" để hoàn tất đơn hàng!</i>`;
            
            let res4;
            if (photoFileId) {
              res4 = await sendTelegramPhoto(GROUPS.DON_GIAO, photoFileId, delText);
            } else {
              res4 = await sendTelegramMessage(GROUPS.DON_GIAO, delText);
            }

            if (res4 && res4.result && res4.result.message_id) {
              await dbRun(
                "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'delivery')",
                [bookingCode, res4.result.message_id, GROUPS.DON_GIAO]
              );
            }
          }

          // --- STAGE 5: Delivery Done Reply in DON_GIAO ---
          else if (chatId === GROUPS.DON_GIAO && mapping.message_type === 'delivery' && (text.toLowerCase().includes('done') || text.toLowerCase().includes('xong'))) {
            let localPath = null;
            if (message.photo) {
              const largestPhoto = message.photo[message.photo.length - 1];
              localPath = await downloadTelegramFile(largestPhoto.file_id);
            }

            await dbRun(
              "UPDATE orders SET order_status = 'Đã giao', delivery_photo_url = ? WHERE booking_code = ?",
              [localPath, bookingCode]
            );

            sendTelegramMessage(chatId, `🎉 Đơn hàng <b>#${bookingCode}</b> đã giao thành công và đóng đơn!`, message.message_id);

            // Send daily revenue summary alert
            const revText = `💰 <b>BÁO CÁO DOANH THU / COMPLETED ORDER</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code>
👤 Khách hàng: <b>${currentOrder.name}</b>
💵 Doanh thu tạm tính: <b>${(currentOrder.amount || 0).toLocaleString('vi-VN')} VND</b>
✅ Đã giao hàng & thanh toán thành công!`;
            
            sendTelegramMessage(GROUPS.REPORT_DOANH_THU, revText);

            // AUTOMATICALLY SEND CONFIRMATION VIA WHATSAPP (100% AUTOMATED)
            const waMessage = `🎉 *Nice Fold Saigon - Laundry Delivered!* 🎉
---------------------------------------
Dear *${currentOrder.name}*,
We are pleased to inform you that your laundry (Booking Code: *#${bookingCode}*) has been delivered successfully to your hotel lobby/front desk! 🛎️

Thank you for choosing Nice Fold Saigon! We hope to serve you again on your next trip! 🧺🧼`;

            // Trigger WhatsApp message via VPS Gateway
            sendWhatsAppConfirmation(currentOrder.phone, waMessage, localPath);
          }
        }
      }
    } catch (e) {
      console.error('Telegram reply handler error:', e);
    }
    return;
  }

  // --- 3. AI SOCKS MATCHER INTERACTION ---
  if (text.startsWith('/sotdo') || text.startsWith('#sotdo')) {
    if (message.photo) {
      try {
        const largestPhoto = message.photo[message.photo.length - 1];
        const localPath = await downloadTelegramFile(largestPhoto.file_id);
        
        // Save to database
        const bookingCode = text.replace(/[\/#]sotdo/i, '').trim().toUpperCase();
        await dbRun(
          "INSERT INTO missing_items (booking_code, photo_path) VALUES (?, ?)",
          [bookingCode || null, localPath]
        );
        sendTelegramMessage(chatId, `📥 Đã ghi nhận ảnh tất thất lạc vào hệ thống${bookingCode ? ' cho Đơn #' + bookingCode : ''}.`, message.message_id);
      } catch (err) {
        console.error('Save missing item failed:', err);
      }
    } else {
      sendTelegramMessage(chatId, `⚠️ Vui lòng gửi kèm hình ảnh chiếc tất khi thực hiện lệnh <code>/sotdo</code>.`, message.message_id);
    }
  }

  else if (text.startsWith('/check_sot')) {
    if (message.photo) {
      try {
        const largestPhoto = message.photo[message.photo.length - 1];
        const localPath = await downloadTelegramFile(largestPhoto.file_id);
        
        // Fetch candidates (unresolved missing items) from DB
        const candidates = await dbAll("SELECT booking_code, photo_path FROM missing_items WHERE is_resolved = 0");
        if (candidates.length === 0) {
          sendTelegramMessage(chatId, `🔍 Hệ thống hiện tại không lưu trữ chiếc tất thất lạc nào khác để so sánh.`, message.message_id);
          return;
        }

        sendTelegramMessage(chatId, `🤖 Đang chạy quét so khớp thị giác AI giữa ảnh vừa gửi và ${candidates.length} ảnh trong database... ⏳`, message.message_id);

        const result = await runSocksAIComparison(localPath, candidates);
        if (result && result.match) {
          const matchMsg = `🎉 <b>AI PHÁT HIỆN KHỚP HÌNH ẢNH!</b>
---------------------------------------
✅ <b>Kết quả:</b> Khớp với chiếc tất thất lạc của <b>Đơn hàng #${result.matched_booking_code}</b>!
📊 Độ tin cậy: ${(result.confidence_score * 100).toFixed(0)}%
💡 Giải thích lý do: ${result.reason}`;
          
          sendTelegramMessage(chatId, matchMsg, message.message_id);
        } else {
          sendTelegramMessage(chatId, `❌ AI không tìm thấy chiếc tất nào trùng khớp trong cơ sở dữ liệu hôm nay.`, message.message_id);
        }
      } catch (err) {
        console.error('Check missing sock failed:', err);
        sendTelegramMessage(chatId, `❌ Đã có lỗi xảy ra trong quá trình quét AI. Vui lòng kiểm tra lại.`, message.message_id);
      }
    } else {
      sendTelegramMessage(chatId, `⚠️ Vui lòng gửi kèm hình ảnh chiếc tất cần check khi thực hiện lệnh <code>/check_sot</code>.`, message.message_id);
    }
  }
}

// --- INIT MAIN CONTROLLER ---
function init(app, sqliteDb) {
  db = sqliteDb;
  
  // 1. Register Webhook endpoint inside Express app
  app.post('/api/telegram-webhook', (req, res) => {
    handleTelegramUpdate(req.body);
    res.sendStatus(200);
  });
  
  // 2. Set Telegram webhook URL programmatically
  const webhookUrl = `https://nicefoldsaigon.vn/api/telegram-webhook`;
  const setWebhookApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}&allowed_updates=${encodeURIComponent(JSON.stringify(["message", "edited_message", "callback_query", "my_chat_member"]))}`;
  
  https.get(setWebhookApiUrl, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      console.log('Telegram webhook registration reply:', raw);
    });
  }).on('error', (err) => {
    console.error('Failed to set Telegram webhook:', err);
  });
  
  // 3. Start WhatsApp Baileys connection listener
  startWhatsAppBot();
}

module.exports = {
  init,
  sendOrderAlert,
  sendWhatsAppConfirmation
};
