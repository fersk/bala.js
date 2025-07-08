/*!
 * watchdog@0.0.3
 * @author Nuno F.
 * @license Apache 2.0 license
 */
const Watchdog = {
    endpoint: '/log',
    shop: new URLSearchParams(location.search).get('shop'),

    logData(data) {
        fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, shop: this.shop })
        })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error('Logging failed:', err));
    },

    init() {
        // Error tracking
        window.onerror = (message, source, lineno, colno, error) => {
            console.log('onerror', message, source, lineno, colno, error);
            this.logData({
                message,
                lineno,
                colno,
                url: location.href,
                isClassicMinified: source?.includes('app.classic.min.js'),
                isNewMinified: source?.includes('app.new.min.js'),
                errorType: error?.name
            });
            return true;
        };

        // Web vitals - wait for App Bridge to load
        window.addEventListener('load', () => {
            if (typeof shopify === 'undefined') {
                console.warn('Shopify App Bridge not available');
                return;
            }

            try {
                shopify.webVitals?.onReport(metrics =>
                    navigator.sendBeacon(this.endpoint, JSON.stringify({ metrics, shop: this.shop }))
                );
            } catch (err) {
                console.warn('Web Vitals setup failed:', err);
            }
        });
    }
};

Watchdog.init();