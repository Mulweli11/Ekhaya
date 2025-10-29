let cart = [];

function updateCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const offcanvasCartTotal = document.getElementById("offcanvas-cart-total"); 
    const mainCartTotal = document.getElementById("main-cart-total"); // optional

    if (!cartItemsContainer || !cartCount || !offcanvasCartTotal) {
        console.error("One or more required cart elements not found in the DOM.");
        return;
    }

    cartItemsContainer.innerHTML = "";
    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        itemCount += item.quantity;

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between lh-sm";
        li.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${item.imageSrc}" alt="${item.name}" style="width: 50px; height: auto; margin-right: 15px;">
                <div>
                    <h6 class="my-0">${item.name}</h6>
                    <small class="text-body-secondary">Qty: ${item.quantity}</small>
                </div>
            </div>
            <span class="text-body-secondary me-3">R${(item.price * item.quantity).toFixed(2)}</span>
            <button class="btn btn-sm btn-danger remove-item" data-product-name="${item.name}">
                &times;
            </button>
        `;
        cartItemsContainer.appendChild(li);
    });

    // Update totals
    offcanvasCartTotal.textContent = `R${total.toFixed(2)}`;
    if (mainCartTotal) {
        mainCartTotal.textContent = `R${total.toFixed(2)}`;
    }

    // Update item counts
    cartCount.textContent = itemCount;
    const mainCartCount = document.getElementById("main-cart-count");
    if (mainCartCount) {
        mainCartCount.textContent = itemCount;
    }
}

function addToCart(productName, productPrice, productQty = 1, productImageSrc) {
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += productQty;
    } else {
        cart.push({ name: productName, price: productPrice, quantity: productQty, imageSrc: productImageSrc });
    }

    updateCart();
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCart();
}

document.addEventListener("DOMContentLoaded", () => {
    const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            const productItem = e.target.closest(".product-item");
            if (!productItem) {
                console.error("Product container not found.");
                return;
            }

            const productName = productItem.querySelector("h3").textContent;
            const productPrice = parseFloat(productItem.querySelector(".price").textContent.replace("R", ""));
            const quantityInput = productItem.querySelector(".input-number");
            const productQty = parseInt(quantityInput.value);
            const productImageSrc = productItem.querySelector(".tab-image").getAttribute("src");

            if (isNaN(productPrice) || isNaN(productQty)) {
                console.error("Invalid product price or quantity.");
                return;
            }

            addToCart(productName, productPrice, productQty, productImageSrc);

            const offcanvasElement = document.getElementById('offcanvasCart');
            if (offcanvasElement) {
                const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
                offcanvas.show();
            }
        });
    });

    const cartItemsContainer = document.getElementById("cart-items");
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove-item")) {
                const productName = e.target.getAttribute("data-product-name");
                removeFromCart(productName);
            }
        });
    }

    const quantityButtons = document.querySelectorAll(".product-qty button");
    quantityButtons.forEach(button => {
        button.addEventListener("click", () => {
            const productItem = button.closest(".product-item");
            const quantityInput = productItem.querySelector(".input-number");
            let quantity = parseInt(quantityInput.value);
            
            if (button.dataset.type === "plus") {
                quantityInput.value = quantity + 1;
            } else if (button.dataset.type === "minus" && quantity > 1) {
                quantityInput.value = quantity - 1;
            }
        });
    });
});
