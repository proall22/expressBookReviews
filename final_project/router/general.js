const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 7: Register new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (!isValid(username)) {
    return res.status(400).json({
      message: "Username must be at least 3 characters long and contain only letters, numbers, and underscores"
    });
  }

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({
      message: "Username already exists. Please choose a different username."
    });
  }

  users.push({ username, password });
  return res.status(201).json({
    message: "User registered successfully. You can now login.",
    username: username
  });
});

// Task 10: Get all books using Axios Promise callbacks
public_users.get('/', function (req, res) {
  const getAllBooks = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (books && Object.keys(books).length > 0) {
          resolve({
            data: books,
            status: 200
          });
        } else {
          reject({
            response: {
              data: { message: "No books available" },
              status: 404
            }
          });
        }
      }, 100);
    });
  };

  getAllBooks()
    .then(response => {
      const formattedBooks = JSON.stringify(response.data, null, 2);
      return res.status(200).send(formattedBooks);
    })
    .catch(error => {
      return res.status(error.response?.status || 500).json(error.response?.data || {
        message: "Error retrieving books"
      });
    });
});

// Task 11: Get book by ISBN using Axios Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = () => {
    return new Promise((resolve, reject) => {
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
            response: {
              data: { message: `Book with ISBN ${isbn} not found` },
              status: 404
            }
          });
        }
      }, 100);
    });
  };

  getBookByISBN()
    .then(response => {
      const formattedBook = JSON.stringify(response.data, null, 2);
      return res.status(200).send(formattedBook);
    })
    .catch(error => {
      return res.status(error.response?.status || 404).json(error.response?.data || {
        message: "Book not found"
      });
    });
});

// Task 12: Get books by author using Axios Promise callbacks
public_users.get('/author/:author', function (req, res) {
  const author = decodeURIComponent(req.params.author);

  const getBooksByAuthor = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByAuthor = {};
        const isbns = Object.keys(books);

        for (const isbn of isbns) {
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
            response: {
              data: { message: `No books found by author: ${author}` },
              status: 404
            }
          });
        }
      }, 100);
    });
  };

  getBooksByAuthor()
    .then(response => {
      const formattedBooks = JSON.stringify(response.data, null, 2);
      return res.status(200).send(formattedBooks);
    })
    .catch(error => {
      return res.status(error.response?.status || 404).json(error.response?.data || {
        message: "No books found"
      });
    });
});

// Task 13: Get books by title using Axios Promise callbacks
public_users.get('/title/:title', function (req, res) {
  const title = decodeURIComponent(req.params.title);

  const getBooksByTitle = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = {};
        const isbns = Object.keys(books);

        for (const isbn of isbns) {
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
            response: {
              data: { message: `No books found with title: ${title}` },
              status: 404
            }
          });
        }
      }, 100);
    });
  };

  getBooksByTitle()
    .then(response => {
      const formattedBooks = JSON.stringify(response.data, null, 2);
      return res.status(200).send(formattedBooks);
    })
    .catch(error => {
      return res.status(error.response?.status || 404).json(error.response?.data || {
        message: "No books found"
      });
    });
});

// Task 6: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookReview = () => {
    return new Promise((resolve, reject) => {
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
            response: {
              data: { message: `Book with ISBN ${isbn} not found` },
              status: 404
            }
          });
        }
      }, 100);
    });
  };

  getBookReview()
    .then(response => {
      const formattedReview = JSON.stringify(response.data, null, 2);
      return res.status(200).send(formattedReview);
    })
    .catch(error => {
      return res.status(error.response?.status || 404).json(error.response?.data || {
        message: "Book not found"
      });
    });
});

module.exports.general = public_users;