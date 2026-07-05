document.addEventListener('DOMContentLoaded', () => {
  // Config
  const EXCHANGE_RATE = 25000; // 1 USD = 25,000 VND
  const WHATSAPP_PHONE = '84373991602';
  const ZALO_URL = 'https://zalo.me/0373991602';

  // --- TRANSLATION SYSTEM ---
  const TRANSLATIONS = {
    // Navigation & General
    "Home": "Trang chủ",
    "Pricing": "Bảng giá",
    "Shoes Cleaning": "Vệ sinh giày",
    "Book Appointment": "Đặt lịch",
    "Book Now": "Đặt ngay",
    
    // index.html Hero
    "Express Hotel Laundry - Saigon": "Giặt sấy khách sạn hỏa tốc - Sài Gòn",
    "Guaranteed Delivery Before": "Giao đồ cam kết trước giờ",
    "Your Hotel Checkout": "Trả phòng khách sạn",
    "The only laundry service in Saigon aligning with your checkout and flight schedule. Premium 4-hour express and same-day hotel laundry with separate machines.": "Dịch vụ giặt sấy duy nhất tại Sài Gòn căn chỉnh thời gian giao nhận khớp giờ trả phòng và chuyến bay của bạn. Gói hỏa tốc 4H và trong ngày cao cấp giặt riêng bằng máy độc lập.",
    "4.9/5 Rating": "Đánh giá 4.9/5 Sao",
    "on Google Reviews (500+ travelers)": "trên Google Reviews (500+ khách du lịch)",
    "💬 Book via WhatsApp": "💬 Đặt qua WhatsApp",
    "💬 Book via Zalo": "💬 Đặt qua Zalo",

    // index.html Pricing Section
    "Pricing Packs": "Các gói dịch vụ",
    "Our Signature Services": "Dịch vụ giặt sấy cao cấp",
    "🛵 All packages include round-trip pickup & delivery! (Deduct 25k/way if self drop-off/collect)": "🛵 Tất cả các gói đã bao gồm giao nhận tận nơi khứ hồi! (Trừ 25k/chiều nếu tự mang tới/lấy)",
    "24-hour standard": "Tiêu chuẩn 24h",
    "VND / 3kg base": "VND / Tối thiểu 3kg",
    "40,000 VND/kg extra | Includes 2-way Delivery (~$6.80 USD)": "40.000 VND/kg tiếp theo | Đã gồm giao nhận 2 chiều (~$6.80 USD)",
    "+30k VND surcharge to separate whites from darks": "Phụ phí +30k VND nếu giặt riêng đồ trắng và đồ màu",
    "Ready in 24 hours. Crisp, clean, and neatly folded.": "Trả đồ sau 24 giờ. Quần áo sạch sẽ, thơm mát và gấp gọn gàng.",
    "Select Package": "Chọn gói này",
    "Minimum order: 3kg": "Tối thiểu: 3kg",
    "100% separate hygienic wash & dry": "Giặt sấy riêng biệt 100% bằng máy độc lập",
    "Free premium folding & packaging": "Miễn phí gấp quần áo và đóng gói cao cấp",
    "Round-trip hotel pickup & delivery included": "Đã bao gồm dịch vụ giao nhận tận khách sạn khứ hồi",
    "Returned fresh and clean next day": "Giao lại sạch sẽ thơm mát vào ngày hôm sau",
    "10% VAT included (no hidden fees)": "Đã bao gồm 10% VAT (không phụ phí ẩn)",

    "Same-day wash": "Gói lấy trong ngày",
    "VND / 4kg base": "VND / Tối thiểu 4kg",
    "50,000 VND/kg extra | Includes 2-way Delivery (~$10.00 USD)": "50.000 VND/kg tiếp theo | Đã gồm giao nhận 2 chiều (~$10.00 USD)",
    "Most popular! Ready same-day by dinner time.": "Phổ biến nhất! Nhận trả trong ngày trước giờ ăn tối.",
    "Minimum order: 4kg": "Tối thiểu: 4kg",
    "Priority washing slots queue": "Hàng đợi giặt ưu tiên",
    "Ready by 7-9 PM (if picked up by 2 PM)": "Trả đồ lúc 7h-9h tối (nếu tài xế lấy trước 2h chiều)",

    "4-hour express": "Gói hỏa tốc 4h",
    "70,000 VND/kg extra | Includes 2-way Delivery (~$13.20 USD)": "70.000 VND/kg tiếp theo | Đã gồm giao nhận 2 chiều (~$13.20 USD)",
    "Urgent delivery in 4 hours. Time-critical guarantee.": "Giao đồ hỏa tốc sau 4 tiếng. Cam kết thời gian gấp.",
    "Instant dedicated machine slots": "Vào máy ngay lập tức không cần chờ đợi",
    "Flight & Checkout checkout-time guarantee": "Cam kết trả đồ đúng giờ bay và giờ trả phòng",

    // index.html Other Services
    "Premium Care": "Chăm sóc cao cấp",
    "Other Services": "Dịch vụ khác",
    "Hygienic separated washes, premium folding, and fast delivery tailored to your needs.": "Quy trình giặt sấy riêng biệt vệ sinh, gấp ủi gọn gàng và giao nhận nhanh chóng theo nhu cầu của bạn.",
    "Shoes Cleaning": "Vệ sinh Giày",
    "Premium Leather, Sneakers, Canvas": "Da Cao Cấp, Giày Thể Thao, Giày Vải",
    "Our team deep cleans, conditions, and sanitizes your shoes entirely by hand. Ready in 48 hours.": "Chúng tôi làm sạch sâu, dưỡng da và khử trùng giày hoàn toàn bằng tay. Giao lại sau 48 giờ.",
    "Learn More": "Xem chi tiết",
    "Mattress Toppers": "Tấm bảo vệ nệm",
    "Sanitation, Stains, Deep Clean": "Khử Trùng, Tẩy Vết Bẩn, Giặt Sâu",
    "Professional deep washing for toppers of all sizes. Eliminates dust mites and yellow stains.": "Giặt sâu chuyên nghiệp cho topper mọi kích cỡ. Tiêu diệt bụi mịn và tẩy vết ố vàng.",
    "Curtain Dry Clean": "Giặt hấp rèm cửa",
    "Dust Removal, Steaming, Pressing": "Hút Bụi, Hấp Hơi, Ủi Thẳng",
    "Premium dry cleaning & steam pressing. Helps protect colors and maintains fabric structure.": "Giặt khô cao cấp và ủi hơi nước. Giúp bảo vệ màu sắc và phom dáng của vải.",
    "Beddings & Linens": "Chăn ga gối nệm",
    "Sheets, Duvets, Blankets": "Drap giường, Mền, Chăn",
    "Separate high-temperature wash with premium softeners. Soft, fluffy, and clean sheets guaranteed.": "Giặt riêng ở nhiệt độ cao với nước xả vải cao cấp. Cam kết chăn drap mềm mại và sạch khuẩn.",

    // booking.html (Calculator)
    "Price Calculator": "Công cụ tính giá",
    "Calculate & Pre-Fill Your Booking": "Tính giá & Điền thông tin đặt lịch",
    "Input your estimated details. The live estimator calculates your total cost instantly in VND and USD. When ready, click to send pre-filled order text.": "Nhập thông tin dự kiến của bạn. Công cụ tính giá trực tiếp sẽ hiển thị tổng chi phí tức thì bằng VND và USD. Khi hoàn tất, nhấn gửi tin nhắn đã điền sẵn.",
    "Live Estimation Summary": "Bảng ước tính chi tiết",
    "Estimated Weight:": "Khối lượng ước tính:",
    "Selected Package:": "Gói dịch vụ đã chọn:",
    "White Clothes Surcharge:": "Phụ phí giặt đồ trắng:",
    "Shipping Fee:": "Phí vận chuyển giao nhận:",
    "Estimated Total:": "Tổng chi phí ước tính:",
    "* Minimum weights apply (Standard: 3kg | Same-day & Express: 4kg). Ship fee is 25,000 VND/way.": "* Áp dụng khối lượng tối thiểu (Standard: 3kg | Same-day & Express: 4kg). Phí ship là 25.000 VND/chiều.",
    
    // booking.html (Form)
    "Quick Booking": "Đặt lịch nhanh",
    "Book Your Laundry Appointment": "Đặt lịch hẹn giặt ủi",
    "Your Full Name *": "Họ và Tên của bạn *",
    "WhatsApp/Phone Number *": "Số điện thoại / WhatsApp *",
    "Service Package *": "Gói dịch vụ giặt sấy *",
    "Estimated Weight (kg) *": "Khối lượng dự kiến (kg) *",
    "Preferred Pickup Time *": "Thời gian nhận đồ mong muốn *",
    "Shipping Option *": "Hình thức giao nhận *",
    "Separate white clothes (+30,000 VND)": "Giặt riêng đồ trắng (+30.000 VND)",
    "Express 24h Shoes (+100,000 VND/pair)": "Giặt giày hỏa tốc 24h (+100.000 VND/đôi)",
    "Hotel Name & Address *": "Tên khách sạn & Địa chỉ *",
    "Room Number": "Số phòng",
    "💬 Send Pickup Order via WhatsApp": "💬 Gửi thông tin đặt lịch qua WhatsApp",
    "💬 Send Pickup Order via Zalo": "💬 Gửi thông tin đặt lịch qua Zalo",

    // Select options
    "Standard Wash & Fold (24h) - 40,000 VND / kg (Min 3kg)": "Giặt sấy tiêu chuẩn (24h) - 40.000 VND / kg (Tối thiểu 3kg)",
    "Same-day Wash & Fold (8h-12h) - 50,000 VND / kg (Min 4kg)": "Giặt sấy lấy trong ngày (8h-12h) - 50.000 VND / kg (Tối thiểu 4kg)",
    "Express Wash & Fold (4h) - 70,000 VND / kg (Min 4kg)": "Giặt sấy hỏa tốc (4h) - 70.000 VND / kg (Tối thiểu 4kg)",
    "Shoes Cleaning - From 150,000 VND / pair (Min 1 pair)": "Vệ sinh giày - Từ 150.000 VND / đôi (Tối thiểu 1 đôi)",
    "Topper Cleaning - 60,000 VND / kg (Min 1kg)": "Giặt topper - 60.000 VND / kg (Tối thiểu 1kg)",
    "Curtain Cleaning - 50,000 VND / kg (Min 1kg)": "Giặt rèm cửa - 50.000 VND / kg (Tối thiểu 1kg)",
    "Beddings & Linens - 40,000 VND / kg (Min 3kg)": "Giặt chăn ga gối nệm - 40.000 VND / kg (Tối thiểu 3kg)",

    "Round-trip Pickup & Delivery (50,000 VND)": "Giao nhận khứ hồi tận nơi (50.000 VND)",
    "Return Delivery Only (25,000 VND)": "Chỉ giao đồ đã giặt về (25.000 VND)",
    "Pickup Collection Only (25,000 VND)": "Chỉ đến lấy đồ đi giặt (25.000 VND)",
    "Self Drop-off & self collection (0 VND)": "Tự mang tới tiệm và tự lấy (0 VND)",

    // Placeholders
    "e.g. John Doe": "Ví dụ: Nguyễn Văn A",
    "e.g. +44 7123 456789": "Ví dụ: 0901234567 hoặc +84...",
    "e.g. Today 4:00 PM": "Ví dụ: Hôm nay 16:00",
    "e.g. Caravelle Hotel, 19 Lam Son Square, District 1": "Ví dụ: Khách sạn Caravelle, 19 Công trường Lam Sơn, Quận 1",
    "e.g. Room 502 (or leave at front desk)": "Ví dụ: Phòng 502 (hoặc gửi tại quầy lễ tân)",

    // shoes.html
    "Premium Shoes Care": "Chăm sóc giày cao cấp",
    "Professional Hand Cleaning": "Giặt hấp giày thủ công chuyên nghiệp",
    "Saigon's premium sneaker and leather shoe dry cleaning. Cleaned 100% by hand, deodorized, and returned in 24-48 hours directly to your hotel.": "Dịch vụ giặt hấp giày thể thao và da cao cấp tại Sài Gòn. Giặt tay thủ công 100%, khử mùi và giao trả sau 24-48 giờ trực tiếp tại khách sạn của bạn.",
    "Cleaned entirely by hand with specialized solutions": "Làm sạch thủ công hoàn toàn bằng dung dịch chuyên dụng",
    "UVC disinfection and antibacterial dry treatments": "Khử trùng tia UVC và sấy kháng khuẩn chuyên sâu",
    "24h express shoes turnaround option available": "Có tùy chọn giặt giày hỏa tốc lấy sau 24 giờ",
    "Standard Hand Cleaning": "Giặt tay tiêu chuẩn",
    "VND / pair": "VND / đôi",
    "Canvas, mesh, running, and casual sports shoes. Deep midsole stain treatments. Ready in 48 hours.": "Giày vải canvas, lưới, chạy bộ và giày thể thao thường ngày. Tẩy vết ố đế giữa. Giao trả sau 48h.",
    "Hand clean laces & insoles separately": "Giặt riêng dây giày & lót giày bằng tay",
    "Midsole & outsole deep scrubbing": "Chà rửa sâu phần đế giữa & đế ngoài",
    "Sanitize & UVC ozone deodorizing": "Sát khuẩn & Khử mùi bằng tia Ozone UVC",
    "Express 24h shoes option: +100k / pair": "Tùy chọn hỏa tốc 24h: +100k / đôi",
    "Premium Hand Cleaning": "Giặt tay cao cấp",
    "Luxury leather, suede, nubuck, and designer sneakers. Specialized nourishing leather oils. Ready in 48 hours.": "Giày da cao cấp, da lộn, nubuck và giày hiệu. Sử dụng dầu dưỡng chuyên sâu. Giao trả sau 48h.",
    "Gentle cleaning for sensitive materials": "Làm sạch dịu nhẹ cho các chất liệu nhạy cảm",
    "Suede color restoration treatments": "Hỗ trợ phục hồi màu sắc da lộn",
    "Conditioning and polishing leather oils": "Thoa dầu dưỡng và đánh bóng phục hồi da",

    // shoes.html additional
    "Premium Hand-Cleaned Shoes & Sneakers": "Vệ sinh Giày & Sneaker thủ công cao cấp",
    "Give your shoes the 5-star treatment they deserve. We clean all types of shoes by hand using premium biological cleaners—no machine damage, 100% slow natural air dry.": "Chăm sóc đôi giày của bạn với chất lượng 5 sao xứng đáng. Chúng tôi vệ sinh mọi loại giày hoàn toàn thủ công bằng dung dịch sinh học cao cấp — không gây hại phom dáng, sấy tự nhiên 100%.",
    "Book Shoes Clean": "Đặt lịch vệ sinh giày",
    "View Packages": "Xem các gói dịch vụ",
    "How It Works": "Quy trình hoạt động",
    "Our Detailed Hand-Cleaning Process": "Quy trình vệ sinh giày thủ công chi tiết",
    "We treat every shoe with extreme care. Here is how our premium slow-care process works:": "Chúng tôi nâng niu từng đôi giày của bạn. Đây là cách quy trình chăm sóc chuyên sâu của chúng tôi vận hành:",
    "1. Inspection": "1. Kiểm tra ban đầu",
    "We check materials, textures, stains, and outline custom biological cleaning treatments.": "Chúng tôi kiểm tra chất liệu, bề mặt da, vết bẩn và lên phác đồ làm sạch sinh học phù hợp.",
    "2. Hand Wash": "2. Vệ sinh tay thủ công",
    "100% hand wash using premium soft brushes. No washing machines. Extremely safe for delicate fabrics.": "Vệ sinh tay 100% bằng bàn chải lông mềm cao cấp. Tuyệt đối không dùng máy giặt. Rất an toàn cho chất liệu nhạy cảm.",
    "3. Deep Sanitizing": "3. Khử trùng sâu",
    "Biological odor removal and inner-sole disinfection to kill bacteria and restore freshness.": "Khử mùi sinh học và khử trùng lót giày chuyên sâu để diệt khuẩn, mang lại sự sạch thơm tươi mới.",
    "4. Natural Slow-Dry": "4. Sấy khô tự nhiên",
    "Shoes dry in humidity-controlled rooms naturally. Heat is never used, protecting glue and shape.": "Giày được sấy khô tự nhiên trong phòng kiểm soát độ ẩm. Không sử dụng nhiệt để bảo vệ keo dán và phom dáng.",
    "Flat-Rate Shoes Care Packages": "Bảng giá dịch vụ vệ sinh giày đồng giá",
    "Simple pricing based on shoe material. Standard turnaround is 3 days (Express 24h available for +100k VND/pair!).": "Giá cước đơn giản theo chất liệu giày. Thời gian giao nhận chuẩn là 3 ngày (Hỏa tốc 24h sẵn sàng với phụ phí +100k VND/đôi!).",
    "Delivery fee: 50,000 VND round-trip (or deduct 25k/way if self drop-off/collect).": "Phí giao nhận: 50.000 VND khứ hồi (hoặc trừ 25k/chiều nếu tự mang tới/lấy đồ).",
    "Sneakers & Canvas": "Giày Sneaker & Giày Vải",
    "Best for everyday running shoes, canvas sneakers, and knit materials (e.g. Adidas Ultraboost, Converse, Vans).": "Phù hợp nhất cho giày chạy bộ hàng ngày, giày vải canvas và chất liệu dệt (ví dụ: Adidas Ultraboost, Converse, Vans).",
    "Select Service": "Chọn dịch vụ này",
    "Premium Leather & Suede": "Da cao cấp & Da lộn",
    "Best for dress shoes, leather boots, suede sneakers, and designer brands (e.g. Jordan 1 Leather, Timberlands, Uggs).": "Phù hợp nhất cho giày tây, bốt da, giày da lộn và các hãng thương hiệu hiệu (ví dụ: Jordan 1, Timberlands, Uggs).",
    "Ready to Walk on Clouds?": "Sẵn sàng sải bước êm ái trên mây?",
    "Schedule a pickup appointment for your shoes today. Free round-trip hotel collection inside District 1.": "Đặt lịch hẹn lấy giày ngay hôm nay. Giao nhận khứ hồi miễn phí trong phạm vi Quận 1.",
    "Book Shoes Cleaning Now": "Đặt lịch vệ sinh giày ngay",

    // Footer & other sections
    "Explore": "Khám phá",
    "Connect with Us": "Connect with Us",
    "Coverage: District 1, 3, and Thao Dien (District 2)": "Khu vực: Quận 1, Quận 3, và Thảo Điền (Quận 2)",
    "laundry district 1 saigon, laundry service ho chi minh city, laundry pickup delivery, dry cleaning hotel hcmc, express laundry saigon, laundry foreigners vietnam": "giặt ủi quận 1 sài gòn, dịch vụ giặt sấy hồ chí minh, giao nhận giặt ủi, giặt hấp khách sạn hcmc, giặt hỏa tốc sài gòn, giặt ủi khách du lịch việt nam",
    "Pricing packages": "Các gói dịch vụ",
    "1997 Laundry | Premium Hotel Laundry & Dry Cleaning HCMC": "1997 Laundry | Giặt Sấy & Giặt Hấp Khách Sạn Cao Cấp HCMC",
    "Saigon's best same-day express hotel laundry service for tourists & expats. Free hotel reception pickup & delivery in District 1, 3, and Thao Dien. 100% hygienic separate washing machines. Book online in 2 mins via WhatsApp or Zalo.": "Dịch vụ giặt sấy lấy liền trong ngày cao cấp nhất tại Sài Gòn cho khách du lịch và người nước ngoài. Giao nhận miễn phí tại lễ tân khách sạn Quận 1, 3, Thảo Điền. Giặt riêng 100% bằng máy độc lập. Đặt lịch online 2 phút qua WhatsApp hoặc Zalo.",

    // Footer
    "Premium hotel laundry service based in District 1, Ho Chi Minh City. Hygienic, fast, and dedicated.": "Dịch vụ giặt sấy khách sạn cao cấp tọa lạc tại Quận 1, TP. Hồ Chí Minh. Vệ sinh, nhanh chóng và tâm huyết.",
    "Quick Links": "Liên kết nhanh",
    "Contact Info": "Thông tin liên hệ",
    "Phone: 037 399 1602": "Điện thoại: 037 399 1602",
    "Address: District 1, Ho Chi Minh City": "Địa chỉ: Quận 1, TP. Hồ Chí Minh",
    "© 2026 1997 Laundry. All rights reserved.": "© 2026 1997 Laundry. Bảo lưu mọi quyền.",

    // New static page translation items
    "Connect with Us": "Kết nối với chúng tôi",
    "About us": "Về chúng tôi",
    "How it works": "Quy trình",
    "Our Team": "Đội ngũ",
    "1997 Laundry Assistant": "Trợ lý 1997 Laundry",
    "Hotel laundry help": "Hỗ trợ giặt ủi khách sạn",
    "Go to waiting list form": "Mở biểu mẫu đặt lịch",
    "Ask about price, pickup, or service...": "Hỏi về giá cả, giao nhận hoặc dịch vụ...",
    "Send": "Gửi",
    "Book online": "Đặt online",
    "Zalo": "Zalo",
    "WhatsApp": "WhatsApp",
    "Book your pickup now!": "Đặt lịch lấy đồ ngay!",
    "Help Us Improve": "Giúp chúng tôi cải thiện",
    "Tell Us Your Laundry Preferences": "Chia sẻ thói quen giặt ủi của bạn",
    "Take 30 seconds to share your laundry habits. Your feedback helps us customize our services to serve you better!": "Dành 30 giây để chia sẻ thói quen giặt ủi của bạn. Ý kiến đóng góp sẽ giúp chúng tôi nâng cấp dịch vụ tốt hơn!",
    "Full Name (Tên) *": "Họ và Tên *",
    "Phone / Zalo Number (SĐT/Zalo) *": "Số điện thoại / Zalo *",
    "1. How often do you do laundry?": "1. Bạn thường giặt quần áo bao lâu một lần?",
    "1 - 2 times a week": "1 - 2 lần một tuần",
    "Once every two weeks": "Mỗi hai tuần một lần",
    "Occasionally (when traveling/busy)": "Thỉnh thoảng (khi đi du lịch/bận rộn)",
    "2. Which laundry service do you use the most?": "2. Dịch vụ giặt ủi nào bạn sử dụng nhiều nhất?",
    "Wash & Fold (Normal clothes)": "Giặt sấy gấp (Quần áo thông thường)",
    "Wash & Iron (Shirts, dresses)": "Giặt ủi treo (Áo sơ mi, đầm)",
    "Dry Cleaning (Suits, delicate fabrics)": "Giặt khô / Giặt hấp (Đồ vest, chất liệu nhạy cảm)",
    "3. Do you need pick-up and delivery service at your place?": "3. Bạn có cần dịch vụ giao nhận tận nơi không?",
    "Yes, pick-up and delivery is a must!": "Có, dịch vụ giao nhận là bắt buộc!",
    "No, I prefer dropping it off myself.": "Không, tôi muốn tự mang tới tiệm hơn.",
    "Only if I have too many clothes.": "Chỉ khi tôi có quá nhiều quần áo.",
    "4. What is most important to you when choosing a laundry service?": "4. Điều gì quan trọng nhất với bạn khi chọn dịch vụ giặt ủi?",
    "Fast turnaround (Same-day service)": "Giao hàng nhanh (Dịch vụ trong ngày)",
    "Affordable price": "Giá cả phải chăng",
    "Cleanliness & pleasant scent": "Sạch sẽ & Hương thơm dễ chịu",
    "Easy communication (English-speaking staff)": "Giao tiếp dễ dàng (Nhân viên biết tiếng Anh)",
    "Submit Preferences": "Gửi ý kiến phản hồi",
    "🎉 Thank you! Your preferences have been saved.": "🎉 Cảm ơn bạn! Ý kiến đóng góp của bạn đã được ghi nhận.",
    "Frequently Asked Questions": "Câu hỏi thường gặp",
    "FAQ": "Hỏi đáp",
    "Everything you need to know about our hotel pickup, cleaning, and payment process.": "Mọi điều bạn cần biết về quy trình lấy đồ tại khách sạn, giặt sấy và thanh toán.",
    "Do I have to be at the hotel for collection & delivery?": "Tôi có cần phải ở khách sạn khi giao nhận đồ không?",
    "No! That's the beauty of our service. You can drop off your bag with the receptionist and leave for your tour. We coordinate directly with your hotel desk. We will also drop the finished laundry back at the reception and notify you via WhatsApp/Zalo.": "Không cần ạ! Đó chính là điểm tiện lợi của dịch vụ. Bạn chỉ cần gửi túi đồ tại lễ tân và đi chơi tour. Chúng tôi tự liên hệ với khách sạn. Sau khi giặt xong, chúng tôi gửi trả tại lễ tân và báo cho bạn qua Zalo/WhatsApp.",
    "Is my laundry washed separately?": "Quần áo của tôi có được giặt riêng không?",
    "Absolutely! Hygiene is our absolute priority. We guarantee that your clothes are washed separately in dedicated machines. We never mix garments of different customers.": "Chắc chắn rồi ạ! Vệ sinh là ưu tiên hàng đầu của chúng tôi. Chúng tôi cam kết quần áo của bạn được giặt riêng biệt bằng máy độc lập, không trộn lẫn với bất kỳ ai.",
    "How do I pay for the laundry service?": "Tôi thanh toán tiền giặt bằng cách nào?",
    "We accept Cash (VND) upon delivery and Bank Transfers. We only require payment once your laundry is finished and ready for return.": "Chúng tôi chấp nhận Tiền mặt (VND) khi giao đồ và Chuyển khoản ngân hàng. Chúng tôi chỉ thu tiền khi đồ của bạn đã giặt xong và sẵn sàng trả.",
    "Do you clean shoes, suitcases, or delicate materials?": "Tiệm có nhận vệ sinh giày, vali hay đồ nhạy cảm không?",
    "Yes, we do! Apart from standard wash and fold, we offer dry cleaning for delicate materials (silks, wools) and professional laundry services for footwear, backpacks, and leather items.": "Có ạ! Ngoài giặt sấy tiêu chuẩn, chúng tôi nhận giặt khô/giặt hấp chất liệu nhạy cảm (lụa, len, dạ, vest) và vệ sinh chuyên nghiệp giày dép, ba lô, đồ da.",
    "Need Help Immediately?": "Cần hỗ trợ khẩn cấp?",
    "Our English-speaking support team is active and ready to assist you with special requests.": "Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng phục vụ và giải đáp mọi yêu cầu đặc biệt của bạn.",
    "Available: 7:30 AM - 9:30 PM daily": "Hoạt động: 7:30 Sáng - 9:30 Tối hàng ngày",
    "Chat on WhatsApp": "Nhắn WhatsApp ngay",
    "Coverage Area in Ho Chi Minh City": "Phạm vi phục vụ tại TP. Hồ Chí Minh",
    "We offer free pickup and delivery for all hotels, Airbnb apartments, and serviced suites in District 1, District 3, and Thao Dien (District 2).": "Chúng tôi giao nhận miễn phí cho tất cả khách sạn, căn hộ Airbnb, căn hộ dịch vụ tại Quận 1, Quận 3 và Thảo Điền (Quận 2).",
    "Explore": "Khám phá",
    "© 2026 1997 Laundry. All rights reserved. \"Crispest Fold Guaranteed!\"": "© 2026 1997 Laundry. Bảo lưu mọi quyền. \"Cam kết nếp gấp gọn gàng nhất!\"",
    "Outstanding service for families! Travelled with 3 kids and had loads of dirty laundry. They sorted it, washed everything separately, and returned it within 4 hours. Absolute lifesaver!": "Dịch vụ xuất sắc cho gia đình! Tôi đi du lịch với 3 con nhỏ và có rất nhiều quần áo bẩn. Họ đã phân loại, giặt riêng tất cả và trả đồ chỉ trong vòng 4 tiếng. Đúng là vị cứu tinh!",
    "The price calculator is 100% accurate. No tourist scams or hidden fees. Paying was so easy. Extremely professional laundry service in Saigon.": "Công cụ tính giá chính xác 100%. Không có lừa đảo du lịch hay phụ phí ẩn. Thanh toán rất dễ dàng. Dịch vụ giặt ủi cực kỳ chuyên nghiệp tại Sài Gòn.",
    "As an expat living in Thao Dien, I've tried many laundry services. 1997 Laundry is by far the cleanest. They return clothes smelling fresh, not like chemical perfumes. Very reliable!": "Là một người nước ngoài sống ở Thảo Điền, tôi đã thử nhiều dịch vụ giặt ủi. 1997 Laundry cho đến nay là tiệm sạch sẽ nhất. Quần áo nhận lại có mùi thơm dịu nhẹ, không phải mùi hóa chất. Rất đáng tin cậy!",
    "Amazing communication on Zalo. I dropped off my bag at reception at 8 AM, and it was back before my dinner tour. Super easy, highly recommend for short-stay tourists!": "Trao đổi qua Zalo rất tuyệt vời. Tôi gửi đồ tại lễ tân lúc 8h sáng và đã nhận lại đồ trước chuyến đi tour ăn tối của mình. Cực kỳ dễ dàng, khuyên dùng cho du khách lưu trú ngắn ngày!",
    "The 4-hour express service is a lifesaver. My flight was at 6 PM, and I needed my muddy clothes washed after a Mekong tour. They delivered them clean and dry right on time!": "Gói hỏa tốc 4 tiếng đúng là phao cứu sinh của tôi. Chuyến bay của tôi lúc 6h tối và tôi cần giặt sạch đống quần áo đầy bùn đất sau tour Mekong. Họ đã giao đồ sạch khô đúng giờ!",
    "Super fast and reliable! Messaged on WhatsApp, they picked up my laundry from my D1 hotel and delivered it clean and folded by dinner. English support was flawless!": "Dịch vụ cực nhanh và đáng tin cậy! Tôi nhắn tin qua WhatsApp, họ nhận đồ từ khách sạn Quận 1 của tôi và giao lại sạch sẽ, xếp ngăn nắp trước bữa tối. Hỗ trợ tiếng Anh cực kỳ tốt!",
    "Book your pickup now": "Đặt lịch lấy đồ ngay",
    "More Detail": "Chi tiết",
    "Toppers & Curtains": "Topper & Rèm cửa",
    "Specialist deep cleaning for mattress toppers (24h turnaround) and curtains.": "Làm sạch sâu chuyên biệt cho tấm bảo vệ nệm topper (giao nhận 24h) và rèm cửa.",
    "Topper: 60.000 VND / kg": "Topper: 60.000 VND / kg",
    "Curtain: 50.000 VND / kg": "Rèm cửa: 50.000 VND / kg",
    "Premium Linens, Bedding & Mattress Topper Cleaning Saigon | 1997 Laundry": "Dịch vụ giặt sấy cao cấp Drap, Chăn ga & Topper Sài Gòn | 1997 Laundry",
    "Premium Bedding Care": "Chăm sóc Chăn ga Cao cấp",
    "Hygienic Cleaning for Linens & Bedding": "Giặt sấy Vệ sinh Chăn ga & Gối đệm",
    "Keep your bedroom fresh and allergen-free. We provide professional deep cleaning for bedsheets, heavy duvets, mattress toppers, and curtains. 100% separate washes and complete machine drying guaranteed.": "Giữ phòng ngủ luôn sạch mát và không còn tác nhân gây dị ứng. Chúng tôi cung cấp dịch vụ làm sạch sâu chuyên nghiệp cho drap trải giường, chăn bông dày, tấm bảo vệ nệm topper và rèm cửa. Cam kết giặt riêng 100% và sấy khô hoàn toàn bằng máy.",
    "Delivery:": "Giao nhận:",
    "50,000 VND round-trip (Free if self drop-off/collect)": "50.000 VND khứ hồi (Miễn phí nếu tự mang tới/lấy đồ)",
    "Stain treatment:": "Tẩy vết bẩn:",
    "Charged separately per item (see details below)": "Tính phí riêng biệt theo từng món (xem chi tiết bên dưới)",
    "Optional Add-on": "Tùy chọn thêm",
    "Stain & Yellowing Removal": "Tẩy bẩn & Tẩy ố vàng",
    "Professional treatment for blood stains, yellowing, sweat discoloration, or stubborn spills.": "Xử lý chuyên nghiệp cho vết máu, ố vàng, ố mồ hôi hoặc vết tràn cứng đầu.",
    "Pillowcase": "Bao gối",
    "/ pc": "/ cái",
    "Bedsheet or Duvet Cover": "Drap hoặc Mền",
    "Pillow or Cushion": "Gối hoặc Đệm ngồi",
    "Mattress Topper": "Topper",
    "Curtains & Drapes": "Màn rèm",
    "(White Curtains Only)": "(Chỉ rèm trắng)",
    "/ item": "/ món",
    "* Note: Extremely aged stains or heat-set discolorations might not be 100% restorable. We always inspect and advise beforehand.": "* Lưu ý: Các vết bẩn quá lâu ngày hoặc vết ố đã bám sâu vào sợi vải có thể không thể phục hồi 100%. Chúng tôi sẽ luôn kiểm tra và tư vấn trước cho bạn.",
    "Book Bedding Clean": "Đặt lịch giặt Chăn ga",
    "View Pricing": "Xem bảng giá",
    "Our Bedding Deep Cleaning Process": "Quy trình Làm sạch sâu Chăn ga Gối đệm",
    "Bulky bedding items require high-capacity care. Here is how we ensure your sheets and toppers are 100% clean and dry:": "Chăn ga gối đệm cồng kềnh đòi hỏi thiết bị dung tích lớn. Dưới đây là cách chúng tôi đảm bảo đồ của bạn sạch và khô hoàn toàn:",
    "1. Sorting & Inspection": "1. Phân loại & Kiểm tra",
    "We inspect fabric care labels and pre-treat any noticeable sweat stains or spills on your liners and mattress protector.": "Chúng tôi kiểm tra nhãn mác chất liệu và xử lý trước các vết ố vàng, mồ hôi hoặc vết tràn trên drap và tấm bảo vệ nệm.",
    "2. Hygienic Separate Wash": "2. Giặt riêng biệt Vệ sinh",
    "We wash your bedding separately in large-capacity drums using premium detergents. We never mix your items with others.": "Chúng tôi giặt chăn ga của bạn riêng biệt trong lồng giặt dung tích lớn với nước giặt cao cấp. Tuyệt đối không giặt chung với đồ người khác.",
    "3. High-Temp Machine Dry": "3. Sấy máy Nhiệt độ cao",
    "Drying at optimal high heat guarantees that heavy blankets and thick toppers are completely dry inside out, killing dust mites.": "Sấy ở nhiệt độ cao tối ưu đảm bảo chăn dày và topper được khô hoàn toàn từ trong ra ngoài, tiêu diệt mạt bụi và vi khuẩn.",
    "4. Packaging & Delivery": "4. Gấp gọn & Giao hàng",
    "Items are neatly folded and packed in dust-proof bags, then delivered straight back to your hotel lobby reception desk.": "Đồ sạch được gấp gọn gàng, đóng gói trong túi chống bụi và giao trực tiếp trở lại quầy lễ tân khách sạn.",
    "Flat-Rate Bedding & Linens Services": "Bảng giá Giặt sấy Chăn ga & Gối đệm",
    "Simple weight-based pricing for all bedding items. Returned fresh and dry in 24-36 hours.": "Giá tính theo số ký đơn giản cho tất cả đồ giường. Giao trả sạch thơm và khô ráo trong vòng 24-36 giờ.",
    "Bedsheets & Linens": "Drap giường & Chăn ga",
    "Minimum order: 3kg (~$1.60 USD/kg)": "Tối thiểu: 3kg (~1.60 USD/kg)",
    "Best for bedsheets, pillow covers, duvet covers, bath towels, and light blankets. Washed, dried, and neatly folded.": "Phù hợp nhất cho drap giường, vỏ gối, vỏ chăn, khăn tắm và chăn mỏng. Được giặt sạch, sấy khô và gấp gọn gàng.",
    "Mattress Toppers": "Tấm bảo vệ nệm Topper",
    "Minimum order: 1kg (~$2.40 USD/kg)": "Tối thiểu: 1kg (~2.40 USD/kg)",
    "Deep cleaning and sanitizing for mattress protectors and toppers of all sizes. Assured complete deep drying to prevent internal mildew.": "Làm sạch sâu và khử trùng cho tấm bảo vệ nệm và topper mọi kích thước. Đảm bảo sấy khô hoàn toàn bên trong để ngăn ngừa ẩm mốc.",
    "Curtains & Drapes": "Rèm cửa & Màn cửa",
    "Minimum order: 1kg (~$2.00 USD/kg)": "Tối thiểu: 1kg (~2.00 USD/kg)",
    "Specialist washing for household or homestay curtains. Removes dust, odors, and environmental allergens safely.": "Giặt chuyên nghiệp cho rèm cửa hộ gia đình hoặc homestay. Loại bỏ bụi bẩn, mùi hôi và các tác nhân gây dị ứng một cách an toàn.",
    "Ready for Fresh Bedding?": "Bạn đã sẵn sàng cho một chiếc giường sạch thơm?",
    "Schedule a pickup appointment for your linens, sheets, or toppers today. Free round-trip collection directly at your lobby.": "Đặt lịch lấy chăn drap, vỏ ga hoặc topper của bạn ngay hôm nay. Giao nhận hai chiều miễn phí trực tiếp tại sảnh.",
    "Book Bedding Cleaning Now": "Đặt lịch giặt Chăn ga ngay",
    "Linens & Bedding": "Drap & Chăn ga",
    "Sanitization": "Khử khuẩn",
    "Select Service": "Chọn dịch vụ",
    "Topper: 60k | Curtain: 50k / kg": "Topper: 60k | Rèm cửa: 50k / kg",
    "Delivery:": "Giao nhận:",
    "50,000 VND round-trip (Free if self drop-off/collect)": "50.000 VND khứ hồi (Miễn phí nếu tự mang tới/lấy đồ)",
    "Stain treatment:": "Tẩy vết bẩn:",
    "Charged separately per item (see details below)": "Tính phí riêng biệt theo từng món (xem chi tiết bên dưới)",
    "Optional Add-on": "Tùy chọn thêm",
    "Stain & Yellowing Removal": "Tẩy bẩn & Tẩy ố vàng",
    "Professional treatment for blood stains, yellowing, sweat discoloration, or stubborn spills.": "Xử lý chuyên nghiệp cho vết máu, ố vàng, ố mồ hôi hoặc vết tràn cứng đầu.",
    "Pillowcase": "Bao gối",
    "/ pc": "/ cái",
    "Bedsheet or Duvet Cover": "Drap hoặc Mền",
    "Pillow or Cushion": "Gối hoặc Đệm ngồi",
    "Mattress Topper": "Topper",
    "Curtains & Drapes": "Màn rèm",
    "(White Curtains Only)": "(Chỉ rèm trắng)",
    "/ item": "/ món",
    "* Note: Extremely aged stains or heat-set discolorations might not be 100% restorable. We always inspect and advise beforehand.": "* Lưu ý: Các vết bẩn quá lâu ngày hoặc vết ố đã bám sâu vào sợi vải có thể không thể phục hồi 100%. Chúng tôi sẽ luôn kiểm tra và tư vấn trước cho bạn.",
    "Payment Option *": "Phương thức thanh toán *",
    "Bank transfer (Vietnamese bank only)": "Chuyển khoản (Chỉ ngân hàng VN)",
    "Cash (VND)": "Tiền mặt (VND)",
    "Order Confirmed!": "Đã xác nhận đơn hàng!",
    "Thank you! Your order has been successfully registered with booking code ": "Cảm ơn bạn! Đơn hàng của bạn đã được đăng ký thành công với mã đặt lịch ",
    "Please prepare cash payment of ": "Vui lòng chuẩn bị tiền mặt thanh toán ",
    " when our driver returns your fresh laundry.": " khi tài xế giao trả quần áo sạch thơm cho bạn.",
    "121/10 Le Thi Rieng, Ben Thanh, District 1, HCMC": "121/10 Lê Thị Riêng, Bến Thành, Quận 1, TP. HCM",
    
    // Checkout Modal Translations
    "Confirm Booking": "Xác nhận đặt lịch",
    "Your order has been registered. Please select a chat platform below to send your details and finalize your booking.": "Đơn hàng của bạn đã được ghi nhận. Vui lòng chọn nền tảng chat bên dưới để gửi thông tin và hoàn tất đặt lịch.",
    "Order Details": "Chi tiết đơn hàng",
    "Booking Code:": "Mã đặt lịch:",
    "Service:": "Gói dịch vụ:",
    "Pickup Time:": "Thời gian nhận:",
    "Hotel & Room:": "Khách sạn & Phòng:",
    "Estimated Total:": "Tổng tiền tạm tính:",
    "💬 Send via WhatsApp": "💬 Gửi qua WhatsApp",
    "💬 Send via Zalo (Copy)": "💬 Gửi qua Zalo (Copy)"
  };

  const getTranslation = (text) => {
    const trimmed = text.trim().replace(/\s+/g, ' ');
    if (!trimmed) return null;
    if (TRANSLATIONS[trimmed]) return TRANSLATIONS[trimmed];
    return null;
  };

  const translateDOM = (node, lang) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue.trim().replace(/\s+/g, ' ');
      if (!text) return;
      
      if (!node.origText) {
        node.origText = node.nodeValue;
      }
      
      if (lang === 'vi') {
        const trans = getTranslation(text);
        if (trans) {
          node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), trans);
        }
      } else {
        node.nodeValue = node.origText;
      }
    } else {
      if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE' || node.nodeName === 'SELECT' || node.nodeName === 'OPTION') return;
      for (let i = 0; i < node.childNodes.length; i++) {
        translateDOM(node.childNodes[i], lang);
      }
    }
  };

  const updatePageLanguage = (lang) => {
    localStorage.setItem('site_lang', lang);
    bookingSession.lang = lang; // chatbot language stays in sync!
    
    // Translate all standard text nodes
    translateDOM(document.body, lang);
    
    // Translate placeholders
    document.querySelectorAll('[placeholder]').forEach(el => {
      if (!el.hasAttribute('data-orig-placeholder')) {
        el.setAttribute('data-orig-placeholder', el.getAttribute('placeholder') || '');
      }
      if (lang === 'vi') {
        const trans = getTranslation(el.getAttribute('data-orig-placeholder'));
        if (trans) el.setAttribute('placeholder', trans);
      } else {
        el.setAttribute('placeholder', el.getAttribute('data-orig-placeholder'));
      }
    });

    // Translate select option values
    document.querySelectorAll('select option').forEach(el => {
      if (!el.hasAttribute('data-orig-text')) {
        el.setAttribute('data-orig-text', el.innerText);
      }
      if (lang === 'vi') {
        const trans = getTranslation(el.getAttribute('data-orig-text'));
        if (trans) el.innerText = trans;
      } else {
        el.innerText = el.getAttribute('data-orig-text');
      }
    });

    // Translate page title
    if (!document.documentElement.hasAttribute('data-orig-title')) {
      document.documentElement.setAttribute('data-orig-title', document.title);
    }
    if (lang === 'vi') {
      const trans = getTranslation(document.documentElement.getAttribute('data-orig-title'));
      if (trans) document.title = trans;
    } else {
      document.title = document.documentElement.getAttribute('data-orig-title');
    }

    // Synchronize select values
    document.querySelectorAll('#langSelect').forEach(sel => {
      sel.value = lang;
    });
  };

  // Rates configuration
  const RATES = {
    standard: { price: 40000, minWeight: 3, label: 'Standard Wash & Fold (24h)', unit: 'kg' },
    sameday: { price: 50000, minWeight: 4, label: 'Same-day Wash & Fold (8h-12h)', unit: 'kg' },
    express: { price: 70000, minWeight: 4, label: 'Express Wash & Fold (4h)', unit: 'kg' },
    shoes: { price: 150000, minWeight: 1, label: 'Shoes Cleaning', unit: 'pair', isPerItem: true },
    topper: { price: 60000, minWeight: 1, label: 'Topper Cleaning', unit: 'kg' },
    curtain: { price: 50000, minWeight: 1, label: 'Curtain Cleaning', unit: 'kg' },
    bedding: { price: 40000, minWeight: 3, label: 'Beddings & Linens', unit: 'kg' }
  };

  // Calculator Elements
  const weightInput = document.getElementById('booking-weight');
  const serviceSelect = document.getElementById('booking-service');
  const shipSelect = document.getElementById('booking-ship');
  const whitesCheckbox = document.getElementById('booking-whites');
  const shoesExpressCheckbox = document.getElementById('booking-shoes-express');
  const whitesCheckboxGroup = document.getElementById('whites-checkbox-group');
  const shoesExpressGroup = document.getElementById('shoes-express-group');
  
  const calcWeightDisplay = document.getElementById('calc-weight-display');
  const calcServiceDisplay = document.getElementById('calc-service-display');
  const calcSurchargeLabel = document.getElementById('calc-surcharge-label');
  const calcWhitesDisplay = document.getElementById('calc-whites-display');
  const calcShipDisplay = document.getElementById('calc-ship-display');
  const calcTotalVnd = document.getElementById('calc-total-vnd');
  const calcTotalUsd = document.getElementById('calc-total-usd');

  // Form Elements
  const bookingForm = document.getElementById('whatsappBookingForm');
  const nameInput = document.getElementById('booking-name');
  const whatsappInput = document.getElementById('booking-whatsapp');
  const emailInput = document.getElementById('booking-email');
  const pickupTimeInput = document.getElementById('booking-pickup-time');
  const hotelInput = document.getElementById('booking-hotel');
  const roomInput = document.getElementById('booking-room');
  const mapLinkInput = document.getElementById('booking-map-link');

  const restrictPhoneInput = (inputEl, countrySelectEl) => {
    if (!inputEl || !countrySelectEl) return;
    
    // Prevent typing non-numeric characters (except navigation and control keys)
    inputEl.addEventListener('keypress', (e) => {
      // Allow only numbers
      if (e.key < '0' || e.key > '9') {
        e.preventDefault();
      }
    });

    const cleanAndLimit = () => {
      let val = inputEl.value.replace(/\D/g, '');
      const code = countrySelectEl.value;
      let limit = 12;
      if (code === '+84') {
        limit = val.startsWith('0') ? 10 : 9;
      } else if (code === '+7') {
        limit = val.startsWith('0') ? 11 : 10;
      }
      inputEl.value = val.slice(0, limit);
    };
    inputEl.addEventListener('input', cleanAndLimit);
    countrySelectEl.addEventListener('change', cleanAndLimit);
  };

  const bookingCountryCode = document.getElementById('booking-country-code');
  if (whatsappInput && bookingCountryCode) {
    restrictPhoneInput(whatsappInput, bookingCountryCode);
  }

  if (pickupTimeInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minTimeStr = now.toISOString().slice(0, 16);
    pickupTimeInput.min = minTimeStr;
    pickupTimeInput.value = minTimeStr;
  }

  // Pricing buttons
  const selectServiceBtns = document.querySelectorAll('.select-service-btn');

  // Mobile Hamburger Menu Toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!mobileMenuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('active');
      }
    });
  }

  // 1. Live Calculator Logic
  const updateCalculator = () => {
    if (!weightInput || !serviceSelect) return;

    const service = serviceSelect.value;
    const rateConfig = RATES[service] || RATES.sameday;
    const minWeight = rateConfig.minWeight;

    // Dynamically update min attribute of weightInput
    weightInput.min = minWeight;

    // Dynamically update the input label
    const weightLabel = document.getElementById('weight-input-label');
    if (weightLabel) {
      if (rateConfig.isPerItem) {
        weightLabel.textContent = `Estimated Quantity (${rateConfig.unit}s) *`;
      } else {
        weightLabel.textContent = `Estimated Weight (${rateConfig.unit}) *`;
      }
    }

    let weight = parseFloat(weightInput.value);
    
    // Enforce minimum weight in computation
    if (isNaN(weight) || weight < minWeight) {
      weight = minWeight;
    }

    // Calculate price
    const laundryTotalVnd = weight * rateConfig.price;
    
    // Calculate ship fee
    let shipFeeVnd = 50000;
    if (shipSelect) {
      const shipOption = shipSelect.value;
      if (shipOption === 'roundtrip') shipFeeVnd = 50000;
      else if (shipOption === 'deliveryonly' || shipOption === 'pickuponly') shipFeeVnd = 25000;
      else if (shipOption === 'selfservice') shipFeeVnd = 0;
    }

    // Calculate white clothes or express shoes surcharge
    let surchargeVnd = 0;
    
    if (service === 'shoes') {
      // Toggle checkboxes UI
      if (shoesExpressGroup) shoesExpressGroup.style.display = 'flex';
      if (whitesCheckboxGroup) whitesCheckboxGroup.style.display = 'none';
      if (whitesCheckbox) {
        whitesCheckbox.checked = false;
        whitesCheckbox.disabled = true;
      }
      
      // Calculate Express Shoes (+100k per pair)
      if (shoesExpressCheckbox) {
        shoesExpressCheckbox.disabled = false;
        if (shoesExpressCheckbox.checked) {
          surchargeVnd = weight * 100000;
        }
      }
      
      if (calcSurchargeLabel) calcSurchargeLabel.textContent = 'Express Shoes Surcharge:';
    } else {
      // Toggle checkboxes UI
      if (shoesExpressGroup) shoesExpressGroup.style.display = 'none';
      if (whitesCheckboxGroup) whitesCheckboxGroup.style.display = 'flex';
      if (shoesExpressCheckbox) {
        shoesExpressCheckbox.checked = false;
        shoesExpressCheckbox.disabled = true;
      }
      
      // Calculate separate whites (+30k flat)
      if (whitesCheckbox) {
        whitesCheckbox.disabled = false;
        if (whitesCheckbox.checked) {
          surchargeVnd = 30000;
        }
      }
      
      if (calcSurchargeLabel) calcSurchargeLabel.textContent = 'White Clothes Surcharge:';
    }

    const totalVnd = laundryTotalVnd + shipFeeVnd + surchargeVnd;
    const totalUsd = totalVnd / EXCHANGE_RATE;

    // Format strings
    const formattedVnd = totalVnd.toLocaleString('vi-VN') + ' VND';
    const formattedUsd = `(~$${totalUsd.toFixed(2)} USD)`;

    // Update Live Estimator UI
    if (calcWeightDisplay) {
      calcWeightDisplay.textContent = `${weight} ${rateConfig.unit}${weight > 1 ? 's' : ''}`;
    }
    if (calcServiceDisplay) calcServiceDisplay.textContent = rateConfig.label;
    if (calcWhitesDisplay) calcWhitesDisplay.textContent = surchargeVnd.toLocaleString('vi-VN') + ' VND';
    if (calcShipDisplay) calcShipDisplay.textContent = shipFeeVnd.toLocaleString('vi-VN') + ' VND';
    if (calcTotalVnd) calcTotalVnd.textContent = formattedVnd;
    if (calcTotalUsd) calcTotalUsd.textContent = formattedUsd;
  };

  // URL Parameter Handling for Multi-page redirection pre-fill
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (serviceParam && RATES[serviceParam]) {
    if (serviceSelect) {
      serviceSelect.value = serviceParam;
    }
    if (weightInput) {
      weightInput.value = RATES[serviceParam].minWeight;
    }
  }

  // Update calculator immediately on load
  updateCalculator();

  // Attach events to calculator inputs
  if (weightInput && serviceSelect) {
    weightInput.addEventListener('input', updateCalculator);
    weightInput.addEventListener('change', () => {
      let weight = parseFloat(weightInput.value);
      const service = serviceSelect.value;
      const rateConfig = RATES[service] || RATES.sameday;
      const minVal = rateConfig.minWeight;
      if (isNaN(weight) || weight < minVal) {
        weightInput.value = minVal;
      }
      updateCalculator();
    });

    serviceSelect.addEventListener('change', () => {
      const service = serviceSelect.value;
      const rateConfig = RATES[service] || RATES.sameday;
      weightInput.value = rateConfig.minWeight;
      updateCalculator();
    });

    if (shipSelect) shipSelect.addEventListener('change', updateCalculator);
    if (whitesCheckbox) whitesCheckbox.addEventListener('change', updateCalculator);
    if (shoesExpressCheckbox) shoesExpressCheckbox.addEventListener('change', updateCalculator);
  }

  // 2. Map select buttons in pricing grid to the calculator
  selectServiceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service');
      
      if (serviceSelect) {
        serviceSelect.value = service;
        updateCalculator();
      }

      // Smooth scroll to estimator
      const bookingSection = document.getElementById('booking-section');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 3. Form Redirection and Submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      
      // Get country code and raw phone number
      const countryCodeSelect = document.getElementById('booking-country-code');
      const countryCode = countryCodeSelect ? countryCodeSelect.value : '+84';
      let phoneVal = whatsappInput.value.trim();
      
      // Clean phone number: keep only digits
      phoneVal = phoneVal.replace(/\D/g, '');
      if (phoneVal.startsWith('0')) {
        phoneVal = phoneVal.substring(1);
      }

      // Enforce phone validation rules
      let isValid = true;
      let errorMsg = '';

      if (countryCode === '+84') {
        if (phoneVal.length !== 9) {
          isValid = false;
          errorMsg = 'Số điện thoại Việt Nam phải có đúng 9 chữ số (sau khi bỏ số 0 ở đầu).\nVietnamese phone number must be exactly 9 digits (excluding leading 0).';
        }
      } else if (countryCode === '+7') {
        if (phoneVal.length !== 10) {
          isValid = false;
          errorMsg = 'Số điện thoại Nga phải có đúng 10 chữ số.\nRussian phone number must be exactly 10 digits.';
        }
      } else {
        if (phoneVal.length < 8 || phoneVal.length > 12) {
          isValid = false;
          errorMsg = 'Số điện thoại không hợp lệ. Vui lòng nhập từ 8 đến 12 chữ số.\nPhone number is invalid. Please enter between 8 and 12 digits.';
        }
      }

      // Validate email format
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailVal && !emailRegex.test(emailVal)) {
        alert("Địa chỉ email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: name@example.com).\nInvalid email address. Please enter a valid format (e.g., name@example.com).");
        return;
      }

      if (!isValid) {
        alert(errorMsg);
        return;
      }

      const clientWhatsapp = countryCode + phoneVal;

      const service = serviceSelect.value;
      const pickupTimeRaw = pickupTimeInput.value;
      const pickupTime = pickupTimeRaw ? pickupTimeRaw.replace('T', ' ') : '';
      const hotelAddress = hotelInput.value.trim();
      const roomNumber = roomInput ? roomInput.value.trim() : '';
      const mapLink = mapLinkInput ? mapLinkInput.value.trim() : '';

      // Get pickup method (Lễ tân or Gặp trực tiếp)
      const pickupTypeSelect = document.getElementById('booking-pickup-type');
      const pickupTypeLabel = pickupTypeSelect ? (pickupTypeSelect.value === 'frontdesk' ? 'Leave at hotel front desk (Lễ tân)' : 'Meet directly in lobby (Gặp trực tiếp)') : 'Leave at hotel front desk (Lễ tân)';

      let weight = parseFloat(weightInput.value);
      const rateConfig = RATES[service] || RATES.sameday;
      const minVal = rateConfig.minWeight;
      if (isNaN(weight) || weight < minVal) {
        weight = minVal;
      }

      // Generate unique Booking Code
      const bookingCode = 'NF' + Math.floor(1000 + Math.random() * 9000);

      // Re-calculate total price for template
      const laundryTotalVnd = weight * rateConfig.price;

      // Calculate ship fee
      let shipFeeVnd = 50000;
      let shipLabel = 'Round-trip Pickup & Delivery';
      if (shipSelect) {
        const shipOption = shipSelect.value;
        if (shipOption === 'roundtrip') {
          shipFeeVnd = 50000;
          shipLabel = 'Round-trip Pickup & Delivery';
        } else if (shipOption === 'deliveryonly') {
          shipFeeVnd = 25000;
          shipLabel = 'Return Delivery Only';
        } else if (shipOption === 'pickuponly') {
          shipFeeVnd = 25000;
          shipLabel = 'Pickup Collection Only';
        } else if (shipOption === 'selfservice') {
          shipFeeVnd = 0;
          shipLabel = 'Self Drop-off & Self Collection';
        }
      }

      // Calculate white clothes or express shoes surcharge
      let surchargeVnd = 0;
      let surchargeLabelVi = 'Không';
      let surchargeLabelEn = 'No';

      if (service === 'shoes') {
        if (shoesExpressCheckbox && shoesExpressCheckbox.checked) {
          surchargeVnd = weight * 100000;
          surchargeLabelVi = `Hỏa tốc 24h (+${(weight * 100000).toLocaleString('vi-VN')} VND)`;
          surchargeLabelEn = `Express 24h (+${(weight * 100000).toLocaleString('vi-VN')} VND)`;
        }
      } else {
        if (whitesCheckbox && whitesCheckbox.checked) {
          surchargeVnd = 30000;
          surchargeLabelVi = 'Có (+30.000 VND)';
          surchargeLabelEn = 'Yes (+30,000 VND)';
        }
      }

      const totalVnd = laundryTotalVnd + shipFeeVnd + surchargeVnd;
      const totalUsd = totalVnd / EXCHANGE_RATE;

      const formattedVnd = totalVnd.toLocaleString('vi-VN') + ' VND';
      const formattedUsd = `$${totalUsd.toFixed(2)} USD`;

      const activeBtnId = e.submitter ? e.submitter.id : 'submit-whatsapp';

      // Custom labels based on service type
      const unitLabelVi = rateConfig.isPerItem ? 'Số lượng' : 'Trọng lượng';
      const unitNameVi = rateConfig.isPerItem ? 'đôi' : 'kg';
      const unitLabelEn = rateConfig.isPerItem ? 'Est. Quantity' : 'Est. Weight';
      const unitNameEn = rateConfig.isPerItem ? 'pairs' : 'kg';
      const extraLabelVi = rateConfig.isPerItem ? 'Yêu cầu hoả tốc' : 'Giặt riêng đồ trắng';
      const extraLabelEn = rateConfig.isPerItem ? 'Express 24h Service' : 'Separate White Clothes';

      const paymentMethodSelect = document.getElementById('booking-payment-method');
      const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : 'banktransfer';

      // Define action to proceed to Chat & Payment
      const proceedToChatAndPayment = () => {
        const hotelDetailsStr = `${hotelAddress}, Room: ${roomNumber ? roomNumber : 'Reception'}`;
        const isVi = (localStorage.getItem('site_lang') || 'en') === 'vi';
        
        const messageText = isVi ? 
`Yêu cầu đặt lịch giặt ủi 1997 Laundry
---------------------------------------
📌 Mã đơn: ${bookingCode}
👤 Khách hàng: ${name}
📞 SĐT liên hệ: ${clientWhatsapp}
📦 Gói dịch vụ: ${rateConfig.label}
⚖️ Khối lượng dự kiến: ${weight} kg
🛵 Giao nhận: ${pickupTypeLabel}
🏢 Khách sạn: ${hotelAddress}
${mapLink ? `📍 Bản đồ: ${mapLink}\n` : ''}🚪 Số phòng: ${roomNumber}
⏰ Thời gian nhận đồ: ${pickupTime}
💵 Phương thức thanh toán: ${paymentMethod === 'cash' ? 'Tiền mặt (Cash)' : 'Chuyển khoản (Bank Transfer)'}
💵 Tổng tiền tạm tính: ${formattedVnd} (${formattedUsd})`
:
`1997 Laundry - Laundry Booking Request
---------------------------------------
📌 Booking Code: ${bookingCode}
👤 Customer Name: ${name}
📞 Contact Phone: ${clientWhatsapp}
📦 Service Package: ${rateConfig.label}
⚖️ Est. Weight: ${weight} kg
🛵 Pickup Option: ${pickupTypeLabel}
🏢 Hotel Address: ${hotelAddress}
${mapLink ? `📍 Map: ${mapLink}\n` : ''}🚪 Room Number: ${roomNumber}
⏰ Preferred Pickup Time: ${pickupTime}
💵 Payment Method: ${paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}
💵 Estimated Total: ${formattedVnd} (${formattedUsd})`;

        const activeBtnId = e.submitter ? e.submitter.id : 'submit-whatsapp';

        if (activeBtnId === 'submit-whatsapp') {
          const waLink = "https://wa.me/84373991602?text=" + encodeURIComponent(messageText);
          window.open(waLink, '_blank');
        } else {
          // Zalo flow: copy to clipboard and open Zalo URL
          navigator.clipboard.writeText(messageText).then(() => {
            alert(isVi ? 
              '📝 Thông tin đặt lịch đã được sao chép vào bộ nhớ tạm!\n\nĐang mở Zalo. Vui lòng dán (paste) nội dung đã sao chép vào khung chat Zalo với chúng tôi để gửi thông tin đặt lịch.' :
              '📝 Booking details copied to clipboard!\n\nOpening Zalo. Please paste the copied details into our Zalo chat to complete your booking.'
            );
            window.open('https://zalo.me/0373991602', '_blank');
          }).catch(() => {
            window.open('https://zalo.me/0373991602', '_blank');
          });
        }
      };

      // Send data to PHP API Webhook, then execute checkout popup
      fetch('api.php?action=booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingCode: bookingCode,
          name: name,
          phone: clientWhatsapp,
          email: emailInput ? emailInput.value.trim() : '',
          service: rateConfig.label,
          weight: weight,
          shipFee: shipFeeVnd,
          surcharge: surchargeVnd,
          totalVnd: totalVnd,
          hotelAddress: hotelAddress,
          roomNumber: roomNumber ? roomNumber : 'Reception',
          mapLink: mapLink,
          pickupTime: pickupTime,
          pickupMethod: pickupTypeLabel,
          separateWhites: service === 'shoes' ? (shoesExpressCheckbox && shoesExpressCheckbox.checked ? 'Express 24h' : 'No') : (whitesCheckbox && whitesCheckbox.checked ? 'Yes' : 'No'),
          paymentMethod: paymentMethod
        })
      })
      .then(() => {
        proceedToChatAndPayment();
      })
      .catch(err => {
        console.error('Booking API failed:', err);
        proceedToChatAndPayment(); // Proceed even if webhook fails so UX isn't blocked
      });
    });
  }

  // 4. FAQ Accordion Functionality
  const accordionTriggers = document.querySelectorAll('.faq-accordion-trigger');

  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parentItem = trigger.parentElement;
      const contentPanel = trigger.nextElementSibling;
      const isActive = parentItem.classList.contains('active');

      // Close all other accordion items first
      document.querySelectorAll('.faq-accordion-item').forEach(item => {
        item.classList.remove('active');
        const panel = item.querySelector('.faq-accordion-content');
        if (panel) panel.style.maxHeight = null;
      });

      // Toggle current
      if (!isActive) {
        parentItem.classList.add('active');
        contentPanel.style.maxHeight = contentPanel.scrollHeight + 'px';
      } else {
        parentItem.classList.remove('active');
        contentPanel.style.maxHeight = null;
      }
    });
  });

  // 5. Testimonials Carousel Navigation & Center Card Highlight
  const testimonialsWrapper = document.querySelector('.testimonials-wrapper');
  const testimonialsGrid = document.querySelector('.testimonials-grid');
  const prevBtn = document.getElementById('prevReviewBtn');
  const nextBtn = document.getElementById('nextReviewBtn');

  if (testimonialsWrapper && testimonialsGrid && prevBtn && nextBtn) {
    let currentScroll = 0;

    const cards = Array.from(testimonialsGrid.children);

    const getScrollStep = () => {
      const card = testimonialsGrid.firstElementChild;
      if (!card) return 320;
      const gap = parseFloat(window.getComputedStyle(testimonialsGrid).gap) || 24;
      return card.offsetWidth + gap;
    };

    const updateActiveCard = () => {
      if (cards.length === 0) return;

      const wrapperCenter = testimonialsWrapper.scrollLeft + (testimonialsWrapper.clientWidth / 2);

      let closestCard = null;
      let minDiff = Infinity;

      cards.forEach(card => {
        const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
        const diff = Math.abs(cardCenter - wrapperCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestCard = card;
        }
      });

      cards.forEach(card => {
        if (card === closestCard) {
          card.classList.add('active-card');
        } else {
          card.classList.remove('active-card');
        }
      });
    };

    const centerCard = (card, smooth = false) => {
      const cardCenterOffset = card.offsetLeft - (testimonialsWrapper.clientWidth / 2) + (card.offsetWidth / 2);
      const maxScroll = testimonialsWrapper.scrollWidth - testimonialsWrapper.clientWidth;
      currentScroll = Math.max(0, Math.min(cardCenterOffset, maxScroll));
      testimonialsWrapper.scrollTo({
        left: currentScroll,
        behavior: smooth ? 'smooth' : 'auto'
      });
      // Force immediate highlight check
      updateActiveCard();
    };

    // Center a card when clicked
    cards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        centerCard(card, true);
      });
    });

    nextBtn.addEventListener('click', () => {
      const step = getScrollStep();
      const maxScroll = testimonialsWrapper.scrollWidth - testimonialsWrapper.clientWidth;
      currentScroll = Math.min(currentScroll + step, maxScroll);
      testimonialsWrapper.scrollTo({
        left: currentScroll,
        behavior: 'smooth'
      });
    });

    prevBtn.addEventListener('click', () => {
      const step = getScrollStep();
      currentScroll = Math.max(currentScroll - step, 0);
      testimonialsWrapper.scrollTo({
        left: currentScroll,
        behavior: 'smooth'
      });
    });

    // Sync state if user swipes or scrolls natively
    testimonialsWrapper.addEventListener('scroll', () => {
      currentScroll = testimonialsWrapper.scrollLeft;
      updateActiveCard();
    });

    // Sync with resize
    window.addEventListener('resize', updateActiveCard);
    
    // Auto-center Card 2 (index 1) on load so it starts highlighted and centered
    const initCarousel = () => {
      if (cards.length > 1) {
        centerCard(cards[1], false);
      } else {
        updateActiveCard();
      }
    };

    window.addEventListener('load', initCarousel);
    // Fallback timers to ensure layout is ready
    if (document.readyState === 'complete') {
      setTimeout(initCarousel, 150);
    } else {
      setTimeout(initCarousel, 300);
    }
  }

  // Run initial calculator update
  updateCalculator();

  // 6. Dynamic Team Rendering
  const teamMembers = [
    { image: "team_member_1.jpg" },
    { image: "team_member_2.jpg" },
    { image: "team_member_3.jpg" },
    { image: "team_member_4.jpg" },
    { image: "team_member_5.jpg" },
    { image: "team_member_6.jpg" },
    { image: "team_member_7.jpg" },
    { image: "team_member_8.jpg" }
  ];
  const teamContainer = document.getElementById('teamCardsContainer');
  if (teamContainer) {
    teamContainer.innerHTML = teamMembers.map((member) => {
      return `
        <div class="team-photo-card">
          <div class="team-img-wrapper">
            <img src="${member.image}" alt="1997 Laundry Team Photo" class="team-img">
          </div>
        </div>
      `;
    }).join('');
  }

  // 7. Survey Form Control & Checkbox Limit
  const surveyCheckboxes = document.querySelectorAll('.survey-importance-checkbox');
  const maxAllowedCheckboxes = 2;

  surveyCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const checkedCheckboxes = document.querySelectorAll('.survey-importance-checkbox:checked');
      if (checkedCheckboxes.length > maxAllowedCheckboxes) {
        checkbox.checked = false;
        alert("Please choose up to 2 options only!");
      }
    });
  });

  const surveyForm = document.getElementById('preferencesSurveyForm');
  const surveySubmitBtn = document.getElementById('surveySubmitBtn');
  const surveySuccessMsg = document.getElementById('surveySuccessMsg');
  const surveyContactInput = document.getElementById('survey-contact');

  const surveyCountryCode = document.getElementById('survey-country-code');
  if (surveyContactInput && surveyCountryCode) {
    restrictPhoneInput(surveyContactInput, surveyCountryCode);
  }

  if (surveyForm && surveySubmitBtn && surveySuccessMsg) {
    surveyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const countryCodeSelect = document.getElementById('survey-country-code');
      const contactInput = document.getElementById('survey-contact');
      const hiddenPhoneInput = document.getElementById('survey-full-phone');

      if (countryCodeSelect && contactInput && hiddenPhoneInput) {
        const countryCode = countryCodeSelect.value;
        let phoneVal = contactInput.value.trim();

        // Clean phone number: keep only digits
        phoneVal = phoneVal.replace(/\D/g, '');
        if (phoneVal.startsWith('0')) {
          phoneVal = phoneVal.substring(1);
        }

        // Validate phone number
        let isValid = true;
        let errorMsg = '';

        if (countryCode === '+84') {
          if (phoneVal.length !== 9) {
            isValid = false;
            errorMsg = 'Số điện thoại Việt Nam phải có đúng 9 chữ số (sau khi bỏ số 0 ở đầu).\nVietnamese phone number must be exactly 9 digits (excluding leading 0).';
          }
        } else if (countryCode === '+7') {
          if (phoneVal.length !== 10) {
            isValid = false;
            errorMsg = 'Số điện thoại Nga phải có đúng 10 chữ số.\nRussian phone number must be exactly 10 digits.';
          }
        } else {
          if (phoneVal.length < 8 || phoneVal.length > 12) {
            isValid = false;
            errorMsg = 'Số điện thoại không hợp lệ. Vui lòng nhập từ 8 đến 12 chữ số.\nPhone number is invalid. Please enter between 8 and 12 digits.';
          }
        }

        // Validate email format
        const surveyEmailInput = document.getElementById('survey-email');
        const emailValSurvey = surveyEmailInput ? surveyEmailInput.value.trim() : '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailValSurvey && !emailRegex.test(emailValSurvey)) {
          alert("Địa chỉ email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: name@example.com).\nInvalid email address. Please enter a valid format (e.g., name@example.com).");
          return;
        }

        if (!isValid) {
          return;
        }

        // Set hidden input value to combined phone number
        hiddenPhoneInput.value = countryCode + phoneVal;
      }

      // Disable button during submission and show loading visual feedback
      surveySubmitBtn.disabled = true;
      const originalText = surveySubmitBtn.innerHTML;
      surveySubmitBtn.innerHTML = 'Submitting... 🧼';

      // Construct form data to submit
      const formData = new FormData(surveyForm);

      // Submit in the background to prevent any race condition
      fetch('api.php?action=survey', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // Show success message and hide button
        surveySubmitBtn.style.display = 'none';
        surveySuccessMsg.style.display = 'block';
        surveyForm.reset();
      })
      .catch(err => {
        console.error("Survey submission failed: ", err);
        surveySubmitBtn.innerHTML = originalText;
        surveySubmitBtn.disabled = false;
        // Fallback to show success anyway for client UX
        surveySubmitBtn.style.display = 'none';
        surveySuccessMsg.style.display = 'block';
        surveyForm.reset();
      });
    });
  }

  // 8. Chatbot widget logic
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotBody = document.getElementById('chatbotBody');
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotBookBtn = document.getElementById('chatbotBookBtn');

  // Hide the footer redirection button permanently as per request
  if (chatbotBookBtn) {
    chatbotBookBtn.style.display = 'none';
  }

  // State machine for single-turn booking details collection
  let bookingSession = {
    active: false,
    step: 0, // 0: inactive, 1: waiting for user details, 2: waiting for confirmation
    userResponseText: '',
    lang: 'en', // Default to English
    waitingForAssistanceReply: false,
    data: {
      packageId: 'sameday',
      packageName: 'Same-day Wash & Fold'
    }
  };

  // Language detection
  const detectLanguage = (text) => {
    const normalized = text.toLowerCase();
    
    // 1. Check for Vietnamese accented characters
    const viAccentRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    if (viAccentRegex.test(normalized)) {
      return 'vi';
    }
    
    // 2. Common Vietnamese words (with or without accents)
    const viWords = [
      'giặt', 'sấy', 'gói', 'lấy', 'giao', 'khách', 'sạn', 'phòng', 'đồ', 'trắng', 'bao', 'nhiêu', 'tiền', 'ngày',
      'hủy', 'không', 'nhận', 'lễ', 'tân', 'sảnh', 'chuyển', 'khoản', 'mặt', 'đúng', 'sửa', 'chưa', 'tách',
      'thanh', 'toán', 'co', 'khong', 'muon', 'dat', 'lich', 'nha', 'nhe', 'giat', 'say', 'goi', 'lay', 'khach', 'san',
      'phong', 'do', 'trang', 'bao', 'nhieu', 'tien', 'ngay', 'huy', 'nhan', 'le', 'tan', 'sanh', 'chuyen', 'khoan',
      'dung', 'sua', 'chua', 'tach', 'thanh', 'toan', 'de', 'toi', 'nghi', 'them', 'can', 'nhac', 'lo', 'ngai', 'gi',
      'a', 'da', 'vang', 'lam', 'sao', 'the', 'nao', 'nay', 'mai', 'chào', 'chao', 'xin'
    ];
    
    // Common English words
    const enWords = [
      'wash', 'fold', 'dry', 'pickup', 'delivery', 'hotel', 'room', 'whites', 'how', 'much', 'price', 'pricing', 'cost',
      'rate', 'fee', 'charge', 'payment', 'check', 'in', 'check-in', 'reception', 'lobby', 'cancel', 'no', 'yes', 'edit',
      'time', 'name', 'address', 'think', 'more', 'about', 'decide', 'later', 'please', 'we', 'us', 'our', 'what',
      'can', 'do', 'you', 'your', 'me', 'i', 'my', 'to', 'the', 'a', 'it', 'is', 'are', 'am', 'be', 'have', 'line', 'air', 'hang', 'low', 'heat', 'temp', 'temperature', 'lowheat', 'hi', 'hello', 'hey'
    ];
    
    let viCount = 0;
    let enCount = 0;
    
    // Split text into words
    const words = normalized.split(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/i);
    
    words.forEach(w => {
      if (!w) return;
      if (viWords.includes(w)) viCount++;
      if (enWords.includes(w)) enCount++;
    });
    
    if (viCount > enCount) return 'vi';
    if (enCount > viCount) return 'en';
    return null;
  };

  // Sales Script data object (bilingual)
  const salesScript = {
    en: {
      greeting: "✨ <strong>Thank you for choosing 1997 Laundry!</strong> ✨<br><br>Please note that pickups are available today from 9:00 AM to 5:00 PM only.<br><br>Please select your preferred service below to see details or start booking:",
      packages: {
        sameday: {
          title: "Same-day Wash & Fold",
          details: "<strong>Same-day Wash & Fold Package Details</strong>:<br>• <strong>Price</strong>: 250,000 VND for up to 4 kg base, then 50,000 VND per extra kg.<br>• <strong>Turnaround</strong>: Returned by 7–9 PM same day (if picked up before 2 PM).<br>• <strong>VAT</strong>: 10% included.<br>• <strong>Separate Whites</strong>: +30,000 VND surcharge.",
        },
        express: {
          title: "4-hour Express Wash & Fold",
          details: "<strong>4-hour Express Wash & Fold Package Details</strong>:<br>• <strong>Price</strong>: 330,000 VND for up to 4 kg base, then 70,000 VND per extra kg.<br>• <strong>Turnaround</strong>: Delivered back in 4 hours.<br>• <strong>VAT</strong>: 10% included.<br>• <strong>Separate Whites</strong>: +30,000 VND surcharge.",
        },
        standard: {
          title: "Standard Wash & Fold 24h",
          details: "<strong>Standard Wash & Fold 24h Package Details</strong>:<br>• <strong>Price</strong>: 170,000 VND for up to 3 kg base, then 40,000 VND per extra kg.<br>• <strong>Turnaround</strong>: Ready in 24 hours.<br>• <strong>Separate Whites</strong>: +30,000 VND surcharge.",
        },
        other: {
          title: "Other Services",
          details: "<strong>Other Premium Cleaning Services</strong>:<br>• <strong>Shoes Cleaning</strong>: Deep clean by hand (Sneakers & Canvas: 150,000 VND / pair | Premium Leather & Suede: 220,000 VND / pair. Express 24h: +100,000 VND / pair. Delivery fee: 50,000 VND round-trip).<br>• <strong>Mattress Toppers</strong>: 60,000 VND / kg (24h turnaround).<br>• <strong>Curtains</strong>: 50,000 VND / kg.<br>• <strong>Beddings & Linens</strong>: 40,000 VND / kg (3kg min)."
        }
      },
      questions: [
        {
          id: "identity",
          short: "ℹ️ Who are you?",
          keywords: ["who are you", "what are you", "your name", "introduce yourself", "bạn là ai", "ban la ai", "ai day", "ai đấy", "tên gì", "ten gi", "what can you do", "your function", "capabilities"],
          response: "I am 1997 Laundry Assistant, your premium hotel laundry pickup and delivery service in Saigon."
        },
        {
          id: "greeting",
          short: "👋 Greeting",
          keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings", "chào", "xin chào", "xin chao"],
          response: "Hello! How can I help you today? Please select one of our services below or ask me any questions."
        },
        {
          id: "unsupported_query",
          short: "⚠️ Special Materials & Items",
          keywords: ["dry clean", "dryclean", "drycleaning", "steam clean", "steam cleaning", "iron", "ironing", "giặt ủi", "giặt khô", "giat ui", "giat kho", "ủi", "ủi đồ", "leather jacket", "leather clothes", "leather clothing", "leather coat", "silk", "wool", "cashmere", "blazer", "blazers", "suit", "suits", "designer", "embellished", "dry clean only", "ao dai", "traditional dress", "spa", "restore", "restoration", "luxury", "wedding dress", "wedding gown", "wedding dresses", "puffer jacket", "puffer jackets", "down jacket", "down jackets"],
          response: "⚠️ Sorry, 1997 Laundry **does not currently offer dry cleaning, steam cleaning, or individual ironing services**.<br>• **Details**: We specialize strictly in automated Wash & Fold (laundry by weight) and hand-wash shoe cleaning. Delicate or dry-clean-only garments such as <strong>suits, blazers, silk (including traditional Ao Dai), leather, wool, cashmere, wedding dresses, down/puffer jackets, or heavily embellished items...</strong> require specialized dry cleaning or hand-wash care to prevent fabric damage or loss of shape.<br>• To protect your special garments, we are unable to accept them for cleaning. We appreciate your kind understanding!"
        },
        {
          id: "whites",
          short: "🧺 Washing Whites",
          keywords: ["white", "whites", "color", "separate", "tách", "đồ trắng", "màu"],
          response: "Yes. For all Standard, Same-day and Express orders, separate washing for white or light-colored clothes is available for a surcharge of 30,000 VND."
        },
        {
          id: "hygiene_query",
          short: "🧼 100% Separate Wash",
          keywords: ["separate wash", "mixed", "mix", "hygiene", "cleanliness", "giặt chung", "giat chung", "giặt riêng", "giat rieng"],
          response: "🧼 <strong>100% Separate Wash Guarantee</strong>: 1997 Laundry guarantees that each customer's clothes are washed separately in dedicated machines. We <strong>NEVER mix or combine laundry</strong> from different customers to ensure maximum hygiene!"
        },
        {
          id: "drying_query",
          short: "💨 100% Machine Dried",
          keywords: ["dryer", "machine dry", "fully dried", "suitcase", "pack", "máy sấy", "sấy khô", "vali"],
          response: "💨 <strong>100% Machine Dried</strong>: Your clothes are fully machine-dried and folded, meaning they are ready to be packed directly into your suitcase or closet without any dampness!"
        },
        {
          id: "detergent_query",
          short: "🌸 Detergent & Fragrance",
          keywords: ["detergent", "softener", "fragrance", "smell", "scent", "sensitive", "allergy", "nước giặt", "nuoc giat", "nước xả", "nuoc xa"],
          response: "🌸 <strong>Detergent & Softener</strong>: We use premium, skin-friendly detergents and softeners with a light, clean scent. If you have sensitive skin or prefer fragrance-free washing, please let our staff know when booking!"
        },
        {
          id: "compensation_query",
          short: "🛡️ Loss & Damage Policy",
          keywords: ["compensation", "lost", "lose", "damage", "damaged", "ruined", "mất đồ", "mat do", "hỏng đồ", "hong do", "đền"],
          response: "💝 <strong>1997 Laundry Cares for Your Clothes:</strong><br>• To ensure the highest level of care, we specialize in standard Wash & Fold and hand-wash shoes. Please review our <strong>⚠️ Special Materials</strong> list in the menu (we do not accept silk, leather, wool, blazers, or dry-clean-only items).<br>• In the rare event of damage or loss to standard wash-and-fold clothes caused by our service, we will compensate based on the actual value of the item or up to a maximum of 500,000 VND per item. We sincerely appreciate your understanding and cooperation in helping us protect your garments!"
        },
        {
          id: "color_bleed_query",
          short: "🎨 Color Bleeding",
          keywords: ["color bleed", "color run", "color bleeding", "faded", "phai màu", "phai mau", "lem màu", "lem mau"],
          response: "🎨 <strong>Color Bleeding & Special Care</strong>:<br>• <strong>Drying Preferences</strong>: Please notify us in advance of any items that cannot be machine-dried; we will hang-dry them naturally instead.<br>• <strong>Color Bleeding Disclaimer</strong>: We cannot provide compensation or additional support for items that bleed or fade due to fabric dye quality or when colors run within the same order's colored load."
        },
        {
          id: "thankyou",
          short: "🙏 Thank you",
          keywords: ["thank", "thanks", "tks", "thank you", "cảm ơn", "cam on", "cảm ơn bạn"],
          response: "Thank you for contacting us. Do you need any further assistance?"
        },
        {
          id: "support_query",
          short: "❓ Support Inquiry",
          keywords: ["ad ơi", "cho hỏi", "admin", "ad oi", "cho hoi", "hey ad", "excuse me", "can i ask", "i have a question"],
          response: "Yes, how can I support you?"
        },
        {
          id: "office_clothes_query",
          short: "👔 Office Wear & Shape Keeping",
          keywords: ["công sở", "cong so", "đồ công sở", "do cong so", "quần tây", "quan tay", "áo sơ mi công sở", "so mi cong so", "vải công sở", "sơ mi đi làm", "so mi di lam", "office clothes", "office wear", "work clothes", "workwear"],
          response: "👔 For office wear that requires shape keeping and pressing, we are **unable to accept these items** for cleaning.<br>• **Reason**: Office clothing typically requires ironing or professional dry cleaning to maintain its shape, whereas 1997 Laundry specializes strictly in Wash & Fold services and does not offer ironing. If sent for standard wash & fold, these items will wrinkle and lose their pressed shape. We sincerely appreciate your understanding!"
        },
        {
          id: "shirt_query",
          short: "👕 Shirt Pricing",
          keywords: ["shirt", "shirts", "t-shirt", "t-shirts", "áo sơ mi", "sơ mi", "ao so mi", "so mi"],
          response: "We calculate shirt laundry pricing based on the weight of the wash & fold package you choose. Please note: We do not offer dry cleaning or ironing (laundry with ironing) services, only wash & fold. You can refer to our packages below:"
        },

        {
          id: "bleach_query",
          short: "🧼 Stain Removal / Bleaching",
          keywords: ["bleach", "bleaching", "stain", "stains", "stain removal", "stubborn stain", "tẩy", "tay", "tẩy đồ", "tay do", "tẩy ố", "tay o", "tẩy vết bẩn", "tay vet ban"],
          response: "🧼 Sorry, we do not currently offer specialized bleaching, stain removal, or deep stain treatment services.<br>• **Details**: 1997 Laundry specializes strictly in standard automated Wash & Fold services. Normal dirt and sweat will be thoroughly cleaned, but stubborn stains (such as old yellow stains, ink, oil, or dye) cannot be removed without specialized chemical treatments which we do not perform.<br>• We appreciate your kind understanding!"
        },
        {
          id: "dryclean_query",
          short: "🧺 Dry Clean & Ironing",
          keywords: ["dry clean", "dryclean", "drycleaning", "steam clean", "steam cleaning", "iron", "ironing", "giặt ủi", "giặt khô", "giat ui", "giat kho", "ủi", "ủi đồ", "leather jacket", "leather clothes", "leather clothing", "leather coat", "silk", "wool", "cashmere", "blazer", "blazers", "suit", "suits", "designer", "embellished", "dry clean only", "ao dai", "traditional dress", "spa", "restore", "restoration", "luxury", "wedding dress", "wedding gown", "wedding dresses", "puffer jacket", "puffer jackets", "down jacket", "down jackets"],
          response: "⚠️ Sorry, 1997 Laundry **does not currently offer dry cleaning, steam cleaning, or individual ironing services**.<br>• **Details**: We specialize strictly in automated Wash & Fold (laundry by weight) and hand-wash shoe cleaning. Delicate or dry-clean-only garments such as <strong>suits, blazers, silk (including traditional Ao Dai), leather, wool, cashmere, wedding dresses, down/puffer jackets, or heavily embellished items...</strong> require specialized dry cleaning or hand-wash care to prevent fabric damage or loss of shape.<br>• To protect your special garments, we are unable to accept them for cleaning. We appreciate your kind understanding!"
        },
        {
          id: "leather_shoes_query",
          short: "👟 Leather Shoes",
          keywords: ["leather shoe", "leather shoes", "suede shoe", "suede shoes", "leather sneaker", "leather sneakers"],
          response: "👟 <strong>Leather Shoes Cleaning</strong>: Yes, we do! We offer professional hand-detailed cleaning for premium leather and suede shoes at <strong>220,000 VND / pair</strong> (round-trip delivery fee is 50,000 VND)."
        },
        {
          id: "shoes_query",
          short: "👟 Shoes Cleaning Price",
          keywords: ["shoe", "shoes", "sneaker", "sneakers", "giày", "giay", "giặt giày", "giat giay"],
          response: "Our professional hand-detailed shoes cleaning price:<br>• Sneakers & Canvas: 150,000 VND / pair<br>• Premium Leather & Suede: 220,000 VND / pair<br>• Express 24h: +100,000 VND / pair<br>• Delivery fee: 50,000 VND round-trip."
        },
        {
          id: "flight_checkout_query",
          short: "✈️ Flight & Checkout Help",
          keywords: ["bay", "chuyến bay", "chuyen bay", "checkout", "check-out", "check out", "trả phòng", "tra phong", "kịp không", "kip khong", "kịp nhận", "flight", "leave", "leaving", "airport"],
          response: "✈️ <strong>Flight & Checkout Alignment</strong>: We guarantee to deliver your clean laundry on time before your flight or checkout so you can pack your bags and go!<br>• If your flight is at **6 PM**, you can submit your laundry via our **4-Hrs Express** package before **1 PM** on the same day to receive it by 5 PM.<br>• Alternatively, you can submit it the day before via our **Standard 24h** package to have it delivered back the next morning or afternoon!"
        },
        {
          id: "comparison_query",
          short: "💡 Package Comparison",
          keywords: ["khác gì", "khac gi", "khác biệt", "khac biet", "so sánh", "so sanh", "khác nhau", "khac nhau", "gói nào", "goi nao", "lựa chọn", "lua chon", "compare", "difference", "comparison"],
          response: "💡 <strong>Laundry Package Comparison:</strong><br>• <strong>🧺 Standard 24h</strong> (170k for up to 3kg): Best if you are not in a rush. Clean clothes are delivered back after 24 hours.<br>• <strong>☀️ Same-day</strong> (250k for up to 4kg): Same-day delivery. Pick up before 10 AM to receive back before 6 PM on the same day.<br>• <strong>⚡ 4-Hrs Express</strong> (330k for up to 4kg): Clean clothes delivered back in exactly 4 hours from pickup (best for tight schedules, flights, or checkouts)."
        },
        {
          id: "express_start_query",
          short: "⚡ Express Start Time",
          keywords: ["tính từ lúc nào", "tinh tu luc nao", "tính từ khi nào", "tinh tu khi nao", "từ lúc nào", "tu luc nao", "khi nào tính", "khi nao tinh", "4 tiếng", "4 tieng", "4h tính từ", "from when", "start count", "how is 4 hours", "measured from"],
          response: "⚡ <strong>4-Hrs Express Start Time</strong>: The 4-hour countdown begins officially **from the moment our shipper collects your laundry bag from you or your hotel reception desk** until we deliver the clean clothes back to the lobby!"
        },
        {
          id: "rainy_day_query",
          short: "🌧️ Delivery in the Rain",
          keywords: ["trời mưa", "troi mua", "mưa", "mua", "ngập", "ngap", "rain", "rainy", "raining"],
          response: "🌧️ <strong>Delivery in the Rain</strong>: We still support pickup/delivery during rainy days with proper protection!<br>• All clean clothes are packed in **double-layer waterproof bags** to keep them 100% dry and fresh.<br>• If the rain is too heavy, please allow us to reschedule delivery when the rain eases. However, if you need it urgently (flight/checkout soon), please let us know so we can arrange immediate delivery!"
        },
        {
          id: "coverage_query",
          short: "🛵 Coverage Area",
          keywords: ["coverage", "district 1", "district 3", "district 7", "district 2", "thao dien", "binh thanh", "deliver to", "khu vực", "khu vuc", "quận", "quan"],
          response: "🛵 <strong>Service Coverage</strong>: 1997 Laundry offers free pickup and delivery within 6 km (covering most hotels in <strong>District 1, District 3, Binh Thanh, and Thao Dien (District 2)</strong>).<br>For areas further away (such as District 7, District 4, Phu Nhuan,...), we can still support pickup/delivery with a small surcharge of 20,000 VND - 50,000 VND depending on the actual distance from our workspace in District 1!"
        },
        {
          id: "pickup",
          short: "📍 Hotel Pickup Info",
          keywords: ["pickup", "hotel", "reception", "collect", "address", "delivery", "lấy đồ", "khách sạn", "giao", "pick up at", "can you pick up", "do you pick up", "deliver to", "can you deliver", "do you deliver", "ship", "shipping", "delivery fee", "delivery cost", "rain", "rainy", "weather"],
          response: "Yes! Please meet our shipper in the lobby. For hotel security reasons, our shippers cannot go up to private guest rooms. Alternatively, you can also leave your laundry at the reception desk in advance! Free delivery within 6 km (small fee applies if over 6 km)."
        },
        {
          id: "address_query",
          short: "📍 Shop Address",
          keywords: ["address", "location", "drop off myself", "dropoff myself", "where are you", "địa chỉ", "dia chi", "tự mang", "tu mang"],
          response: "📍 <strong>Shop Location & Drop-off</strong>: You can drop off your clothes directly at our laundry workspace at: **121/10 Le Thi Rieng, Ben Thanh, District 1, HCMC**. You can view our direct Google Maps location here: <a href='https://maps.app.goo.gl/gJG1N3VRNuTYXMSy9' target='_blank'>Google Maps Link</a>.<br>Note: Dropping off and collecting yourself gets you a 25,000 VND discount per way (50,000 VND total discount for round-trip)!"
        },
        {
          id: "vat",
          short: "📊 Do you include VAT?",
          keywords: ["vat", "tax", "invoice", "thuế", "hóa đơn"],
          response: "Yes, the Same-day Express and 4-hour Express prices already include 10% VAT."
        },
        {
          id: "linedry",
          short: "🌬️ Air dry / Line dry",
          keywords: ["line dry", "air dry", "hang dry", "no dryer", "phơi", "line-dry", "air-dry", "hang-dry", "no dry", "without dry", "no drying"],
          response: "We do not offer air drying/line drying due to limited space."
        },
        {
          id: "lowheat",
          short: "🔥 Low Heat Drying",
          keywords: ["low heat", "lowheat", "low temperature", "low-heat", "low-temp", "heat dry", "sấy nhiệt thấp", "sấy ấm", "55 độ", "55 degree"],
          response: "We can support low heat drying at 55°C, but please note that some natural fabrics can still shrink."
        },
        {
          id: "payment",
          short: "💳 Payment Methods",
          keywords: ["pay", "payment", "cash", "deposit", "transfer", "thanh toán", "tiền mặt", "chuyển khoản", "trả tiền", "tra tien", "cọc", "coc", "đặt cọc", "dat coc"],
          response: "We accept Cash (VND) upon delivery and Bank Transfers. We only require payment once your laundry is finished and ready for return."
        },
        {
          id: "after5",
          short: "🕒 Pickup after 5 PM?",
          keywords: ["after 5", "5pm", "late pickup", "evening", "sau 5h", "buổi tối", "buoi toi", "sau 5 giờ", "sau 5 gio", "đêm muộn", "dem muon", "lấy muộn", "lay muon", "giao muộn", "giao muon", "buổi đêm", "buoi dem"],
          response: "Our pickup and delivery time is from 7:30 AM to 5:00 PM. If it’s too late today, we can schedule pickup for tomorrow morning."
        },
        {
          id: "express_after5",
          short: "⚡ Express after 5 PM?",
          keywords: ["express after 5", "express late", "hỏa tốc sau 5h"],
          response: "For express service after 5 PM, we likely cannot finish it today because our machines stop at 7:00 PM. In that case, the laundry will be delivered back around 12 PM tomorrow."
        },
        {
          id: "low_weight_query",
          short: "🧺 Minimum Weight & Price",
          keywords: ["1-2kg", "1-2 kg", "1kg", "1 kg", "2kg", "2 kg", "ít đồ", "it do", "ít kg", "it kg", "dưới 3kg", "duoi 3kg", "ít quần áo", "it quan ao", "low weight", "light load", "less than 3kg", "few clothes"],
          response: "The price will depend on the washing package you select. We have a minimum charge per order (minimum 3 kg or 4 kg depending on the package) to guarantee 100% separate washing for your clothes:<br>• **🧺 Standard 24h**: 170,000 VND for up to 3 kg (+40,000 VND per extra kg).<br>• **☀️ Same-day**: 250,000 VND for up to 4 kg (+50,000 VND per extra kg).<br>• **⚡ 4-Hrs Express**: 330,000 VND for up to 4 kg (+70,000 VND per extra kg)."
        },
        {
          id: "weighing_process_query",
          short: "⚖️ How is weight measured?",
          keywords: ["nặng bao nhiêu", "nang bao nhieu", "biết kg", "biet kg", "cân thế nào", "can the nao", "cân như thế nào", "can nhu the nao", "ai cân", "ai can", "cân đồ", "can do", "sao biết cân", "sao biet can", "how do I know weight", "how to weigh", "who weighs", "measured", "weighing"],
          response: "⚖️ <strong>Weighing & Invoicing</strong>: You do not need to weigh your clothes beforehand! Once our shipper brings your laundry back to the shop, we will weigh it to get the exact weight. We will then calculate the total price based on the actual weight and send you a detailed confirmation and invoice before we begin washing!"
        },
        {
          id: "pricing_query",
          short: "💵 Prices & Packages",
          keywords: ["price", "pricing", "cost", "how much", "rate", "fee", "charge", "giá", "bao nhiêu", "tiền", "dịch vụ", "dich vu", "services", "service", "what services"],
          response: "Here is a summary of our main laundry services (including washing, drying, and folding):<br>• <strong>🧺 Standard 24h</strong>: 170,000 VND for up to 3kg (+40,000 VND per extra kg).<br>• <strong>⚡ Same-day</strong>: 250,000 VND for up to 4kg (+50,000 VND per extra kg).<br>• <strong>🚀 Express 4h</strong>: 330,000 VND for up to 4kg (+70,000 VND per extra kg).<br>• <strong>👟 Shoes Cleaning</strong>: 150,000–220,000 VND / pair.<br><br>Please select a package below to see details or book immediately:"
        },
        {
          id: "hesitate_query",
          short: "🤔 Hesitating?",
          keywords: ["think", "suy nghĩ", "suy nghi", "decide", "để sau", "de sau", "later", "think more", "let me think", "consider", "thinking", "nghĩ thêm", "nghi them", "cân nhắc", "can nhac"],
          response: "I understand. May I ask what concerns you still have? Is it the pricing, pickup time, or something else we can help you with?"
        },
        {
          id: "checkin_query",
          short: "🏨 Check-in Hotel First?",
          keywords: ["check in", "check-in", "nhận phòng", "nhan phong"],
          response: "No problem! Please take your time to check in and message us back whenever you are ready. Have a pleasant check-in and stay!"
        }
      ],
      warning: "⚠️ <strong>Important Note</strong>: Please ensure your laundry does not include leather, wool/cashmere, silk, suits/blazers, designer items, dry clean only items, shoes, or heavily embellished items. We are not responsible for these items without prior notice.",
      bookingPrompt: `Great choice! Please reply with the following details in a single message:<br><br>
1️⃣ <strong>Your preferred pickup time</strong>:<br>
2️⃣ <strong>Your name</strong>:<br>
3️⃣ <strong>Address / Hotel Name</strong>:<br>
4️⃣ <strong>Room number</strong>:<br>
5️⃣ <strong>Google Maps Link (Optional)</strong>:<br>
6️⃣ <strong>Preferred pickup option (Optional)</strong>: <em>(e.g., please leave your laundry at the reception for collection)</em><br>
7️⃣ <strong>Do you have white clothes that should be washed separately?</strong> <em>(+30,000 VND)</em> 🧺<br>
8️⃣ <strong>Your Phone/Zalo/WhatsApp Number</strong>:`,
      missingLabels: {
        time: '1️⃣ Your preferred pickup time',
        hotel: '3️⃣ Address / Hotel Name and/or 4️⃣ Room number',
        whites: '7️⃣ Do you have white clothes that should be washed separately? (Yes/No)',
        phone: '8️⃣ Your Phone/Zalo/WhatsApp Number'
      },
      missingIntro: "Thank you! I've received some details, but we are still missing a few pieces of information to complete your booking:<br><br>",
      missingOutro: "<br><br>Please reply with the missing details above!",
      confirmTitle: "📋 <strong>Please confirm your Booking Details:</strong><br><br>",
      confirmLabels: {
        time: "Pickup Time",
        name: "Customer Name",
        hotel: "Address / Hotel Name",
        room: "Room Number",
        option: "Pickup Option",
        service: "Service Type",
        whites: "Separate Whites",
        phone: "Phone Number (Zalo/WhatsApp)"
      },
      confirmOutro: "<br><strong>Is this correct? Please confirm below.</strong>",
      yesConfirmChip: "✅ Yes, Confirm",
      editDetailsChip: "✏️ Re-enter details",
      cancelChip: "❌ Cancel",
      cancelBookingChip: "❌ Cancel Booking",
      submitInstructions: "Click one of the buttons below to send your completed booking details straight to our staff via Zalo or WhatsApp to lock in your slot immediately! 👇 This way, we will have your direct contact so we can keep you updated.",
      cancelGreeting: "Thank you! Please feel free to message us again whenever you need. Have a great day!",
      pricingInfoChip: "💵 Pricing Info",
      pickupInfoChip: "📍 Pickup Info",
      continueBookingChip: "📝 Continue Booking",
      mainMenuChip: "🔙 Main Menu",
      changePackageChip: "🔙 Change Package",
      askQuestionChip: "❓ Ask a Question",
      askAnotherQuestionChip: "❓ Ask Another Question",
      backToMenuChip: "🔙 Back to Menu",
      qnaListIntro: "Here are some common questions about our laundry service. Select one to learn more:",
      proceedBookingChip: "📝 Proceed Booking",
      fallbackMsg: "Sorry, we didn't understand your question. Could you please ask again?",
      newBookingChip: "🛍️ New Booking",
      whitesYes: "Yes",
      whitesNo: "No",
      notProvided: "Not provided",
      guestName: "Guest"
    },
    vi: {
      greeting: "✨ <strong>Cảm ơn bạn đã lựa chọn 1997 Laundry!</strong> ✨<br><br>Lưu ý: Thời gian nhận đồ hôm nay từ 9:00 sáng đến 5:00 chiều.<br><br>Vui lòng chọn dịch vụ bạn quan tâm ở dưới để xem chi tiết hoặc đặt lịch:",
      packages: {
        sameday: {
          title: "Giặt sấy lấy trong ngày (Same-day)",
          details: "<strong>Chi tiết Gói Giặt sấy lấy trong ngày (Same-day)</strong>:<br>• <strong>Giá cước</strong>: 250.000 VND cho 4 kg đầu tiên, mỗi kg tiếp theo +50.000 VND.<br>• <strong>Thời gian trả</strong>: Trả lại lúc 7h–9h tối cùng ngày (nếu lấy trước 2h chiều).<br>• <strong>VAT</strong>: Đã bao gồm 10% VAT.<br>• <strong>Giặt riêng đồ trắng</strong>: Phụ phí +30.000 VND.",
        },
        express: {
          title: "Giặt sấy hỏa tốc 4 tiếng (4-Hrs Express)",
          details: "<strong>Chi tiết Gói Giặt sấy hỏa tốc 4 tiếng (4-Hrs Express)</strong>:<br>• <strong>Giá cước</strong>: 330.000 VND cho 4 kg đầu tiên, mỗi kg tiếp theo +70.000 VND.<br>• <strong>Thời gian trả</strong>: Trả lại sau 4 tiếng kể từ khi nhận đồ.<br>• <strong>VAT</strong>: Đã bao gồm 10% VAT.<br>• <strong>Giặt riêng đồ trắng</strong>: Phụ phí +30.000 VND.",
        },
        standard: {
          title: "Giặt sấy tiêu chuẩn 24h (Standard)",
          details: "<strong>Chi tiết Gói Giặt sấy tiêu chuẩn 24h (Standard)</strong>:<br>• <strong>Giá cước</strong>: 170.000 VND cho 3 kg đầu tiên, mỗi kg tiếp theo +40.000 VND.<br>• <strong>Thời gian trả</strong>: Trả lại sau 24 tiếng.<br>• <strong>Giặt riêng đồ trắng</strong>: Phụ phí +30.000 VND.",
        },
        other: {
          title: "Dịch vụ khác",
          details: "<strong>Dịch vụ vệ sinh cao cấp khác</strong>:<br>• <strong>Giặt giày</strong>: Giặt tay chuyên sâu (Giày thể thao & Vải: 150.000 VND / đôi | Da & Da lộn: 220.000 VND / đôi. Hỏa tốc 24h: +100.000 VND / đôi. Phí ship: 50.000 VND khứ hồi).<br>• <strong>Tấm bảo vệ nệm (Topper)</strong>: 60.000 VND / kg (giao nhận 24h).<br>• <strong>Rèm cửa</strong>: 50.000 VND / kg.<br>• <strong>Chăn ga gối nệm</strong>: 40.000 VND / kg (tối thiểu 3kg)."
        }
      },
      questions: [
        {
          id: "identity",
          short: "ℹ️ Bạn là ai?",
          keywords: ["bạn là ai", "ban la ai", "ai day", "ai đấy", "tên gì", "ten gi", "introduce", "who are you", "what are you", "chức năng", "chuc nang", "làm gì", "lam gi", "làm được gì", "lam duoc gi"],
          response: "Dạ, tôi là trợ lý ảo của 1997 Laundry - dịch vụ giặt sấy cao cấp chuyên giao nhận tận nơi tại các khách sạn ở TP.HCM để hỗ trợ bạn tiện lợi nhất ạ!"
        },
        {
          id: "greeting",
          short: "👋 Chào hỏi",
          keywords: ["xin chào", "xin chao", "chào", "chao", "chào bạn", "hello", "hi", "hey"],
          response: "Dạ 1997 Laundry xin chào bạn! Tiệm có thể giúp gì cho bạn hôm nay ạ? Bạn có thể chọn nhanh dịch vụ bên dưới hoặc đặt câu hỏi trực tiếp cho tiệm nhé!"
        },
        {
          id: "unsupported_query",
          short: "⚠️ Đồ không nhận giặt",
          keywords: ["giặt ủi", "giặt khô", "giat ui", "giat kho", "ủi đồ", "ui do", "ủi", "ui", "giặt hấp", "giat hap", "lụa", "lua", "áo dài", "ao dai", "đồ da", "do da", "áo da", "ao da", "quần da", "quan da", "leather jacket", "silk", "vest", "blazer", "đồ dạ", "ao dạ", "áo dạ", "đồ len", "ao len", "áo len", "hàng hiệu", "hang hieu", "designer", "đính đá", "dinh da", "cườm", "cuorm", "spa hàng hiệu", "spa hang hieu", "phục hồi", "phuc hoi", "spa", "áo cưới", "ao cuoi", "váy cưới", "vay cuoi", "áo phao", "ao phao", "áo khoác phao", "ao khoac phao"],
          response: "⚠️ Dạ tiệm xin lỗi vì hiện tại **1997 Laundry chưa hỗ trợ dịch vụ giặt khô, giặt hấp hoặc ủi phẳng đồ riêng lẻ** bạn nhé ạ.<br>• **Lý do**: Vì 1997 Laundry chuyên cung cấp dịch vụ giặt sấy gập tự động bằng máy (Wash & Fold) và vệ sinh giày bằng tay. Các chất liệu nhạy cảm hoặc chỉ được giặt khô như: <strong>đồ vest/blazer, đồ lụa (bao gồm áo dài lụa), đồ da, len, dạ, áo cưới/váy cưới, áo phao lông vũ, hoặc quần áo đính kết đá/cườm phức tạp...</strong> đòi hỏi quy trình giặt hấp hoặc chăm sóc thủ công riêng biệt để tránh làm hỏng, co rút hay xẹp form dáng vải ạ.<br>• Để đảm bảo an toàn tuyệt đối, tránh hư hỏng cho những trang phục đặc biệt của bạn, tiệm xin phép chưa nhận các món đồ đặc biệt này nhé ạ. Rất mong bạn thông cảm giúp tiệm nha!"
        },
        {
          id: "whites",
          short: "🧺 Giặt riêng đồ trắng",
          keywords: ["white", "whites", "color", "separate", "tách", "đồ trắng", "màu"],
          response: "Dạ có ạ! Đối với các gói Tiêu chuẩn, Lấy trong ngày và Hỏa tốc, tiệm đều hỗ trợ tách giặt riêng đồ trắng hoặc đồ sáng màu với mức phụ phí nhỏ là 30.000đ cho mỗi đơn hàng để đảm bảo đồ của bạn luôn sáng sạch đẹp nhé ạ!"
        },
        {
          id: "hygiene_query",
          short: "🧼 Giặt riêng 100%",
          keywords: ["giặt chung", "giat chung", "giặt riêng", "giat rieng", "chung đồ", "chung do", "riêng máy", "rieng may", "vệ sinh", "ve sinh", "sạch sẽ", "sach se"],
          response: "🧼 Dạ tiệm cam kết giặt riêng 100% cho mỗi khách hàng bạn nhé ạ!<br>• **Quy trình**: Quần áo của bạn luôn được giặt và sấy riêng biệt trong các máy độc lập, tuyệt đối **KHÔNG bao giờ giặt chung hoặc trộn lẫn đồ** của các khách hàng khác nhau.<br>• Tiệm luôn đặt yếu tố vệ sinh và an toàn lên hàng đầu để bạn hoàn toàn yên tâm sử dụng dịch vụ của 1997 Laundry ạ!"
        },
        {
          id: "drying_query",
          short: "💨 Sấy khô 100% xếp vali",
          keywords: ["sấy khô", "say kho", "khô hoàn toàn", "kho hoan toan", "xếp vali", "xep vali", "cất vali", "cat vali", "bỏ vali", "bo vali", "xếp tủ", "xep tu"],
          response: "💨 Dạ đồ của bạn sẽ luôn được sấy khô hoàn toàn 100% trước khi giao trả ạ!<br>• **Quy trình**: Sau khi giặt sạch, tiệm sử dụng máy sấy chuyên dụng để làm khô tuyệt đối và gấp gọn gàng. Bạn có thể xếp ngay vào vali hoặc cất tủ đồ để mang đi di chuyển luôn mà không lo ẩm mốc hay có mùi khó chịu nhé ạ!"
        },
        {
          id: "detergent_query",
          short: "🌸 Nước giặt & Độ thơm",
          keywords: ["nước giặt", "nuoc giat", "nước xả", "nuoc xa", "bột giặt", "bot giat", "thơm", "thom", "mùi", "mui", "chất tẩy", "chat tay"],
          response: "🌸 Dạ tiệm sử dụng nước giặt và nước xả cao cấp, cực kỳ dịu nhẹ và lành tính bạn nhé ạ!<br>• **Độ thơm**: Đồ giặt xong sẽ có hương thơm thoang thoảng, dễ chịu và rất an toàn (phù hợp cho cả làn da nhạy cảm nhất).<br>• Nếu bạn có yêu cầu đặc biệt như không dùng nước xả hoặc chất tạo mùi, bạn vui lòng nhắn trước để tiệm hỗ trợ lưu ý riêng cho đơn đồ của mình nhé ạ!"
        },
        {
          id: "compensation_query",
          short: "🛡️ Chính sách bồi thường",
          keywords: ["mất đồ", "mat do", "hỏng đồ", "hong do", "đền", "den", "đền bù", "den bu", "bồi thường", "boi thuong", "compensation", "lost"],
          response: "💝 <strong>1997 Laundry luôn nâng niu trang phục của bạn:</strong><br>• Để đảm bảo an toàn tốt nhất cho quần áo, tiệm chuyên nhận giặt sấy thông thường (Wash & Fold) và giặt giày tay ạ. Bạn vui lòng xem kỹ danh sách <strong>⚠️ Đồ không hỗ trợ</strong> ở menu chính (tiệm không nhận lụa, đồ da, len, blazer, đồ luxury cần giặt khô).<br>• Trong trường hợp hy hữu xảy ra mất mát hoặc hư hỏng đồ giặt sấy do lỗi của tiệm, tiệm xin phép bồi thường theo **đúng giá trị thực tế của món đồ đó hoặc tối đa là 500.000đ** cho mỗi món đồ để cùng bạn chia sẻ rủi ro nhé ạ. Rất mong bạn thông cảm và đồng hành cùng tiệm để bảo vệ quần áo tốt nhất nhé!"
        },
        {
          id: "color_bleed_query",
          short: "🎨 Phai màu & Lem màu",
          keywords: ["phai màu", "phai mau", "lem màu", "lem mau", "loang màu", "loang mau", "color bleed", "color run"],
          response: "🎨 <strong>Phai màu & Lem màu</strong>:<br>• <strong>Yêu cầu giặt/sấy đặc biệt</strong>: Vui lòng báo trước với tiệm những món đồ không được sấy nhiệt, tiệm sẽ phơi khô tự nhiên thay vì sấy cho bạn nhé.<br>• <strong>Trách nhiệm về phai màu</strong>: Đối với các trường hợp quần áo tự phai màu/lem màu do chất lượng thuốc nhuộm của vải kém hoặc do giặt chung cả mớ đồ màu của cùng một đơn hàng, tiệm xin phép không thể hỗ trợ đền bù thêm ạ!"
        },
        {
          id: "thankyou",
          short: "🙏 Cảm ơn",
          keywords: ["cảm ơn", "cam on", "cảm ơn bạn", "thank", "thanks", "thank you", "tks"],
          response: "Dạ 1997 Laundry rất cảm ơn bạn đã liên hệ ạ! Bạn có cần tiệm hỗ trợ gì thêm thông tin nữa không nhé?"
        },
        {
          id: "support_query",
          short: "❓ Yêu cầu hỗ trợ",
          keywords: ["ad ơi", "cho hỏi", "admin", "ad oi", "cho hoi", "cho em hỏi", "cho minh hoi", "cho mình hỏi", "hỏi tí", "hoi ti"],
          response: "Dạ bạn cần hỗ trợ gì ạ?"
        },
        {
          id: "office_clothes_query",
          short: "👔 Giặt đồ công sở giữ form",
          keywords: ["công sở", "cong so", "đồ công sở", "do cong so", "quần tây", "quan tay", "áo sơ mi công sở", "so mi cong so", "vải công sở", "sơ mi đi làm", "so mi di lam", "office clothes", "office wear", "work clothes", "workwear"],
          response: "👔 Dạ đối với quần áo công sở cần giữ form dáng phẳng phiu, tiệm xin phép **chưa thể nhận giặt** được bạn nhé ạ.<br>• **Lý do**: Vì đồ công sở thường cần được ủi (là) hoặc giặt khô chuyên dụng để giữ đứng form, trong khi 1997 Laundry chỉ chuyên về dịch vụ giặt sấy gập (Wash & Fold) và hiện tại chưa có dịch vụ ủi đồ.<br>• Nếu bạn gửi giặt sấy gập thông thường thì quần áo công sở sẽ dễ bị nhăn và mất form dáng đẹp. Tiệm rất mong bạn thông cảm cho sự bất tiện này nhé ạ!"
        },
        {
          id: "shirt_query",
          short: "👕 Giá giặt áo sơ mi",
          keywords: ["áo sơ mi", "sơ mi", "ao so mi", "so mi", "giặt sơ mi", "giat so mi", "áo thun", "ao thun"],
          response: "👕 Dạ đối với áo sơ mi thông thường (giặt sấy gập), tiệm sẽ tính cước theo cân nặng của gói dịch vụ mà bạn lựa chọn ạ!<br>• **Lưu ý quan trọng**: Tiệm chỉ chuyên dịch vụ giặt sấy gập gọn (Wash & Fold), **KHÔNG nhận giặt khô/giặt hấp** và không có dịch vụ ủi phẳng sơ mi riêng lẻ. Bạn cân nhắc trước khi gửi nhé ạ.<br>• Bạn có thể tham khảo bảng giá các gói giặt sấy gập của tiệm ngay dưới đây nha:"
        },

        {
          id: "bleach_query",
          short: "🧼 Có tẩy ố / tẩy vết bẩn?",
          keywords: ["tẩy đồ", "tay do", "tẩy ố", "tay o", "tẩy trắng", "tay trang", "tẩy vết bẩn", "tay vet ban", "vết bẩn cứng đầu", "vet ban cung dau", "bị dơ", "bi do", "bleach", "stain removal"],
          response: "🧼 Dạ tiệm xin phép **chưa nhận dịch vụ tẩy đồ, tẩy ố hoặc xử lý các vết bẩn cứng đầu chuyên sâu** bạn nhé ạ.<br>• **Lý do**: Vì 1997 Laundry chỉ chuyên cung cấp dịch vụ giặt sấy gập tự động thông thường (Wash & Fold). Các vết bẩn thông thường như bụi bẩn, mồ hôi sẽ được làm sạch tốt, tuy nhiên đối với các vết ố vàng lâu ngày, vết mực, dầu mỡ cứng đầu thì giặt máy thông thường sẽ không thể tự biến mất được nếu không qua quy trình tẩy rửa chuyên biệt bằng hóa chất mạnh.<br>• Tiệm rất mong bạn thông cảm giúp tiệm nhé ạ!"
        },
        {
          id: "dryclean_query",
          short: "🧺 Giặt khô / Giặt ủi",
          keywords: ["giặt ủi", "giặt khô", "giat ui", "giat kho", "ủi đồ", "ui do", "ủi", "ui", "giặt hấp", "giat hap", "lụa", "lua", "áo dài", "ao dai", "đồ da", "do da", "áo da", "ao da", "quần da", "quan da", "leather jacket", "silk", "vest", "blazer", "đồ dạ", "ao dạ", "áo dạ", "đồ len", "ao len", "áo len", "hàng hiệu", "hang hieu", "designer", "đính đá", "dinh da", "cườm", "cuorm", "spa hàng hiệu", "spa hang hieu", "phục hồi", "phuc hoi", "spa", "áo cưới", "ao cuoi", "váy cưới", "vay cuoi", "áo phao", "ao phao", "áo khoác phao", "ao khoac phao"],
          response: "⚠️ Dạ tiệm xin lỗi vì hiện tại **1997 Laundry chưa hỗ trợ dịch vụ giặt khô, giặt hấp hoặc ủi phẳng đồ riêng lẻ** bạn nhé ạ.<br>• **Lý do**: Vì 1997 Laundry chuyên cung cấp dịch vụ giặt sấy gập tự động bằng máy (Wash & Fold) và vệ sinh giày bằng tay. Các chất liệu nhạy cảm hoặc chỉ được giặt khô như: <strong>đồ vest/blazer, đồ lụa (bao gồm áo dài lụa), đồ da, len, dạ, áo cưới/váy cưới, áo phao lông vũ, hoặc quần áo đính kết đá/cườm phức tạp...</strong> đòi hỏi quy trình giặt hấp hoặc chăm sóc thủ công riêng biệt để tránh làm hỏng, co rút hay xẹp form dáng vải ạ.<br>• Để đảm bảo an toàn tuyệt đối, tránh hư hỏng cho những trang phục đặc biệt của bạn, tiệm xin phép chưa nhận các món đồ đặc biệt này nhé ạ. Rất mong bạn thông cảm giúp tiệm nha!"
        },
        {
          id: "leather_shoes_query",
          short: "👟 Vệ sinh giày da",
          keywords: ["giày da", "giay da", "vệ sinh giày da", "ve sinh giay da", "giặt giày da", "giat giay da", "giày da lộn", "giay da lon"],
          response: "👟 Dạ tiệm có nhận vệ sinh giày da và da lộn cao cấp bạn nhé ạ!<br>• **Quy trình & Giá**: Giày sẽ được vệ sinh chuyên sâu hoàn toàn bằng tay tỉ mỉ với mức giá là <strong>220.000đ / đôi</strong>.<br>• Tiệm có hỗ trợ giao nhận tận nơi với phí khứ hồi (2 chiều lấy & giao) là 50.000đ. Bạn có thể bấm nút đặt lịch bên dưới để tiệm cho shipper qua nhận giày nhé ạ!"
        },
        {
          id: "shoes_query",
          short: "👟 Giá giặt giày",
          keywords: ["giày", "giay", "giặt giày", "giat giay", "giày da", "giay da", "sneaker", "sneakers"],
          response: "👟 Dạ 1997 Laundry gửi bạn bảng giá dịch vụ vệ sinh giày chuyên sâu bằng tay tỉ mỉ của tiệm nhé ạ:<br>• **Giày thể thao & Vải Canvas**: 150.000đ / đôi<br>• **Giày da & Da lộn cao cấp**: 220.000đ / đôi<br>• **Gói hỏa tốc lấy sau 24h**: +100.000đ / đôi<br>• **Phí giao nhận khứ hồi (2 chiều)**: 50.000đ.<br>Bạn nhắn lại cho tiệm nếu cần đặt lịch vệ sinh giày nhé ạ!"
        },
        {
          id: "after5",
          short: "🕒 Lấy đồ sau 5h chiều?",
          keywords: ["after 5", "5pm", "late pickup", "evening", "sau 5h", "buổi tối", "buoi toi", "sau 5 giờ", "sau 5 gio", "đêm muộn", "dem muon", "lấy muộn", "lay muon", "giao muộn", "giao muon", "buổi đêm", "buoi dem"],
          response: "🕒 Dạ giờ làm việc và giao nhận của tiệm là từ **7:30 sáng đến 5:00 chiều** hàng ngày ạ.<br>• Nếu hiện tại đã quá giờ lấy đồ của hôm nay, tiệm xin phép được hẹn lịch qua nhận đồ của bạn vào đầu giờ sáng mai được không nhé ạ?<br>• Bạn cứ đặt lịch trước, shipper của tiệm sẽ qua đúng hẹn vào sáng mai nha!"
        },
        {
          id: "express_after5",
          short: "⚡ Giặt hỏa tốc sau 5h chiều?",
          keywords: ["express after 5", "express late", "hỏa tốc sau 5h"],
          response: "⚡ Dạ đối với gói giặt Hỏa tốc sau 5h chiều, tiệm xin phép **chưa thể giao trả đồ ngay trong ngày** được bạn nhé ạ.<br>• **Lý do**: Vì hệ thống máy móc của tiệm sẽ ngừng hoạt động lúc 7h tối để bảo trì, không đủ thời gian 4 tiếng để hoàn thành.<br>• Đơn hàng Hỏa tốc nhận sau 5h chiều sẽ được tiệm ưu tiên giặt sấy vào đầu giờ sáng hôm sau và giao lại cho bạn vào khoảng **12h trưa mai** nha. Rất mong bạn thông cảm giúp tiệm nhé ạ!"
        },
        {
          id: "flight_checkout_query",
          short: "✈️ Giờ bay & Checkout",
          keywords: ["bay", "chuyến bay", "chuyen bay", "checkout", "check-out", "check out", "trả phòng", "tra phong", "kịp không", "kip khong", "kịp nhận", "flight", "leave", "leaving", "airport"],
          response: "✈️ <strong>Giờ bay & Giờ trả phòng (Checkout)</strong>: Tiệm cam kết căn chỉnh thời gian giặt trả đồ khớp chính xác với giờ bay/checkout của bạn để bạn kịp xếp đồ vào vali!<br>• Nếu bạn bay hoặc trả phòng lúc **6h tối**, bạn có thể gửi đồ cho tiệm bằng gói **Hỏa tốc 4H** trước **1h trưa** cùng ngày để nhận lại đồ trước 5h chiều.<br>• Hoặc bạn gửi từ ngày hôm trước bằng gói **Tiêu chuẩn 24H** để tiệm giao lại đồ vào sáng hoặc trưa hôm sau nhé!"
        },
        {
          id: "comparison_query",
          short: "💡 So sánh các Gói giặt",
          keywords: ["khác gì", "khac gi", "khác biệt", "khac biet", "so sánh", "so sanh", "khác nhau", "khac nhau", "gói nào", "goi nao", "lựa chọn", "lua chon", "compare", "difference", "comparison"],
          response: "💡 <strong>So sánh các Gói giặt chính:</strong><br>• <strong>🧺 Tiêu chuẩn 24H</strong> (170k cho 3kg đầu): Phù hợp khi bạn không cần gấp, tiệm sẽ giao lại đồ sạch sau 24 tiếng.<br>• <strong>☀️ Lấy trong ngày</strong> (250k cho 4kg đầu): Giao nhận trong ngày, gửi đồ trước 10h sáng để nhận lại trước 6h chiều cùng ngày.<br>• <strong>⚡ Hỏa tốc 4H</strong> (330k cho 4kg đầu): Nhận lại đồ sạch chỉ sau đúng 4 tiếng từ lúc shipper lấy đồ (thích hợp khi sắp bay/checkout)."
        },
        {
          id: "express_start_query",
          short: "⚡ Thời gian gói Hỏa tốc",
          keywords: ["tính từ lúc nào", "tinh tu luc nao", "tính từ khi nào", "tinh tu khi nao", "từ lúc nào", "tu luc nao", "khi nào tính", "khi nao tinh", "4 tiếng", "4 tieng", "4h tính từ", "from when", "start count", "how is 4 hours", "measured from"],
          response: "⚡ <strong>Thời gian gói Hỏa tốc 4H</strong>: Thời gian 4 tiếng được tính chính thức **kể từ khi shipper của tiệm nhận được đồ từ bạn hoặc quầy lễ tân khách sạn** cho đến lúc giao đồ sạch trở lại sảnh lễ tân nhé!"
        },
        {
          id: "rainy_day_query",
          short: "🌧️ Giao đồ ngày mưa",
          keywords: ["trời mưa", "troi mua", "mưa", "mua", "ngập", "ngap", "rain", "rainy", "raining"],
          response: "🌧️ <strong>Giao nhận ngày mưa</strong>: Tiệm vẫn hỗ trợ giao nhận khi trời mưa để bảo vệ đồ của bạn tốt nhất!<br>• Đồ sạch của bạn sẽ được bọc kín **2 lớp túi chống nước chuyên dụng** để đảm bảo quần áo luôn khô ráo và thơm tho 100% khi đến tay bạn.<br>• Nếu trời mưa quá lớn, cho tiệm xin phép hẹn giao lại khi bớt mưa nhé. Trong trường hợp bạn đang cần gấp (sắp bay/checkout) thì cứ báo lại để tiệm hỗ trợ giao ngay nha!"
        },
        {
          id: "coverage_query",
          short: "🛵 Khu vực phục vụ",
          keywords: ["quận 1", "quan 1", "quận 3", "quan 3", "thảo điền", "thao dien", "quận 2", "quan 2", "quận 7", "quan 7", "bình thạnh", "binh thanh", "khu vực", "khu vuc", "quận nào", "quan nao", "quận", "quan", "district"],
          response: "🛵 <strong>Khu vực phục vụ</strong>: 1997 Laundry phục vụ giao nhận tận nơi và miễn phí vận chuyển trong phạm vi 6km (bao gồm hầu hết khu vực <strong>Quận 1, Quận 3, Bình Thạnh và Thảo Điền (Quận 2)</strong>).<br>Đối với các khu vực xa hơn (như Quận 7, Quận 4, Phú Nhuận,...), tiệm có thể hỗ trợ giao nhận với phụ phí nhỏ từ 20.000đ - 50.000đ tùy khoảng cách thực tế từ xưởng ở Quận 1 nhé!"
        },
        {
          id: "pickup",
          short: "📍 Thông tin Giao Nhận",
          keywords: ["pickup", "hotel", "reception", "collect", "address", "delivery", "lấy đồ", "khách sạn", "giao", "giặt được không", "nhận ở", "lấy ở", "giao ở", "giao đến", "ship đến", "ship được không", "ship", "phí ship", "phi ship", "giá ship", "gia ship", "phí giao", "phi giao", "phí vận chuyển", "phi van chuyen", "trời mưa", "troi mua", "lễ tân", "le tan", "gửi lễ tân", "gui le tan", "sảnh", "sanh", "gửi đồ", "gui do", "nhận đồ", "nhan do"],
          response: "Dạ mình vui lòng gặp shipper tại sảnh ạ. Để đảm bảo an ninh khách sạn, shipper của chúng tôi không thể lên phòng riêng. Ngoài ra, bạn cũng có thể gửi đồ trước tại quầy lễ tân để shipper qua lấy/giao nhé! Tiệm miễn phí giao nhận trong phạm vi 6km (trên 6km có phụ phí nhỏ)."
        },
        {
          id: "address_query",
          short: "📍 Địa chỉ & Tự mang đồ",
          keywords: ["địa chỉ", "dia chi", "tự mang", "tu mang", "đến tiệm", "den tiem", "đến cửa hàng", "den cua hang", "xưởng", "xuong", "address", "location", "drop off myself", "dropoff myself"],
          response: "📍 <strong>Địa chỉ & Tự mang đồ</strong>: Bạn hoàn toàn có thể tự mang đồ qua xưởng giặt của tiệm tại địa chỉ: **121/10 Lê Thị Riêng, Bến Thành, Quận 1, TP.HCM**. Bạn xem vị trí Google Maps trực tiếp tại đây nhé: <a href='https://maps.app.goo.gl/gJG1N3VRNuTYXMSy9' target='_blank'>Google Maps Link</a>.<br>Lưu ý: Tự mang đồ qua và tự lấy sẽ được giảm 25.000đ/lượt (tổng cộng 50.000đ khứ hồi)!"
        },
        {
          id: "vat",
          short: "📊 Đã bao gồm VAT chưa?",
          keywords: ["vat", "tax", "invoice", "thuế", "hóa đơn"],
          response: "📊 Dạ có ạ! Giá của gói Giặt lấy trong ngày và Giặt hỏa tốc 4 tiếng **đã bao gồm 10% VAT** rồi bạn nhé ạ, bạn không cần trả thêm bất kỳ thuế phí nào khác đâu nha."
        },
        {
          id: "linedry",
          short: "🌬️ Phơi tự nhiên (Air dry)",
          keywords: ["line dry", "air dry", "hang dry", "no dryer", "phơi", "tự nhiên", "phơi khô", "line-dry", "air-dry", "hang-dry", "không sấy", "khong say", "không dùng máy sấy", "khong dung may say"],
          response: "🌬️ Dạ tiệm xin lỗi vì hiện tại **chưa hỗ trợ hình thức phơi gió tự nhiên** được bạn nhé ạ.<br>• **Lý do**: Vì xưởng giặt của tiệm tập trung vào quy trình sấy máy tự động khép kín và không có đủ không gian phơi thoáng gió ngoài trời.<br>• Để đảm bảo quần áo khô ráo thơm tho nhất, tiệm đều dùng máy sấy chuyên dụng cao cấp. Rất mong bạn thông cảm giúp tiệm nhé ạ!"
        },
        {
          id: "lowheat",
          short: "🔥 Sấy nhiệt độ thấp",
          keywords: ["low heat", "lowheat", "low temperature", "low-heat", "low-temp", "heat dry", "sấy nhiệt thấp", "sấy ấm", "55 độ", "55 degree"],
          response: "🔥 Dạ tiệm **có thể hỗ trợ sấy nhiệt độ thấp (khoảng 55 độ C)** theo yêu cầu của bạn được nhé ạ!<br>• **Lưu ý**: Đối với một số chất liệu vải sợi tự nhiên đặc thù, việc sấy nhiệt thấp vẫn có thể có tỷ lệ co rút nhỏ xảy ra. Tiệm sẽ lưu ý hết sức, nhưng mong bạn cân nhắc trước khi sấy nhé ạ!"
        },
        {
          id: "payment",
          short: "💳 Phương thức thanh toán",
          keywords: ["pay", "payment", "cash", "deposit", "transfer", "thanh toán", "tiền mặt", "chuyển khoản", "trả tiền", "tra tien", "cọc", "coc", "đặt cọc", "dat coc"],
          response: "💳 Dạ tiệm chấp nhận thanh toán bằng **Tiền mặt (VND)** khi shipper giao trả đồ hoặc **Chuyển khoản ngân hàng** qua mã QR đều được bạn nhé ạ!<br>• **Lưu ý**: Tiệm chỉ tiến hành thu tiền sau khi đồ của bạn đã được giặt sấy sạch sẽ và sẵn sàng giao trả lại sảnh lễ tân cho bạn thôi nha, nên bạn hoàn toàn yên tâm ạ!"
        },
        {
          id: "low_weight_query",
          short: "🧺 Gửi ít đồ (1-2kg) tính thế nào?",
          keywords: ["1-2kg", "1-2 kg", "1kg", "1 kg", "2kg", "2 kg", "ít đồ", "it do", "ít kg", "it kg", "dưới 3kg", "duoi 3kg", "ít quần áo", "it quan ao", "low weight", "light load", "less than 3kg", "few clothes"],
          response: "Dạ giá sẽ tùy theo gói giặt bạn chọn ạ. Tiệm có mức tính giá tối thiểu cho mỗi lần giặt (nhận tối thiểu từ 3kg hoặc 4kg tùy gói) để đảm bảo giặt riêng biệt từng máy 100% cho bạn nhé:<br>• **🧺 Tiêu chuẩn 24H**: 170.000đ cho 3kg đầu (mỗi kg tiếp theo +40.000đ).<br>• **☀️ Lấy trong ngày**: 250.000đ cho 4kg đầu (mỗi kg tiếp theo +50.000đ).<br>• **⚡ Hỏa tốc 4H**: 330.000đ cho 4kg đầu (mỗi kg tiếp theo +70.000đ)."
        },
        {
          id: "weighing_process_query",
          short: "⚖️ Cách cân đồ tính phí?",
          keywords: ["nặng bao nhiêu", "nang bao nhieu", "biết kg", "biet kg", "cân thế nào", "can the nao", "cân như thế nào", "can nhu the nao", "ai cân", "ai can", "cân đồ", "can do", "sao biết cân", "sao biet can", "how do I know weight", "how to weigh", "who weighs", "measured", "weighing"],
          response: "⚖️ <strong>Cân đồ và tính phí</strong>: Bạn không cần tự cân đồ trước đâu ạ! Sau khi shipper mang đồ về tiệm cân có số ký cụ thể, chúng tôi sẽ tính tiền chính xác theo số ký thực tế và gửi thông báo xác nhận cho bạn nhé!"
        },
        {
          id: "pricing_query",
          short: "💵 Bảng giá dịch vụ",
          keywords: ["price", "pricing", "cost", "how much", "rate", "fee", "charge", "giá", "bao nhiêu", "tiền", "dịch vụ", "dich vu", "services", "service", "what services"],
          response: "1997 Laundry gửi bạn bảng giá các dịch vụ chính (đã bao gồm giặt, sấy khô và xếp gọn):<br>• <strong>🧺 Tiêu chuẩn 24H</strong>: 170.000đ cho 3kg đầu (mỗi kg tiếp theo +40.000đ).<br>• <strong>⚡ Lấy trong ngày</strong>: 250.000đ cho 4kg đầu (mỗi kg tiếp theo +50.000đ).<br>• <strong>🚀 Hỏa tốc 4H</strong>: 330.000đ cho 4kg đầu (mỗi kg tiếp theo +70.000đ).<br>• <strong>👟 Giặt giày tay</strong>: 150.000đ – 220.000đ / đôi.<br><br>Vui lòng chọn gói tương ứng ở dưới để đặt lịch hoặc xem chi tiết:"
        },
        {
          id: "hesitate_query",
          short: "🤔 Đang phân vân?",
          keywords: ["think", "suy nghĩ", "suy nghi", "decide", "để sau", "de sau", "later", "nghĩ thêm", "nghi them", "nghĩ đã", "nghi da", "cân nhắc", "can nhac", "suy nghĩ thêm", "suy nghi them"],
          response: "Dạ chúng tôi hoàn toàn hiểu ạ. Xin phép hỏi bạn còn đang có những lo ngại hay băn khoăn gì không ạ? Ví dụ như về giá cả, thời gian nhận trả đồ hay cách thức giao nhận để chúng tôi hỗ trợ tốt nhất cho bạn nhé."
        },
        {
          id: "checkin_query",
          short: "🏨 Nhận phòng khách sạn trước?",
          keywords: ["check in", "check-in", "nhận phòng", "nhan phong"],
          response: "Không sao ạ! Bạn cứ thong thả nhận phòng và nhắn lại cho chúng tôi bất cứ khi nào sẵn sàng nhé. Chúc bạn nhận phòng thuận lợi và có một kỳ nghỉ thật vui vẻ!"
        }
      ],
      warning: "⚠️ <strong>Lưu ý quan trọng</strong>: Vui lòng đảm bảo đồ giặt không bao gồm đồ da, len/dạ, lụa, vest/blazer, đồ hiệu, đồ chỉ giặt khô, giày hoặc đồ đính kết đá/cườm. Chúng tôi không chịu trách nhiệm với các sản phẩm này nếu không được báo trước.",
      bookingPrompt: `Lựa chọn tuyệt vời! Vui lòng gửi lại các thông tin sau trong cùng một tin nhắn:<br><br>
1️⃣ <strong>Thời gian lấy đồ mong muốn</strong>:<br>
2️⃣ <strong>Tên của bạn</strong>:<br>
3️⃣ <strong>Địa chỉ / Tên khách sạn</strong>:<br>
4️⃣ <strong>Số phòng</strong>:<br>
5️⃣ <strong>Link Google Maps (Không bắt buộc)</strong>:<br>
6️⃣ <strong>Hình thức lấy đồ (Không bắt buộc)</strong>: <em>(ví dụ: gửi tại lễ tân khách sạn)</em><br>
7️⃣ <strong>Bạn có đồ trắng cần giặt riêng không?</strong> <em>(+30,000 VND)</em> 🧺<br>
8️⃣ <strong>Số điện thoại (Zalo/WhatsApp)</strong>:`,
      missingLabels: {
        time: '1️⃣ Thời gian lấy đồ mong muốn',
        hotel: '3️⃣ Địa chỉ / Tên khách sạn và/hoặc 4️⃣ Số phòng',
        whites: '7️⃣ Bạn có đồ trắng cần giặt riêng không? (Có/Không)',
        phone: '8️⃣ Số điện thoại (Zalo/WhatsApp)'
      },
      missingIntro: "Cảm ơn bạn! Tôi đã nhận được một số thông tin, nhưng vẫn còn thiếu vài thông tin sau để hoàn thành đặt lịch:<br><br>",
      missingOutro: "<br><br>Vui lòng bổ sung các thông tin còn thiếu ở trên nhé!",
      confirmTitle: "📋 <strong>Vui lòng xác nhận thông tin đặt lịch:</strong><br><br>",
      confirmLabels: {
        time: "Thời gian nhận đồ",
        name: "Tên khách hàng",
        hotel: "Địa chỉ / Khách sạn",
        room: "Số phòng",
        option: "Hình thức nhận đồ",
        service: "Gói dịch vụ",
        whites: "Giặt riêng đồ trắng",
        phone: "Số điện thoại (Zalo/WhatsApp)"
      },
      confirmOutro: "<br><strong>Thông tin trên đã chính xác chưa ạ? Vui lòng xác nhận bên dưới.</strong>",
      yesConfirmChip: "✅ Đúng, Xác Nhận",
      editDetailsChip: "✏️ Nhập lại thông tin",
      cancelChip: "❌ Hủy",
      cancelBookingChip: "❌ Hủy Đặt Lịch",
      submitInstructions: "Nhấn vào một trong các nút dưới đây để gửi trực tiếp thông tin đặt lịch hoàn chỉnh cho nhân viên của chúng tôi qua Zalo hoặc WhatsApp để khóa lịch lấy đồ ngay lập tức! 👇 Bằng cách này, chúng tôi sẽ có liên hệ trực tiếp của bạn để cập nhật tình trạng đơn hàng.",
      cancelGreeting: "Cảm ơn bạn! Hãy cứ nhắn lại cho chúng tôi bất cứ khi nào bạn cần nhé. Chúc bạn một ngày tốt lành!",
      pricingInfoChip: "💵 Thông tin giá",
      pickupInfoChip: "📍 Thông tin nhận đồ",
      continueBookingChip: "📝 Tiếp tục đặt lịch",
      mainMenuChip: "🔙 Menu chính",
      changePackageChip: "🔙 Đổi gói cước",
      askQuestionChip: "❓ Đặt câu hỏi",
      askAnotherQuestionChip: "❓ Câu hỏi khác",
      backToMenuChip: "🔙 Quay lại menu",
      qnaListIntro: "Dưới đây là một số câu hỏi thường gặp về dịch vụ của chúng tôi. Vui lòng chọn một câu hỏi để xem chi tiết:",
      proceedBookingChip: "📝 Đặt lịch ngay",
      fallbackMsg: "Xin lỗi chúng tôi chưa hiểu câu hỏi của bạn, bạn có thể hỏi lại không?",
      newBookingChip: "🛍️ Đặt lịch mới",
      whitesYes: "Có",
      whitesNo: "Không",
      notProvided: "Chưa cung cấp",
      guestName: "Khách hàng"
    }
  };

  let closingIndex = 0;

  const appendBotMessage = message => {
    if (!chatbotBody) return null;
    const messageEl = document.createElement('div');
    const msgId = 'bot_msg_' + Math.random().toString(36).substring(2, 11);
    messageEl.id = msgId;
    messageEl.className = 'chatbot-message bot';
    messageEl.innerHTML = message;
    chatbotBody.appendChild(messageEl);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
    return msgId;
  };

  const appendUserMessage = message => {
    if (!chatbotBody) return;
    const messageEl = document.createElement('div');
    messageEl.className = 'chatbot-message user';
    messageEl.innerText = message;
    chatbotBody.appendChild(messageEl);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  };

  // Render quick replies chips dynamically
  const renderChips = (options) => {
    let chipsContainer = document.querySelector('.chatbot-chips');
    if (!chipsContainer && chatbotBody) {
      chipsContainer = document.createElement('div');
      chipsContainer.className = 'chatbot-chips';
      chatbotBody.parentNode.insertBefore(chipsContainer, chatbotBody.nextSibling);
    }
    
    if (!chipsContainer) return;
    chipsContainer.innerHTML = '';
    
    options.forEach(opt => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chatbot-chip';
      chip.innerText = opt.label;
      chip.addEventListener('click', () => {
        appendUserMessage(opt.label);
        setTimeout(() => handleResponse(opt.id, opt.label), 200);
      });
      chipsContainer.appendChild(chip);
    });
  };

  // Renders the direct WhatsApp and Zalo clipboard buttons inline in chat
  const appendInlineZaloWhatsappButtons = (messageText) => {
    if (!chatbotBody) return;
    const containerEl = document.createElement('div');
    containerEl.className = 'chatbot-message bot';
    containerEl.style.background = 'transparent';
    containerEl.style.border = 'none';
    containerEl.style.boxShadow = 'none';
    containerEl.style.padding = '0.5rem 0';
    containerEl.style.width = '100%';
    
    const waLink = "https://wa.me/84373991602?text=" + encodeURIComponent(messageText);
    const isVi = bookingSession.lang === 'vi';
    const waLabel = isVi ? '💬 Gửi qua WhatsApp' : '💬 Send via WhatsApp';
    const zaloLabel = isVi ? '💬 Gửi qua Zalo (Sao chép thông tin)' : '💬 Send via Zalo (Copy Details)';
    
    containerEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.6rem; width: 100%;">
        <a href="${waLink}" target="_blank" class="pill-button btn-whatsapp" style="display: flex; justify-content: center; align-items: center; text-decoration: none; font-weight: 800; font-size: 0.85rem; padding: 0.75rem 1rem; width: 100%;">
          ${waLabel}
        </a>
        <button id="zaloCopyBtn" type="button" class="pill-button btn-zalo" style="display: flex; justify-content: center; align-items: center; font-weight: 800; font-size: 0.85rem; padding: 0.75rem 1rem; border: none; width: 100%;">
          ${zaloLabel}
        </button>
      </div>
    `;
    
    chatbotBody.appendChild(containerEl);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;

    // Attach copy-paste event to Zalo button
    const zaloBtn = document.getElementById('zaloCopyBtn');
    if (zaloBtn) {
      zaloBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(messageText).then(() => {
          const alertMsg = isVi ? 
            '📝 Thông tin đặt lịch đã được sao chép vào bộ nhớ tạm!\n\nĐang mở Zalo. Vui lòng dán (paste) nội dung đã sao chép vào khung chat Zalo với chúng tôi.' :
            '📝 Booking details copied to clipboard!\n\nOpening Zalo now. Please paste the copied text into our Zalo chat.';
          alert(alertMsg);
          window.open('https://zalo.me/0373991602', '_blank');
        }).catch(err => {
          window.open('https://zalo.me/0373991602', '_blank');
        });
      });
    }
  };

  // Main chatbot response routing (Hybrid Flow)
  const handleResponse = (id, text) => {
    // Language detection first
    const detectedLang = detectLanguage(text);
    if (detectedLang) {
      bookingSession.lang = detectedLang;
    }
    const localScript = salesScript[bookingSession.lang];

    // --- STEP-BY-STEP BOOKING FLOW ACTIVE ---
    if (bookingSession.active) {
      processBookingStep(text, id);
      return;
    }

    // --- DETECT BOOKING INITIATION REQUEST ---
    const isBookingRequest = id === 'proceed_booking' || 
                             id === 'booking' || 
                             id === 'buy' || 
                             (text && (
                               text.toLowerCase().includes('đặt lịch') || 
                               text.toLowerCase().includes('dat lich') || 
                               text.toLowerCase().includes('booking') || 
                               text.toLowerCase().includes('giặt đồ') ||
                               text.toLowerCase().includes('giat do') ||
                               text.toLowerCase().includes('book laundry') ||
                               text.toLowerCase().includes('schedule pickup')
                             ));

    if (isBookingRequest) {
      startBookingFlow();
      return;
    }

    // --- INSTANT STATIC CHIP HANDLERS ---
    if (id === 'sameday' || id === 'express' || id === 'standard' || id === 'other') {
      const pack = localScript.packages[id];
      bookingSession.data.packageId = id;
      bookingSession.data.packageName = pack.title;
      appendBotMessage(pack.details);
      renderChips([
        { id: 'proceed_booking', label: localScript.proceedBookingChip },
        { id: 'back_main', label: localScript.changePackageChip }
      ]);
      return;
    }

    if (id === 'back_main') {
      showInitialMainMenu();
      return;
    }

    if (id === 'qna') {
      appendBotMessage(localScript.qnaListIntro);
      const qnaChips = localScript.questions.slice(0, 5).map(q => ({ id: q.id, label: q.short }));
      qnaChips.push({ id: 'back_main', label: localScript.backToMenuChip });
      renderChips(qnaChips);
      return;
    }

    // Direct match for FAQ ID
    const qMatch = localScript.questions.find(q => q.id === id);
    if (qMatch) {
      appendBotMessage(qMatch.response);
      renderChips([
        { id: 'proceed_booking', label: localScript.proceedBookingChip },
        { id: 'back_main', label: localScript.mainMenuChip }
      ]);
      return;
    }

    // --- DYNAMIC AI AGENT CHAT (Bé Ba) ---
    // Disable input fields to prevent parallel messages
    if (chatbotInput) chatbotInput.disabled = true;
    const submitBtn = chatbotForm ? chatbotForm.querySelector('button[type="submit"]') : null;
    if (submitBtn) submitBtn.disabled = true;

    // Show thinking indicator
    const loadingMsgId = appendBotMessage(bookingSession.lang === 'vi' ? 'Bé Ba đang trả lời... ⏳' : 'Bé Ba is typing... ⏳');
    
    let chatSessionId = localStorage.getItem('chatbot_session_id');
    if (!chatSessionId) {
      chatSessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chatbot_session_id', chatSessionId);
    }

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId: chatSessionId })
    })
    .then(res => res.json())
    .then(data => {
      const loadingEl = document.getElementById(loadingMsgId);
      if (loadingEl) loadingEl.remove();

      // Re-enable inputs
      if (chatbotInput) {
        chatbotInput.disabled = false;
        chatbotInput.focus();
      }
      if (submitBtn) submitBtn.disabled = false;

      if (data.reply) {
        appendBotMessage(data.reply);
      } else {
        appendBotMessage(localScript.fallbackMsg);
      }
    })
    .catch(err => {
      console.error('Chatbot API failed:', err);
      const loadingEl = document.getElementById(loadingMsgId);
      if (loadingEl) loadingEl.remove();

      // Re-enable inputs
      if (chatbotInput) {
        chatbotInput.disabled = false;
        chatbotInput.focus();
      }
      if (submitBtn) submitBtn.disabled = false;

      appendBotMessage(localScript.fallbackMsg);
    });
  };

  // Initialize booking flow state
  const startBookingFlow = () => {
    const lang = bookingSession.lang;
    const localScript = salesScript[lang];

    if (!bookingSession.data.packageId) {
      appendBotMessage(lang === 'vi' ? 
        "Bạn muốn chọn gói giặt nào? Vui lòng chọn một gói bên dưới:" : 
        "Which laundry package would you like to select? Please choose one below:");
      
      renderChips([
        { id: 'sameday', label: lang === 'vi' ? '⚡ Giặt sấy lấy liền' : '⚡ Same-day Wash' },
        { id: 'express', label: lang === 'vi' ? '🚀 Hỏa tốc 4H' : '🚀 4-hour Express' },
        { id: 'standard', label: lang === 'vi' ? '🧺 Tiêu chuẩn 24H' : '🧺 Standard 24h' },
        { id: 'other', label: lang === 'vi' ? '👟 Dịch vụ khác' : '👟 Other Services' },
        { id: 'cancel', label: localScript.cancelBookingChip }
      ]);
      return;
    }

    bookingSession.active = true;
    bookingSession.step = 1;

    const serviceHeader = lang === 'vi' ?
      `📦 <strong>Dịch vụ đã chọn</strong>: ${bookingSession.data.packageName}<br><br>` :
      `📦 <strong>Selected Service</strong>: ${bookingSession.data.packageName}<br><br>`;

    appendBotMessage(serviceHeader + localScript.bookingPrompt);
    renderChips([
      { id: 'cancel', label: localScript.cancelBookingChip }
    ]);
  };

  // Validate and detect missing details in user input
  const checkMissingFields = (text) => {
    const normalized = text.toLowerCase();
    const missing = [];
    const localScript = salesScript[bookingSession.lang];

    // 1. Pickup Time: check numbers + am/pm/h or today/tomorrow/monday/tuesday/etc.
    const timePattern = /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\b\d{1,2}(:\d{2})?\s*(am|pm|h|giơ|sáng|trưa|chiều|tối)\b|\d{1,2}\s*(am|pm|h))/i;
    if (!timePattern.test(normalized) && !normalized.includes("1️⃣") && !normalized.includes("pickup time")) {
      missing.push({
        id: 'time',
        label: localScript.missingLabels.time
      });
    }

    // 2. Hotel Name / Room Number check: either hotel word or standard room number digits
    const hotelPattern = /(hotel|room|phòng|khách sạn|homestay|airbnb|hostel|resort|villa|reception|receiption|lobby|desk|lobby|recei|\b\d{2,4}\b)/i;
    if (!hotelPattern.test(normalized) && !normalized.includes("3️⃣") && !normalized.includes("4️⃣") && !normalized.includes("address")) {
      missing.push({
        id: 'hotel',
        label: localScript.missingLabels.hotel
      });
    }

    // 3. Preferred pickup option: OPTIONAL
    // 4. Service Type: OPTIONAL

    // 5. Separate Whites: yes, no, separate, white, whit, color, có, không, tách, trắng
    const whitesPattern = /(yes|no|separate|white|whit|color|có|không|tách|trắng|dơ|màu)/i;
    if (!whitesPattern.test(normalized) && !normalized.includes("6️⃣") && !normalized.includes("7️⃣") && !normalized.includes("white clothes")) {
      missing.push({
        id: 'whites',
        label: localScript.missingLabels.whites
      });
    }

    // 6. Phone Number check: check for a sequence of 9 to 11 digits
    const phonePattern = /(\b\d{9,11}\b|\+?\d{1,4}[-.\s]?\d{9,11})/i;
    if (!phonePattern.test(normalized) && !normalized.includes("7️⃣") && !normalized.includes("8️⃣") && !normalized.includes("phone") && !normalized.includes("sđt") && !normalized.includes("sdt")) {
      missing.push({
        id: 'phone',
        label: localScript.missingLabels.phone
      });
    }

    return missing;
  };

  // Parse user response into structured details
  const parseBookingDetails = (text) => {
    const normalized = text.toLowerCase();
    const localScript = salesScript[bookingSession.lang];
    const result = {
      time: localScript.notProvided,
      name: localScript.notProvided,
      hotel: localScript.notProvided,
      room: localScript.notProvided,
      option: localScript.notProvided,
      service: bookingSession.data.packageId ? 
               salesScript[bookingSession.lang].packages[bookingSession.data.packageId].title : 
               salesScript[bookingSession.lang].packages.sameday.title,
      whites: localScript.whitesNo,
      phone: localScript.notProvided,
      mapLink: ''
    };

    // 1. Extract Pickup Time
    const timeRegex = /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\b\d{1,2}(:\d{2})?\s*(am|pm|h|giơ|sáng|trưa|chiều|tối)\b|\d{1,2}\s*(am|pm|h))/i;
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
      result.time = timeMatch[0];
    }

    // 2. Extract Service Type (if user explicitly overrides it, otherwise keep default)
    const serviceRegex = /(same[-]?day|express|standard|next[-]?day|laundry|wash|fold|dry|giặt|sấy|gói)\s*(service)?/i;
    const serviceMatch = text.match(serviceRegex);
    if (serviceMatch) {
      const matchedText = serviceMatch[0].toLowerCase();
      if (matchedText.includes('express')) {
        result.service = salesScript[bookingSession.lang].packages.express.title;
      } else if (matchedText.includes('standard')) {
        result.service = salesScript[bookingSession.lang].packages.standard.title;
      } else if (matchedText.includes('same')) {
        result.service = salesScript[bookingSession.lang].packages.sameday.title;
      }
    }

    // 3. Extract Separate Whites
    const whitesRegex = /(yes|no|separate|white|whit|color|có|không|tách|trắng|dơ|màu)\s*(clothes|whithes)?/i;
    const whitesMatch = text.match(whitesRegex);
    if (whitesMatch) {
      const wText = whitesMatch[0].toLowerCase();
      if (wText.includes('yes') || wText.includes('có') || wText.includes('separate') || wText.includes('tách') || wText.includes('white') || wText.includes('trắng')) {
        result.whites = localScript.whitesYes;
      } else {
        result.whites = localScript.whitesNo;
      }
    }

    // 4. Extract Pickup Option (if provided)
    const optionRegex = /(direct\s*from\s*me|from\s*me|direct|reception|receiption|receptionist|reception\s*desk|lobby|desk|lễ tân|sảnh|leave|drop|meet|gửi|đưa)/i;
    const optionMatch = text.match(optionRegex);
    if (optionMatch) {
      result.option = optionMatch[0];
    }

    // Extract Phone Number
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\b\d{9,11}\b|\+?\d{1,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
    const phoneMatch = text.match(phoneRegex);
    let extractedPhone = localScript.notProvided;
    if (phoneMatch) {
      extractedPhone = phoneMatch[0];
    }
    result.phone = extractedPhone;

    // Extract Google Maps Link
    const mapLinkRegex = /(https?:\/\/(maps\.google\.com|www\.google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)\/[^\s]+)/i;
    const mapLinkMatch = text.match(mapLinkRegex);
    let extractedMapLink = '';
    if (mapLinkMatch) {
      extractedMapLink = mapLinkMatch[0];
    }
    result.mapLink = extractedMapLink;

    // 5. Subtract keywords and extract Room Number separately
    let hotelStr = text;
    if (timeMatch) hotelStr = hotelStr.replace(timeMatch[0], '');
    if (serviceMatch) hotelStr = hotelStr.replace(serviceMatch[0], '');
    if (whitesMatch) hotelStr = hotelStr.replace(whitesMatch[0], '');
    if (optionMatch) hotelStr = hotelStr.replace(optionMatch[0], '');
    if (phoneMatch) hotelStr = hotelStr.replace(phoneMatch[0], '');
    if (mapLinkMatch) hotelStr = hotelStr.replace(mapLinkMatch[0], '');

    hotelStr = hotelStr.replace(/[-–,.]/g, ' ').replace(/\s+/g, ' ').trim();

    // Extract Room Number (digit string of length 2 to 4)
    const roomRegex = /\b\d{2,4}\b/;
    const roomMatch = hotelStr.match(roomRegex);
    if (roomMatch) {
      result.room = roomMatch[0];
      hotelStr = hotelStr.replace(roomMatch[0], '').replace(/\s+/g, ' ').trim();
    }

    let customerName = localScript.notProvided;
    let hotelName = localScript.notProvided;

    if (hotelStr) {
      // Find index of standard hotel words to split the name from hotel name
      const splitRegex = /(hotel|phòng|khách sạn|homestay|airbnb|hostel|resort|villa|reception|receiption|lobby|desk|lobby|recei)/i;
      const splitMatch = hotelStr.match(splitRegex);

      if (splitMatch) {
        const splitIndex = hotelStr.indexOf(splitMatch[0]);
        customerName = hotelStr.substring(0, splitIndex).trim();
        hotelName = hotelStr.substring(splitIndex).trim();

        if (!customerName) {
          customerName = localScript.guestName;
        }
      } else {
        // Fallback: split by first word
        const words = hotelStr.split(/\s+/);
        if (words.length > 0) {
          customerName = words[0];
          hotelName = words.slice(1).join(' ') || localScript.notProvided;
        }
      }
    }

    result.name = customerName;
    result.hotel = hotelName;

    return result;
  };

  // Handle single-turn answers with validation
  const processBookingStep = (text, chipId) => {
    // Detect language first to stay in sync
    const detectedLang = detectLanguage(text);
    if (detectedLang) {
      bookingSession.lang = detectedLang;
    }
    const localScript = salesScript[bookingSession.lang];

    // Check for cancel request
    const normalizedText = (text || '').toLowerCase();
    const isCancelRequest = chipId === 'cancel' || 
                            normalizedText === 'cancel' || 
                            normalizedText === 'hủy' || 
                            normalizedText === 'huy' || 
                            normalizedText.includes('hủy đặt lịch') ||
                            normalizedText.includes('huy dat lich') ||
                            normalizedText.includes('cancel booking');

    if (isCancelRequest) {
      bookingSession.active = false;
      bookingSession.step = 0;
      bookingSession.data = {
        packageId: null,
        packageName: '',
        priceText: ''
      };
      bookingSession.userResponseText = '';
      appendBotMessage(localScript.cancelGreeting);
      showInitialMainMenu();
      return;
    }

    const step = bookingSession.step;

    if (step === 1) {
      // Check if user wants to cancel, hesitate or wait for check-in
      const normalizedText = text.toLowerCase();
      
      const isCheckingIn = ["check in", "check-in", "nhận phòng", "nhan phong"].some(k => normalizedText.includes(k));
      if (isCheckingIn) {
        bookingSession.active = false;
        bookingSession.step = 0;
        bookingSession.userResponseText = '';
        const qCheckin = localScript.questions.find(q => q.id === 'checkin_query');
        appendBotMessage(qCheckin.response);
        showInitialMainMenu();
        return;
      }

      const isHesitating = ["think", "suy nghĩ", "suy nghi", "decide", "để sau", "de sau", "later"].some(k => normalizedText.includes(k));
      if (isHesitating) {
        bookingSession.active = false;
        bookingSession.step = 0;
        bookingSession.userResponseText = '';
        const qHesitate = localScript.questions.find(q => q.id === 'hesitate_query');
        appendBotMessage(qHesitate.response);
        renderChips([
          { id: 'pricing_query', label: localScript.pricingInfoChip },
          { id: 'pickup', label: localScript.pickupInfoChip },
          { id: 'proceed_booking', label: localScript.continueBookingChip },
          { id: 'back_main', label: localScript.mainMenuChip }
        ]);
        return;
      }

      // Append text if user is replying with missing details
      if (bookingSession.userResponseText) {
        bookingSession.userResponseText += "\n" + text;
      } else {
        bookingSession.userResponseText = text;
      }

      // Check validation
      const missing = checkMissingFields(bookingSession.userResponseText);

      if (missing.length > 0) {
        // Ask for the missing details
        const missingLabels = missing.map(m => `• <strong>${m.label}</strong>`).join('<br>');
        appendBotMessage(`${localScript.missingIntro}${missingLabels}${localScript.missingOutro}`);
        renderChips([{ id: 'cancel', label: localScript.cancelBookingChip }]);
        return;
      }

      // If all are satisfied, move to confirmation step 2
      bookingSession.step = 2;
      
      const parsed = parseBookingDetails(bookingSession.userResponseText);
      
      const confirmMsg = `
        ${localScript.confirmTitle}
        1️⃣ <strong>${localScript.confirmLabels.time}</strong>: ${parsed.time}<br>
        2️⃣ <strong>${localScript.confirmLabels.name}</strong>: ${parsed.name}<br>
        3️⃣ <strong>${localScript.confirmLabels.hotel}</strong>: ${parsed.hotel}<br>
        ${parsed.mapLink ? `📍 <strong>Google Maps Link</strong>: <a href="${parsed.mapLink}" target="_blank" style="color: var(--color-pink); word-break: break-all;">${parsed.mapLink}</a><br>` : ''}4️⃣ <strong>${localScript.confirmLabels.room}</strong>: ${parsed.room}<br>
        5️⃣ <strong>${localScript.confirmLabels.option}</strong>: ${parsed.option}<br>
        6️⃣ <strong>${localScript.confirmLabels.whites}</strong>: ${parsed.whites}<br>
        7️⃣ <strong>${localScript.confirmLabels.phone}</strong>: ${parsed.phone}<br>
        📦 <strong>${localScript.confirmLabels.service}</strong>: ${parsed.service}
        ${localScript.confirmOutro}
      `;
      appendBotMessage(confirmMsg);
      renderChips([
        { id: 'confirm_yes', label: localScript.yesConfirmChip },
        { id: 'confirm_edit', label: localScript.editDetailsChip },
        { id: 'cancel', label: localScript.cancelChip }
      ]);
    } 
    else if (step === 2) {
      if (chipId === 'confirm_yes' || text.toLowerCase().includes('yes') || text.toLowerCase().includes('đúng') || text.toLowerCase().includes('ok')) {
        completeBookingAndShowCTAs();
      } 
      else if (chipId === 'confirm_edit' || text.toLowerCase().includes('edit') || text.toLowerCase().includes('sửa')) {
        bookingSession.userResponseText = '';
        bookingSession.step = 1;
        appendBotMessage(bookingSession.lang === 'vi' ? "Không sao ạ! Vui lòng gửi lại thông tin đặt lịch:" : "No problem! Please send your booking details again:");
        appendBotMessage(localScript.bookingPrompt);
        renderChips([{ id: 'cancel', label: localScript.cancelChip }]);
      }
    }
  };

  // Generate confirmation Zalo / WhatsApp triggers
  const completeBookingAndShowCTAs = () => {
    const details = bookingSession.userResponseText;
    const parsed = parseBookingDetails(details);
    const localScript = salesScript[bookingSession.lang];

    // Estimate total cước
    let totalVnd = 170000;
    const serviceClean = parsed.service.toLowerCase();
    if (serviceClean.includes('same-day') || serviceClean.includes('sameday') || serviceClean.includes('trong ngày')) {
      totalVnd = 250000;
    } else if (serviceClean.includes('express') || serviceClean.includes('hỏa tốc')) {
      totalVnd = 330000;
    } else if (serviceClean.includes('giày') || serviceClean.includes('shoe')) {
      totalVnd = 150000;
    }
    if (parsed.whites === localScript.whitesYes) {
      totalVnd += 30000;
    }

    // Generate unique booking code
    const bookingCode = 'NF' + Math.floor(1000 + Math.random() * 9000);

    // Format pre-filled booking message block
    const finalBookingMessage = `${bookingSession.lang === 'vi' ? 'Yêu cầu đặt lịch giặt ủi 1997 Laundry' : '1997 Laundry - Laundry Booking Request'}
---------------------------------------
Mã đơn hàng / Booking Code: #${bookingCode}
1️⃣ ${localScript.confirmLabels.time}: ${parsed.time}
2️⃣ ${localScript.confirmLabels.name}: ${parsed.name}
3️⃣ ${localScript.confirmLabels.hotel}: ${parsed.hotel}
${parsed.mapLink ? `📍 Google Maps: ${parsed.mapLink}\n` : ''}4️⃣ ${localScript.confirmLabels.room}: ${parsed.room}
5️⃣ ${localScript.confirmLabels.option}: ${parsed.option}
6️⃣ ${localScript.confirmLabels.whites}: ${parsed.whites}
7️⃣ ${localScript.confirmLabels.phone}: ${parsed.phone}
📦 ${localScript.confirmLabels.service}: ${parsed.service}
💰 Tổng cước tạm tính / Total: ${totalVnd.toLocaleString('vi-VN')} VND`;

    // Save booking to backend SQLite database
    fetch('api.php?action=booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingCode: bookingCode,
        name: parsed.name,
        phone: parsed.phone,
        email: '',
        hotelAddress: parsed.hotel,
        roomNumber: parsed.room,
        mapLink: parsed.mapLink,
        service: parsed.service,
        totalVnd: totalVnd
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Chatbot booking saved to DB:', data);
    })
    .catch(err => {
      console.error('Failed to save chatbot booking to DB:', err);
    });

    // Send direct instructions and buttons
    appendBotMessage(localScript.submitInstructions);
    appendInlineZaloWhatsappButtons(finalBookingMessage);

    // Disable booking session state
    bookingSession.active = false;
    bookingSession.step = 0;

    // Offer general follow-up menus
    setTimeout(() => {
      renderChips([
        { id: 'back_main', label: localScript.newBookingChip },
        { id: 'qna', label: localScript.askQuestionChip }
      ]);
    }, 600);
  };

  const showInitialMainMenu = () => {
    const isVi = bookingSession.lang === 'vi';
    renderChips([
      { id: 'sameday', label: isVi ? '⚡ Giặt sấy Lấy Liền' : '⚡ Same-day Wash' },
      { id: 'express', label: isVi ? '🚀 Hỏa tốc 4H' : '🚀 4-hour Express' },
      { id: 'standard', label: isVi ? '🧺 Tiêu chuẩn 24H' : '🧺 Standard 24h' },
      { id: 'other', label: isVi ? '👟 Dịch vụ khác' : '👟 Other Services' },
      { id: 'qna', label: isVi ? '❓ Hỏi đáp / Q&A' : '❓ Q&A / FAQs' }
    ]);
  };

  const openChatbot = () => {
    if (!chatbotWindow) return;
    chatbotWindow.classList.remove('hidden');
    
    // First time greeting
    if (chatbotBody && chatbotBody.children.length === 0) {
      const isVi = bookingSession.lang === 'vi';
      const welcomeMsg = isVi ?
        "Xin chào! Tôi là Bé Ba, trợ lý giặt ủi 1997 Laundry. Tôi có thể giúp gì cho bạn hôm nay? 🧺 Hãy chọn một gói dịch vụ bên dưới để xem thông tin nhanh, hoặc đặt câu hỏi tự do cho tôi nhé!" :
        "Hello! I am Bé Ba, your 1997 Laundry laundry assistant. How can I help you today? 🧺 Please choose one of our packages below for instant details, or ask me any question directly!";
      
      appendBotMessage(welcomeMsg);
      showInitialMainMenu();
    }
  };

  if (chatbotToggle) {
    chatbotToggle.addEventListener('click', () => {
      const widget = document.getElementById('chatbotWidget');
      if (!widget || !chatbotWindow) return;
      widget.classList.toggle('hidden');
      if (!widget.classList.contains('hidden')) {
        openChatbot();
      }
    });
  }

  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      const widget = document.getElementById('chatbotWidget');
      if (widget) widget.classList.add('hidden');
      if (chatbotWindow) chatbotWindow.classList.add('hidden');
    });
  }

  if (chatbotForm && chatbotInput) {
    chatbotForm.addEventListener('submit', event => {
      event.preventDefault();
      const value = chatbotInput.value.trim();
      if (!value) return;
      appendUserMessage(value);
      setTimeout(() => handleResponse(null, value), 200);
      chatbotInput.value = '';
    });
  }

  // --- INITIALIZE LANGUAGE PREFERENCE ---
  const savedLang = localStorage.getItem('site_lang') || 'en';
  updatePageLanguage(savedLang);

  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'langSelect') {
      updatePageLanguage(e.target.value);
      showInitialMainMenu();
    }
  });
});

// --- Checkout Modal Helper Logic ---
let modalPollingInterval = null;

window.closeCheckoutModal = function() {
  document.getElementById('checkoutModal').style.display = 'none';
  if (modalPollingInterval) {
    clearInterval(modalPollingInterval);
    modalPollingInterval = null;
  }
};

window.copyModalText = function(elementId, successText) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = successText;
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 2000);
    }
  });
};

window.triggerCheckoutModal = function(amount, desc, serviceLabel, pickupTimeStr, hotelDetailsStr, messageText) {
  const isVi = (localStorage.getItem('site_lang') || 'en') === 'vi';
  const displayService = isVi ? (getTranslation(serviceLabel) || serviceLabel) : serviceLabel;

  document.getElementById('modalCode').textContent = desc;
  document.getElementById('modalService').textContent = displayService;
  document.getElementById('modalPickupTime').textContent = pickupTimeStr;
  document.getElementById('modalHotelDetails').textContent = hotelDetailsStr;
  document.getElementById('modalPayAmount').textContent = amount.toLocaleString('vi-VN') + ' VND';

  // Setup WhatsApp redirect link
  const waLink = "https://wa.me/84373991602?text=" + encodeURIComponent(messageText);
  const waBtn = document.getElementById('modalWhatsAppBtn');
  if (waBtn) waBtn.href = waLink;

  // Setup Zalo proceed copy-paste handler
  const zaloBtn = document.getElementById('modalZaloBtn');
  if (zaloBtn) {
    zaloBtn.onclick = function() {
      navigator.clipboard.writeText(messageText).then(() => {
        const isVi = (localStorage.getItem('site_lang') || 'en') === 'vi';
        const alertMsg = isVi ? 
          '📝 Thông tin đặt lịch đã được sao chép vào bộ nhớ tạm!\n\nĐang mở Zalo. Vui lòng dán (paste) nội dung đã sao chép vào khung chat Zalo với chúng tôi để xác nhận đơn.' :
          '📝 Booking details copied to clipboard!\n\nOpening Zalo now. Please paste the copied text into our Zalo chat to confirm your booking.';
        alert(alertMsg);
        window.open('https://zalo.me/0373991602', '_blank');
      });
    };
  }

  // Reset modal state and show Billing View
  document.getElementById('checkoutBillingView').style.display = 'block';
  document.getElementById('checkoutModal').style.display = 'flex';
};

function startModalPolling(targetAmount, targetDesc) {
  if (modalPollingInterval) clearInterval(modalPollingInterval);

  const ordersUrl = 'api.php?action=orders';

  modalPollingInterval = setInterval(async () => {
    try {
      const fetchUrl = ordersUrl + (ordersUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
      const response = await fetch(fetchUrl);
      if (!response.ok) return;

      const data = await response.json();
      const orders = Array.isArray(data) ? data : (data.orders || []);

      // Find matching order in Google Sheets
      const matchingOrder = orders.find(o => {
        const id = (o['Mã đặt lịch'] || o.id || '').toString().trim().toLowerCase();
        return id === targetDesc.trim().toLowerCase();
      });

      if (matchingOrder) {
        let status = matchingOrder['Trạng thái đơn'] || matchingOrder.status || 'Chờ XN';
        if (status === 'Hoàn thành' || status === 'completed' || status === 'Đã thanh toán' || status === 'Đã TT' || status === 'paid') {
          onModalPaymentSuccess(targetAmount, targetDesc);
        }
      }
    } catch (err) {
      console.error('Error checking checkout modal status:', err);
    }
  }, 4000);
}

function onModalPaymentSuccess(amount, desc) {
  if (modalPollingInterval) {
    clearInterval(modalPollingInterval);
    modalPollingInterval = null;
  }

  document.getElementById('modalSuccessAmount').textContent = amount.toLocaleString('vi-VN') + ' VND';
  document.getElementById('modalSuccessContentCode').textContent = desc;

  // Toggle modal card view to Success Card
  document.getElementById('checkoutBillingView').style.display = 'none';
  document.getElementById('checkoutSuccessView').style.display = 'block';

  // Play audio chime
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);

    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.35);
    }, 140);
  } catch (e) {}

  // Trigger HTML5 Canvas Confetti animation inside modal
  triggerModalConfetti();
}

function triggerModalConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.style.display = 'block';

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const colors = ['#fe66c4', '#ffc409', '#0084ff', '#38a169', '#93ccf9'];
  const confettiCount = 130;
  const confettiArray = [];

  class Confetti {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height - 20;
      this.size = Math.random() * 8 + 6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speed = Math.random() * 4 + 3;
      this.angle = Math.random() * 360;
      this.spinSpeed = Math.random() * 4 - 2;
      this.wind = Math.random() * 1.5 - 0.75;
    }
    update() {
      this.y += this.speed;
      this.x += this.wind;
      this.angle += this.spinSpeed;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle * Math.PI / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  for (let i = 0; i < confettiCount; i++) {
    confettiArray.push(new Confetti());
  }

  let animationFrame;
  function animate() {
    ctx.clearRect(0, 0, width, height);
    let active = false;
    confettiArray.forEach(p => {
      p.update();
      p.draw();
      if (p.y < height) active = true;
    });
    if (active) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      canvas.style.display = 'none';
      cancelAnimationFrame(animationFrame);
    }
  }
  animate();
}
