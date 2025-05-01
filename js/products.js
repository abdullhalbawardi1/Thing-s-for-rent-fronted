// js/products.js
// Updated to use custom backend API
// Corrected to handle backend response format { products: [...] }

const API_BASE_URL = 'https://thing-s-for-rent1-1.onrender.com/api';

// Helper function to get auth token from local storage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Function to load products and display them on the homepage
async function loadProducts() {
    const productListContainer = document.getElementById("product-list-container");
    if (!productListContainer) return;

    console.log("Loading products from backend API...");
    productListContainer.innerHTML = `<p data-translate="loading_products">جاري تحميل المنتجات...</p>`;
    // translatePage(currentLanguage); // Assuming translatePage is available globally or imported

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // **CORRECTION:** Access the 'products' array from the response object
        const data = await response.json(); 
        const products = data.products; // Get the array from the 'products' property

        productListContainer.innerHTML = ''; // Clear loading message

        // Check if the products array exists and is empty
        if (!products || products.length === 0) { 
            productListContainer.innerHTML = '<p data-translate="no_products_found">لم يتم العثور على منتجات.</p>';
            // translatePage(currentLanguage);
            return;
        }

        products.forEach((product) => {
            const productId = product._id; // MongoDB uses _id
            const imageUrl = product.imageUrl && product.imageUrl.startsWith('http') 
                             ? product.imageUrl 
                             : (product.imageUrl ? `https://thing-s-for-rent1-1.onrender.com${product.imageUrl}` : 'images/placeholder.png'); // Adjust base URL if needed
            
            const productCard = `
                <div class="product-card">
                    <img src="${imageUrl}" alt="${product.name || 'Product Image'}" onerror="this.onerror=null;this.src='images/placeholder.png';">
                    <div class="product-card-content">
                        <h3>${product.name || 'اسم غير متوفر'}</h3>
                        <p class="price">${product.price ? `${product.price} / <span data-translate='day'>يوم</span>` : '<span data-translate="price_unavailable">السعر غير متوفر</span>'}</p>
                        <a href="product-details.html?id=${productId}" class="button" data-translate="view_details_button">عرض التفاصيل</a>
                    </div>
                </div>
            `;
            productListContainer.innerHTML += productCard;
        });
        // translatePage(currentLanguage); // Apply translation to newly added elements
    } catch (error) {
        console.error("Error loading products: ", error);
        productListContainer.innerHTML = '<p data-translate="error_loading_products">حدث خطأ أثناء تحميل المنتجات.</p>';
        // translatePage(currentLanguage);
    }
}

// Function to load details for a specific product
async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const container = document.getElementById('product-details-container');

    if (!productId || !container) {
        if(container) container.innerHTML = '<p data-translate="product_id_missing">معرف المنتج غير موجود.</p>';
        // translatePage(currentLanguage);
        return;
    }

    console.log(`Loading details for product: ${productId}`);
    // container.innerHTML = '<p data-translate="loading_product_details">جاري تحميل تفاصيل المنتج...</p>';
    // translatePage(currentLanguage);

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) {
             if (response.status === 404) {
                 console.log("No such product!");
                 container.innerHTML = '<p data-translate="product_not_found">المنتج غير موجود.</p>';
             } else {
                 throw new Error(`HTTP error! status: ${response.status}`);
             }
             // translatePage(currentLanguage);
             return;
        }
        const product = await response.json();

        // Populate the elements
        const nameElement = document.getElementById('product-name');
        const descriptionElement = document.getElementById('product-description');
        const priceElement = document.getElementById('product-price');
        const imageElement = document.getElementById('product-image');
        const ownerElement = document.querySelector('#product-owner span');

        if (nameElement) nameElement.textContent = product.name || 'اسم غير متوفر';
        if (descriptionElement) descriptionElement.textContent = product.description || 'لا يوجد وصف متاح.';
        if (priceElement) priceElement.innerHTML = product.price ? `${product.price} / <span data-translate='day'>يوم</span>` : '<span data-translate="price_unavailable">السعر غير متوفر</span>';
        if (imageElement) {
            const imageUrl = product.imageUrl && product.imageUrl.startsWith('http') 
                             ? product.imageUrl 
                             : (product.imageUrl ? `https://thing-s-for-rent1-1.onrender.com${product.imageUrl}` : 'images/placeholder.png'); // Adjust base URL if needed
            imageElement.src = imageUrl;
            imageElement.alt = product.name || 'Product Image';
            imageElement.onerror = () => { imageElement.src = 'images/placeholder.png'; };
        }

        // Display owner name (assuming backend includes owner name in product details)
        if (ownerElement && product.owner) { // Check if owner object/name exists
             ownerElement.textContent = product.owner.name || 'مستخدم غير معروف';
        } else if (ownerElement) {
             ownerElement.textContent = 'مستخدم غير معروف'; // Fallback
        }

        // Setup booking form listener (assuming booking.js is updated and provides handleBookingRequest)
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm && typeof window.handleBookingRequest === 'function') {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const startDate = bookingForm['start-date'].value;
                const endDate = bookingForm['end-date'].value;
                window.handleBookingRequest(productId, startDate, endDate);
            });
        } else if (bookingForm) {
            console.warn("handleBookingRequest function not found or booking.js not loaded/updated correctly.");
        }

        // translatePage(currentLanguage);
    } catch (error) {
        console.error("Error loading product details: ", error);
        container.innerHTML = '<p data-translate="error_loading_product_details">حدث خطأ أثناء تحميل تفاصيل المنتج.</p>';
        // translatePage(currentLanguage);
    }
}

// Function to handle image upload (NEW)
async function uploadProductImage(imageFile) {
    const token = getAuthToken();
    if (!token) {
        console.error("Authentication token not found for image upload.");
        return null;
    }

    const formData = new FormData();
    formData.append('image', imageFile); // 'image' should match the field name expected by the backend (e.g., in multer setup)

    try {
        // Assuming an endpoint like /api/upload/product-image exists
        // Adjust endpoint if necessary
        const response = await fetch(`${API_BASE_URL}/upload/product-image`, { 
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // 'Content-Type': 'multipart/form-data' is set automatically by browser for FormData
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Image upload failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Image uploaded successfully, URL:", data.imageUrl);
        return data.imageUrl; // Assuming backend returns { imageUrl: '...' }

    } catch (error) {
        console.error("Error uploading image: ", error);
        alert(`فشل تحميل الصورة: ${error.message}`);
        return null;
    }
}

// Function to handle adding a new product
async function handleAddProduct(name, description, price, imageFile) {
    const token = getAuthToken();
    if (!token) {
        alert("يجب تسجيل الدخول لإضافة منتج.");
        // window.location.href = 'login.html?redirect=add-item.html';
        return;
    }

    if (!name || !description || !price || !imageFile) {
        alert("الرجاء ملء جميع الحقول وتحميل صورة.");
        return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        alert("الرجاء إدخال سعر صحيح.");
        return;
    }

    // TODO: Add loading indicator
    console.log("Attempting to add product...");
    alert("جاري إضافة المنتج وتحميل الصورة..."); // Simple feedback

    try {
        // 1. Upload image first
        const imageUrl = await uploadProductImage(imageFile);
        if (!imageUrl) {
            // Error handled within uploadProductImage
            // TODO: Remove loading indicator
            return; 
        }

        // 2. Add product data to backend API
        console.log("Adding product data via API...");
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name,
                description: description,
                price: parseFloat(price),
                imageUrl: imageUrl, // Use the URL returned from upload
                // ownerId is set by the backend using the token
                // isAvailable defaults to true in backend model
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to add product (HTTP ${response.status})`);
        }

        const newProduct = await response.json();
        console.log("Product added successfully: ", newProduct);
        alert("تمت إضافة المنتج بنجاح!");
        // TODO: Remove loading indicator
        window.location.href = `product-details.html?id=${newProduct._id}`; // Redirect to the new product's page

    } catch (error) {
        console.error("Error adding product: ", error);
        alert(`فشل إضافة المنتج: ${error.message}`);
        // TODO: Remove loading indicator
    }
}

// Function to load products listed by the current user
async function loadUserProducts() {
    const token = getAuthToken();
    const userItemsListContainer = document.getElementById("profile-items-list");

    if (!token || !userItemsListContainer) {
        if (userItemsListContainer) {
            userItemsListContainer.innerHTML = `<p data-translate="login_to_view_items">الرجاء تسجيل الدخول لعرض منتجاتك.</p>`;
            // translatePage(currentLanguage);
        }
        return;
    }

    console.log("Loading user's products from API...");
    userItemsListContainer.innerHTML = `<p data-translate="loading_user_items">جاري تحميل منتجاتك...</p>`;
    // translatePage(currentLanguage);

    try {
        const response = await fetch(`${API_BASE_URL}/products/my`, { // Assuming '/my' endpoint exists
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                 userItemsListContainer.innerHTML = `<p data-translate="login_to_view_items">جلسة غير صالحة. الرجاء تسجيل الدخول مرة أخرى.</p>`;
                 // Optionally clear token and redirect
                 localStorage.removeItem('token');
            } else {
                 throw new Error(`HTTP error! status: ${response.status}`);
            }
            // translatePage(currentLanguage);
            return;
        }
        // **CORRECTION:** Access the 'products' array from the response object (assuming /my returns direct array, adjust if needed)
        const products = await response.json(); 
        // If /my returns { products: [...] }, use: const data = await response.json(); const products = data.products;

        userItemsListContainer.innerHTML = ''; // Clear loading indicator

        if (!products || products.length === 0) {
            userItemsListContainer.innerHTML = `<p data-translate="no_items_listed">لم تقم بعرض أي منتجات بعد.</p>`;
            // translatePage(currentLanguage);
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'user-product-list';

        products.forEach((product) => {
            const productId = product._id;
            const imageUrl = product.imageUrl && product.imageUrl.startsWith('http') 
                             ? product.imageUrl 
                             : (product.imageUrl ? `https://thing-s-for-rent1-1.onrender.com${product.imageUrl}` : 'images/placeholder.png'); // Adjust base URL if needed

            const li = document.createElement('li');
            li.className = 'user-product-item';
            li.innerHTML = `
                <img src="${imageUrl}" alt="${product.name || 'Product Image'}" class="user-product-item-image" onerror="this.onerror=null;this.src='images/placeholder.png';">
                <div class="user-product-item-details">
                    <strong>${product.name || 'اسم غير متوفر'}</strong><br>
                    <span data-translate="price">السعر:</span> ${product.price ? `${product.price} / <span data-translate='day'>يوم</span>` : '<span data-translate="price_unavailable">غير محدد</span>'}<br>
                    <a href="product-details.html?id=${productId}" data-translate="view_details_button">عرض</a> | 
                    <a href="#" data-product-id="${productId}" class="edit-product-button" data-translate="edit_button">تعديل</a> | 
                    <a href="#" data-product-id="${productId}" class="delete-product-button" data-translate="delete_button">حذف</a>
                </div>
            `;
            // TODO: Add event listeners for edit/delete buttons (will require API endpoints)
            ul.appendChild(li);
        });
        userItemsListContainer.appendChild(ul);
        // translatePage(currentLanguage);

    } catch (error) {
        console.error("Error loading user products: ", error);
        userItemsListContainer.innerHTML = `<p data-translate="error_loading_user_items">حدث خطأ أثناء تحميل منتجاتك.</p>`;
        // translatePage(currentLanguage);
    }
}


// --- Event Listeners --- 

document.addEventListener('DOMContentLoaded', () => {
    // Load products on the homepage
    if (document.getElementById('product-list-container')) {
        loadProducts();
    }

    // Load product details on the product details page
    if (document.getElementById('product-details-container')) {
        loadProductDetails();
    }
    
    // Load user products on the profile page (assuming profile.js might call this)
    // If profile.js doesn't exist or call it, uncomment this:
    // if (document.getElementById('profile-items-list')) {
    //     loadUserProducts();
    // }

    // Listener for an 'Add Product' form
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
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
    }
});
