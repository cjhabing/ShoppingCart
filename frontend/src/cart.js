let cartItemsContainer = document.getElementById("shopping-cart");
let label = document.getElementById("label");
let cartIcon = document.getElementById("cartAmount");

let userId = "user123"; // Replace with actual user ID
let basket = [];

// ✅ Fetch Cart Data from Backend (DynamoDB)
async function fetchCart() {
  try {
    let res = await fetch(`http://localhost:5000/cart/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch cart");
    basket = await res.json();
    displayCart();
    calculation();
  } catch (error) {
    console.error("Error fetching cart:", error);
    basket = [];
  }
}

// ✅ Save Cart Data to Backend (DynamoDB)
async function saveCart() {
  try {
    await fetch("http://localhost:5000/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, basket }),
    });
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

// ✅ Display Cart Items
function displayCart() {
  if (!cartItemsContainer) {
    console.error("Element with ID 'shopping-cart' not found.");
    return;
  }

  if (basket.length === 0) {
    label.innerHTML = `<h2>Cart is Empty</h2>
      <a href="index.html"><button class="HomeBtn">Back to home</button></a>`;
    cartItemsContainer.innerHTML = "";
    return;
  }

  cartItemsContainer.innerHTML = basket
    .map((item) => {
      let product = shopItemsData.find((p) => p.id === item.id);
      if (!product) return ""; // If product not found, skip

      return `
      <div class="cart-item">
        <img src="${product.img}" width="100">
        <div class="details">
          <div class="title-price-x">
            <h4 class="title-price">
              <p>${product.name}</p>
              <p class="cart-item-price">$ ${product.price}</p>
            </h4>
            <i onclick="removeItem('${item.id}')" class="bi bi-x-lg"></i>
          </div>
          <div class="buttons">
            <i onclick="decrement('${item.id}')" class="bi bi-dash-lg"></i>
            <div id=${item.id} class="quantity">${item.item}</div>
            <i onclick="increment('${item.id}')" class="bi bi-plus-lg"></i>
          </div>
          <h3>$ ${item.item * product.price}</h3>
        </div>
      </div>
    `;
    })
    .join("");

  TotalAmount();
}

// ✅ Update Cart Icon Count
function calculation() {
  cartIcon.innerHTML = basket.map((x) => x.item).reduce((x, y) => x + y, 0) || 0;
}

// ✅ Increase Item Quantity
async function increment(id) {
  let item = basket.find((x) => x.id === id);
  if (!item) {
    basket.push({ id, item: 1 });
  } else {
    item.item += 1;
  }
  await saveCart();
  fetchCart();
}

// ✅ Decrease Item Quantity
async function decrement(id) {
  let item = basket.find((x) => x.id === id);
  if (!item) return;

  item.item -= 1;
  if (item.item <= 0) {
    basket = basket.filter((x) => x.id !== id);
  }

  await saveCart();
  fetchCart();
}

// ✅ Remove Item from Cart
async function removeItem(id) {
  basket = basket.filter((x) => x.id !== id);
  await saveCart();
  fetchCart();
}

// ✅ Clear Entire Cart
async function clearCart() {
  basket = [];
  await saveCart();
  fetchCart();
}

// ✅ Calculate Total Amount
function TotalAmount() {
  if (basket.length !== 0) {
    let amount = basket
      .map((x) => {
        let search = shopItemsData.find((y) => y.id === x.id) || [];
        return x.item * search.price;
      })
      .reduce((x, y) => x + y, 0);

    label.innerHTML = `
      <h2>Total Bill : $ ${amount}</h2>
      <button class="checkout">Checkout</button>
      <button onclick="clearCart()" class="removeAll">Clear Cart</button>
    `;
  }
}

// ✅ Initial Fetch on Page Load
fetchCart();
