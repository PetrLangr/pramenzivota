// Reservation Wizard for Homepage Integration

// Služby se načtou z API
let AVAILABLE_SERVICES = [];

// API funkce
async function loadServicesFromAPI() {
    try {
        const response = await fetch('http://localhost:3004/api/services');
        const result = await response.json();
        
        if (result.success) {
            AVAILABLE_SERVICES = result.data;
            return true;
        } else {
            console.error('Chyba při načítání služeb:', result.error);
            return false;
        }
    } catch (error) {
        console.error('Chyba API volání:', error);
        // Fallback na mock data
        AVAILABLE_SERVICES = [
            {
                id: 'energy-diagnosis',
                name: 'Energetické vyšetření',
                duration: 60,
                price: 1200,
                description: 'Komplexní diagnostika energetických toků a blokád v těle.'
            },
            {
                id: 'chakra-therapy',
                name: 'Chakrová terapie',
                duration: 90,
                price: 1500,
                description: 'Harmonizace a vyrovnání všech sedmi hlavních chaker.'
            },
            {
                id: 'reiki-healing',
                name: 'Reiki léčení',
                duration: 60,
                price: 1100,
                description: 'Japonská technika energetického léčení a relaxace.'
            }
        ];
        return false;
    }
}

async function loadCalendarFromAPI(year, month) {
    try {
        const response = await fetch(`http://localhost:3004/api/availability?type=calendar&year=${year}&month=${month}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Chyba při načítání kalendáře:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Chyba API volání kalendáře:', error);
        return null;
    }
}

async function loadTimeSlotsFromAPI(date) {
    try {
        const response = await fetch(`http://localhost:3004/api/availability?type=times&date=${date}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data.slots;
        } else {
            console.error('Chyba při načítání časů:', result.error);
            return [];
        }
    } catch (error) {
        console.error('Chyba API volání časů:', error);
        return [];
    }
}

const STEPS = [
    { id: 1, title: 'Výběr služby', icon: 'fa-heart' },
    { id: 2, title: 'Výběr termínu', icon: 'fa-calendar' },
    { id: 3, title: 'Platba', icon: 'fa-credit-card' },
    { id: 4, title: 'Potvrzení', icon: 'fa-check' }
];

// Reálný kalendářní systém s dostupností
const generateCalendarData = () => {
    const months = [];
    const today = new Date();
    
    // Generuje 3 měsíce dopředu
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
        const monthData = {
            year: currentMonth.getFullYear(),
            month: currentMonth.getMonth(),
            monthName: currentMonth.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }),
            days: []
        };
        
        // Získej počet dní v měsíci
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        
        // Generuj dny pro měsíc
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isPast = date < today;
            
            // Simulace dostupnosti - deterministická místo random
            let availability = 'available';
            if (isPast) availability = 'past';
            else if (isWeekend) availability = 'unavailable';
            else if ((day + monthOffset) % 7 === 0) availability = 'booked'; // Deterministicky obsazeno
            else if ((day + monthOffset) % 11 === 0) availability = 'pending'; // Deterministicky pending
            
            monthData.days.push({
                day: day,
                date: dateStr,
                dayOfWeek: date.getDay(),
                availability: availability,
                dayName: date.toLocaleDateString('cs-CZ', { weekday: 'short' })
            });
        }
        
        months.push(monthData);
    }
    
    return months;
};

const generateTimeSlotsForDate = (dateStr) => {
    const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    const dateHash = dateStr.split('-').reduce((sum, part) => sum + parseInt(part), 0);
    
    return times.map((time, index) => ({
        date: dateStr,
        time,
        available: (dateHash + index) % 3 !== 0 // Deterministická dostupnost
    }));
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
};

class ReservationWizard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentStep = 1;
        this.reservationData = {
            paymentMethod: 'card' // Výchozí platební metoda
        };
        this.calendarData = [];
        this.currentMonthIndex = 0;
        this.selectedDate = '';
        this.timeSelectionPhase = 'date'; // 'date' nebo 'time'
        this.isLoading = true;
        
        this.init();
    }
    
    async init() {
        // Načti služby z API
        await loadServicesFromAPI();
        
        // Načti kalendářní data z API
        const today = new Date();
        for (let i = 0; i < 3; i++) {
            const monthData = await loadCalendarFromAPI(today.getFullYear(), today.getMonth() + i);
            if (monthData) {
                this.calendarData.push(monthData);
            }
        }
        
        // Pokud se nepodařilo načíst z API, použij fallback
        if (this.calendarData.length === 0) {
            this.calendarData = generateCalendarData();
        }
        
        this.isLoading = false;
        this.render();
        this.attachEvents();
    }
    
    render() {
        // Zobraz loading state během načítání
        if (this.isLoading) {
            this.container.innerHTML = `
                <div class="reservation-wizard">
                    <div class="text-center py-8">
                        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p class="mt-4 text-gray-600">Načítání služeb...</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Uložit scroll pozici před re-renderem
        const wizardContent = this.container.querySelector('.wizard-content');
        const scrollTop = wizardContent ? wizardContent.scrollTop : 0;
        
        this.container.innerHTML = `
            <div class="reservation-wizard">
                <div class="wizard-layout">
                    <!-- Left Sidebar -->
                    <div class="wizard-sidebar">
                        <!-- Logo -->
                        <div class="sidebar-logo mb-4">
                            <img src="./assets/images/pramen_zivota_logo_header.png" alt="Pramen života s.r.o." class="sidebar-logo-img">
                        </div>
                        
                        <!-- Progress Steps -->
                        <div class="sidebar-steps">
                            ${STEPS.map(step => `
                                <div class="sidebar-step ${step.id <= this.currentStep ? 'active' : ''} ${step.id < this.currentStep ? 'completed' : ''}">
                                    <div class="sidebar-step-circle">
                                        <i class="fas ${step.id < this.currentStep ? 'fa-check' : step.icon}"></i>
                                    </div>
                                    <div class="sidebar-step-content">
                                        <div class="sidebar-step-title">${step.title}</div>
                                        <div class="sidebar-step-status">
                                            ${step.id < this.currentStep ? 'Dokončeno' : step.id === this.currentStep ? 'Aktuální krok' : 'Čeká'}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Navigation Buttons -->
                        <div class="sidebar-navigation">
                            ${this.currentStep > 1 && !(this.currentStep === 2 && this.timeSelectionPhase === 'date') ? `
                                <button class="btn btn-secondary w-100 mb-2" onclick="wizard.prevStep()">
                                    <i class="fas fa-arrow-left me-2"></i> Zpět
                                </button>
                            ` : ''}
                            
                            ${this.currentStep < 3 ? `
                                <button class="btn btn-primary w-100" onclick="wizard.nextStep()" 
                                        ${!this.canProceedToNext() ? 'disabled' : ''}>
                                    Pokračovat <i class="fas fa-arrow-right ms-2"></i>
                                </button>
                            ` : ''}
                            
                            ${this.currentStep === 3 ? `
                                ${this.reservationData.paymentMethod === 'on-site' ? `
                                    <button class="btn btn-primary w-100 ${!this.isFormValid() ? 'disabled' : ''}" 
                                            onclick="wizard.completeReservation()" 
                                            id="completeBtn"
                                            ${!this.isFormValid() ? 'disabled' : ''}>
                                        <i class="fas fa-check me-2"></i>Potvrdit rezervaci
                                    </button>
                                ` : `
                                    <button class="btn btn-success w-100 ${!this.isFormValid() ? 'disabled' : ''}" 
                                            onclick="wizard.completeReservation()" 
                                            id="completeBtn"
                                            ${!this.isFormValid() ? 'disabled' : ''}>
                                        <i class="fas fa-credit-card me-2"></i>Zaplatit ${this.reservationData.service?.price?.toLocaleString('cs-CZ')} Kč
                                    </button>
                                `}
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Right Content -->
                    <div class="wizard-content">
                        ${this.renderCurrentStep()}
                    </div>
                    
                    <!-- Mobile Navigation - Fixed Bottom -->
                    <div class="mobile-navigation">
                        <div class="mobile-nav-buttons">
                            ${this.currentStep > 1 && !(this.currentStep === 2 && this.timeSelectionPhase === 'date') ? `
                                <button class="btn btn-secondary" onclick="wizard.prevStep()" style="flex: 1;">
                                    <i class="fas fa-arrow-left me-2"></i> Zpět
                                </button>
                            ` : ''}
                            
                            ${this.currentStep < 3 ? `
                                <button class="btn btn-primary" onclick="wizard.nextStep()" 
                                        ${!this.canProceedToNext() ? 'disabled' : ''} style="flex: 2;">
                                    Pokračovat <i class="fas fa-arrow-right ms-2"></i>
                                </button>
                            ` : ''}
                            
                            ${this.currentStep === 3 ? `
                                ${this.reservationData.paymentMethod === 'on-site' ? `
                                    <button class="btn btn-primary ${!this.isFormValid() ? 'disabled' : ''}" 
                                            onclick="wizard.completeReservation()" 
                                            ${!this.isFormValid() ? 'disabled' : ''} style="flex: 1;">
                                        <i class="fas fa-check me-2"></i>Potvrdit rezervaci
                                    </button>
                                ` : `
                                    <button class="btn btn-success ${!this.isFormValid() ? 'disabled' : ''}" 
                                            onclick="wizard.completeReservation()" 
                                            ${!this.isFormValid() ? 'disabled' : ''} style="flex: 1;">
                                        <i class="fas fa-credit-card me-2"></i>Zaplatit ${this.reservationData.service?.price?.toLocaleString('cs-CZ')} Kč
                                    </button>
                                `}
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Obnovit scroll pozici po re-renderu
        setTimeout(() => {
            const newWizardContent = this.container.querySelector('.wizard-content');
            if (newWizardContent && scrollTop > 0) {
                newWizardContent.scrollTop = scrollTop;
            }
        }, 0);
        
        this.attachEvents();
    }
    
    renderCurrentStep() {
        switch(this.currentStep) {
            case 1: return this.renderServiceSelection();
            case 2: return this.renderTimeSelection();
            case 3: return this.renderContactForm();
            case 4: return this.renderThankYou();
            default: return this.renderServiceSelection();
        }
    }
    
    renderServiceSelection() {
        return `
            <div class="step-service-selection">
                <h3 class="h4 text-center mb-4">Vyberte službu</h3>
                <div class="services-grid">
                    ${AVAILABLE_SERVICES.map(service => `
                        <div class="service-card-compact ${this.reservationData.service?.id === service.id ? 'selected' : ''}" 
                             data-service-id="${service.id}">
                            <div class="service-card-header">
                                <h5 class="service-title">${service.name}</h5>
                                <div class="service-selection-check">
                                    <i class="fas fa-check"></i>
                                </div>
                            </div>
                            <div class="service-meta-compact">
                                <span class="service-duration">
                                    <i class="fas fa-clock"></i> ${service.duration} min
                                </span>
                                <span class="service-price">
                                    ${service.price.toLocaleString('cs-CZ')} Kč
                                </span>
                            </div>
                            <p class="service-description-short">${service.description.substring(0, 60)}...</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderTimeSelection() {
        if (this.timeSelectionPhase === 'date') {
            return this.renderDateSelection();
        } else {
            return this.renderTimeSlotSelection();
        }
    }
    
    renderDateSelection() {
        const currentMonth = this.calendarData[this.currentMonthIndex];
        const today = new Date();
        
        // Získej dny týdne pro header
        const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        
        // Získej první den měsíce (pondělí = 1, neděle = 0)
        const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
        const firstDayOfWeek = firstDay.getDay();
        const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Pondělí jako první den
        
        // Vytvoř prázdné buňky na začátek
        const calendarCells = [];
        for (let i = 0; i < startOffset; i++) {
            calendarCells.push('<div class="calendar-cell empty"></div>');
        }
        
        // Přidej dny měsíce
        currentMonth.days.forEach(dayData => {
            const isSelected = this.selectedDate === dayData.date;
            const canSelect = dayData.availability === 'available' || dayData.availability === 'pending';
            
            // Pokud je datum vybráno ale rezervace není dokončena, zobraz jako "pending"
            let displayAvailability = dayData.availability;
            if (isSelected && this.reservationData.timeSlot?.date === dayData.date) {
                displayAvailability = 'pending';
            }
            
            calendarCells.push(`
                <div class="calendar-cell ${displayAvailability} ${isSelected ? 'selected' : ''} ${canSelect ? 'clickable' : ''}" 
                     data-date="${dayData.date}">
                    <div class="calendar-cell-number">${dayData.day}</div>
                    <div class="calendar-cell-indicator ${displayAvailability}"></div>
                </div>
            `);
        });
        
        return `
            <div class="step-date-selection">
                <div class="text-center mb-3">
                    <h3 class="h4 mb-3">Vyberte datum</h3>
                    ${this.reservationData.service ? `
                        <div class="selected-service-compact p-2 bg-light rounded">
                            <strong>${this.reservationData.service.name}</strong> - ${this.reservationData.service.duration} min - ${this.reservationData.service.price.toLocaleString('cs-CZ')} Kč
                        </div>
                    ` : ''}
                </div>
                
                <!-- Month Navigation -->
                <div class="calendar-header">
                    <button class="month-nav prev ${this.currentMonthIndex === 0 ? 'disabled' : ''}" 
                            onclick="wizard.changeMonth(-1)" 
                            ${this.currentMonthIndex === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    
                    <h4 class="current-month">${currentMonth.monthName}</h4>
                    
                    <button class="month-nav next ${this.currentMonthIndex >= this.calendarData.length - 1 ? 'disabled' : ''}"
                            onclick="wizard.changeMonth(1)"
                            ${this.currentMonthIndex >= this.calendarData.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <!-- Calendar -->
                <div class="calendar-container">
                    <!-- Day Headers -->
                    <div class="calendar-headers">
                        ${dayNames.map(day => `<div class="day-header">${day}</div>`).join('')}
                    </div>
                    
                    <!-- Calendar Grid -->
                    <div class="calendar-body">
                        ${calendarCells.join('')}
                    </div>
                </div>
                
                <!-- Legend -->
                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="legend-indicator available"></span>
                        Dostupné
                    </div>
                    <div class="legend-item">
                        <span class="legend-indicator pending"></span>
                        Vybráno/Rezervováno
                    </div>
                    <div class="legend-item">
                        <span class="legend-indicator booked"></span>
                        Obsazeno
                    </div>
                    <div class="legend-item">
                        <span class="legend-indicator unavailable"></span>
                        Nedostupné
                    </div>
                </div>
            </div>
        `;
    }
    
    renderTimeSlotSelection() {
        const timeSlotsForDate = generateTimeSlotsForDate(this.selectedDate);
        
        return `
            <div class="step-time-slots">
                <div class="text-center mb-4">
                    <h3 class="h4 mb-3">Vyberte čas</h3>
                    <div class="selected-date-info">
                        <div class="selected-date-text">
                            <strong>${formatDate(this.selectedDate)}</strong>
                        </div>
                        <button class="change-date-btn" onclick="wizard.changeDate()">
                            <i class="fas fa-calendar-alt"></i> Změnit datum
                        </button>
                    </div>
                </div>
                
                <div class="time-slots-grid-compact">
                    ${timeSlotsForDate.map(slot => `
                        <button class="time-slot-compact ${!slot.available ? 'disabled' : ''} ${this.reservationData.timeSlot?.time === slot.time ? 'selected' : ''}" 
                                data-date="${slot.date}" 
                                data-time="${slot.time}"
                                ${!slot.available ? 'disabled' : ''}>
                            <div class="time-slot-time">${slot.time}</div>
                            ${!slot.available ? '<div class="time-slot-status unavailable">Obsazeno</div>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderContactForm() {
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('cs-CZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        };
        
        return `
            <div class="step-contact-form">
                <h3 class="h4 text-center mb-4">Kontaktní údaje a platba</h3>
                <p class="text-center text-muted mb-5">Již jen krok od dokončení rezervace</p>
                
                <!-- Souhrn rezervace -->
                <div class="reservation-summary bg-light p-4 rounded mb-5 border-start border-success border-4">
                    <h5 class="mb-3">Souhrn rezervace</h5>
                    
                    ${this.reservationData.service && this.reservationData.timeSlot ? `
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <strong>Služba:</strong> ${this.reservationData.service.name}
                            </div>
                            <div class="col-md-6 mb-2">
                                <strong>Datum:</strong> ${formatDate(this.reservationData.timeSlot.date)} v ${this.reservationData.timeSlot.time}
                            </div>
                            <div class="col-md-6 mb-2">
                                <strong>Délka:</strong> ${this.reservationData.service.duration} minut
                            </div>
                            <div class="col-md-6 mb-2">
                                <strong>Celková cena:</strong> <span class="text-success fw-bold fs-5">${this.reservationData.service.price.toLocaleString('cs-CZ')} Kč</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="row">
                    <!-- Kontaktní údaje -->
                    <div class="col-md-6">
                        <h5 class="mb-3">Kontaktní údaje</h5>
                        <form id="reservationForm">
                            <div class="mb-3">
                                <label class="form-label">Jméno a příjmení *</label>
                                <input type="text" class="form-control" name="name" required 
                                       placeholder="Vaše jméno" 
                                       value="${this.reservationData.customerInfo?.name || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">E-mail *</label>
                                <input type="email" class="form-control" name="email" required
                                       placeholder="vas.email@priklad.cz"
                                       value="${this.reservationData.customerInfo?.email || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Telefon *</label>
                                <input type="tel" class="form-control" name="phone" required
                                       placeholder="+420 123 456 789"
                                       value="${this.reservationData.customerInfo?.phone || ''}">
                            </div>
                        </form>
                    </div>
                    
                    <!-- Způsob platby -->
                    <div class="col-md-6">
                        <h5 class="mb-3">Způsob platby</h5>
                        
                        <div class="payment-options">
                            <div class="payment-option mb-3 p-3 border rounded cursor-pointer ${this.reservationData.paymentMethod === 'card' || !this.reservationData.paymentMethod ? 'selected border-primary bg-light' : 'border-light'}" data-payment="card">
                                <div class="d-flex align-items-center">
                                    <div class="form-check me-3">
                                        <input class="form-check-input" type="radio" name="paymentMethod" value="card" ${this.reservationData.paymentMethod === 'card' || !this.reservationData.paymentMethod ? 'checked' : ''}>
                                    </div>
                                    <div>
                                        <div class="fw-bold">Platební karta</div>
                                        <small class="text-muted">Visa, Mastercard - okamžitá platba</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="payment-option mb-3 p-3 border rounded cursor-pointer ${this.reservationData.paymentMethod === 'bank-transfer' ? 'selected border-primary bg-light' : 'border-light'}" data-payment="bank-transfer">
                                <div class="d-flex align-items-center">
                                    <div class="form-check me-3">
                                        <input class="form-check-input" type="radio" name="paymentMethod" value="bank-transfer" ${this.reservationData.paymentMethod === 'bank-transfer' ? 'checked' : ''}>
                                    </div>
                                    <div>
                                        <div class="fw-bold">Bankovní převod</div>
                                        <small class="text-muted">Platba na účet - rezervace do 24h</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="payment-option mb-3 p-3 border rounded cursor-pointer ${this.reservationData.paymentMethod === 'on-site' ? 'selected border-primary bg-light' : 'border-light'}" data-payment="on-site">
                                <div class="d-flex align-items-center">
                                    <div class="form-check me-3">
                                        <input class="form-check-input" type="radio" name="paymentMethod" value="on-site" ${this.reservationData.paymentMethod === 'on-site' ? 'checked' : ''}>
                                    </div>
                                    <div>
                                        <div class="fw-bold">Platba na místě</div>
                                        <small class="text-muted">Zaplatíte při návštěvě centra</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="cancellation-info p-3 bg-light border border-secondary rounded mt-4">
                            <small class="text-dark">
                                <i class="fas fa-info-circle text-secondary me-1"></i>
                                <strong>Zrušení rezervace:</strong> Možné do 24 hodin před termínem.
                                Při včasném zrušení vrátíme 100% částky.
                            </small>
                        </div>
                    </div>
                </div>
                
                <div class="form-check mt-4 mb-4">
                    <input class="form-check-input" type="checkbox" name="gdprConsent" id="gdprConsent" required>
                    <label class="form-check-label" for="gdprConsent">
                        Souhlasím se zpracováním osobních údajů podle GDPR *
                    </label>
                </div>
                
            </div>
        `;
    }
    
    renderThankYou() {
        const reservationId = 'PZ' + Date.now().toString().slice(-6);
        
        return `
            <div class="step-thank-you text-center">
                <div class="success-icon mb-4">
                    <i class="fas fa-check-circle fa-5x text-success"></i>
                </div>
                
                <h3 class="h3 text-success mb-3">Rezervace úspěšně vytvořena!</h3>
                <p class="lead mb-4">Děkujeme za vaši rezervaci. Potvrzení jsme vám zaslali na e-mail.</p>
                
                <div class="reservation-summary bg-light p-4 rounded mb-4">
                    <h5 class="mb-3">Shrnutí rezervace</h5>
                    <div class="row text-start">
                        <div class="col-sm-6 mb-2"><strong>Číslo:</strong> ${reservationId}</div>
                        <div class="col-sm-6 mb-2"><strong>Služba:</strong> ${this.reservationData.service?.name}</div>
                        <div class="col-sm-6 mb-2"><strong>Datum:</strong> ${this.reservationData.timeSlot?.date || 'Vybraný termín'}</div>
                        <div class="col-sm-6 mb-2"><strong>Čas:</strong> ${this.reservationData.timeSlot?.time || 'Vybraný čas'}</div>
                        <div class="col-sm-6 mb-2"><strong>Jméno:</strong> ${this.reservationData.customerInfo?.name}</div>
                        <div class="col-sm-6 mb-2"><strong>Cena:</strong> <span class="text-success">${this.reservationData.service?.price?.toLocaleString('cs-CZ')} Kč</span></div>
                    </div>
                </div>
                
                <div class="next-steps mb-4">
                    <h6 class="mb-3">Co dál?</h6>
                    <div class="row text-start">
                        <div class="col-md-6 mb-2">
                            <i class="fas fa-envelope text-primary me-2"></i>
                            Potvrzení na e-mail do 15 minut
                        </div>
                        <div class="col-md-6 mb-2">
                            <i class="fas fa-sms text-primary me-2"></i>
                            SMS připomínka den před termínem
                        </div>
                        <div class="col-md-6 mb-2">
                            <i class="fas fa-clock text-primary me-2"></i>
                            Dostavte se 10 minut před časem
                        </div>
                        <div class="col-md-6 mb-2">
                            <i class="fas fa-phone text-primary me-2"></i>
                            Dotazy: +420 123 456 789
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-outline-primary me-2" onclick="window.print()">
                        <i class="fas fa-print"></i> Vytisknout
                    </button>
                    <button class="btn btn-primary" onclick="wizard.reset()">
                        <i class="fas fa-plus"></i> Nová rezervace
                    </button>
                </div>
            </div>
        `;
    }
    
    attachEvents() {
        // Service selection - compact cards
        document.querySelectorAll('.service-card-compact').forEach(card => {
            card.addEventListener('click', (e) => {
                const serviceId = card.dataset.serviceId;
                const service = AVAILABLE_SERVICES.find(s => s.id === serviceId);
                
                if (service) {
                    this.reservationData.service = service;
                    this.render();
                }
            });
        });
        
        // Calendar cell selection - plynulý přechod na time selection
        document.querySelectorAll('.calendar-cell.clickable').forEach(cell => {
            cell.addEventListener('click', (e) => {
                this.selectedDate = cell.dataset.date;
                // Plynulý přechod s animací
                setTimeout(() => {
                    this.timeSelectionPhase = 'time';
                    this.render();
                }, 500);
            });
        });
        
        // Time slot selection - compact buttons
        document.querySelectorAll('.time-slot-compact:not(.disabled)').forEach(button => {
            button.addEventListener('click', (e) => {
                const date = button.dataset.date;
                const time = button.dataset.time;
                
                this.reservationData.timeSlot = {
                    date: date,
                    time: time
                };
                this.render();
            });
        });
        
        // Payment method selection - bez full re-render
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const paymentMethod = option.dataset.payment;
                this.reservationData.paymentMethod = paymentMethod;
                
                // Update radio buttons
                document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
                    radio.checked = radio.value === paymentMethod;
                });
                
                // Update payment option styling
                document.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('selected', 'border-primary', 'bg-light');
                    opt.classList.add('border-light');
                });
                option.classList.add('selected', 'border-primary', 'bg-light');
                option.classList.remove('border-light');
                
                // Update pouze sidebar tlačítka
                this.updateSidebarNavigation();
            });
        });
        
        // Payment method radio buttons - bez full re-render
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.reservationData.paymentMethod = e.target.value;
                this.updateSidebarNavigation();
            });
        });
        
        // Form field validation - real-time button update
        document.querySelectorAll('#reservationForm input, #reservationForm textarea').forEach(field => {
            field.addEventListener('input', () => {
                this.updateButtonState();
            });
        });
        
        document.querySelectorAll('#reservationForm input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateButtonState();
            });
        });
    }
    
    nextStep() {
        if (this.currentStep === 2 && this.timeSelectionPhase === 'date' && this.selectedDate) {
            // Přejdi z výběru data na výběr času
            this.timeSelectionPhase = 'time';
            this.render();
        } else if (this.currentStep < STEPS.length) {
            this.currentStep++;
            if (this.currentStep === 2) {
                this.timeSelectionPhase = 'date';
            }
            this.render();
        }
    }
    
    prevStep() {
        if (this.currentStep === 2 && this.timeSelectionPhase === 'time') {
            // Vrať se z výběru času na výběr data
            this.timeSelectionPhase = 'date';
            this.render();
        } else if (this.currentStep > 1) {
            this.currentStep--;
            this.render();
        }
    }
    
    changeDate() {
        this.timeSelectionPhase = 'date';
        this.reservationData.timeSlot = null;
        this.render();
    }
    
    changeMonth(direction) {
        const newIndex = this.currentMonthIndex + direction;
        if (newIndex >= 0 && newIndex < this.calendarData.length) {
            this.currentMonthIndex = newIndex;
            this.selectedDate = ''; // Clear selected date when changing month
            this.render();
        }
    }
    
    async completeReservation() {
        // Collect form data
        const form = document.getElementById('reservationForm');
        const formData = new FormData(form);
        
        this.reservationData.customerInfo = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            note: formData.get('note'),
            paymentMethod: this.reservationData.paymentMethod,
            gdprConsent: formData.get('gdprConsent') === 'on'
        };
        
        // Disable button during processing
        const completeBtn = document.getElementById('completeBtn');
        if (completeBtn) {
            completeBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Zpracováváme...';
            completeBtn.disabled = true;
        }
        
        try {
            // Vytvoř rezervaci přes API
            const response = await fetch('http://localhost:3004/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    serviceId: this.reservationData.service.id,
                    employeeId: '1', // Default první zaměstnanec
                    startDateTime: new Date(this.reservationData.timeSlot.date + 'T' + this.reservationData.timeSlot.time + ':00').toISOString(),
                    customerInfo: this.reservationData.customerInfo,
                    paymentMethod: this.reservationData.paymentMethod.toUpperCase()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.reservationData.appointmentId = result.data.id;
                
                // Pokud je platba online, přesměruj na platební bránu
                if (this.reservationData.paymentMethod !== 'on-site') {
                    await this.processOnlinePayment(result.data);
                } else {
                    // Přejdi na potvrzení
                    this.currentStep = 4;
                    this.render();
                }
            } else {
                alert('Chyba při vytváření rezervace: ' + result.error);
                // Restore button
                if (completeBtn) {
                    completeBtn.innerHTML = '<i class="fas fa-check me-2"></i>Potvrdit rezervaci';
                    completeBtn.disabled = false;
                }
            }
        } catch (error) {
            console.error('Chyba při vytváření rezervace:', error);
            alert('Chyba při spojení se serverem. Zkuste to prosím znovu.');
            
            // Restore button
            if (completeBtn) {
                completeBtn.innerHTML = '<i class="fas fa-check me-2"></i>Potvrdit rezervaci';
                completeBtn.disabled = false;
            }
        }
    }
    
    async processOnlinePayment(appointmentData) {
        try {
            const response = await fetch('http://localhost:3004/api/payments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appointmentId: appointmentData.id,
                    amount: this.reservationData.service.price,
                    currency: 'CZK',
                    paymentMethod: 'comgate',
                    customerInfo: this.reservationData.customerInfo,
                    description: `Rezervace: ${this.reservationData.service.name}`
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.data.paymentUrl) {
                // Přesměruj na platební bránu
                window.location.href = result.data.paymentUrl;
            } else {
                alert('Chyba při vytváření platby: ' + result.error);
                this.currentStep = 4; // Přejdi na potvrzení i bez platby
                this.render();
            }
        } catch (error) {
            console.error('Chyba při vytváření platby:', error);
            alert('Chyba při vytváření platby. Rezervace byla vytvořena, ale platbu dokončete později.');
            this.currentStep = 4;
            this.render();
        }
    }
    
    canProceedToNext() {
        switch(this.currentStep) {
            case 1: return !!this.reservationData.service;
            case 2: 
                if (this.timeSelectionPhase === 'date') {
                    return !!this.selectedDate;
                } else {
                    return !!this.reservationData.timeSlot;
                }
            case 3: 
                const formValid = this.isFormValid();
                return formValid && this.reservationData.paymentMethod;
            default: return false;
        }
    }
    
    updateButtonState() {
        const completeBtn = document.getElementById('completeBtn');
        if (completeBtn) {
            const isValid = this.isFormValid();
            if (isValid) {
                completeBtn.classList.remove('disabled');
                completeBtn.removeAttribute('disabled');
            } else {
                completeBtn.classList.add('disabled');
                completeBtn.setAttribute('disabled', 'true');
            }
        }
    }
    
    updateSidebarNavigation() {
        const sidebarNav = document.querySelector('.sidebar-navigation');
        if (sidebarNav && this.currentStep === 3) {
            const isValid = this.isFormValid();
            const buttonHtml = this.reservationData.paymentMethod === 'on-site' ? `
                <button class="btn btn-primary w-100 ${!isValid ? 'disabled' : ''}" 
                        onclick="wizard.completeReservation()" 
                        id="completeBtn"
                        ${!isValid ? 'disabled' : ''}>
                    <i class="fas fa-check me-2"></i>Potvrdit rezervaci
                </button>
            ` : `
                <button class="btn btn-success w-100 ${!isValid ? 'disabled' : ''}" 
                        onclick="wizard.completeReservation()" 
                        id="completeBtn"
                        ${!isValid ? 'disabled' : ''}>
                    <i class="fas fa-credit-card me-2"></i>Zaplatit ${this.reservationData.service?.price?.toLocaleString('cs-CZ')} Kč
                </button>
            `;
            
            sidebarNav.innerHTML = buttonHtml;
        }
    }
    
    isFormValid() {
        const form = document.getElementById('reservationForm');
        if (!form) return false;
        
        const name = form.querySelector('input[name="name"]')?.value?.trim();
        const email = form.querySelector('input[name="email"]')?.value?.trim();
        const phone = form.querySelector('input[name="phone"]')?.value?.trim();
        const gdpr = form.querySelector('input[name="gdprConsent"]')?.checked;
        
        return name && email && phone && email.includes('@') && gdpr;
    }
    
    reset() {
        this.currentStep = 1;
        this.reservationData = {
            paymentMethod: 'card'
        };
        this.selectedDate = '';
        this.timeSelectionPhase = 'date';
        this.render();
    }
}

// Initialize wizard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('reservation-wizard-container')) {
        window.wizard = new ReservationWizard('reservation-wizard-container');
    }
});