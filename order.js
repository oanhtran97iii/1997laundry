document.addEventListener('DOMContentLoaded', function () {

    const TOTAL_STEPS = 5;
    let currentStep = 1;

    const form = document.getElementById('order-form');
    const stepPanels = document.querySelectorAll('.wizard-step');
    const progressSteps = document.querySelectorAll('.wizard-progress-step');
    const backBtn = document.getElementById('wizard-back');
    const nextBtn = document.getElementById('wizard-next');
    const submitBtn = document.getElementById('wizard-submit');

    const serviceLabels = {
        sameday: 'Same-Day Laundry',
        express4h: '4-Hour Express Laundry',
        nextday: 'Next-day Laundry',
        bedding: 'Bed Linens & Mattress Cleaning'
    };

    const collectionLabels = {
        reception: 'Reception / security',
        safeplace: 'Safe place (lobby / mailroom)',
        fromyou: 'Directly from you',
        custom: 'Custom instructions'
    };

    function formatVND(n) {
        return Math.round(n).toLocaleString('vi-VN') + 'đ';
    }

    // ---------- Step navigation ----------
    function goToStep(step) {
        currentStep = step;

        stepPanels.forEach(panel => {
            panel.classList.toggle('active', parseInt(panel.dataset.stepPanel, 10) === step);
        });

        progressSteps.forEach(el => {
            const s = parseInt(el.dataset.step, 10);
            el.classList.toggle('active', s === step);
            el.classList.toggle('completed', s < step);
        });

        backBtn.style.display = step === 1 ? 'none' : 'inline-flex';
        nextBtn.style.display = step === TOTAL_STEPS ? 'none' : 'inline-flex';
        submitBtn.style.display = step === TOTAL_STEPS ? 'inline-flex' : 'none';

        window.scrollTo({ top: form.offsetTop - 120, behavior: 'smooth' });
    }

    function validateStep(step) {
        if (step === 2) {
            const date = document.getElementById('pickup-date');
            const time = document.getElementById('pickup-time');
            if (!date.value || !time.value) {
                alert('Please choose a pickup date and time.');
                return false;
            }
        }
        if (step === 3) {
            const name = document.getElementById('customer-name');
            const phone = document.getElementById('customer-phone');
            if (!name.value.trim() || !phone.value.trim()) {
                alert('Please enter your name and phone number.');
                return false;
            }
        }
        if (step === 4) {
            const hotel = document.getElementById('hotel-room');
            if (!hotel.value.trim()) {
                alert('Please enter your hotel and room number.');
                return false;
            }
        }
        return true;
    }

    nextBtn.addEventListener('click', function () {
        if (!validateStep(currentStep)) return;
        if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
    });

    backBtn.addEventListener('click', function () {
        if (currentStep > 1) goToStep(currentStep - 1);
    });

    // ---------- Step 1: Service selection ----------
    // The inline accordion (sub-items opening right under the selected card)
    // is handled purely in CSS via :has(input:checked), since only one radio
    // in the "service" group can be checked at a time.
    const serviceCards = document.querySelectorAll('.service-option-card');

    serviceCards.forEach(card => {
        card.addEventListener('click', function () {
            const input = card.querySelector('input');
            input.checked = true;
            resetWeightToBase();
            updateSidebar();
        });
    });

    const addonWhite = document.getElementById('addon-white');
    addonWhite.addEventListener('change', updateSidebar);

    // Bed Linens & Mattress Cleaning has two differently-priced sub-items
    // (Summer Blankets vs Duvet/Mattress Topper) — selecting one changes pricing.
    const beddingTypeRadios = document.querySelectorAll('input[name="bedding-type"]');
    beddingTypeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            resetWeightToBase();
            updateSidebar();
        });
    });

    // ---------- Step 2: Weight estimator ----------
    const weightInput = document.getElementById('weight-input');
    const weightSlider = document.getElementById('weight-slider');
    const weightMinus = document.getElementById('weight-minus');
    const weightPlus = document.getElementById('weight-plus');

    function syncWeight(value) {
        const minAllowed = getActivePricing().per;
        const v = Math.max(minAllowed, Math.round(parseFloat(value) || minAllowed));
        weightInput.value = v;
        weightSlider.value = v;
        weightMinus.disabled = v <= minAllowed;
        updateSidebar();
    }

    weightInput.addEventListener('input', () => syncWeight(weightInput.value));
    weightSlider.addEventListener('input', () => syncWeight(weightSlider.value));
    weightMinus.addEventListener('click', () => syncWeight(parseFloat(weightInput.value) - 1));
    weightPlus.addEventListener('click', () => syncWeight(parseFloat(weightInput.value) + 1));

    function getSelectedService() {
        const checked = document.querySelector('.service-option-card input:checked');
        return checked ? checked.closest('.service-option-card') : null;
    }

    // Returns the active pricing { price, per, extra } — for Bed Linens & Mattress
    // Cleaning this comes from whichever sub-item (Summer Blankets / Duvet) is
    // selected, since each has its own base price and extra-per-kg rate.
    function getActivePricing() {
        const card = getSelectedService();
        if (!card) return { price: 0, per: 1, extra: 0 };

        if (card.dataset.service === 'bedding') {
            const checkedType = document.querySelector('input[name="bedding-type"]:checked');
            const subEl = checkedType ? checkedType.closest('.subitem-option') : null;
            if (subEl) {
                return {
                    price: parseFloat(subEl.dataset.price),
                    per: parseFloat(subEl.dataset.priceper),
                    extra: parseFloat(subEl.dataset.extra)
                };
            }
        }

        return {
            price: parseFloat(card.dataset.price),
            per: parseFloat(card.dataset.priceper),
            extra: parseFloat(card.dataset.extra)
        };
    }

    // Whenever the service (or its bedding sub-type) changes, snap the weight
    // input back to that option's base kg, so a leftover weight from a
    // previously-selected service doesn't stay mismatched (e.g. 5Kg carried
    // over onto a 3Kg-base service).
    function resetWeightToBase() {
        const pricing = getActivePricing();
        weightInput.min = pricing.per;
        weightSlider.min = pricing.per;
        weightInput.value = pricing.per;
        weightSlider.value = pricing.per;
        weightMinus.disabled = true;
    }

    function calculateTotal() {
        const pricing = getActivePricing();
        const weight = parseFloat(weightInput.value) || pricing.per;

        let total = pricing.price;
        if (weight > pricing.per) {
            total += (weight - pricing.per) * pricing.extra;
        }
        if (addonWhite.checked) {
            total += 30000;
        }
        return total;
    }

    // ---------- Step 3: Collection method ----------
    const collectionRadios = document.querySelectorAll('input[name="collection-method"]');
    const collectionInstructions = document.getElementById('collection-instructions');

    collectionRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            collectionInstructions.style.display = radio.value === 'custom' && radio.checked ? 'block' : 'none';
            updateSidebar();
        });
    });

    // ---------- Steps 3-5: plain fields also refresh the live sidebar ----------
    ['pickup-date', 'pickup-time', 'customer-name', 'customer-phone', 'phone-country-code', 'customer-whatsapp', 'whatsapp-country-code', 'hotel-room', 'address-map'].forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', updateSidebar);
        el.addEventListener('change', updateSidebar);
    });
    collectionInstructions.addEventListener('input', updateSidebar);

    // ---------- Live Sidebar ----------
    function getCollectionMethodText() {
        const methodInput = document.querySelector('input[name="collection-method"]:checked');
        if (!methodInput) return null;
        if (methodInput.value === 'custom') {
            return collectionInstructions.value.trim() || 'Custom instructions (see notes)';
        }
        return collectionLabels[methodInput.value];
    }

    function toggleBlock(id, show) {
        const el = document.getElementById(id);
        if (el) el.style.display = show ? 'flex' : 'none';
    }

    function getServiceDisplayName() {
        const card = getSelectedService();
        const serviceKey = card ? card.dataset.service : '';
        let name = serviceLabels[serviceKey] || '—';

        if (serviceKey === 'bedding') {
            const checkedType = document.querySelector('input[name="bedding-type"]:checked');
            if (checkedType) {
                const subName = checkedType.value === 'duvet' ? 'Duvet / Mattress Topper' : 'Summer Blankets & Bed Sheets';
                name += ' — ' + subName;
            }
        }
        return name;
    }

    function updateSidebar() {
        const card = getSelectedService();
        const serviceKey = card ? card.dataset.service : '';
        const weight = weightInput.value;
        const total = calculateTotal();

        document.getElementById('side-service').textContent = getServiceDisplayName();
        // Weight is now shown directly by the interactive control itself (#weight-input),
        // which lives inside the sidebar — no separate display element needed.
        document.getElementById('side-total').textContent = formatVND(total);

        toggleBlock('side-addon-block', addonWhite.checked);

        const date = document.getElementById('pickup-date').value;
        const time = document.getElementById('pickup-time').value;
        if (date || time) {
            document.getElementById('side-pickup').textContent = (date || '—') + (time ? ' at ' + time : '');
            toggleBlock('side-pickup-block', true);
        } else {
            toggleBlock('side-pickup-block', false);
        }

        const methodText = getCollectionMethodText();
        if (methodText) {
            document.getElementById('side-method').textContent = methodText;
            toggleBlock('side-method-block', true);
        } else {
            toggleBlock('side-method-block', false);
        }

        const name = document.getElementById('customer-name').value.trim();
        toggleBlock('side-name-block', !!name);
        if (name) document.getElementById('side-name').textContent = name;

        const phone = getFullPhone();
        toggleBlock('side-phone-block', !!phone);
        if (phone) document.getElementById('side-phone').textContent = phone;

        const whatsapp = getFullWhatsapp();
        const whatsappDiffersFromPhone = whatsapp && whatsapp !== phone;
        toggleBlock('side-whatsapp-block', !!whatsappDiffersFromPhone);
        if (whatsappDiffersFromPhone) document.getElementById('side-whatsapp').textContent = whatsapp;

        const hotel = document.getElementById('hotel-room').value.trim();
        const address = document.getElementById('address-map').value.trim();
        if (hotel || address) {
            document.getElementById('side-location').textContent = hotel + (address ? ' — ' + address : '');
            toggleBlock('side-location-block', true);
        } else {
            toggleBlock('side-location-block', false);
        }
    }

    // Combines the selected country-code dropdown with the typed number into
    // a single "+84 912345678" style string. Returns '' if the number field
    // is empty (so callers can decide how to display an unfilled phone).
    function getFullPhone() {
        const number = document.getElementById('customer-phone').value.trim();
        if (!number) return '';
        const code = document.getElementById('phone-country-code').value;
        return (code === '+other' ? '' : code + ' ') + number;
    }

    // Same idea for the WhatsApp number, which is optional — customers
    // sometimes use a different number for WhatsApp than their phone.
    function getFullWhatsapp() {
        const number = document.getElementById('customer-whatsapp').value.trim();
        if (!number) return '';
        const code = document.getElementById('whatsapp-country-code').value;
        return (code === '+other' ? '' : code + ' ') + number;
    }

    // ---------- Submit -> build message + show popup ----------
    const popupOverlay = document.getElementById('order-popup-overlay');
    const popupClose = document.getElementById('order-popup-close');
    const popupWa = document.getElementById('popup-send-whatsapp');
    const popupZalo = document.getElementById('popup-send-zalo');

    const WHATSAPP_NUMBER = '84866137043';
    const ZALO_NUMBER = '0866137043';

    function buildOrderMessage() {
        const card = getSelectedService();
        const serviceKey = card ? card.dataset.service : '';
        const weight = weightInput.value;
        const total = formatVND(calculateTotal());
        const date = document.getElementById('pickup-date').value;
        const time = document.getElementById('pickup-time').value;
        const method = getCollectionMethodText() || '—';
        const name = document.getElementById('customer-name').value;
        const phone = getFullPhone();
        const whatsapp = getFullWhatsapp();
        const notes = document.getElementById('customer-notes').value;
        const hotel = document.getElementById('hotel-room').value;
        const address = document.getElementById('address-map').value;
        const addon = addonWhite.checked ? 'Yes' : 'No';

        const lines = [
            'New Laundry Pickup Request — 1997 Laundry',
            '',
            'Service: ' + getServiceDisplayName(),
            'Estimated weight: ' + weight + ' Kg',
            'Wash white separately: ' + addon,
            'Estimated total: ' + total,
            '',
            'Pickup date: ' + (date || '—'),
            'Pickup time: ' + (time || '—'),
            'Collection method: ' + method,
            '',
            'Name: ' + (name || '—'),
            'Phone: ' + (phone || '—'),
            'WhatsApp: ' + (whatsapp || 'Same as phone'),
            'Notes: ' + (notes || '—'),
            '',
            'Hotel/Room: ' + (hotel || '—'),
            'Address/Map: ' + (address || '—')
        ];

        return lines.join('\n');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateStep(3) || !validateStep(4)) return;

        const message = buildOrderMessage();
        const encoded = encodeURIComponent(message);

        popupWa.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encoded;
        popupZalo.href = 'https://zalo.me/' + ZALO_NUMBER;
        popupZalo.dataset.message = message;

        popupOverlay.classList.add('visible');
    });

    // Unlike WhatsApp (which supports a `?text=` param to pre-fill the
    // message), Zalo's public chat link has no equivalent — it only opens
    // the chat. So we copy the order details to the clipboard on click and
    // show a toast telling the customer to paste it once Zalo opens.
    popupZalo.addEventListener('click', function () {
        const message = popupZalo.dataset.message || '';
        if (navigator.clipboard && message) {
            navigator.clipboard.writeText(message).then(showZaloToast).catch(showZaloToast);
        } else {
            showZaloToast();
        }
    });

    function showZaloToast() {
        const toast = document.getElementById('zalo-copy-toast');
        if (!toast) return;
        toast.classList.add('visible');
        clearTimeout(showZaloToast._timer);
        showZaloToast._timer = setTimeout(() => toast.classList.remove('visible'), 7000);
    }

    popupClose.addEventListener('click', () => popupOverlay.classList.remove('visible'));
    popupOverlay.addEventListener('click', function (e) {
        if (e.target === popupOverlay) popupOverlay.classList.remove('visible');
    });

    // Init
    goToStep(1);
    resetWeightToBase();
    updateSidebar();
});