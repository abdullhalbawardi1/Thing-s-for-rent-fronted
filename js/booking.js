// js/booking.js
// Updated to use custom backend API

const API_BASE_URL = 'https://thing-s-for-rent1-1.onrender.com/api';

// Helper function to get auth token from local storage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to display feedback messages
function showBookingFeedback(message, isError = false) {
    // TODO: Implement a more sophisticated feedback mechanism on the page
    console.log(`Booking Feedback (${isError ? 'Error' : 'Success'}): ${message}`);
    const feedbackElement = document.getElementById('booking-feedback'); // Assuming an element with this ID exists
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.style.color = isError ? 'red' : 'green';
        feedbackElement.style.display = 'block';
        // Optionally hide after a few seconds
        // setTimeout(() => { feedbackElement.style.display = 'none'; }, 5000);
    } else {
        alert(message); // Fallback
    }
}

// Function to handle a booking request
async function handleBookingRequest(productId, startDate, endDate) {
    const token = getAuthToken();
    if (!token) {
        showBookingFeedback("يجب تسجيل الدخول لإتمام عملية الحجز.", true);
        sessionStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = "login.html";
        return;
    }

    if (!startDate || !endDate) {
        showBookingFeedback("الرجاء تحديد تاريخ البدء وتاريخ الانتهاء.", true);
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (start < now) {
        showBookingFeedback("تاريخ البدء لا يمكن أن يكون في الماضي.", true);
        return;
    }

    if (start >= end) {
        showBookingFeedback("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.", true);
        return;
    }

    console.log(`Processing booking request for product ${productId} from ${startDate} to ${endDate}`);
    showBookingFeedback("جاري معالجة طلب الحجز...", false); // Indicate processing
    // TODO: Add better loading indicator

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: productId,
                startDate: startDate, // Send as ISO string or YYYY-MM-DD
                endDate: endDate     // Send as ISO string or YYYY-MM-DD
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Use message from backend if available
            const errorMessage = data.message || `فشل إنشاء الحجز (HTTP ${response.status})`;
            console.error("Booking error from backend:", data);
            showBookingFeedback(errorMessage, true);
            return;
        }

        // Booking successful
        console.log("Booking created successfully: ", data);
        // Backend response might include calculated price, use it in the message
        const successMessage = data.totalPrice
            ? `تم إنشاء الحجز بنجاح! التكلفة الإجمالية: ${data.totalPrice}`
            : "تم إنشاء الحجز بنجاح!";
        showBookingFeedback(successMessage, false);
        // TODO: Remove loading indicator
        // Redirect to profile bookings section after a short delay
        setTimeout(() => {
             window.location.href = 'profile.html#bookings';
        }, 2000);

    } catch (error) {
        console.error("Error creating booking via API: ", error);
        showBookingFeedback(`حدث خطأ غير متوقع أثناء إنشاء الحجز: ${error.message}`, true);
        // TODO: Remove loading indicator
    }
}

// Function to load bookings for the current user on the profile page
async function loadUserBookings() {
    const token = getAuthToken();
    const bookingsListContainer = document.getElementById("profile-bookings-list");

    if (!token || !bookingsListContainer) {
        if (bookingsListContainer) {
             bookingsListContainer.innerHTML = `<p data-translate="login_to_view_bookings">الرجاء تسجيل الدخول لعرض حجوزاتك.</p>`;
             // translatePage(currentLanguage);
        }
        return;
    }

    console.log("Loading user bookings from API...");
    bookingsListContainer.innerHTML = `<p data-translate="loading_bookings">جاري تحميل الحجوزات...</p>`;
    // translatePage(currentLanguage);

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/my`, { // Assuming /my endpoint exists
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                 bookingsListContainer.innerHTML = `<p data-translate="login_to_view_bookings">جلسة غير صالحة. الرجاء تسجيل الدخول مرة أخرى.</p>`;
                 localStorage.removeItem('token'); // Clear invalid token
            } else {
                 throw new Error(`HTTP error! status: ${response.status}`);
            }
            // translatePage(currentLanguage);
            return;
        }

        const bookings = await response.json();
        bookingsListContainer.innerHTML = ''; // Clear loading indicator

        if (!bookings || bookings.length === 0) {
            bookingsListContainer.innerHTML = `<p data-translate="no_bookings_found">لم يتم العثور على حجوزات.</p>`;
            // translatePage(currentLanguage);
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'booking-list';

        bookings.forEach((booking) => {
            const bookingId = booking._id;
            // Assuming backend populates product details (name, imageUrl)
            const productName = booking.product ? (booking.product.name || 'منتج غير متوفر') : 'منتج غير متوفر';
            const productImageUrl = booking.product && booking.product.imageUrl
                                    ? (booking.product.imageUrl.startsWith('http') ? booking.product.imageUrl : `http://localhost:5000${booking.product.imageUrl}`) 
                                    : 'images/placeholder.png';

            // Format dates (assuming backend sends ISO strings)
            const startDate = new Date(booking.startDate).toLocaleDateString();
            const endDate = new Date(booking.endDate).toLocaleDateString();
            const statusText = booking.status === 'confirmed' ? 'مؤكد' : (booking.status === 'pending' ? 'قيد الانتظار' : booking.status);

            const li = document.createElement('li');
            li.className = 'booking-item';
            li.innerHTML = `
                <img src="${productImageUrl}" alt="${productName}" class="booking-item-image" onerror="this.onerror=null;this.src='images/placeholder.png';">
                <div class="booking-item-details">
                    <strong>${productName}</strong><br>
                    <span data-translate="booking_from">من:</span> ${startDate} <span data-translate="booking_to">إلى:</span> ${endDate}<br>
                    <span data-translate="booking_status">الحالة:</span> ${statusText} - <span data-translate="total_price">الإجمالي:</span> ${booking.totalPrice}
                    ${booking.status === 'confirmed' ? `<button class="cancel-booking-button" data-booking-id="${bookingId}" data-translate="cancel_button">إلغاء</button>` : ''}
                </div>
            `;
            // Add event listener for cancel button if it exists
            const cancelButton = li.querySelector('.cancel-booking-button');
            if (cancelButton) {
                cancelButton.addEventListener('click', () => handleCancelBooking(bookingId));
            }
            ul.appendChild(li);
        });

        bookingsListContainer.appendChild(ul);
        // translatePage(currentLanguage);

    } catch (error) {
        console.error("Error loading user bookings: ", error);
        bookingsListContainer.innerHTML = `<p data-translate="error_loading_bookings">حدث خطأ أثناء تحميل الحجوزات.</p>`;
        // translatePage(currentLanguage);
    }
}

// Function to handle cancelling a booking (NEW)
async function handleCancelBooking(bookingId) {
    const token = getAuthToken();
    if (!token) {
        showBookingFeedback("يجب تسجيل الدخول لإلغاء الحجز.", true);
        return;
    }

    // Optional: Confirm cancellation with the user
    if (!confirm("هل أنت متأكد أنك تريد إلغاء هذا الحجز؟")) {
        return;
    }

    console.log(`Attempting to cancel booking: ${bookingId}`);
    showBookingFeedback("جاري إلغاء الحجز...", false);

    try {
        // Assuming a DELETE endpoint like /api/bookings/:id exists
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE', // Or PATCH if changing status to 'cancelled'
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || `فشل إلغاء الحجز (HTTP ${response.status})`;
            console.error("Cancellation error from backend:", data);
            showBookingFeedback(errorMessage, true);
            return;
        }

        console.log("Booking cancelled successfully");
        showBookingFeedback("تم إلغاء الحجز بنجاح.", false);
        // Reload the bookings list to reflect the change
        loadUserBookings();

    } catch (error) {
        console.error("Error cancelling booking via API: ", error);
        showBookingFeedback(`حدث خطأ غير متوقع أثناء إلغاء الحجز: ${error.message}`, true);
    }
}


// --- Event Listeners & Exports ---

// Make handleBookingRequest globally available for product-details.html
window.handleBookingRequest = handleBookingRequest;

// Load user bookings on the profile page (assuming profile.js calls this)
// Export loadUserBookings to be called from profile.js after auth check
export { loadUserBookings };

