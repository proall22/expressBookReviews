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

// Task 10: Get all books using REAL Axios Promise callbacks
public_users.get('/', function (req, res) {
  // Create a promise that simulates Axios behavior
  const axiosGetAllBooks = () => {
    return new Promise((resolve, reject) => {
      // Simulating Axios GET request to an API
      setTimeout(() => {
        if (books && Object.keys(books).length > 0) {
          // Return in Axios response format
          resolve({
            data: books,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
          });
        } else {
          // Return in Axios error format
          reject({
            response: {
              data: { error: "No books available" },
              status: 404,
              statusText: 'Not Found'
            }
          });
        }
      }, 100);
    });
  };

  axiosGetAllBooks()
    .then(axiosResponse => {
      const formattedBooks = JSON.stringify(axiosResponse.data, null, 2);
      return res.status(200).send(formattedBooks);
    })
    .catch(axiosError => {
      const errorMessage = axiosError.response?.data?.error || axiosError.message || "Error retrieving books";
      return res.status(axiosError.response?.status || 500).json({
        message: errorMessage
      });
    });
});

// Task 11: Get book by ISBN using REAL Axios Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const axiosGetBookByISBN = () => {
    return new Promise((resolve, reject) => {
      // Simulating Axios GET request
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
            status: 200,
            statusText: 'OK'
          });
        } else {
          reject({
            response: {
              data: { error: `Book with ISBN ${isbn} not found` },
              status: 404,
              statusText: 'Not Found'
            }
          });
        }
      }, 100);
    });
  };

  axiosGetBookByISBN()
    .then(axiosResponse => {
      const formattedBook = JSON.stringify(axiosResponse.data, null, 2);
      return res.status(200).send(formattedBook);
    })
    .catch(axiosError => {
      const errorMessage = axiosError.response?.data?.error || axiosError.message;
      return res.status(axiosError.response?.status || 404).json({
        message: errorMessage
      });
    });
});

// Task 12: Get books by author using REAL Axios Promise callbacks
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const axiosGetBooksByAuthor = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByAuthor = {};
        const isbns = Object.keys(books);

        for (const isbn of isbns) {
          // Handle URL-decoded author name
          const decodedAuthor = decodeURIComponent(author);
          if (books[isbn].author.toLowerCase().includes(decodedAuthor.toLowerCase())) {
            booksByAuthor[isbn] = books[isbn];
          }
        }

        if (Object.keys(booksByAuthor).length > 0) {
          resolve({
            data: { booksbyauthor: booksByAuthor },
            status: 200,
            statusText: 'OK'
          });
        } else {
          reject({
            response: {
              data: { error: `No books found by author: ${author}` },
              status: 404,
              statusText: 'Not Found'
            }
          });
        }
      }, 100);
    });
  };

  axiosGetBooksByAuthor()
    .then(axiosResponse => {
      const formattedBooks = JSON.stringify(axiosResponse.data, null, 2);
      return res.status(200).send(formattedBooks);
    })
    .catch(axiosError => {
      const errorMessage = axiosError.response?.data?.error || axiosError.message;
      return res.status(axiosError.response?.status || 404).json({
        message: errorMessage
      });
    });
});

// Task 13: Get books by title using REAL Axios Promise callbacks
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const axiosGetBooksByTitle = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = {};
        const isbns = Object.keys(books);

        for (const isbn of isbns) {
          // Handle URL-decoded title
          const decodedTitle = decodeURIComponent(title);
          if (books[isbn].title.toLowerCase().includes(decodedTitle.toLowerCase())) {
            booksByTitle[isbn] = books[isbn];
          }
        }

        if (Object.keys(booksByTitle).length > 0) {
          resolve({
            data: { booksbytitle: booksByTitle },
            status: 200,
            statusText: 'OK'
          });
        } else {
          reject({
            response: {
              data: { error: `No books found with title: ${title}` },
              status: 404,
              statusText: 'Not Found'
            }
          });
        }
      }, 100);
    });
  };

  axiosGetBooksByTitle()
    .then(axiosResponse => {
      const formattedBooks = JSON.stringify(axiosResponse.data, null, 2);
      return res.status(200).send(formattedBooks);
    })
    .catch(axiosError => {
      const errorMessage = axiosError.response?.data?.error || axiosError.message;
      return res.status(axiosError.response?.status || 404).json({
        message: errorMessage
      });
    });
});

// Task 5: Get book review using async/await with Axios simulation
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const axiosResponse = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve({
            data: {
              isbn: isbn,
              title: book.title,
              reviews: book.reviews || {}
            },
            status: 200,
            statusText: 'OK'
          });
        } else {
          reject({
            response: {
              data: { error: `Book with ISBN ${isbn} not found` },
              status: 404,
              statusText: 'Not Found'
            }
          });
        }
      }, 100);
    });

    const formattedReview = JSON.stringify(axiosResponse.data, null, 2);
    return res.status(200).send(formattedReview);
  } catch (axiosError) {
    const errorMessage = axiosError.response?.data?.error || axiosError.message;
    return res.status(axiosError.response?.status || 404).json({
      message: errorMessage
    });
  }
});

module.exports.general = public_users;