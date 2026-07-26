document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. HEADER SCROLL EFFECT
       ========================================== */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ==========================================
       2. MOBILE MENU TOGGLE
       ========================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('open')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        // Close menu when a link is clicked
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuToggle.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }
    /* ==========================================
       5. INTERACTIVE PRICING PLAN CONTROLLER
       ========================================== */
    const tabs = document.querySelectorAll('.pricing-tab-btn');
    const tiersContainer = document.getElementById('pricing-tiers-container');
    const specContainer = document.getElementById('pricing-spec-container');

    // Complete Plans Database
    const plansData = {
        laundry: [
            {
                tier: 'TIER 01',
                title: 'Standard Wash & Fold',
                desc: 'Daily laundry, towels, and bedding carefully folded.',
                price: '30,000 VND',
                unit: 'per kg',
                turnaround: '24 HOURS',
                tagline: 'Perfect for regular laundry needs',
                features: [
                    'Standard wash & tumble dry',
                    'Individual machine wash',
                    'Neatly folded & sorted',
                    'Standard scented softener',
                    'Garments checked for forgotten items'
                ],
                suitable: 'Regular daily clothes, sheets, towels and activewear',
                btnText: 'CHOOSE STANDARD WASH & FOLD',
                recommended: false
            },
            {
                tier: 'TIER 02',
                title: 'Same-Day Express Combo',
                desc: 'Pickup before 2:00 PM, delivery before 9:00 PM same day.',
                price: '180,000 VND',
                unit: '5kg pack',
                turnaround: '6 HOURS',
                tagline: 'Same day turnaround for busy people',
                features: [
                    'Express wash & dry combo',
                    'Wash & delivery within 6 hours',
                    'FREE white clothes separation',
                    'Premium Organic fabric softener',
                    'Hanger styling for shirts'
                ],
                suitable: 'Busy professionals, business shirts and quick turnaround clothing needs',
                btnText: 'CHOOSE SAME-DAY EXPRESS COMBO',
                recommended: false
            },
            {
                tier: 'TIER 03',
                title: '4-Hour Super Express Combo',
                desc: 'Garments returned clean and smelling fresh in 4 hours.',
                price: '220,000 VND',
                unit: '5kg pack',
                turnaround: '4 HOURS',
                tagline: 'Best Value for Speed — Top Priority',
                features: [
                    'Super express wash for up to 5kg garments',
                    'FREE white clothes separation to prevent fading',
                    'FREE 1-WAY SHIPPING (Up to 35,000 VND)',
                    '100% individual wash using premium Organic softener',
                    'Top priority execution by lead technicians'
                ],
                suitable: 'Urgent laundry needs, travelers, and event preparation',
                btnText: 'CHOOSE 4-HOUR SUPER EXPRESS COMBO',
                recommended: true
            },
            {
                tier: 'TIER 04',
                title: 'Blanket & Comforter',
                desc: 'Heavy comforters, duvets, blankets, and pillows fluffed & sanitized.',
                price: '60,000 VND',
                unit: 'per kg',
                turnaround: '24-48 HOURS',
                tagline: 'Deep sanitizing wash for bedding',
                features: [
                    'Heavy-duty industrial wash',
                    'Sanitizing cycle to kill allergens',
                    'Fluff-dry treatment at optimized heat',
                    'Sealed hygienic water-resistant packaging',
                    'Extra inspection for stains and lint'
                ],
                suitable: 'Heavy duvets, blankets, comforters, sleeping bags, and pillows',
                btnText: 'CHOOSE BLANKET & COMFORTER',
                recommended: false
            }
        ],
        shoes: [
            {
                tier: 'TIER 01',
                title: 'Basic Sneaker Clean',
                desc: 'External cleaning & deodorizing for canvas and mesh sneakers.',
                price: '90,000 VND',
                unit: 'per pair',
                turnaround: '3 DAYS',
                tagline: 'Essential refresh for daily sneakers',
                features: [
                    'External midsole & upper cleaning',
                    'Lace cleaning & deodorizing',
                    'Hand-wash cleaning process',
                    'UV sterilization to prevent odor',
                    'Standard natural air dry'
                ],
                suitable: 'Standard canvas, mesh, and synthetic sneakers',
                btnText: 'CHOOSE BASIC SNEAKER CLEAN',
                recommended: false
            },
            {
                tier: 'TIER 02',
                title: 'Premium Leather Spa',
                desc: 'Deep conditioning & stain removal for leather and suede shoes.',
                price: '180,000 VND',
                unit: 'per pair',
                turnaround: '4-5 DAYS',
                tagline: 'Specialist care for high-value shoes',
                features: [
                    'Deep interior & exterior leather cleaning',
                    'Leather conditioning & protection coating',
                    'Suede brush & texture recovery',
                    'Premium shoe tree shape retention',
                    'UV anti-mold sterilization'
                ],
                suitable: 'Premium leather shoes, boots, and suede sneakers',
                btnText: 'CHOOSE PREMIUM LEATHER SPA',
                recommended: false
            },
            {
                tier: 'TIER 03',
                title: 'Luxury Shoe Restoration',
                desc: 'Color restoration, midsole unyellowing & repaint spa.',
                price: '350,000 VND',
                unit: 'per pair',
                turnaround: '7 DAYS',
                tagline: 'Ultimate recovery for worn or yellowed shoes',
                features: [
                    'Midsole unyellowing & bleaching',
                    'Leather repainting & color restoration',
                    'Deep stain pre-treatment',
                    'Waterproof nano protection spray',
                    'Sole glue and stitching repair support'
                ],
                suitable: 'Yellowed soles, faded leather, and luxury brand shoes',
                btnText: 'CHOOSE LUXURY SHOE RESTORATION',
                recommended: true
            }
        ],
        dryclean: [
            {
                tier: 'TIER 01',
                title: 'Premium Pressing',
                desc: 'Ironing and hanging service for pre-washed shirts and trousers.',
                price: '15,000 VND',
                unit: 'per piece',
                turnaround: '24 HOURS',
                tagline: 'Professional steam ironing and finishing',
                features: [
                    'Professional steam ironing',
                    'Garments placed on premium hangers',
                    'Collar support cards for shirts',
                    'Dust cover protection bag',
                    'Wrinkle-free transportation ready'
                ],
                suitable: 'Business shirts, trousers, suits, and uniforms',
                btnText: 'CHOOSE PREMIUM PRESSING',
                recommended: false
            },
            {
                tier: 'TIER 02',
                title: 'Suit Dry Cleaning',
                desc: 'Gentle dry cleaning for suits, jackets, and formal wear.',
                price: '120,000 VND',
                unit: 'per set',
                turnaround: '2 DAYS',
                tagline: 'Delicate care for luxury formal wear',
                features: [
                    'Eco-friendly dry cleaning solvent',
                    'Shape preservation treatment',
                    'Stain pre-spotting inspection',
                    'Steam ironing & collar styling',
                    'Breathable garment cover bag'
                ],
                suitable: 'Suits, blazers, coats, and formal jackets',
                btnText: 'CHOOSE SUIT DRY CLEANING',
                recommended: false
            },
            {
                tier: 'TIER 03',
                title: 'Luxury Evening Wear',
                desc: 'Gentle cleaning for evening gowns, silk dresses & wedding wear.',
                price: '250,000 VND',
                unit: 'per piece',
                turnaround: '3 DAYS',
                tagline: 'Ultimate care for high-fashion designer items',
                features: [
                    'Individual delicate fabric cleaning',
                    'Protection of beadwork, sequins, and lace',
                    'pH-balanced gentle fabric wash',
                    'Hand-ironing under low heat',
                    'Archival storage box or padded hanger packaging'
                ],
                suitable: 'Silk dresses, evening gowns, wedding dresses, and designer knitwear',
                btnText: 'CHOOSE LUXURY EVENING WEAR',
                recommended: true
            }
        ]
    };

    let activeCategory = 'laundry';
    let activeTierIndex = 2; // Default to Tier 03 (super express)

    function renderPricingCategory(category) {
        activeCategory = category;
        const categoryPlans = plansData[category];
        
        // Render Left Column Tiers
        tiersContainer.innerHTML = '';
        categoryPlans.forEach((plan, index) => {
            const card = document.createElement('div');
            card.className = `tier-item-card ${index === activeTierIndex ? 'active' : ''}`;
            card.setAttribute('data-index', index);
            
            // Add Recommended Badge if applicable
            let recBadgeHtml = '';
            if (plan.recommended) {
                recBadgeHtml = `<span class="tier-rec-badge">RECOMMENDED</span>`;
            }
            
            card.innerHTML = `
                ${recBadgeHtml}
                <div class="tier-left-info">
                    <span class="tier-label-name">${plan.tier}</span>
                    <h3 class="tier-title-text">${plan.title}</h3>
                    <p class="tier-desc-text">${plan.desc}</p>
                </div>
                <div class="tier-right-price">
                    <span class="tier-price-amount">${plan.price}</span>
                    <span class="tier-price-unit">${plan.unit}</span>
                </div>
            `;
            
            // Tier click handler
            card.addEventListener('click', () => {
                document.querySelectorAll('.tier-item-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                activeTierIndex = index;
                renderSpecCard(categoryPlans[index]);
            });
            
            tiersContainer.appendChild(card);
        });
        
        // Render Right Column Spec Card
        renderSpecCard(categoryPlans[activeTierIndex]);
    }

    function renderSpecCard(plan) {
        let featuresHtml = '';
        plan.features.forEach(feat => {
            featuresHtml += `<li><i class="fa-solid fa-circle-check"></i> ${feat}</li>`;
        });
        
        specContainer.innerHTML = `
            <div class="spec-header">
                <div class="spec-header-left">
                    <span class="spec-plan-specs">${plan.tier} — PLAN SPECS</span>
                    <h3 class="spec-plan-title">${plan.title}</h3>
                </div>
                <div class="spec-header-right">
                    <span class="spec-turnaround-label">TURNAROUND</span>
                    <span class="spec-turnaround-val">${plan.turnaround}</span>
                </div>
            </div>
            
            <p class="spec-tagline">${plan.tagline}</p>
            
            <ul class="spec-features-list">
                ${featuresHtml}
            </ul>
            
            <div class="spec-suitable-box">
                <span class="spec-suitable-label">SUITABLE FOR</span>
                <p class="spec-suitable-val">${plan.suitable}</p>
            </div>
            
            <a href="https://wa.me/84866137043" target="_blank" class="spec-action-btn" style="text-decoration: none;">
                ${plan.btnText} <i class="fa-solid fa-arrow-right" style="margin-left: 8px;"></i>
            </a>
        `;
    }

    // Initialize pricing
    if (tiersContainer && specContainer) {
        renderPricingCategory('laundry');

        // Tab buttons click handler
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const category = tab.getAttribute('data-category');
                activeTierIndex = 2; // Default to Tier 3 on tab change
                renderPricingCategory(category);
            });
        });
    }


    /* ==========================================
       6. ACCORDION FAQ CONTROLLER
       ========================================== */
    const accHeaders = document.querySelectorAll('.accordion-header');

    accHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-body').style.maxHeight = null;
            });

            // Open selected if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                const body = item.querySelector('.accordion-body');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    // Initialize Active Accordion scroll height mapping
    const activeAcc = document.querySelector('.accordion-item.active');
    if (activeAcc) {
        const body = activeAcc.querySelector('.accordion-body');
        body.style.maxHeight = body.scrollHeight + 'px';
    }


    /* ==========================================
       7. INTERACTIVE TESTIMONIALS
       ========================================== */
    const testTabs = document.querySelectorAll('.test-tab');
    const testQuote = document.getElementById('test-quote');
    const testAvatar = document.getElementById('test-avatar-text');
    const testAuthor = document.getElementById('test-author');
    const testRole = document.getElementById('test-role');

    // Review Quotes DB
    const reviews = [
        {
            quote: '"1997 Laundry is a lifesaver in Saigon! Their English communication is excellent, and clothes are delivered smelling fresh and folded so neatly. Best of all, they wash everything separately, unlike other local laundry shops."',
            initials: 'SJ',
            author: 'Sarah Jenkins',
            role: 'Digital Nomad from UK'
        },
        {
            quote: '"I trust them with all my business suits. The premium dry cleaning is top-notch, and the convenient pickup means I never have to worry about running out of clean shirts. Incredible service!"',
            initials: 'JS',
            author: 'James Sterling',
            role: 'US Expat Resident'
        },
        {
            quote: '"As a teacher, I don\'t have much free time. They pick up my laundry from my apartment and return it within 24 hours. The shoe spa also restored my favorite sneakers! Highly recommend!"',
            initials: 'YT',
            author: 'Yuki Takahashi',
            role: 'ESL English Teacher'
        },
        {
            quote: '"Cheap, extremely fast, and premium service. They communicated with me perfectly via WhatsApp and picked up my laundry from my hostel. Very reliable service for backpackers."',
            initials: 'MR',
            author: 'Marco Rossi',
            role: 'Backpacker / Tourist'
        }
    ];

    testTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            testTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const index = parseInt(tab.getAttribute('data-test'));
            const review = reviews[index];

            // Fade transition effect (simulated)
            const displayEl = document.getElementById('testimonial-display');
            if (displayEl) {
                displayEl.style.opacity = '0.3';
                displayEl.style.transform = 'translateY(5px)';
                
                setTimeout(() => {
                    testQuote.textContent = review.quote;
                    testAvatar.textContent = review.initials;
                    testAuthor.textContent = review.author;
                    testRole.textContent = review.role;
                    
                    displayEl.style.opacity = '1';
                    displayEl.style.transform = 'translateY(0)';
                }, 200);
            }
        });
    });

    /* ==========================================
       8. SCROLL REVEAL & PARALLAX FOR TEAM SECTION
       ========================================== */
    const revealCards = document.querySelectorAll('.reveal-card');

    if (revealCards.length > 0) {
        // Intersection Observer for scroll reveal fade-in/slide-up
        const cardObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        revealCards.forEach(card => cardObserver.observe(card));

        // Parallax background-shift on scroll
        const placeholders = document.querySelectorAll('.team-img-placeholder');
        const fabricBg = document.querySelector('.hero-fabric-bg img');
        
        window.addEventListener('scroll', () => {
            // Hero Fabric Parallax (Gợi ý 4)
            if (fabricBg) {
                const scrollPos = window.scrollY;
                if (scrollPos < window.innerHeight) {
                    fabricBg.style.transform = `translateY(${scrollPos * 0.22}px)`;
                }
            }

            // Team Cards Parallax
            placeholders.forEach(ph => {
                const rect = ph.getBoundingClientRect();
                const viewHeight = window.innerHeight;
                
                if (rect.top < viewHeight && rect.bottom > 0) {
                    // Calculate percentage of element progression through viewport
                    const scrollRatio = (viewHeight - rect.top) / (viewHeight + rect.height);
                    const bgY = 35 + (scrollRatio * 30); // scale background Y pos from 35% to 65%
                    ph.style.backgroundPosition = `50% ${bgY}%`;
                }
            });
        });
    }

    /* ==========================================
       9. TEAM CARD SLIDESHOW CONTROLLER
       ========================================== */
    const slides = document.querySelectorAll('.team-slide');
    const dots = document.querySelectorAll('.slide-dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slides.length > 0) {
        let currentSlideIdx = 0;
        let slideInterval = setInterval(nextSlide, 4000); // Auto rotate every 4 seconds

        function showSlide(index) {
            // Handle wrap-around
            if (index >= slides.length) {
                currentSlideIdx = 0;
            } else if (index < 0) {
                currentSlideIdx = slides.length - 1;
            } else {
                currentSlideIdx = index;
            }

            // Update active classes on slides
            slides.forEach((slide, idx) => {
                if (idx === currentSlideIdx) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Update active classes on dots
            dots.forEach((dot, idx) => {
                if (idx === currentSlideIdx) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function nextSlide() {
            showSlide(currentSlideIdx + 1);
        }

        function prevSlide() {
            showSlide(currentSlideIdx - 1);
        }

        // Reset interval on manual control click
        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 4000);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card hover triggers if any
                nextSlide();
                resetInterval();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                prevSlide();
                resetInterval();
            });
        }

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(idx);
                resetInterval();
            });
        });
    }

    /* ==========================================
       10. STATIC INTERACTIVE CHATBOT (AGENT BE BE NE)
       ========================================== */
    const botResponses = {
        start: {
            text: "Hello! I am your 1997 Premium Laundry Assistant. How can I help you today?",
            options: [
                { text: "👕 Express Laundry", next: "express" },
                { text: "🧥 Dry Cleaning", next: "dryclean" },
                { text: "👟 Shoes & Bag Spa", next: "shoes" },
                { text: "💨 Steam Pressing", next: "press" },
                { text: "🧺 Bedding & Curtain", next: "bedding" },
                { text: "🚚 Delivery Policy", next: "delivery" },
                { text: "📞 Talk to Human", next: "human" }
            ]
        },
        express: {
            text: "<strong>Express Laundry (Giặt Sấy Lấy Liền):</strong><br>• Standard 24h: 15k/kg (whites separate wash +30k/load).<br>• Same-Day (6-8h): 25k/kg.<br>• 4H Super Express: 35k/kg.<br><br>All loads are washed 100% individually in cold water and dried at 60°C.",
            options: [
                { text: "📅 Book Express Laundry", action: "book_wa" },
                { text: "🔙 Main Menu", next: "start" }
            ]
        },
        dryclean: {
            text: "<strong>Premium Dry Cleaning (Giặt Khô Cao Cấp):</strong><br>We use safe, eco-friendly Hydrocarbon solvents to protect luxury suits, wool, cashmere, silk, down jackets, and leather.<br><br>• 2-Piece Suit: 230,000 VND<br>• Silk/Evening Gown: 190,000 VND<br>• Leather Jacket: 490,000 VND<br><br>Includes stain pre-treatment, hydrocarbon wash, vertical steam pressing, and hanger packaging with no extra fees!",
            options: [
                { text: "📅 Book Dry Cleaning", action: "book_wa" },
                { text: "🔙 Main Menu", next: "start" }
            ]
        },
        shoes: {
            text: "<strong>Shoes & Bag Spa:</strong><br>Every shoe and luxury handbag is cleaned 100% by hand using premium organic conditioners (Saphir care), sterilized with UVC rays, and dried in controlled rooms.<br><br>• Basic Sneaker Clean: 90,000 VND<br>• Premium Leather Spa: 180,000 VND<br>• Luxury Shoe Restoration: 350,000 VND",
            options: [
                { text: "📅 Book Shoe Spa", action: "book_zalo" },
                { text: "🔙 Main Menu", next: "start" }
            ]
        },
        press: {
            text: "<strong>Steam Pressing (Ủi Hơi Nước):</strong><br>• Casual Wear Pressing: 15,000 VND/piece.<br>• Professional Hand & Vertical Steam Pressing (Suits, gowns): starts from 40,000 VND/piece.<br><br>We use high-pressure vertical steam tables to restore fabric drape and structure without causing shine or fiber damage.",
            options: [
                { text: "📅 Book Pressing", action: "book_wa" },
                { text: "🔙 Main Menu", next: "start" }
            ]
        },
        bedding: {
            text: "<strong>Bedding & Curtain Cleaning:</strong><br>• Bedsheets, duvets, comforters: 60,000 VND/kg.<br>• Curtain package: includes home removal/dismantling, deep wash, steam folding, and re-hanging. Starts from 150,000 VND/panel.",
            options: [
                { text: "📅 Book Bedding/Curtain", action: "book_wa" },
                { text: "🔙 Main Menu", next: "start" }
            ]
        },
        delivery: {
            text: "<strong>Delivery Policy:</strong><br>• <strong>FREE roundtrip shipping</strong> for orders over 1,000,000 VND across HCMC inner districts.<br>• For orders under 1,000,000 VND: 20,000 VND/way under 3km, and +8,000 VND/km for distances over 3km.",
            options: [
                { text: "🔙 Main Menu", next: "start" }
            ]
        },
        human: {
            text: "Would you like to chat directly with our team? Click Zalo or WhatsApp below to talk to a human operator:",
            options: [
                { text: "💬 Chat on Zalo", action: "chat_zalo" },
                { text: "🟢 Chat on WhatsApp", action: "chat_wa" },
                { text: "🔙 Main Menu", next: "start" }
            ]
        }
    };

    // 1. Inject Stylesheet
    const botStyle = document.createElement('style');
    botStyle.innerHTML = `
        .chatbot-window {
            position: fixed;
            bottom: 95px;
            right: 20px;
            width: 350px;
            height: 480px;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 12px 35px rgba(9, 0, 45, 0.15);
            border: 1px solid rgba(9, 0, 45, 0.08);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 10000;
            font-family: var(--font-body);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            transform: translateY(20px) scale(0.95);
            opacity: 0;
        }

        .chatbot-window.open {
            display: flex;
            transform: translateY(0) scale(1);
            opacity: 1;
        }

        .chatbot-header {
            background: var(--color-bg-dark);
            color: #ffffff;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--color-accent);
        }

        .chatbot-title-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .chatbot-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--color-accent);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 14px;
        }

        .chatbot-info h4 {
            margin: 0;
            font-family: var(--font-headline);
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.5px;
            color: #ffffff;
        }

        .chatbot-info span {
            font-size: 11px;
            color: #94a3b8;
        }

        .chatbot-close {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 18px;
            cursor: pointer;
            transition: color 0.2s ease;
        }

        .chatbot-close:hover {
            color: #ffffff;
        }

        .chatbot-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #fafafa;
        }

        .chat-bubble {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 13px;
            line-height: 1.5;
            box-sizing: border-box;
        }

        .chat-bubble.bot {
            background: #ffffff;
            color: var(--color-bg-dark);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
            border: 1px solid rgba(0, 0, 0, 0.02);
        }

        .chat-bubble.user {
            background: var(--color-accent);
            color: #ffffff;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 12px rgba(242, 106, 25, 0.15);
        }

        .chatbot-options {
            padding: 12px 20px;
            background: #ffffff;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            max-height: 140px;
            overflow-y: auto;
        }

        .chatbot-option-btn {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            color: var(--color-bg-dark);
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .chatbot-option-btn:hover {
            background: var(--color-accent);
            border-color: var(--color-accent);
            color: #ffffff;
        }

        .chatbot-input-area {
            padding: 12px 20px;
            background: #ffffff;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .chatbot-input {
            flex: 1;
            border: 1px solid #e2e8f0;
            padding: 10px 16px;
            border-radius: 24px;
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s ease;
            height: 38px;
            box-sizing: border-box;
        }

        .chatbot-input:focus {
            border-color: var(--color-accent);
        }

        .chatbot-send {
            background: var(--color-accent);
            color: #ffffff;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s ease;
            padding: 0;
        }

        .chatbot-send:hover {
            background-color: var(--color-accent-dark);
        }

        @media (max-width: 576px) {
            .chatbot-window {
                bottom: 0 !important;
                right: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border-radius: 0 !important;
                z-index: 100000 !important;
            }
        }
    `;
    document.head.appendChild(botStyle);

    // 2. Inject Chatbot HTML Markup
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chatbot-widget-container';
    chatContainer.innerHTML = `
        <div class="chatbot-window" id="chatbot-window">
            <div class="chatbot-header">
                <div class="chatbot-title-container">
                    <div class="chatbot-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="chatbot-info">
                        <h4>1997 Assistant</h4>
                        <span>Online • Automated</span>
                    </div>
                </div>
                <button class="chatbot-close" id="chatbot-close-btn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages-container"></div>
            <div class="chatbot-options" id="chatbot-options-container"></div>
            <div class="chatbot-input-area">
                <input type="text" class="chatbot-input" id="chatbot-input-el" placeholder="Type a message...">
                <button class="chatbot-send" id="chatbot-send-btn">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // 3. Chatbot Logic
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const messagesContainer = document.getElementById('chatbot-messages-container');
    const optionsContainer = document.getElementById('chatbot-options-container');
    const inputEl = document.getElementById('chatbot-input-el');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const floatBtn = document.querySelector('.floating-chatbot-widget');

    // Dynamically build and group floating contact buttons (Zalo, WA, Chatbot)
    if (floatBtn) {
        const contactGroup = document.createElement('div');
        contactGroup.className = 'floating-contact-group';
        
        // Insert container right before floatBtn in DOM
        floatBtn.parentNode.insertBefore(contactGroup, floatBtn);
        
        // Create Zalo button
        const zaloBtn = document.createElement('a');
        zaloBtn.href = 'https://zalo.me/0866137043';
        zaloBtn.target = '_blank';
        zaloBtn.className = 'floating-contact-btn floating-btn-zalo';
        zaloBtn.innerHTML = `
            <div class="floating-contact-label">Zalo</div>
            <div class="floating-contact-circle"><i class="fa-solid fa-comments"></i></div>
        `;
        
        // Create WhatsApp button
        const waBtn = document.createElement('a');
        waBtn.href = 'https://wa.me/84866137043';
        waBtn.target = '_blank';
        waBtn.className = 'floating-contact-btn floating-btn-wa';
        waBtn.innerHTML = `
            <div class="floating-contact-label">WhatsApp</div>
            <div class="floating-contact-circle"><i class="fa-brands fa-whatsapp"></i></div>
        `;
        
        // Convert old floatBtn into the group chatbot button format
        floatBtn.className = 'floating-contact-btn floating-btn-chatbot';
        floatBtn.innerHTML = `
            <div class="floating-contact-label">Chatbot</div>
            <div class="floating-contact-circle"><i class="fa-solid fa-robot"></i></div>
        `;
        
        // Append all three in the vertical stack
        contactGroup.appendChild(zaloBtn);
        contactGroup.appendChild(waBtn);
        contactGroup.appendChild(floatBtn);

        // Intercept chatbot button click
        floatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleChatbot();
        });
    }

    function toggleChatbot() {
        if (chatbotWindow.classList.contains('open')) {
            chatbotWindow.classList.remove('open');
            setTimeout(() => { chatbotWindow.style.display = 'none'; }, 300);
        } else {
            chatbotWindow.style.display = 'flex';
            chatbotWindow.offsetHeight; // trigger reflow
            chatbotWindow.classList.add('open');
            if (messagesContainer.children.length === 0) {
                showBotResponse('start');
            }
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', toggleChatbot);
    }

    function addMessage(text, sender) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        bubble.innerHTML = text;
        messagesContainer.appendChild(bubble);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showBotResponse(key) {
        const state = botResponses[key];
        if (!state) return;

        addMessage(state.text, 'bot');

        optionsContainer.innerHTML = '';
        state.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chatbot-option-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                addMessage(opt.text, 'user');
                if (opt.next) {
                    setTimeout(() => { showBotResponse(opt.next); }, 400);
                } else if (opt.action) {
                    handleAction(opt.action);
                }
            });
            optionsContainer.appendChild(btn);
        });
    }

    function handleAction(action) {
        let url = "";
        if (action === "chat_zalo" || action === "book_zalo") {
            url = "https://zalo.me/0866137043";
        } else if (action === "chat_wa" || action === "book_wa") {
            url = "https://wa.me/84866137043";
        }
        if (url) {
            addMessage(`Opening Zalo/WhatsApp to complete your booking... <a href="${url}" target="_blank" style="color: var(--color-accent); font-weight:700; text-decoration:underline;">Click here</a> if it didn't open.`, 'bot');
            window.open(url, '_blank');
        }
        setTimeout(() => { showBotResponse('start'); }, 1500);
    }

    function handleInput() {
        const val = inputEl.value.trim();
        if (!val) return;

        addMessage(val, 'user');
        inputEl.value = '';

        setTimeout(() => {
            addMessage("I am currently in automated assistant mode. To ask about specific services, please use the quick buttons below or select 'Talk to Human' to chat directly on Zalo/WhatsApp!", 'bot');
            showBotResponse('start');
        }, 500);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', handleInput);
    }
    if (inputEl) {
        inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleInput();
            }
        });
    }

});
