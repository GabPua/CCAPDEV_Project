const dotenv = require('dotenv');
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoStore = require('connect-mongodb-session')(session);
const fileUpload = require('express-fileupload');

// get environment variables
dotenv.config();
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
const dbUri = process.env.SERVER_DB_URI;
const secret = process.env.SECRET || 'hushPuppy123';
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};

mongoose.connect(dbUri, options, (err) => {
    console.log(err? err : 'Established connection with mongodb!');
});

// storage for user sessions
const store = new mongoStore({
    uri: dbUri,
    databaseName: 'shefhub',
    collection: 'session'
});

store.on('error', (error) => {
    console.log(error.message);
});

// configure hbs
const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        isEqual: (arg1, arg2) => {
            return arg1 === arg2;
        },

        ifMod: (a, b, c, options) => {
            return a % b === c? options.fn(this) : options.inverse(this);
        },

        parseMinToHHMM: (m1, m2) => {
            let m = m1 + m2;
            const h = Math.floor(m / 60);
            m %= 60;

            let minute = '', hour = '';
            if (h === 1) {
                hour = '1 hour ';
            } else if (h > 1) {
                hour = h + ' hours ';
            }

            if (m === 1) {
                minute = '1 minute';
            } else if(m > 1) {
                minute = m + ' minutes';
            }

            return hour + minute;
        },

        formatDate: (date) => {
            return date.toLocaleString();
        },

        getHr: (time) => {
            return Math.floor(time??0 / 60);
        },

        getMin: (time) => {
            return time??0 % 60;
        },

        range: (start, end, block) => {
            let accum = '';

            for (let i = start; i < end; i++) {
                accum += block.fn(i);
            }

            return accum;
        },

        timeDiff: (date) => {
            const diff = new Date() - date;
            const year = 31536000000;
            const month = 2592000000;
            const day = 86400000;
            const hour = 3600000;
            const minute = 60000;

            // years ago
            if (diff >= year) {
                return Math.floor(diff / year) + 'y';
            } else if (diff >= month) {
                return Math.floor(diff / month) + 'mo';
            } else if (diff >= day) {
                return Math.floor(diff / day) + 'd';
            } else if (diff >= hour) {
                return Math.floor(diff / hour) + 'h';
            } else if (diff >= minute) {
                return Math.floor(diff / minute) + 'm';
            } else {
                return 'Just Now';
            }
        },

        loopIngredients: (qty, unit, ingredient, block) => {
            let accum = '';

            if (qty) {
                for (let i = 0; i < qty.length; i++) {
                    accum += block.fn({qty: qty[i], unit: unit[i], name: ingredient[i]});
                }
            } else {
                accum = block.inverse(this);
            }

            return accum;
        }
    }
});

// initialize and configure express
const app = express();
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.use(cookieParser());
app.use(fileUpload());

// configure user session
app.use(session({
    key: 'user_sid',
    secret: secret,
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
const home_route = require('./routes/home_route');
const signup_route = require('./routes/signup_route');
const login_route = require('./routes/login_route');
const user_route = require('./routes/user_route');
const post_route = require('./routes/post_route');
const comment_route = require('./routes/comment_route');
const vote_route = require('./routes/vote_route');

app.use('/public', express.static('public'));
app.use('/signup', signup_route);
app.use('/login', login_route);
app.use('/post', post_route);
app.use('/comment', comment_route);
app.use('/vote', vote_route);
app.use('/', home_route);
app.use('/', user_route);

// Error 404: File not found
app.use((req, res) => {
    res.status(404);
    res.render('404');
});

// initialize server
app.listen(port, hostname,() => {
    console.log('Server running at: ');
    console.log('http://' + hostname + ':' + port + '\n');
});
