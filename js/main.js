/* ========================================================
   Brahim Ait-Mlouk · Portfolio v4.3
   Vanilla JS — routing, theme, lang, motion, project search.
======================================================== */

(function () {
    'use strict';

    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -----------------------------------------------------
       1. Theme
    ----------------------------------------------------- */
    const root = document.documentElement;
    const themeBtn = $('#theme-toggle');
    const initTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') {
            root.setAttribute('data-theme', saved);
        }
    };

    const applyTheme = () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    const toggleTheme = () => {
        if (document.startViewTransition && !reduceMotion) {
            document.startViewTransition(applyTheme);
        } else {
            applyTheme();
        }
    };

    initTheme();
    themeBtn?.addEventListener('click', toggleTheme);

    /* -----------------------------------------------------
       2. Language
    ----------------------------------------------------- */
    const setLang = (lang) => {
        root.setAttribute('data-lang', lang);
        localStorage.setItem('lang', lang);

        $$('[data-en]').forEach(el => {
            const val = el.getAttribute('data-' + lang);
            if (val !== null) el.textContent = val;
        });

        $$('[data-en-html]').forEach(el => {
            const val = el.getAttribute('data-' + lang + '-html');
            if (val !== null) el.innerHTML = val;
        });

        $$('.lang-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });
    };

    // Translate the search input placeholder
    const updateSearchPlaceholder = (lang) => {
        const input = $('#project-search');
        if (!input) return;
        const ph = input.getAttribute('data-' + lang + '-placeholder');
        if (ph) input.setAttribute('placeholder', ph);
    };

    $$('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLang(btn.dataset.lang);
            updateSearchPlaceholder(btn.dataset.lang);
            // Re-index search rows since their text content just changed
            rowIndex = indexRows();
            applySearch();
        });
    });

    const initialLang = localStorage.getItem('lang') || 'en';
    setLang(initialLang);
    updateSearchPlaceholder(initialLang);

    /* -----------------------------------------------------
       3. Section routing
    ----------------------------------------------------- */
    const navLinks = $$('.nav-link, .brand[data-section]');
    const sections = $$('.section');
    const order = ['home', 'services', 'experience', 'projects', 'education', 'contact'];

    const goTo = (id) => {
        sections.forEach(s => s.classList.toggle('active', s.id === id));
        $$('.nav-link').forEach(l => {
            l.classList.toggle('active', l.dataset.section === id);
        });
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
        closeSidebar();
        history.replaceState(null, '', '#' + id);

        armReveals();
        if (id === 'experience') animateCounters();
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.section;
            if (target) goTo(target);
        });
    });

    const initialHash = window.location.hash.replace('#', '');
    if (order.includes(initialHash)) goTo(initialHash);

    /* -----------------------------------------------------
       4. Mobile sidebar
    ----------------------------------------------------- */
    const sidebar = $('#sidebar');
    const menuBtn = $('#menu-toggle');
    let backdrop = null;

    const ensureBackdrop = () => {
        if (backdrop) return backdrop;
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        backdrop.addEventListener('click', closeSidebar);
        document.body.appendChild(backdrop);
        return backdrop;
    };

    const openSidebar = () => {
        sidebar?.classList.add('open');
        ensureBackdrop().classList.add('visible');
    };

    function closeSidebar() {
        sidebar?.classList.remove('open');
        backdrop?.classList.remove('visible');
    }

    menuBtn?.addEventListener('click', () => {
        sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    // Defensive fallback: delegated click on document, in case the button
    // is ever re-rendered or covered by another element.
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('#menu-toggle, .topbar-menu');
        if (!trigger) return;
        e.preventDefault();
        sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    /* -----------------------------------------------------
       5. Project search (filters editorial list)
    ----------------------------------------------------- */
    const searchInput = $('#project-search');
    const plistBody   = $('#plist-body');
    const plistEmpty  = $('#plist-empty');

    // Pre-index searchable text on each row so we don't reflow on every keystroke
    const indexRows = () => {
        if (!plistBody) return [];
        return $$('.prow', plistBody).map(row => {
            const title = $('.prow-title', row)?.textContent || '';
            const desc  = $('.prow-desc',  row)?.textContent || '';
            const stack = $('.prow-stack', row)?.textContent || '';
            return {
                el: row,
                haystack: (title + ' ' + desc + ' ' + stack).toLowerCase()
            };
        });
    };

    let rowIndex = indexRows();

    const applySearch = () => {
        if (!searchInput || !plistBody) return;
        const q = searchInput.value.trim().toLowerCase();
        let visible = 0;

        rowIndex.forEach(({ el, haystack }) => {
            const match = !q || haystack.includes(q);
            el.classList.toggle('hidden', !match);
            if (match) visible++;
        });

        if (plistEmpty) plistEmpty.hidden = visible !== 0;
    };

    searchInput?.addEventListener('input', applySearch);

    /* -----------------------------------------------------
       6. Back to top
    ----------------------------------------------------- */
    const toTop = $('#to-top');

    const handleScroll = () => {
        toTop?.classList.toggle('visible', window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    toTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* -----------------------------------------------------
       7. Keyboard navigation
    ----------------------------------------------------- */
    document.addEventListener('keydown', (e) => {
        const tag = (e.target.tagName || '').toLowerCase();
        const inField = ['input', 'textarea', 'select'].includes(tag);

        if (e.key === 'Escape') {
            // Esc clears search if focused, otherwise closes sidebar
            if (document.activeElement === searchInput && searchInput.value) {
                searchInput.value = '';
                applySearch();
                return;
            }
            closeSidebar();
            return;
        }

        // "/" focuses search when projects section is active
        if (e.key === '/' && !inField) {
            const projectsActive = $('#projects')?.classList.contains('active');
            if (projectsActive && searchInput) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
                return;
            }
        }

        if (inField) return;

        const current = $('.section.active')?.id;
        if (!current) return;
        const idx = order.indexOf(current);
        if (idx === -1) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'j') {
            e.preventDefault();
            goTo(order[(idx + 1) % order.length]);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'k') {
            e.preventDefault();
            goTo(order[(idx - 1 + order.length) % order.length]);
        }
    });

    /* -----------------------------------------------------
       8. Live time + presence
    ----------------------------------------------------- */
    const timeEl = $('#status-time');

    const tickClock = () => {
        if (!timeEl) return;
        let value = '';
        try {
            value = new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Africa/Casablanca'
            });
        } catch (e) { /* timezone unsupported */ }

        if (!value) {
            // Fallback: use the visitor's local time, which is fine
            const d = new Date();
            value =
                String(d.getHours()).padStart(2, '0') + ':' +
                String(d.getMinutes()).padStart(2, '0');
        }
        timeEl.textContent = value;
    };

    tickClock();
    setInterval(tickClock, 30 * 1000);

    /* -----------------------------------------------------
       9. Cursor halo
    ----------------------------------------------------- */
    const halo = $('#bg-halo');
    if (halo && !reduceMotion && window.matchMedia('(min-width: 901px)').matches) {
        let raf = null;
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;

        const moveHalo = () => {
            halo.style.left = targetX + 'px';
            halo.style.top  = targetY + 'px';
            raf = null;
        };

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!halo.classList.contains('visible')) halo.classList.add('visible');
            if (!raf) raf = requestAnimationFrame(moveHalo);
        }, { passive: true });

        document.addEventListener('mouseleave', () => halo.classList.remove('visible'));

        setTimeout(() => halo.classList.add('visible'), 800);
    }

    /* -----------------------------------------------------
      10. Scroll reveal
    ----------------------------------------------------- */
    let revealObserver = null;

    const armReveals = () => {
        const active = $('.section.active');
        if (!active) return;

        const targets = $$('.role, .service, .stat, .kv, .prow, .featured, .card, .process-step, .skill-group, .lang-list li, .contact-list li', active);
        targets.forEach(el => {
            if (!el.classList.contains('reveal')) el.classList.add('reveal');
            el.classList.remove('in');
        });

        if (reduceMotion) {
            targets.forEach(el => el.classList.add('in'));
            return;
        }

        revealObserver?.disconnect();
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(el => revealObserver.observe(el));
    };

    armReveals();

    /* -----------------------------------------------------
      11. Counter animation
    ----------------------------------------------------- */
    let countersDone = false;

    const animateCounters = () => {
        if (reduceMotion) return;

        $$('.stat-num').forEach(el => {
            const original = el.dataset.original || el.textContent.trim();
            el.dataset.original = original;

            const match = original.match(/^(\d+)(.*)$/);
            if (!match) return;
            const target = parseInt(match[1], 10);
            const suffix = match[2] || '';

            const duration = 900;
            const start = performance.now();

            const step = (now) => {
                const t = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (t < 1) requestAnimationFrame(step);
                else el.textContent = original;
            };

            requestAnimationFrame(step);
        });
    };

    const expSection = $('#experience');
    if (expSection && 'IntersectionObserver' in window) {
        const expObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && expSection.classList.contains('active') && !countersDone) {
                    countersDone = true;
                    animateCounters();
                }
            });
        }, { threshold: 0.2 });
        expObs.observe(expSection);
    }

    /* -----------------------------------------------------
      12. Keyboard hint
    ----------------------------------------------------- */
    const hint = $('#kbd-hint');
    if (hint && !sessionStorage.getItem('kbdHintShown') && window.matchMedia('(min-width: 901px)').matches) {
        setTimeout(() => {
            hint.classList.add('show');
            sessionStorage.setItem('kbdHintShown', '1');
            setTimeout(() => hint.classList.remove('show'), 4500);
        }, 2000);
    }

})();
