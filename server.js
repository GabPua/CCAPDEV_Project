const mongoose = require('mongoose');
const dbUri = process.env.SERVER_DB_URI;

// setup connection with mongodb
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

module.exports = mongoose.connection;
