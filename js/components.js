// js/components.js
import { handleLogout, checkAuthState } from './auth.js'; // Import necessary auth functions

function loadHeader() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (!headerPlaceholder) return;

    // Header structure with containers for dynamic links
    headerPlaceholder.innerHTML = `
        <div class="container header-container">
            <div class="logo">
                <a href="index.html" data-translate="site_title_link">أشياء للإيجار</a>
            </div>
            <nav>
                <ul>
                    <li><a href="index.html" data-translate="nav_home">الرئيسية</a></li>
                    <li id="nav-profile-container" style="display: none;"><a href="profile.html" data-translate="nav_profile">الملف الشخصي</a></li>
                    <li id="nav-login-container" style="display: none;"><a href="login.html" data-translate="nav_login">تسجيل الدخول</a></li>
                    <li id="nav-logout-container" style="display: none;"><a href="#" id="nav-logout-button" data-translate="nav_logout">تسجيل الخروج</a></li>
                </ul>
            </nav>
            <button id="language-switcher" onclick="toggleLanguage()" class="language-button">English</button>
        </div>
    `;

    // Add logout event listener after header is loaded
    const logoutButton = document.getElementById("nav-logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Check auth state to update header links immediately after loading
    // Ensure Firebase auth is initialized before this runs
    // checkAuthState(); // Called from auth.js DOMContentLoaded listener now
}

function loadFooter() {
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (!footerPlaceholder) return;

    footerPlaceholder.innerHTML = `
        <div class="container">
            <p data-translate="footer_text">&copy; ${new Date().getFullYear()} أشياء للإيجار. جميع الحقوق محفوظة.</p>
        </div>
    `;
}

// Function to toggle language (will call function from language-switcher.js)
// Ensure language-switcher.js is loaded before this is called
function toggleLanguage() {
    if (typeof setLanguage === 'function') {
        const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    } else {
        console.error("setLanguage function not found. Ensure language-switcher.js is loaded.");
    }
}

// Load components when the script is executed
document.addEventListener("DOMContentLoaded", () => {
    // Ensure language switcher is initialized before translating components
    if (typeof initializeLanguage === 'function') {
        initializeLanguage().then(() => {
            loadHeader();
            loadFooter();
            // Apply initial translation to components
            translatePage(currentLanguage);
        });
    } else {
        console.error("initializeLanguage function not found. Loading components without initial language setup.");
        loadHeader();
        loadFooter();
    }
});

