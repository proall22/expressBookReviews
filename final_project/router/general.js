const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // Check if username is valid
  if (!isValid(username)) {
    return res.status(400).json({
      message: "Username must be at least 3 characters long and contain only letters, numbers, and underscores"
    });
  }

  // Check if user already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({
      message: "Username already exists"
    });
  }

  // Register new user
  users.push({ username, password });
  return res.status(201).json({
    message: "User registered successfully. You can now login.",
    username: username
  });
});

// Task 1: Get all books available in the shop
public_users.get('/', function (req, res) {
  // Using Promise with async/await pattern as required
  return new Promise((resolve, reject) => {
    try {
      // Format output neatly with JSON.stringify
      const formattedBooks = JSON.stringify(books, null, 2);
      resolve(formattedBooks);
    } catch (error) {
      reject(error);
    }
  })
    .then(formattedBooks => {
      return res.status(200).send(formattedBooks);
    })
    .catch(error => {
      return res.status(500).json({ message: "Error retrieving books", error: error.message });
    });
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      // Format output neatly with JSON.stringify
      const bookDetails = JSON.stringify({ isbn: isbn, ...book }, null, 2);
      resolve(bookDetails);
    } else {
      reject(new Error("Book not found"));
    }
  })
    .then(bookData => {
      return res.status(200).send(bookData);
    })
    .catch(error => {
      return res.status(404).json({ message: error.message });
    });
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  return new Promise((resolve, reject) => {
    const booksByAuthor = {};

    // Get all keys from books object
    const isbns = Object.keys(books);

    // Iterate through the 'books' array
    for (const isbn of isbns) {
      if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
        booksByAuthor[isbn] = books[isbn];
      }
    }

    if (Object.keys(booksByAuthor).length > 0) {
      // Format output neatly with JSON.stringify
      const formattedBooks = JSON.stringify({ booksbyauthor: booksByAuthor }, null, 2);
      resolve(formattedBooks);
    } else {
      reject(new Error("No books found by this author"));
    }
  })
    .then(authorBooks => {
      return res.status(200).send(authorBooks);
    })
    .catch(error => {
      return res.status(404).json({ message: error.message });
    });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  return new Promise((resolve, reject) => {
    const booksByTitle = {};

    // Get all keys from books object
    const isbns = Object.keys(books);

    // Iterate through the 'books' array
    for (const isbn of isbns) {
      if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
        booksByTitle[isbn] = books[isbn];
      }
    }

    if (Object.keys(booksByTitle).length > 0) {
      // Format output neatly with JSON.stringify
      const formattedBooks = JSON.stringify({ booksbytitle: booksByTitle }, null, 2);
      resolve(formattedBooks);
    } else {
      reject(new Error("No books found with this title"));
    }
  })
    .then(titleBooks => {
      return res.status(200).send(titleBooks);
    })
    .catch(error => {
      return res.status(404).json({ message: error.message });
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Using async/await pattern
  const getBookReview = async () => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        const reviewData = {
          isbn: isbn,
          title: book.title,
          reviews: book.reviews || {}
        };
        // Format output neatly with JSON.stringify
        const formattedReview = JSON.stringify(reviewData, null, 2);
        resolve(formattedReview);
      } else {
        reject(new Error("Book not found"));
      }
    });
  };

  getBookReview()
    .then(reviews => {
      return res.status(200).send(reviews);
    })
    .catch(error => {
      return res.status(404).json({ message: error.message });
    });
});

module.exports.general = public_users;