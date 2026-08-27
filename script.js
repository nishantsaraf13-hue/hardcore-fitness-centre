document.addEventListener('DOMContentLoaded', () => {
    // --- Sticky Header ---
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navbar.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbar.classList.contains('active')) {
                navbar.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // --- Scroll Animations ---
    const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100; // threshold

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on initial load

    // --- Active Nav Link Update ---
    const sections = document.querySelectorAll('section');
    
    const updateActiveNav = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav);

    // --- Form Handling (Frontend Only) ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic validation is handled by HTML 'required' attributes
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = 'SENDING...';
            btn.disabled = true;

            // Simulate network request
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                
                contactForm.reset();
                formStatus.textContent = 'Thank you for your enquiry. We will get back to you shortly.';
                formStatus.style.color = '#4caf50'; // Success green
                
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            }, 1500);
        });
    }
});
