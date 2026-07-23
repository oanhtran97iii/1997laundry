import os
import json
import sqlite3
import urllib.parse
import urllib.request
import threading
import time
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8082
DB_PATH = os.path.join(os.path.dirname(__file__), "brain.db")

def send_email_via_resend(to_email, subject, html_content):
    config_path = os.path.join(os.path.dirname(__file__), "resend_config.txt")
    if not os.path.exists(config_path):
        print(f"Resend config file not found at {config_path}. Cannot send email.")
        return False
        
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            api_key = f.read().strip()
            
        if not api_key:
            print("Resend API key is empty.")
            return False
            
        url = "https://api.resend.com/emails"
        payload = {
            "from": "1997 Premium Laundry <hi@1997laundry.com>",
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        
        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=5.0) as response:
            res_body = response.read().decode('utf-8')
            res_data = json.loads(res_body)
            print(f"Email sent successfully to {to_email}: {res_data}")
            return True
    except Exception as e:
        print(f"Failed to send email via Resend to {to_email}: {e}")
        return False

# --- Email Sequence Templates ---
EMAIL_1_SUBJECT = "Welcome to 1997 Premium Laundry! 🧼"
EMAIL_1_HTML = """
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://1997laundry.com/logo.png" alt="1997 Premium Laundry" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Thank you for sharing your laundry preferences with us!</p>
  <p>Welcome to 1997 Premium Laundry, a premium laundry service designed specifically for travelers and hotel guests in Ho Chi Minh City. Our mission is simple: to make your stay completely hassle-free by taking care of your laundry with the highest standards of hygiene and reliability.</p>
  
  <p>We have saved your preferences. When you are ready to get your laundry done, here is what you can look forward to:</p>
  <ul>
    <li><strong>100% Separate Wash</strong>: We guarantee your clothes are washed separately in dedicated machines. We never mix garments of different customers, ensuring absolute hygiene.</li>
    <li><strong>Checkout Guarantee</strong>: We are the only laundry service in Saigon that guarantees to deliver your clean clothes back to your hotel before your checkout time. No stress about missing flights.</li>
  </ul>
  
  <p>Keep an eye on your inbox—over the next few days, we'll share a few travel hacks to help you avoid common laundry traps in Saigon.</p>
  <p>Welcome to 1997 Laundry!</p>
  <p>Best regards,<br><strong>The 1997 Premium Laundry Team</strong><br><a href="https://1997laundry.com" style="color: #041d40; text-decoration: none;">1997laundry.com</a></p>
</div>
"""

EMAIL_2_SUBJECT = "Travel Hack: How to save space and laundry fees in Saigon ✈️"
EMAIL_2_HTML = """
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://1997laundry.com/logo.png" alt="1997 Premium Laundry" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Here is a quick tip to make your stay in Saigon easier: try packing light. Carrying heavy bags through Ho Chi Minh City's busy streets is no fun. Packing light is easy if you wash your clothes on-the-go.</p>
  <p>However, keep these two things in mind when washing clothes in Saigon:</p>
  <ol>
    <li><strong>Hotel Laundry</strong>: It is convenient, but hotels usually charge <em>per piece</em>, which quickly adds up and can double your budget.</li>
    <li><strong>Street Laundry</strong>: While very cheap, they often mix garments from multiple customers to save costs. This compromises hygiene.</li>
  </ol>
  <p>At 1997 Premium Laundry, we wash each customer's clothes 100% separately to ensure absolute cleanliness, and we coordinate directly with your hotel front desk for drop-off and pickup. You get your clothes back same-day without any hassle.</p>
  <p>Have a wonderful trip in Vietnam!</p>
  <p>Best regards,<br><strong>The 1997 Premium Laundry Team</strong><br><a href="https://1997laundry.com" style="color: #041d40; text-decoration: none;">1997laundry.com</a></p>
</div>
"""

EMAIL_3_SUBJECT = "Get your laundry done in Saigon (Same-day & Express delivery) ⚡"
EMAIL_3_HTML = """
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://1997laundry.com/logo.png" alt="1997 Premium Laundry" style="max-width: 150px;">
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
  <p><strong>Why choose 1997 Premium Laundry?</strong></p>
  <ul>
    <li><strong>Checkout Guarantee</strong>: We promise to return your laundry before your hotel checkout time so you can catch your flight.</li>
    <li><strong>100% Separate Wash</strong>: We wash every order individually—never mixed with others.</li>
  </ul>
  <p>Book your slot now and pay securely online:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://1997laundry.com/booking.html" style="background-color: #ff66c5; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Book Now & Pay</a>
  </p>
  <p>Best regards,<br><strong>The 1997 Premium Laundry Team</strong><br><a href="https://1997laundry.com" style="color: #041d40; text-decoration: none;">1997laundry.com</a></p>
</div>
"""

def trigger_email_sequence(name, email, service_name="Laundry Service", amount_val=0, hotel_address="-", room_number="-"):
    if not email:
        return
        
    formatted_amount = f"{float(amount_val):,.0f}".replace(",", ".") if amount_val else "0"
    
    # Send Email 1 immediately
    send_email_via_resend(email, EMAIL_1_SUBJECT, EMAIL_1_HTML.format(
        name=name,
        service=service_name,
        amount=formatted_amount,
        hotel=hotel_address,
        room=room_number
    ))
    
    # Check if test mode is active (+test in email)
    if "+test" in email.lower():
        print(f"Test mode active for {email}. Sending Email 2 and 3 immediately.")
        time.sleep(2)
        send_email_via_resend(email, EMAIL_2_SUBJECT, EMAIL_2_HTML.format(name=name))
        time.sleep(2)
        send_email_via_resend(email, EMAIL_3_SUBJECT, EMAIL_3_HTML.format(name=name))
        return
        
    # Schedule Email 2 and 3 in a daemon background thread
    def email_worker():
        # Wait 2 days (48 hours)
        time.sleep(2 * 24 * 3600)
        send_email_via_resend(email, EMAIL_2_SUBJECT, EMAIL_2_HTML.format(name=name))
        
        # Wait 1 day (24 hours)
        time.sleep(1 * 24 * 3600)
        send_email_via_resend(email, EMAIL_3_SUBJECT, EMAIL_3_HTML.format(name=name))
        
    threading.Thread(target=email_worker, daemon=True).start()

# --- Order Confirmation Email Template ---
ORDER_CONFIRMATION_HTML = """
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://1997laundry.com/logo.png" alt="1997 Premium Laundry" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Thank you for choosing 1997 Premium Laundry! Your order <strong>#{booking_code}</strong> has been successfully created and is being processed.</p>
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
  <p>Best regards,<br><strong>The 1997 Premium Laundry Team</strong><br><a href="https://1997laundry.com" style="color: #041d40; text-decoration: none;">1997laundry.com</a></p>
</div>
"""

ORDER_COMPLETED_SUBJECT = "Payment Confirmed & Thank you! - 1997 Premium Laundry 🌸"
ORDER_COMPLETED_HTML = """
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://1997laundry.com/logo.png" alt="1997 Premium Laundry" style="max-width: 150px;">
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
  <p>Best regards,<br><strong>The 1997 Premium Laundry Team</strong><br><a href="https://1997laundry.com" style="color: #041d40; text-decoration: none;">1997laundry.com</a></p>
</div>
"""

def send_booking_confirmation(name, email, service_name, amount_val, booking_code, hotel_address="-", room_number="-"):
    if not email:
        return
    formatted_amount = f"{float(amount_val):,.0f}".replace(",", ".") if amount_val else "0"
    html_content = ORDER_CONFIRMATION_HTML.format(
        name=name,
        product_name=service_name,
        amount=formatted_amount,
        hotel=hotel_address,
        room=room_number,
        booking_code=booking_code
    )
    subject = f"Booking Confirmation #{booking_code} - 1997 Premium Laundry 🛎️"
    send_email_via_resend(email, subject, html_content)

def send_payment_confirmation(name, email, service_name, amount_val, booking_code):
    if not email:
        return
    formatted_amount = f"{float(amount_val):,.0f}".replace(",", ".") if amount_val else "0"
    html_content = ORDER_COMPLETED_HTML.format(
        name=name,
        product_name=service_name,
        amount=formatted_amount,
        booking_code=booking_code
    )
    send_email_via_resend(email, ORDER_COMPLETED_SUBJECT, html_content)

class AdminAPIRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow CORS for development if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Redirect /admin or /admin/ directly to serve the admin index page
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        if path == "/admin" or path == "/admin/":
            self.path = "/admin/index.html"
            return super().do_GET()

        # Handle api.php routing for backward compatibility with frontend
        if path == "/api.php":
            query = urllib.parse.parse_qs(parsed_url.query)
            action = query.get("action", [None])[0]
            if action in ["products", "customers", "orders"]:
                self.path = f"/api/{action}"
                self.handle_api_get()
                return
            else:
                self.send_error(404, f"Action {action} not supported in GET")
                return

        # API Endpoints routing
        if path.startswith("/api/"):
            self.handle_api_get()
        else:
            super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        if path == "/api.php":
            query = urllib.parse.parse_qs(parsed_url.query)
            action = query.get("action", [None])[0]
            
            if action == "save-product":
                self.path = "/api/products"
                body = self.get_request_body()
                if body.get("id"):
                    self.handle_api_put()
                else:
                    self.handle_api_post()
                return
            elif action == "save-customer":
                self.path = "/api/customers"
                body = self.get_request_body()
                if body.get("id"):
                    self.handle_api_put()
                else:
                    self.handle_api_post()
                return
            elif action == "save-order":
                self.path = "/api/orders"
                body = self.get_request_body()
                item_id = body.get("id") or body.get("bookingCode")
                if item_id:
                    self.handle_api_put()
                else:
                    self.handle_api_post()
                return
            elif action == "delete":
                body = self.get_request_body()
                target_type = body.get("type")
                if target_type in ["orders", "customers", "products"]:
                    self.path = f"/api/{target_type}"
                    self.handle_api_delete()
                else:
                    self.send_error(400, "Invalid delete type")
                return
            elif action == "booking":
                self.handle_api_booking()
                return
            elif action == "survey":
                self.handle_api_survey()
                return
            elif action == "update-order":
                self.path = "/api/orders"
                self.handle_api_put()
                return
            elif action == "sepay-webhook":
                self.handle_sepay_webhook()
                return
            else:
                self.send_error(404, f"Action {action} not supported in POST")
                return

        if path.startswith("/api/"):
            self.handle_api_post()
        else:
            self.send_error(404, "Not Found")

    def do_PUT(self):
        path = urllib.parse.urlparse(self.path).path
        if path.startswith("/api/"):
            self.handle_api_put()
        else:
            self.send_error(404, "Not Found")

    def do_DELETE(self):
        path = urllib.parse.urlparse(self.path).path
        if path.startswith("/api/"):
            self.handle_api_delete()
        else:
            self.send_error(404, "Not Found")

    # --- Database Helpers ---
    
    def get_db_connection(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def get_request_body(self):
        if hasattr(self, "_cached_body"):
            return self._cached_body
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            self._cached_body = {}
            return self._cached_body
        body = self.rfile.read(content_length)
        content_type = self.headers.get('Content-Type', '')
        if 'application/x-www-form-urlencoded' in content_type:
            parsed = urllib.parse.parse_qs(body.decode("utf-8"))
            # convert from list of values to single values
            self._cached_body = {k: v[0] for k, v in parsed.items()}
        else:
            try:
                self._cached_body = json.loads(body.decode("utf-8"))
            except Exception:
                self._cached_body = {}
        return self._cached_body

    # --- API Implementation Methods ---

    def handle_api_get(self):
        path = urllib.parse.urlparse(self.path).path
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            if path == "/api/products":
                cursor.execute("SELECT * FROM products ORDER BY id DESC")
                products = [dict(row) for row in cursor.fetchall()]
                self.send_json_response(products)
            elif path == "/api/customers":
                try:
                    url = "https://hoangoanh.app.n8n.cloud/webhook/admin-customers"
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=3.0) as response:
                        customers = json.loads(response.read().decode('utf-8'))
                        if isinstance(customers, dict):
                            customers = [customers]
                        
                        # Merge with SQLite local database customers (prepend local SQLite customers to show them first)
                        cursor.execute("SELECT * FROM customers ORDER BY id DESC")
                        db_custs = [dict(row) for row in cursor.fetchall()]
                        seen_phones = {}
                        merged = []
                        
                        # Add local SQLite customers first to prepend them
                        for c in db_custs:
                            phone = c.get("phone") or ""
                            phone_clean = "".join(filter(str.isdigit, str(phone)))
                            d = {
                                "id": c.get("id"),
                                "ID Khách hàng": c.get("id"),
                                "name": c.get("name"),
                                "Tên khách hàng": c.get("name"),
                                "phone": c.get("phone"),
                                "Số điện thoại / Zalo / WA": c.get("phone"),
                                "email": c.get("email"),
                                "Email": c.get("email"),
                                "hotel": c.get("hotel"),
                                "Địa chỉ khách sạn": c.get("hotel"),
                                "room": c.get("room"),
                                "Số phòng": c.get("room"),
                                "registration_date": c.get("registration_date"),
                                "Ngày đăng ký": c.get("registration_date")
                            }
                            merged.append(d)
                            if phone_clean:
                                seen_phones[phone_clean] = d
                                
                        # Append n8n customers if not already present
                        for c in customers:
                            phone = c.get("phone") or c.get("Số điện thoại / Zalo / WA") or c.get("C") or ""
                            phone_clean = "".join(filter(str.isdigit, str(phone)))
                            if phone_clean in seen_phones:
                                n8n_c = seen_phones[phone_clean]
                                for k, v in c.items():
                                    if k not in n8n_c or not n8n_c[k]:
                                        n8n_c[k] = v
                            else:
                                merged.append(c)
                                if phone_clean:
                                    seen_phones[phone_clean] = c
                        self.send_json_response(merged)
                except Exception as e:
                    print(f"n8n get customers failed: {e}. Falling back to SQLite.")
                    cursor.execute("SELECT * FROM customers ORDER BY id DESC")
                    customers = [dict(row) for row in cursor.fetchall()]
                    self.send_json_response(customers)
            elif path == "/api/orders":
                try:
                    url = "https://hoangoanh.app.n8n.cloud/webhook/admin-orders"
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=3.0) as response:
                        orders = json.loads(response.read().decode('utf-8'))
                        if isinstance(orders, dict):
                            orders = [orders]
                        
                        # Fetch SQLite local database orders
                        cursor.execute("""
                            SELECT o.*, c.name as customer_name, c.phone as phone, c.email as email, c.hotel as hotel, c.room as room, p.name as product_name, p.type as product_type
                            FROM orders o
                            LEFT JOIN customers c ON o.customer_id = c.id
                            LEFT JOIN products p ON o.product_id = p.id
                            ORDER BY o.id DESC
                        """)
                        db_orders = []
                        for row in cursor.fetchall():
                            d = dict(row)
                            if d.get("booking_code"):
                                d["id"] = d["booking_code"]
                                d["Mã đặt lịch"] = d["booking_code"]
                                d["Tên khách sạn & Địa chỉ"] = d.get("hotel") or ""
                                d["Số phòng"] = d.get("room") or ""
                                d["SĐT liên hệ (ID Khách)"] = d.get("phone") or ""
                                d["Thời gian nhận"] = d.get("order_date") or ""
                                d["Gói giặt"] = d.get("product_name") or ""
                                d["Tổng tiền bill tạm tính"] = d.get("amount") or 0
                                d["Trạng thái đơn"] = d.get("status") or "Chờ XN"
                                d["email"] = d.get("email") or ""
                            db_orders.append(d)
                            
                        # Merge lists by booking code / ID to avoid duplicates (prepend SQLite orders to show them first)
                        seen_codes = set()
                        merged_orders = []
                        
                        # Add local SQLite orders first
                        for o in db_orders:
                            code = o.get("id") or o.get("Mã đặt lịch") or o.get("booking_code") or ""
                            code_str = str(code).strip().upper()
                            if code_str not in seen_codes:
                                merged_orders.append(o)
                                if code_str:
                                    seen_codes.add(code_str)
                                    
                        # Append n8n orders
                        for o in orders:
                            code = o.get("id") or o.get("Mã đặt lịch") or o.get("booking_code") or ""
                            code_str = str(code).strip().upper()
                            if code_str not in seen_codes:
                                merged_orders.append(o)
                                if code_str:
                                    seen_codes.add(code_str)
                        self.send_json_response(merged_orders)
                except Exception as e:
                    print(f"n8n get orders failed: {e}. Falling back to SQLite.")
                    cursor.execute("""
                        SELECT o.*, c.name as customer_name, c.phone as phone, c.email as email, c.hotel as hotel, c.room as room, p.name as product_name, p.type as product_type
                        FROM orders o
                        LEFT JOIN customers c ON o.customer_id = c.id
                        LEFT JOIN products p ON o.product_id = p.id
                        ORDER BY o.id DESC
                    """)
                    orders = []
                    for row in cursor.fetchall():
                        d = dict(row)
                        if d.get("booking_code"):
                            d["id"] = d["booking_code"]
                            d["Mã đặt lịch"] = d["booking_code"]
                            d["Tên khách sạn & Địa chỉ"] = d.get("hotel") or ""
                            d["Số phòng"] = d.get("room") or ""
                            d["SĐT liên hệ (ID Khách)"] = d.get("phone") or ""
                            d["Thời gian nhận"] = d.get("order_date") or ""
                            d["Gói giặt"] = d.get("product_name") or ""
                            d["Tổng tiền bill tạm tính"] = d.get("amount") or 0
                            d["Trạng thái đơn"] = d.get("status") or "Chờ XN"
                            d["email"] = d.get("email") or ""
                        orders.append(d)
                    self.send_json_response(orders)
            else:
                self.send_error(404, "API Endpoint not found")
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
        finally:
            conn.close()

    def handle_api_post(self):
        path = urllib.parse.urlparse(self.path).path
        body = self.get_request_body()
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            if path == "/api/products":
                cursor.execute("""
                    INSERT INTO products (name, type, price, description, stock_quantity)
                    VALUES (?, ?, ?, ?, ?)
                """, (body.get("name"), body.get("type"), body.get("price"), body.get("description"), body.get("stock_quantity")))
                conn.commit()
                self.send_json_response({"success": True, "id": cursor.lastrowid})
                
            elif path == "/api/customers":
                cursor.execute("""
                    INSERT INTO customers (name, phone, zalo, email, hotel, room, registration_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (body.get("name"), body.get("phone"), body.get("zalo"), body.get("email"), body.get("hotel"), body.get("room"), body.get("registration_date")))
                conn.commit()
                self.send_json_response({"success": True, "id": cursor.lastrowid})
                
            elif path == "/api/orders":
                product_id = body.get("product_id")
                # Retrieve product type and current stock
                cursor.execute("SELECT type, stock_quantity FROM products WHERE id = ?", (product_id,))
                prod = cursor.fetchone()
                
                if not prod:
                    self.send_json_response({"error": "Product not found"}, 400)
                    return
                
                prod_type = prod["type"]
                stock_qty = prod["stock_quantity"]
                
                # Automatically decrement stock only if it is a physical product
                if prod_type == "physical":
                    if stock_qty is None or stock_qty <= 0:
                        self.send_json_response({"error": "Sản phẩm vật lý đã hết hàng (Out of stock)!"}, 400)
                        return
                    # Decrement by 1
                    cursor.execute("UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = ?", (product_id,))
                
                # Create the order
                booking_code = body.get("booking_code") or body.get("bookingCode") or ('NF' + str(int(time.time()))[-4:])
                cursor.execute("""
                    INSERT INTO orders (booking_code, customer_id, product_id, amount, status, order_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (booking_code, body.get("customer_id"), product_id, body.get("amount"), body.get("status") or "pending", body.get("order_date")))
                conn.commit()
                order_id = cursor.lastrowid
                
                # Fetch customer email & name and product name to send confirmation email
                cursor.execute("SELECT name, email FROM customers WHERE id = ?", (body.get("customer_id"),))
                cust = cursor.fetchone()
                if cust and cust["email"]:
                    cust_name = cust["name"]
                    cust_email = cust["email"]
                    
                    cursor.execute("SELECT name FROM products WHERE id = ?", (product_id,))
                    prod_row = cursor.fetchone()
                    prod_name = prod_row["name"] if prod_row else "Laundry Service"
                    
                    formatted_amount = f"{float(body.get('amount', 0)):,.0f}".replace(",", ".")
                    
                    # Send booking confirmation email in a background thread to prevent API delay
                    threading.Thread(
                        target=send_booking_confirmation,
                        args=(cust_name, cust_email, prod_name, body.get("amount", 0), booking_code),
                        daemon=True
                    ).start()
                
                self.send_json_response({"success": True, "id": order_id})
            else:
                self.send_error(404, "API Endpoint not found")
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
        finally:
            conn.close()

    def handle_api_put(self):
        path = urllib.parse.urlparse(self.path).path
        body = self.get_request_body()
        item_id = body.get("id") or body.get("bookingCode") or body.get("booking_code")
        
        if not item_id:
            self.send_json_response({"error": "Missing item ID"}, 400)
            return

        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            if path == "/api/products":
                cursor.execute("""
                    UPDATE products 
                    SET name = ?, type = ?, price = ?, description = ?, stock_quantity = ?
                    WHERE id = ?
                """, (body.get("name"), body.get("type"), body.get("price"), body.get("description"), body.get("stock_quantity"), item_id))
                conn.commit()
                self.send_json_response({"success": True})
                
            elif path == "/api/customers":
                cursor.execute("""
                    UPDATE customers 
                    SET name = ?, phone = ?, zalo = ?, email = ?, hotel = ?, room = ?, registration_date = ?
                    WHERE id = ?
                """, (body.get("name"), body.get("phone"), body.get("zalo"), body.get("email"), body.get("hotel"), body.get("room"), body.get("registration_date"), item_id))
                conn.commit()
                self.send_json_response({"success": True})
                
            elif path == "/api/orders":
                n8n_success = False
                n8n_error = ""
                
                try:
                    url = "https://hoangoanh.app.n8n.cloud/webhook/update-order"
                    payload = {
                        "bookingCode": str(item_id),
                        "amount": body.get("amount"),
                        "status": body.get("status")
                    }
                    data_bytes = json.dumps(payload).encode('utf-8')
                    req = urllib.request.Request(
                        url, 
                        data=data_bytes, 
                        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
                        method='POST'
                    )
                    with urllib.request.urlopen(req, timeout=3.0) as response:
                        if response.status in (200, 201):
                            n8n_success = True
                except Exception as e:
                    n8n_error = str(e)
                    print(f"n8n update order failed: {e}. Falling back to SQLite.")

                try:
                    # Fetch old status, product name and customer details first
                    cursor.execute("""
                        SELECT o.status, o.booking_code, o.amount, p.name as product_name, c.name as cust_name, c.email as cust_email
                        FROM orders o
                        LEFT JOIN products p ON o.product_id = p.id
                        LEFT JOIN customers c ON o.customer_id = c.id
                        WHERE o.id = ? OR o.booking_code = ?
                    """, (item_id, item_id))
                    old_order = cursor.fetchone()

                    # If it's a local database ID (integer), update SQLite too
                    if str(item_id).isdigit():
                        cursor.execute("""
                            UPDATE orders 
                            SET amount = ?, status = ?
                            WHERE id = ?
                        """, (body.get("amount"), body.get("status"), int(item_id)))
                    else:
                        cursor.execute("""
                            UPDATE orders 
                            SET amount = ?, status = ?
                            WHERE booking_code = ?
                        """, (body.get("amount"), body.get("status"), item_id))
                    conn.commit()

                    # Send payment confirmation if status changed to completed
                    if old_order and old_order["status"] != "Hoàn thành" and body.get("status") == "Hoàn thành":
                        if old_order["cust_email"]:
                            b_code = old_order["booking_code"] or item_id
                            threading.Thread(
                                target=send_payment_confirmation,
                                args=(old_order["cust_name"], old_order["cust_email"], old_order["product_name"], body.get("amount") or old_order["amount"], b_code),
                                daemon=True
                            ).start()

                    self.send_json_response({"success": True, "n8n_sync": n8n_success, "n8n_error": n8n_error})
                except Exception as db_err:
                    if n8n_success:
                        self.send_json_response({"success": True, "n8n_sync": True})
                    else:
                        raise db_err
            else:
                self.send_error(404, "API Endpoint not found")
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
        finally:
            conn.close()

    def handle_api_delete(self):
        path = urllib.parse.urlparse(self.path).path
        body = self.get_request_body()
        item_id = body.get("id")
        
        if not item_id:
            self.send_json_response({"error": "Missing item ID"}, 400)
            return

        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            if path == "/api/products":
                cursor.execute("DELETE FROM products WHERE id = ?", (item_id,))
                conn.commit()
                self.send_json_response({"success": True})
            elif path == "/api/customers":
                cursor.execute("DELETE FROM customers WHERE id = ?", (item_id,))
                conn.commit()
                self.send_json_response({"success": True})
            elif path == "/api/orders":
                cursor.execute("DELETE FROM orders WHERE id = ?", (item_id,))
                conn.commit()
                self.send_json_response({"success": True})
            else:
                self.send_error(404, "API Endpoint not found")
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
        finally:
            conn.close()

    def handle_api_booking(self):
        body = self.get_request_body()
        conn = self.get_db_connection()
        cursor = conn.cursor()
        try:
            name = body.get("name", "Khách vãng lai")
            phone = body.get("phone", "")
            email = body.get("email", "")
            hotel = body.get("hotelAddress", "")
            room = body.get("roomNumber", "")
            service = body.get("service", "")
            amount = body.get("totalVnd", 0)
            booking_code = body.get("bookingCode", "")
            
            # Check if customer exists based on phone
            cursor.execute("SELECT id FROM customers WHERE phone = ?", (phone,))
            row = cursor.fetchone()
            if row:
                customer_id = row["id"]
                # Update details if changed
                cursor.execute("""
                    UPDATE customers 
                    SET name = ?, email = ?, hotel = ?, room = ?
                    WHERE id = ?
                """, (name, email, hotel, room, customer_id))
            else:
                cursor.execute("""
                    INSERT INTO customers (name, phone, email, hotel, room)
                    VALUES (?, ?, ?, ?, ?)
                """, (name, phone, email, hotel, room))
                customer_id = cursor.lastrowid
            
            # Find product_id by matching name
            # e.g. service can be 'Standard Wash & Fold (24h)' or 'standard'
            # We match using standard keywords or clean the service name
            service_clean = service.lower()
            product_id = 1 # default standard
            if "same-day" in service_clean or "sameday" in service_clean:
                product_id = 2
            elif "express" in service_clean:
                product_id = 3
            elif "shoe" in service_clean:
                product_id = 4
            elif "topper" in service_clean:
                product_id = 5
            elif "curtain" in service_clean:
                product_id = 6
            elif "bedding" in service_clean or "linen" in service_clean:
                product_id = 7
            else:
                cursor.execute("SELECT id FROM products WHERE name LIKE ?", (f"%{service}%",))
                prod_row = cursor.fetchone()
                if prod_row:
                    product_id = prod_row["id"]
                
            cursor.execute("""
                INSERT INTO orders (booking_code, customer_id, product_id, amount, status)
                VALUES (?, ?, ?, ?, 'Chờ XN')
            """, (booking_code, customer_id, product_id, amount))
            
            conn.commit()
            
            # Trigger booking confirmation email
            send_booking_confirmation(name, email, service, amount, booking_code, hotel, room)
            
            self.send_json_response({"success": True, "bookingCode": booking_code})
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
        finally:
            conn.close()

    def handle_api_survey(self):
        body = self.get_request_body()
        conn = self.get_db_connection()
        cursor = conn.cursor()
        try:
            name = body.get('entry.978937613') or body.get('entry_978937613') or 'Guest'
            phone = body.get('entry.1507224408') or body.get('entry_1507224408') or ''
            email = body.get('entry.564072479') or body.get('entry_564072479') or ''
            service = body.get('entry.1411190461') or body.get('entry_1411190461') or 'Laundry Service'
            pickup = body.get('entry.1151563479') or body.get('entry_1151563479') or 'Pickup'

            # Forward to Google Forms in the background
            google_form_url = "https://docs.google.com/forms/d/e/1FAIpQLSfMTQAoppyHdDGNcGGiDWDI3Gonl6t1WkcbdlMQseX7ORg31g/formResponse"
            try:
                req_data = urllib.parse.urlencode(body).encode('utf-8')
                req = urllib.request.Request(
                    google_form_url,
                    data=req_data,
                    headers={'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0'}
                )
                urllib.request.urlopen(req, timeout=3.0)
            except Exception as e:
                print(f"Google Forms forward error: {e}")

            # Save to SQLite
            if phone:
                cursor.execute("SELECT id FROM customers WHERE phone = ?", (phone,))
                row = cursor.fetchone()
                if row:
                    cursor.execute("UPDATE customers SET name = ?, email = ? WHERE phone = ?", (name, email, phone))
                else:
                    cursor.execute("INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)", (name, phone, email))
                conn.commit()

            # Trigger email sequence in a background thread
            if email:
                threading.Thread(
                    target=trigger_email_sequence,
                    args=(name, email, service, 0, pickup, '-'),
                    daemon=True
                ).start()

            self.send_json_response({"success": True})
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
        finally:
            conn.close()

    def handle_sepay_webhook(self):
        body = self.get_request_body()
        content = body.get("content", "")
        
        if not content:
            content = body.get("description", "")
            
        if not content:
            self.send_json_response({"success": False, "message": "No transfer content found"})
            return
            
        import re
        match = re.search(r'(NF\d{4})', content, re.IGNORECASE)
        if not match:
            self.send_json_response({"success": False, "message": "Could not match booking code in content"})
            return
            
        booking_code = match.group(1).upper()
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        try:
            # Check previous status and get order details
            cursor.execute("""
                SELECT o.status, o.booking_code, o.amount, p.name as product_name, c.name as cust_name, c.email as cust_email
                FROM orders o
                LEFT JOIN products p ON o.product_id = p.id
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.id = ? OR o.booking_code = ?
            """, (booking_code, booking_code))
            old_order = cursor.fetchone()

            cursor.execute("UPDATE orders SET status = 'Hoàn thành' WHERE id = ? OR booking_code = ?", (booking_code, booking_code))
            conn.commit()

            if old_order and old_order["status"] != "Hoàn thành":
                if old_order["cust_email"]:
                    threading.Thread(
                        target=send_payment_confirmation,
                        args=(old_order["cust_name"], old_order["cust_email"], old_order["product_name"], old_order["amount"], old_order["booking_code"] or booking_code),
                        daemon=True
                    ).start()

            self.send_json_response({"success": True, "message": f"Order {booking_code} completed"})
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
        finally:
            conn.close()

def initialize_and_migrate_db():
    print("Checking and migrating database schema in brain.db...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # Check current columns in orders table
        cursor.execute("PRAGMA table_info(orders);")
        columns = [row[1] for row in cursor.fetchall()]
        
        new_cols = {
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
        }
        
        for col_name, col_type in new_cols.items():
            if col_name not in columns:
                print(f"Adding column {col_name} to orders table...")
                cursor.execute(f"ALTER TABLE orders ADD COLUMN {col_name} {col_type};")
        
        conn.commit()
        print("Database schema is up to date.")
    except Exception as e:
        print(f"Database migration failed: {e}")
    finally:
        conn.close()

def run(server_class=HTTPServer, handler_class=AdminAPIRequestHandler):
    initialize_and_migrate_db()
    server_address = ('', PORT)
    httpd = server_class(server_address, handler_class)
    print(f"Starting Python HTTP Server on port {PORT}...")
    print(f"To open: http://localhost:{PORT}/admin")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run()
