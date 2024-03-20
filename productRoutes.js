// productRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("./db"); // import database connection

router.get("/", async (req, res) => {
  try {
    const searchTerm = req.query.names;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const offset = (page - 1) * limit;

    let query, countQueryParams, result, totalCount;

    if (searchTerm) {
      query = "SELECT * FROM products WHERE names LIKE $1 LIMIT $2 OFFSET $3";
      countQueryParams = ["%" + searchTerm + "%"];
    } else {
      query = "SELECT * FROM products LIMIT $1 OFFSET $2";
      countQueryParams = [];
    }

    countQuery = "SELECT COUNT(*) FROM products";
    if (searchTerm) {
      countQuery += " WHERE names LIKE $1";
    }
    totalCount = await pool.query(countQuery, countQueryParams);

    // Retrieve products with pagination
    result = await pool.query(
      query,
      searchTerm ? ["%" + searchTerm + "%", limit, offset] : [limit, offset]
    );

    res.json({
      products: result.rows,
      currentPage: page,
      itemsPerPage: limit,
      totalItems: totalCount.rows[0].count,
      totalPages: Math.ceil(totalCount.rows[0].count / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// POST /products
router.post("/", async (req, res) => {
  try {
    const id = uuid(); // Generate UUIDv7 as the product ID
    const { names, description, price, quantity } = req.body;

    const result = await pool.query(
      "INSERT INTO products (id, names, description, price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, names, description, price, quantity]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// GET /products/{id}
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// PUT /products/{id}
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { names, description, price, quantity } = req.body;
    const result = await pool.query(
      "UPDATE products SET names = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *",
      [names, description, price, quantity, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// DELETE /products/{id}
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json({ message: "Product deleted successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Export router to be used in main file
module.exports = router;
