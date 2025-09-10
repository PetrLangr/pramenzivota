// Events Registration System for Homepage Integration

// Events se načtou z API
let AVAILABLE_EVENTS = [];

// API funkce
async function loadEventsFromAPI() {
    try {
        const response = await fetch('http://localhost:3004/api/events');
        const result = await response.json();
        
        if (result.success) {
            AVAILABLE_EVENTS = result.data;
            return true;
        } else {
            console.error('Chyba při načítání událostí:', result.error);
            return false;
        }
    } catch (error) {
        console.error('Chyba API volání:', error);
        // Fallback na mock data
        AVAILABLE_EVENTS = [
            {
                id: 'group-energy-workshop',
                name: 'Skupinový workshop energetické harmonizace',
                description: 'Jedinečný zážitek skupinového energetického léčení a harmonizace. Společně objevíme sílu kolektivní energie a vzájemného propojení v kruhu.',
                date: '2025-09-25',
                time: '14:00',
                duration: 180,
                price: 1200,
                maxParticipants: 15,
                currentParticipants: 8,
                location: 'Centrum energetické rovnováhy - velký sál',
                instructor: 'Anna Nováková & tým',
                image: './assets/images/events/group-workshop.webp',
                category: 'workshop',
                requirements: 'Vhodné pro všechny úrovně, otevřená mysl'
            },
            {
                id: 'meditation-immersion',
                name: 'Hluboká meditace a mindfulness',
                description: 'Intenzivní meditační workshop zaměřený na hlubokou relaxaci, vědomou přítomnost a vnitřní klid. Naučíte se pokročilé techniky mindfulness.',
                date: '2025-10-08',
                time: '10:00',
                duration: 240,
                price: 1500,
                maxParticipants: 12,
                currentParticipants: 4,
                location: 'Centrum energetické rovnováhy - meditační místnost',
                instructor: 'Tereza Svobodová',
                image: './assets/images/events/meditation-workshop.webp',
                category: 'workshop',
                requirements: 'Základní zkušenosti s meditací výhodou'
            }
        ];
        return false;
    }
}

class EventsRegistration {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.selectedEvent = null;
        this.registrationData = {};
        this.isLoading = true;
        
        this.init();
    }
    
    async init() {
        // Načti události z API
        await loadEventsFromAPI();
        this.isLoading = false;
        this.render();
    }
    
    render() {
        if (this.isLoading) {
            this.container.innerHTML = `
                <div class="events-loading text-center py-8">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Načítání...</span>
                    </div>
                    <p class="mt-3 text-gray-600">Načítání událostí...</p>
                </div>
            `;
            return;
        }

        if (AVAILABLE_EVENTS.length === 0) {
            this.container.innerHTML = `
                <div class="events-empty text-center py-5">
                    <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">Aktuálně nemáme naplánované žádné události</h4>
                    <p class="text-muted">Sledujte naši stránku pro aktualizace nadcházejících workshopů a kurzů.</p>
                </div>
            `;
            return;
        }
        
        this.container.innerHTML = `
            <div class="events-registration">
                ${this.renderEventsList()}
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    renderEventsList() {
        const upcomingEvents = AVAILABLE_EVENTS
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date));
            
        if (upcomingEvents.length === 0) {
            return `
                <div class="events-empty text-center py-5">
                    <i class="fas fa-calendar-check fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">Všechny nadcházející události jsou již naplněné</h4>
                    <p class="text-muted">Děkujeme za zájem! Sledujte naši stránku pro nové termíny.</p>
                </div>
            `;
        }
        
        return `
            <div class="events-grid">
                ${upcomingEvents.map(event => this.renderEventCard(event)).join('')}
            </div>
        `;
    }
    
    renderEventCard(event) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('cs-CZ', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const availableSpots = event.maxParticipants - event.currentParticipants;
        const isFull = availableSpots <= 0;
        
        const categoryLabels = {
            'workshop': 'Workshop',
            'course': 'Kurz',
            'event': 'Událost',
            'certification': 'Certifikace'
        };
        
        const categoryColors = {
            'workshop': 'bg-primary',
            'course': 'bg-success',
            'event': 'bg-info',
            'certification': 'bg-warning'
        };
        
        return `
            <div class="event-card ${isFull ? 'event-full' : ''}" data-event-id="${event.id}">
                <div class="event-card-header">
                    <div class="event-image">
                        <img src="${event.image}" alt="${event.name}" class="img-fluid" onerror="this.src='./assets/images/default-event.webp'">
                        <div class="event-category ${categoryColors[event.category] || 'bg-primary'}">
                            ${categoryLabels[event.category] || 'Událost'}
                        </div>
                        ${isFull ? '<div class="event-full-badge">Obsazeno</div>' : ''}
                    </div>
                </div>
                
                <div class="event-card-body">
                    <h4 class="event-title">${event.name}</h4>
                    <p class="event-description">${event.description}</p>
                    
                    <div class="event-details">
                        <div class="event-detail">
                            <i class="fas fa-calendar text-primary"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-clock text-primary"></i>
                            <span>${event.time} (${Math.floor(event.duration / 60)}h)</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-map-marker-alt text-primary"></i>
                            <span>${event.location}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-user-graduate text-primary"></i>
                            <span>${event.instructor}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-users text-primary"></i>
                            <span>${availableSpots} volných míst z ${event.maxParticipants}</span>
                        </div>
                    </div>
                    
                    <div class="event-requirements">
                        <small class="text-muted">
                            <i class="fas fa-info-circle"></i>
                            ${event.requirements}
                        </small>
                    </div>
                </div>
                
                <div class="event-card-footer">
                    <div class="event-price">
                        <span class="price-amount">${event.price.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                    <button class="btn ${isFull ? 'btn-secondary disabled' : 'btn-primary'} register-btn" 
                            data-event-id="${event.id}" 
                            ${isFull ? 'disabled' : ''}>
                        <i class="fas ${isFull ? 'fa-ban' : 'fa-user-plus'} me-2"></i>
                        ${isFull ? 'Obsazeno' : 'Registrovat se'}
                    </button>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Registration button clicks
        document.querySelectorAll('.register-btn:not(.disabled)').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.target.dataset.eventId;
                const event = AVAILABLE_EVENTS.find(ev => ev.id === eventId);
                
                if (event) {
                    this.selectedEvent = event;
                    this.showRegistrationForm(event);
                }
            });
        });
    }
    
    showRegistrationForm(event) {
        const formattedDate = new Date(event.date).toLocaleDateString('cs-CZ', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        this.container.innerHTML = `
            <div class="event-registration-form">
                <div class="registration-header">
                    <a href="#" class="back-link" onclick="eventsSystem.render(); return false;">
                        <i class="fas fa-arrow-left me-2"></i>Zpět na události
                    </a>
                    
                    <div class="event-summary-compact">
                        <h6 class="summary-title">
                            <i class="fas fa-calendar-check"></i>
                            ${event.name}
                        </h6>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-icon">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                                <span class="summary-text">${formattedDate} v ${event.time}</span>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <span class="summary-text">${Math.floor(event.duration / 60)} hodin</span>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">
                                    <i class="fas fa-user-graduate"></i>
                                </div>
                                <span class="summary-text">${event.instructor}</span>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">
                                    <i class="fas fa-tag"></i>
                                </div>
                                <span class="summary-text">${event.price.toLocaleString('cs-CZ')} Kč za osobu</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <form id="eventRegistrationForm" class="registration-form">
                    <div class="row">
                        <div class="col-md-6">
                            <h5 class="mb-3">Kontaktní údaje</h5>
                            
                            <div class="mb-3">
                                <label class="form-label">Jméno a příjmení *</label>
                                <input type="text" class="form-control" name="name" required 
                                       placeholder="Vaše celé jméno">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">E-mail *</label>
                                <input type="email" class="form-control" name="email" required
                                       placeholder="vas.email@priklad.cz">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Telefon *</label>
                                <input type="tel" class="form-control" name="phone" required
                                       placeholder="+420 123 456 789">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Zkušenosti s tématem</label>
                                <textarea class="form-control" name="experience" rows="3"
                                          placeholder="Popište stručně své zkušenosti s daným tématem (nepovinné)"></textarea>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <h5 class="mb-3">Platba</h5>
                            
                            <div class="payment-options">
                                <div class="payment-option mb-3 p-3 border rounded cursor-pointer border-primary bg-light" data-payment="card">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="paymentMethod" value="card" checked>
                                        <label class="form-check-label">
                                            <strong>Platební karta</strong><br>
                                            <small class="text-muted">Okamžitá platba online</small>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="payment-option mb-3 p-3 border rounded cursor-pointer" data-payment="bank-transfer">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="paymentMethod" value="bank-transfer">
                                        <label class="form-check-label">
                                            <strong>Bankovní převod</strong><br>
                                            <small class="text-muted">Platba na účet do 3 dnů</small>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="important-info">
                                <h6 class="info-title">
                                    <i class="fas fa-info-circle"></i>
                                    Důležité informace
                                </h6>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <div class="info-icon">
                                            <i class="fas fa-handshake"></i>
                                        </div>
                                        <span class="info-text">Registrace je závazná po zaplacení</span>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-icon">
                                            <i class="fas fa-calendar-times"></i>
                                        </div>
                                        <span class="info-text">Zrušení možné do 7 dnů před akcí</span>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-icon">
                                            <i class="fas fa-undo"></i>
                                        </div>
                                        <span class="info-text">Při zrušení vrátíme 80% částky</span>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-icon">
                                            <i class="fas fa-box"></i>
                                        </div>
                                        <span class="info-text">V ceně jsou zahrnuty všechny materiály</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" name="gdprConsent" id="gdprEventConsent" required>
                        <label class="form-check-label" for="gdprEventConsent">
                            Souhlasím se zpracováním osobních údajů a obchodními podmínkami *
                        </label>
                    </div>
                    
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary btn-lg px-5">
                            <i class="fas fa-credit-card me-2"></i>
                            Registrovat a zaplatit ${event.price.toLocaleString('cs-CZ')} Kč
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        this.attachRegistrationFormListeners();
    }
    
    attachRegistrationFormListeners() {
        const form = document.getElementById('eventRegistrationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processRegistration(new FormData(form));
            });
        }
        
        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove active state from all options
                document.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('border-primary', 'bg-light');
                });
                
                // Add active state to clicked option
                option.classList.add('border-primary', 'bg-light');
                
                // Check the radio button
                const radio = option.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        });
    }
    
    async processRegistration(formData) {
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Zpracováváme registraci...';
        submitBtn.disabled = true;
        
        try {
            const registrationData = {
                eventId: this.selectedEvent.id,
                participantInfo: {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    experience: formData.get('experience')
                },
                paymentMethod: formData.get('paymentMethod'),
                gdprConsent: formData.get('gdprConsent') === 'on'
            };
            
            const response = await fetch('http://localhost:3004/api/events/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showRegistrationSuccess(result.data);
            } else {
                throw new Error(result.error || 'Chyba při registraci');
            }
            
        } catch (error) {
            console.error('Chyba při registraci:', error);
            alert('Chyba při registraci: ' + error.message);
            
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    showRegistrationSuccess(registrationData) {
        const registrationId = 'EV' + Date.now().toString().slice(-6);
        
        this.container.innerHTML = `
            <div class="registration-success text-center">
                <div class="success-icon mb-4">
                    <i class="fas fa-check-circle fa-5x text-success"></i>
                </div>
                
                <h3 class="text-success mb-3">Registrace úspěšná!</h3>
                <p class="lead mb-4">Děkujeme za registraci. Potvrzení a další informace jsme vám zaslali na e-mail.</p>
                
                <div class="registration-summary bg-light p-4 rounded mb-4">
                    <h5 class="mb-3">Shrnutí registrace</h5>
                    <div class="row text-start">
                        <div class="col-sm-6 mb-2"><strong>ID registrace:</strong> ${registrationId}</div>
                        <div class="col-sm-6 mb-2"><strong>Událost:</strong> ${this.selectedEvent.name}</div>
                        <div class="col-sm-6 mb-2"><strong>Datum:</strong> ${new Date(this.selectedEvent.date).toLocaleDateString('cs-CZ')}</div>
                        <div class="col-sm-6 mb-2"><strong>Čas:</strong> ${this.selectedEvent.time}</div>
                        <div class="col-sm-6 mb-2"><strong>Místo:</strong> ${this.selectedEvent.location}</div>
                        <div class="col-sm-6 mb-2"><strong>Cena:</strong> <span class="text-success">${this.selectedEvent.price.toLocaleString('cs-CZ')} Kč</span></div>
                    </div>
                </div>
                
                <div class="next-steps mb-4">
                    <h6 class="mb-3">Co dál?</h6>
                    <div class="row text-start">
                        <div class="col-md-6 mb-2">
                            <i class="fas fa-envelope text-success me-2"></i>
                            Potvrzení e-mailem do 15 minut
                        </div>
                        <div class="col-md-6 mb-2">
                            <i class="fas fa-file-pdf text-success me-2"></i>
                            Podrobné informace a materiály
                        </div>
                        <div class="col-md-6 mb-2">
                            <i class="fas fa-sms text-success me-2"></i>
                            SMS připomínka den předem
                        </div>
                        <div class="col-md-6 mb-2">
                            <i class="fas fa-phone text-success me-2"></i>
                            Dotazy: +420 123 456 789
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-outline-primary me-2" onclick="window.print()">
                        <i class="fas fa-print"></i> Vytisknout
                    </button>
                    <button class="btn btn-primary" onclick="eventsSystem.render()">
                        <i class="fas fa-calendar"></i> Další události
                    </button>
                </div>
            </div>
        `;
    }
}

// Initialize events system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('events-registration-container')) {
        window.eventsSystem = new EventsRegistration('events-registration-container');
    }
});