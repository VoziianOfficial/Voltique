'use strict';

(function () {
    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const initSituationSelector = () => {
        const image = qs('[data-situation-image]');
        const options = qsa('[data-situation-option]');

        if (!image || !options.length) return;

        options.forEach((option) => {
            option.addEventListener('click', () => {
                const nextImage = option.getAttribute('data-image');
                const nextAlt = option.getAttribute('data-alt') || '';

                options.forEach((item) => {
                    item.classList.remove('is-active');
                    item.setAttribute('aria-selected', 'false');
                });

                option.classList.add('is-active');
                option.setAttribute('aria-selected', 'true');

                if (nextImage) {
                    image.style.opacity = '0';

                    window.setTimeout(() => {
                        image.src = nextImage;
                        image.alt = nextAlt;
                        image.style.opacity = '1';
                    }, 160);
                }
            });
        });
    };

    const initFactorPhotoSwitcher = () => {
        const cards = qsa('[data-factor-card]');
        const image = qs('[data-factor-image]');
        const link = qs('[data-factor-link]');

        if (!cards.length || !image) return;

        cards.forEach((card) => {
            card.addEventListener('click', () => {
                const nextImage = card.getAttribute('data-image');
                const nextAlt = card.getAttribute('data-alt') || '';
                const nextHref = card.getAttribute('data-href') || 'contact.html';

                cards.forEach((item) => item.classList.remove('is-active'));
                card.classList.add('is-active');

                if (nextImage) {
                    image.style.opacity = '0';

                    window.setTimeout(() => {
                        image.src = nextImage;
                        image.alt = nextAlt;
                        image.style.opacity = '1';
                    }, 160);
                }

                if (link) {
                    link.href = nextHref;
                }
            });
        });
    };

    const initQuickCardTilt = () => {
        const cards = qsa('.quick-request-card');

        if (!cards.length) return;

        cards.forEach((card) => {
            card.addEventListener('mousemove', (event) => {
                if (window.innerWidth < 1025) return;

                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const rotateX = ((y / rect.height) - 0.5) * -2.8;
                const rotateY = ((x / rect.width) - 0.5) * 2.8;

                card.style.transform = `translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    };

    const initHeroImagePreload = () => {
        const images = [
            'assets/images/service-1.jpg',
            'assets/images/service-2.jpg',
            'assets/images/service-3.jpg',
            'assets/images/service-4.jpg',
            'assets/images/service-5.jpg',
            'assets/images/service-6.jpg',
            'assets/images/trust-photo.jpg'
        ];

        images.forEach((src) => {
            const image = new Image();
            image.src = src;
        });
    };

    const boot = () => {
        initSituationSelector();
        initFactorPhotoSwitcher();
        initQuickCardTilt();
        initHeroImagePreload();

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