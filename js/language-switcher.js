// js/language-switcher.js

let currentLanguage = localStorage.getItem("language") || "ar";
let translations = {};

// Function to fetch translation files
async function fetchTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}/common.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Could not load translation file for ${lang}:`, error);
        return {}; // Return empty object on error
    }
}

// Function to apply translations to the page
function translatePage(lang) {
    document.querySelectorAll("[data-translate]").forEach(element => {
        const key = element.getAttribute("data-translate");
        if (translations[lang] && translations[lang][key]) {
            // Handle different element types
            if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                if (element.placeholder) {
                    element.placeholder = translations[lang][key];
                }
            } else {
                element.textContent = translations[lang][key];
            }
        } else {
            console.warn(`Translation key "${key}" not found for language "${lang}"`);
        }
    });
    // Update language button text
    const langButton = document.getElementById("language-switcher");
    if (langButton) {
        langButton.textContent = lang === "ar" ? "English" : "العربية";
    }
    // Update HTML lang and dir attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

// Function to set the language
async function setLanguage(lang) {
    if (lang !== "ar" && lang !== "en") {
        console.error("Unsupported language selected:", lang);
        return; // Only support ar and en
    }
    currentLanguage = lang;
    localStorage.setItem("language", lang);
    // Load translations if not already loaded
    if (!translations[lang]) {
        translations[lang] = await fetchTranslations(lang);
    }
    translatePage(lang);
}

// Initialize language on page load
async function initializeLanguage() {
    const savedLang = localStorage.getItem("language") || "ar";
    await setLanguage(savedLang);
}

// Functions and variables are now globally accessible
// Ensure this script is loaded before scripts that use these functions (like main.js and components.js)