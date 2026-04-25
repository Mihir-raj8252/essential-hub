let products = []; 
const BASE_URL = "http://localhost:4000/"; 

// --- 1. LOAD PRODUCTS ---
async function loadProducts() {
    try {
        const response = await fetch(`${BASE_URL}api/products`);
        if (!response.ok) throw new Error("Backend connection failed");

        const backendData = await response.json();
        
        products = backendData.map(p => {
            let productImages = [];
            if (p.images && p.images.length > 0) {
                // Prepend BASE_URL to each image path
                productImages = p.images.map(img => img.startsWith('http') ? img : BASE_URL + img);
            } else if (p.image) {
                productImages = [p.image.startsWith('http') ? p.image : BASE_URL + p.image];
            } else {
                productImages = ["images/tee4.jpg"];
            }

            return {
                ...p,
                images: productImages, 
                oldPrice: p.oldPrice || "₹2,499",
                rating: p.rating || 5.0,
                reviews: p.reviews || 0
            };
        });

        displayProducts(products); 

    } catch (error) {
        console.error("❌ Error:", error);
        // Fallback for offline testing
        products = [{ _id: "off1", name: "Essential Tee", price: 1499, oldPrice: "₹2,499", rating: 5.0, reviews: 10, tag: "New", images: ["images/tee4.jpg"] }];
        displayProducts(products);
    }
}

// --- 2. DISPLAY PRODUCTS ---
function displayProducts(filteredProducts = products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    grid.innerHTML = filteredProducts.map(p => `
        <div class="product-card" onclick="if(!event.target.closest('button')) { goToProduct('${p._id}'); }">
            <div class="img-container">
                <img src="${p.images[0]}" class="product-img" onerror="this.src='https://via.placeholder.com/300'">
                ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
            </div>
            <div class="product-info">
                <div class="rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-val">${p.rating} (${p.reviews})</span>
                </div>
                <h3>${p.name}</h3>
                <p class="price">₹${p.price.toLocaleString('en-IN')} <span class="old-price">${p.oldPrice}</span></p>
                <button class="add-btn" onclick="event.stopPropagation(); addToCart('${p._id}');">Add to Bag</button>
            </div>
        </div>
    `).join('');
}

function goToProduct(id) {
    localStorage.setItem('selectedProductId', id);
    window.location.href = 'product.html';
}

// --- 3. FILTER & SEARCH ---
function updateFilters() {
    const searchInput = document.querySelector('.main-search-bar input');
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";
    const maxPrice = document.getElementById('price-filter')?.value || 10000;
    const sortType = document.getElementById('sort-options')?.value || "default";

    const priceValueLabel = document.getElementById('price-value');
    if(priceValueLabel) priceValueLabel.innerText = `₹${parseInt(maxPrice).toLocaleString('en-IN')}`;

    let result = products.filter(p => p.name.toLowerCase().includes(searchQuery) && p.price <= maxPrice);

    if (sortType === "low-high") result.sort((a, b) => a.price - b.price);
    else if (sortType === "high-low") result.sort((a, b) => b.price - a.price);

    displayProducts(result);
}

// --- 4. CART LOGIC ---
function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (product) {
        let currentCart = JSON.parse(localStorage.getItem('userCart')) || [];
        currentCart.push({
            id: product._id, 
            name: product.name,
            price: "₹" + product.price,
            image: product.images[0],
            size: 'M',
            quantity: 1
        });
        localStorage.setItem('userCart', JSON.stringify(currentCart));
        updateBagUI();
        document.getElementById('cart-sidebar')?.classList.add('active');
    } else {
        alert("Product not found!");
    }
}

function updateBagUI() {
    const container = document.getElementById('bag-items-container');
    const countBadge = document.getElementById('cart-count');
    const totalElement = document.getElementById('cart-total');
    let currentCart = JSON.parse(localStorage.getItem('userCart')) || [];
    
    if (countBadge) countBadge.innerText = currentCart.length;
    if (!container || !totalElement) return;

    if (currentCart.length === 0) {
        container.innerHTML = "<p style='color:#888; padding:20px;'>Your bag is empty.</p>";
        totalElement.innerText = "0";
        return;
    }

    let total = 0;
    container.innerHTML = currentCart.map((item, index) => {
        total += parseInt(item.price.replace(/[₹,]/g, ''));
        return `
            <div class="cart-item-side" style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:10px; align-items:center;">
                <img src="${item.image}" width="50" style="border-radius:4px;">
                <div style="flex-grow:1">
                    <h4 style="margin:0; font-size:13px; color:#fff;">${item.name}</h4>
                    <p style="margin:0; font-size:12px; color:#888;">${item.price}</p>
                </div>
                <button onclick="removeFromBag(${index})" style="background:none; color:red; border:none; cursor:pointer;">✕</button>
            </div>
        `;
    }).join('');
    totalElement.innerText = total.toLocaleString('en-IN');
}

function removeFromBag(index) {
    let currentCart = JSON.parse(localStorage.getItem('userCart')) || [];
    currentCart.splice(index, 1);
    localStorage.setItem('userCart', JSON.stringify(currentCart));
    updateBagUI();
}

function toggleCart() {
    document.getElementById('cart-sidebar')?.classList.toggle('active');
}

window.onload = () => {
    loadProducts();
    updateBagUI();
};