let shopItemsData = []; // Declare globally

async function fetchProducts() {
  try {
    let res = await fetch("http://localhost:5000/products"); // Fetch products from backend
    if (!res.ok) throw new Error("Failed to fetch products");
    shopItemsData = await res.json(); // Store products globally

    if (typeof generateShop === "function") {
      generateShop(); // Call if function exists
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

fetchProducts();
