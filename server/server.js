const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

require('./config/config');

// Parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve public folder
app.use(express.static(path.resolve(__dirname, './public')));

// Include routes
app.use(require('./routes/index'));

app.listen(
    process.env.PORT,
    () => console.log(`Listening on port ${process.env.PORT}`)
);