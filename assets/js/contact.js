'use strict';

(function () {
    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const showMessage = (node, message) => {
        if (!node) return;

        node.textContent = message;
        node.classList.add('is-visible');
    };

    const hideMessage = (node) => {
        if (!node) return;

        node.textContent = '';
        node.classList.remove('is-visible');
    };

    const isValidEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
    };

    const validateForm = (form) => {
        const requiredFields = qsa('[required]', form);
        const email = qs('input[type="email"]', form);
        const errors = [];

        requiredFields.forEach((field) => {
            const isCheckbox = field.type === 'checkbox';

            if (isCheckbox && !field.checked) {
                errors.push('Please accept the request consent before submitting.');
                return;
            }

            if (!isCheckbox && !String(field.value || '').trim()) {
                const label = qs(`label[for="${field.id}"]`);
                errors.push(`${label ? label.textContent.replace('*', '').trim() : 'A required field'} is required.`);
            }
        });

        if (email && email.value && !isValidEmail(email.value)) {
            errors.push('Please enter a valid email address.');
        }

        return errors;
    };

    const initFormStartTime = () => {
        qsa('[data-form-started-at]').forEach((input) => {
            input.value = String(Date.now());
        });
    };

    const initContactForm = () => {
        const form = qs('[data-contact-form]');
        if (!form) return;

        const successMessage = qs('[data-form-success]', form);
        const errorMessage = qs('[data-form-error]', form);
        const submitButton = qs('[data-submit-button]', form);

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            hideMessage(successMessage);
            hideMessage(errorMessage);

            const validationErrors = validateForm(form);

            if (validationErrors.length) {
                showMessage(errorMessage, validationErrors[0]);
                return;
            }

            const formData = new FormData(form);
            const startedAt = Number(formData.get('formStartedAt')) || Date.now();
            const secondsSinceStart = Math.floor((Date.now() - startedAt) / 1000);

            if (secondsSinceStart < 3) {
                showMessage(errorMessage, 'Please check the required fields and try again.');
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.classList.add('is-loading');
                submitButton.querySelector('span').textContent = 'Sending...';
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json().catch(() => ({
                    success: false,
                    message: 'Please check the required fields and try again.'
                }));

                if (!response.ok || !data.success) {
                    showMessage(errorMessage, data.message || 'Please check the required fields and try again.');
                    return;
                }

                showMessage(successMessage, data.message || 'Thank you. Your request has been received.');

                form.reset();
                initFormStartTime();

                qsa('[data-service-select]').forEach((select) => {
                    if (select.options.length) {
                        select.selectedIndex = 0;
                    }
                });
            } catch (error) {
                showMessage(errorMessage, 'The request could not be sent right now. Please try again or use the phone option.');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.classList.remove('is-loading');
                    submitButton.querySelector('span').textContent = 'Submit Request';
                }
            }
        });
    };

    const initInputStates = () => {
        qsa('.form-field input, .form-field textarea, .form-field select').forEach((field) => {
            const updateState = () => {
                field.classList.toggle('has-value', Boolean(String(field.value || '').trim()));
            };

            field.addEventListener('input', updateState);
            field.addEventListener('change', updateState);

            updateState();
        });
    };

    const boot = () => {
        initFormStartTime();
        initContactForm();
        initInputStates();

    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
