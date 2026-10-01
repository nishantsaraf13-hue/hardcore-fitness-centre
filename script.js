/**
 * HARDCORE FITNESS CENTRE - MODERN SCRIPT ENGINE
 * Animations, 3D Card Tilt, Stats Counters, Lightbox, Calculator & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================
    // 1. SCROLL PROGRESS BAR & BACK TO TOP WITH SVG RING
    // ==========================================================
    const scrollProgressBar = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');
    const progressCircle = document.querySelector('.progress-ring__circle');
    const circumference = progressCircle ? 2 * Math.PI * 20 : 125.6; // r = 20

    if (progressCircle) {
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = `${circumference}`;
    }

    const updateScrollMetrics = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // Top horizontal progress bar
        if (scrollProgressBar) {
            scrollProgressBar.style.width = `${scrollPercent}%`;
        }

        // SVG Circular Ring Progress
        if (progressCircle) {
            const offset = circumference - (scrollPercent / 100) * circumference;
            progressCircle.style.strokeDashoffset = `${offset}`;
        }

        // Back to Top button visibility
        if (backToTopBtn) {
            if (scrollTop > 350) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    updateScrollMetrics();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================================
    // 2. STICKY HEADER & MOBILE NAV DRAWER
    // ==========================================================
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    if (mobileToggle && navbar) {
        mobileToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navbar.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }

    // Auto-close menu on link click & smooth active highlighting
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbar && navbar.classList.contains('active')) {
                navbar.classList.remove('active');
                if (mobileToggle) {
                    mobileToggle.querySelector('i').className = 'fas fa-bars';
                }
            }
        });
    });

    const sections = document.querySelectorAll('section[id]');
    const handleActiveNav = () => {
        const scrollPosition = window.scrollY + 220;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', handleActiveNav, { passive: true });

    // ==========================================================
    // 2.5 INTERACTIVE HERO MOVING PARTICLE CANVAS
    // ==========================================================
    const heroCanvas = document.getElementById('heroCanvas');
    const heroSection = document.getElementById('home');

    if (heroCanvas && heroSection) {
        const ctx = heroCanvas.getContext('2d');
        let width = 0;
        let height = 0;
        let particles = [];
        let heroMouseX = -1000;
        let heroMouseY = -1000;
        let animationFrameId = null;
        let isHeroVisible = true;

        const resizeCanvas = () => {
            const rect = heroSection.getBoundingClientRect();
            width = heroCanvas.width = rect.width;
            height = heroCanvas.height = rect.height;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas, { passive: true });

        // Mouse tracking on hero
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            heroMouseX = e.clientX - rect.left;
            heroMouseY = e.clientY - rect.top;
        }, { passive: true });

        heroSection.addEventListener('mouseleave', () => {
            heroMouseX = -1000;
            heroMouseY = -1000;
        }, { passive: true });

        const particleCount = window.innerWidth < 768 ? 26 : 52;

        class Particle {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * (width || 1000);
                this.y = initial ? Math.random() * (height || 800) : (height || 800) + 10;
                this.radius = 1.2 + Math.random() * 2.2;
                this.baseVy = 0.35 + Math.random() * 0.75;
                this.vx = (Math.random() - 0.5) * 0.45;
                this.alpha = 0.2 + Math.random() * 0.7;
                this.flickerSpeed = 0.015 + Math.random() * 0.02;
                this.flickerVal = Math.random() * Math.PI;
                this.phase = Math.random() * Math.PI * 2;
                this.phaseSpeed = 0.02 + Math.random() * 0.02;
            }

            update() {
                this.y -= this.baseVy;
                this.phase += this.phaseSpeed;
                this.x += Math.sin(this.phase) * 0.5 + this.vx;

                this.flickerVal += this.flickerSpeed;
                const currentAlpha = Math.max(0.1, this.alpha + Math.sin(this.flickerVal) * 0.25);

                // Mouse interaction: gentle waft away from cursor
                const dx = this.x - heroMouseX;
                const dy = this.y - heroMouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120 && dist > 0) {
                    const force = (120 - dist) / 120;
                    this.x += (dx / dist) * force * 2.5;
                    this.y += (dy / dist) * force * 2.5;
                }

                if (this.y < -15 || this.x < -20 || this.x > width + 20) {
                    this.reset(false);
                }

                return currentAlpha;
            }

            draw(accentColor, alpha) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = accentColor;
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = this.radius * 4;
                ctx.shadowColor = accentColor;
                ctx.fill();
            }
        }

        particles = Array.from({ length: particleCount }, () => new Particle());

        const renderParticles = () => {
            if (!isHeroVisible) return;

            ctx.clearRect(0, 0, width, height);

            const activeColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--accent-light')
                .trim() || '#fbbf24';

            // Connect nearby embers with delicate filaments
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 80) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = activeColor;
                        ctx.globalAlpha = (1 - dist / 80) * 0.16;
                        ctx.lineWidth = 0.8;
                        ctx.shadowBlur = 0;
                        ctx.stroke();
                    }
                }
            }

            // Draw individual particles
            for (let i = 0; i < particles.length; i++) {
                const alpha = particles[i].update();
                particles[i].draw(activeColor, alpha);
            }

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(renderParticles);
        };

        // Pause animation when hero is offscreen for performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isHeroVisible = entry.isIntersecting;
                if (isHeroVisible) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = requestAnimationFrame(renderParticles);
                }
            });
        }, { threshold: 0.05 });

        observer.observe(heroSection);
        animationFrameId = requestAnimationFrame(renderParticles);
    }

    // ==========================================================
    // 3. CURSOR SPOTLIGHT TRACKING (DESKTOP)
    // ==========================================================
    const cursorSpotlight = document.getElementById('cursorSpotlight');
    if (cursorSpotlight && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = -1000;
        let mouseY = -1000;
        let currentX = -1000;
        let currentY = -1000;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        const animateSpotlight = () => {
            // Smooth lerp
            currentX += (mouseX - currentX) * 0.12;
            currentY += (mouseY - currentY) * 0.12;
            cursorSpotlight.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateSpotlight);
        };
        requestAnimationFrame(animateSpotlight);
    }

    // ==========================================================
    // 4. 3D TILT EFFECT ON CARDS
    // ==========================================================
    const tiltElements = document.querySelectorAll('.tilt-element');
    if (window.matchMedia('(pointer: fine)').matches) {
        tiltElements.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
                const rotateY = ((x - centerX) / centerX) * 6;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ==========================================================
    // 5. ANIMATED STAT COUNTERS (INTERSECTION OBSERVER)
    // ==========================================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const animateCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const decimals = parseInt(stat.getAttribute('data-decimals') || '0', 10);
            const suffix = stat.getAttribute('data-suffix') || '';
            const duration = 2000; // ms
            const startTime = performance.now();

            const updateNumber = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out expo
                const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const currentVal = target * easeOut;

                stat.textContent = `${currentVal.toFixed(decimals)}${suffix}`;

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.textContent = `${target.toFixed(decimals)}${suffix}`;
                }
            };

            requestAnimationFrame(updateNumber);
        });
    };

    const statsBar = document.querySelector('.hero-stats-bar');
    if (statsBar) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersStarted) {
                    countersStarted = true;
                    animateCounters();
                }
            });
        }, { threshold: 0.3 });

        statsObserver.observe(statsBar);
    }

    // ==========================================================
    // 6. SCROLL REVEAL (INTERSECTION OBSERVER)
    // ==========================================================
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================================
    // 7. INTERACTIVE FITNESS CALCULATOR
    // ==========================================================
    const calcBtn = document.getElementById('calcBtn');
    const calcResults = document.getElementById('calcResults');

    if (calcBtn && calcResults) {
        calcBtn.addEventListener('click', () => {
            const weight = parseFloat(document.getElementById('calcWeight').value);
            const height = parseFloat(document.getElementById('calcHeight').value);
            const age = parseFloat(document.getElementById('calcAge').value);
            const goal = document.getElementById('calcGoal').value;

            if (!weight || !height || !age || weight <= 0 || height <= 0 || age <= 0) {
                alert('Please enter valid numeric values for Weight, Height, and Age.');
                return;
            }

            // BMI calculation: weight (kg) / (height (m))^2
            const heightM = height / 100;
            const bmi = weight / (heightM * heightM);

            let bmiCategory = 'Normal Weight';
            let categoryColor = '#ffffff';
            if (bmi < 18.5) {
                bmiCategory = 'Underweight';
                categoryColor = '#facc15';
            } else if (bmi >= 25 && bmi < 29.9) {
                bmiCategory = 'Overweight';
                categoryColor = '#fb923c';
            } else if (bmi >= 30) {
                bmiCategory = 'High BMI';
                categoryColor = '#f87171';
            }

            // Basal Metabolic Rate (Mifflin-St Jeor average approximation)
            // BMR approx = 10*weight + 6.25*height - 5*age + 5 (male baseline standard for gym)
            const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            // Activity factor ~ 1.55 (Moderate-high gym training)
            let maintenance = bmr * 1.55;

            let planName = 'Hypertrophy Track';
            if (goal === 'muscle') {
                maintenance += 350; // Surplus for bulk
                planName = 'Muscle Mass & Hypertrophy';
            } else if (goal === 'fatloss') {
                maintenance -= 450; // Deficit for cut
                planName = 'Conditioning & Shred';
            } else if (goal === 'strength') {
                maintenance += 200;
                planName = 'Heavy Powerlifting';
            } else {
                planName = 'Athletic Conditioning';
            }

            // Update UI
            document.getElementById('resBMI').textContent = bmi.toFixed(1);
            const bmiStatusEl = document.getElementById('resBMIStatus');
            bmiStatusEl.textContent = bmiCategory;
            bmiStatusEl.style.color = categoryColor;

            document.getElementById('resCalories').textContent = Math.round(maintenance).toLocaleString();
            document.getElementById('resPlan').textContent = planName;

            calcResults.classList.remove('d-none');
            calcResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // ==========================================================
    // 8. GALLERY FILTER PILLS & LIGHTBOX VIEWER
    // ==========================================================
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxBackdrop = document.getElementById('lightboxBackdrop');

    // Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeIn 0.4s ease';
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // Lightbox Open
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const src = item.getAttribute('data-src');
            const caption = item.getAttribute('data-caption') || item.querySelector('img').getAttribute('alt');

            if (lightboxImg && lightboxCaption && lightboxModal) {
                lightboxImg.src = src;
                lightboxCaption.textContent = caption;
                lightboxModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // prevent scroll behind
            }
        });
    });

    // Lightbox Close
    const closeLightbox = () => {
        if (lightboxModal) {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    // ==========================================================
    // 9. FAQ ACCORDION
    // ==========================================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close other open accordions
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) otherAnswer.style.maxHeight = null;
                }
            });

            // Toggle current
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('active');
                answer.style.maxHeight = `${answer.scrollHeight + 30}px`;
            }
        });
    });

    // ==========================================================
    // 10. CONTACT FORM HANDLING
    // ==========================================================
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>PROCESSING...</span>';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>MESSAGE SENT!</span>';
                submitBtn.style.background = '#ffffff';
                submitBtn.style.color = '#000000';

                contactForm.reset();
                formStatus.textContent = 'Awesome! Your enquiry has been received. Our floor manager will reach out shortly.';
                formStatus.style.color = '#ffffff';

                setTimeout(() => {
                    submitBtn.innerHTML = originalContent;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                    formStatus.textContent = '';
                }, 4500);
            }, 1200);
        });
    }

    // ==========================================================
    // 11. DYNAMIC THEME SWITCHER DOCK
    // ==========================================================
    const themeSwitcherDock = document.getElementById('themeSwitcherDock');
    const themeSwitcherToggle = document.getElementById('themeSwitcherToggle');
    const themeOptBtns = document.querySelectorAll('.theme-opt-btn');

    const applyTheme = (themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
        try {
            localStorage.setItem('hfc_theme', themeName);
        } catch (e) {
            // Ignore if localStorage unavailable
        }

        themeOptBtns.forEach(btn => {
            if (btn.getAttribute('data-theme') === themeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    // Load saved preference or default to Designer's Pick 'gold'
    let currentTheme = 'gold';
    try {
        currentTheme = localStorage.getItem('hfc_theme') || 'gold';
    } catch (e) {
        currentTheme = 'gold';
    }
    applyTheme(currentTheme);

    if (themeSwitcherToggle && themeSwitcherDock) {
        themeSwitcherToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            themeSwitcherDock.classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeSwitcherDock.contains(e.target)) {
                themeSwitcherDock.classList.remove('open');
            }
        });

        // Close on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && themeSwitcherDock.classList.contains('open')) {
                themeSwitcherDock.classList.remove('open');
            }
        });

        themeOptBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedTheme = btn.getAttribute('data-theme');
                applyTheme(selectedTheme);
                themeSwitcherDock.classList.remove('open');
            });
        });
    }
});
