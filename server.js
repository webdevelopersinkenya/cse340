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
const cookieParser = require("cookie-parser"); // ADD THIS LINE: Require cookie-parser

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
 * Middleware
 *************************/
app.use(cookieParser()); // ADD THIS LINE: Apply cookie-parser middleware
app.use(utilities.checkJWTToken); // ADD THIS LINE: Apply JWT token validation middleware (defined in utilities/index.js)


// ... (previous require statements and middleware) ...

/* ***********************
 * Routes
 * Order matters here: specific routes before general ones, and ALL routes before 404 handler
 *************************/

// 1. ACCOUNT ROUTES (e.g., /account/login, /account/register, /account/)
// These should generally come first if they are specific prefixes.
app.use("/account", utilities.handleErrors(accountRoute));

// 2. INVENTORY ROUTES (e.g., /inv/, /inv/add-classification, /inv/detail/:id, etc.)
// THESE MUST BE BEFORE THE BASE ROUTE "/"
app.use("/inventory", utilities.handleErrors(inventoryRoute));
app.use("/inv", utilities.handleErrors(inventoryRoute)); // This line specifically mounts the inventory router at /inv

// 3. OTHER SPECIFIC PAGES (e.g., /custom, /sedan, /suv, /truck)
// These are also specific GET requests, and are fine here.
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

// 4. BASE ROUTE (Home page, /trigger-error)
// This is the most general route for '/', and it must come LAST among your defined routes.
// If it's above /inv, it will catch requests like /inv/ before /inv does.
app.use("/", utilities.handleErrors(baseRoute));

// ... (Explicit error route, if you have one and want to enable it) ...
// app.use("/error", utilities.handleErrors(errorRoute));

/* ***********************
 * 404 Not Found Handler
 * This middleware catches all requests that did not match any defined routes above.
 * MUST be placed AFTER all valid routes.
 *************************/
app.use((req, res, next) => {
    const error = new Error("Page not found");
    error.status = 404;
    next(error);
});

/* ***********************
 * Global Error Handler
 * This middleware catches any errors passed via next(error) from other middleware or routes.
 * MUST be the LAST middleware in your application.
 *************************/
app.use(utilities.handleErrors(async (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Oh snap! A server error occurred.";

  console.error(`Error ${status}: ${message}`, err.stack);

  const nav = await utilities.getNav();

  res.status(status).render("errors/error", {
    title: `${status} Error`,
    message: message,
    nav: nav,
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
}));

// ... (app.listen) ...


/* ***********************
 * Server Listen
 * Starts the server on the specified port and host
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "0.0.0.0"; // Listen on all network interfaces for Render deployment

app.listen(port, () => {
  console.log(`App listening at http://${host}:${port}`);
});
