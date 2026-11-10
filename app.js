/**
 * Author : Matt Mitchell
 * Modified by : Alex Lew
 * Date : 09-11-2026
 * 
 * Objective :
 * This is an e-commerce application that demonstrates the basic flow of creating a Payment Intent, handling webhooks, and displaying a success page.
 * Modification :
 * To modularise the routes into separate files, for scalability and maintainability.
 */

const express = require('express');
const path = require('path'); 
const exphbs = require('express-handlebars'); 
require('dotenv').config();

var app = express();

// view engine setup (Handlebars)
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }))
// Webhook route
app.use(require('./src/route/webhook')); 
app.use(express.json({}));

// Home route
app.get('/', function(req, res) {
  res.render('index');
});

// Checkout route
app.use(require('./src/route/checkout'));

// Success route
app.use(require('./src/route/success'));

// Start server
app.listen(3000, () => {
  console.log('Getting served on port 3000');
});
