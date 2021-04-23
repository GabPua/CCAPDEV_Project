const dotenv = require('dotenv');
const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');

// get environment variables
dotenv.config();
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';

// set connection with db
const db = require('./server');


// initialize express
const app = express();
app.engine('hbs', hbs({extname: '.hbs'}));
app.set('view engine', 'hbs');

// routes
const home_route = require('./routes/home_route');

app.use('/public', express.static('public'));
app.use('/', home_route);

// Error 404: File not found
app.use(function (req, res) {
    res.status(404).send('File not in server!');
});

// initialize server
app.listen(port, hostname,() => {
    console.log('Server running at: ');
    console.log('http://' + hostname + ':' + port + '\n');
});
