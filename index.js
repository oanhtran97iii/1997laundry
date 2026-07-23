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
       3. HERO SECTION PRICE ESTIMATOR
       ========================================== */
    const estTabs = document.querySelectorAll('.est-tab');
    const slider = document.getElementById('estimator-slider');
    const unitTitle = document.getElementById('estimator-unit-title');
    const qtyDisplay = document.getElementById('estimator-qty-display');
    const priceVndDisplay = document.getElementById('estimator-price-vnd');
    const priceUsdDisplay = document.getElementById('estimator-price-usd');
    const tickMin = document.getElementById('tick-min');
    const tickMax = document.getElementById('tick-max');

    // Service Rates & Config
    const servicesConfig = {
        'wash-fold': {
            unit: 'kg',
            min: 3,
            max: 30,
            defaultVal: 5,
            rate: 25000
        },
        'dry-clean': {
            unit: 'pcs',
            min: 1,
            max: 15,
            defaultVal: 3,
            rate: 90000
        },
        'shoe-spa': {
            unit: 'pairs',
            min: 1,
            max: 5,
            defaultVal: 1,
            rate: 120000
        }
    };

    let activeService = 'wash-fold';

    function updateEstimatorUI() {
        const config = servicesConfig[activeService];
        
        // Update slider ranges
        slider.min = config.min;
        slider.max = config.max;
        slider.value = config.defaultVal;

        // Update tick labels
        tickMin.textContent = `${config.min} ${config.unit}`;
        tickMax.textContent = `${config.max} ${config.unit}`;

        // Update titles
        if (activeService === 'wash-fold') {
            unitTitle.textContent = 'Laundry Weight';
        } else if (activeService === 'dry-clean') {
            unitTitle.textContent = 'Number of Items';
        } else {
            unitTitle.textContent = 'Pairs of Shoes';
        }

        calculateEstimatorPrice(config.defaultVal);
    }

    function calculateEstimatorPrice(quantity) {
        const config = servicesConfig[activeService];
        const totalPriceVnd = quantity * config.rate;
        const usdRate = 25000; // Exchange rate approximation
        const totalPriceUsd = totalPriceVnd / usdRate;

        // Update displays
        qtyDisplay.textContent = `${quantity} ${config.unit}`;
        priceVndDisplay.textContent = totalPriceVnd.toLocaleString('en-US');
        priceUsdDisplay.textContent = `~$${totalPriceUsd.toFixed(2)} USD`;

        // Update steps animation logic based on slide value
        animateEstimatorSteps(quantity);
    }

    function animateEstimatorSteps(value) {
        const steps = ['proc-pickup', 'proc-wash', 'proc-dry', 'proc-deliver'];
        const lines = ['line-1', 'line-2', 'line-3'];
        
        // Simple step simulation progression based on slider percentage
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const percent = (value - min) / (max - min);

        steps.forEach((stepId, index) => {
            const stepEl = document.getElementById(stepId);
            if (stepEl) {
                if (percent >= (index / steps.length)) {
                    stepEl.classList.add('active');
                } else if (index > 0) {
                    stepEl.classList.remove('active');
                }
            }
        });

        lines.forEach((lineId, index) => {
            const lineEl = document.getElementById(lineId);
            if (lineEl) {
                if (percent > ((index + 1) / steps.length)) {
                    lineEl.classList.add('active');
                } else {
                    lineEl.classList.remove('active');
                }
            }
        });
    }

    // Tab clicks in estimator
    estTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            estTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeService = tab.getAttribute('data-service');
            updateEstimatorUI();
        });
    });

    // Slider input change
    if (slider) {
        slider.addEventListener('input', (e) => {
            calculateEstimatorPrice(parseInt(e.target.value));
        });
    }

    // Initialize Estimator
    if (slider) {
        updateEstimatorUI();
    }


    /* ==========================================
       4. SERVICE CAPABILITIES SLIDER
       ========================================== */
    const capTabs = document.querySelectorAll('.cap-tab');
    const capPanels = document.querySelectorAll('.cap-content-panel');
    const progressFill = document.getElementById('cap-progress-fill');

    capTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Deactivate tabs
            capTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Deactivate panels
            const targetId = tab.getAttribute('data-cap');
            capPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetId) {
                    panel.classList.add('active');
                }
            });

            // Update Progress Bar
            if (progressFill) {
                const percent = ((index + 1) / capTabs.length) * 100;
                progressFill.style.width = `${percent}%`;
            }
        });
    });


    /* ==========================================
       5. PRICING TOGGLE SWITCH (Per KG vs Per Item)
       ========================================== */
    const pricingToggle = document.getElementById('pricing-toggle');
    const labelKg = document.getElementById('label-kg');
    const labelItem = document.getElementById('label-item');

    // Pricing Data
    const pricingData = {
        kg: [
            {
                title: 'Standard Wash & Fold',
                desc: 'Everyday clothes, sheets, and activewear.',
                amount: '25k',
                unit: 'VND / kg',
                usd: '~$1.00 USD',
                features: [
                    'Individual machine wash',
                    'Standard scented softener',
                    'Neatly folded & sorted',
                    '24h standard turnaround',
                    '-Hanger styling & pressing',
                    '-Stain pre-spotting treatment'
                ]
            },
            {
                title: 'Premium Wash & Iron',
                desc: 'Work shirts, trousers, dresses, and uniforms.',
                amount: '40k',
                unit: 'VND / kg',
                usd: '~$1.60 USD',
                features: [
                    'Individual machine wash',
                    'Premium hypoallergenic softener',
                    'Neatly ironed & pressed',
                    'Garments placed on hangers',
                    'Light stain removal',
                    '24h standard turnaround'
                ]
            },
            {
                title: 'Blanket & Comforter',
                desc: 'Heavy comforters, duvets, blankets, and pillows.',
                amount: '60k',
                unit: 'VND / kg',
                usd: '~$2.40 USD',
                features: [
                    'Heavy-duty industrial wash',
                    'Sanitizing cycle to kill allergens',
                    'Fluff-dry treatment',
                    'Sealed hygienic packaging',
                    'Extra stain inspection',
                    '24-48h turnaround'
                ]
            }
        ],
        item: [
            {
                title: 'Shirts & Everyday Wear',
                desc: 'Individual T-shirts, shirts, shorts, skirts, etc.',
                amount: '35k',
                unit: 'VND / item',
                usd: '~$1.40 USD',
                features: [
                    'Individual sorting & care',
                    'Pre-treatment for collar sweat stains',
                    'Ironing & styling included',
                    'Returned on custom hangers',
                    '24h standard turnaround',
                    '-Dry cleaning solvent treatment'
                ]
            },
            {
                title: 'Suits, Coats & Jackets',
                desc: 'Formal suits, winter blazers, leather coats, dresses.',
                amount: '110k',
                unit: 'VND / item',
                usd: '~$4.40 USD',
                features: [
                    'Delicate solvent-based dry clean',
                    'Fabric protection treatment',
                    'Premium hand pressing',
                    'Starch application options',
                    'Garment breathable protective bag',
                    '48h standard turnaround'
                ]
            },
            {
                title: 'Premium Shoes Spa',
                desc: 'Sneakers, high heels, boots, suede leather shoes.',
                amount: '120k',
                unit: 'VND / pair',
                usd: '~$4.80 USD',
                features: [
                    '100% Manual detailing hand wash',
                    'Midsole stain removal & whitening',
                    'UV sterilization treatment',
                    'Deodorizing spray application',
                    'Safe climate-controlled drying',
                    '3-4 Days deep spa turnaround'
                ]
            }
        ]
    };

    function updatePricingCards(mode) {
        const cardsData = pricingData[mode];
        const cardIds = ['standard', 'premium', 'special'];

        cardIds.forEach((id, index) => {
            const data = cardsData[index];
            
            // Update Title, Desc, Amount, Unit, USD
            document.getElementById(`${id}-title`).textContent = data.title;
            document.getElementById(`${id}-desc`).textContent = data.desc;
            document.getElementById(`price-val-${id}`).textContent = data.amount;
            document.getElementById(`price-unit-${id}`).textContent = data.unit;
            document.getElementById(`usd-val-${id}`).textContent = data.usd;

            // Rebuild Features List
            const listEl = document.getElementById(`${id}-features-list`);
            if (listEl) {
                listEl.innerHTML = '';
                data.features.forEach(feat => {
                    const li = document.createElement('li');
                    if (feat.startsWith('-')) {
                        li.className = 'disabled';
                        li.innerHTML = `<i class="fa-solid fa-xmark"></i> ${feat.substring(1)}`;
                    } else {
                        li.innerHTML = `<i class="fa-solid fa-check"></i> ${feat}`;
                    }
                    listEl.appendChild(li);
                });
            }
        });

        // Update Fineprint
        const fineprint = document.getElementById('pricing-fineprint');
        if (fineprint) {
            if (mode === 'kg') {
                fineprint.innerHTML = '* Note: Minimum weight booking is 3 kg. Orders over 150k VND get free pickup & delivery within 3km.';
            } else {
                fineprint.innerHTML = '* Note: No minimum order count for single items. Orders over 150k VND get free pickup & delivery within 3km.';
            }
        }
    }

    if (pricingToggle) {
        pricingToggle.addEventListener('click', () => {
            pricingToggle.classList.toggle('toggled');
            if (pricingToggle.classList.contains('toggled')) {
                labelKg.classList.remove('active');
                labelItem.classList.add('active');
                updatePricingCards('item');
            } else {
                labelItem.classList.remove('active');
                labelKg.classList.add('active');
                updatePricingCards('kg');
            }
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

});
