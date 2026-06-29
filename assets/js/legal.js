'use strict';

(function () {
    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const initLegalNav = () => {
        const nav = qs('[data-legal-nav]');
        if (!nav) return;

        const links = qsa('a[href^="#"]', nav);
        const sections = links
            .map((link) => qs(link.getAttribute('href')))
            .filter(Boolean);

        if (!links.length || !sections.length) return;

        links.forEach((link) => {
            link.addEventListener('click', (event) => {
                const target = qs(link.getAttribute('href'));
                if (!target) return;

                event.preventDefault();

                const offset = window.innerWidth > 1024 ? 110 : 86;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top,
                    behavior: 'smooth'
                });
            });
        });

        const setActive = () => {
            let activeId = sections[0].id;

            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();

                if (rect.top <= 170) {
                    activeId = section.id;
                }
            });

            links.forEach((link) => {
                const isActive = link.getAttribute('href') === `#${activeId}`;

                link.classList.toggle('is-active', isActive);

                if (isActive) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        setActive();
        window.addEventListener('scroll', setActive, { passive: true });
        window.addEventListener('resize', setActive);
    };

    const initLegalDates = () => {
        const currentYear = new Date().getFullYear();

        qsa('[data-current-year]').forEach((node) => {
            node.textContent = String(currentYear);
        });

        qsa('[data-last-updated]').forEach((node) => {
            const customDate = node.getAttribute('data-last-updated');

            node.textContent = customDate && customDate !== 'true'
                ? customDate
                : 'June 2026';
        });
    };

    const initLegalPrint = () => {
        qsa('[data-print-page]').forEach((button) => {
            button.addEventListener('click', () => {
                window.print();
            });
        });
    };

    const initLegalExternalLinks = () => {
        qsa('.legal-content a[href^="http"]').forEach((link) => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    };

    const initLegalCardTilt = () => {
        const cards = qsa('.legal-card');

        cards.forEach((card) => {
            card.addEventListener('mousemove', (event) => {
                if (window.innerWidth < 1025) return;

                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const rotateX = ((y / rect.height) - 0.5) * -1.4;
                const rotateY = ((x / rect.width) - 0.5) * 1.4;

                card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    };

    const initLegalSchema = () => {
        const schemaTarget = qs('[data-legal-schema]');
        if (!schemaTarget || !window.Voltique) return;

        const config = window.Voltique.config || {};
        const company = config.company || {};
        const contact = config.contact || {};

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: document.title,
            url: window.location.href,
            about: {
                '@type': 'Organization',
                name: company.name || config.brand?.name || 'Voltique',
                email: contact.email || '',
                address: company.address || ''
            },
            isPartOf: {
                '@type': 'WebSite',
                name: config.brand?.name || 'Voltique',
                url: window.location.origin
            }
        };

        schemaTarget.type = 'application/ld+json';
        schemaTarget.textContent = JSON.stringify(schema, null, 2);
    };

    const boot = () => {
        initLegalNav();
        initLegalDates();
        initLegalPrint();
        initLegalExternalLinks();
        initLegalCardTilt();
        initLegalSchema();

        if (window.Voltique) {
            window.Voltique.refreshIcons();
            window.Voltique.refreshAos();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();