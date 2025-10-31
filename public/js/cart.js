const header = document.querySelector(".btn");
const cardView = document.querySelector(".cardView");
const checkoutamount = document.querySelector(".checkoutamount")
const totalamount = document.querySelector(".totalamount");
const checkout = document.querySelector(".checkout");
const checkoutpayment = document.querySelector(".checkoutpayment");
const crossbtn = document.querySelector(".crossbtn");
const amountofpay = document.querySelector(".amountofpay");

checkoutpayment.style.display = "none";

crossbtn.addEventListener("click", crossbtnfun);
checkout.addEventListener("click", checkoutfun);

let currentUserCart = "";
let products=[];
let currentUserEmail = "";

async function getCurrentUserEmail() {
    const res = await fetch("/api/current-user");
    const data = await res.json();
    currentUserEmail = data.email;
    console.log("Current Email:", currentUserEmail);
}

getCurrentUserEmail();


async function userEmailcart() {
    const res = await fetch("/api/userEmailcart");
    const data = await res.json();
    currentUserCart = data.currentEmailcart;
    cartshow(currentUserCart);
}

userEmailcart();


async function fetchAllProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    products = data; // ✅ plain array
}



async function saveCartToServer() {
    console.log(currentUserCart,currentUserEmail);
    await fetch("/api/update-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: currentUserEmail,
            cart: currentUserCart,
        }),
    });
}




function cartshow(currentUserCart) {
    cardView.style.display = "flex";

    if (currentUserCart.length === 0) {
        cardView.innerHTML = `<h3>Your cart is empty.</h3>`;
        totalamount.innerHTML = "";
        return;
    }

    let html = "";
    let total = 0;

    currentUserCart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        console.log("index:".index)
        html += `
        <div class="cart-item">
            <strong>${item.product_name}</strong> <br>
            Price: ₹${item.price} × 
            <button class="minusbtn" data-index="${index}">-</button>
            <span class="cartqty">${item.quantity}</span>
            <button class="plusbtn" data-index="${index}">+</button>
            = ₹${itemTotal}
            <button class="removebtn" data-index="${index}">Remove</button>
        </div>
        `;
    });

    totalamount.innerHTML = `<h3>₹${total}</h3>`;
    cardView.innerHTML = html;

    // Add event listeners
    addCartEventListeners();
}

// Add plus/minus event listeners
function addCartEventListeners() {
    cardView.querySelectorAll('.plusbtn').forEach(btn => {
        btn.addEventListener('click', async function () {

            const index = +this.dataset.index;

           const cartItem = currentUserCart[index];
            const productData = products.find(p => p.product_name === cartItem.product_name);
            const maxQty = parseInt(productData.product_quantity);

            // ✅ Stock check
            if (cartItem.quantity < maxQty) {
                currentUserCart[index].quantity += 1;

                await saveCartToServer();
                cartshow(currentUserCart);
            } else {
                alert("Stock out! Maximum available quantity reached.");
            }
            
        });
    });

    cardView.querySelectorAll('.minusbtn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const index = +this.dataset.index;
            if (currentUserCart[index].quantity > 1) {
                currentUserCart[index].quantity -= 1;
            } else {
                currentUserCart.splice(index, 1);
            }
            await saveCartToServer();
           cartshow(currentUserCart);
        });
    });

    cardView.querySelectorAll('.removebtn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const index = +this.dataset.index;
            currentUserCart.splice(index, 1);
            await saveCartToServer();
            cartshow(currentUserCart);
        });
    });
}

window.onload = async () => {
      await fetchAllProducts();
    await getCurrentUserEmail();
     await userEmailcart();
};


function checkoutfun() {
    checkoutpayment.style.display = "block";

    header.style.backdropFilter = "blur(10px)";
    header.style.filter = "blur(1.5px)";
    header.style.pointerEvents = "none";

    cardView.style.backdropFilter = "blur(10px)";
    cardView.style.filter = "blur(1.5px)";
    cardView.style.pointerEvents = "none";

    checkoutamount.style.backdropFilter = "blur(10px)";
    checkoutamount.style.filter = "blur(1.5px)";
    checkoutamount.style.pointerEvents = "none";
    amountofpay.innerHTML=totalamount.innerHTML;
}

function crossbtnfun() {
    checkoutpayment.style.display = "none";

    header.style.backdropFilter = "none";
    header.style.filter = "none";
    header.style.pointerEvents = "auto";

    cardView.style.backdropFilter = "none";
    cardView.style.filter = "none";
    cardView.style.pointerEvents = "auto";

    checkoutamount.style.backdropFilter = "none";
    checkoutamount.style.filter = "none";
    checkoutamount.style.pointerEvents = "auto";
}

