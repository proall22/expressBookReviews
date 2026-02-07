const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({
      message: "Username must be at least 3 characters long and contain only letters, numbers, and underscores"
    });
  }

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({
    message: "User registered successfully. You can now login.",
    username: username
  });
});

// Task 10: Get all books using Promise callbacks with Axios simulation
public_users.get('/', function (req, res) {

  const getAllBooksPromise = () => {
    return new Promise((resolve, reject) => {
      // Simulate Axios GET request structure
      setTimeout(() => {
        if (books && Object.keys(books).length > 0) {
          // Axios returns data in { data: ... } format
          resolve({
            data: books,
            status: 200,
            statusText: 'OK'
          });
        } else {
          reject(new Error("No books available"));
        }
      }, 100);
    });
  };

  getAllBooksPromise()
    .then(response => {
      const formattedBooks = JSON.stringify(response.data, null, 2);
      return res.status(200).send(formattedBooks);
    })
    .catch(error => {
      return res.status(500).json({ message: error.message });
    });
});

// Task 11: Get book by ISBN using Promise callbacks with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBNPromise = () => {
    return new Promise((resolve, reject) => {
      // Simulate Axios GET request
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve({
            data: {
              isbn: isbn,
              author: book.author,
              title: book.title,
              reviews: book.reviews
            },
            status: 200
          });
        } else {
          reject({
            message: `Book with ISBN ${isbn} not found`,
            response: { status: 404 }
          });
        }
      }, 100);
    });
  };

  getBookByISBNPromise()
    .then(response => {
      const formattedBook = JSON.stringify(response.data, null, 2);
      return res.status(200).send(formattedBook);
    })
    .catch(error => {
      return res.status(error.response?.status || 404).json({
        message: error.message
      });
    });
});

// Task 12: Get books by author using Promise callbacks with Axios
public_users.get('/author/:author(*)', function (req, res) {  // (*) captures everything including slashes
  const author = req.params.author; // Already decoded by Express

  const getBooksByAuthorPromise = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByAuthor = {};
        const isbns = Object.keys(books);

        for (const isbn of isbns) {
          // Use direct comparison since spaces are preserved
          if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
            booksByAuthor[isbn] = books[isbn];
          }
        }

        if (Object.keys(booksByAuthor).length > 0) {
          resolve({
            data: { booksbyauthor: booksByAuthor },
            status: 200
          });
        } else {
          reject({
            message: `No books found by author: ${author}`,
            response: { status: 404 }
          });
        }
      }, 100);
    });
  };

  getBooksByAuthorPromise()
    .then(response => {
      const formattedBooks = JSON.stringify(response.data, null, 2);
      return res.status(200).send(formattedBooks);
    })
    .catch(error => {
      return res.status(error.response?.status || 404).json({
        message: error.message
      });
    });
});

// Task 13: Get books by title using Promise callbacks with Axios
public_users.get('/title/:title(*)', function (req, res) {  // (*) captures everything including spaces
  const title = req.params.title; // Already decoded by Express

  const getBooksByTitlePromise = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = {};
        const isbns = Object.keys(books);

        for (const isbn of isbns) {
          // Use direct comparison since spaces are preserved
          if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
            booksByTitle[isbn] = books[isbn];
          }
        }

        if (Object.keys(booksByTitle).length > 0) {
          resolve({
            data: { booksbytitle: booksByTitle },
            status: 200
          });
        } else {
          reject({
            message: `No books found with title: ${title}`,
            response: { status: 404 }
          });
        }
      }, 100);
    });
  };

  getBooksByTitlePromise()
    .then(response => {
      const formattedBooks = JSON.stringify(response.data, null, 2);
      return res.status(200).send(formattedBooks);
    })
    .catch(error => {
      return res.status(error.response?.status || 404).json({
        message: error.message
      });
    });
});

// Task 5: Get book review using async/await with Axios simulation
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    // Using async/await with Axios-like promise
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve({
            data: {
              isbn: isbn,
              title: book.title,
              reviews: book.reviews || {}
            },
            status: 200
          });
        } else {
          reject({
            message: `Book with ISBN ${isbn} not found`,
            response: { status: 404 }
          });
        }
      }, 100);
    });

    const formattedReview = JSON.stringify(response.data, null, 2);
    return res.status(200).send(formattedReview);
  } catch (error) {
    return res.status(error.response?.status || 404).json({
      message: error.message
    });
  }
});

module.exports.general = public_users;
