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

});
