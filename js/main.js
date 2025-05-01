// js/main.js
// Main script to orchestrate module loading and initialization

// Import functions from other modules
import { loadHeader, loadFooter, toggleLanguage } from './components.js';
import { checkAuthState, handleLogout, updateNavLinks } from './auth.js'; // Added updateNavLinks
import { loadProducts } from './products.js';

// Assume language functions are globally available from language-switcher.js
// If language-switcher.js were a module, we'd import: import { initializeLanguage, translatePage, setLanguage, currentLanguage } from './language-switcher.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed - main.js');

    try {
        // 1. Initialize Language (assuming global functions from language-switcher.js)
        if (typeof initializeLanguage === 'function') {
            await initializeLanguage(); // Wait for language to be ready
            console.log('Language initialized.');
        } else {
            console.error('initializeLanguage function not found. Ensure language-switcher.js is loaded correctly.');
        }

        // 2. Load Header and Footer
        loadHeader();
        loadFooter();
        console.log('Header and Footer loaded.');

        // 3. Add Event Listeners (after header/footer are in the DOM)
        const logoutButton = document.getElementById("nav-logout-button");
        if (logoutButton) {
            logoutButton.addEventListener("click", (e) => {
                e.preventDefault();
                handleLogout();
            });
            console.log('Logout button listener added.');
        }

        const languageSwitcherButton = document.getElementById("language-switcher");
        if (languageSwitcherButton) {
            languageSwitcherButton.addEventListener("click", () => {
                // Call the toggleLanguage function from components.js
                // which internally calls setLanguage (assumed global)
                toggleLanguage(); 
            });
            console.log('Language switcher listener added.');
        }

        // 4. Check Authentication State and Update UI
        // checkAuthState() itself calls updateNavLinks
        checkAuthState(); 
        console.log('Auth state checked.');

        // 5. Load Products (if on the index page or relevant page)
        if (document.getElementById('product-list-container')) {
            loadProducts();
            console.log('Product loading initiated.');
        }

        // 6. Apply Initial Translation (assuming global functions)
        if (typeof translatePage === 'function' && typeof currentLanguage !== 'undefined') {
            translatePage(currentLanguage);
            console.log('Initial page translation applied.');
        } else {
             console.error('translatePage function or currentLanguage variable not found.');
        }

    } catch (error) {
        console.error("Error during main.js initialization:", error);
    }
