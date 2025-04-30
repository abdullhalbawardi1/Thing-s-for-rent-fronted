// js/profile.js
// Updated to use custom backend API

// Import functions from updated modules that now use the API
import { loadUserBookings } from "./booking.js";
import { loadUserProducts } from "./products.js";

const API_BASE_URL = "https://thing-s-for-rent1-1.onrender.com/api";

// Helper function to get auth token from local storage
function getAuthToken() {
    return localStorage.getItem("token");
}

// Function to load user profile details from the backend
async function loadUserProfile() {
    const token = getAuthToken();
    const profileDetailsContainer = document.getElementById("profile-details");

    if (!token || !profileDetailsContainer) {
        console.log("Token not found or profile container not found.");
        // Redirect or message handled by checkAuthState in auth.js or the main check here
        return;
    }

    console.log("Loading profile details from API...");
    profileDetailsContainer.innerHTML = `<p data-translate="loading_profile">جاري تحميل الملف الشخصي...</p>`;
    // translatePage(currentLanguage); // Assuming translatePage is available

    try {
        // Assuming an endpoint like /api/auth/me or /api/users/me returns user details
        const response = await fetch(`${API_BASE_URL}/auth/me`, { 
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.log("Unauthorized. Token might be invalid or expired.");
                profileDetailsContainer.innerHTML = `<p data-translate="session_expired_profile">انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى.</p>`;
                localStorage.removeItem("token"); // Clear invalid token
                // Optionally redirect to login after a delay
                // setTimeout(() => { window.location.href = "login.html"; }, 2000);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // translatePage(currentLanguage);
            return;
        }

        const userData = await response.json();

        // Populate profile details
        const nameElement = document.getElementById("profile-name");
        const emailElement = document.getElementById("profile-email");

        if (nameElement) nameElement.textContent = userData.name || "اسم غير متوفر";
        if (emailElement) emailElement.textContent = userData.email || "بريد إلكتروني غير متوفر";

        // Clear loading message by replacing the container's content or hiding the message
        // Assuming the structure is simple and the above elements replace the loading p tag
        const loadingMsg = profileDetailsContainer.querySelector("p[data-translate=\"loading_profile\"]");
        if (loadingMsg) {
            loadingMsg.style.display = "none"; // Hide the loading message
        }

        // translatePage(currentLanguage);
    } catch (error) {
        console.error("Error loading user profile: ", error);
        profileDetailsContainer.innerHTML = `<p data-translate="error_loading_profile">حدث خطأ أثناء تحميل الملف الشخصي.</p>`;
        // translatePage(currentLanguage);
    }
}

// Load all profile data when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const token = getAuthToken();
    const mainContainer = document.getElementById("profile-container"); // Assuming a main container for the profile page

    if (token) {
        console.log("Token found on profile page, loading data...");
        loadUserProfile();
        loadUserProducts(); // Load products listed by the user (uses token internally)
        loadUserBookings(); // Load bookings made by the user (uses token internally)
    } else {
        // User is not logged in
        console.log("User is not logged in on profile page.");
        if (mainContainer) {
            mainContainer.innerHTML = `<p data-translate="login_required_profile">الرجاء تسجيل الدخول لعرض الملف الشخصي.</p>`;
            // translatePage(currentLanguage);
            // Optionally add a login button/link
            // mainContainer.innerHTML += `<br><a href="login.html" class="button">تسجيل الدخول</a>`;
        }
        // Redirect logic is primarily handled in auth.js's checkAuthState
    }
});

