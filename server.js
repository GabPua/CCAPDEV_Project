const dotenv = require('dotenv');
const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoStore = require('connect-mongodb-session')(session);

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

// configure user session
app.use(session({
    secret: 'hushPuppy',
    resave: false,
    saveUninitialized: false,
    rolling: true,      // refresh cookie age
    cookie: {
        maxAge: 12096e5 // two weeks
    },
    store: store
}));

// make session visible to all hbs pages
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// instantiate models
// const userModel = require('./models/user');
// const recipeModel = require('./models/recipe');
// const commentModel = require('./models/comment');

// routes
const home_route = require('./routes/home_route');

app.use('/public', express.static('public'));
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
