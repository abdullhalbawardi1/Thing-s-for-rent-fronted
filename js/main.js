// js/main.js
// Main script to orchestrate initialization using globally available functions

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded and parsed - main.js (traditional script)");

    try {
        // 1. Initialize Language (assuming global functions from language-switcher.js)
        if (typeof initializeLanguage === "function") {
            await initializeLanguage(); // Wait for language to be ready
            console.log("Language initialized.");
        } else {
            console.error("initializeLanguage function not found. Ensure language-switcher.js is loaded before main.js.");
            return; // Stop execution if language setup fails
        }

        // 2. Load Header and Footer (assuming global functions from components.js)
        if (typeof loadHeader === "function" && typeof loadFooter === "function") {
            loadHeader();
            loadFooter();
            console.log("Header and Footer loaded.");
        } else {
            console.error("loadHeader or loadFooter function not found. Ensure components.js is loaded before main.js.");
            return; // Stop execution if component loading fails
        }

        // 3. Add Event Listeners (after header/footer are in the DOM)
        // Logout button listener (assuming global handleLogout from auth.js)
        const logoutButton = document.getElementById("nav-logout-button");
        if (logoutButton && typeof handleLogout === "function") {
            logoutButton.addEventListener("click", (e) => {
                e.preventDefault();
                handleLogout();
            });
            console.log("Logout button listener added.");
        } else if (!logoutButton) {
            console.warn("Logout button not found after header load.");
        } else {
            console.error("handleLogout function not found. Ensure auth.js is loaded before main.js.");
        }

        // Language switcher listener (assuming global toggleLanguage from components.js)
        const languageSwitcherButton = document.getElementById("language-switcher");
        if (languageSwitcherButton && typeof toggleLanguage === "function") {
            languageSwitcherButton.addEventListener("click", () => {
                toggleLanguage(); 
            });
            console.log("Language switcher listener added.");
        } else if (!languageSwitcherButton) {
            console.warn("Language switcher button not found after header load.");
        } else {
             console.error("toggleLanguage function not found. Ensure components.js is loaded before main.js.");
        }

        // 4. Check Authentication State and Update UI (assuming global checkAuthState from auth.js)
        if (typeof checkAuthState === "function") {
            checkAuthState(); 
            console.log("Auth state checked.");
        } else {
            console.error("checkAuthState function not found. Ensure auth.js is loaded before main.js.");
        }

        // 5. Load Products (if on the index page, assuming global loadProducts from products.js)
        if (document.getElementById("product-list-container") && typeof loadProducts === "function") {
            loadProducts();
            console.log("Product loading initiated.");
        } else if (document.getElementById("product-list-container")) {
             console.error("loadProducts function not found. Ensure products.js is loaded before main.js.");
        }
        
        // 6. Load Product Details (if on product details page, assuming global loadProductDetails from products.js)
        if (document.getElementById("product-details-container") && typeof loadProductDetails === "function") {
            loadProductDetails();
            console.log("Product details loading initiated.");
        } else if (document.getElementById("product-details-container")) {
             console.error("loadProductDetails function not found. Ensure products.js is loaded before main.js.");
        }
        
        // 7. Load User Products (if on profile page, assuming global loadUserProducts from products.js)
        // Note: auth.js already handles redirecting from protected pages if not logged in.
        if (document.getElementById("profile-items-list") && typeof loadUserProducts === "function") {
            loadUserProducts();
            console.log("User products loading initiated.");
        } else if (document.getElementById("profile-items-list")) {
             console.error("loadUserProducts function not found. Ensure products.js is loaded before main.js.");
        }
        
        // 8. Add Product Form Listener (if on add product page, assuming global handleAddProduct from products.js)
        const addProductForm = document.getElementById("add-product-form");
        if (addProductForm && typeof handleAddProduct === "function") {
             addProductForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const name = addProductForm.name.value;
                const description = addProductForm.description.value;
                const price = addProductForm.price.value;
                const imageFile = addProductForm.image.files[0];
    
                if (imageFile) {
                    handleAddProduct(name, description, price, imageFile);
                } else {
                    alert("الرجاء اختيار صورة للمنتج.");
                }
            });
            console.log("Add product form listener added.");
        } else if (addProductForm) {
             console.error("handleAddProduct function not found. Ensure products.js is loaded before main.js.");
        }

        // 9. Apply Initial Translation (assuming global functions from language-switcher.js)
        // This needs to run *after* dynamic content (header, footer, products) is loaded
        // We might need to call translatePage within loadHeader, loadFooter, loadProducts etc.
        // Or call it here once, assuming all placeholders are in the DOM initially.
        if (typeof translatePage === "function" && typeof currentLanguage !== "undefined") {
            translatePage(currentLanguage);
            console.log("Initial page translation applied.");
        } else {
             console.error("translatePage function or currentLanguage variable not found.");
        }

    } catch (error) {
        console.error("Error during main.js initialization:", error);
    }
});
