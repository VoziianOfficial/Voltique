'use strict';

(function () {
    const config = window.SiteConfig || {};

    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const getValue = (path, fallback = '') => {
        return path.split('.').reduce((acc, key) => {
            if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
                return acc[key];
            }

            return undefined;
        }, config) ?? fallback;
    };

    const escapeHtml = (value) => {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    };

    const normalizePhone = (phone) => {
        return String(phone || '').replace(/[^\d+]/g, '');
    };

    const createIcon = (name) => {
        return `<i data-lucide="${escapeHtml(name)}" aria-hidden="true"></i>`;
    };

    const getCurrentPage = () => {
        const path = window.location.pathname.split('/').pop();
        return path || 'index.html';
    };

    const getServiceById = (id) => {
        return (config.services || []).find((service) => service.id === id);
    };

    const getServiceByFile = (file) => {
        return (config.services || []).find((service) => service.file === file);
    };

    const setDocumentData = () => {
        qsa('[data-config]').forEach((node) => {
            const key = node.getAttribute('data-config');
            const value = getValue(key);

            if (value === undefined || value === null) return;

            node.textContent = value;
        });

        qsa('[data-config-html]').forEach((node) => {
            const key = node.getAttribute('data-config-html');
            const value = getValue(key);

            if (value === undefined || value === null) return;

            node.innerHTML = escapeHtml(value);
        });

        qsa('[data-config-href]').forEach((node) => {
            const key = node.getAttribute('data-config-href');
            const value = getValue(key);

            if (value) {
                node.setAttribute('href', value);
            }
        });

        qsa('[data-phone-link]').forEach((node) => {
            const phoneRaw = normalizePhone(getValue('contact.phoneRaw'));

            if (phoneRaw) {
                node.setAttribute('href', `tel:${phoneRaw}`);
            }
        });

        qsa('[data-email-link]').forEach((node) => {
            const email = getValue('contact.email');

            if (email) {
                node.setAttribute('href', `mailto:${email}`);
            }
        });

        qsa('[data-address-link]').forEach((node) => {
            const address = getValue('company.address');

            if (address) {
                node.setAttribute(
                    'href',
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                );
            }
        });

        qsa('input[name="sourcePage"]').forEach((input) => {
            input.value = window.location.href;
        });
    };

    const buildPreHeader = () => {
        const mount = qs('[data-pre-header]');
        if (!mount) return;

        mount.className = 'pre-header';
        mount.innerHTML = `
            <div class="container-wide">
                <div class="pre-header__inner">
                    <div class="pre-header__note">
                        Independent electrical provider matching — availability may vary by location.
                    </div>

                    <div class="pre-header__links">
                        <a href="tel:${escapeHtml(normalizePhone(getValue('contact.phoneRaw')))}">
                            ${createIcon('phone')}
                            <span>${escapeHtml(getValue('contact.phoneDisplay'))}</span>
                        </a>

                        <a href="mailto:${escapeHtml(getValue('contact.email'))}">
                            ${createIcon('mail')}
                            <span>${escapeHtml(getValue('contact.email'))}</span>
                        </a>

                        <span>
                            ${createIcon('map-pin')}
                            <span>${escapeHtml(getValue('company.serviceArea'))}</span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    };

    const buildHeader = () => {
        const mount = qs('[data-site-header]');
        if (!mount) return;

        const currentPage = getCurrentPage();
        const navigation = config.navigation || [];
        const services = config.services || [];

        const navMarkup = navigation.map((item) => {
            const isCurrent = currentPage === item.url;
            const isServices = item.url === getValue('links.services');

            if (isServices) {
                return `
                    <li class="main-nav__item main-nav__item--services">
                        <a class="main-nav__link" href="${escapeHtml(item.url)}" ${isCurrent ? 'aria-current="page"' : ''}>
                            ${escapeHtml(item.label)}
                            ${createIcon('chevron-down')}
                        </a>

                        <div class="services-dropdown" aria-label="Electrical service categories">
                            <div class="services-dropdown__grid">
                                ${services.map((service) => `
                                    <a class="services-dropdown__link" href="${escapeHtml(service.file)}">
                                        <span>${escapeHtml(service.shortTitle || service.title)}</span>
                                        ${createIcon(service.icon || 'zap')}
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    </li>
                `;
            }

            return `
                <li class="main-nav__item">
                    <a class="main-nav__link" href="${escapeHtml(item.url)}" ${isCurrent ? 'aria-current="page"' : ''}>
                        ${escapeHtml(item.label)}
                    </a>
                </li>
            `;
        }).join('');

        mount.className = 'site-header';
        mount.innerHTML = `
            <div class="container-wide">
                <div class="site-header__inner">
                    <a class="brand-link" href="${escapeHtml(getValue('links.home'))}" aria-label="${escapeHtml(getValue('brand.name'))} home">
                        <span class="brand-lockup">
                            <img class="brand-lockup__icon" src="${escapeHtml(getValue('brand.logo'))}" alt="${escapeHtml(getValue('brand.logoAlt'))}" width="62" height="54">
                            <span class="brand-lockup__text logo-text">${escapeHtml(getValue('brand.name'))}</span>
                        </span>
                    </a>

                    <nav class="main-nav" aria-label="Main navigation">
                        <ul class="main-nav__list">
                            ${navMarkup}
                        </ul>
                    </nav>

                    <div class="header-actions">
                        <a class="icon-btn icon-btn--phone" href="tel:${escapeHtml(normalizePhone(getValue('contact.phoneRaw')))}" aria-label="Call ${escapeHtml(getValue('brand.name'))}">
                            ${createIcon('phone')}
                        </a>

                        <a class="icon-btn icon-btn--dark icon-btn--mail" href="mailto:${escapeHtml(getValue('contact.email'))}" aria-label="Email ${escapeHtml(getValue('brand.name'))}">
                            ${createIcon('mail')}
                        </a>

                        <button class="burger-btn" type="button" aria-label="Open mobile menu" aria-controls="mobile-menu" aria-expanded="false" data-menu-open>
                            <span class="burger-btn__lines" aria-hidden="true">
                                <span class="burger-btn__line"></span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    const buildMobileMenu = () => {
        const mount = qs('[data-mobile-menu]');
        if (!mount) return;

        const navigation = config.navigation || [];
        const services = config.services || [];

        mount.className = 'mobile-menu';
        mount.id = 'mobile-menu';
        mount.setAttribute('aria-hidden', 'true');

        mount.innerHTML = `
            <div class="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
                <div class="mobile-menu__top">
                    <a class="mobile-menu__brand" href="${escapeHtml(getValue('links.home'))}" aria-label="${escapeHtml(getValue('brand.name'))} home">
                        <img src="${escapeHtml(getValue('brand.logo'))}" alt="${escapeHtml(getValue('brand.logoAlt'))}" width="70" height="62">
                        <span>
                            <strong class="logo-text">${escapeHtml(getValue('brand.name'))}</strong>
                            <p>${escapeHtml(getValue('brand.tagline'))}</p>
                        </span>
                    </a>

                    <button class="mobile-menu__close" type="button" aria-label="Close mobile menu" data-menu-close>
                        ${createIcon('x')}
                    </button>
                </div>

                <nav aria-label="Mobile main navigation">
                    <ul class="mobile-menu__nav">
                        ${navigation.map((item) => `
                            <li>
                                <a href="${escapeHtml(item.url)}">
                                    <span>${escapeHtml(item.label)}</span>
                                    ${createIcon('arrow-up-right')}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </nav>

                <div>
                    <p class="mobile-menu__section-title">Electrical request categories</p>

                    <nav class="mobile-menu__services" aria-label="Mobile service navigation">
                        ${services.map((service) => `
                            <a href="${escapeHtml(service.file)}">
                                <span>${escapeHtml(service.shortTitle || service.title)}</span>
                                ${createIcon(service.icon || 'zap')}
                            </a>
                        `).join('')}
                    </nav>
                </div>

                <div class="mobile-menu__contact">
                    <a href="tel:${escapeHtml(normalizePhone(getValue('contact.phoneRaw')))}">
                        <span>${escapeHtml(getValue('contact.phoneDisplay'))}</span>
                        ${createIcon('phone')}
                    </a>

                    <a href="mailto:${escapeHtml(getValue('contact.email'))}">
                        <span>Email request desk</span>
                        ${createIcon('mail')}
                    </a>
                </div>

                <p class="mobile-menu__disclaimer">
                    ${escapeHtml(getValue('legal.shortDisclaimer'))}
                </p>
            </div>
        `;
    };

    const openMobileMenu = () => {
        const menu = qs('[data-mobile-menu]');
        const openBtn = qs('[data-menu-open]');

        if (!menu || !openBtn) return;

        document.body.classList.add('menu-open');
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
        openBtn.setAttribute('aria-expanded', 'true');

        const closeBtn = qs('[data-menu-close]', menu);
        if (closeBtn) closeBtn.focus();
    };

    const closeMobileMenu = () => {
        const menu = qs('[data-mobile-menu]');
        const openBtn = qs('[data-menu-open]');

        if (!menu || !openBtn) return;

        document.body.classList.remove('menu-open');
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        openBtn.setAttribute('aria-expanded', 'false');
    };

    const bindMobileMenu = () => {
        document.addEventListener('click', (event) => {
            const openBtn = event.target.closest('[data-menu-open]');
            const closeBtn = event.target.closest('[data-menu-close]');
            const mobileLink = event.target.closest('.mobile-menu a');

            if (openBtn) {
                openMobileMenu();
            }

            if (closeBtn || mobileLink) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        });
    };

    const buildFooter = () => {
        const mount = qs('[data-site-footer]');
        if (!mount) return;

        const navigation = config.navigation || [];
        const services = config.services || [];
        const legalPages = config.legalPages || [];

        mount.className = 'site-footer';
        mount.innerHTML = `
            <div class="container-wide">
                <div class="site-footer__main">
                    <div class="footer-brand">
                        <a class="footer-brand__lockup" href="${escapeHtml(getValue('links.home'))}" aria-label="${escapeHtml(getValue('brand.name'))} home">
                            <img src="${escapeHtml(getValue('brand.logo'))}" alt="${escapeHtml(getValue('brand.logoAlt'))}" width="86" height="76">
                            <strong class="logo-text">${escapeHtml(getValue('brand.name'))}</strong>
                        </a>

                        <p>${escapeHtml(getValue('footer.description'))}</p>

                        <p>${escapeHtml(getValue('legal.shortDisclaimer'))}</p>
                    </div>

                    <div class="footer-column">
                        <h3>Navigation</h3>
                        <ul class="footer-links">
                            ${navigation.map((item) => `
                                <li>
                                    <a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="footer-column">
                        <h3>Services</h3>
                        <ul class="footer-links">
                            ${services.map((service) => `
                                <li>
                                    <a href="${escapeHtml(service.file)}">${escapeHtml(service.shortTitle || service.title)}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="footer-column footer-column--contact">
                        <h3>Contact</h3>

                        <div class="footer-contact">
                            <a href="tel:${escapeHtml(normalizePhone(getValue('contact.phoneRaw')))}">
                                ${createIcon('phone')}
                                <span>${escapeHtml(getValue('contact.phoneDisplay'))}</span>
                            </a>

                            <a href="mailto:${escapeHtml(getValue('contact.email'))}">
                                ${createIcon('mail')}
                                <span>${escapeHtml(getValue('contact.email'))}</span>
                            </a>

                            <span>
                                ${createIcon('map-pin')}
                                <span>${escapeHtml(getValue('company.address'))}</span>
                            </span>

                            <span>
                                ${createIcon('badge-check')}
                                <span>${escapeHtml(getValue('company.legalName'))} · ${escapeHtml(getValue('company.companyId'))}</span>
                            </span>

                            <span>
                                ${createIcon('map')}
                                <span>${escapeHtml(getValue('company.serviceArea'))}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="footer-disclaimer">
                    <p>${escapeHtml(getValue('legal.fullDisclaimer'))}</p>
                </div>

                <div class="site-footer__bottom">
                    <span>${escapeHtml(getValue('footer.copyright'))}</span>

                    <nav class="footer-legal-links" aria-label="Legal navigation">
                        ${legalPages.map((page) => `
                            <a href="${escapeHtml(page.url)}">${escapeHtml(page.label)}</a>
                        `).join('')}
                    </nav>
                </div>
            </div>
        `;
    };

    const buildCookieBanner = () => {
        const mount = qs('[data-cookie-banner]');
        if (!mount) return;

        const cookieChoice = localStorage.getItem('voltiqueCookieConsent');

        mount.className = 'cookie-banner';
        mount.setAttribute('role', 'region');
        mount.setAttribute('aria-label', 'Cookie consent');

        mount.innerHTML = `
            <div class="cookie-banner__inner">
                <p>
                    Voltique uses essential local storage to remember your cookie choice and may use basic site functionality cookies.
                    Review our
                    <a href="${escapeHtml(getValue('links.privacy'))}">Privacy Policy</a>,
                    <a href="${escapeHtml(getValue('links.cookies'))}">Cookie Policy</a>, and
                    <a href="${escapeHtml(getValue('links.terms'))}">Terms</a>.
                </p>

                <div class="cookie-banner__actions">
                    <button class="btn btn--outline-light" type="button" data-cookie-decline>Decline</button>
                    <button class="btn btn--primary" type="button" data-cookie-accept>Accept</button>
                </div>
            </div>
        `;

        if (!cookieChoice) {
            mount.classList.add('is-visible');
        }
    };

    const bindCookieBanner = () => {
        document.addEventListener('click', (event) => {
            const accept = event.target.closest('[data-cookie-accept]');
            const decline = event.target.closest('[data-cookie-decline]');

            if (!accept && !decline) return;

            const banner = qs('[data-cookie-banner]');

            localStorage.setItem('voltiqueCookieConsent', accept ? 'accepted' : 'declined');

            if (banner) {
                banner.classList.remove('is-visible');
            }
        });
    };

    const buildServiceSelects = () => {
        qsa('[data-service-select]').forEach((select) => {
            const placeholder = select.getAttribute('data-placeholder') || 'Select a service category';

            select.innerHTML = `
                <option value="">${escapeHtml(placeholder)}</option>
                ${(config.services || []).map((service) => `
                    <option value="${escapeHtml(service.title)}">${escapeHtml(service.title)}</option>
                `).join('')}
            `;
        });
    };

    const buildServiceLinks = () => {
        qsa('[data-service-link]').forEach((node) => {
            const serviceId = node.getAttribute('data-service-link');
            const service = getServiceById(serviceId);

            if (!service) return;

            node.setAttribute('href', service.file);
        });
    };

    const initFaqAccordions = () => {
        qsa('[data-faq]').forEach((faq) => {
            const items = qsa('.faq-item', faq);

            items.forEach((item, index) => {
                const button = qs('.faq-question', item);
                const panel = qs('.faq-answer', item);

                if (!button || !panel) return;

                const id = panel.id || `faq-panel-${Math.random().toString(36).slice(2)}`;
                panel.id = id;

                button.setAttribute('aria-controls', id);
                button.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');

                if (index === 0 && !items.some((current) => current.classList.contains('is-open'))) {
                    item.classList.add('is-open');
                    button.setAttribute('aria-expanded', 'true');
                }

                button.addEventListener('click', () => {
                    const isOpen = item.classList.contains('is-open');

                    items.forEach((currentItem) => {
                        const currentButton = qs('.faq-question', currentItem);

                        currentItem.classList.remove('is-open');

                        if (currentButton) {
                            currentButton.setAttribute('aria-expanded', 'false');
                        }
                    });

                    if (!isOpen) {
                        item.classList.add('is-open');
                        button.setAttribute('aria-expanded', 'true');
                    }
                });
            });
        });
    };

    const initFaqSearch = () => {
        qsa('[data-faq-search]').forEach((form) => {
            const input = qs('input', form);
            const result = qs('[data-faq-search-result]', form.closest('.faq-shell') || document);

            form.addEventListener('submit', (event) => {
                event.preventDefault();

                if (!input) return;

                const query = input.value.trim().toLowerCase();

                if (!query) {
                    if (result) {
                        result.textContent = 'Type a service category to search.';
                    }

                    return;
                }

                const matchedService = (config.services || []).find((service) => {
                    const haystack = [
                        service.title,
                        service.shortTitle,
                        service.description,
                        service.heroText
                    ].join(' ').toLowerCase();

                    return haystack.includes(query);
                });

                if (matchedService) {
                    window.location.href = matchedService.file;
                    return;
                }

                const partialService = (config.services || []).find((service) => {
                    const words = query.split(/\s+/).filter(Boolean);

                    return words.some((word) => {
                        const haystack = [
                            service.title,
                            service.shortTitle,
                            service.description,
                            service.heroText
                        ].join(' ').toLowerCase();

                        return haystack.includes(word);
                    });
                });

                if (partialService) {
                    window.location.href = partialService.file;
                    return;
                }

                if (result) {
                    result.textContent = 'No exact service match found. You can still start a request from the contact page.';
                }
            });
        });
    };

    const initDropdownKeyboard = () => {
        const serviceItems = qsa('.main-nav__item--services');

        serviceItems.forEach((item) => {
            const dropdown = qs('.services-dropdown', item);
            const trigger = qs('.main-nav__link', item);

            if (!dropdown || !trigger) return;

            trigger.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    dropdown.classList.add('is-open');

                    const firstLink = qs('a', dropdown);
                    if (firstLink) firstLink.focus();
                }
            });

            dropdown.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    dropdown.classList.remove('is-open');
                    trigger.focus();
                }
            });

            item.addEventListener('mouseleave', () => {
                dropdown.classList.remove('is-open');
            });
        });
    };

    const initCounterAnimation = () => {
        const counters = qsa('[data-counter]');

        if (!counters.length) return;

        const runCounter = (counter) => {
            const target = Number(counter.getAttribute('data-counter')) || 0;
            const suffix = counter.getAttribute('data-counter-suffix') || '';
            const duration = 900;
            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.round(target * eased);

                counter.textContent = `${value}${suffix}`;

                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            };

            requestAnimationFrame(tick);
        };

        if (!('IntersectionObserver' in window)) {
            counters.forEach(runCounter);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const counter = entry.target;

                if (counter.dataset.counted === 'true') return;

                counter.dataset.counted = 'true';
                runCounter(counter);
                observer.unobserve(counter);
            });
        }, {
            threshold: 0.45
        });

        counters.forEach((counter) => observer.observe(counter));
    };

    const initLibraries = () => {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        if (window.AOS && typeof window.AOS.init === 'function') {
            window.AOS.init({
                duration: 720,
                easing: 'ease-out-cubic',
                offset: 80,
                once: true,
                mirror: false,
                disable: () => window.innerWidth < 360
            });

            window.addEventListener('load', () => {
                if (window.AOS && typeof window.AOS.refreshHard === 'function') {
                    window.AOS.refreshHard();
                }
            });
        }
    };

    const buildSharedFaqSchema = () => {
        const schemaMounts = qsa('[data-faq-schema]');

        schemaMounts.forEach((mount) => {
            const faqRoot = mount.closest('section') || document;
            const items = qsa('.faq-item', faqRoot);

            const mainEntity = items.map((item) => {
                const question = qs('.faq-question span', item) || qs('.faq-question', item);
                const answer = qs('.faq-answer p', item);

                if (!question || !answer) return null;

                return {
                    '@type': 'Question',
                    name: question.textContent.trim(),
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: answer.textContent.trim()
                    }
                };
            }).filter(Boolean);

            if (!mainEntity.length) return;

            mount.type = 'application/ld+json';
            mount.textContent = JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity
            });
        });
    };

    const initExternalLinkSafety = () => {
        qsa('a[target="_blank"]').forEach((link) => {
            const rel = link.getAttribute('rel') || '';
            const relParts = new Set(rel.split(/\s+/).filter(Boolean));

            relParts.add('noopener');
            relParts.add('noreferrer');

            link.setAttribute('rel', Array.from(relParts).join(' '));
        });
    };

    const initPageReadyClass = () => {
        document.documentElement.classList.add('is-ready');
    };

    const boot = () => {
        buildPreHeader();
        buildHeader();
        buildMobileMenu();
        buildFooter();
        buildCookieBanner();

        setDocumentData();
        buildServiceSelects();
        buildServiceLinks();

        bindMobileMenu();
        bindCookieBanner();

        initFaqAccordions();
        initFaqSearch();
        initDropdownKeyboard();
        initCounterAnimation();
        buildSharedFaqSchema();
        initExternalLinkSafety();
        initLibraries();
        initPageReadyClass();

        window.Voltique = {
            config,
            qs,
            qsa,
            getValue,
            getServiceById,
            getServiceByFile,
            escapeHtml,
            createIcon,
            refreshIcons: () => {
                if (window.lucide && typeof window.lucide.createIcons === 'function') {
                    window.lucide.createIcons();
                }
            },
            refreshAos: () => {
                if (window.AOS && typeof window.AOS.refreshHard === 'function') {
                    window.AOS.refreshHard();
                }
            }
        };
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();