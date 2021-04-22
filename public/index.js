const dotenv = require('dotenv');
const express = require("express");
const bodyParser = require('body-parser');

// initialize express
const app = express();
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended: false}));

// configure server
dotenv.config();
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

// routes
const home_route = require('../routes/home_route');

app.use('/public', express.static('public'));
app.use('/', home_route);

app.use(function (req, res, next) {
    res.status(404).send('File not in server!');
});

app.listen(port, hostname, function (req, res) {
    console.log('Server running at: ');
    console.log('http://' + hostname + ':' + port);
});
