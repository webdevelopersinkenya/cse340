/******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const session = require("express-session");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash");
// Import the pool directly to pass to connect-pg-simple
const pool = require("./database"); // PostgreSQL connection pool
// Import utility functions (e.g., getNav, handleErrors)
const utilities = require('./utilities/');

// Route Imports
const staticRoutes = require("./routes/static");
const baseRoute = require("./routes/baseRoute");
const accountRoute = require("./routes/accountRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const errorRoute = require("./routes/errorRoute"); // Assuming this is for explicit error paths

// Check if DATABASE_URL is loaded (for debugging during deployment)
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL ? "Yes" : "No - Check .env file or Render config");

/* ***********************
 * Create Express App
 *************************/
const app = express();

/* ***********************
 * View Engine and Layouts
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Sets the default layout for all views
app.set("views", path.join(__dirname, "views")); // Correctly sets the views directory

/* ***********************
 * Static Files Middleware
 * Serves files like CSS, JS, images from the 'public' directory
 *************************/
app.use(express.static(path.join(__dirname, "public")));

/* ***********************
 * Session Middleware
 * Configures session management using PostgreSQL
 *************************/
app.use(session({
  store: new (require("connect-pg-simple")(session))({
    pool: pool, // Pass the PostgreSQL connection pool
    tableName: 'session', // Optional: specify table name for sessions
    createTableIfMissing: true, // Automatically creates the session table if it doesn't exist
  }),
  secret: process.env.SESSION_SECRET || "super-secret-default-key-please-change", // Highly recommend using a strong secret from .env
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something is stored
  name: "sessionId", // Name of the session ID cookie
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  }
}));

/* ***********************
 * Body Parser Middleware
 * For parsing application/x-www-form-urlencoded data
 *************************/
app.use(express.urlencoded({ extended: true })); // Set extended to true for rich objects/arrays

/* ***********************
 * Flash Messages Middleware
 * For displaying one-time messages to the user
 *************************/
app.use(flash());
app.use((req, res, next) => {
  // Pass flash messages to res.locals for easy access in templates
  res.locals.messages = require('express-messages')(req, res);
  // Example for a custom 'notice' message that could be shown globally
  res.locals.notice = req.flash('notice');
  next();
});

/* ***********************
 * Routes
 * Order matters here: specific routes before general ones, and ALL routes before 404 handler
 *************************/

// Account routes
app.use("/account", accountRoute);

// Inventory routes
app.use("/inventory", inventoryRoute);
app.use("/inv", inventoryRoute); // Optional alternate route

// Sample inventory add page (assuming this is part of inventory management)
// This should ideally be within your inventoryRoute or a dedicated controller
app.get('/inventory/add', utilities.handleErrors(async (req, res) => {
  // Ensure buildClassificationList is defined in utilities/index.js and handles errors
  const classificationList = await utilities.buildClassificationList();
  res.render('inventory/add-inventory', { // Assuming add-inventory is in a subfolder 'inventory'
    title: "Add New Inventory", // Add a title for the page
    nav: await utilities.getNav(), // Pass nav for layout
    classificationList: classificationList,
    // Provide default empty values for form fields to prevent EJS errors on first load
    inv_make: '',
    inv_model: '',
    inv_year: '',
    inv_price: '',
    inv_miles: '',
    inv_color: '',
    inv_image: '',
    inv_thumbnail: '',
    errors: null, // For validation errors, if any
  });
}));

// Custom pages - Corrected typos
app.get("/custom", utilities.handleErrors(async (req, res) => {
  res.render("custom", { title: "Custom Vehicles", nav: await utilities.getNav() });
}));
app.get("/sedan", utilities.handleErrors(async (req, res) => { // Corrected from /sidan
  res.render("sedan", { title: "Sedan Vehicles", nav: await utilities.getNav() });
}));
app.get("/suv", utilities.handleErrors(async (req, res) => {
  res.render("suv", { title: "SUV Vehicles", nav: await utilities.getNav() });
}));
app.get("/truck", utilities.handleErrors(async (req, res) => { // Corrected from /track
  res.render("truck", { title: "Truck Vehicles", nav: await utilities.getNav() });
}));

// Base route (Home page) - Must be last among your specific routes to avoid catching others
app.use("/", baseRoute); // This should contain your app.get('/') for the homepage

// Explicit error route (if you have one for specific error pages)
app.use("/error", errorRoute);

/* ***********************
 * 404 Not Found Handler
 * This middleware catches all requests that did not match any defined routes above.
 * MUST be placed AFTER all valid routes.
 *************************/
app.use((req, res, next) => {
  // Create a 404 error and pass it to the error handling middleware
  const error = new Error("Page not found");
  error.status = 404;
  next(error); // Pass the error to the next middleware (global error handler)
});

/* ***********************
 * Global Error Handler
 * This middleware catches any errors passed via next(error) from other middleware or routes.
 * MUST be the LAST middleware in your application.
 *************************/
app.use(utilities.handleErrors(async (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Oh snap! A server error occurred.";

  console.error(`Error ${status}: ${message}`, err.stack); // Log full error for debugging

  // Fetch nav again for the error page, as it's a new request context
  const nav = await utilities.getNav();

  res.status(status).render("errors/error", { // Assuming your error page is at views/errors/error.ejs
    title: `${status} Error`,
    message: message,
    nav: nav,
    // You might want to pass the actual error object only in development for debugging
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
}));

/* ***********************
 * Server Listen
 * Starts the server on the specified port and host
 *************************/
const port = process.env.PORT || 5500; // Use port 5500 as a common development default
const host = process.env.HOST || "0.0.0.0"; // Listen on all network interfaces for Render deployment

app.listen(port, () => {
  console.log(`App listening at http://${host}:${port}`);
});
