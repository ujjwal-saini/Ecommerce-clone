const container = document.getElementById("cards-container");
const cardView = document.getElementById("cardview");
const cartbtn = document.querySelector("#cartbtn");
let profilelogin = document.querySelector(".profilelogin");
let notloginimg = document.querySelector("notloginimg");
const logoutbtn = document.querySelector(".logoutbtn");
const logouttext = document.querySelector("#logout");
let curpage = document.querySelector(".curpage");
let qty = document.querySelector(".qty");

let currentUserEmail = "";

async function getCurrentUserEmail() {
    const res = await fetch("/api/current-user");
    const data = await res.json();
    currentUserEmail = data.email;
    console.log("Current Email:", currentUserEmail);

    if (!currentUserEmail) {
        profilelogin.innerHTML = "/";
        console.log(logouttext.innerHTML);
        logouttext.innerHTML = "Login";
    } else {
        let firstletter = currentUserEmail[0];
        profilelogin.innerHTML = firstletter;
    }


    renderPage(); // Call after you get email
}

getCurrentUserEmail();

console.log(currentUserEmail);
logoutbtn.addEventListener("click", () => {
    if (logouttext.innerHTML === "Logout") {
        currentUserEmail = "";
        console.log(currentUserEmail);
    } else {
        window.location.href = "/signup";
    }

});

let pageSize = 6;
let currentPage = 0;
let products = [];
let arr = products;

async function fetchProducts() {
    const res = await fetch("/api/products"); // Node.js backend se GET request
    products = await res.json();
    console.log(products);
    renderPage();
}
fetchProducts();

async function renderPage() {
    console.log("curemtemail", currentUserEmail);
    container.innerHTML = "";
    let start = currentPage * pageSize;
    console.log(products.length);
    let end = Math.min(start + pageSize, products.length);
    console.log("end", end);
    curpage.innerHTML = currentPage + 1;
    console.log("currentPage", currentPage);

    let cartData = {};
    try {
        const res = await fetch("/get-cart?email=" + currentUserEmail);
        cartData = await res.json();
    } catch (err) {
        console.error("Failed to load cart", err);
    }

    let cart = cartData[currentUserEmail] || [];

    for (let i = start; i < end; i++) {
        console.log(i, end);
        const item = products[i];

        const cartItem = cart.find(c => c.product_name === item.product_name);
        const inCartQty = cartItem ? cartItem.quantity : 0;
        const card = document.createElement("div");
        card.className = "card";

        const getControls = (qty) => `
            <div class="controls">
                <button class="minus-btn">-</button>
                <span class="qty">${qty}</span>
                <button class="plus-btn">+</button>
            </div>
        `;

        card.innerHTML = `
            <img src="${item.product_img}" class="product-img" alt="${item.product_name}">
            <div class="display">
                <p><strong>Name:</strong> ${item.product_name}</p>
                <p><strong>Price:</strong> ₹${item.product_price}</p>
                <p><strong>Description:</strong> ${item.product_discription}</p>
                <div class="btn-container">
                    ${inCartQty > 0 ? getControls(inCartQty) : `<button class="add-btn">Add to Cart</button>`}
                </div>
            </div>
        `;

        container.appendChild(card);
        const btnContainer = card.querySelector(".btn-container");
        const addBtn = card.querySelector(".add-btn");
        if (addBtn) {
            addBtn.addEventListener("click", async () => {
                if (!currentUserEmail) return alert("Please login!");

                const newProduct = {
                    product_id: item.product_name,
                    product_name: item.product_name,
                    image: item.product_img,
                    price: item.product_price,
                    description: item.product_discription,
                    quantity: 1
                };
                console.log(currentUserEmail);
                await fetch("/add-to-cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: currentUserEmail, product: newProduct })
                });


                btnContainer.innerHTML = getControls(1);
                attachQtyButtons(btnContainer, newProduct); // Attach +/-
            });
        }

        // HANDLE EXISTING CART CONTROLS
        if (inCartQty > 0) {
            attachQtyButtons(btnContainer, {
                product_id: item.id,
                product_name: item.product_name,
                image: item.product_img,
                price: item.product_price,
                description: item.product_discription,
                quantity: inCartQty
            });
        }
    }

    // ========== 👇 Quantity Button Events Handler ==========
    function attachQtyButtons(container, product) {
        const minusBtn = container.querySelector(".minus-btn");
        const plusBtn = container.querySelector(".plus-btn");
        const qtySpan = container.querySelector(".qty");

        plusBtn.addEventListener("click", async () => {
            const maxQty = parseInt(products.find(p => p.product_name === product.product_name).product_quantity);
console.log(maxQty);
            if (product.quantity < maxQty) {
                product.quantity += 1;
                qtySpan.textContent = product.quantity;

                await fetch("/add-to-cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: currentUserEmail, product })
                });
            } else {
                alert("Stock out! Maximum available quantity reached.");
            }
        });
        minusBtn.addEventListener("click", async () => {
            if (product.quantity > 1) {
                product.quantity -= 1;
                qtySpan.textContent = product.quantity;

                await fetch("/add-to-cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: currentUserEmail, product })
                });
            } else {
                // Remove product from cart if quantity = 0
                await fetch("/remove-from-cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: currentUserEmail, product_id: product.product_id })
                });

                container.innerHTML = `<button class="add-btn">Add to Cart</button>`;
                const addBtn = container.querySelector(".add-btn");
                addBtn.addEventListener("click", async () => {
                    product.quantity = 1;
                    await fetch("/add-to-cart", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: currentUserEmail, product })
                    });
                    container.innerHTML = getControls(1);
                    attachQtyButtons(container, product);
                });
            }
        });
    }
}

renderPage();

const left = document.querySelector(".leftbtn");
const right = document.querySelector(".right");

left.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        renderPage();
    }
});
right.addEventListener("click", () => {
    console.log(pageSize, products.length);
    if ((currentPage + 1) * pageSize < products.length) {
        console.log("currentPage", currentPage);
        currentPage++;
        renderPage();
    }
});

renderPage();

cartbtn.addEventListener("click", () => {
    if (!currentUserEmail) {
        alert("Please login first!");
        return;
    }

});