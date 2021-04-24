const dotenv = require('dotenv');
const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// get environment variables
dotenv.config();
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
const dbUri = process.env.SERVER_DB_URI;

// setup connection with mongo db
mongoose.connect(dbUri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(
        () => {
            console.log('Connection with mongodb established!');
            mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
        },
        (err) => {
            console.log('Error with mongodb connection: ' + err.message);
        }
    );

const db = mongoose.connection;

// initialize express
const app = express();
app.use(cookieParser());
app.use(session({secret: 'hushPuppy', reSave: true}));
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
