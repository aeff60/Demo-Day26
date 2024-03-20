const express = require("express");
const router = express.Router();
const pool = require("./db");
const uuid = require("uuid").v4;
const bcrypt = require("bcrypt");

//Register Routes
router.post("/", async (req, res) => {
  try {
    const id = uuid();
    const { username, email, password } = req.body;

    const checkEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkEmail.rows.length > 0) {
      return res.status(401).json({ error: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, username, email, hashedPassword]
    );

    res.json({
      status: "Success",
      message: "User created successfully",
      data: newUser.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
