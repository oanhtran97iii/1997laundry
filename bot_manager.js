const fs = require('fs');
const path = require('path');
const https = require('https');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');

// Telegram Config
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = '8745979419'; // Corrected typo (missing 9 in 8745979419)
const ADMIN_CHAT_IDS = ['874597419', '8745979419'];

const GROUPS = {
  DON_NHAN: process.env.TELEGRAM_DON_NHAN_CHAT_ID || '-5534415575',
  BILL_PICKUP: process.env.TELEGRAM_BILL_PICKUP_CHAT_ID || '-5346503762',
  XEP_DO: process.env.TELEGRAM_XEP_DO_CHAT_ID || '-5484161176',
  DON_GIAO: process.env.TELEGRAM_DON_GIAO_CHAT_ID || '-5331350195',
  CHECK_THANH_TOAN: process.env.TELEGRAM_CHECK_THANH_TOAN_CHAT_ID || '-5390540854',
  REPORT_DON: process.env.TELEGRAM_REPORT_DON_CHAT_ID || '-5415043824',
  REPORT_DOANH_THU: process.env.TELEGRAM_REPORT_DOANH_THU_CHAT_ID || '-5453952425'
};

// Global variables for SQLite DB & WhatsApp Sock
let db = null;
let sock = null;
let isWaConnected = false;

// --- TELEGRAM HELPER FUNCTIONS ---
function sendTelegramMessage(chatId, text, replyToMessageId = null, replyMarkup = null) {
  if (!TELEGRAM_TOKEN || TELEGRAM_TOKEN === 'disabled') {
    return Promise.resolve(null);
  }
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  if (replyToMessageId) {
    payload.reply_to_message_id = replyToMessageId;
  }
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
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
    },
    family: 4
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

function deleteTelegramMessage(chatId, messageId) {
  if (!TELEGRAM_TOKEN || TELEGRAM_TOKEN === 'disabled') {
    return Promise.resolve(null);
  }
  const payload = {
    chat_id: chatId,
    message_id: messageId
  };
  const postData = JSON.stringify(payload);
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TELEGRAM_TOKEN}/deleteMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    family: 4
  };

  return new Promise((resolve) => {
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
      console.error('deleteTelegramMessage error:', err);
      resolve(null);
    });
    req.write(postData);
    req.end();
  });
}

function parseHourFromString(timeStr) {
  if (!timeStr) return null;
  const clean = timeStr.toLowerCase().trim();
  
  // Try matching HH:MM or HHhMM or HHh
  // E.g. "11:30", "11h30", "11h", "11:00", "9:00"
  const matchHm = clean.match(/^(\d{1,2})(?::|h)(\d{2})?/);
  if (matchHm) {
    let hour = parseInt(matchHm[1], 10);
    
    // Check for am/pm indicators in the string
    if (clean.includes('pm') && hour < 12) {
      hour += 12;
    } else if (clean.includes('am') && hour === 12) {
      hour = 0;
    }
    return hour;
  }

  // Try matching "9", "9am", "1pm", "13"
  const matchSimple = clean.match(/^(\d{1,2})\s*(am|pm|g|giờ|gio)?/);
  if (matchSimple) {
    let hour = parseInt(matchSimple[1], 10);
    const ampm = matchSimple[2];
    if (ampm === 'pm' && hour < 12) {
      hour += 12;
    } else if (ampm === 'am' && hour === 12) {
      hour = 0;
    }
    return hour;
  }
  
  return null;
}

function parseTimeMinutesFromString(timeStr) {
  if (!timeStr) return null;
  const clean = timeStr.toLowerCase().trim();
  
  // Try matching HH:MM or HHhMM or HHh
  // E.g. "11:55", "11h55", "11h", "11:00", "9:00"
  const matchHm = clean.match(/^(\d{1,2})(?::|h)(\d{2})?/);
  if (matchHm) {
    let hour = parseInt(matchHm[1], 10);
    const minute = matchHm[2] ? parseInt(matchHm[2], 10) : 0;
    
    // Check for am/pm indicators in the string
    if (clean.includes('pm') && hour < 12) {
      hour += 12;
    } else if (clean.includes('am') && hour === 12) {
      hour = 0;
    }
    return hour * 60 + minute;
  }

  // Try matching "9", "9am", "1pm", "13"
  const matchSimple = clean.match(/^(\d{1,2})\s*(am|pm|g|giờ|gio)?/);
  if (matchSimple) {
    let hour = parseInt(matchSimple[1], 10);
    const ampm = matchSimple[2];
    if (ampm === 'pm' && hour < 12) {
      hour += 12;
    } else if (ampm === 'am' && hour === 12) {
      hour = 0;
    }
    return hour * 60;
  }
  
  return null;
}

function getVietnamTimeMinutes(dateStr) {
  try {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    // Convert UTC to Vietnam local time (UTC+7)
    const vnTime = new Date(d.getTime() + (7 * 60 * 60 * 1000));
    return vnTime.getUTCHours() * 60 + vnTime.getUTCMinutes();
  } catch (e) {
    return 0;
  }
}

function getSimplifiedProductName(productId, productName, notesText) {
  const notes = (notesText || '').toLowerCase();
  const lowerName = (productName || '').toLowerCase();
  
  if (productId === 3 || lowerName.includes('4h') || lowerName.includes('express')) {
    return '4-Hour Express';
  } else if (productId === 2 || lowerName.includes('same') || lowerName.includes('trong ngày')) {
    return 'Same-day';
  } else {
    const hasTachTrang = notes.includes('tách trắng') || 
                          notes.includes('tach trang') || 
                          notes.includes('tách riêng') || 
                          notes.includes('tach rieng') || 
                          notes.includes('giặt riêng') || 
                          notes.includes('giat rieng');
    return hasTachTrang ? 'Next-day (có tách trắng)' : 'Next-day (không tách trắng)';
  }
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
      },
      family: 4
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
  const staticUrl = `https://1997laundry.com${photoPathOrFileId}`;
  return sendTelegramPhoto(chatId, staticUrl, caption, replyToMessageId);
}

function downloadTelegramFile(fileId) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`, { family: 4 }, (res) => {
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
            https.get(fileUrl, { family: 4 }, (fileRes) => {
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

async function syncOrderUpdateToN8n(bookingCode, amount, status, skipTelegram = false) {
  try {
    const n8nUrl = process.env.N8N_UPDATE_ORDER_URL || "https://hoangoanh.app.n8n.cloud/webhook/update-order";
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({
        bookingCode: String(bookingCode),
        amount: amount || 0,
        status: status,
        skip_telegram: skipTelegram
      }),
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      console.log(`Successfully synced order ${bookingCode} status "${status}" to n8n`);
      return true;
    } else {
      console.error(`Failed to sync order ${bookingCode} to n8n: ${response.statusText}`);
      return false;
    }
  } catch (e) {
    console.error(`Failed to sync order ${bookingCode} to n8n:`, e.message);
    return false;
  }
}

// --- STATE MACHINE STATUS LABELS ---
const STATUS_LABELS = {
  'Chưa lấy': 'Chưa lấy (Shipper đang qua lấy đồ / Shipper is on the way to collect)',
  'Đã lấy': 'Đã lấy đồ (Đang vận chuyển về tiệm / Collected & arriving at laundry room)',
  'Chờ giặt': 'Chờ giặt (Washing / drying / folding)',
  'Chờ giao (đã thanh toán)': 'Đang chờ giao - Đã thanh toán (Paid & ready for delivery)',
  'Chờ giao chưa thanh toán': 'Đang chờ giao - Chưa thanh toán (Unpaid / COD)',
  'Hoàn thành': 'Đã giao thành công (Delivered successfully! 🎉)'
};

// --- WHATSAPP HELPER FUNCTIONS ---
const userStates = new Map();

async function handleWhatsAppInboundMessage(phone, text, rawMsg) {
  const cleanText = text.trim().toLowerCase();
  let state = userStates.get(phone) || { step: 'idle', data: {} };
  
  if (cleanText === 'menu' || cleanText === 'reset' || (state.step === 'idle' && (cleanText === 'hi' || cleanText === 'hello' || cleanText === 'xin chào' || cleanText === 'chào'))) {
    state = { step: 'welcome', data: {} };
    userStates.set(phone, state);
    const welcomeMsg = `Dạ 1997 Laundry xin chào anh/chị! 🌸\n\nTiệm giặt sấy của chúng em tại Quận 1 chuyên cung cấp dịch vụ giặt sấy sạch sẽ, giao nhận tận sảnh lễ tân.\n\nVui lòng chọn số tương ứng với dịch vụ anh/chị cần:\n👉 1. Đặt lịch giặt sấy (Book Laundry)\n👉 2. Xem bảng giá dịch vụ (Pricing)\n👉 3. Hỏi câu hỏi khác (Ask AI Assistant)\n\n(Vui lòng gõ 1, 2 hoặc 3)`;
    await sock.sendMessage(phone, { text: welcomeMsg });
    return;
  }
  
  if (state.step === 'welcome') {
    if (cleanText === '1') {
      state.step = 'select_package';
      userStates.set(phone, state);
      const pkgMsg = `📦 Anh/chị vui lòng chọn gói giặt sấy mong muốn:\n👉 1. Gói hỏa tốc (4 Hour Express)\n👉 2. Gói nhanh trong ngày (Same-day)\n👉 3. Gói tiêu chuẩn (Next-day 24h)\n\n(Vui lòng gõ 1, 2 hoặc 3)`;
      await sock.sendMessage(phone, { text: pkgMsg });
    } else if (cleanText === '2') {
      const priceMsg = `💵 Bảng giá dịch vụ của 1997 Laundry:\n---------------------------------------\n⚡ 1. Giặt sấy hỏa tốc 4 giờ: 220.000 VND (tối đa 5kg, thêm +35k/kg)\n⚡ 2. Giặt sấy nhanh trong ngày: 180.000 VND (tối đa 5kg, thêm +30k/kg)\n🌱 3. Giặt sấy tiêu chuẩn 24 giờ: 30.000 VND / kg (tối thiểu 3.5kg)\n\n🛵 Phí giao nhận khứ hồi đồng bộ: 40.000 VND flat-rate.\n💵 Phương thức thanh toán: Tiền mặt (Cash only).\n\n(Vui lòng gõ 1 để quay lại đặt lịch giặt sấy hoặc gõ "menu" để quay lại ban đầu)`;
      await sock.sendMessage(phone, { text: priceMsg });
    } else if (cleanText === '3') {
      state.step = 'ai_mode';
      userStates.set(phone, state);
      const aiWelcome = `🤖 Chế độ trợ lý AI đã được kích hoạt!\n\nAnh/chị cứ nhắn tin đặt câu hỏi tự do bằng tiếng Anh hoặc tiếng Việt, em sẽ giải đáp ngay nhé ạ.\n\n(Nhắn "menu" bất kỳ lúc nào để quay lại danh mục ban đầu)`;
      await sock.sendMessage(phone, { text: aiWelcome });
    } else {
      await handleAIFallback(phone, text);
    }
    return;
  }
  
  if (state.step === 'select_package') {
    if (['1', '2', '3'].includes(cleanText)) {
      const pkgs = { '1': '4 Hour Express Wash (4h)', '2': 'Same-day Wash & Fold (8h-12h)', '3': 'Standard Wash & Fold (24h)' };
      const pkgIds = { '1': 3, '2': 2, '3': 1 };
      state.data.packageName = pkgs[cleanText];
      state.data.productId = pkgIds[cleanText];
      state.step = 'ask_hotel';
      userStates.set(phone, state);
      const hotelMsg = `🏢 Cho tiệm xin tên Khách sạn (Hotel Name) của anh/chị đang ở nhé:`;
      await sock.sendMessage(phone, { text: hotelMsg });
    } else {
      await handleAIFallback(phone, text);
    }
    return;
  }
  
  if (state.step === 'ask_hotel') {
    state.data.hotelName = text.trim();
    state.step = 'ask_room';
    userStates.set(phone, state);
    const roomMsg = `🔑 Vui lòng nhập số phòng (Room Number) của anh/chị:`;
    await sock.sendMessage(phone, { text: roomMsg });
    return;
  }
  
  if (state.step === 'ask_room') {
    state.data.roomNumber = text.trim();
    state.step = 'confirm_booking';
    userStates.set(phone, state);
    
    const pkgPrices = { '4 Hour Express Wash (4h)': 220000, 'Same-day Wash & Fold (8h-12h)': 180000, 'Standard Wash & Fold (24h)': 105000 };
    const basePrice = pkgPrices[state.data.packageName] || 0;
    const totalEst = basePrice + 40000;
    state.data.estimatedAmount = totalEst;
    
    const confirmMsg = `📝 Xác nhận đặt lịch của anh/chị:\n---------------------------------------\n📦 Dịch vụ: ${state.data.packageName}\n🏢 Khách sạn: ${state.data.hotelName}\n🚪 Số phòng: ${state.data.roomNumber}\n💵 Tạm tính (gồm 40k ship): ${totalEst.toLocaleString('vi-VN')} VND\n\n👉 Anh/chị vui lòng để đồ giặt tại sảnh Lễ tân (Reception Lobby) và đặt cọc 300.000 VND tiền mặt bên trong túi đồ nhé. Shipper của tiệm sẽ qua lấy đồ ngay ạ!\n\n(Vui lòng gõ "OK" hoặc "1" để xác nhận đặt lịch)`;
    await sock.sendMessage(phone, { text: confirmMsg });
    return;
  }
  
  if (state.step === 'confirm_booking') {
    if (cleanText === 'ok' || cleanText === '1') {
      try {
        const codeNum = Math.floor(1000 + Math.random() * 9000);
        const bookingCode = `LTT${codeNum}`;
        
        const formattedPhone = phone.split('@')[0];
        let customer = await dbGet("SELECT id FROM customers WHERE phone = ?", [`+${formattedPhone}`]);
        let customerId;
        if (customer) {
          customerId = customer.id;
          await dbRun(
            "UPDATE customers SET name = ?, hotel = ?, room = ? WHERE id = ?",
            [state.data.hotelName, state.data.hotelName, state.data.roomNumber, customerId]
          );
        } else {
          const res = await dbRun(
            "INSERT INTO customers (name, phone, hotel, room) VALUES (?, ?, ?, ?)",
            [state.data.hotelName, `+${formattedPhone}`, state.data.hotelName, state.data.roomNumber]
          );
          customerId = res.lastID;
        }
        
        await dbRun(
          `INSERT INTO orders (booking_code, customer_id, product_id, amount, status, order_status, order_date, notes) 
           VALUES (?, ?, ?, ?, 'Chờ thanh toán', 'Chờ lấy', ?, ?)`,
          [bookingCode, customerId, state.data.productId, state.data.estimatedAmount, new Date().toISOString(), 'Đặt qua WhatsApp Flow']
        );
        
        const successMsg = `🔔 Đặt lịch thành công! Mã đơn hàng của anh/chị là: ${bookingCode}.\n\nCảm ơn anh/chị đã lựa chọn 1997 Laundry! 🌸`;
        await sock.sendMessage(phone, { text: successMsg });
        
        const teleMsg = `🔔 <b>ĐƠN HÀNG WHATSAPP MỚI (1997 LAUNDRY)</b>\n---------------------------------------\n📌 Mã đơn: <code>${bookingCode}</code>\n🏢 Khách sạn: <b>${state.data.hotelName}</b>\n🚪 Phòng: <b>${state.data.roomNumber}</b>\n📞 SĐT: <code>+${formattedPhone}</code>\n📦 Dịch vụ: <b>${state.data.packageName}</b>\n💵 Tạm tính: <b>${state.data.estimatedAmount.toLocaleString('vi-VN')} VND</b>\n⏰ Trạng thái: Chờ shipper qua lấy đồ`;
        sendTelegramMessage(GROUPS.DON_NHAN, teleMsg);
        
        userStates.set(phone, { step: 'idle', data: {} });
      } catch (err) {
        console.error('Failed to save WhatsApp flow booking:', err);
        await sock.sendMessage(phone, { text: `❌ Rất tiếc, đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.` });
      }
    } else {
      await handleAIFallback(phone, text);
    }
    return;
  }
  
  await handleAIFallback(phone, text);
}

async function handleAIFallback(phone, text) {
  try {
    const formattedPhone = phone.split('@')[0];
    const payload = {
      messages: [{ role: 'user', content: text }]
    };

    const response = await fetch('http://localhost:3002/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 0efe653ca15f03f4ccec8f007cec08a3',
        'X-GoClaw-User-Id': `whatsapp-${formattedPhone}`,
        'X-GoClaw-Agent-Id': process.env.AGENT_ID || '1997-laundry-assistant'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (reply) {
        await sock.sendMessage(phone, { text: reply });
      }
    } else {
      const errText = await response.text();
      console.error('[WhatsApp Inbound] goClaw completions API error:', errText);
    }
  } catch (err) {
    console.error('[WhatsApp Inbound] Fallback to goClaw failed:', err);
  }
}

async function startWhatsAppBot() {
  const authPath = path.join(__dirname, 'auth_info_1997');
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
      const qrPath = path.join(__dirname, 'uploads', 'qr_1997.png');
      fs.mkdirSync(path.dirname(qrPath), { recursive: true });
      await qrcode.toFile(qrPath, qr, { scale: 8 });
      console.log(`QR code saved to ${qrPath}. Please scan at http://103.97.127.31:4000/uploads/qr_1997.png`);
      
      const now = Date.now();
      if (!global.lastWaQrAlertTime_1997 || (now - global.lastWaQrAlertTime_1997 > 600000)) {
        global.lastWaQrAlertTime_1997 = now;
        sendTelegramMessage(ADMIN_CHAT_ID, `⚠️ <b>[1997 Laundry] WhatsApp Gateway is disconnected.</b>\nPlease scan this QR code to authenticate: http://103.97.127.31:4000/uploads/qr_1997.png`);
      }
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
      const qrPath = path.join(__dirname, 'uploads', 'qr_1997.png');
      if (fs.existsSync(qrPath)) {
        fs.unlinkSync(qrPath);
      }
      sendTelegramMessage(ADMIN_CHAT_ID, `✅ <b>[1997 Laundry] WhatsApp Gateway has connected successfully!</b>`);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      
      const phone = msg.key.remoteJid;
      const text = msg.message.conversation || 
                   (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || 
                   '';
      
      if (!text) continue;
      
      await handleWhatsAppInboundMessage(phone, text, msg);
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
  
  const mapLinkStr = order.mapLink ? `\n🗺️ ${order.mapLink}` : '';
  const text = `🛎️ <b>ĐƠN HÀNG MỚI</b>
---------------------------------------

<code>${order.bookingCode}</code>
${order.pickupTime}
<b>${order.name}</b>
<b>${order.service}</b>
<b>${order.roomNumber || 'Không có'}</b>
<code>${order.phone}</code>
${order.hotelAddress}${mapLinkStr}`;

  // 1. Post to "Đơn Nhận" group
  const res1 = await sendTelegramMessage(GROUPS.DON_NHAN, text);
  if (res1 && res1.result && res1.result.message_id) {
    await dbRun(
      "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'pickup')",
      [order.bookingCode, res1.result.message_id, GROUPS.DON_NHAN]
    );
  }

  // 2. Post to "Report Đơn" group (Disabled as requested)

  // 3. DM alert to Shipper on duty
  sendTelegramMessage(ADMIN_CHAT_ID, `🛵 <b>BẠN CÓ ĐƠN HÀNG MỚI CẦN ĐI LẤY:</b>\n\n${text}`);
}

// Helper functions for native Gemini Multimodal API calls
function fileToBase64(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
  } catch (err) {
    console.error(`fileToBase64 failed for ${filePath}:`, err);
    return '';
  }
}

function getMimeType(filePath) {
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

// AI Socks Vision Matcher using native Gemini API
async function runSocksAIComparison(newSockPath, candidates) {
  if (candidates.length === 0) return null;
  
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const parts = [];

    let prompt = `You are an AI assistant specialized in visual match analysis for missing clothing items (socks).
Compare the target sock with the candidates. Determine if any candidate matches the target sock (fabric color, pattern, logo, length).

Respond ONLY with a JSON object in this format:
{
  "match": true | false,
  "matched_booking_code": "LTTxxxx" or null,
  "confidence_score": number (0.0 to 1.0),
  "reason": "explanation of your match"
}

Here is the target missing sock image:`;

    parts.push({ text: prompt });

    const newSockAbsPath = path.join(__dirname, newSockPath.replace(/^\//, ''));
    if (fs.existsSync(newSockAbsPath)) {
      parts.push({
        inlineData: {
          mimeType: getMimeType(newSockAbsPath),
          data: fileToBase64(newSockAbsPath)
        }
      });
    }

    parts.push({ text: "\nCompare it with these candidate sock images:" });

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      const candAbsPath = path.join(__dirname, cand.photo_path.replace(/^\//, ''));
      if (fs.existsSync(candAbsPath)) {
        parts.push({ text: `\nCandidate ${i + 1} (Booking Code: ${cand.booking_code}):` });
        parts.push({
          inlineData: {
            mimeType: getMimeType(candAbsPath),
            data: fileToBase64(candAbsPath)
          }
        });
      }
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Gemini socks comparison API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const rawText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
    if (!rawText) return null;

    return JSON.parse(rawText.trim());
  } catch (err) {
    console.error('Socks AI Comparison error:', err);
    return null;
  }
}

// Native Gemini API image analyzer
async function analyzeImageWithAI(imagePath, systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const parts = [];
      parts.push({ text: `${systemPrompt}\n\n${userPrompt}` });

      const absPath = path.join(__dirname, imagePath.replace(/^\//, ''));
      if (fs.existsSync(absPath)) {
        parts.push({
          inlineData: {
            mimeType: getMimeType(absPath),
            data: fileToBase64(absPath)
          }
        });
      }

      const payload = {
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 429) {
        console.warn(`[Gemini API] Rate limit (429) hit. Retrying in 8 seconds... (Attempt ${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 8000));
        continue;
      }

      if (!response.ok) {
        console.error('Gemini Vision analysis API error:', await response.text());
        return null;
      }

      const data = await response.json();
      const rawText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
      if (!rawText) return null;

      return JSON.parse(rawText.trim());
    } catch (err) {
      console.error(`AI Vision analysis error (Attempt ${attempts}/${maxAttempts}):`, err);
      if (attempts >= maxAttempts) return null;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  return null;
}

async function transcribeImageWithAI(imagePath, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const parts = [];
    parts.push({ text: `Bạn là trợ lý AI dịch vụ giặt là 1997 Premium Laundry. Hãy mô tả chi tiết hình ảnh này, đặc biệt là đọc và dịch toàn bộ chữ viết trong hình ảnh (nếu là hóa đơn, ghi rõ mã hóa đơn, tên khách, số phòng, các mặt hàng...). Nếu là ảnh quần áo, mô tả màu sắc, kiểu dáng, hoa văn đặc trưng để giúp đối chiếu đồ bị thất lạc.` });
    if (userPrompt) {
      parts.push({ text: `Yêu cầu cụ thể từ khách: ${userPrompt}` });
    }

    const absPath = path.join(__dirname, imagePath.replace(/^\//, ''));
    if (fs.existsSync(absPath)) {
      parts.push({
        inlineData: {
          mimeType: getMimeType(absPath),
          data: fileToBase64(absPath)
        }
      });
    }

    const payload = {
      contents: [{ parts }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Gemini Vision transcribe API error:', await response.text());
      return '';
    }

    const data = await response.json();
    const rawText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
    return rawText || '';
  } catch (err) {
    console.error('AI Vision transcribe error:', err);
    return '';
  }
}

// Native Gemini API text analyzer
async function analyzeTextWithAI(textToAnalyze, systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const payload = {
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nText to analyze:\n${textToAnalyze}` }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 429) {
        console.warn(`[Gemini API] Rate limit (429) hit. Retrying in 8 seconds... (Attempt ${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 8000));
        continue;
      }

      if (!response.ok) {
        console.error('Gemini text analysis API error:', await response.text());
        return null;
      }

      const data = await response.json();
      const rawText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
      if (!rawText) return null;

      return JSON.parse(rawText.trim());
    } catch (err) {
      console.error(`AI text analysis error (Attempt ${attempts}/${maxAttempts}):`, err);
      if (attempts >= maxAttempts) return null;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  return null;
}

function fallbackParseOrderText(text) {
  // Remove URLs first to prevent place ID collision with room numbers
  const textWithoutUrls = text.replace(/https?:\/\/\S+/gi, '');
  const lines = textWithoutUrls.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Default values
  let name = 'Group Customer';
  let phone = '';
  let hotel = '1997 Laundry Shop';
  let room = '';
  let product_id = 2; // Default to Same-day
  let pickup_time = '';
  let notes = '';

  // 1. Phone extraction
  const phoneRegex = /(\+?\d{1,4}[\s()-]*\d{3,4}[\s()-]*\d{3,4})/g;
  const phoneMatch = textWithoutUrls.match(phoneRegex);
  if (phoneMatch) {
    phone = phoneMatch[0].trim();
  } else {
    // If no numeric phone found, check if there is a Zalo/FB text
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('zalo') || lowerLine.includes('fb') || lowerLine.includes('facebook')) {
        let cleanContact = line.replace(/^\d+[\/)]\s*/, '').trim();
        cleanContact = cleanContact.replace(/^(?:sđt|sdt|phone|📞|liên hệ|lien he)\s*:\s*/i, '').trim();
        if (cleanContact.length < 30) {
          phone = cleanContact;
          break;
        }
      }
    }
  }

  // 2. Room extraction (use word boundary to prevent matching inside Place IDs)
  const roomMatch = textWithoutUrls.match(/\b(?:phòng|phong|room|p|r)\.?\s*(\d+)\b/i);
  if (roomMatch) {
    room = roomMatch[1];
  }

  // 3. Hotel extraction
  // Search for lines containing "hotel", "khách sạn", "khach san", "ks"
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const hotelKeywords = ['hotel', 'khách sạn', 'khach san', 'ks', 'apartment', 'condo', 'living', 'residence', 'villa', 'homestay', 'house', 'home', 'suites', 'sila', 'indigo', 'vela', 'sheraton', 'lotte', 'nikko', 'ha do', 'centrosa', 'palace'];
    if (hotelKeywords.some(keyword => lowerLine.includes(keyword))) {
      // Clean numbering prefix (e.g. "4) la vela saigon hotel" -> "la vela saigon hotel")
      let cleanHotel = line.replace(/^\d+[\/)]\s*/, '').trim();
      // Remove starting emoji or map symbol if any
      cleanHotel = cleanHotel.replace(/^[📍🏢🗺️]\s*/, '').trim();
      hotel = cleanHotel;
      break;
    }
  }

  // 4. Name extraction
  // Search for a line containing "tên", "ten", "name", or the room number
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const hasRoomNum = room && lowerLine.includes(room);
    const hasNameLabel = lowerLine.includes('tên:') || lowerLine.includes('ten:') || lowerLine.includes('name:');
    
    if (hasRoomNum || hasNameLabel) {
      let cleanName = line.replace(/^\d+[\/)]\s*/, '')
                          .replace(/\b(?:phòng|phong|room|p|r)\.?\s*\d+\b/i, '')
                          .replace(/[()]/g, '')
                          .replace(/(?:tên|ten|name)\s*:\s*/i, '')
                          .trim();
      // Ensure we don't take an address line as a name
      if (cleanName && !cleanName.toLowerCase().includes('hotel') && !cleanName.toLowerCase().includes('khách sạn') && !cleanName.toLowerCase().includes('khach san') && !cleanName.toLowerCase().includes('đường')) {
        name = cleanName;
        break;
      }
    }
  }

  if (name === 'Group Customer') {
    const nameRoomRegex = /([a-zA-ZÀ-ỹ &]+)\s*-\s*(?:room|r|p|phòng|phong)?\s*(\d+)/i;
    for (const line of lines) {
      const nameRoomMatch = line.match(nameRoomRegex);
      if (nameRoomMatch) {
        name = nameRoomMatch[1].trim();
        if (!room) room = nameRoomMatch[2].trim();
        break;
      }
    }
    
    if (name === 'Group Customer') {
      // Check for lines with " - "
      for (const line of lines) {
        if (line.includes('-') && !line.includes('+') && !line.includes('same')) {
          const parts = line.split('-');
          if (parts.length === 2 && !isNaN(parts[1].trim())) {
            name = parts[0].trim();
            if (!room) room = parts[1].trim();
            break;
          }
        }
      }
    }
  }

  // 5. Time extraction (support HH:MM, HHhMM, HHh, HHam/pm)
  const timeRegex = /\b(?:1[0-2]|0?[1-9]):[0-5][0-9]\b|\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9]\b|\b\d{1,2}(?:h|g)\d{2}\b|\b\d{1,2}\s*(?:am|pm)\b/i;
  const timeMatch = textWithoutUrls.match(timeRegex);
  if (timeMatch) {
    pickup_time = timeMatch[0].trim();
  } else {
    const timeKeywords = ['pm', 'am', 'h', 'g', 'giờ', 'gio', 'bây giờ', 'bay gio', 'ngay', 'asap'];
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const cleanLine = line.replace(/^\d+[\/)]\s*/, '').trim();
      
      const isTimeLine = timeKeywords.some(keyword => lowerLine.includes(keyword)) && 
                         !lowerLine.includes('hotel') && 
                         !lowerLine.includes('laundry') && 
                         !lowerLine.includes('room') &&
                         cleanLine.length < 15;
      if (isTimeLine) {
        pickup_time = cleanLine;
        break;
      }
    }
  }
  if (!pickup_time) {
    const nowMatch = textWithoutUrls.match(/(?:bây giờ|bay gio|ngay|ngay lap tuc|asap)/i);
    if (nowMatch) {
      pickup_time = 'Lấy liền';
    }
  }

  // 6. Product ID & Notes extraction (parse parentheses notes from the package line)
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('next day') || lowerLine.includes('next-day') || lowerLine.includes('standard') || lowerLine.includes('24h') || lowerLine.includes('thường') || lowerLine.includes('tiêu chuẩn') || lowerLine.includes('tieu chuan')) {
      product_id = 1;
      const noteMatch = line.match(/\(([^)]+)\)/);
      if (noteMatch) {
        notes = noteMatch[1].trim();
      }
      break;
    } else if (lowerLine.includes('same day') || lowerLine.includes('same-day') || lowerLine.includes('trong ngày') || lowerLine.includes('trong ngay') || lowerLine.includes('nhanh')) {
      product_id = 2;
      const noteMatch = line.match(/\(([^)]+)\)/);
      if (noteMatch) {
        notes = noteMatch[1].trim();
      }
      break;
    } else if (lowerLine.includes('express') || lowerLine.includes('4h') || lowerLine.includes('hỏa tốc') || lowerLine.includes('hoa toc') || lowerLine.includes('siêu tốc') || lowerLine.includes('sieu toc')) {
      product_id = 3;
      const noteMatch = line.match(/\(([^)]+)\)/);
      if (noteMatch) {
        notes = noteMatch[1].trim();
      }
      break;
    }
  }

  // 7. Fallback notes extraction
  if (!notes) {
    const notesMatch = textWithoutUrls.match(/(?:-|có)\s*(tiền trong đồ|đồ màu|cẩn thận|gấp|trắng|separate|weigh)/i);
    if (notesMatch) {
      notes = notesMatch[0].replace(/^-/, '').trim();
    }
  }

  // 8. Fallback address detection
  if (hotel === '1997 Laundry Shop') {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (line !== name && line !== phone && line !== pickup_time && 
          !lowerLine.includes('same day') && !lowerLine.includes('next day') && !lowerLine.includes('express') &&
          (line.match(/^\d+/) || lowerLine.includes('đường') || lowerLine.includes('phường') || lowerLine.includes('quận') || lowerLine.includes('ward') || lowerLine.includes('district') || lowerLine.includes('📍') || lowerLine.includes('street'))) {
        hotel = line.replace(/^[📍🏢🗺️]\s*/, '').trim();
        break;
      }
    }
  }

  // 9. Pickup option extraction
  let pickup_option = 'Lễ tân';
  const lowerTextForOption = textWithoutUrls.toLowerCase();
  if (lowerTextForOption.includes('từ khách') || lowerTextForOption.includes('tu khach') || lowerTextForOption.includes('gọi khách') || lowerTextForOption.includes('goi khach') || lowerTextForOption.includes('đến phòng') || lowerTextForOption.includes('den phong')) {
    pickup_option = 'Từ khách';
  } else if (lowerTextForOption.includes('bảo vệ') || lowerTextForOption.includes('bao ve') || lowerTextForOption.includes('security')) {
    pickup_option = 'Gửi bảo vệ';
  }

  return {
    is_order_request: !!(phone || name !== 'Group Customer' || room || hotel !== '1997 Laundry Shop'),
    name,
    phone,
    hotel,
    room,
    product_id,
    pickup_time,
    pickup_option,
    notes,
    confidence: 0.9,
    reason: 'Parsed using regex fallback.'
  };
}

function isOrderInfoSuspicious(aiRes) {
  if (!aiRes) return true;
  const hotel = (aiRes.hotel || '').toLowerCase().trim();
  const name = (aiRes.name || '').toLowerCase().trim();
  
  if (!hotel || hotel.includes('1997 laundry') || hotel.includes('1997 premium') || hotel.includes('laundry shop')) {
    return true;
  }
  
  if (!name || name === 'group customer' || name === 'group chat customer' || name.includes('từ khách') || name.includes('lễ tân') || name.includes('reception') || name.includes('same day') || name.includes('next day') || name.includes('express') || /^\+?\d+$/.test(name)) {
    return true;
  }
  
  return false;
}

async function runLeftoverSocksMatcher(targetPath, candidates) {
  if (candidates.length === 0) return null;
  
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const parts = [];

    let prompt = `You are an AI assistant for a laundry shop.
We have a target image showing a leftover clothing item (like a sock) placed next to a receipt.
We also have a list of candidate missing items reported by other customers.

Your task is to:
1. Extract the booking code or receipt number from the receipt in the target image (let's call this the "source_booking_code" where the item was found).
2. Compare the leftover item in the target image with the candidate missing items (focus on pattern, color, brand/logo, texture, length).
3. Determine if the leftover item matches any of the candidates.

Respond ONLY with a JSON object in this format:
{
  "match": true | false,
  "matched_booking_code": "LTTxxxx" or null (the booking code of the matching candidate),
  "source_booking_code": "LTTxxxx" or null (the booking code extracted from the receipt in the target image),
  "confidence_score": number (0.0 to 1.0),
  "reason": "explanation of your match and extraction"
}

Here is the target image (which has the leftover item and receipt):`;

    parts.push({ text: prompt });

    const targetAbsPath = path.join(__dirname, targetPath.replace(/^\//, ''));
    if (fs.existsSync(targetAbsPath)) {
      parts.push({
        inlineData: {
          mimeType: getMimeType(targetAbsPath),
          data: fileToBase64(targetAbsPath)
        }
      });
    }

    parts.push({ text: "\nHere are the candidate missing items images to compare against:" });

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      const candAbsPath = path.join(__dirname, cand.photo_path.replace(/^\//, ''));
      if (fs.existsSync(candAbsPath)) {
        parts.push({ text: `\nCandidate ${i + 1} (Booking Code: ${cand.booking_code}):` });
        parts.push({
          inlineData: {
            mimeType: getMimeType(candAbsPath),
            data: fileToBase64(candAbsPath)
          }
        });
      }
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Gemini socks matcher API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const rawText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
    if (!rawText) return null;

    return JSON.parse(rawText.trim());
  } catch (err) {
    console.error('Leftover AI Matcher error:', err);
    return null;
  }
}

function alertUnpaidOrder(bookingCode, delText) {
  // 1. Send to Admin (for tracking)
  sendTelegramMessage(ADMIN_CHAT_ID, `⚠️ <b>ĐƠN GIAO CHƯA THANH TOÁN (COD):</b>\n\n${delText}`);
  
  // 2. Send to Shipper on duty (if different from Admin)
  if (global.activeShipperId && !ADMIN_CHAT_IDS.includes(global.activeShipperId)) {
    sendTelegramMessage(global.activeShipperId, `⚠️ <b>ĐƠN GIAO CHƯA THANH TOÁN (COD):</b>\n\n${delText}`);
  }
  
  // 3. Send to CHECK_THANH_TOAN group for administrative record
  sendTelegramMessage(GROUPS.CHECK_THANH_TOAN, `⚠️ <b>ĐƠN GIAO CHƯA THANH TOÁN (COD):</b>\n\n${delText}`);
}

function getVietnamHour(dateStr) {
  try {
    let parseStr = dateStr;
    if (dateStr && !dateStr.includes('Z') && !dateStr.includes('UTC')) {
      parseStr = dateStr.replace(' ', 'T') + 'Z';
    }
    const dateObj = new Date(parseStr);
    const hourStr = dateObj.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      timeZone: 'Asia/Ho_Chi_Minh' 
    });
    return parseInt(hourStr, 10);
  } catch (err) {
    console.error('Failed to get Vietnam hour for:', dateStr, err);
    return 0;
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

  // Track active shipper on duty dynamically
  const fromId = message.from ? String(message.from.id) : null;
  if (fromId && (chatId === GROUPS.DON_NHAN || chatId === GROUPS.DON_GIAO)) {
    global.activeShipperId = fromId;
  }

  console.log(`[Telegram Webhook] chatId: ${chatId}, replyTo: ${replyTo ? replyTo.message_id : 'none'}, hasPhoto: ${!!message.photo}, text: "${text}"`);

  // --- HANDLE ADMIN CORRECTION OF SUSPENDED ORDERS ---
  if (replyTo && (chatId === ADMIN_CHAT_ID || ADMIN_CHAT_IDS.includes(chatId))) {
    const adminReplyMsgId = String(replyTo.message_id);
    try {
      const suspended = await dbGet(
        "SELECT * FROM suspended_orders WHERE admin_msg_id = ?",
        [adminReplyMsgId]
      );
      
      if (suspended) {
        console.log(`[Admin Correction] Found suspended order for admin_msg_id: ${adminReplyMsgId}`);
        
        // Parse original and admin's correction text
        const originalAiRes = fallbackParseOrderText(suspended.original_text);
        const adminAiRes = fallbackParseOrderText(text);
        
        // Merge them
        const mergedAiRes = {
          is_order_request: true,
          name: (adminAiRes.name && adminAiRes.name !== 'Group Customer') ? adminAiRes.name : originalAiRes.name,
          phone: adminAiRes.phone ? adminAiRes.phone : originalAiRes.phone,
          hotel: (adminAiRes.hotel && adminAiRes.hotel !== '1997 Laundry Shop') ? adminAiRes.hotel : originalAiRes.hotel,
          room: adminAiRes.room ? adminAiRes.room : originalAiRes.room,
          product_id: adminAiRes.product_id || originalAiRes.product_id,
          pickup_time: adminAiRes.pickup_time ? adminAiRes.pickup_time : originalAiRes.pickup_time,
          pickup_option: adminAiRes.pickup_option || originalAiRes.pickup_option,
          notes: adminAiRes.notes ? adminAiRes.notes : originalAiRes.notes
        };

        if (isOrderInfoSuspicious(mergedAiRes)) {
          // Still suspicious! Notify admin again
          const alertMsg = `⚠️ <b>[BÉ BA CẢNH BÁO LỖI LÊN ĐƠN]</b>\n` +
                           `Thông tin chỉnh sửa vẫn chưa hợp lệ/thiếu địa chỉ:\n` +
                           `- Tên: <code>${mergedAiRes.name || 'Chưa rõ'}</code>\n` +
                           `- SĐT: <code>${mergedAiRes.phone || 'Chưa rõ'}</code>\n` +
                           `- Khách sạn: <code>${mergedAiRes.hotel || 'Chưa rõ'}</code>\n` +
                           `- Phòng: <code>${mergedAiRes.room || 'Chưa rõ'}</code>\n\n` +
                           `👉 <b>Admin vui lòng reply trực tiếp tin nhắn này kèm theo thông tin sửa đổi hoàn chỉnh!</b>`;
          
          const sentAdminMsg = await sendTelegramMessage(chatId, alertMsg, message.message_id);
          if (sentAdminMsg && sentAdminMsg.result) {
            await dbRun(
              "INSERT INTO suspended_orders (original_text, original_chat_id, admin_msg_id) VALUES (?, ?, ?)",
              [suspended.original_text, suspended.original_chat_id, String(sentAdminMsg.result.message_id)]
            );
          }
          return;
        }

        // Valid! Create the order
        let finalName = mergedAiRes.name || 'Group Chat Customer';
        const finalPhone = mergedAiRes.phone ? mergedAiRes.phone.trim() : null;
        const finalHotel = mergedAiRes.hotel || '1997 Laundry Central';
        let finalRoom = mergedAiRes.room || '';
        const finalProductId = mergedAiRes.product_id || 2;
        const finalNotes = mergedAiRes.notes || '';
        const finalPickupTime = mergedAiRes.pickup_time || 'Chưa rõ';
        const finalPickupOption = mergedAiRes.pickup_option || 'Lễ tân';

        // Check map link in both texts
        const mapLinkRegex = /(https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.app\.goo\.gl)\/\S+)/i;
        const matchOriginal = suspended.original_text.match(mapLinkRegex);
        const matchAdmin = text.match(mapLinkRegex);
        const mapLink = matchAdmin ? matchAdmin[1] : (matchOriginal ? matchOriginal[1] : '');

        // Generate booking code
        const bookingCode = 'LTT' + String(Math.floor(Date.now() / 1000)).slice(-4);
        
        let baseAmount = 250000;
        if (finalProductId === 1) baseAmount = 170000;
        else if (finalProductId === 3) baseAmount = 330000;

        let customerId = null;
        if (finalPhone) {
          const existingCust = await dbGet("SELECT id FROM customers WHERE phone = ?", [finalPhone]);
          if (existingCust) {
            customerId = existingCust.id;
            await dbRun("UPDATE customers SET name = ?, hotel = ?, room = ? WHERE id = ?", [finalName, finalHotel, finalRoom, customerId]);
          }
        }
        
        if (!customerId) {
          const result = await dbRun(
            "INSERT INTO customers (name, phone, hotel, room) VALUES (?, ?, ?, ?)",
            [finalName, finalPhone, finalHotel, finalRoom]
          );
          customerId = result.lastID;
        }

        if (mapLink && customerId) {
          await dbRun("UPDATE customers SET map_link = ? WHERE id = ?", [mapLink, customerId]);
        }

        const phoneDigits = (finalPhone || '').replace(/\D/g, '');
        const isViPhoneNum = phoneDigits.startsWith('84') || phoneDigits.startsWith('0');
        const langVal = isViPhoneNum ? 'vi' : 'en';

        // Insert order
        await dbRun(
          `INSERT INTO orders (booking_code, customer_id, product_id, amount, status, order_status, order_date, lang, notes, collect_scheduled_time) 
           VALUES (?, ?, ?, ?, 'Chờ thanh toán', 'Chờ lấy', ?, ?, ?, ?)`,
          [bookingCode, customerId, finalProductId, baseAmount, new Date().toISOString(), langVal, finalNotes, finalPickupTime]
        );

        syncOrderUpdateToN8n(bookingCode, baseAmount, 'Chờ lấy');

        // Fetch simplified name
        const productRow = await dbGet("SELECT name FROM products WHERE id = ?", [finalProductId]);
        const productName = productRow ? productRow.name : 'Giặt sấy';
        const simplifiedProduct = getSimplifiedProductName(finalProductId, productName, finalNotes);

        const cleanRoom = finalRoom ? ` - R${finalRoom.replace(/^r/i, '')}` : '';

        // Create new order confirmation message
        let confirmMsg = `🟧 <b>ĐƠN MỚI</b>\n` +
                         `[GIỜ LẤY: ${finalPickupTime.toUpperCase()}]\n` +
                         `<b><code>${bookingCode}</code></b>\n` +
                         `${finalPickupOption}\n` +
                         `${simplifiedProduct} - <i>"${finalNotes || 'Không có'}"</i>\n` +
                         `${finalName}${cleanRoom}\n` +
                         `<code>${finalPhone || 'Chưa rõ'}</code>\n` +
                         `<b>${finalHotel.toUpperCase()}</b>`;

        if (mapLink) {
          confirmMsg += `\nLink Maps: <a href="${mapLink}">Xem Bản Đồ</a>`;
        }

        // Send to original group
        const resMsg = await sendTelegramMessage(suspended.original_chat_id, confirmMsg);
        if (resMsg && resMsg.result && resMsg.result.message_id) {
          await dbRun(
            "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'pickup')",
            [bookingCode, resMsg.result.message_id, suspended.original_chat_id]
          );
        }

        // Delete mapping from suspended_orders
        await dbRun("DELETE FROM suspended_orders WHERE id = ?", [suspended.id]);

        // Reply to admin to confirm
        sendTelegramMessage(chatId, `✅ <b>THÀNH CÔNG:</b> Đã chỉnh sửa thông tin đơn hàng và tự động đẩy lên lại group <code>${suspended.original_chat_id}</code> với mã đơn: <code>${bookingCode}</code>!`, message.message_id);
        return;
      }
    } catch (e) {
      console.error('[Admin Correction] Error processing correction:', e);
    }
  }

  // --- CHECK UNCOLLECTED ORDERS COMMAND ---
  const lowerText = text.toLowerCase();
  const isCheckUncollected = (lowerText.includes('check') && (
                                lowerText.includes('chưa lấy') || lowerText.includes('chua lay') || 
                                lowerText.includes('cần lấy') || lowerText.includes('can lay') || 
                                lowerText.includes('cần thu') || lowerText.includes('can thu') ||
                                lowerText.includes('chưa nhận') || lowerText.includes('chua nhan') ||
                                lowerText.includes('cần nhận') || lowerText.includes('can nhan')
                              )) || 
                              lowerText.startsWith('/check_chua_lay') ||
                              lowerText.startsWith('/check_chualay') ||
                              lowerText.startsWith('/check_can_lay') ||
                              lowerText.startsWith('/check_chua_nhan');

  if (isCheckUncollected) {
    const isStaffChat = Object.values(GROUPS).includes(chatId) || ADMIN_CHAT_IDS.includes(chatId);
    if (!isStaffChat) {
      sendTelegramMessage(chatId, `❌ Bạn không có quyền thực hiện lệnh này.`, message.message_id);
      return;
    }

    try {
      const uncollectedOrders = await dbAll(
        `SELECT o.booking_code, o.order_date, o.notes, o.collect_scheduled_time, c.name, c.phone, c.hotel, c.room, c.map_link, p.name as product_name
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         JOIN products p ON o.product_id = p.id
         WHERE (o.order_status = 'Chưa lấy' OR o.order_status = 'Chờ lấy' OR o.order_status IS NULL)
         ORDER BY o.order_date ASC`
      );

      // Check for hour/minute filters
      let targetTimeMinutes = null;
      let filterType = null; // 'before' or 'after'
      
      const beforeMatch = lowerText.match(/(?:trước|truoc)\s*(\d{1,2})(?::|h|giờ|gio)?\s*(\d{2})?/i);
      const afterMatch = lowerText.match(/(?:sau)\s*(\d{1,2})(?::|h|giờ|gio)?\s*(\d{2})?/i);
      
      if (beforeMatch) {
        const hrs = parseInt(beforeMatch[1], 10);
        const mins = beforeMatch[2] ? parseInt(beforeMatch[2], 10) : 0;
        targetTimeMinutes = hrs * 60 + mins;
        filterType = 'before';
      } else if (afterMatch) {
        const hrs = parseInt(afterMatch[1], 10);
        const mins = afterMatch[2] ? parseInt(afterMatch[2], 10) : 0;
        targetTimeMinutes = hrs * 60 + mins;
        filterType = 'after';
      }

      let filteredOrders = uncollectedOrders;
      if (targetTimeMinutes !== null) {
        filteredOrders = uncollectedOrders.filter(o => {
          let orderMinutes = parseTimeMinutesFromString(o.collect_scheduled_time);
          if (orderMinutes === null) {
            orderMinutes = getVietnamTimeMinutes(o.order_date);
          }
          if (filterType === 'before') {
            return orderMinutes < targetTimeMinutes;
          } else {
            return orderMinutes >= targetTimeMinutes;
          }
        });
      }

      const formatMinutesToHm = (totalMins) => {
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        return `${hrs}:${String(mins).padStart(2, '0')}`;
      };

      const filterLabel = targetTimeMinutes !== null 
        ? ` (Khung giờ: ${filterType === 'before' ? `trước ${formatMinutesToHm(targetTimeMinutes)}` : `sau ${formatMinutesToHm(targetTimeMinutes)}`})` 
        : '';

      if (filteredOrders.length === 0) {
        sendTelegramMessage(chatId, `📌 <b>BÁO CÁO ĐƠN CHƯA LẤY${filterLabel}:</b>\n\n🎉 Hiện không có đơn hàng nào chưa lấy phù hợp.`, message.message_id);
      } else {
        await sendTelegramMessage(chatId, `🔴 <b>DANH SÁCH ĐƠN CHƯA LẤY${filterLabel}</b>\n---------------------------------------\nTổng cộng: <b>${filteredOrders.length} đơn</b>\n\n<i>Bé Ba đang gửi thẻ thông tin từng đơn bên dưới. Vui lòng reply trực tiếp vào thẻ đơn để cập nhật trạng thái "Đã lấy".</i>`, message.message_id);

        for (const o of filteredOrders) {
          // Format hours:minutes (Vietnam time UTC+7) from order_date
          let formattedTime = 'Chưa rõ';
          if (o.order_date) {
            try {
              const d = new Date(o.order_date);
              const localTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
              const hrs = String(localTime.getUTCHours()).padStart(2, '0');
              const mins = String(localTime.getUTCMinutes()).padStart(2, '0');
              formattedTime = `${hrs}:${mins}`;
            } catch (e) {
              formattedTime = o.order_date;
            }
          }

          const formattedNotes = o.notes ? o.notes : 'Không có';
          const cleanRoom = o.room ? ` - R${o.room.replace(/^r/i, '')}` : '';
          const hotelStr = (o.hotel || '').toUpperCase();
          const mapLink = o.map_link || '';

          const displayPickupTime = o.collect_scheduled_time || formattedTime;

          const simplifiedProduct = getSimplifiedProductName(o.product_id, o.product_name, o.notes);

          let cardText = `🔴 <b>[GIỜ LẤY: ${displayPickupTime.toUpperCase()}]</b>\n` +
                         `<b><code>${o.booking_code}</code></b>\n` +
                         `Lễ tân\n` +
                         `${simplifiedProduct} - <i>"${formattedNotes}"</i>\n` +
                         `${o.name}${cleanRoom}\n` +
                         `<code>${o.phone || 'Chưa rõ'}</code>\n` +
                         `<b>${hotelStr}</b>`;

          if (mapLink) {
            cardText += `\nLink Maps: <a href="${mapLink}">Xem Bản Đồ</a>`;
          }



          const res = await sendTelegramMessage(chatId, cardText);
          if (res && res.result && res.result.message_id) {
            await dbRun(
              "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'pickup')",
              [o.booking_code, res.result.message_id, chatId]
            );
          }
        }
      }
    } catch (e) {
      console.error('Check uncollected orders command failed:', e);
      sendTelegramMessage(chatId, `❌ Đã xảy ra lỗi khi kiểm tra danh sách đơn chưa lấy.`, message.message_id);
    }
    return;
  }

  // --- COMMAND: COUNT UNDELIVERED ORDERS ("còn bao nhiêu đơn chưa giao") ---
  const hasBookingCode = /\b(nf|dh)\d{4,}/i.test(lowerText);
  const hasPhone = /\b\d{8,12}/.test(lowerText);
  const isCountUndelivered = ((lowerText.includes('chưa giao') || lowerText.includes('chua giao')) && !hasBookingCode && !hasPhone) ||
                             lowerText.startsWith('/chua_giao') ||
                             lowerText.startsWith('/check_chua_giao');

  if (isCountUndelivered) {
    try {
      const undelivered = await dbAll(
        `SELECT o.booking_code, o.amount, o.status as payment_status, o.order_status, c.name, c.phone, c.hotel, c.room
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         WHERE o.order_status IN ('Chờ giao', 'Chờ giao (đã thanh toán)', 'Chờ giao chưa thanh toán')
         ORDER BY o.order_date ASC`
      );

      if (undelivered.length === 0) {
        sendTelegramMessage(chatId, `📦 <b>BÁO CÁO ĐƠN CHƯA GIAO:</b>\n\n🎉 Hiện tại không còn đơn hàng nào chưa giao! Tất cả đã hoàn tất.`, message.message_id);
      } else {
        await sendTelegramMessage(chatId, `📋 <b>DANH SÁCH ĐƠN CHƯA GIAO (Tổng cộng: ${undelivered.length} đơn)</b>\n\n<i>Bé Ba đang gửi thẻ thông tin từng đơn bên dưới. Shipper có thể reply trực tiếp vào thẻ đơn kèm chữ "done" hoặc "xong" để hoàn tất giao hàng!</i>`, message.message_id);

        for (const o of undelivered) {
          const isPaid = o.payment_status === 'Đã thanh toán' || o.payment_status === 'paid' || o.order_status === 'Chờ giao (đã thanh toán)';
          const paymentText = isPaid 
            ? `<b>TRẠNG THÁI: ĐÃ THANH TOÁN (PAID)</b>\n<i>(Đơn hàng đã được thanh toán, chỉ cần giao đồ)</i>`
            : `<b>TRẠNG THÁI: CHƯA THANH TOÁN (COD)</b>\n<b>Vui lòng nhắn tin trước cho khách để báo số tiền và sắp xếp lấy tiền trước khi đi giao!</b>`;

          const cardText = `🛵 <b>YÊU CẦU GIAO HÀNG / DELIVERY REQUEST</b>
---------------------------------------
Mã đơn: <code>${o.booking_code}</code>
Khách hàng: <b>${o.name}</b>
SĐT: <code>${o.phone}</code>
Khách sạn: ${o.hotel || 'N/A'}
Số phòng: ${o.room || 'N/A'}
Số tiền: <b>${(o.amount || 0).toLocaleString('vi-VN')} VND</b>
---------------------------------------
${paymentText}
---------------------------------------
<i>Shipper giao hàng chụp ảnh và reply tin nhắn này kèm chữ "done" hoặc "xong" để hoàn tất đơn hàng!</i>`;

          const res = await sendTelegramMessage(chatId, cardText);
          if (res && res.result && res.result.message_id) {
            await dbRun(
              "INSERT OR IGNORE INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'delivery')",
              [o.booking_code, res.result.message_id, chatId]
            );
          }
        }
      }
    } catch (err) {
      console.error('Count undelivered orders command failed:', err);
      sendTelegramMessage(chatId, `❌ Đã xảy ra lỗi khi kiểm tra các đơn chưa giao.`, message.message_id);
    }
    return;
  }

  // --- COMMAND: CHECK INDIVIDUAL ORDER STATUS ("đơn này giao chưa [info]", "check đơn [info]", etc.) ---
  const isCheckOrder = lowerText.includes('giao chưa') || 
                       lowerText.includes('giao chua') || 
                       lowerText.includes('check đơn') || 
                       lowerText.includes('check don') || 
                       lowerText.startsWith('/check_don') ||
                       (lowerText.includes('giao') && lowerText.includes('chưa') && replyTo);

  if (isCheckOrder) {
    // 1. Remove mentions (e.g. @behaiday_bot)
    let cleanText = text.replace(/@\w+/g, '').trim();
    
    // 2. Remove typical command keywords
    let queryTerm = cleanText.replace(/giao\s+chưa|giao\s+chua|check\s+đơn|check\s+don|check|\/check_don/i, '').trim();
    
    // 3. Strip prefix/suffix fillers in a loop
    let lastTerm = '';
    while (queryTerm !== lastTerm) {
      lastTerm = queryTerm;
      queryTerm = queryTerm.replace(/^(đơn|don|của|cua|cho|hộ|ho|tin|tin\s+nhắn|tin\s+nhan)\s+/gi, '').trim();
      queryTerm = queryTerm.replace(/\s+(đơn|don|của|cua|cho|hộ|ho)$/gi, '').trim();
    }
    
    if (!queryTerm && replyTo) {
      const replyMatch = (replyTo.text || replyTo.caption || '').match(/\b(LTT|ltt)\d{4}\b/i);
      if (replyMatch) {
        queryTerm = replyMatch[0];
      }
    }

    if (!queryTerm) {
      sendTelegramMessage(chatId, `⚠️ Vui lòng cung cấp mã đơn (LTTxxxx), số điện thoại, tên khách hàng hoặc số phòng để Bé Ba kiểm tra.`, message.message_id);
      return;
    }

    try {
      const searchPattern = `%${queryTerm}%`;
      const matches = await dbAll(
        `SELECT o.booking_code, o.amount, o.status as payment_status, o.order_status, o.order_date, c.name, c.phone, c.hotel, c.room, o.receipt_number
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         WHERE o.booking_code LIKE ?
            OR o.receipt_number LIKE ?
            OR c.name LIKE ?
            OR c.phone LIKE ?
            OR c.room LIKE ?
            OR c.hotel LIKE ?
         LIMIT 5`,
        [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
      );

      if (matches.length === 0) {
        sendTelegramMessage(chatId, `❌ Bé Ba không tìm thấy đơn hàng nào khớp với thông tin: "<b>${queryTerm}</b>".`, message.message_id);
      } else {
        let msg = `🔍 <b>KẾT QUẢ TÌM KIẾM ĐƠN HÀNG ("${queryTerm}"):</b>\n\n`;
        for (const o of matches) {
          const isPaid = o.payment_status === 'Đã thanh toán' || o.payment_status === 'paid';
          const paymentText = isPaid ? '✅ Đã thanh toán' : '❌ Chưa thanh toán';
          
          msg += `📌 Mã đơn: <code>${o.booking_code}</code>${o.receipt_number ? ` (Số HĐ: <code>${o.receipt_number}</code>)` : ''}\n`;
          msg += `👤 Khách hàng: <b>${o.name}</b>\n`;
          msg += `🚪 Phòng: <b>P.${o.room || 'N/A'}</b> (${o.hotel || 'N/A'})\n`;
          msg += `⏰ Ngày đặt: <code>${o.order_date}</code>\n`;
          msg += `💰 Số tiền: <b>${(o.amount || 0).toLocaleString('vi-VN')} VND</b>\n`;
          msg += `💳 Thanh toán: <b>${paymentText}</b>\n`;
          msg += `🚚 Trạng thái đơn: <b>${o.order_status || 'Chờ xử lý'}</b>\n\n`;
        }
        sendTelegramMessage(chatId, msg, message.message_id);
      }
    } catch (err) {
      console.error('Check order status command failed:', err);
      sendTelegramMessage(chatId, `❌ Đã xảy ra lỗi khi truy vấn thông tin đơn hàng.`, message.message_id);
    }
    return;
  }



  // --- COMMAND: COUNT UNPAID DELIVERIES ("bao nhiêu đơn cần giao chưa thanh toán") ---
  const isCountUnpaidDelivery = lowerText.includes('chưa thanh toán') || 
                                lowerText.includes('chua thanh toan') || 
                                lowerText.includes('chưa trả') || 
                                lowerText.includes('chua tra');

  if (isCountUnpaidDelivery && (lowerText.includes('giao') || lowerText.includes('cần') || lowerText.includes('can') || lowerText.includes('liệt kê') || lowerText.includes('liet ke'))) {
    try {
      const unpaidDeliveries = await dbAll(
        `SELECT o.booking_code, o.amount, c.name, c.phone, c.hotel, c.room
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         WHERE o.order_status = 'Chờ giao chưa thanh toán'
            OR (o.order_status = 'Chờ giao' AND (o.status IS NULL OR (o.status != 'Đã thanh toán' AND o.status != 'paid')))
         ORDER BY o.order_date ASC`
      );

      if (unpaidDeliveries.length === 0) {
        sendTelegramMessage(chatId, `💳 <b>ĐƠN GIAO CHƯA THANH TOÁN (COD):</b>\n\n🎉 Hiện tại tất cả các đơn cần giao đều đã được thanh toán trước!`, message.message_id);
      } else {
        let msg = `📋 <b>DANH SÁCH ĐƠN GIAO CHƯA THANH TOÁN (COD)</b>\n`;
        msg += `<i>Tổng cộng: <b>${unpaidDeliveries.length} đơn cần thu tiền</b></i>\n`;
        msg += `---------------------------------------\n\n`;
        for (let i = 0; i < unpaidDeliveries.length; i++) {
          const o = unpaidDeliveries[i];
          msg += `${i+1}. <code>${o.booking_code}</code> - 👤 <b>${o.name}</b> (SĐT: <code>${o.phone}</code>)\n`;
          msg += `   🚪 Phòng: <b>P.${o.room || 'N/A'}</b> (${o.hotel || 'N/A'})\n`;
          msg += `   💰 Số tiền thu: <b>${(o.amount || 0).toLocaleString('vi-VN')} VND</b>\n\n`;
        }
        sendTelegramMessage(chatId, msg, message.message_id);
      }
    } catch (err) {
      console.error('Count unpaid delivery orders command failed:', err);
      sendTelegramMessage(chatId, `❌ Đã xảy ra lỗi khi kiểm tra các đơn chưa thanh toán.`, message.message_id);
    }
    return;
  }

  const bookingCodeMatch = text.match(/\b(LTT|ltt)\d{4}\b/i);
  if (bookingCodeMatch && !replyTo) {
    const bookingCode = bookingCodeMatch[0].toUpperCase();
    const lowerText = text.toLowerCase();
    const isCompleteCommand = lowerText.includes('hoàn thành') || lowerText.includes('hoan thanh') || lowerText.includes('complete');

    if (isCompleteCommand) {
      const isStaffChat = Object.values(GROUPS).includes(chatId) || ADMIN_CHAT_IDS.includes(chatId);
      if (!isStaffChat) {
        sendTelegramMessage(chatId, `❌ Bạn không có quyền thực hiện lệnh cập nhật trạng thái đơn hàng.`, message.message_id);
        return;
      }

      try {
        const order = await dbGet(
          `SELECT o.booking_code, o.amount, c.name, c.phone, c.hotel, c.room
           FROM orders o
           JOIN customers c ON o.customer_id = c.id
           WHERE o.booking_code = ?`,
          [bookingCode]
        );

        if (order) {
          // Update database status
          await dbRun(
            "UPDATE orders SET order_status = 'Đã giao', status = 'Hoàn thành' WHERE booking_code = ?",
            [bookingCode]
          );

          sendTelegramMessage(chatId, `✅ Đơn hàng <b>#${bookingCode}</b> đã được cập nhật thành công thành <b>Hoàn thành</b> và đồng bộ về hệ thống!`, message.message_id);

          // Send daily revenue summary alert
          const revText = `💰 <b>BÁO CÁO DOANH THU / COMPLETED ORDER</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code>
👤 Khách hàng: <b>${order.name}</b>
💵 Doanh thu tạm tính: <b>${(order.amount || 0).toLocaleString('vi-VN')} VND</b>
✅ Đã giao hàng & thanh toán thành công!`;
          
          sendTelegramMessage(GROUPS.REPORT_DOANH_THU, revText);

          // AUTOMATICALLY SEND CONFIRMATION VIA WHATSAPP (100% AUTOMATED)
          const waMessage = `🎉 *1997 Premium Laundry - Laundry Delivered!* 🎉
---------------------------------------
Dear *${order.name}*,
We are pleased to inform you that your laundry (Booking Code: *#${bookingCode}*) has been delivered successfully to your hotel lobby/front desk! 🛎️

Thank you for choosing 1997 Premium Laundry! We hope to serve you again on your next trip! 🧺🧼`;

          // Trigger WhatsApp message via VPS Gateway
          if (isWaConnected && sock) {
            const cleanPhone = (order.phone || '').replace(/\D/g, '');
            if (cleanPhone) {
              const waJid = cleanPhone.startsWith('84') || cleanPhone.startsWith('65') || cleanPhone.startsWith('1') ? `${cleanPhone}@s.whatsapp.net` : `84${cleanPhone.replace(/^0/, '')}@s.whatsapp.net`;
              await sock.sendMessage(waJid, { text: waMessage });
              console.log(`WhatsApp confirmation auto-sent for complete order command: ${bookingCode}`);
            }
          }

          // Sync to n8n
          syncOrderUpdateToN8n(bookingCode, order.amount, 'Hoàn thành');

        } else {
          sendTelegramMessage(chatId, `❌ Không tìm thấy đơn hàng có mã <code>${bookingCode}</code> trong hệ thống.`, message.message_id);
        }
      } catch (e) {
        console.error('Order complete command failed:', e);
        sendTelegramMessage(chatId, `❌ Có lỗi xảy ra khi thực hiện lệnh cập nhật trạng thái đơn hàng.`, message.message_id);
      }
      return;
    }

    try {
      const order = await dbGet(
        `SELECT o.booking_code, o.product_id, o.order_status, o.amount, o.order_date, o.notes, o.collect_scheduled_time, 
                p.name as product_name, c.name as cust_name, c.phone, c.hotel, c.room, c.map_link
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         JOIN products p ON o.product_id = p.id
         WHERE o.booking_code = ?`,
        [bookingCode]
      );

      if (order) {
        let formattedTime = 'Chưa rõ';
        if (order.order_date) {
          try {
            const d = new Date(order.order_date);
            const localTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
            const hrs = String(localTime.getUTCHours()).padStart(2, '0');
            const mins = String(localTime.getUTCMinutes()).padStart(2, '0');
            formattedTime = `${hrs}:${mins}`;
          } catch (e) {
            formattedTime = order.order_date;
          }
        }

        const displayPickupTime = order.collect_scheduled_time || formattedTime;
        const readableStatus = STATUS_LABELS[order.order_status] || order.order_status;
        const formattedNotes = order.notes ? order.notes : 'Không có';
        const cleanRoom = order.room ? ` - R${order.room.replace(/^r/i, '')}` : '';
        const hotelStr = (order.hotel || '').toUpperCase();
        const mapLink = order.map_link || '';

        const simplifiedProduct = getSimplifiedProductName(order.product_id, order.product_name, order.notes);

        let responseText = `🔍 <b>TRUY VẤN ĐƠN HÀNG / ORDER STATUS</b>\n` +
                           `[GIỜ LẤY: ${displayPickupTime.toUpperCase()}]\n` +
                           `<b><code>${order.booking_code}</code></b>\n` +
                           `Lễ tân\n` +
                           `${simplifiedProduct} - <i>"${formattedNotes}"</i>\n` +
                           `${order.cust_name}${cleanRoom}\n` +
                           `<code>${order.phone || 'Chưa rõ'}</code>\n` +
                           `<b>${hotelStr}</b>\n` +
                           `Tình trạng: <b>${readableStatus}</b>`;

        if (mapLink) {
          responseText += `\nLink Maps: <a href="${mapLink}">Xem Bản Đồ</a>`;
        }
        
        const resMsg = await sendTelegramMessage(chatId, responseText, message.message_id);
        if (resMsg && resMsg.result && resMsg.result.message_id) {
          let messageType = 'pickup';
          if (order.order_status && order.order_status.toLowerCase().includes('giao')) {
            messageType = 'delivery';
          }
          await dbRun(
            "INSERT OR IGNORE INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, ?)",
            [bookingCode, resMsg.result.message_id, chatId, messageType]
          );
        }
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
    console.log(`[Telegram Webhook] Replying to msg ID: ${replyMsgId}`);
    try {
      // Find the mapped booking_code
      const mapping = await dbGet(
        "SELECT booking_code, message_type FROM order_telegram_mappings WHERE telegram_message_id = ?",
        [replyMsgId]
      );

      if (mapping) {
        const bookingCode = mapping.booking_code;
        console.log(`[Telegram Webhook] Found mapping: bookingCode: ${bookingCode}, type: ${mapping.message_type}, currentChatId: ${chatId}`);
        const currentOrder = await dbGet(
          "SELECT o.*, c.name, c.phone, c.hotel, c.room FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.booking_code = ?",
          [bookingCode]
        );

        if (currentOrder) {
          // --- STAGE 2: Shipper Pickup Photo Reply in DON_NHAN ---
          if (chatId === GROUPS.DON_NHAN && mapping.message_type === 'pickup') {
            const lowerRepText = text.toLowerCase();
            const isCollectConfirm = message.photo || lowerRepText.includes('done') || lowerRepText.includes('xong') || lowerRepText.includes('đã lấy') || lowerRepText.includes('da lay');
            if (!isCollectConfirm) {
              console.log(`[Stage 2] Reply in DON_NHAN ignored: "${text}" is not a confirmation.`);
              return;
            }

            let localPath = null;
            let photoFileId = null;
            if (message.photo) {
              const largestPhoto = message.photo[message.photo.length - 1];
              photoFileId = largestPhoto.file_id;
              localPath = await downloadTelegramFile(photoFileId);
            }
            
            await dbRun(
              "UPDATE orders SET order_status = 'Đã lấy', status = 'Đã lấy', pickup_photo_url = ? WHERE booking_code = ?",
              [localPath, bookingCode]
            );
            syncOrderUpdateToN8n(bookingCode, currentOrder.amount, 'Đã lấy', true);

            // sendTelegramMessage(chatId, `✅ Đã nhận đồ đơn hàng <b>#${bookingCode}</b>! Cập nhật trạng thái thành: <b>Đã lấy đồ</b>.`, message.message_id);
            
            const billText = `📌 Mã đơn: <b><code>${bookingCode}</code></b> - <b>${currentOrder.name}</b> - Đồ đã về tiệm\n` +
                             `Chụp ảnh cân nặng và hóa đơn thể hiện số tiền reply tin nhắn này.`;
            
            let res2;
            if (photoFileId) {
              res2 = await sendTelegramPhoto(GROUPS.BILL_PICKUP, photoFileId, billText);
            } else {
              res2 = await sendTelegramMessage(GROUPS.BILL_PICKUP, billText);
            }

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
            
            console.log(`[Stage 3] Processing photo for booking ${bookingCode}. Local path: ${localPath}`);

            // Call AI Vision to classify and extract info from the image
            const systemPrompt = `You are an AI assistant for a laundry shop. Analyze the uploaded image.
Determine if the image is:
1. "scale": A photo of a weighing scale showing numbers (like 4.390, 4.39, 4390, etc.), which represents the weight of the laundry basket.
2. "receipt": A photo of a printed or digital receipt/invoice (bill) showing text like "RECEIPT", "Total Amount", "Grand Total", prices, etc.
   - For receipt, also check if there is a "PAID" stamp or "Đã thanh toán" stamp on the receipt. Set "payment_status" to "paid" if paid, otherwise "unpaid".
3. "other": Any other image.

Extract the relevant information:
- If it is a "scale", extract the weight value as a number in kg (e.g., 4.39). Note: if the scale shows 4390 or 4390g, convert it to 4.39.
- If it is a "receipt", extract the grand total amount as an integer number (e.g., 260000). Look for labels like "Grand Total", "Total Amount", "Total", "Tổng tiền", "Thanh toán", or the last large sum at the bottom.

Respond ONLY with a JSON object in this format:
{
  "type": "scale" | "receipt" | "other",
  "weight": number or null,
  "amount": number or null,
  "payment_status": "paid" | "unpaid",
  "confidence": number,
  "reason": "explanation"
}`;

            const userPrompt = "Classify this laundry-related image and extract weight or bill amount.";
            
            const aiRes = await analyzeImageWithAI(localPath, systemPrompt, userPrompt);
            console.log(`[Stage 3] AI Vision result for ${bookingCode}:`, aiRes);

            let isBillMatched = false;
            let extractedAmount = 0;
            let isPaid = false;

            if (aiRes) {
              if (aiRes.type === 'scale' && aiRes.weight) {
                // Update weight in DB
                await dbRun("UPDATE orders SET weight = ? WHERE booking_code = ?", [aiRes.weight, bookingCode]);
                sendTelegramMessage(chatId, `⚖️ Bé Ba đã ghi nhận cân nặng từ ảnh cân: <b>${aiRes.weight} kg</b> cho đơn <b>#${bookingCode}</b>.`, message.message_id);
              } else if (aiRes.type === 'receipt' && aiRes.amount) {
                isBillMatched = true;
                extractedAmount = aiRes.amount;
                isPaid = aiRes.payment_status === 'paid';
                const paymentStatusDb = isPaid ? 'Đã thanh toán' : 'Chờ thanh toán';

                // Update amount, bill photo, status, and transition status to 'Chờ giặt'
                await dbRun(
                  "UPDATE orders SET amount = ?, bill_photo_url = ?, status = ?, order_status = 'Chờ giặt' WHERE booking_code = ?",
                  [aiRes.amount, localPath, paymentStatusDb, bookingCode]
                );
                syncOrderUpdateToN8n(bookingCode, aiRes.amount, 'Chờ giặt');

                sendTelegramMessage(chatId, `💵 Bé Ba đã quét hóa đơn đơn <b>#${bookingCode}</b>: <b>${aiRes.amount.toLocaleString('vi-VN')} VND</b>. Trạng thái chuyển thành: <b>Chờ giặt</b> (${paymentStatusDb}).`, message.message_id);
              }
            }

            // Fallback text parsing for weight (in case they typed it in caption/text comment)
            let weight = 0;
            const weightMatch = text.match(/(\d+(\.\d+)?)\s*(kg|kg\b|kilo)/i);
            if (weightMatch) {
              weight = parseFloat(weightMatch[1]);
              await dbRun("UPDATE orders SET weight = ? WHERE booking_code = ?", [weight, bookingCode]);
            }

            // Reload the updated order details
            const updatedOrder = await dbGet(
              "SELECT o.*, c.name, c.phone, c.hotel, c.room, c.lang FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.booking_code = ?",
              [bookingCode]
            );

            // If a bill was successfully matched, perform notifications and forward to XEP_DO immediately
            if (isBillMatched && updatedOrder) {
              const phoneClean = (updatedOrder.phone || '').replace(/\D/g, '');
              if (phoneClean) {
                const isViPhone = phoneClean.startsWith('84') || phoneClean.startsWith('0');
                const useVi = updatedOrder.lang === 'vi' || (!updatedOrder.lang && isViPhone);
                const waJid = phoneClean.startsWith('84') || phoneClean.startsWith('65') || phoneClean.startsWith('1') ? `${phoneClean}@s.whatsapp.net` : `84${phoneClean.replace(/^0/, '')}@s.whatsapp.net`;

                let waMessage = '';
                if (useVi) {
                  waMessage = `1997 Premium Laundry xin gửi thông tin chi tiết đơn hàng *#${bookingCode}* của quý khách:\n⚖️ Cân nặng: *${updatedOrder.weight || 0} kg*\n💰 Tổng tiền: *${(extractedAmount || 0).toLocaleString('vi-VN')} VND*\nTrạng thái thanh toán: *${isPaid ? 'Đã thanh toán (Paid)' : 'Chờ thanh toán (Unpaid)'}*`;
                  if (isPaid) {
                    waMessage += `\nCảm ơn quý khách đã tin tưởng sử dụng dịch vụ! 🧺`;
                  } else {
                    waMessage += `\nQuý khách vui lòng liên hệ nhân viên để thanh toán đơn hàng. Xin cảm ơn!`;
                  }
                } else {
                  waMessage = `1997 Premium Laundry - Invoice details for your order *#${bookingCode}*:\n⚖️ Weight: *${updatedOrder.weight || 0} kg*\n💰 Total Amount: *${(extractedAmount || 0).toLocaleString('vi-VN')} VND*\nPayment Status: *${isPaid ? 'Paid' : 'Unpaid'}*`;
                  if (isPaid) {
                    waMessage += `\nThank you for choosing 1997 Premium Laundry! 🧺`;
                  } else {
                    waMessage += `\nPlease contact our staff for payment options. Thank you!`;
                  }
                }

                if (isWaConnected && sock) {
                  try {
                    const absFilePath = path.join(__dirname, localPath.replace(/^\//, ''));
                    if (isPaid && fs.existsSync(absFilePath)) {
                      // If paid, send image with caption
                      await sock.sendMessage(waJid, { 
                        image: fs.readFileSync(absFilePath), 
                        caption: waMessage 
                      });
                      sendTelegramMessage(chatId, `📱 Đã tự động gửi ảnh hóa đơn & chi tiết thanh toán cho khách hàng qua WhatsApp!`);
                    } else {
                      // If unpaid, send text only
                      await sock.sendMessage(waJid, { text: waMessage });
                      sendTelegramMessage(chatId, `📱 Đã tự động gửi tin nhắn báo giá cho khách hàng qua WhatsApp!`);
                    }
                  } catch (waErr) {
                    console.error('WhatsApp send bill error:', waErr);
                  }
                }
              }

              // If UNPAID, tag @admin in the Telegram group so they follow up
              if (!isPaid) {
                sendTelegramMessage(chatId, `⚠️ <b>ĐƠN HÀNG CHƯA THANH TOÁN (COD):</b> Đơn <b>#${bookingCode}</b> của khách <b>${updatedOrder.name}</b> chưa thanh toán. @admin vui lòng liên hệ khách để hỏi về hình thức thanh toán của khách!`);
              }

              // Forward to XEP_DO group
              const foldText = `🧼 <b>ĐANG GIẶT / WASHING & FOLDING</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code>
👤 Khách hàng: <b>${updatedOrder.name}</b>
📞 SĐT: <code>${updatedOrder.phone}</code>
🏢 Khách sạn: ${updatedOrder.hotel}
🚪 Số phòng: ${updatedOrder.room}
⚖️ Cân nặng: <b>${updatedOrder.weight || 0} kg</b>
💵 Hóa đơn: <b>${(updatedOrder.amount || 0).toLocaleString('vi-VN')} VND</b>
🚨 <i>Sau khi giặt xong và xếp quần áo ngăn nắp, chụp hình gói đồ hoàn chỉnh reply tin nhắn này kèm chữ "xong" hoặc "done"!</i>`;
              
              const res3 = await sendTelegramPhoto(GROUPS.XEP_DO, largestPhoto.file_id, foldText);
              if (res3 && res3.result && res3.result.message_id) {
                await dbRun(
                  "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'fold')",
                  [bookingCode, res3.result.message_id, GROUPS.XEP_DO]
                );
              }
            } else {
              // Tell the group what is still missing
              const missingParts = [];
              if (!updatedOrder || !(updatedOrder.weight > 0)) missingParts.push("Cân nặng (Scale photo / text)");
              if (!updatedOrder || !updatedOrder.bill_photo_url) missingParts.push("Ảnh hóa đơn (Receipt photo)");
              
              sendTelegramMessage(chatId, `⏳ Đã ghi nhận thông tin đơn <b>#${bookingCode}</b>. Còn thiếu: <b>${missingParts.join(', ')}</b> để gửi bill cho khách và chuyển trạng thái sang Đang giặt sấy.`);
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

            const currentPayStatus = currentOrder.status;
            const isOrderPaid = currentPayStatus === 'Đã thanh toán' || currentPayStatus === 'paid' || currentPayStatus === 'Chờ giao (đã thanh toán)';
            const newDeliveryStatus = isOrderPaid ? 'Chờ giao (đã thanh toán)' : 'Chờ giao chưa thanh toán';

            await dbRun(
              "UPDATE orders SET order_status = ?, status = ? WHERE booking_code = ?",
              [newDeliveryStatus, newDeliveryStatus, bookingCode]
            );
            syncOrderUpdateToN8n(bookingCode, currentOrder.amount, newDeliveryStatus);

            sendTelegramMessage(chatId, `📦 Đơn hàng <b>#${bookingCode}</b> đã xếp xong! Trạng thái: <b>${newDeliveryStatus}</b>.`, message.message_id);

            // Trigger Delivery alert in DON_GIAO group
            const paymentStatusText = isOrderPaid 
              ? `✅ <b>TRẠNG THÁI: ĐÃ THANH TOÁN (PAID)</b>\n<i>(Đơn hàng đã được thanh toán, chỉ cần giao đồ)</i>`
              : `⚠️ <b>TRẠNG THÁI: CHƯA THANH TOÁN (COD)</b>\n🚨 <b>Vui lòng nhắn tin trước cho khách để báo số tiền và sắp xếp lấy tiền trước khi đi giao!</b>`;

            const delText = `🛵 <b>YÊU CẦU GIAO HÀNG / DELIVERY REQUEST</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code>
👤 Khách hàng: <b>${currentOrder.name}</b>
📞 SĐT: <code>${currentOrder.phone}</code>
🏢 Khách sạn: ${currentOrder.hotel}
🚪 Số phòng: ${currentOrder.room}
💰 Số tiền: <b>${(currentOrder.amount || 0).toLocaleString('vi-VN')} VND</b>
---------------------------------------
${paymentStatusText}
---------------------------------------
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

            // Forward directly to shipper & admin if unpaid
            if (!isOrderPaid) {
              alertUnpaidOrder(bookingCode, delText);
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
              "UPDATE orders SET order_status = 'Đã giao', status = 'Hoàn thành', delivery_photo_url = ? WHERE booking_code = ?",
              [localPath, bookingCode]
            );
            syncOrderUpdateToN8n(bookingCode, currentOrder.amount, 'Hoàn thành');

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
            const phoneClean = (currentOrder.phone || '').replace(/\D/g, '');
            const isViPhone = phoneClean.startsWith('84') || phoneClean.startsWith('0');
            const useVi = currentOrder.lang === 'vi' || (!currentOrder.lang && isViPhone);

            const waMessage = useVi
              ? `Xin chào *${currentOrder.name}*,\nĐơn hàng giặt ủi *#${bookingCode}* của quý khách đã được shipper giao đến thành công! 🛵\n1997 Premium Laundry xin gửi hình ảnh xác nhận giao nhận ở trên. Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ! 🧺`
              : `🎉 *1997 Premium Laundry - Laundry Delivered!* 🎉\n---------------------------------------\nDear *${currentOrder.name}*,\nWe are pleased to inform you that your laundry order *#${bookingCode}* has been successfully delivered by our shipper! 🛵\nPlease check the attached photo for delivery confirmation. Thank you for choosing 1997 Premium Laundry! 🧺`;

            // Trigger WhatsApp message via VPS Gateway
            sendWhatsAppConfirmation(currentOrder.phone, waMessage, localPath);
          }
          // --- STAGE 6: Admin/Staff payment confirmation reply in CHECK_THANH_TOAN ---
          else if (chatId === GROUPS.CHECK_THANH_TOAN && mapping.message_type === 'payment_check' && (text.toLowerCase().includes('done') || text.toLowerCase().includes('xác nhận') || text.toLowerCase().includes('xac nhan') || text.toLowerCase().includes('hoàn thành') || text.toLowerCase().includes('hoan thanh'))) {
            let orderStatus = currentOrder.order_status;
            let paymentStatus = 'Đã thanh toán';

            if (orderStatus === 'Chờ giao chưa thanh toán') {
              orderStatus = 'Chờ giao (đã thanh toán)';
            }

            await dbRun(
              "UPDATE orders SET status = ?, order_status = ? WHERE booking_code = ?",
              [paymentStatus, orderStatus, bookingCode]
            );
            syncOrderUpdateToN8n(bookingCode, currentOrder.amount, orderStatus);

            sendTelegramMessage(chatId, `✅ <b>XÁC NHẬN THÀNH CÔNG:</b> Đã cập nhật trạng thái Đã thanh toán cho đơn hàng <b>#${bookingCode}</b> trên Admin site!`, message.message_id);

            // If it transitioned to 'Chờ giao (đã thanh toán)', update the active delivery card in DON_GIAO group!
            if (orderStatus === 'Chờ giao (đã thanh toán)') {
              try {
                sendTelegramMessage(
                  GROUPS.DON_GIAO, 
                  `🔔 <b>XÁC NHẬN THANH TOÁN:</b> Đơn hàng <b>#${bookingCode}</b> của khách <b>${currentOrder.name}</b> đã được thanh toán thành công! Shipper chỉ cần giao đồ, không cần thu tiền COD.`
                );
                updateDeliveryCardToPaid(bookingCode);
              } catch (tErr) {
                console.error('Failed to notify DON_GIAO group or edit card on manual payment verification:', tErr);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Telegram reply handler error:', e);
    }
    return;
  } else {
    // --- 3. DIRECT IMAGE UPLOADS WITHOUT REPLY IN BILL_PICKUP ---
    if (chatId === GROUPS.BILL_PICKUP && message.photo) {
      const largestPhoto = message.photo[message.photo.length - 1];
      try {
        const localPath = await downloadTelegramFile(largestPhoto.file_id);
        console.log(`[Direct Upload] Received direct photo in BILL_PICKUP. Local path: ${localPath}`);

        // Fetch active orders for AI matching
        const activeOrders = await dbAll(
          `SELECT o.booking_code, o.amount, o.weight, o.order_status, c.name, c.phone, c.room, c.hotel
           FROM orders o
           JOIN customers c ON o.customer_id = c.id
           WHERE o.order_status NOT IN ('Hoàn thành', 'Đã giao')`
        );

        const systemPrompt = `You are an AI assistant for a laundry shop. Analyze the uploaded image.
We have a list of active orders in our system:
${JSON.stringify(activeOrders)}

Analyze the image and determine if it is:
1. "scale": A photo of a weighing scale showing laundry weight (e.g., 4.390, 4.39, 4390, etc.).
2. "receipt": A photo of a laundry receipt/invoice (bill).
   - For receipt, also check if there is a "PAID" stamp or "Đã thanh toán" stamp on the receipt. Set "payment_status" to "paid" if paid, otherwise "unpaid".
3. "other": Any other image.

Extract and match:
- If it is "scale":
  - Extract the weight value as a number in kg (e.g. 4.39). Convert 4390 or 4390g to 4.39.
  - Since it doesn't have customer details, "matched_booking_code" will be null.
- If it is "receipt":
  - Extract "amount" (grand total payment as integer, e.g. 260000).
  - Extract customer name, phone, hotel, and room.
  - Match these details with our active orders list. Set "matched_booking_code" to the matching booking_code (e.g. "LTT4572"), or null if no match.

Respond ONLY with a JSON object in this format:
{
  "type": "scale" | "receipt" | "other",
  "weight": number or null,
  "amount": number or null,
  "matched_booking_code": "LTTxxxx" or null,
  "payment_status": "paid" | "unpaid",
  "extracted_details": {
    "name": string or null,
    "phone": string or null,
    "room": string or null,
    "hotel": string or null
  },
  "confidence": number,
  "reason": "explanation"
}`;

        const userPrompt = "Classify this image, extract details, and match to active orders list.";
        const aiRes = await analyzeImageWithAI(localPath, systemPrompt, userPrompt);
        console.log(`[Direct Upload] AI Vision result:`, aiRes);

        if (aiRes) {
          if (aiRes.type === 'scale' && aiRes.weight) {
            // Save weight to global buffer
            global.lastScaleWeight = aiRes.weight;
            global.lastScaleTime = Date.now();
            sendTelegramMessage(chatId, `⚖️ Bé Ba ghi nhận cân nặng: <b>${aiRes.weight} kg</b>. (Đang chờ ảnh hóa đơn để khớp đơn hàng).`, message.message_id);
          } 
          else if (aiRes.type === 'receipt' && aiRes.amount) {
            let bookingCode = aiRes.matched_booking_code;
            
            // Programmatic backup match using all extracted fields (name, phone, room, hotel)
            if (!bookingCode && aiRes.extracted_details) {
              const details = aiRes.extracted_details;
              const cleanPhone = details.phone ? details.phone.replace(/\D/g, '') : '';
              if (cleanPhone) {
                // 1. Try to search by phone number
                const match = await dbGet(
                  `SELECT o.booking_code FROM orders o
                   JOIN customers c ON o.customer_id = c.id
                   WHERE (c.phone = ? OR c.phone LIKE ?) AND o.order_status NOT IN ('Hoàn thành', 'Đã giao')
                   ORDER BY o.order_date DESC LIMIT 1`,
                  [cleanPhone, `%${cleanPhone.slice(-8)}%`]
                );
                if (match) {
                  bookingCode = match.booking_code;
                  console.log(`[Programmatic Match] Found order ${bookingCode} by phone: ${cleanPhone}`);
                }
              }
              if (!bookingCode && details.name) {
                // 2. Try to search by customer name
                const match = await dbGet(
                  `SELECT o.booking_code FROM orders o
                   JOIN customers c ON o.customer_id = c.id
                   WHERE c.name LIKE ? AND o.order_status NOT IN ('Hoàn thành', 'Đã giao')
                   ORDER BY o.order_date DESC LIMIT 1`,
                  [`%${details.name}%`]
                );
                if (match) {
                  bookingCode = match.booking_code;
                  console.log(`[Programmatic Match] Found order ${bookingCode} by name: ${details.name}`);
                }
              }
            }

            if (bookingCode) {
              const isPaid = aiRes.payment_status === 'paid';
              const paymentStatusDb = isPaid ? 'Đã thanh toán' : 'Chờ thanh toán';

              // Update receipt amount and bill photo in DB, transition to 'Chờ giặt'
              await dbRun(
                "UPDATE orders SET amount = ?, bill_photo_url = ?, status = ?, order_status = 'Chờ giặt' WHERE booking_code = ?",
                [aiRes.amount, localPath, paymentStatusDb, bookingCode]
              );
              syncOrderUpdateToN8n(bookingCode, aiRes.amount, 'Chờ giặt');

              sendTelegramMessage(chatId, `💵 Bé Ba đã quét hóa đơn khớp đơn <b>#${bookingCode}</b>: <b>${aiRes.amount.toLocaleString('vi-VN')} VND</b>. Trạng thái chuyển thành: <b>Chờ giặt</b> (${paymentStatusDb}).`, message.message_id);

              // Check if we have a buffered weight within the last 10 minutes
              let weight = 0;
              if (global.lastScaleWeight && (Date.now() - global.lastScaleTime < 10 * 60 * 1000)) {
                weight = global.lastScaleWeight;
                await dbRun("UPDATE orders SET weight = ? WHERE booking_code = ?", [weight, bookingCode]);
                sendTelegramMessage(chatId, `⚖️ Tự động khớp cân nặng vừa cân: <b>${weight} kg</b> vào đơn <b>#${bookingCode}</b>!`);
                // Clear buffer
                global.lastScaleWeight = null;
                global.lastScaleTime = 0;
              }

              // Reload order details
              const updatedOrder = await dbGet(
                "SELECT o.*, c.name, c.phone, c.hotel, c.room, c.lang FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.booking_code = ?",
                [bookingCode]
              );

              if (updatedOrder) {
                // Send bill / price notification to customer via WhatsApp
                const phoneClean = (updatedOrder.phone || '').replace(/\D/g, '');
                if (phoneClean) {
                  const isViPhone = phoneClean.startsWith('84') || phoneClean.startsWith('0');
                  const useVi = updatedOrder.lang === 'vi' || (!updatedOrder.lang && isViPhone);
                  const waJid = phoneClean.startsWith('84') || phoneClean.startsWith('65') || phoneClean.startsWith('1') ? `${phoneClean}@s.whatsapp.net` : `84${phoneClean.replace(/^0/, '')}@s.whatsapp.net`;

                  let waMessage = '';
                  if (useVi) {
                    waMessage = `1997 Premium Laundry xin gửi thông tin chi tiết đơn hàng *#${bookingCode}* của quý khách:\n⚖️ Cân nặng: *${updatedOrder.weight || 0} kg*\n💰 Tổng tiền: *${(aiRes.amount || 0).toLocaleString('vi-VN')} VND*\nTrạng thái thanh toán: *${isPaid ? 'Đã thanh toán (Paid)' : 'Chờ thanh toán (Unpaid)'}*`;
                    if (isPaid) {
                      waMessage += `\nCảm ơn quý khách đã tin tưởng sử dụng dịch vụ! 🧺`;
                    } else {
                      waMessage += `\nQuý khách vui lòng liên hệ nhân viên để thanh toán đơn hàng. Xin cảm ơn!`;
                    }
                  } else {
                    waMessage = `1997 Premium Laundry - Invoice details for your order *#${bookingCode}*:\n⚖️ Weight: *${updatedOrder.weight || 0} kg*\n💰 Total Amount: *${(aiRes.amount || 0).toLocaleString('vi-VN')} VND*\nPayment Status: *${isPaid ? 'Paid' : 'Unpaid'}*`;
                    if (isPaid) {
                      waMessage += `\nThank you for choosing 1997 Premium Laundry! 🧺`;
                    } else {
                      waMessage += `\nPlease contact our staff for payment options. Thank you!`;
                    }
                  }

                  if (isWaConnected && sock) {
                    try {
                      const absFilePath = path.join(__dirname, localPath.replace(/^\//, ''));
                      if (isPaid && fs.existsSync(absFilePath)) {
                        // If paid, send image with caption
                        await sock.sendMessage(waJid, { 
                          image: fs.readFileSync(absFilePath), 
                          caption: waMessage 
                        });
                        sendTelegramMessage(chatId, `📱 Đã tự động gửi ảnh hóa đơn & chi tiết thanh toán cho khách hàng qua WhatsApp!`);
                      } else {
                        // If unpaid, send text only
                        await sock.sendMessage(waJid, { text: waMessage });
                        sendTelegramMessage(chatId, `📱 Đã tự động gửi tin nhắn báo giá cho khách hàng qua WhatsApp!`);
                      }
                    } catch (waErr) {
                      console.error('WhatsApp direct send bill error:', waErr);
                    }
                  }
                }

                // Forward to XEP_DO group
                const foldText = `🧼 <b>ĐANG GIẶT / WASHING & FOLDING</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code>
👤 Khách hàng: <b>${updatedOrder.name}</b>
📞 SĐT: <code>${updatedOrder.phone}</code>
🏢 Khách sạn: ${updatedOrder.hotel}
🚪 Số phòng: ${updatedOrder.room}
⚖️ Cân nặng: <b>${updatedOrder.weight || 0} kg</b>
💵 Hóa đơn: <b>${(updatedOrder.amount || 0).toLocaleString('vi-VN')} VND</b>
🚨 <i>Sau khi giặt xong và xếp quần áo ngăn nắp, chụp hình gói đồ hoàn chỉnh reply tin nhắn này kèm chữ "xong" hoặc "done"!</i>`;
                
                const res3 = await sendTelegramPhoto(GROUPS.XEP_DO, largestPhoto.file_id, foldText);
                if (res3 && res3.result && res3.result.message_id) {
                  await dbRun(
                    "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'fold')",
                    [bookingCode, res3.result.message_id, GROUPS.XEP_DO]
                  );
                }
              }
            } else {
              sendTelegramMessage(chatId, `⚠️ Phát hiện hóa đơn nhưng không khớp được với đơn hàng nào đang hoạt động trong hệ thống. Vui lòng kiểm tra lại.`, message.message_id);
            }
          } else {
            sendTelegramMessage(chatId, `⚠️ Ảnh gửi lên không phải là ảnh cân nặng hoặc hóa đơn hợp lệ.`, message.message_id);
          }
        }
      } catch (err) {
        console.error('Direct photo upload handling failed:', err);
      }
    }
    // --- 4. DIRECT IMAGE UPLOADS WITHOUT REPLY IN XEP_DO (LEFTOVER SOCKS SCANNER) ---
    else if (chatId === GROUPS.XEP_DO && message.photo) {
      const largestPhoto = message.photo[message.photo.length - 1];
      try {
        const localPath = await downloadTelegramFile(largestPhoto.file_id);
        console.log(`[Leftover Scanner] Received direct photo in XEP_DO. Local path: ${localPath}`);

        // Fetch candidates (unresolved missing items) from DB from the last 2 days
        const candidates = await dbAll(
          `SELECT booking_code, photo_path FROM missing_items 
           WHERE is_resolved = 0 AND datetime(date_added) >= datetime('now', '-2 days')`
        );

        if (candidates.length === 0) {
          sendTelegramMessage(chatId, `❌ Bé Ba không tìm thấy chiếc tất thất lạc nào trong database của 2 ngày gần đây để đối chiếu.`, message.message_id);
          return;
        }

        sendTelegramMessage(chatId, `🤖 Bé Ba đang quét so khớp thị giác AI để tìm chiếc tất thất lạc trong 2 ngày qua... ⏳`, message.message_id);

        const result = await runLeftoverSocksMatcher(localPath, candidates);
        console.log(`[Leftover Scanner] AI Matcher result:`, result);

        if (result && result.match) {
          const matchMsg = `🎉 <b>BÉ BA ĐÃ TÌM THẤY KHỚP!</b>
---------------------------------------
✅ Chiếc tất này trùng khớp với tất thất lạc của <b>Đơn hàng #${result.matched_booking_code}</b>!
📦 Bị sót ở Đơn hàng: <b>#${result.source_booking_code || 'Chưa rõ'}</b>
📊 Độ tin cậy: ${(result.confidence_score * 100).toFixed(0)}%
💡 Chi tiết: ${result.reason}`;

          sendTelegramMessage(chatId, matchMsg, message.message_id);

          // Mark as resolved in DB
          await dbRun(
            "UPDATE missing_items SET is_resolved = 1 WHERE booking_code = ?",
            [result.matched_booking_code]
          );
        } else {
          sendTelegramMessage(chatId, `❌ Bé Ba không tìm thấy chiếc tất nào trùng khớp trong cơ sở dữ liệu của 2 ngày gần đây.`, message.message_id);
        }
      } catch (err) {
        console.error('Leftover scanner handling failed:', err);
        sendTelegramMessage(chatId, `❌ Đã có lỗi xảy ra trong quá trình quét đối chiếu AI.`, message.message_id);
      }
    }
    // --- 5. DIRECT IMAGE UPLOADS WITHOUT REPLY IN DON_GIAO (DELIVERY HANDLER) ---
    else if (chatId === GROUPS.DON_GIAO && message.photo) {
      const largestPhoto = message.photo[message.photo.length - 1];
      try {
        const localPath = await downloadTelegramFile(largestPhoto.file_id);
        console.log(`[Delivery Handler] Received direct photo in DON_GIAO. Local path: ${localPath}`);

        sendTelegramMessage(chatId, `🤖 Bé Ba đang quét nội dung hóa đơn để xử lý yêu cầu giao hàng... ⏳`, message.message_id);

        const systemPrompt = `You are an AI assistant for a laundry shop. Analyze the uploaded receipt/invoice image.
Your task is to:
1. Determine if this image is a laundry receipt/invoice (bill).
2. Scan the bill for a booking code in the format "LTTxxxx" (e.g. "NF2360", "LTT4572", etc.).
3. If a booking code like "LTTxxxx" is found, set "booking_code" to that value.
4. Extract the receipt number / invoice number (Số HĐ / Số hóa đơn) from the bill, which is typically in the format "DHxxxx" (e.g. "DH011912", "DH011910", etc.). Set "receipt_number" to this value.
5. Detect the payment status stamp on the bill:
   - If there is a blue stamp containing "CHƯA THANH TOÁN", set "payment_status" to "unpaid".
   - If there is a red stamp containing "PAID", set "payment_status" to "paid".
   - If no stamp is found, default to "unpaid".
6. Regardless of booking code, always extract the customer details if present:
   - "name": customer name (string or null)
   - "phone": phone number (string or null)
   - "room": room number (string or null)
   - "hotel": hotel name/address (string or null)
   - "amount": the total amount from the bill (number or null)
7. Check if there is an item/line in the bill table/description containing "delivery" or "giao" with the amount "20.000" or "20,000" or similar (delivery fee).
   - If BOTH the customer information and the "delivery 20.000" fee are present, set "is_walkin_delivery_request" to true.

Respond ONLY with a JSON object in this format:
{
  "is_bill": true | false,
  "booking_code": "LTTxxxx" or null,
  "receipt_number": "DHxxxx" or null,
  "payment_status": "paid" | "unpaid",
  "is_walkin_delivery_request": true | false,
  "extracted_details": {
    "name": string or null,
    "phone": string or null,
    "room": string or null,
    "hotel": string or null,
    "amount": number or null
  },
  "confidence": number,
  "reason": "explanation of your extraction"
}`;

        const userPrompt = "Analyze this bill for booking code, receipt number or walk-in delivery request details.";
        const aiRes = await analyzeImageWithAI(localPath, systemPrompt, userPrompt);
        console.log(`[Delivery Handler] AI Vision result:`, aiRes);

        if (aiRes && aiRes.is_bill) {
          const isPaid = aiRes.payment_status === 'paid';
          const paymentStatusDb = isPaid ? 'Đã thanh toán' : 'Chờ thanh toán';
          const receiptNumber = aiRes.receipt_number || null;
          
          const paymentStatusText = isPaid 
            ? `✅ <b>TRẠNG THÁI: ĐÃ THANH TOÁN (PAID)</b>\n<i>(Đơn hàng đã được thanh toán, chỉ cần giao đồ)</i>`
            : `⚠️ <b>TRẠNG THÁI: CHƯA THANH TOÁN (COD)</b>\n🚨 <b>Vui lòng nhắn tin trước cho khách để báo số tiền và sắp xếp lấy tiền trước khi đi giao!</b>`;

          let matchedOrder = null;
          let bookingCode = null;

          // Try matching by booking_code first
          if (aiRes.booking_code) {
            matchedOrder = await dbGet(
              "SELECT o.*, c.name, c.phone, c.hotel, c.room FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.booking_code = ?",
              [aiRes.booking_code]
            );
            if (matchedOrder) bookingCode = matchedOrder.booking_code;
          }

          // If not matched by booking_code, try matching by phone or name in active orders
          if (!matchedOrder && aiRes.extracted_details) {
            const details = aiRes.extracted_details;
            const cleanPhone = details.phone ? details.phone.replace(/\D/g, '') : '';
            
            if (cleanPhone) {
              matchedOrder = await dbGet(
                `SELECT o.*, c.name, c.phone, c.hotel, c.room 
                 FROM orders o 
                 JOIN customers c ON o.customer_id = c.id 
                 WHERE (c.phone = ? OR c.phone LIKE ?) AND o.order_status NOT IN ('Hoàn thành', 'Đã giao')
                 ORDER BY o.order_date DESC LIMIT 1`,
                [cleanPhone, `%${cleanPhone.slice(-8)}%`]
              );
            }
            if (!matchedOrder && details.name) {
              matchedOrder = await dbGet(
                `SELECT o.*, c.name, c.phone, c.hotel, c.room 
                 FROM orders o 
                 JOIN customers c ON o.customer_id = c.id 
                 WHERE c.name LIKE ? AND o.order_status NOT IN ('Hoàn thành', 'Đã giao')
                 ORDER BY o.order_date DESC LIMIT 1`,
                [`%${details.name}%`]
              );
            }
            if (matchedOrder) bookingCode = matchedOrder.booking_code;
          }

          // Case A: Matched existing order
          if (matchedOrder) {
            const newDeliveryStatus = isPaid ? 'Chờ giao (đã thanh toán)' : 'Chờ giao chưa thanh toán';

            await dbRun(
              "UPDATE orders SET order_status = ?, status = ?, receipt_number = ? WHERE booking_code = ?",
              [newDeliveryStatus, paymentStatusDb, receiptNumber, bookingCode]
            );
            syncOrderUpdateToN8n(bookingCode, matchedOrder.amount, newDeliveryStatus);

            sendTelegramMessage(chatId, `🚚 Đã khớp đơn hàng <b>#${bookingCode}</b>! Cập nhật trạng thái thành: <b>${newDeliveryStatus}</b>.`, message.message_id);

            // Post delivery request message and mapping so shipper can done/xong reply to it
            const delText = `🛵 <b>YÊU CẦU GIAO HÀNG / DELIVERY REQUEST</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code> ${receiptNumber ? `(HĐ: <code>${receiptNumber}</code>)` : ''}
👤 Khách hàng: <b>${matchedOrder.name}</b>
📞 SĐT: <code>${matchedOrder.phone}</code>
🏢 Khách sạn: ${matchedOrder.hotel}
🚪 Số phòng: ${matchedOrder.room}
💰 Số tiền: <b>${(matchedOrder.amount || 0).toLocaleString('vi-VN')} VND</b>
---------------------------------------
${paymentStatusText}
---------------------------------------
🚨 <i>Shipper giao hàng chụp ảnh và reply tin nhắn này kèm chữ "done" hoặc "xong" để hoàn tất đơn hàng!</i>`;
            
            const res4 = await sendTelegramPhoto(GROUPS.DON_GIAO, largestPhoto.file_id, delText);
            if (res4 && res4.result && res4.result.message_id) {
              await dbRun(
                "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'delivery')",
                [bookingCode, res4.result.message_id, GROUPS.DON_GIAO]
              );
            }

            // Forward directly to shipper & admin if unpaid
            if (!isPaid) {
              alertUnpaidOrder(bookingCode, delText);
            }
          } 
          // Case B: Walk-in delivery request (delivery 20.000 and details)
          else if (aiRes.is_walkin_delivery_request && aiRes.extracted_details) {
            const details = aiRes.extracted_details;
            const name = details.name || 'Walk-in Customer';
            const phone = details.phone || '';
            const hotel = details.hotel || '1997 Laundry Shop';
            const room = details.room || '';
            const amount = details.amount || 0;

            // Generate new booking code
            const bookingCode = 'LTT' + String(Math.floor(Date.now() / 1000)).slice(-4);

            // Lookup or create customer
            let customerId = null;
            if (phone) {
              const existingCust = await dbGet("SELECT id FROM customers WHERE phone = ?", [phone]);
              if (existingCust) {
                customerId = existingCust.id;
                await dbRun("UPDATE customers SET name = ?, hotel = ?, room = ? WHERE id = ?", [name, hotel, room, customerId]);
              }
            }

            if (!customerId) {
              const result = await dbRun(
                "INSERT INTO customers (name, phone, hotel, room) VALUES (?, ?, ?, ?)",
                [name, phone, hotel, room]
              );
              customerId = result.lastID;
            }

            // Create new order in SQLite DB
            const phoneDigits = (phone || '').replace(/\D/g, '');
            const isViPhoneNum = phoneDigits.startsWith('84') || phoneDigits.startsWith('0');
            const langVal = isViPhoneNum ? 'vi' : 'en';

            const newDeliveryStatus = isPaid ? 'Chờ giao (đã thanh toán)' : 'Chờ giao chưa thanh toán';

            await dbRun(
              "INSERT INTO orders (booking_code, customer_id, product_id, amount, status, order_status, order_date, receipt_number, lang) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)",
              [bookingCode, customerId, amount, paymentStatusDb, newDeliveryStatus, new Date().toISOString(), receiptNumber, langVal]
            );

            // Sync to n8n
            syncOrderUpdateToN8n(bookingCode, amount, newDeliveryStatus);

            sendTelegramMessage(chatId, `🆕 Phát hiện đơn Khách tới tiệm giao về! Đã tự động tạo đơn mới trên Admin: <b>#${bookingCode}</b> (${isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}).`, message.message_id);

            // Post delivery card for shipper
            const delText = `🛵 <b>YÊU CẦU GIAO HÀNG / DELIVERY REQUEST (KHÁCH TIỆM)</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code> (Tự tạo) ${receiptNumber ? `(HĐ: <code>${receiptNumber}</code>)` : ''}
👤 Khách hàng: <b>${name}</b>
📞 SĐT: <code>${phone}</code>
🏢 Địa chỉ giao: ${hotel}
🚪 Số phòng: ${room}
💰 Tổng thanh toán: <b>${amount.toLocaleString('vi-VN')} VND</b>
---------------------------------------
${paymentStatusText}
---------------------------------------
🚨 <i>Shipper giao hàng chụp ảnh và reply tin nhắn này kèm chữ "done" hoặc "xong" để hoàn tất đơn hàng!</i>`;

            const res4 = await sendTelegramPhoto(GROUPS.DON_GIAO, largestPhoto.file_id, delText);
            if (res4 && res4.result && res4.result.message_id) {
              await dbRun(
                "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'delivery')",
                [bookingCode, res4.result.message_id, GROUPS.DON_GIAO]
              );
            }

            // Forward directly to shipper & admin if unpaid
            if (!isPaid) {
              alertUnpaidOrder(bookingCode, delText);
            }
          } else {
            sendTelegramMessage(chatId, `⚠️ Ảnh hóa đơn gửi lên không khớp với đơn hàng nào trong hệ thống và cũng không phải là yêu cầu giao hàng từ khách tại tiệm (thiếu thông tin hoặc phí delivery 20.000).`, message.message_id);
          }
        } else {
          sendTelegramMessage(chatId, `⚠️ Ảnh gửi lên không phải là ảnh hóa đơn/bill hợp lệ để xử lý giao hàng.`, message.message_id);
        }
      } catch (err) {
        console.error('Delivery handler failed:', err);
        sendTelegramMessage(chatId, `❌ Đã xảy ra lỗi trong quá trình xử lý ảnh hóa đơn giao hàng.`, message.message_id);
      }
    }
    // --- 2.5 DIRECT IMAGE UPLOADS WITHOUT REPLY IN CHECK_THANH_TOAN ---
    else if (chatId === GROUPS.CHECK_THANH_TOAN && message.photo) {
      const largestPhoto = message.photo[message.photo.length - 1];
      try {
        const localPath = await downloadTelegramFile(largestPhoto.file_id);
        console.log(`[Payment Check] Received photo in CHECK_THANH_TOAN. Local path: ${localPath}`);

        const systemPrompt = `You are an AI assistant for a laundry shop. Analyze this bank transfer transaction slip / payment receipt image.
Determine if it shows a successful bank transfer / payment transaction.

Extract:
1. "amount": The transferred amount as an integer number (e.g. 260000).
2. "transaction_code": The transaction reference number / code / FT number / MoMo ID / transaction ID (e.g. "136117318624"). Set to null if not found.

Respond ONLY with a JSON object in this format:
{
  "is_payment_slip": true | false,
  "amount": number or null,
  "transaction_code": string or null,
  "confidence": number,
  "reason": "explanation"
}`;

        const userPrompt = "Analyze this image for transaction details.";
        const aiRes = await analyzeImageWithAI(localPath, systemPrompt, userPrompt);
        console.log(`[Payment Check] AI Vision result:`, aiRes);

        if (aiRes && aiRes.is_payment_slip) {
          let matchTx = null;
          
          if (aiRes.transaction_code) {
            matchTx = await dbGet(
              `SELECT * FROM sepay_transactions 
               WHERE reference_code = ? 
                  OR content LIKE ? 
                  OR sepay_id = ?`,
              [aiRes.transaction_code, `%${aiRes.transaction_code}%`, aiRes.transaction_code]
            );
          }

          if (!matchTx && aiRes.amount) {
            matchTx = await dbGet(
              `SELECT * FROM sepay_transactions 
               WHERE transfer_amount = ? 
                 AND datetime(created_at) >= datetime('now', '-1 day')
               ORDER BY created_at DESC LIMIT 1`,
              [aiRes.amount]
            );
          }

          if (matchTx) {
            sendTelegramMessage(
              chatId, 
              `✅ <b>ĐÃ NHẬN TIỀN (SEPAY/NGÂN HÀNG):</b>\n\nGiao dịch thành công đã được hệ thống ghi nhận!\n\n💵 Số tiền: <b>${matchTx.transfer_amount.toLocaleString('vi-VN')} VND</b>\n🏦 Cổng/Ngân hàng: <b>${matchTx.gateway || 'N/A'}</b>\n⏰ Thời gian nhận: <code>${matchTx.transaction_date || matchTx.created_at}</code>\n📝 Nội dung CK: <i>"${matchTx.content}"</i>\n📌 Mã GD: <code>${matchTx.reference_code || 'N/A'}</code>`, 
              message.message_id
            );
          } else {
            const displayAmount = aiRes.amount ? `${aiRes.amount.toLocaleString('vi-VN')} VND` : 'Không rõ';
            sendTelegramMessage(
              chatId, 
              `❌ <b>CHƯA NHẬN ĐƯỢC TIỀN TRÊN HỆ THỐNG:</b>\n\nHệ thống SePay/Ngân hàng <b>chưa nhận được</b> hoặc chưa ghi nhận giao dịch này trong cơ sở dữ liệu.\n\n💵 Số tiền trên ảnh: <b>${displayAmount}</b>\n📌 Mã GD trên ảnh: <code>${aiRes.transaction_code || 'N/A'}</code>\n🚨 <i>Vui lòng kiểm tra lại tài khoản hoặc đợi vài phút để hệ thống cập nhật!</i>`, 
              message.message_id
            );
          }
        } else {
          sendTelegramMessage(chatId, `⚠️ Ảnh gửi lên không phải là ảnh hóa đơn chuyển khoản/thanh toán hợp lệ.`, message.message_id);
        }
      } catch (err) {
        console.error('Payment check direct handler failed:', err);
      }
    }
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
  // --- 4. AUTO ORDER CREATION FROM MANUAL MESSAGE IN GROUPS.DON_NHAN ---
  else if (chatId === GROUPS.DON_NHAN && !replyTo && (text || message.photo) && !isCheckUncollected) {
    try {
      let aiRes = null;
      if (message.photo) {
        console.log(`[DON_NHAN Auto-Order] Parsing image in GROUPS.DON_NHAN...`);
        const largestPhoto = message.photo[message.photo.length - 1];
        const localPath = await downloadTelegramFile(largestPhoto.file_id);
        
        const visionSystemPrompt = `You are an AI assistant for a laundry shop called 1997 Premium Laundry.
Analyze the uploaded image (which is typically a screenshot of a customer chat, booking details, or invoice).
Extract the customer booking details from the image.

Extract these details:
1. "is_order_request": true or false. Set to true if the image contains customer name, phone number, hotel/address details, or text indicating a request to book/schedule laundry pickup.
2. "name": Customer's name (string or null). Make sure to extract ONLY the actual person's name. Do NOT include words that describe the pickup location (like "Lễ tân", "Reception"), service keywords (like "Same day"), or timing.
3. "phone": Customer's phone number or contact channel (e.g. "zalo", "fb", "Zalo/FB", string or null). If the message specifies contact via zalo or facebook instead of a numeric phone, extract that string.
4. "hotel": Hotel name / address (string or null).
5. "room": Room number (string or null).
6. "product_id": Match the package type to one of these product IDs:
   - 1: Standard Wash & Fold (24h)
   - 2: Same-day Wash & Fold (8h-12h)
   - 3: Express Wash & Fold (4h)
   - Default: 2 (if Same-day is mentioned or no specific package is specified).
7. "pickup_time": Estimated pickup time (string or null, e.g. "9:00 AM", "1:00 PM").
8. "pickup_option": Detailed pickup location or instructions, e.g. "Lễ tân", "Từ khách", "Gửi bảo vệ" (string, default "Lễ tân").
9. "notes": Any additional service notes or laundry remarks like "có đồ giặt không sấy", "có tiền", etc. (string or null).

Respond ONLY with a JSON object in this format:
{
  "is_order_request": boolean,
  "name": string or null,
  "phone": string or null,
  "hotel": string or null,
  "room": string or null,
  "product_id": number,
  "pickup_time": string or null,
  "pickup_option": string,
  "notes": string or null,
  "confidence": number,
  "reason": "explanation"
}`;
        aiRes = await analyzeImageWithAI(localPath, visionSystemPrompt, "Read this image and extract order details.");
      } else {
        console.log(`[DON_NHAN Auto-Order] Parsing text message in GROUPS.DON_NHAN: "${text}"`);
        const systemPrompt = `You are an AI assistant for a laundry shop called 1997 Premium Laundry.
Analyze the provided text message sent by staff.
Determine if the message is a request to create a new laundry order/booking based on manual customer details.
Typically, it contains a pickup time (e.g. 9:00, 1pm), hotel/address name, customer name, phone number, and package type.

Extract these details:
1. "is_order_request": true or false. Set to true ONLY if the text contains at least a hotel/address, name or phone, and is requesting a booking. Set to false if it's general discussion, queries, or irrelevant chat.
2. "name": Customer's name (string or null). Make sure to extract ONLY the actual person's name (e.g. "Noah Long", "Yu", "Jessica Inskip"). Do NOT include words that describe the pickup location (like "Lễ tân", "Reception", "Gửi bảo vệ"), service keywords (like "Same day", "Express"), or timing. If a name has a room number like "Noah Long - R502", extract ONLY the name part ("Noah Long").
3. "phone": Customer's phone number or contact channel (e.g. "zalo", "fb", "Zalo/FB", string or null). If the message specifies contact via zalo or facebook instead of a numeric phone, extract that string.
4. "hotel": Hotel name / address (string or null).
5. "room": Room number (string or null).
6. "product_id": Match the package type to one of these product IDs:
   - 1: Standard Wash & Fold (24h) (Keywords: Standard, 24h, 24 Hours)
   - 2: Same-day Wash & Fold (8h-12h) (Keywords: Same day, Same-day, Lấy trong ngày, Trong ngày)
   - 3: Express Wash & Fold (4h) (Keywords: Express, 4h, 4-Hour, Siêu tốc, Hỏa tốc)
   - Default: 2 (if Same-day is mentioned or no specific package is specified).
7. "pickup_time": Estimated pickup time (string or null, e.g. "9:00 AM", "1:00 PM").
8. "pickup_option": Detailed pickup location or instructions, e.g. "Lễ tân", "Từ khách", "Đến lễ tân gọi khách", "Gửi bảo vệ", or any specific pickup method/notes mentioned (string, default "Lễ tân").
9. "notes": Any additional service notes or laundry remarks like "có đồ giặt không sấy", "kèm hình", "có tiền", or "cẩn thận đồ màu", etc. (string or null).

Respond ONLY with a JSON object in this format:
{
  "is_order_request": boolean,
  "name": string or null,
  "phone": string or null,
  "hotel": string or null,
  "room": string or null,
  "product_id": number,
  "pickup_time": string or null,
  "pickup_option": string,
  "notes": string or null,
  "confidence": number,
  "reason": "explanation"
}`;
        aiRes = await analyzeTextWithAI(text, systemPrompt, "Parse this manual order message.");
        if (!aiRes) {
          console.log(`[DON_NHAN Auto-Order] Gemini parsing failed or quota exceeded. Using regex fallback...`);
          aiRes = fallbackParseOrderText(text);
        }
      }
      console.log(`[DON_NHAN Auto-Order] Final parse result:`, aiRes);

      if (aiRes && aiRes.is_order_request) {
        if (isOrderInfoSuspicious(aiRes)) {
          console.log(`[DON_NHAN Auto-Order] Suspected error/placeholder values found in parsed order info! Suspending...`);
          
          const alertMsg = `⚠️ <b>[BÉ BA CẢNH BÁO LỖI LÊN ĐƠN]</b>\n` +
                           `Phát hiện thông tin đơn hàng bị lỗi/nghi vấn:\n` +
                           `- Tên: <code>${aiRes.name || 'Chưa rõ'}</code>\n` +
                           `- SĐT: <code>${aiRes.phone || 'Chưa rõ'}</code>\n` +
                           `- Khách sạn: <code>${aiRes.hotel || 'Chưa rõ'}</code>\n` +
                           `- Phòng: <code>${aiRes.room || 'Chưa rõ'}</code>\n\n` +
                           `<b>Nội dung gốc:</b>\n` +
                           `<code>${text}</code>\n\n` +
                           `👉 <b>Admin vui lòng reply trực tiếp tin nhắn này kèm theo thông tin sửa đổi hoặc gửi thông tin chuẩn để Bé Ba tự lên lại đơn!</b>`;
          
          const sentAdminMsg = await sendTelegramMessage(ADMIN_CHAT_ID, alertMsg);
          if (sentAdminMsg && sentAdminMsg.result) {
            await dbRun(
              "INSERT INTO suspended_orders (original_text, original_chat_id, admin_msg_id) VALUES (?, ?, ?)",
              [text, chatId, String(sentAdminMsg.result.message_id)]
            );
          }
          
          await sendTelegramMessage(chatId, `⚠️ Phát hiện thông tin đơn hàng bị thiếu/sai sót địa chỉ. Bé Ba đã chuyển về cho Admin xử lý và xác nhận lại!`, message.message_id);
          return;
        }

        let name = aiRes.name || 'Group Chat Customer';
        const phone = aiRes.phone ? aiRes.phone.trim() : null;
        const hotel = aiRes.hotel || '1997 Laundry Central';
        let room = aiRes.room || '';
        const productId = aiRes.product_id || 2; // Default to Same-day
        const notes = aiRes.notes || '';
        
        // Javascript name cleanup: remove helper lines or room info from name
        if (name.includes('\n')) {
          const nameLines = name.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          let likelyName = '';
          for (const line of nameLines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('lễ tân') || lowerLine.includes('reception') || lowerLine.includes('same day') || lowerLine.includes('standard') || lowerLine.includes('express') || lowerLine.includes('hỏa tốc') || lowerLine.includes('siêu tốc')) {
              continue;
            }
            likelyName = line;
            break;
          }
          if (likelyName) {
            name = likelyName;
          } else {
            name = nameLines[nameLines.length - 1];
          }
        }

        // Clean room number from name if it's still attached (e.g. "Alper Kaya - R204")
        if (name.includes('-')) {
          const parts = name.split('-');
          const possibleRoom = parts[parts.length - 1].trim();
          if (/^r?\d+$/i.test(possibleRoom)) {
            if (!room) room = possibleRoom.replace(/^r/i, '');
            name = parts.slice(0, -1).join('-').trim();
          }
        }
        
        // Extract Google Maps link if any
        const mapLinkRegex = /(https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.app\.goo\.gl)\/\S+)/i;
        const match = text.match(mapLinkRegex);
        const mapLink = match ? match[1] : '';

        // Generate new booking code (NF + last 4 digits of timestamp)
        const bookingCode = 'LTT' + String(Math.floor(Date.now() / 1000)).slice(-4);
        
        // Match product base amount
        let baseAmount = 250000;
        if (productId === 1) baseAmount = 170000;
        else if (productId === 3) baseAmount = 330000;
        
        // Lookup or create customer
        let customerId = null;
        if (phone) {
          const existingCust = await dbGet("SELECT id FROM customers WHERE phone = ?", [phone]);
          if (existingCust) {
            customerId = existingCust.id;
            await dbRun("UPDATE customers SET name = ?, hotel = ?, room = ? WHERE id = ?", [name, hotel, room, customerId]);
          }
        }
        
        if (!customerId) {
          const result = await dbRun(
            "INSERT INTO customers (name, phone, hotel, room) VALUES (?, ?, ?, ?)",
            [name, phone, hotel, room]
          );
          customerId = result.lastID;
        }

        if (mapLink && customerId) {
          await dbRun("UPDATE customers SET map_link = ? WHERE id = ?", [mapLink, customerId]);
        }
        
        // Default language based on phone
        const phoneDigits = (phone || '').replace(/\D/g, '');
        const isViPhoneNum = phoneDigits.startsWith('84') || phoneDigits.startsWith('0');
        const langVal = isViPhoneNum ? 'vi' : 'en';
        
        // Create new order in SQLite DB (order_status = 'Chờ lấy')
        await dbRun(
          `INSERT INTO orders (booking_code, customer_id, product_id, amount, status, order_status, order_date, lang, notes, collect_scheduled_time) 
           VALUES (?, ?, ?, ?, 'Chờ thanh toán', 'Chờ lấy', ?, ?, ?, ?)`,
          [bookingCode, customerId, productId, baseAmount, new Date().toISOString(), langVal, notes, aiRes.pickup_time || '']
        );
        
        // Sync to n8n (so the admin panel updates)
        syncOrderUpdateToN8n(bookingCode, baseAmount, 'Chờ lấy');
        
        // Get product name
        const productRow = await dbGet("SELECT name FROM products WHERE id = ?", [productId]);
        const productName = productRow ? productRow.name : 'Giặt sấy';
        
        // Send confirmation back to the DON_NHAN group (custom order and styling)
        const formattedPickupTime = (aiRes.pickup_time || 'Chưa rõ').toUpperCase();
        const formattedNotes = notes ? notes : 'Không có';
        const formattedRoom = room ? room : 'Chưa rõ';

        const cleanRoom = room ? ` - R${room.replace(/^r/i, '')}` : '';

        const simplifiedProduct = getSimplifiedProductName(productId, productName, notes);

        let confirmMsg = `🟧 <b>ĐƠN MỚI</b>\n` +
                         `[GIỜ LẤY: ${formattedPickupTime}]\n` +
                         `<b><code>${bookingCode}</code></b>\n` +
                         `${aiRes.pickup_option || 'Lễ tân'}\n` +
                         `${simplifiedProduct} - <i>"${formattedNotes}"</i>\n` +
                         `${name}${cleanRoom}\n` +
                         `<code>${phone || 'Chưa rõ'}</code>\n` +
                         `<b>${hotel.toUpperCase()}</b>`;

        if (mapLink) {
          confirmMsg += `\nLink Maps: <a href="${mapLink}">Xem Bản Đồ</a>`;
        }
        
        const resMsg = await sendTelegramMessage(chatId, confirmMsg);
        if (resMsg && resMsg.result && resMsg.result.message_id) {
          await dbRun(
            "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'pickup')",
            [bookingCode, resMsg.result.message_id, chatId]
          );
        }

        // Delete the original input message to keep the group clean
        await deleteTelegramMessage(chatId, message.message_id);
      }
    } catch (err) {
      console.error('[DON_NHAN Auto-Order] auto order creation failed:', err);
    }
  }
  else {
    // Fallback: If it's a private chat, forward the message to goClaw completions API
    const isGroupChat = Number(chatId) < 0;
    if (!isGroupChat && (text || message.photo)) {
      // 1. Intercept short greetings to show welcome message with buttons instantly
      if (!message.photo && text) {
        const cleanText = text.replace(/[^a-zA-Z0-9\/]/g, '').trim().toLowerCase();
        const greetings = ['/start', 'hi', 'hello', 'chào', 'chao', 'hey', 'hola', 'start'];
        if (greetings.includes(cleanText)) {
          const welcomeText = `Dạ, chào anh/chị! 🧺 Em là trợ lý của 1997 Premium Laundry. Rất vui được gặp anh/chị ạ. Vui lòng chọn dịch vụ anh/chị cần:`;
          const replyMarkup = {
            keyboard: [
              [{ text: 'Same-day Express' }],
              [{ text: '4-Hour Express' }],
              [{ text: 'Next-day Laundry' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          };
          sendTelegramMessage(chatId, welcomeText, message.message_id, replyMarkup);
          return;
        }

        // 2. Intercept Change Package option
        if (text.toLowerCase().includes('change package') || text.includes('🔙 Change Package')) {
          const welcomeText = `Dạ, vui lòng chọn dịch vụ anh/chị cần:`;
          const replyMarkup = {
            keyboard: [
              [{ text: 'Same-day Express' }],
              [{ text: '4-Hour Express' }],
              [{ text: 'Next-day Laundry' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          };
          sendTelegramMessage(chatId, welcomeText, message.message_id, replyMarkup);
          return;
        }
      }

      try {
        console.log(`[Telegram Webhook] Forwarding message to goClaw for chatId: ${chatId}. Has photo: ${!!message.photo}`);
        
        let contentPayload;
        if (message.photo) {
          const largestPhoto = message.photo[message.photo.length - 1];
          const localRelPath = await downloadTelegramFile(largestPhoto.file_id);
          const absolutePath = path.join(__dirname, localRelPath);
          const imageText = await transcribeImageWithAI(absolutePath, text || "Hãy đọc hình ảnh này.");
          contentPayload = (text ? `${text}\n\n` : '') + `[Ảnh được gửi kèm - Kết quả scan ảnh]:\n${imageText}`;
        } else {
          contentPayload = text;
        }

        const payload = {
          messages: [{ role: 'user', content: contentPayload }]
        };

        const response = await fetch('http://localhost:3002/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GOCLAW_API_KEY}`,
            'X-GoClaw-User-Id': `telegram-${chatId}`,
            'X-GoClaw-Agent-Id': process.env.AGENT_ID || '1997-laundry-assistant'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
          if (reply) {
            // Check if it requests admin calling
            const isCallAdmin = reply.includes('[CALL_ADMIN]');
            const cleanReply = reply.replace(/\[CALL_ADMIN\]/gi, '').trim();

            if (isCallAdmin) {
              const adminAlert = `⚠️ <b>[BÉ BA CẦN HỖ TRỢ]</b>\nKhách hàng cần hỗ trợ gấp vì Bé Ba không có dữ liệu hoặc không trả lời được!\n\n` +
                                 `• <b>Khách hàng:</b> <a href="tg://user?id=${chatId}">telegram-${chatId}</a> (ID: <code>${chatId}</code>)\n` +
                                 `• <b>Tin nhắn khách gửi:</b> "${text || '[Gửi ảnh/Tài liệu]'}"\n` +
                                 `• <b>Bé Ba đã trả lời:</b> "${cleanReply}"`;
              sendTelegramMessage(ADMIN_CHAT_ID, adminAlert);
            }

            // Check if AI reply asks to book the service
            const lowerReply = cleanReply.toLowerCase();
            const suggestsBooking = lowerReply.includes('book') || 
                                    lowerReply.includes('booking') || 
                                    lowerReply.includes('đặt dịch vụ') || 
                                    lowerReply.includes('đăng ký dịch vụ') ||
                                    lowerReply.includes('đặt lịch') ||
                                    lowerReply.includes('đặt đơn');
            
            let replyMarkup = null;
            if (suggestsBooking) {
              replyMarkup = {
                keyboard: [
                  [{ text: '📝 Proceed Booking' }],
                  [{ text: '🔙 Change Package' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
              };
            }
            sendTelegramMessage(chatId, cleanReply, message.message_id, replyMarkup);
          }
        } else {
          const errText = await response.text();
          console.error('[Telegram Webhook] goClaw completions API error:', errText);
        }
      } catch (err) {
        console.error('[Telegram Webhook] Fallback to goClaw failed:', err);
      }
    }
  }
}

// --- TRIGGER TELEGRAM DELIVERY ALERT FOR MANUAL ORDERS ---
async function sendDeliveryAlert(bookingCode) {
  try {
    const o = await dbGet(
      `SELECT o.booking_code, o.amount, o.status as payment_status, c.name, c.phone, c.hotel, c.room
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.booking_code = ?`,
      [bookingCode]
    );

    if (!o) {
      console.error(`[Delivery Alert] Order ${bookingCode} not found in DB.`);
      return;
    }

    const isPaid = o.payment_status === 'Đã thanh toán' || o.payment_status === 'paid';
    const paymentStatusText = isPaid 
      ? `✅ <b>TRẠNG THÁI: ĐÃ THANH TOÁN (PAID)</b>\n<i>(Đơn hàng đã được thanh toán, chỉ cần giao đồ)</i>`
      : `⚠️ <b>TRẠNG THÁI: CHƯA THANH TOÁN (COD)</b>\n🚨 <b>Vui lòng nhắn tin trước cho khách để báo số tiền và sắp xếp lấy tiền trước khi đi giao!</b>`;

    const delText = `🛵 <b>YÊU CẦU GIAO HÀNG / DELIVERY REQUEST</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code>
👤 Khách hàng: <b>${o.name}</b>
📞 SĐT: <code>${o.phone}</code>
🏢 Khách sạn: ${o.hotel}
🚪 Số phòng: ${o.room}
💰 Số tiền: <b>${(o.amount || 0).toLocaleString('vi-VN')} VND</b>
---------------------------------------
${paymentStatusText}
---------------------------------------
🚨 <i>Shipper giao hàng chụp ảnh và reply tin nhắn này kèm chữ "done" hoặc "xong" để hoàn tất đơn hàng!</i>`;

    const res4 = await sendTelegramMessage(GROUPS.DON_GIAO, delText);
    if (res4 && res4.result && res4.result.message_id) {
      await dbRun(
        "INSERT INTO order_telegram_mappings (booking_code, telegram_message_id, telegram_chat_id, message_type) VALUES (?, ?, ?, 'delivery')",
        [bookingCode, res4.result.message_id, GROUPS.DON_GIAO]
      );
    }
  } catch (err) {
    console.error(`[Delivery Alert] sendDeliveryAlert failed for ${bookingCode}:`, err);
  }
}

function editTelegramMessage(chatId, messageId, newText, isPhoto = true) {
  if (!TELEGRAM_TOKEN || TELEGRAM_TOKEN === 'disabled') return;
  const method = isPhoto ? 'editMessageCaption' : 'editMessageText';
  const payload = {
    chat_id: String(chatId),
    message_id: Number(messageId),
    parse_mode: 'HTML'
  };
  if (isPhoto) {
    payload.caption = newText;
  } else {
    payload.text = newText;
  }

  const data = JSON.stringify(payload);
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TELEGRAM_TOKEN}/${method}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      console.log(`[Telegram Edit] ${method} reply:`, raw);
    });
  });

  req.on('error', (e) => {
    console.error(`[Telegram Edit] ${method} failed:`, e);
  });

  req.write(data);
  req.end();
}

async function updateDeliveryCardToPaid(bookingCode) {
  try {
    const order = await dbGet(`
      SELECT o.*, c.name, c.phone, c.hotel, c.room 
      FROM orders o 
      LEFT JOIN customers c ON o.customer_id = c.id 
      WHERE o.booking_code = ?
    `, [bookingCode]);

    if (!order) return;

    const mapping = await dbGet(`
      SELECT telegram_message_id, telegram_chat_id 
      FROM order_telegram_mappings 
      WHERE booking_code = ? AND message_type = 'delivery'
      LIMIT 1
    `, [bookingCode]);

    if (!mapping) return;

    const receiptNumber = order.receipt_number || '';
    const paymentStatusText = `✅ <b>TRẠNG THÁI: ĐÃ THANH TOÁN (PAID)</b>\n<i>(Đơn hàng đã được thanh toán, chỉ cần giao đồ)</i>`;

    const delText = `🛵 <b>YÊU CẦU GIAO HÀNG / DELIVERY REQUEST</b>
---------------------------------------
📌 Mã đơn: <code>${bookingCode}</code> ${receiptNumber ? `(HĐ: <code>${receiptNumber}</code>)` : ''}
👤 Khách hàng: <b>${order.name}</b>
📞 SĐT: <code>${order.phone}</code>
🏢 Khách sạn: ${order.hotel}
🚪 Số phòng: ${order.room}
💰 Số tiền: <b>${(order.amount || 0).toLocaleString('vi-VN')} VND</b>
---------------------------------------
${paymentStatusText}
---------------------------------------
🚨 <i>Shipper giao hàng chụp ảnh và reply tin nhắn này kèm chữ "done" hoặc "xong" để hoàn tất đơn hàng!</i>`;

    editTelegramMessage(mapping.telegram_chat_id, mapping.telegram_message_id, delText, true);
    console.log(`[Delivery Edit] Successfully edited active delivery card for ${bookingCode} to PAID.`);
  } catch (err) {
    console.error(`[Delivery Edit] Failed to update delivery card for ${bookingCode}:`, err);
  }
}

// --- INIT MAIN CONTROLLER ---
function init(app, sqliteDb) {
  db = sqliteDb;

  dbRun(`
    CREATE TABLE IF NOT EXISTS suspended_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_text TEXT,
      original_chat_id TEXT,
      admin_msg_id TEXT
    )
  `).catch(err => console.error('Failed to create suspended_orders table:', err));
  
  if (!TELEGRAM_TOKEN || TELEGRAM_TOKEN === 'disabled') {
    console.log('Telegram Bot integration is disabled for 1997 Laundry.');
    if (process.env.DISABLE_WHATSAPP !== 'true') {
      startWhatsAppBot();
    }
    return;
  }
  
  // 1. Register Webhook endpoint inside Express app
  app.post('/api/telegram-webhook-1997', (req, res) => {
    handleTelegramUpdate(req.body);
    res.sendStatus(200);
  });
  
  // 2. Set Telegram webhook URL programmatically
  const webhookUrl = `https://nicefoldsaigon.vn/api/telegram-webhook-1997`;
  const setWebhookApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}&allowed_updates=${encodeURIComponent(JSON.stringify(["message", "edited_message", "callback_query", "my_chat_member"]))}`;
  
  https.get(setWebhookApiUrl, { family: 4 }, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      console.log('Telegram webhook registration reply:', raw);
    });
  }).on('error', (err) => {
    console.error('Failed to set Telegram webhook:', err);
  });
  
  // 3. Start WhatsApp Baileys connection listener
  if (process.env.DISABLE_WHATSAPP !== 'true') {
    startWhatsAppBot();
  }
}

module.exports = {
  init,
  sendOrderAlert,
  sendWhatsAppConfirmation,
  sendDeliveryAlert,
  sendTelegramMessage,
  GROUPS,
  updateDeliveryCardToPaid
};
