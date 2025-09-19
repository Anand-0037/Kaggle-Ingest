"use client";

import { useEffect } from 'react';

export function HydrationFix() {
    useEffect(() => {
        // Remove any browser extension attributes that might cause hydration issues
        const cleanupExtensionAttributes = () => {
            const body = document.body;
            if (body) {
                // List of common browser extension attributes that cause hydration issues
                const extensionAttributes = [
                    'data-atm-ext-installed',
                    'cz-shortcut-listen',
                    'data-dashlane-rid',
                    'data-lr-input-device',
                    'data-new-gr-c-s-check-loaded',
                    'data-gr-ext-installed',
                    'data-1p-ext-installed',
                    'data-bitwarden-watching',
                    'data-lastpass-icon-added'
                ];

                extensionAttributes.forEach(attr => {
                    if (body.hasAttribute(attr)) {
                        body.removeAttribute(attr);
                    }
                });
            }
        };

        // Run immediately and also observe for changes
        cleanupExtensionAttributes();

        // Create a mutation observer to handle dynamic attribute additions
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes') {
                    cleanupExtensionAttributes();
                }
            });
        });

        // Start observing the body for attribute changes
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: [
                'data-atm-ext-installed',
                'cz-shortcut-listen',
                'data-dashlane-rid',
                'data-lr-input-device',
                'data-new-gr-c-s-check-loaded',
                'data-gr-ext-installed',
                'data-1p-ext-installed',
                'data-bitwarden-watching',
                'data-lastpass-icon-added'
            ]
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return null;
}