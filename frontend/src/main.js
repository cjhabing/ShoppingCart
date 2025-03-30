let shop = document.getElementById("shop");
let userId = "user123";
let basket = [];

async function fetchCart() {
  try {
    let res = await fetch(`http://localhost:5000/cart/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch cart");
    basket = await res.json();
  } catch (error) {
    console.error("Error fetching cart:", error);
    basket = [];
  }
  generateShop();
  calculation();
}

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

function generateShop() {
  if (!shopItemsData.length) {
    console.error("No products found!");
    return;
  }

  shop.innerHTML = shopItemsData
    .map((x) => {
      let { id, name, desc, img, price } = x;
      let search = basket.find((y) => y.id === id) || { item: 0 };

      return `
      <div id=product-id-${id} class="item">
        <img width="220" src=${img} alt="">
        <div class="details">
          <h3>${name}</h3>
          <p>${desc}</p>
          <div class="price-quantity">
            <h2>$ ${price}</h2>
            <div class="buttons">
              <i onclick="decrement('${id}')" class="bi bi-dash-lg"></i>
              <div id=${id} class="quantity">${search.item}</div>
              <i onclick="increment('${id}')" class="bi bi-plus-lg"></i>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

async function increment(id) {
  let search = basket.find((x) => x.id === id);
  if (!search) {
    basket.push({ id, item: 1 });
  } else {
    search.item += 1;
  }
  update(id);
  await saveCart();
}

async function decrement(id) {
  let search = basket.find((x) => x.id === id);
  if (!search || search.item === 0) return;
  search.item -= 1;
  basket = basket.filter((x) => x.item !== 0);
  update(id);
  await saveCart();
}

function update(id) {
  let search = basket.find((x) => x.id === id);
  document.getElementById(id).innerHTML = search ? search.item : 0;
  calculation();
}

function calculation() {
  let cartIcon = document.getElementById("cartAmount");
  cartIcon.innerHTML = basket.reduce((sum, x) => sum + x.item, 0) || 0;
}

fetchCart();
