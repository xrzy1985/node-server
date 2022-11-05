const express = require('express');
const dotenv = require('dotenv').config();
const routes = require('./routes/users');
const auth = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3200;


app.use(express.json());

// Services: /users
app.use(process.env.USERS, routes);
app.use(process.env.AUTHENTICATION, auth);

/**
 * @description Port listener
 */
app.listen(port, () => {
    console.log(`Listening on the port: ${port}`);
});