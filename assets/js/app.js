__webpack_public_path__ = window.__webpack_public_path__; // eslint-disable-line

import Global from './theme/global';

const getAccount = () => import('./theme/account');
const getLogin = () => import('./theme/auth');
const noop = null;

const pageClasses = {
    account_orderstatus: getAccount,
    account_order: getAccount,
    account_addressbook: getAccount,
    shippingaddressform: getAccount,
    account_new_return: getAccount,
    'add-wishlist': () => import('./theme/wishlist'),
    account_recentitems: getAccount,
    account_downloaditem: getAccount,
    editaccount: getAccount,
    account_inbox: getAccount,
    account_saved_return: getAccount,
    account_returns: getAccount,
    account_paymentmethods: getAccount,
    account_addpaymentmethod: getAccount,
    account_editpaymentmethod: getAccount,
    login: getLogin,
    createaccount_thanks: getLogin,
    createaccount: getLogin,
    getnewpassword: getLogin,
    forgotpassword: getLogin,
    blog: noop,
    blog_post: noop,
    brand: () => import('./theme/brand'),
    brands: noop,
    cart: () => import('./theme/cart'),
    category: () => import('./theme/category'),
    compare: () => import('./theme/compare'),
    page_contact_form: () => import('./theme/contact-us'),
    error: noop,
    404: noop,
    giftcertificates: () => import('./theme/gift-certificate'),
    giftcertificates_balance: () => import('./theme/gift-certificate'),
    giftcertificates_redeem: () => import('./theme/gift-certificate'),
    default: noop,
    page: noop,
    product: () => import('./theme/product'),
    amp_product_options: () => import('./theme/product'),
    search: () => import('./theme/search'),
    rss: noop,
    sitemap: noop,
    newsletter_subscribe: noop,
    wishlist: () => import('./theme/wishlist'),
    wishlists: () => import('./theme/wishlist'),
};

// Add price range handling utility
const priceUtils = {
    formatPriceRange(price) {
        if (!price) return '';
        
        // Handle price ranges
        if (price.price_range) {
            const min = price.price_range.min;
            const max = price.price_range.max;
            
            // Always show minimum price
            if (min && min.formatted) {
                // Only show range if max exists and is different from min
                if (max && max.formatted && max.value !== min.value) {
                    return `${min.formatted} - ${max.formatted}`;
                }
                return min.formatted;
            }
        }
        
        // Fallback to regular price
        return price.formatted || '';
    }
};

const customClasses = {};

/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param pageType String
 * @param contextJSON
 * @returns {*}
 */
window.stencilBootstrap = function stencilBootstrap(pageType, contextJSON = null, loadGlobal = true) {
    const context = JSON.parse(contextJSON || '{}');

    return {
        load() {
            // Check if jQuery is available
            if (typeof $ === 'undefined') {
                console.error('jQuery is not loaded. Please ensure jQuery is loaded before initializing the page.');
                return;
            }

            $(() => {
                try {
                    // Load globals
                    if (loadGlobal) {
                        Global.load(context);
                    }

                    const importPromises = [];

                    // Find the appropriate page loader based on pageType
                    const pageClassImporter = pageClasses[pageType];
                    if (typeof pageClassImporter === 'function') {
                        importPromises.push(pageClassImporter());
                    }

                    // See if there is a page class default for a custom template
                    const customTemplateImporter = customClasses[context.template];
                    if (typeof customTemplateImporter === 'function') {
                        importPromises.push(customTemplateImporter());
                    }

                    // Wait for imports to resolve, then call load() on them
                    Promise.all(importPromises)
                        .then(imports => {
                            imports.forEach(imported => {
                                if (imported && imported.default) {
                                    imported.default.load(context);
                                } else {
                                    console.warn('Module import failed to load properly:', imported);
                                }
                            });
                        })
                        .catch(error => {
                            console.error('Error loading page modules:', error);
                        });
                } catch (error) {
                    console.error('Error during page initialization:', error);
                }
            });
        },
    };
};
