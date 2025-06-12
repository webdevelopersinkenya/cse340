/*******************************
 * Required modules
 *******************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectPgSimple = require("connect-pg-simple");
const flash = require("connect-flash");
const env = require("dotenv").config();
const path = require("path");
const app = express();

/*******************************
 * Routes and utilities
 *******************************/
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute"); // ✅ Added
const baseController = require("./controllers/baseController");
const utilities = require("./utilities/");
const pool = require("./database/");

/*******************************
 * Session configuration
 *******************************/
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);

/*******************************
 * Middleware
 *******************************/
app.use(cookieParser()); // Must be before using req.cookies
app.use(flash());
app.use(utilities.checkJWTToken); // Uses req.cookies.jwt

/*******************************
 * Local variables middleware
 * Sets variables for all views
 *******************************/
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    res.locals.currentPath = req.path;
    res.locals.accountData = req.session.accountData || null;
    res.locals.loggedin = !!res.locals.accountData;
    res.locals.messages = require("express-messages")(req, res);
    res.locals.notice = req.flash("notice");
    next();
  } catch (error) {
    next(error);
  }
});

/*******************************
 * View Engine and Layouts
 *******************************/
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Relative to /views

/*******************************
 * Built-in Middleware
 *******************************/
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/*******************************
 * Routes
 *******************************/
app.use("/", static);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute); // ✅ Inserted

/*******************************
 * Error Handling
 *******************************/
// 404 handler
app.use(async (req, res, next) => {
  const nav = await utilities.getNav();
  res.status(404).render("errors/error", {
    title: "404 Not Found",
    message: "Sorry, we can't find that page.",
    nav,
  });
});

// General error handler
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  console.error(`Error: ${err.message}`);
  res.status(500).render("errors/error", {
    title: "Server Error",
    message: err.message,
    nav,
  });
});

/*******************************
 * Start Server
 *******************************/
const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`App is listening on http://localhost:${port}`);
});
