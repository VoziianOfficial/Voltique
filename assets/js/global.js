'use strict';

(function () {
    let config = window.SiteConfig || {};

    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const requestFrame = window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : (callback) => window.setTimeout(callback, 16);
    const cancelFrame = window.cancelAnimationFrame
        ? window.cancelAnimationFrame.bind(window)
        : window.clearTimeout.bind(window);

    let uiRefreshFrame = 0;

    const getConfig = () => {
        config = window.SiteConfig || config || {};
        return config;
    };

    const getValue = (path, fallback = '') => {
        return path.split('.').reduce((acc, key) => {
            if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
                return acc[key];
            }

            return undefined;
        }, getConfig()) ?? fallback;
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

    const toLucideComponentName = (value) => {
        const camel = String(value ?? '').replace(
            /^([A-Z])|[\s-_]+(\w)/g,
            (match, first, next) => next ? next.toUpperCase() : first.toLowerCase()
        );

        return camel.charAt(0).toUpperCase() + camel.slice(1);
    };

    const createIcon = (name) => {
        return `<i data-lucide="${escapeHtml(name)}" aria-hidden="true"></i>`;
    };

    const getCurrentPage = () => {
        const path = window.location.pathname.split('/').pop();
        return path || 'index.html';
    };

    const getServiceById = (id) => {
        return (getConfig().services || []).find((service) => service.id === id);
    };

    const getServiceByFile = (file) => {
        return (getConfig().services || []).find((service) => service.file === file);
    };

    const normalizeSearchText = (value) => {
        return String(value ?? '')
            .toLowerCase()
            .replace(/\.html\b/g, ' ')
            .replace(/&/g, ' and ')
            .replace(/[-_/]+/g, ' ')
            .replace(/[^a-z0-9\s]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const getFileStem = (value) => {
        return String(value ?? '')
            .toLowerCase()
            .replace(/\.html$/i, '')
            .trim();
    };

    const shouldDisableAos = () => {
        return window.innerWidth <= 991
            || Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    const setAosMode = () => {
        const disable = shouldDisableAos();
        document.documentElement.classList.toggle('aos-disabled', disable);
        document.documentElement.classList.toggle('aos-enabled', !disable);
        return disable;
    };

    const ensureAosVisibility = () => {
        const elements = qsa('[data-aos]');
        const disable = setAosMode();
        const isAosReady = document.documentElement.classList.contains('aos-ready');

        if (!elements.length) return;

        if (disable) {
            elements.forEach((element) => {
                element.classList.add('aos-init', 'aos-animate');
            });

            return;
        }

        if (!window.AOS) {
            if (!isAosReady) return;

            elements.forEach((element) => {
                element.classList.add('aos-init', 'aos-animate');
            });

            return;
        }

        elements.forEach((element) => {
            if (!element.classList.contains('aos-init')) {
                element.classList.add('aos-init');
            }

            const rect = element.getBoundingClientRect();
            const isVisible = rect.top <= window.innerHeight * 0.92 && rect.bottom >= 0;

            if (isVisible) {
                element.classList.add('aos-animate');
            }
        });
    };

    const refreshIcons = () => {
        if (window.lucide && window.lucide.icons) {
            qsa('[data-lucide]').forEach((element) => {
                const iconName = element.getAttribute('data-lucide');

                if (!iconName) return;

                const componentName = toLucideComponentName(iconName);

                if (componentName in window.lucide.icons) {
                    return;
                }

                const fallback = element.getAttribute('data-lucide-fallback') || 'shield';
                const fallbackComponentName = toLucideComponentName(fallback);

                console.warn('Missing Lucide icon:', iconName, element);

                if (fallbackComponentName in window.lucide.icons) {
                    element.setAttribute('data-lucide', fallback);
                    element.setAttribute('data-lucide-missing', iconName);
                }
            });
        }

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    };

    const refreshAos = (hard = false) => {
        const disable = setAosMode();

        if (disable || !window.AOS || typeof window.AOS.refresh !== 'function') {
            ensureAosVisibility();
            return;
        }

        if (hard && typeof window.AOS.refreshHard === 'function') {
            window.AOS.refreshHard();
        } else {
            window.AOS.refresh();
        }

        ensureAosVisibility();
    };

    const scheduleUiRefresh = (options = {}) => {
        const { hardAos = false } = options;

        if (uiRefreshFrame) {
            cancelFrame(uiRefreshFrame);
        }

        uiRefreshFrame = requestFrame(() => {
            uiRefreshFrame = 0;
            refreshIcons();
            refreshAos(hardAos);
        });
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
        const activeConfig = getConfig();
        const navigation = activeConfig.navigation || [];
        const services = activeConfig.services || [];

        const navMarkup = navigation.map((item) => {
            const isCurrent = currentPage === item.url;
            const isServices = item.url === getValue('links.services');

            if (isServices) {
                const dropdownId = 'services-dropdown';

                return `
                    <li class="main-nav__item main-nav__item--services">
                        <a
                            class="main-nav__link"
                            href="${escapeHtml(item.url)}"
                            aria-haspopup="menu"
                            aria-controls="${dropdownId}"
                            aria-expanded="false"
                            ${isCurrent ? 'aria-current="page"' : ''}
                        >
                            ${escapeHtml(item.label)}
                            ${createIcon('chevron-down')}
                        </a>

                        <div
                            class="services-dropdown"
                            id="${dropdownId}"
                            aria-label="Electrical service categories"
                        >
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

        scheduleUiRefresh({
            hardAos: true
        });
    };

    const buildMobileMenu = () => {
        const mount = qs('[data-mobile-menu]');
        if (!mount) return;

        const activeConfig = getConfig();
        const navigation = activeConfig.navigation || [];
        const services = activeConfig.services || [];

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

        scheduleUiRefresh({
            hardAos: true
        });
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

        const activeConfig = getConfig();
        const navigation = activeConfig.navigation || [];
        const services = activeConfig.services || [];
        const legalPages = activeConfig.legalPages || [];

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

        scheduleUiRefresh({
            hardAos: true
        });
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

        scheduleUiRefresh({
            hardAos: true
        });
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
                ${(getConfig().services || []).map((service) => `
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
        const forms = qsa('[data-faq-search]');

        if (!forms.length) return;

        const createSearchIndex = () => {
            return (getConfig().services || []).map((service) => {
                const keywords = Array.isArray(service.keywords) ? service.keywords : [];
                const slug = getFileStem(service.file);
                const primaryFields = [
                    service.title,
                    service.shortTitle,
                    ...keywords
                ].map(normalizeSearchText).filter(Boolean);
                const secondaryFields = [
                    service.description,
                    service.heroText
                ].map(normalizeSearchText).filter(Boolean);
                const machineFields = [
                    service.id,
                    service.file,
                    slug
                ].map(normalizeSearchText).filter(Boolean);
                const tokenFields = Array.from(new Set(
                    [...primaryFields, ...machineFields]
                        .flatMap((value) => value.split(' '))
                        .filter(Boolean)
                ));

                return {
                    service,
                    primaryFields,
                    secondaryFields,
                    machineFields,
                    tokenFields
                };
            });
        };

        const getMatches = (rawQuery) => {
            const query = normalizeSearchText(rawQuery);

            if (!query) return [];

            const matches = createSearchIndex().map((entry) => {
                const findMatch = (fields) => {
                    return fields
                        .map((value, index) => ({
                            index,
                            position: value.indexOf(query),
                            startsWith: value.startsWith(query)
                        }))
                        .filter((item) => item.position !== -1)
                        .sort((a, b) => {
                            if (a.startsWith !== b.startsWith) {
                                return a.startsWith ? -1 : 1;
                            }

                            if (a.position !== b.position) {
                                return a.position - b.position;
                            }

                            return a.index - b.index;
                        })[0] || null;
                };

                const tokenMatch = entry.tokenFields.findIndex((token) => token.startsWith(query));
                const primaryMatch = findMatch(entry.primaryFields);
                const secondaryMatch = query.length >= 3
                    ? findMatch(entry.secondaryFields)
                    : null;
                const machineMatch = findMatch(entry.machineFields);

                let priority = Number.POSITIVE_INFINITY;
                let fieldOrder = Number.POSITIVE_INFINITY;
                let position = Number.POSITIVE_INFINITY;

                if (primaryMatch?.startsWith) {
                    priority = 1;
                    fieldOrder = primaryMatch.index;
                    position = primaryMatch.position;
                } else if (tokenMatch !== -1) {
                    priority = 1;
                    fieldOrder = 100 + tokenMatch;
                    position = 0;
                } else if (primaryMatch) {
                    priority = 2;
                    fieldOrder = primaryMatch.index;
                    position = primaryMatch.position;
                } else if (secondaryMatch) {
                    priority = 2;
                    fieldOrder = 200 + secondaryMatch.index;
                    position = secondaryMatch.position;
                } else if (machineMatch) {
                    priority = 3;
                    fieldOrder = machineMatch.index;
                    position = machineMatch.position;
                }

                return {
                    entry,
                    priority,
                    fieldOrder,
                    position
                };
            }).filter((match) => Number.isFinite(match.priority));

            return matches
                .sort((a, b) => {
                    if (a.priority !== b.priority) {
                        return a.priority - b.priority;
                    }

                    if (a.position !== b.position) {
                        return a.position - b.position;
                    }

                    if (a.fieldOrder !== b.fieldOrder) {
                        return a.fieldOrder - b.fieldOrder;
                    }

                    return a.entry.service.title.localeCompare(b.entry.service.title);
                })
                .slice(0, 6)
                .map((match) => match.entry.service);
        };

        const setResultMessage = (node, message, isError = false) => {
            if (!node) return;

            node.textContent = message;
            node.classList.toggle('is-error', Boolean(message) && isError);
            node.classList.toggle('is-success', Boolean(message) && !isError);
        };

        const instances = forms.map((form, index) => {
            const input = qs('input[type="search"], input', form);

            if (!input) return null;

            const shell = form.closest('.faq-shell') || form.parentElement || document;
            const result = qs('[data-faq-search-result]', shell);
            const suggestionsId = input.id
                ? `${input.id}-suggestions`
                : `faq-search-suggestions-${index + 1}`;
            const listId = `${suggestionsId}-list`;
            const panel = document.createElement('div');

            panel.className = 'faq-search__suggestions';
            panel.id = suggestionsId;
            panel.hidden = true;
            panel.innerHTML = `
                <ul class="faq-search__suggestions-list" id="${escapeHtml(listId)}" role="listbox" aria-label="Suggested services"></ul>
            `;

            form.append(panel);

            input.setAttribute('aria-autocomplete', 'list');
            input.setAttribute('aria-controls', suggestionsId);
            input.setAttribute('aria-expanded', 'false');
            input.setAttribute('aria-haspopup', 'listbox');
            input.setAttribute('autocomplete', 'off');

            let activeIndex = -1;
            let matches = [];

            const list = qs('.faq-search__suggestions-list', panel);

            const closeSuggestions = () => {
                activeIndex = -1;
                panel.hidden = true;
                form.classList.remove('is-open');
                input.setAttribute('aria-expanded', 'false');
                input.removeAttribute('aria-activedescendant');
            };

            const updateActiveSuggestion = () => {
                const links = qsa('.faq-search__suggestion-link', panel);

                links.forEach((link, linkIndex) => {
                    const isActive = linkIndex === activeIndex;
                    link.classList.toggle('is-active', isActive);
                    link.setAttribute('aria-selected', isActive ? 'true' : 'false');

                    if (isActive) {
                        input.setAttribute('aria-activedescendant', link.id);
                        link.scrollIntoView({
                            block: 'nearest'
                        });
                    }
                });

                if (activeIndex < 0) {
                    input.removeAttribute('aria-activedescendant');
                }
            };

            const renderSuggestions = () => {
                if (!list) return;

                if (!matches.length) {
                    closeSuggestions();
                    scheduleUiRefresh();
                    return;
                }

                list.innerHTML = matches.map((service, serviceIndex) => `
                    <li class="faq-search__suggestion-item">
                        <a
                            class="faq-search__suggestion-link"
                            id="${escapeHtml(`${listId}-option-${serviceIndex}`)}"
                            href="${escapeHtml(service.file)}"
                            role="option"
                            aria-selected="${serviceIndex === activeIndex ? 'true' : 'false'}"
                            ${serviceIndex === activeIndex ? 'data-active="true"' : ''}
                        >
                            <span class="faq-search__suggestion-icon">
                                ${createIcon(service.icon || 'zap')}
                            </span>
                            <span class="faq-search__suggestion-text">
                                <strong>${escapeHtml(service.title)}</strong>
                                <small>${escapeHtml(service.description || service.heroText || 'View this electrical service category.')}</small>
                            </span>
                        </a>
                    </li>
                `).join('');

                panel.hidden = false;
                form.classList.add('is-open');
                input.setAttribute('aria-expanded', 'true');
                updateActiveSuggestion();
                scheduleUiRefresh();
            };

            const runSearch = () => {
                const query = input.value.trim();

                if (!query) {
                    matches = [];
                    setResultMessage(result, '');
                    closeSuggestions();
                    return;
                }

                matches = getMatches(query);
                activeIndex = -1;
                setResultMessage(result, '');
                renderSuggestions();
            };

            input.addEventListener('input', runSearch);

            input.addEventListener('focus', () => {
                if (input.value.trim()) {
                    runSearch();
                }
            });

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closeSuggestions();
                    return;
                }

                if (!matches.length) return;

                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    activeIndex = (activeIndex + 1) % matches.length;
                    updateActiveSuggestion();
                    return;
                }

                if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    activeIndex = activeIndex <= 0 ? matches.length - 1 : activeIndex - 1;
                    updateActiveSuggestion();
                    return;
                }

                if (event.key === 'Enter' && activeIndex >= 0) {
                    event.preventDefault();
                    window.location.href = matches[activeIndex].file;
                }
            });

            form.addEventListener('submit', (event) => {
                const query = input.value.trim();

                if (!query) {
                    event.preventDefault();
                    closeSuggestions();
                    setResultMessage(result, 'Type a service category to search.', true);
                    return;
                }

                matches = getMatches(query);

                if (matches.length) {
                    event.preventDefault();
                    window.location.href = matches[Math.max(activeIndex, 0)].file;
                    return;
                }

                event.preventDefault();
                closeSuggestions();
                setResultMessage(
                    result,
                    'No matching service category found. Try terms like EV, panel, repair, wiring, lighting, backup, or generator.',
                    true
                );
            });

            form.addEventListener('reset', () => {
                matches = [];
                setResultMessage(result, '');
                closeSuggestions();
            });

            return {
                form,
                input,
                panel,
                closeSuggestions
            };
        }).filter(Boolean);

        if (!instances.length) return;

        document.addEventListener('click', (event) => {
            instances.forEach((instance) => {
                if (
                    instance.form.contains(event.target)
                    || instance.panel.contains(event.target)
                ) {
                    return;
                }

                instance.closeSuggestions();
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;

            instances.forEach((instance) => {
                instance.closeSuggestions();
            });
        });
    };

    const initDropdownKeyboard = () => {
        const serviceItems = qsa('.main-nav__item--services');
        const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
        const instances = [];

        const setItemOpen = (item, trigger, dropdown, open) => {
            item.classList.toggle('is-open', open);
            dropdown.classList.toggle('is-open', open);
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        const closeAll = (exceptItem = null) => {
            instances.forEach((instance) => {
                if (instance.item === exceptItem) return;

                instance.clearOpenTimer();
                instance.clearCloseTimer();
                setItemOpen(instance.item, instance.trigger, instance.dropdown, false);
            });
        };

        serviceItems.forEach((item, index) => {
            const dropdown = qs('.services-dropdown', item);
            const trigger = qs('.main-nav__link', item);

            if (!dropdown || !trigger) return;

            if (!dropdown.id) {
                dropdown.id = `services-dropdown-${index + 1}`;
                trigger.setAttribute('aria-controls', dropdown.id);
            }

            let openTimer = 0;
            let closeTimer = 0;

            const clearOpenTimer = () => {
                if (!openTimer) return;
                window.clearTimeout(openTimer);
                openTimer = 0;
            };

            const clearCloseTimer = () => {
                if (!closeTimer) return;
                window.clearTimeout(closeTimer);
                closeTimer = 0;
            };

            const openDropdown = (delay = 60) => {
                clearCloseTimer();
                clearOpenTimer();

                openTimer = window.setTimeout(() => {
                    closeAll(item);
                    setItemOpen(item, trigger, dropdown, true);
                }, delay);
            };

            const closeDropdown = (delay = 210) => {
                clearOpenTimer();
                clearCloseTimer();

                closeTimer = window.setTimeout(() => {
                    setItemOpen(item, trigger, dropdown, false);
                }, delay);
            };

            const cancelClose = () => {
                clearCloseTimer();
            };

            item.addEventListener('mouseenter', () => {
                if (!hoverMedia.matches) return;
                openDropdown(50);
            });

            item.addEventListener('mouseleave', () => {
                if (!hoverMedia.matches) return;
                closeDropdown(210);
            });

            item.addEventListener('focusin', () => {
                cancelClose();
                openDropdown(0);
            });

            item.addEventListener('focusout', () => {
                window.setTimeout(() => {
                    if (item.contains(document.activeElement)) return;
                    closeDropdown(160);
                }, 0);
            });

            trigger.addEventListener('mouseenter', cancelClose);
            dropdown.addEventListener('mouseenter', cancelClose);

            trigger.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    openDropdown(0);

                    const firstLink = qs('.services-dropdown__link', dropdown);
                    if (firstLink) firstLink.focus();
                }

                if (event.key === 'Escape') {
                    closeDropdown(0);
                }
            });

            dropdown.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closeDropdown(0);
                    trigger.focus();
                }
            });

            instances.push({
                item,
                trigger,
                dropdown,
                clearOpenTimer,
                clearCloseTimer
            });
        });

        document.addEventListener('click', (event) => {
            const activeItem = event.target.closest('.main-nav__item--services');

            if (activeItem) return;

            closeAll();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            closeAll();
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
        getConfig();
        refreshIcons();
        setAosMode();

        if (window.AOS && typeof window.AOS.init === 'function') {
            window.AOS.init({
                duration: 720,
                easing: 'ease-out-cubic',
                offset: 80,
                once: true,
                mirror: false,
                disable: shouldDisableAos
            });
        }

        document.documentElement.classList.add('aos-ready');
        ensureAosVisibility();

        window.addEventListener('load', () => {
            scheduleUiRefresh({
                hardAos: true
            });
        });

        let resizeTimer = 0;

        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                scheduleUiRefresh({
                    hardAos: true
                });
            }, 120);
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                scheduleUiRefresh({
                    hardAos: true
                });
            }
        });
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
        getConfig();

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
                refreshIcons();
            },
            refreshAos: (hard = true) => {
                refreshAos(hard);
            },
            refreshUi: (options = {}) => {
                scheduleUiRefresh(options);
            }
        };
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
