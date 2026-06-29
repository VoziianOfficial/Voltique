'use strict';

(function () {
    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const initServiceStepSlider = () => {
        const slider = qs('[data-service-step-slider]');
        if (!slider) return;

        const track = qs('[data-service-step-track]', slider);
        const cards = qsa('.service-step-card', slider);
        const prev = qs('[data-service-step-prev]', slider);
        const next = qs('[data-service-step-next]', slider);

        const titleTarget = qs('[data-service-step-title]');
        const textTarget = qs('[data-service-step-text]');

        if (!track || !cards.length) return;

        let index = 0;
        let timer = null;

        const updateSideText = () => {
            const activeCard = cards[index];

            if (!activeCard) return;

            const title = activeCard.getAttribute('data-step-title');
            const text = activeCard.getAttribute('data-step-text');

            if (titleTarget && title) {
                titleTarget.style.opacity = '0';

                window.setTimeout(() => {
                    titleTarget.textContent = title;
                    titleTarget.style.opacity = '1';
                }, 150);
            }

            if (textTarget && text) {
                textTarget.style.opacity = '0';

                window.setTimeout(() => {
                    textTarget.textContent = text;
                    textTarget.style.opacity = '1';
                }, 150);
            }
        };

        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;

            cards.forEach((card, cardIndex) => {
                const isActive = cardIndex === index;

                card.classList.toggle('is-active', isActive);
                card.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            });

            updateSideText();

            if (window.Voltique) {
                window.Voltique.refreshAos();
            }
        };

        const goTo = (nextIndex) => {
            index = (nextIndex + cards.length) % cards.length;
            update();
        };

        const startAuto = () => {
            stopAuto();

            timer = window.setInterval(() => {
                goTo(index + 1);
            }, 5600);
        };

        const stopAuto = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        prev?.addEventListener('click', () => {
            goTo(index - 1);
            startAuto();
        });

        next?.addEventListener('click', () => {
            goTo(index + 1);
            startAuto();
        });

        slider.addEventListener('mouseenter', stopAuto);
        slider.addEventListener('mouseleave', startAuto);

        slider.addEventListener('focusin', stopAuto);
        slider.addEventListener('focusout', startAuto);

        let touchStartX = 0;

        slider.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
            stopAuto();
        }, {
            passive: true
        });

        slider.addEventListener('touchend', (event) => {
            const touchEndX = event.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 45) {
                goTo(diff > 0 ? index + 1 : index - 1);
            }

            startAuto();
        });

        update();
        startAuto();
    };

    const initServiceFactorMotion = () => {
        const cards = qsa('.service-factor-card');

        cards.forEach((card) => {
            card.addEventListener('mousemove', (event) => {
                if (window.innerWidth < 1025) return;

                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const rotateX = ((y / rect.height) - 0.5) * -2.2;
                const rotateY = ((x / rect.width) - 0.5) * 2.2;

                card.style.transform = `translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    };

    const initServiceStats = () => {
        const stats = qsa('[data-service-stat]');

        if (!stats.length) return;

        stats.forEach((stat) => {
            const value = stat.getAttribute('data-service-stat');

            if (!value) return;

            stat.setAttribute('data-counter', value);
        });
    };

    const initRelatedServiceLinks = () => {
        const currentServiceId = document.body.getAttribute('data-service-id');
        const relatedMounts = qsa('[data-related-services]');

        if (!currentServiceId || !relatedMounts.length || !window.Voltique) return;

        const config = window.Voltique.config || {};
        const services = config.services || [];
        const relatedServices = services.filter((service) => service.id !== currentServiceId).slice(0, 3);

        relatedMounts.forEach((mount) => {
            mount.innerHTML = relatedServices.map((service) => `
                <a class="related-service-card photo-card shine-surface" href="${window.Voltique.escapeHtml(service.file)}">
                    <img src="${window.Voltique.escapeHtml(service.image)}" alt="${window.Voltique.escapeHtml(service.title)} request category" width="520" height="360" loading="lazy">
                    <span>
                        <i data-lucide="${window.Voltique.escapeHtml(service.icon || 'zap')}" aria-hidden="true"></i>
                        <strong>${window.Voltique.escapeHtml(service.shortTitle || service.title)}</strong>
                    </span>
                </a>
            `).join('');
        });

        window.Voltique.refreshUi?.({
            hardAos: true
        });
    };

    const initServicePageFromConfig = () => {
        if (!window.Voltique) return;

        const currentFile = window.location.pathname.split('/').pop();
        const service = window.Voltique.getServiceByFile(currentFile);

        if (!service) return;

        document.body.setAttribute('data-service-id', service.id);

        qsa('[data-service-title]').forEach((node) => {
            node.textContent = service.title;
        });

        qsa('[data-service-short-title]').forEach((node) => {
            node.textContent = service.shortTitle || service.title;
        });

        qsa('[data-service-heading]').forEach((node) => {
            node.textContent = service.heroHeading || service.shortTitle || service.title;
        });

        qsa('[data-service-description]').forEach((node) => {
            node.textContent = service.description || '';
        });

        qsa('[data-service-hero-text]').forEach((node) => {
            node.textContent = service.heroText || service.description || '';
        });

        qsa('[data-service-image]').forEach((image) => {
            image.src = service.image;
            image.alt = `${service.title} request category`;
        });

        qsa('[data-current-service-option]').forEach((input) => {
            input.value = service.title;
        });
    };

    const initFaqSchemaRefresh = () => {
        if (!window.Voltique) return;

        window.setTimeout(() => {
            window.Voltique.refreshUi?.({
                hardAos: true
            });
        }, 120);
    };

    const boot = () => {
        initServicePageFromConfig();
        initServiceStepSlider();
        initServiceFactorMotion();
        initServiceStats();
        initRelatedServiceLinks();
        initFaqSchemaRefresh();

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
