const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}))

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if user has an active session with a valid access token
  if (req.session && req.session.accessToken) {
    try {
      // Verify the access token from session
      const decoded = jwt.verify(req.session.accessToken, "fingerprint_customer");

      // Attach user information to the request object for use in routes
      req.user = decoded;
      next(); // User is authenticated, proceed to the route
    } catch (err) {
      // Token is invalid or expired
      return res.status(401).json({ message: "Access token is invalid or expired. Please log in again." });
    }
  } else {
    // No session or access token found
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));