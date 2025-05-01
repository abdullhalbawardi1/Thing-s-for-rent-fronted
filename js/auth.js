// js/auth.js
// Updated to use custom backend API

const API_BASE_URL = 'https://thing-s-for-rent1-1.onrender.com/api';

// Helper function to display feedback messages
function showFeedback(message, isError = false) {
    console.log("showFeedback called with:", message, "isError:", isError); // Debug log
    const feedbackElement = document.getElementById("auth-feedback");
    if (feedbackElement) {
        console.log("Feedback element found."); // Debug log
        feedbackElement.textContent = message;
        feedbackElement.style.color = isError ? "red" : "green";
        feedbackElement.style.display = "block";
    } else {
        console.error("Feedback element with ID 'auth-feedback' not found!"); // Debug log
        console.log(`Fallback Feedback (${isError ? 'Error' : 'Success'}): ${message}`);
        alert(message); // Keep alert as a fallback
    }
}

// Function to handle user registration
async function handleRegistration(name, email, password) {
    console.log("handleRegistration called with:", name, email); // Debug log
    if (!name || !email || !password) {
        showFeedback("الرجاء ملء جميع الحقول المطلوبة.", true);
        return;
    }
    showFeedback("جاري إنشاء الحساب...", false);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Use message from backend if available, otherwise use default
            const errorMessage = data.message || `فشل إنشاء الحساب (HTTP ${response.status})`;
            console.error("Registration error from backend:", data);
            showFeedback(errorMessage, true);
            return;
        }

        // Registration successful, backend sends back token
        console.log("User registered successfully, token:", data.token); // Debug log
        localStorage.setItem('token', data.token); // Store the token

        showFeedback("تم إنشاء الحساب بنجاح! جاري إعادة التوجيه...", false);
        setTimeout(() => { window.location.href = 'index.html'; }, 2000); // Redirect after 2 seconds

    } catch (error) {
        console.error("Error during registration fetch:", error); // Debug log
        showFeedback(`حدث خطأ غير متوقع أثناء إنشاء الحساب: ${error.message}`, true);
    }
}

// Function to handle user login
async function handleLogin(email, password) {
    console.log("handleLogin called with:", email); // Debug log
    if (!email || !password) {
        showFeedback("الرجاء إدخال البريد الإلكتروني وكلمة المرور.", true);
        return;
    }
    showFeedback("جاري تسجيل الدخول...", false);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || `فشل تسجيل الدخول (HTTP ${response.status})`;
            console.error("Login error from backend:", data);
             // Specific check for invalid credentials
            if (response.status === 401) {
                 showFeedback("البريد الإلكتروني أو كلمة المرور غير صحيحة.", true);
            } else {
                 showFeedback(errorMessage, true);
            }
            return;
        }

        // Login successful, backend sends back token
        console.log("User logged in successfully, token:", data.token); // Debug log
        localStorage.setItem('token', data.token); // Store the token

        showFeedback("تم تسجيل الدخول بنجاح! جاري إعادة التوجيه...", false);
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
        sessionStorage.removeItem('redirectAfterLogin'); // Clean up
        setTimeout(() => { window.location.href = redirectUrl; }, 1500); // Redirect after 1.5 seconds

    } catch (error) {
        console.error("Error during login fetch:", error); // Debug log
        showFeedback(`حدث خطأ غير متوقع أثناء تسجيل الدخول: ${error.message}`, true);
    }
}

// Function to handle user logout
function handleLogout() {
    console.log("handleLogout called"); // Debug log
    localStorage.removeItem('token'); // Remove the token
    console.log("Token removed, user logged out"); // Debug log
    // Update UI immediately (optional, checkAuthState will handle it on reload)
    updateNavLinks(false);
    window.location.href = 'index.html'; // Redirect after logout
}

// Function to update navigation links based on auth state
function updateNavLinks(isLoggedIn) {
    const loginLinkContainer = document.getElementById('nav-login-container');
    const logoutLinkContainer = document.getElementById('nav-logout-container');
    const profileLinkContainer = document.getElementById('nav-profile-container');

    if (isLoggedIn) {
        if (loginLinkContainer) loginLinkContainer.style.display = 'none';
        if (logoutLinkContainer) logoutLinkContainer.style.display = 'block';
        if (profileLinkContainer) profileLinkContainer.style.display = 'block';
    } else {
        // Assuming login/register are combined or handled differently now
        // Let's hide login/profile and show nothing specific for logout state in nav
        // Or maybe show a combined "Login/Register" link if needed
        if (loginLinkContainer) loginLinkContainer.style.display = 'none'; // Or point to login page
        if (logoutLinkContainer) logoutLinkContainer.style.display = 'none';
        if (profileLinkContainer) profileLinkContainer.style.display = 'none';
    }
}

// Function to check authentication state (based on token)
function checkAuthState() {
    console.log("checkAuthState called (token based)"); // Debug log
    const token = localStorage.getItem('token');

    if (token) {
        // User has a token - assume logged in for UI purposes
        // For protected actions, the backend will verify the token
        console.log("Auth state: User has token (assumed logged in)"); // Debug log
        updateNavLinks(true);

        // Optional: Verify token with backend (e.g., on profile page load)
        // verifyTokenWithBackend(token);
    } else {
        // User does not have a token
        console.log("Auth state: User has no token (logged out)"); // Debug log
        updateNavLinks(false);

        // Redirect if on a protected page
        const protectedPages = ['profile.html']; // Add other protected pages like add-item.html, bookings.html etc.
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            console.log(`Redirecting from protected page: ${currentPage}`); // Debug log
            sessionStorage.setItem('redirectAfterLogin', window.location.href); // Save intended destination
            window.location.href = 'login.html';
        }
    }
}

// Optional: Function to verify token with backend (call this on protected pages)
async function verifyTokenWithBackend(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, { // Assuming a /me endpoint exists
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            // Token is invalid or expired
            console.log("Token verification failed, logging out.");
            handleLogout(); // Log out user if token is bad
        } else {
            const userData = await response.json();
            console.log("Token verified, user data:", userData);
            // You can store/use userData if needed
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        // Handle network errors etc.
    }
}


// Add event listeners for forms (ensure this runs after DOM is loaded)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired"); // Debug log
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    // Logout button listener is added in components.js after header load

    if (loginForm) {
        console.log("Adding login form submit listener"); // Debug log
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Login form submitted"); // Debug log
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            handleLogin(email, password);
        });
    }

    if (registerForm) {
        console.log("Adding register form submit listener"); // Debug log
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Register form submitted"); // Debug log
            const name = registerForm.name.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            handleRegistration(name, email, password);
        });
    }

    // Check auth state on initial load
    checkAuthState();
});

// Export functions needed by other modules
export { handleLogin, handleRegistration, handleLogout, checkAuthState, updateNavLinks };