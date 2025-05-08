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
const static = require("./routes/static");  

const expressLayouts = require("express-ejs-layouts");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);

app.set("layout", "./layouts/layout"); 

// Set views directory using path module
app.set("views", path.join(__dirname, "views")); 

/* ***********************
 * Routes
 *************************/
// Static files route
app.use(static);

// Index route to render the "index" view with the title
app.get("/", function(req, res){
  res.render("index", { title: "Home" });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});
