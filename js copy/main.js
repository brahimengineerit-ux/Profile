// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after page loads
    const loadingScreen = document.getElementById('loading-screen');
    
    // Minimum display time for loading screen (800ms) for smooth UX
    setTimeout(function() {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after animation completes
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 800);

    // Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Toggle theme on click
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    // Close mobile menu function
    function closeMobileMenu() {
        const menu = document.getElementById('mobile-nav');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (menu) menu.classList.remove('show');
        if (hamburger) hamburger.classList.remove('active');
    }

    // Mobile menu toggle functionality (hamburger menu)
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
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Handle sections
            sections.forEach(section => {
                if (section.id === targetSection) {
                    // Activate target section
                    section.classList.add('active');
                    section.classList.remove('exit-left');
                } else if (section.classList.contains('active')) {
                    // Exit current section
                    section.classList.remove('active');
                    section.classList.add('exit-left');
                }
            });

            // Close mobile menu after navigation
            closeMobileMenu();
        });
    });

    // Language switcher functionality
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            
            // Update button states
            document.querySelectorAll('.lang-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');

            // Get all elements with data-en attribute
            const translatableElements = document.querySelectorAll('[data-en]');
            
            translatableElements.forEach(element => {
                if (lang === 'en') {
                    element.textContent = element.getAttribute('data-en');
                } else if (lang === 'de') {
                    element.textContent = element.getAttribute('data-de');
                }
            });

            // Update HTML content elements
            const htmlElements = document.querySelectorAll('[data-en-html]');
            htmlElements.forEach(element => {
                if (lang === 'en') {
                    element.innerHTML = element.getAttribute('data-en-html');
                } else if (lang === 'de') {
                    element.innerHTML = element.getAttribute('data-de-html');
                }
            });
            
            console.log('Switched to:', lang);
        });
    });

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    
    // Show/hide button based on scroll position in active section
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

    // Scroll to top when button clicked
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
        // Get current active section
        const activeLink = document.querySelector('.nav-link.active');
        const currentSection = activeLink ? activeLink.getAttribute('data-section') : 'home';
        const currentIndex = sectionOrder.indexOf(currentSection);
        
        let newIndex = currentIndex;
        
        // Arrow keys for navigation
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            newIndex = (currentIndex + 1) % sectionOrder.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            newIndex = (currentIndex - 1 + sectionOrder.length) % sectionOrder.length;
        } else if (e.key === 'Escape') {
            // Close mobile menu on Escape
            closeMobileMenu();
            return;
        } else {
            return; // Don't do anything for other keys
        }
        
        // Navigate to new section
        const newSection = sectionOrder[newIndex];
        const newLink = document.querySelector(`.nav-link[data-section="${newSection}"]`);
        if (newLink) {
            newLink.click();
        }
    });
});

// Collapsible functionality (kept outside DOMContentLoaded for onclick handlers)
function toggleCollapse(header) {
    header.classList.toggle('active');
    const content = header.nextElementSibling;
    content.classList.toggle('active');
}

// Project collapsible functionality
function toggleProject(header) {
    header.classList.toggle('active');
    const content = header.nextElementSibling;
    content.classList.toggle('active');
}
