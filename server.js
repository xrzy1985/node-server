const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.json());

const port = process.env.PORT || 3200;
const paths = JSON.parse(fs.readFileSync('./db/config/paths.json')).paths;
const users = JSON.parse(fs.readFileSync('./db/users/users.json')).users;

/** @todo add to constants file */
const urls = { users: '/api/users' };

/**
 * @description Response that specifies what paths can be reached
 * @method GET
 * @returns { status: number, data: { type: string } }
 */
app.get('/', (req, res) => { res.send(response(200, paths)); });

/**
 * @description To return all users
 * @method GET
 * @return { status: number, data: object[] }
 */
app.get(`${urls.users}`, (req, res) => {
    res.send(response(getStatus(users), users, 'users'));
});

/**
 * @description To return a user associated with the given id
 * @method GET
 * @requestParams id: number
 * @returns { id: number, name: string, email: string, dob: string, friendsList: user[] }
 */
app.get(`${urls.users}/:id`, (req, res) => {
    const user = getUser(req.params.id);
    res.send(response(getStatus(user), user, 'users'));
});

/**
 * @description To add a user to the users file
 * @method POST
 * @body { name: string, email: string, dob: string }
 */
app.post(`${urls.users}`, (req, res) => {
    let writeToJson = {
        users: [ 
            ...users, {
            id: users.length + 1,
            ...req.body,
            friendsList: []
        }]
    };
    try {
        fs.writeFileSync(`./db/users/users.json`, JSON.stringify(writeToJson));
        res.send({status: 200, message: 'Success'});
    } catch (error) {
        res.send({status: 400, message: 'There was an issue adding the user.'});
    }
});

/**
 * @description To return a payload object for a server response
 * @function response
 * @params status: number, payload: object, type: string
 * @returns { status: number, data: object[] } { status: number, error: string }
 */
function response(status, payload, type) {
    return status === 400 ?
        { status: status, error: `Error: No ${type} found.` } :
        { status: status, data: payload };
}

/**
 * @description To return the server status
 * @function getStatus
 * @params payload: object
 * @returns number
 */
function getStatus(payload) { return payload ? 200 : 400; }

/**
 * @description Helper function to return a user associated with the id param
 * @function getUser
 * @params id: number
 * @returns { id: number, name: string, email: string, dob: string, friendsList: user[] }
 */
function getUser(id) { return users.find(u => u.id.toString() === id); }

/**
 * @description Port listener
 */
app.listen(port, () => { console.log(`Listening on the port: ${port}`); });