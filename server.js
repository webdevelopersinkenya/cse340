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
const { buildClassificationList } = require('./utilities/index');
const pool = require("./database");  // PostgreSQL connection pool

// Route Imports
const staticRoutes = require("./routes/static");
const baseRoute = require("./routes/baseRoute");
const accountRoute = require("./routes/accountRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const errorRoute = require("./routes/errorRoute");
const { body, validationResult } = require('express-validator');

console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

/* ***********************
 * Create Express App
 *************************/
const app = express();

/* ***********************
 * View Engine and Layouts
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.set("views", path.join(__dirname, "views"));

/* ***********************
 * Static Files
 *************************/
app.use(express.static(path.join(__dirname, "public")));

/* ***********************
 * Session Middleware
 *************************/
app.use(session({
  store: new (require("connect-pg-simple")(session))({
    pool: pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || "defaultSecret",
  resave: true,
  saveUninitialized: true,
  name: "sessionId",
}));

/* ***********************
 * Middleware
 *************************/
app.use(express.urlencoded({ extended: false }));

// Flash Messages Middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes);
app.use("/", baseRoute);
app.use("/account", accountRoute);
app.use("/inventory", inventoryRoute);
app.use("/inv", inventoryRoute); // Optional alternate route

// Sample inventory add page (move to a controller in the future)
app.get('/inventory/add', async (req, res) => {
  const classificationList = await buildClassificationList();
  res.render('add-inventory', {
    classificationList,
    inv_make: '',
    inv_model: '',
    inv_year: '',
    inv_price: '',
    inv_miles: '',
    inv_color: '',
    inv_image: '',
    inv_thumbnail: '',
  });
});

// Custom pages
app.get("/custom", (req, res) => {
  res.render("custom", { title: "Custom Vehicles" });
});
app.get("/sidan", (req, res) => {
  res.render("sidan", { title: "Sedan Vehicles" });
});
app.get("/suv", (req, res) => {
  res.render("suv", { title: "SUV Vehicles" });
});
app.get("/track", (req, res) => {
  res.render("track", { title: "Truck Vehicles" });
});

// Error route
app.use("/error", errorRoute);

/* ***********************
 * 404 and Global Error Handlers
 *************************/
// 404 handler
app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.status = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).render("errors/error", {
    title: `${status} Error`,
    message: err.message,
    error: err,
  });
});

/* ***********************
 * Server Listen
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening at http://${host}:${port}`);
});
