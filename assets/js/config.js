'use strict';

window.SiteConfig = {
    brand: {
        name: 'Voltique',
        logo: 'assets/images/logo.svg',
        logoAlt: 'Voltique electrical provider matching logo',
        tagline: 'Independent Electrical Provider Matching'
    },

    company: {
        name: 'Voltique',
        legalName: 'Voltique',
        companyId: 'VQ-ELECTRIC-2048',
        address: 'USA Service Area',
        serviceArea: 'Electrical provider matching across selected local service areas'
    },

    contact: {
        phoneRaw: '+18885550186',
        phoneDisplay: '(888) 555-0186',
        phoneButtonText: 'Start Request',
        email: 'hello@voltique.com'
    },

    form: {
        endpoint: 'contact.php',
        recipientLabel: 'Voltique Request Desk',
        sourceFieldName: 'sourcePage',
        minimumSubmitSeconds: 3
    },

    legal: {
        shortDisclaimer:
            'Voltique is an independent provider-matching platform. Voltique does not perform electrical work directly. Final pricing, availability, scheduling, warranties, and service terms are provided by participating independent providers.',

        fullDisclaimer:
            'Disclaimer: This site is a free service to assist homeowners in connecting with local service providers. All contractors/providers are independent and this site does not warrant or guarantee any work performed. It is the responsibility of the homeowner to verify that the hired contractor furnishes the necessary license and insurance required for the work being performed. All persons depicted in a photo or video are actors or models and not contractors listed on this site.',

        formDisclaimer:
            'Submitting this form does not create a service agreement. You may be contacted by participating providers. Final pricing, availability, and service terms are provided by the provider you choose.'
    },

    footer: {
        description:
            'Voltique helps homeowners submit electrical request details and compare available local provider options through an independent matching process.',
        copyright:
            '© 2026 Voltique. All rights reserved.'
    },

    links: {
        home: 'index.html',
        about: 'about.html',
        services: 'all-services.html',
        contact: 'contact.html',
        privacy: 'privacy-policy.html',
        terms: 'terms-of-service.html',
        cookies: 'cookie-policy.html'
    },

    services: [
        {
            id: 'electrical-repair',
            title: 'Electrical Repair & Troubleshooting',
            shortTitle: 'Electrical Repair',
            file: 'electrical-repair-troubleshooting.html',
            icon: 'wrench',
            keywords: [
                'repair',
                'troubleshooting',
                'troubleshoot',
                'fault',
                'outlet',
                'breaker trip',
                'diagnostic',
                'flickering lights'
            ],
            image: 'assets/images/service-1.jpg',
            heroHeading: 'Electrical Repair',
            heroText:
                'Submit repair-related electrical details and compare available local provider options for troubleshooting, faulty outlets, breaker concerns, and similar requests.',
            description:
                'Users may submit details about electrical repair concerns and review participating provider options based on category, location, and project scope.'
        },
        {
            id: 'panels-breakers',
            title: 'Electrical Panel & Breaker Services',
            shortTitle: 'Panels & Breakers',
            file: 'electrical-panel-breaker-services.html',
            icon: 'square-activity',
            keywords: [
                'panel',
                'breaker',
                'service panel',
                'subpanel',
                'capacity',
                'upgrade',
                'load center'
            ],
            image: 'assets/images/service-2.jpg',
            heroHeading: 'Panel Options',
            heroText:
                'Compare local provider options for panel, breaker, capacity, and related electrical request categories.',
            description:
                'This category helps users organize panel or breaker-related request details before comparing available independent provider options.'
        },
        {
            id: 'wiring-rewiring',
            title: 'Wiring & Rewiring Services',
            shortTitle: 'Wiring & Rewiring',
            file: 'wiring-rewiring-services.html',
            icon: 'cable',
            keywords: [
                'wiring',
                'rewiring',
                'rewire',
                'new wire',
                'circuits',
                'cable',
                'rough-in'
            ],
            image: 'assets/images/service-3.jpg',
            heroHeading: 'Wiring Requests',
            heroText:
                'Start a wiring or rewiring request and review available provider options for your project scope.',
            description:
                'Users may submit information about wiring projects, rewiring needs, access conditions, and property details for provider comparison.'
        },
        {
            id: 'lighting-fixtures',
            title: 'Lighting & Fixture Installation',
            shortTitle: 'Lighting & Fixtures',
            file: 'lighting-fixture-installation.html',
            icon: 'lightbulb',
            keywords: [
                'lighting',
                'lights',
                'fixture',
                'fixtures',
                'recessed',
                'ceiling light',
                'installation'
            ],
            image: 'assets/images/service-4.jpg',
            heroHeading: 'Lighting Projects',
            heroText:
                'Compare participating provider options for lighting and fixture-related electrical requests.',
            description:
                'This category supports requests involving fixture updates, lighting improvements, and related project details for provider matching.'
        },
        {
            id: 'ev-chargers',
            title: 'EV Charger Installation',
            shortTitle: 'EV Chargers',
            file: 'ev-charger-installation.html',
            icon: 'battery-charging',
            keywords: [
                'ev',
                'charger',
                'charging',
                'electric vehicle',
                'level 2',
                'garage charger',
                'home charging'
            ],
            image: 'assets/images/service-5.jpg',
            heroHeading: 'EV Charger Matching',
            heroText:
                'Submit EV charging project details and compare available local provider options.',
            description:
                'Users may organize EV charger request details such as charger type, panel capacity, parking access, and installation location.'
        },
        {
            id: 'backup-power',
            title: 'Generator & Backup Power',
            shortTitle: 'Backup Power',
            file: 'generator-backup-power.html',
            icon: 'zap',
            keywords: [
                'backup',
                'generator',
                'standby power',
                'emergency power',
                'transfer switch',
                'whole home backup'
            ],
            image: 'assets/images/service-6.jpg',
            heroHeading: 'Backup Power Options',
            heroText:
                'Compare provider options for generator and backup power request categories.',
            description:
                'This category helps users submit backup power planning details and compare available independent provider options.'
        }
    ],

    navigation: [
        {
            label: 'Home',
            url: 'index.html'
        },
        {
            label: 'About',
            url: 'about.html'
        },
        {
            label: 'Services',
            url: 'all-services.html'
        },
        {
            label: 'Contact',
            url: 'contact.html'
        }
    ],

    legalPages: [
        {
            label: 'Privacy Policy',
            url: 'privacy-policy.html'
        },
        {
            label: 'Terms of Service',
            url: 'terms-of-service.html'
        },
        {
            label: 'Cookie Policy',
            url: 'cookie-policy.html'
        }
    ],

    homepage: {
        hero: {
            eyebrow: 'Independent electrical request matching',
            heading: 'Compare Electrical Options',
            text:
                'Voltique helps you submit electrical project details and compare available local provider options without claiming to perform the electrical work directly.',
            primaryButton: 'Start Request',
            secondaryButton: 'View Services',
            image: 'assets/images/hero-home.jpg'
        },

        quickRequests: [
            {
                title: 'Repair concerns',
                text:
                    'Share details about outlets, breakers, flickering lights, or other electrical concerns so available provider options can be compared.',
                icon: 'activity',
                serviceId: 'electrical-repair'
            },
            {
                title: 'Panel capacity',
                text:
                    'Organize panel, breaker, and capacity-related request details before reviewing participating provider options.',
                icon: 'square-activity',
                serviceId: 'panels-breakers'
            },
            {
                title: 'Wiring projects',
                text:
                    'Submit rewiring or new wiring request details including project type, access, and property needs.',
                icon: 'cable',
                serviceId: 'wiring-rewiring'
            },
            {
                title: 'Lighting updates',
                text:
                    'Compare options for fixture, lighting layout, and upgrade-related electrical request categories.',
                icon: 'lightbulb',
                serviceId: 'lighting-fixtures'
            },
            {
                title: 'EV charging',
                text:
                    'Start an EV charger request and compare provider options based on charger type, location, and electrical capacity.',
                icon: 'battery-charging',
                serviceId: 'ev-chargers'
            },
            {
                title: 'Backup power',
                text:
                    'Review options for backup power and generator-related request categories through participating providers.',
                icon: 'zap',
                serviceId: 'backup-power'
            }
        ]
    },

    faqDefaults: {
        serviceSearchPlaceholder: 'Search electrical service type...',
        questions: [
            {
                question: 'How do I compare local electrical providers?',
                answer:
                    'Start by submitting your request details through Voltique. Available provider options may vary by location, project type, and participating provider availability.'
            },
            {
                question: 'Does Voltique perform electrical work directly?',
                answer:
                    'No. Voltique is an independent provider-matching platform. Electrical work, scheduling, pricing, warranties, and service terms are handled by participating independent providers.'
            },
            {
                question: 'What happens after I submit a request?',
                answer:
                    'Your request details may be used to identify relevant provider options. Participating providers may contact you with availability, pricing information, and next steps.'
            },
            {
                question: 'What affects electrical project pricing?',
                answer:
                    'Pricing can depend on project scope, property conditions, panel capacity, access, materials, permits, timeline, and the provider terms you review.'
            },
            {
                question: 'How do I know if providers serve my area?',
                answer:
                    'Service availability may vary by location. Participating providers are responsible for confirming whether they serve your area and whether they can handle the requested category.'
            }
        ]
    }
};
