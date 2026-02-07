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

// Task 10: Get all books using Promise callbacks
public_users.get('/', function (req, res) {
  // Create a promise to get all books
  const getAllBooks = new Promise((resolve, reject) => {
    try {
      if (books && Object.keys(books).length > 0) {
        const formattedBooks = JSON.stringify(books, null, 2);
        resolve(formattedBooks);
      } else {
        reject(new Error("No books found in the database"));
      }
    } catch (error) {
      reject(error);
    }
  });

  // Handle the promise with callbacks
  getAllBooks
    .then((formattedBooks) => {
      return res.status(200).send(formattedBooks);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error retrieving books",
        error: error.message
      });
    });
});

// Task 11: Get book by ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Create a promise to get book by ISBN
  const getBookByISBN = new Promise((resolve, reject) => {
    // Simulate async operation with setTimeout
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        const bookDetails = JSON.stringify({
          isbn: isbn,
          author: book.author,
          title: book.title,
          reviews: book.reviews
        }, null, 2);
        resolve(bookDetails);
      } else {
        reject(new Error(`Book with ISBN ${isbn} not found`));
      }
    }, 100); // Simulate async delay
  });

  // Handle the promise with callbacks
  getBookByISBN
    .then((bookData) => {
      return res.status(200).send(bookData);
    })
    .catch((error) => {
      return res.status(404).json({
        message: error.message
      });
    });
});

// Task 12: Get books by author using Promise callbacks
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  // Create a promise to get books by author
  const getBooksByAuthor = new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksByAuthor = {};
      const isbns = Object.keys(books);

      // Filter books by author
      for (const isbn of isbns) {
        if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
          booksByAuthor[isbn] = books[isbn];
        }
      }

      if (Object.keys(booksByAuthor).length > 0) {
        const formattedBooks = JSON.stringify({
          booksbyauthor: booksByAuthor
        }, null, 2);
        resolve(formattedBooks);
      } else {
        reject(new Error(`No books found by author: ${author}`));
      }
    }, 100);
  });

  // Handle the promise with callbacks
  getBooksByAuthor
    .then((authorBooks) => {
      return res.status(200).send(authorBooks);
    })
    .catch((error) => {
      return res.status(404).json({
        message: error.message
      });
    });
});

// Task 13: Get books by title using Promise callbacks
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  // Create a promise to get books by title
  const getBooksByTitle = new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksByTitle = {};
      const isbns = Object.keys(books);

      // Filter books by title
      for (const isbn of isbns) {
        if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
          booksByTitle[isbn] = books[isbn];
        }
      }

      if (Object.keys(booksByTitle).length > 0) {
        const formattedBooks = JSON.stringify({
          booksbytitle: booksByTitle
        }, null, 2);
        resolve(formattedBooks);
      } else {
        reject(new Error(`No books found with title: ${title}`));
      }
    }, 100);
  });

  // Handle the promise with callbacks
  getBooksByTitle
    .then((titleBooks) => {
      return res.status(200).send(titleBooks);
    })
    .catch((error) => {
      return res.status(404).json({
        message: error.message
      });
    });
});

// Task 5: Get book review using async/await
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Using async function with await
  const getBookReviewAsync = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          const reviewData = {
            isbn: isbn,
            title: book.title,
            reviews: book.reviews || {}
          };
          const formattedReview = JSON.stringify(reviewData, null, 2);
          resolve(formattedReview);
        } else {
          reject(new Error(`Book with ISBN ${isbn} not found`));
        }
      }, 100);
    });
  };

  // Call the async function
  getBookReviewAsync()
    .then((reviews) => {
      return res.status(200).send(reviews);
    })
    .catch((error) => {
      return res.status(404).json({
        message: error.message
      });
    });
});

module.exports.general = public_users;