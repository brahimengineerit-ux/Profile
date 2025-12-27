// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after page loads
    const loadingScreen = document.getElementById('loading-screen');
    
    setTimeout(function() {
        loadingScreen.classList.add('hidden');
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);

    // Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    function closeMobileMenu() {
        const menu = document.getElementById('mobile-nav');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (menu) menu.classList.remove('show');
        if (hamburger) hamburger.classList.remove('active');
    }

    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger-menu');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            const menu = document.getElementById('mobile-nav');
            
            if (menu) menu.classList.toggle('show');
            this.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                    section.classList.remove('exit-left');
                } else if (section.classList.contains('active')) {
                    section.classList.remove('active');
                    section.classList.add('exit-left');
                }
            });

            closeMobileMenu();
        });
    });

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            
            document.querySelectorAll('.lang-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');

            // Set data-lang attribute on html element for CSS-based switching
            document.documentElement.setAttribute('data-lang', lang);

            const translatableElements = document.querySelectorAll('[data-en]');
            
            translatableElements.forEach(element => {
                if (lang === 'en') {
                    element.textContent = element.getAttribute('data-en');
                } else if (lang === 'de') {
                    element.textContent = element.getAttribute('data-de');
                }
            });

            const htmlElements = document.querySelectorAll('[data-en-html]');
            htmlElements.forEach(element => {
                if (lang === 'en') {
                    element.innerHTML = element.getAttribute('data-en-html');
                } else if (lang === 'de') {
                    element.innerHTML = element.getAttribute('data-de-html');
                }
            });
            
            // Save language preference
            localStorage.setItem('lang', lang);
            
            console.log('Switched to:', lang);
        });
    });

    // Load saved language preference
    const savedLang = localStorage.getItem('lang') || 'en';
    document.documentElement.setAttribute('data-lang', savedLang);
    const langBtn = document.querySelector(`.lang-btn[data-lang="${savedLang}"]`);
    if (langBtn && savedLang !== 'en') {
        langBtn.click();
    }

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.addEventListener('scroll', function() {
            if (this.classList.contains('active')) {
                if (this.scrollTop > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            }
        });
    });

    backToTopBtn.addEventListener('click', function() {
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            activeSection.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // Keyboard Navigation
    const sectionOrder = ['home', 'education', 'experience', 'projects', 'contact'];
    
    document.addEventListener('keydown', function(e) {
        const activeLink = document.querySelector('.nav-link.active');
        const currentSection = activeLink ? activeLink.getAttribute('data-section') : 'home';
        const currentIndex = sectionOrder.indexOf(currentSection);
        
        let newIndex = currentIndex;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            newIndex = (currentIndex + 1) % sectionOrder.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            newIndex = (currentIndex - 1 + sectionOrder.length) % sectionOrder.length;
        } else if (e.key === 'Escape') {
            closeMobileMenu();
            return;
        } else {
            return;
        }
        
        const newSection = sectionOrder[newIndex];
        const newLink = document.querySelector(`.nav-link[data-section="${newSection}"]`);
        if (newLink) {
            newLink.click();
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Animate language bars on Home section load
    function animateLanguageBars() {
        const languageFills = document.querySelectorAll('.language-fill');
        languageFills.forEach(fill => {
            const width = fill.style.width;
            fill.style.width = '0';
            setTimeout(() => {
                fill.style.width = width;
            }, 300);
        });
    }

    // Call on initial load
    setTimeout(animateLanguageBars, 1200);

    // Smooth hover effect for cards
    document.querySelectorAll('.bento-card, .project-card, .exp-card, .edu-card, .interest-card').forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function(e) {
            this.style.transform = '';
        });
    });
});

// Collapsible functionality (if needed)
function toggleCollapse(header) {
    header.classList.toggle('active');
    const content = header.nextElementSibling;
    content.classList.toggle('active');
}
