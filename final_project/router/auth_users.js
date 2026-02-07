const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if username is valid (at least 3 characters, alphanumeric)
  return username && username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

const authenticatedUser = (username, password) => {
  // Check if username and password match records
  const user = users.find(user => user.username === username && user.password === password);
  return !!user;
}

// Task 8: Login endpoint
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username: username }, "fingerprint_customer", { expiresIn: '1h' });

    req.session.accessToken = accessToken;
    req.session.username = username;

    // EXACT FORMAT REQUIRED
    return res.status(200).json({ message: "Login successful!" });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Task 9: Add/Modify review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review || review.trim() === '') {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  const alreadyReviewed = books[isbn].reviews.hasOwnProperty(username);
  books[isbn].reviews[username] = review.trim();

  // SIMPLIFIED OUTPUT
  return res.status(200).json({
    message: `Review ${alreadyReviewed ? 'updated' : 'added'} successfully`
  });
});

// Task 10: Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  delete books[isbn].reviews[username];

  // SIMPLIFIED OUTPUT
  return res.status(200).json({
    message: "Review deleted successfully"
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;