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

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Authenticate the user
  if (authenticatedUser(username, password)) {
    // Create JWT token
    const accessToken = jwt.sign(
      {
        username: username
      },
      "fingerprint_customer", // Secret key (must match index.js)
      { expiresIn: 60 * 60 } // 1 hour expiration
    );

    // Store token in session
    req.session.accessToken = accessToken;
    req.session.username = username;

    return res.status(200).json({
      message: "Login successful",
      username: username
    });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username; // From authentication middleware

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if review is provided
  if (!review || review.trim() === '') {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Check if user already has a review for this book
  const alreadyReviewed = books[isbn].reviews.hasOwnProperty(username);

  // Add or update the review
  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: `Review ${alreadyReviewed ? 'updated' : 'added'} successfully`,
    isbn: isbn,
    title: books[isbn].title,
    review: review,
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // From authentication middleware

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if user has a review for this book
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    isbn: isbn,
    title: books[isbn].title,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;