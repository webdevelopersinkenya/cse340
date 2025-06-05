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
const pool = require("./database"); // PostgreSQL connection pool
const utilities = require('./utilities/'); // Import utility functions including handleErrors

// Route Imports
const staticRoutes = require("./routes/static");
const baseRoute = require("./routes/baseRoute");
const accountRoute = require("./routes/accountRoute");
const inventoryRoute = require("./routes/inventoryRoute");
// const errorRoute = require("./routes/errorRoute"); // Assuming this is for explicit error paths if any (often not needed with global handler)

// Check if DATABASE_URL is loaded (for debugging during deployment)
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL ? "Yes" : "No - Check .env file or Render config");

/* ***********************
 * Create Express App
 **************************/
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
  res.locals.notice = req.flash('notice'); // Generic 'notice' flash message
  next();
});

/* ***********************
 * Routes
 * Order matters here: specific routes before general ones, and ALL routes before 404 handler
 *************************/

// ACCOUNT ROUTES - if any are more specific than /inv, put them here
app.use("/account", utilities.handleErrors(accountRoute));

// INVENTORY ROUTES - These are specific to /inventory or /inv
// Make sure these are placed BEFORE the general baseRoute, or they won't be hit.
app.use("/inventory", utilities.handleErrors(inventoryRoute));
app.use("/inv", utilities.handleErrors(inventoryRoute)); // This handles /inv/ for your management page

// CUSTOM PAGES (e.g., /sedan, /truck) - These are also specific, but can be
// before or after inventory routes depending on your desired hierarchy.
// They are fine here.
app.get("/custom", utilities.handleErrors(async (req, res) => {
  res.render("custom", { title: "Custom Vehicles", nav: await utilities.getNav() });
}));
app.get("/sedan", utilities.handleErrors(async (req, res) => {
  res.render("sedan", { title: "Sedan Vehicles", nav: await utilities.getNav() });
}));
app.get("/suv", utilities.handleErrors(async (req, res) => {
  res.render("suv", { title: "SUV Vehicles", nav: await utilities.getNav() });
}));
app.get("/truck", utilities.handleErrors(async (req, res) => {
  res.render("truck", { title: "Truck Vehicles", nav: await utilities.getNav() });
}));

// BASE ROUTE (Home page, /trigger-error) - This is the most general route for '/'
// It should be placed LAST among your *defined* routes, just before the 404 handler.
app.use("/", utilities.handleErrors(baseRoute));

// Explicit error route (if you have one for specific error pages - usually not needed if global handler is robust)
// app.use("/error", utilities.handleErrors(errorRoute)); // Uncomment if you have a specific errorRoute router


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
 * It's wrapped in handleErrors to ensure it's robust, especially if getNav is async.
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
    // Pass the actual error object only in development for debugging.
    // In production, avoid exposing stack traces directly to the user.
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
})); // Removed the extraneous semicolon here

/* ***********************
 * Server Listen
 * Starts the server on the specified port and host
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "0.0.0.0"; // Listen on all network interfaces for Render deployment

app.listen(port, () => {
  console.log(`App listening at http://${host}:${port}`);
});
