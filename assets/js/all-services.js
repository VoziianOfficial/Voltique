'use strict';

(function () {
    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const initServiceFinder = () => {
        const tabs = qsa('[data-service-finder-tab]');
        const image = qs('[data-service-finder-image]');
        const link = qs('[data-service-finder-link]');

        if (!tabs.length || !image || !link) return;

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const nextImage = tab.getAttribute('data-image');
                const nextAlt = tab.getAttribute('data-alt') || '';
                const nextHref = tab.getAttribute('data-href') || 'contact.html';

                tabs.forEach((item) => {
                    item.classList.remove('is-active');
                    item.setAttribute('aria-selected', 'false');
                });

                tab.classList.add('is-active');
                tab.setAttribute('aria-selected', 'true');

                image.style.opacity = '0';

                window.setTimeout(() => {
                    if (nextImage) {
                        image.src = nextImage;
                    }

                    image.alt = nextAlt;
                    image.style.opacity = '1';
                }, 160);

                link.href = nextHref;
            });
        });
    };

    const initScopeSlider = () => {
        const slider = qs('[data-scope-slider]');
        if (!slider) return;

        const track = qs('[data-scope-track]', slider);
        const cards = qsa('.scope-card', slider);
        const prev = qs('[data-scope-prev]', slider);
        const next = qs('[data-scope-next]', slider);

        if (!track || !cards.length) return;

        let index = 0;
        let timer = null;

        const getVisibleCount = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1180) return 2;
            return 3;
        };

        const getMaxIndex = () => {
            return Math.max(cards.length - getVisibleCount(), 0);
        };

        const update = () => {
            const card = cards[0];
            const gap = 14;
            const cardWidth = card.getBoundingClientRect().width;
            const offset = index * (cardWidth + gap);

            track.style.transform = `translateX(-${offset}px)`;

            cards.forEach((cardItem, cardIndex) => {
                const isVisible = cardIndex >= index && cardIndex < index + getVisibleCount();
                cardItem.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
            });
        };

        const goTo = (nextIndex) => {
            const maxIndex = getMaxIndex();

            if (nextIndex > maxIndex) {
                index = 0;
            } else if (nextIndex < 0) {
                index = maxIndex;
            } else {
                index = nextIndex;
            }

            update();
        };

        const startAuto = () => {
            stopAuto();

            timer = window.setInterval(() => {
                goTo(index + 1);
            }, 5200);
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

        window.addEventListener('resize', () => {
            index = Math.min(index, getMaxIndex());
            update();
        });

        update();
        startAuto();
    };

    const initServiceCardMotion = () => {
        const cards = qsa('.need-card');

        cards.forEach((card) => {
            card.addEventListener('mousemove', (event) => {
                if (window.innerWidth < 1025) return;

                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const rotateX = ((y / rect.height) - 0.5) * -2.4;
                const rotateY = ((x / rect.width) - 0.5) * 2.4;

                card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    };

    const initImagePreload = () => {
        const images = [
            'assets/images/service-1.jpg',
            'assets/images/service-2.jpg',
            'assets/images/service-3.jpg',
            'assets/images/service-4.jpg',
            'assets/images/service-5.jpg',
            'assets/images/service-6.jpg'
        ];

        images.forEach((src) => {
            const image = new Image();
            image.src = src;
        });
    };

    const boot = () => {
        initServiceFinder();
        initScopeSlider();
        initServiceCardMotion();
        initImagePreload();

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