require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Configure AWS DynamoDB for Production (Real AWS)
AWS.config.update({
  region: "us-east-1", // Change to your AWS region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Load from .env or IAM
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Load from .env or IAM
});

const dynamoDB = new AWS.DynamoDB.DocumentClient(); // ✅ No LocalStack endpoint

// 🛒 1️⃣ Fetch all products from "Products" table
app.get("/products", async (req, res) => {
  try {
    const params = { TableName: "Products" };
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items || []);
  } catch (error) {
    console.error("DynamoDB Error (Products):", error);
    res.status(500).json({ error: "Could not fetch products" });
  }
});

// 🛍️ 2️⃣ Fetch user's cart from "Cart" table
app.get("/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  const params = {
    TableName: "Cart",
    Key: { userId },
  };

  try {
    const data = await dynamoDB.get(params).promise();
    if (!data.Item) return res.json([]);

    const basket = JSON.parse(data.Item.basket || "[]");
    res.json(basket);
  } catch (error) {
    console.error("DynamoDB Error (Cart Fetch):", error);
    res.status(500).json({ error: "Could not fetch cart" });
  }
});

// 🛒 3️⃣ Save/update user cart in "Cart" table
app.post("/cart", async (req, res) => {
  const { userId, basket } = req.body;

  if (!userId || !Array.isArray(basket)) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  const params = {
    TableName: "Cart",
    Item: {
      userId,
      basket: JSON.stringify(basket),
    },
  };

  try {
    await dynamoDB.put(params).promise();
    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("DynamoDB Error (Cart Update):", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
