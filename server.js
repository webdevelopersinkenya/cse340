/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const env = require("dotenv").config();
const path = require("path");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const staticRoutes = require("./routes/static");

// View engine and layout setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(staticRoutes);

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

// Server
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";


app.listen(port, () => {
  console.log(`App listening at http://${host}:${port}`);
});



