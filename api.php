<?php
ignore_user_abort(true);
set_time_limit(120);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json");

// --- Resend Email Templates and Helpers ---

define('EMAIL_1_SUBJECT', 'Welcome to 1997 Premium Laundry! 🧼');
define('EMAIL_1_HTML', '
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
  
  <p>Keep an eye on your inbox—over the next few days, we\'ll share a few travel hacks to help you avoid common laundry traps in Saigon.</p>
  <p>Welcome to 1997 Laundry!</p>
  <p>Best regards,<br><strong>The 1997 Premium Laundry Team</strong><br><a href="https://1997laundry.com" style="color: #041d40; text-decoration: none;">1997laundry.com</a></p>
</div>
');

define('EMAIL_2_SUBJECT', 'Travel Hack: How to save space and laundry fees in Saigon ✈️');
define('EMAIL_2_HTML', '
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://1997laundry.com/logo.png" alt="1997 Premium Laundry" style="max-width: 150px;">
  </div>
  <p>Hi {name},</p>
  <p>Here is a quick tip to make your stay in Saigon easier: try packing light. Carrying heavy bags through Ho Chi Minh City\'s busy streets is no fun. Packing light is easy if you wash your clothes on-the-go.</p>
  <p>However, keep these two things in mind when washing clothes in Saigon:</p>
  <ol>
    <li><strong>Hotel Laundry</strong>: It is convenient, but hotels usually charge <em>per piece</em>, which quickly adds up and can double your budget.</li>
    <li><strong>Street Laundry</strong>: While very cheap, they often mix garments from multiple customers to save costs. This compromises hygiene.</li>
  </ol>
  <p>At 1997 Premium Laundry, we wash each customer\'s clothes 100% separately to ensure absolute cleanliness, and we coordinate directly with your hotel front desk for drop-off and pickup. You get your clothes back same-day without any hassle.</p>
  <p>Have a wonderful trip in Vietnam!</p>
  <p>Best regards,<br><strong>The 1997 Premium Laundry Team</strong><br><a href="https://1997laundry.com" style="color: #041d40; text-decoration: none;">1997laundry.com</a></p>
</div>
');

define('EMAIL_3_SUBJECT', 'Get your laundry done in Saigon (Same-day & Express delivery) ⚡');
define('EMAIL_3_HTML', '
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
');

define('ORDER_CONFIRMATION_HTML', '
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
');

define('ORDER_COMPLETED_SUBJECT', 'Payment Confirmed & Thank you! - 1997 Premium Laundry 🌸');
define('ORDER_COMPLETED_HTML', '
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
');

function send_email_via_resend($to_email, $subject, $html_content) {
    $api_key = ""; // Stored securely in .env or resend_config.txt
    
    // Load from .env if exists
    $env_file = __DIR__ . "/.env";
    if (file_exists($env_file)) {
        $env_lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($env_lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);
                if ($name === 'RESEND_API_KEY') {
                    $api_key = $value;
                    break;
                }
            }
        }
    }
    
    // Fallback to resend_config.txt if .env did not set the key
    if (empty($api_key)) {
        $resend_key_file = __DIR__ . "/resend_config.txt";
        if (file_exists($resend_key_file)) {
            $file_key = trim(file_get_contents($resend_key_file));
            if (!empty($file_key)) {
                $api_key = $file_key;
            }
        }
    }

    $ch = curl_init("https://api.resend.com/emails");
    $payload = json_encode([
        "from" => "1997 Premium Laundry <hi@1997laundry.com>",
        "to" => [$to_email],
        "subject" => $subject,
        "html" => $html_content
    ]);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . $api_key,
        "Content-Type: application/json",
        "User-Agent: Mozilla/5.0"
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    // Log the API response for easy debugging
    $log_line = date('Y-m-d H:i:s') . " | To: $to_email | Subject: $subject | HTTP Code: $http_code | Error: $curl_error | Response: $response\n";
    @file_put_contents(__DIR__ . "/email_log.txt", $log_line, FILE_APPEND);

    return $http_code >= 200 && $http_code < 300;
}

function trigger_email_sequence($name, $email, $service_name = "Laundry Service", $amount_val = 0, $hotel_address = "-", $room_number = "-") {
    if (empty($email)) {
        return;
    }

    $formatted_amount = $amount_val ? number_format(floatval($amount_val), 0, '.', '.') : "0";

    // Format Email 1 HTML
    $email_1_content = str_replace(
        ["{name}", "{service}", "{amount}", "{hotel}", "{room}"],
        [$name, $service_name, $formatted_amount, $hotel_address, $room_number],
        EMAIL_1_HTML
    );

    // Send Email 1 immediately
    send_email_via_resend($email, EMAIL_1_SUBJECT, $email_1_content);

    // If test mode is active (+test in email)
    if (strpos(strtolower($email), "+test") !== false) {
        sleep(3);
        $email_2_content = str_replace("{name}", $name, EMAIL_2_HTML);
        send_email_via_resend($email, EMAIL_2_SUBJECT, $email_2_content);
        sleep(3);
        $email_3_content = str_replace("{name}", $name, EMAIL_3_HTML);
        send_email_via_resend($email, EMAIL_3_SUBJECT, $email_3_content);
    }
}

function send_booking_confirmation($name, $email, $service_name, $amount_val, $booking_code, $hotel_address = "-", $room_number = "-") {
    if (empty($email)) return;
    $formatted_amount = number_format(floatval($amount_val), 0, '.', '.');
    $email_body = str_replace(
        ["{name}", "{product_name}", "{amount}", "{hotel}", "{room}", "{booking_code}"],
        [$name, $service_name, $formatted_amount, $hotel_address, $room_number, $booking_code],
        ORDER_CONFIRMATION_HTML
    );
    send_email_via_resend($email, "Booking Confirmation #$booking_code - 1997 Premium Laundry 🛎️", $email_body);
}

function send_payment_confirmation($name, $email, $service_name, $amount_val, $booking_code) {
    if (empty($email)) return;
    $formatted_amount = number_format(floatval($amount_val), 0, '.', '.');
    $email_body = str_replace(
        ["{name}", "{product_name}", "{amount}", "{booking_code}"],
        [$name, $service_name, $formatted_amount, $booking_code],
        ORDER_COMPLETED_HTML
    );
    send_email_via_resend($email, ORDER_COMPLETED_SUBJECT, $email_body);
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$ordersFile = __DIR__ . '/data_orders.json';
$customersFile = __DIR__ . '/data_customers.json';
$productsFile = __DIR__ . '/data_products.json';

// Initialize files if not exists
if (!file_exists($ordersFile)) {
    file_put_contents($ordersFile, json_encode([], JSON_PRETTY_PRINT));
}
if (!file_exists($customersFile)) {
    file_put_contents($customersFile, json_encode([], JSON_PRETTY_PRINT));
}
if (!file_exists($productsFile)) {
    // Write default products list (matching booking form packages and prices)
    $defaultProducts = [
        ["id" => 1, "name" => "Standard Wash & Fold (24h)", "type" => "service", "price" => 40000, "description" => "Standard wash & fold laundry service. Min weight 3kg.", "stock_quantity" => null],
        ["id" => 2, "name" => "Same-day Wash & Fold (8h-12h)", "type" => "service", "price" => 50000, "description" => "Same-day express wash & fold service. Min weight 4kg.", "stock_quantity" => null],
        ["id" => 3, "name" => "Express Wash & Fold (4h)", "type" => "service", "price" => 70000, "description" => "Super express wash & fold laundry service. Min weight 4kg.", "stock_quantity" => null],
        ["id" => 4, "name" => "Shoes Cleaning", "type" => "service", "price" => 150000, "description" => "Premium shoe cleaning and sanitization. Min 1 pair.", "stock_quantity" => null],
        ["id" => 5, "name" => "Topper Cleaning", "type" => "service", "price" => 60000, "description" => "Topper mattress cleaning service. Min weight 1kg.", "stock_quantity" => null],
        ["id" => 6, "name" => "Curtain Cleaning", "type" => "service", "price" => 50000, "description" => "Curtain cleaning service. Min weight 1kg.", "stock_quantity" => null],
        ["id" => 7, "name" => "Beddings & Linens", "type" => "service", "price" => 40000, "description" => "Bedding, sheet, and linen cleaning. Min weight 3kg.", "stock_quantity" => null]
    ];
    file_put_contents($productsFile, json_encode($defaultProducts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Helper to read JSON file
function readData($file) {
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

// Helper to write JSON file
function writeData($file, $data) {
    file_put_contents($file, json_encode(array_values($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Helper to get request body
function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

switch ($action) {
    case 'products':
        echo json_encode(readData($productsFile));
        break;

    case 'test-email':
        $to = isset($_GET['to']) ? $_GET['to'] : 'oanhtran.197@gmail.com';
        $res = send_email_via_resend($to, "PHP Resend Live Test", "<p>Testing Resend from PHP backend with SSL bypass.</p>");
        echo json_encode(["success" => $res, "message" => $res ? "Sent successfully!" : "Failed to send. Check email_log.txt for details."]);
        break;

    case 'customers':
        echo json_encode(readData($customersFile));
        break;

    case 'orders':
        echo json_encode(readData($ordersFile));
        break;

    case 'survey':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method Not Allowed"]);
            break;
        }

        $body = $_POST;

        // 1. Forward to Google Forms in the background
        $google_form_url = "https://docs.google.com/forms/d/e/1FAIpQLSfMTQAoppyHdDGNcGGiDWDI3Gonl6t1WkcbdlMQseX7ORg31g/formResponse";
        $ch = curl_init($google_form_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($body));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/x-www-form-urlencoded",
            "User-Agent: Mozilla/5.0"
        ]);
        curl_exec($ch);
        curl_close($ch);

        // 2. Extract survey details for emails
        $name = isset($body['entry_978937613']) ? $body['entry_978937613'] : (isset($body['entry.978937613']) ? $body['entry.978937613'] : 'Guest');
        $phone = isset($body['entry_1507224408']) ? $body['entry_1507224408'] : (isset($body['entry.1507224408']) ? $body['entry.1507224408'] : '');
        $email = isset($body['entry_564072479']) ? $body['entry_564072479'] : (isset($body['entry.564072479']) ? $body['entry.564072479'] : '');
        $service = isset($body['entry_1411190461']) ? $body['entry_1411190461'] : (isset($body['entry.1411190461']) ? $body['entry.1411190461'] : 'Laundry Service');
        $pickup = isset($body['entry_1151563479']) ? $body['entry_1151563479'] : (isset($body['entry.1151563479']) ? $body['entry.1151563479'] : 'Pickup');

        // Save customer to data_customers.json as well so their profile is saved in admin!
        $customers = readData($customersFile);
        $exists = false;
        foreach ($customers as &$c) {
            if ($c['phone'] === $phone) {
                if (!empty($email)) $c['email'] = $email;
                if (!empty($name)) $c['name'] = $name;
                $exists = true;
                break;
            }
        }
        if (!$exists && !empty($phone)) {
            $customers[] = [
                "id" => $phone,
                "name" => $name,
                "phone" => $phone,
                "email" => $email,
                "registration_date" => date('Y-m-d H:i:s')
            ];
        }
        writeData($customersFile, $customers);

        // 3. Trigger survey welcome email sequence (Reliable Delivery)
        if (strpos(strtolower($email), "+test") !== false) {
            // Send first email synchronously to guarantee delivery
            $formatted_amount = "0";
            $email_1_content = str_replace(
                ["{name}", "{service}", "{amount}", "{hotel}", "{room}"],
                [$name, $service, $formatted_amount, $pickup, "-"],
                EMAIL_1_HTML
            );
            send_email_via_resend($email, EMAIL_1_SUBJECT, $email_1_content);
            
            // Send Email 2 & 3 in background if FastCGI is available, otherwise synchronously
            // Send booking confirmation email synchronously to guarantee delivery on all hosting environments
        send_booking_confirmation($name, $email, $service, $totalVnd, $bookingCode, $hotelAddress, $roomNumber);

        echo json_encode(["success" => true, "bookingCode" => $bookingCode]);
        break;

    case 'booking':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method Not Allowed"]);
            break;
        }

        $body = getRequestBody();
        $orders = readData($ordersFile);
        $customers = readData($customersFile);

        $bookingCode = isset($body['bookingCode']) ? $body['bookingCode'] : 'NF' . rand(1000, 9999);
        $phone = isset($body['phone']) ? $body['phone'] : '';
        $name = isset($body['name']) ? $body['name'] : 'Khách vãng lai';

        // Check if customer exists by phone, if so update details, if not add
        $customerExists = false;
        foreach ($customers as &$c) {
            if ($c['phone'] == $phone || $c['id'] == $phone) {
                $c['name'] = $name;
                $c['email'] = isset($body['email']) ? $body['email'] : '';
                $c['hotel'] = isset($body['hotelAddress']) ? $body['hotelAddress'] : '';
                $c['room'] = isset($body['roomNumber']) ? $body['roomNumber'] : '';
                $customerExists = true;
                break;
            }
        }
        unset($c);

        if (!$customerExists && !empty($phone)) {
            $customers[] = [
                "id" => $phone,
                "name" => $name,
                "phone" => $phone,
                "email" => isset($body['email']) ? $body['email'] : '',
                "hotel" => isset($body['hotelAddress']) ? $body['hotelAddress'] : '',
                "room" => isset($body['roomNumber']) ? $body['roomNumber'] : '',
                "registration_date" => date('Y-m-d H:i:s')
            ];
        }
        writeData($customersFile, $customers);

        // Add the order
        $newOrder = [
            "id" => $bookingCode,
            "Mã đặt lịch" => $bookingCode,
            "SĐT liên hệ (ID Khách)" => $phone,
            "Tên khách hàng" => $name,
            "Tên khách sạn & Địa chỉ" => isset($body['hotelAddress']) ? $body['hotelAddress'] : '',
            "Số phòng" => isset($body['roomNumber']) ? $body['roomNumber'] : '',
            "Thời gian nhận" => isset($body['pickupTime']) ? $body['pickupTime'] : '',
            "Nhận tại lễ tân hay trực tiếp" => isset($body['pickupMethod']) ? $body['pickupMethod'] : '',
            "Gói giặt" => isset($body['service']) ? $body['service'] : '',
            "Có tách trắng không" => isset($body['separateWhites']) ? $body['separateWhites'] : 'No',
            "Trọng lượng (kg) / Số lượng" => "",
            "Phí vận chuyển" => isset($body['shipFee']) ? floatval($body['shipFee']) : 0,
            "Phụ phí" => isset($body['surcharge']) ? floatval($body['surcharge']) : 0,
            "Tổng tiền bill tạm tính" => isset($body['totalVnd']) ? floatval($body['totalVnd']) : 0,
            "Nguồn khách" => isset($body['referralSource']) ? $body['referralSource'] : 'Direct / Website',
            "Trạng thái đơn" => "Chờ XN",
            "Ngày tạo" => date('Y-m-d H:i:s')
        ];

        $orders[] = $newOrder;
        writeData($ordersFile, $orders);

        // Auto-generate/update the referral report file
        generate_referral_report();

        // Trigger order confirmation email
        $email = isset($body['email']) ? $body['email'] : '';
        $service = isset($body['service']) ? $body['service'] : '';
        $totalVnd = isset($body['totalVnd']) ? floatval($body['totalVnd']) : 0;
        $hotelAddress = isset($body['hotelAddress']) ? $body['hotelAddress'] : '';
        $roomNumber = isset($body['roomNumber']) ? $body['roomNumber'] : '';
        // Send booking confirmation email synchronously to guarantee delivery on all hosting environments
        send_booking_confirmation($name, $email, $service, $totalVnd, $bookingCode, $hotelAddress, $roomNumber);

        echo json_encode(["success" => true, "bookingCode" => $bookingCode]);
        break;

    case 'update-order':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method Not Allowed"]);
            break;
        }

        $body = getRequestBody();
        $bookingCode = isset($body['bookingCode']) ? $body['bookingCode'] : (isset($body['id']) ? $body['id'] : '');
        
        if (empty($bookingCode)) {
            echo json_encode(["error" => "Missing bookingCode or id"]);
            break;
        }

        $orders = readData($ordersFile);
        $updated = false;
        $statusChangedToCompleted = false;
        $targetOrder = null;

        foreach ($orders as &$o) {
            if ($o['id'] == $bookingCode || $o['Mã đặt lịch'] == $bookingCode) {
                $oldStatus = isset($o['Trạng thái đơn']) ? $o['Trạng thái đơn'] : '';
                if (isset($body['amount'])) {
                    $o['Tổng tiền bill tạm tính'] = floatval($body['amount']);
                }
                if (isset($body['status'])) {
                    $o['Trạng thái đơn'] = $body['status'];
                    if ($oldStatus !== 'Hoàn thành' && $body['status'] === 'Hoàn thành') {
                        $statusChangedToCompleted = true;
                    }
                }
                $updated = true;
                $targetOrder = $o;
                break;
            }
        }

        if ($updated) {
            writeData($ordersFile, $orders);

            if ($statusChangedToCompleted && $targetOrder) {
                $custPhone = $targetOrder['SĐT liên hệ (ID Khách)'];
                $custName = $targetOrder['Tên khách hàng'] ?: 'Guest';
                $custEmail = '';
                $customers = readData($customersFile);
                foreach ($customers as $c) {
                    if ($c['id'] == $custPhone || $c['phone'] == $custPhone) {
                        $custEmail = isset($c['email']) ? $c['email'] : '';
                        $custName = isset($c['name']) ? $c['name'] : 'Guest';
                        break;
                    }
                }
                if (!empty($custEmail)) {
                    $products = readData($productsFile);
                    $productName = 'Laundry Service';
                    foreach ($products as $p) {
                        if ($p['id'] == $targetOrder['Gói giặt'] || $p['name'] == $targetOrder['Gói giặt']) {
                            $productName = $p['name'];
                            break;
                        }
                    }
                    send_payment_confirmation($custName, $custEmail, $productName, $targetOrder['Tổng tiền bill tạm tính'], $targetOrder['id']);
                }
            }

            echo json_encode(["success" => true, "message" => "Order updated successfully"]);
        } else {
            echo json_encode(["error" => "Order not found"]);
        }
        break;

    case 'save-customer':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method Not Allowed"]);
            break;
        }

        $body = getRequestBody();
        $customers = readData($customersFile);
        $id = isset($body['id']) ? $body['id'] : '';

        $updated = false;
        foreach ($customers as &$c) {
            if ($c['id'] == $id) {
                if (isset($body['name'])) $c['name'] = $body['name'];
                if (isset($body['phone'])) $c['phone'] = $body['phone'];
                if (isset($body['email'])) $c['email'] = $body['email'];
                if (isset($body['hotel'])) $c['hotel'] = $body['hotel'];
                if (isset($body['room'])) $c['room'] = $body['room'];
                $updated = true;
                break;
            }
        }
        unset($c);

        if (!$updated && !empty($id)) {
            $customers[] = [
                "id" => $id,
                "name" => isset($body['name']) ? $body['name'] : '',
                "phone" => isset($body['phone']) ? $body['phone'] : '',
                "email" => isset($body['email']) ? $body['email'] : '',
                "hotel" => isset($body['hotel']) ? $body['hotel'] : '',
                "room" => isset($body['room']) ? $body['room'] : '',
                "registration_date" => date('Y-m-d H:i:s')
            ];
            $updated = true;
        }

        if ($updated) {
            writeData($customersFile, $customers);
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["error" => "Failed to save customer"]);
        }
        break;

    case 'save-product':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method Not Allowed"]);
            break;
        }

        $body = getRequestBody();
        $products = readData($productsFile);
        $id = isset($body['id']) ? intval($body['id']) : 0;

        $updated = false;
        foreach ($products as &$p) {
            if ($p['id'] == $id) {
                if (isset($body['name'])) $p['name'] = $body['name'];
                if (isset($body['type'])) $p['type'] = $body['type'];
                if (isset($body['price'])) $p['price'] = floatval($body['price']);
                if (isset($body['description'])) $p['description'] = $body['description'];
                if (array_key_exists('stock_quantity', $body)) $p['stock_quantity'] = $body['stock_quantity'] !== null ? intval($body['stock_quantity']) : null;
                $updated = true;
                break;
            }
        }

        if (!$updated) {
            $newId = 1;
            if (count($products) > 0) {
                $ids = array_column($products, 'id');
                $newId = max($ids) + 1;
            }
            $products[] = [
                "id" => $newId,
                "name" => isset($body['name']) ? $body['name'] : '',
                "type" => isset($body['type']) ? $body['type'] : 'service',
                "price" => isset($body['price']) ? floatval($body['price']) : 0,
                "description" => isset($body['description']) ? $body['description'] : '',
                "stock_quantity" => isset($body['stock_quantity']) && $body['stock_quantity'] !== null ? intval($body['stock_quantity']) : null
            ];
            $updated = true;
        }

        writeData($productsFile, $products);
        echo json_encode(["success" => true]);
        break;

    case 'save-order':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method Not Allowed"]);
            break;
        }

        $body = getRequestBody();
        $orders = readData($ordersFile);
        $id = isset($body['id']) ? $body['id'] : '';

        // Update customer details if phone, email, or name are passed from admin order creation
        $customerId = isset($body['customer_id']) ? $body['customer_id'] : '';
        $phoneInput = isset($body['phone']) ? trim($body['phone']) : '';
        $emailInput = isset($body['email']) ? trim($body['email']) : '';
        $nameInput = isset($body['name']) ? trim($body['name']) : '';

        if (!empty($customerId) && (!empty($phoneInput) || !empty($emailInput) || !empty($nameInput))) {
            $customers = readData($customersFile);
            $custUpdated = false;
            foreach ($customers as &$c) {
                if ($c['id'] == $customerId || $c['phone'] == $customerId) {
                    if (!empty($phoneInput)) {
                        $c['phone'] = $phoneInput;
                        $c['id'] = $phoneInput;
                    }
                    if (!empty($emailInput)) {
                        $c['email'] = $emailInput;
                    }
                    if (!empty($nameInput)) {
                        $c['name'] = $nameInput;
                    }
                    $custUpdated = true;
                    break;
                }
            }
            if ($custUpdated) {
                writeData($customersFile, $customers);
            }
        }

        $updated = false;
        $statusChangedToCompleted = false;
        $targetOrder = null;
        foreach ($orders as &$o) {
            if ($o['id'] == $id || $o['Mã đặt lịch'] == $id) {
                $oldStatus = isset($o['Trạng thái đơn']) ? $o['Trạng thái đơn'] : '';
                if (isset($body['customer_id'])) $o['SĐT liên hệ (ID Khách)'] = $body['customer_id'];
                if (isset($body['name'])) $o['Tên khách hàng'] = $body['name'];
                if (isset($body['product_id'])) $o['Gói giặt'] = $body['product_id'];
                if (isset($body['amount'])) $o['Tổng tiền bill tạm tính'] = floatval($body['amount']);
                if (isset($body['status'])) {
                    $o['Trạng thái đơn'] = $body['status'];
                    if ($oldStatus !== 'Hoàn thành' && $body['status'] === 'Hoàn thành') {
                        $statusChangedToCompleted = true;
                    }
                }
                if (isset($body['order_date'])) $o['Thời gian nhận'] = $body['order_date'];
                $updated = true;
                $targetOrder = $o;
                break;
            }
        }

        if ($updated && $statusChangedToCompleted && $targetOrder) {
            $custPhone = $targetOrder['SĐT liên hệ (ID Khách)'];
            $custName = $targetOrder['Tên khách hàng'] ?: 'Guest';
            $custEmail = '';
            $customers = readData($customersFile);
            foreach ($customers as $c) {
                if ($c['id'] == $custPhone || $c['phone'] == $custPhone) {
                    $custEmail = isset($c['email']) ? $c['email'] : '';
                    $custName = isset($c['name']) ? $c['name'] : 'Guest';
                    break;
                }
            }
            if (!empty($custEmail)) {
                $products = readData($productsFile);
                $productName = 'Laundry Service';
                foreach ($products as $p) {
                    if ($p['id'] == $targetOrder['Gói giặt'] || $p['name'] == $targetOrder['Gói giặt']) {
                        $productName = $p['name'];
                        break;
                    }
                }
                send_payment_confirmation($custName, $custEmail, $productName, $targetOrder['Tổng tiền bill tạm tính'], $targetOrder['id']);
            }
        }

        if (!$updated) {
            $bookingCode = !empty($id) ? $id : 'NF' . rand(1000, 9999);
            $customerId = isset($body['customer_id']) ? $body['customer_id'] : '';
            $productId = isset($body['product_id']) ? $body['product_id'] : '';
            $amount = isset($body['amount']) ? floatval($body['amount']) : 0;
            $status = isset($body['status']) ? $body['status'] : 'Chờ XN';
            $orderDate = isset($body['order_date']) ? $body['order_date'] : '';
            $customerNameInput = !empty($nameInput) ? $nameInput : "Tạo từ Admin";

            $orders[] = [
                "id" => $bookingCode,
                "Mã đặt lịch" => $bookingCode,
                "SĐT liên hệ (ID Khách)" => $customerId,
                "Tên khách hàng" => $customerNameInput,
                "Tên khách sạn & Địa chỉ" => "",
                "Số phòng" => "",
                "Thời gian nhận" => $orderDate,
                "Nhận tại lễ tân hay trực tiếp" => "",
                "Gói giặt" => $productId,
                "Có tách trắng không" => "No",
                "Trọng lượng (kg) / Số lượng" => "",
                "Phí vận chuyển" => 0,
                "Phụ phí" => 0,
                "Tổng tiền bill tạm tính" => $amount,
                "Trạng thái đơn" => $status,
                "Ngày tạo" => date('Y-m-d H:i:s')
            ];
            $updated = true;

            // Trigger order confirmation email
            $customers = readData($customersFile);
            $custEmail = '';
            $custName = 'Guest';
            foreach ($customers as $c) {
                if ($c['id'] == $customerId || $c['phone'] == $customerId) {
                    $custEmail = isset($c['email']) ? $c['email'] : '';
                    $custName = isset($c['name']) ? $c['name'] : 'Guest';
                    break;
                }
            }

            if (!empty($custEmail)) {
                $products = readData($productsFile);
                $productName = 'Laundry Service';
                foreach ($products as $p) {
                    if ($p['id'] == $productId || $p['name'] == $productId) {
                        $productName = $p['name'];
                        break;
                    }
                }
                send_booking_confirmation($custName, $custEmail, $productName, $amount, $bookingCode);
            }
        }

        writeData($ordersFile, $orders);
        echo json_encode(["success" => true]);
        break;

    case 'sepay-webhook':
        // Webhook from SePay API
        $body = getRequestBody();
        $content = isset($body['content']) ? $body['content'] : '';
        $amount = isset($body['transferAmount']) ? floatval($body['transferAmount']) : 0;
        
        if (empty($content)) {
            // Check description in case content is empty
            $content = isset($body['description']) ? $body['description'] : '';
        }

        if (empty($content)) {
            echo json_encode(["success" => false, "message" => "No transfer content found"]);
            break;
        }

        // Find booking code in content (e.g. NF3444) using regex
        $bookingCode = '';
        if (preg_match('/(NF\d{4})/i', $content, $matches)) {
            $bookingCode = strtoupper($matches[1]);
        }

        if (empty($bookingCode)) {
            // Fallback: check if the content itself contains any of our active booking codes
            $orders = readData($ordersFile);
            foreach ($orders as $o) {
                $code = strtoupper($o['id']);
                if (stripos($content, $code) !== false) {
                    $bookingCode = $code;
                    break;
                }
            }
        }

        if (empty($bookingCode)) {
            echo json_encode(["success" => false, "message" => "Could not match booking code in content: " . $content]);
            break;
        }

        // Update order status to "Hoàn thành"
        $orders = readData($ordersFile);
        $updated = false;
        $targetOrder = null;
        $oldStatus = '';
        foreach ($orders as &$o) {
            if (strtoupper($o['id']) === $bookingCode || strtoupper($o['Mã đặt lịch']) === $bookingCode) {
                $oldStatus = isset($o['Trạng thái đơn']) ? $o['Trạng thái đơn'] : '';
                $o['Trạng thái đơn'] = "Hoàn thành";
                $updated = true;
                $targetOrder = $o;
                break;
            }
        }

        if ($updated) {
            writeData($ordersFile, $orders);

            // Trigger payment confirmation email
            if ($oldStatus !== 'Hoàn thành' && $targetOrder) {
                $custPhone = $targetOrder['SĐT liên hệ (ID Khách)'];
                $custName = $targetOrder['Tên khách hàng'] ?: 'Guest';
                $custEmail = '';
                $customers = readData($customersFile);
                foreach ($customers as $c) {
                    if ($c['id'] == $custPhone || $c['phone'] == $custPhone) {
                        $custEmail = isset($c['email']) ? $c['email'] : '';
                        $custName = isset($c['name']) ? $c['name'] : 'Guest';
                        break;
                    }
                }
                if (!empty($custEmail)) {
                    $products = readData($productsFile);
                    $productName = 'Laundry Service';
                    foreach ($products as $p) {
                        if ($p['id'] == $targetOrder['Gói giặt'] || $p['name'] == $targetOrder['Gói giặt']) {
                            $productName = $p['name'];
                            break;
                        }
                    }
                    send_payment_confirmation($custName, $custEmail, $productName, $targetOrder['Tổng tiền bill tạm tính'], $targetOrder['id']);
                }
            }

            echo json_encode(["success" => true, "message" => "Order " . $bookingCode . " status updated to Completed"]);
        } else {
            echo json_encode(["success" => false, "message" => "Order not found in database: " . $bookingCode]);
        }
        break;

    case 'delete':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method Not Allowed"]);
            break;
        }

        $body = getRequestBody();
        $type = isset($body['type']) ? $body['type'] : '';
        $id = isset($body['id']) ? $body['id'] : '';

        if (empty($type) || empty($id)) {
            echo json_encode(["error" => "Missing type or id"]);
            break;
        }

        if ($type === 'orders') {
            $orders = readData($ordersFile);
            $newOrders = array_filter($orders, function($o) use ($id) {
                return $o['id'] != $id && $o['Mã đặt lịch'] != $id;
            });
            writeData($ordersFile, $newOrders);
            // Re-generate report on deletion
            generate_referral_report();
            echo json_encode(["success" => true]);
        } elseif ($type === 'customers') {
            $customers = readData($customersFile);
            $newCustomers = array_filter($customers, function($c) use ($id) {
                return $c['id'] != $id;
            });
            writeData($customersFile, $newCustomers);
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["error" => "Invalid delete type"]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
        break;
}

// --- Dynamic Referral Reporting Engine ---
function generate_referral_report() {
    global $ordersFile;
    $orders = readData($ordersFile);
    
    $totalStats = [];
    $monthlyStats = [];
    $dailyStats = [];
    
    foreach ($orders as $o) {
        $source = isset($o['Nguồn khách']) ? $o['Nguồn khách'] : 'Direct / Website';
        $revenue = isset($o['Tổng tiền bill tạm tính']) ? floatval($o['Tổng tiền bill tạm tính']) : 0;
        
        $dateStr = isset($o['Ngày tạo']) ? $o['Ngày tạo'] : '';
        if (empty($dateStr)) {
            continue;
        }
        $dateObj = strtotime($dateStr);
        $month = date('Y-m', $dateObj);
        $day = date('Y-m-d', $dateObj);
        
        // Total
        if (!isset($totalStats[$source])) {
            $totalStats[$source] = ['orders' => 0, 'revenue' => 0];
        }
        $totalStats[$source]['orders']++;
        $totalStats[$source]['revenue'] += $revenue;
        
        // Monthly
        if (!isset($monthlyStats[$month])) {
            $monthlyStats[$month] = [];
        }
        if (!isset($monthlyStats[$month][$source])) {
            $monthlyStats[$month][$source] = ['orders' => 0, 'revenue' => 0];
        }
        $monthlyStats[$month][$source]['orders']++;
        $monthlyStats[$month][$source]['revenue'] += $revenue;
        
        // Daily
        if (!isset($dailyStats[$day])) {
            $dailyStats[$day] = [];
        }
        if (!isset($dailyStats[$day][$source])) {
            $dailyStats[$day][$source] = ['orders' => 0, 'revenue' => 0];
        }
        $dailyStats[$day][$source]['orders']++;
        $dailyStats[$day][$source]['revenue'] += $revenue;
    }
    
    // Sort keys descending
    krsort($monthlyStats);
    krsort($dailyStats);
    
    $md = "# 1997 Laundry - Báo cáo Nguồn Khách hàng (Real-time Referral Report)\n";
    $md .= "*Cập nhật tự động lúc: " . date('Y-m-d H:i:s') . "*\n\n";
    
    $md .= "## 📊 TỔNG HỢP CHUNG (TẤT CẢ THỜI GIAN)\n";
    $md .= "| Nguồn khách | Số lượng đơn | Tổng doanh thu dự kiến |\n";
    $md .= "| :--- | :---: | :---: |\n";
    foreach ($totalStats as $source => $stat) {
        $md .= "| " . $source . " | " . $stat['orders'] . " | " . number_format($stat['revenue'], 0, ',', '.') . " VND |\n";
    }
    $md .= "\n";
    
    $md .= "## 📅 THỐNG KÊ CHI TIẾT THEO THÁNG\n";
    foreach ($monthlyStats as $month => $sources) {
        $md .= "### 🗓️ Tháng " . $month . "\n";
        $md .= "| Nguồn khách | Số lượng đơn | Tổng doanh thu dự kiến |\n";
        $md .= "| :--- | :---: | :---: |\n";
        foreach ($sources as $source => $stat) {
            $md .= "| " . $source . " | " . $stat['orders'] . " | " . number_format($stat['revenue'], 0, ',', '.') . " VND |\n";
        }
        $md .= "\n";
    }
    
    $md .= "## 📆 THỐNG KÊ CHI TIẾT THEO NGÀY (7 Ngày gần nhất)\n";
    $dayCount = 0;
    foreach ($dailyStats as $day => $sources) {
        if ($dayCount >= 7) break;
        $md .= "### 📍 Ngày " . $day . "\n";
        $md .= "| Nguồn khách | Số lượng đơn | Tổng doanh thu dự kiến |\n";
        $md .= "| :--- | :---: | :---: |\n";
        foreach ($sources as $source => $stat) {
            $md .= "| " . $source . " | " . $stat['orders'] . " | " . number_format($stat['revenue'], 0, ',', '.') . " VND |\n";
        }
        $md .= "\n";
        $dayCount++;
    }
    
    @file_put_contents(__DIR__ . '/data/referral_report.md', $md);
}
?>
