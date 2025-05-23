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
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require('../utilities');
const inventoryModel = require('./models/inventory-model');


// View engine and layout setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(staticRoutes);
app.use(express.static('public'));

// Main Routes
app.get("/", baseController.buildHome);

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
app.use("/inv", inventoryRoute)

// Server
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening at http://${host}:${port}`);
});
