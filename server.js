const dotenv = require('dotenv');
const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const db = require('./models/db');
const mongoStore = require('connect-mongodb-session')(session);

// get environment variables
dotenv.config();
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
const dbUri = process.env.SERVER_DB_URI;

db.connect(dbUri);

// storage for user sessions
const store = new mongoStore({
    uri: dbUri,
    databaseName: 'shefhub',
    collection: 'session'
});

store.on('error', (error) => {
    console.log(error.message);
});

// initialize and configure express
const app = express();
app.engine('hbs', hbs({extname: '.hbs'}));
app.set('view engine', 'hbs');
app.use(cookieParser());

// configure user session
app.use(session({
    key: 'user_sid',
    secret: 'hushPuppy',
    resave: false,
    saveUninitialized: false,
    rolling: true,      // refresh cookie age
    cookie: {
        maxAge: 12096e5 // two weeks
    },
    store: store
}));

app.use((req, res, next) => {
    // make session visible to all hbs pages
    res.locals.session = req.session;
    next();
});

app.use(express.urlencoded());
app.use(express.json());

// instantiate models
// const userModel = require('./models/user');
// const recipeModel = require('./models/recipe');
// const commentModel = require('./models/comment');

// routes
const home_route = require('./routes/home_route');
const signup_route = require('./routes/signup_route');

app.use('/public', express.static('public'));
app.use('/signup', signup_route);
app.use('/', home_route);

// Error 404: File not found
app.use((req, res) => {
    res.status(404).send('File not in server!');
});

// initialize server
app.listen(port, hostname,() => {
    console.log('Server running at: ');
    console.log('http://' + hostname + ':' + port + '\n');
});
