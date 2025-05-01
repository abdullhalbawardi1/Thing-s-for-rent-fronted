// js/components.js
// Note: Imports and DOMContentLoaded listener removed, functions are now exported
// Assumes auth functions (handleLogout, checkAuthState) will be called from main.js or auth.js
// Assumes language functions (setLanguage, currentLanguage, initializeLanguage, translatePage) are globally available from language-switcher.js

function loadHeader() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (!headerPlaceholder) {
        console.error("Header placeholder not found!");
        return;
    }

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
            <!-- Removed onclick attribute, will be added in main.js -->
            <button id="language-switcher" class="language-button">English</button> 
        </div>
    `;

    // Logout event listener should be added in main.js after header load
    // Auth state check should be called from main.js after header load
}

function loadFooter() {
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (!footerPlaceholder) {
        console.error("Footer placeholder not found!");
        return;
    }

    footerPlaceholder.innerHTML = `
        <div class="container">
            <p data-translate="footer_text">&copy; ${new Date().getFullYear()} أشياء للإيجار. جميع الحقوق محفوظة.</p>
        </div>
    `;
}

// Function to toggle language (will be called via event listener in main.js)
function toggleLanguage() {
    // Assumes setLanguage and currentLanguage are global from language-switcher.js
    if (typeof setLanguage === 'function' && typeof currentLanguage !== 'undefined') {
        const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    } else {
        console.error("setLanguage function or currentLanguage variable not found. Ensure language-switcher.js is loaded and initialized.");
    }
}

// Functions are now globally accessible
// Ensure this script is loaded after language-switcher.js and auth.js, but before main.js