const express = require('express');

const app = express();

app.use(express.json());

const api = require('./routes/users');

const port = process.env.PORT || 3200;

app.use('/users', api);

/**
 * @description Port listener
 */
app.listen(port, () => {
    console.log(`Listening on the port: ${port}`);
});