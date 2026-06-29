'use strict';

(function () {
    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const initOrganizeSlider = () => {
        const slider = qs('[data-organize-slider]');
        if (!slider) return;

        const track = qs('[data-organize-track]', slider);
        const cards = qsa('.organize-card', slider);
        const prev = qs('[data-organize-prev]', slider);
        const next = qs('[data-organize-next]', slider);

        if (!track || !cards.length) return;

        let index = 0;
        let timer = null;

        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;

            cards.forEach((card, cardIndex) => {
                card.classList.toggle('is-active', cardIndex === index);
                card.setAttribute('aria-hidden', cardIndex === index ? 'false' : 'true');
            });

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

        update();
        startAuto();
    };

    const initControlAccordion = () => {
        const accordion = qs('[data-control-accordion]');
        if (!accordion) return;

        const items = qsa('.control-item', accordion);

        items.forEach((item) => {
            const button = qs('.control-item__button', item);

            if (!button) return;

            button.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-open');

                items.forEach((currentItem) => {
                    const currentButton = qs('.control-item__button', currentItem);

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
    };

    const initModelCardMotion = () => {
        const cards = qsa('.model-card');

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

    const boot = () => {
        initOrganizeSlider();
        initControlAccordion();
        initModelCardMotion();

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