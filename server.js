const express = require('express');
const Joi = require('joi');
const fs = require('fs');

const app = express();

app.use(express.json());

const port = process.env.PORT || 3200;

const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: {
            allow: ['com','net']
        }
    }).required(),
    dob: Joi.string().min(10).required()
});

/** @todo add to constants file */
const urls = { users: '/api/users' };

/**
 * @description Response that specifies what paths can be reached
 * @method GET
 * @returns { status: number, data: { type: string } }
 */
app.get('/', (req, res) => {
    const { paths } = getContent('./db/config/paths.json');
    if (paths) {
        sendResponse(res, 200, { data: paths });
    } else {
        sendResponse(res, 400, { error: 'The paths were not found.' });
    }
});

/**
 * @description To return all users
 * @method GET
 * @return { status: number, data: object[] }
 */
app.get(`${urls.users}`, (req, res) => {
    const { users } = getContent('./db/users/users.json');
    if (users) {
        sendResponse(res, 200, { data: users });
    } else {
        sendResponse(res, 404, { error: 'The users were not found.' });
    }
});

/**
 * @description To return a user associated with the given id
 * @method GET
 * @requestParams id: number
 * @returns { id: number, name: string, email: string, dob: string, friendsList: user[] }
 */
app.get(`${urls.users}/:id`, (req, res) => {
    const { users } = getContent('./db/users/users.json');
    console.log(users);
    if (!users) {
        sendResponse(res, 404, { error: 'The user was not found.' });
    } else {
        const user = getUser(users, req.params.id);
        if (user) {
            sendResponse(res, 200, { data: user });
        } else {
            sendResponse(res, 404, { error: 'The requested user was not found.' });
        }
    }
});

/**
 * @description To add a user to the content
 * @method POST
 * @body { name: string, email: string, dob: string }
 */
app.post(`${urls.users}`, (req, res) => {
    try {
        const { users } = getContent('./db/users/users.json');
        if (!users) {
            sendResponse(res, 500, { error: 'There was an issue with internal data' });
        }
        if (!users.find(u => u && u.name === req.body?.name &&
            u.email === req.body?.email &&
            u.dob === req.body?.dob)) {
            try {
                const { error } = schema.validate(req.body);
                if (!error) {
                    fs.writeFileSync(`./db/users/users.json`, JSON.stringify({
                        users: [ 
                            ...users, {
                            id: users.length + 1,
                            ...req.body,
                            friendsList: []
                        }]
                    }));
                    sendResponse(res, 201, { message: 'Success' });
                } else {
                    sendResponse(res, 422, { message: `${error.message}` });
                }
            } catch (error) {
                sendResponse(res, 400, {  error: 'There was an issue adding the user.' });
            }
        } else {
            sendResponse(res, 403, { message: 'The user already exists.' });
        }
    } catch (error) {
        sendResponse(res, 500, { error: `${error}`});
    }
});

/**
 * @description To update a user in the content
 * @method PUT
 * @body { name: string, email: string, dob: string }
 */
app.put(`${urls.users}/:id`, (req, res) => {
    const { users } = getContent('./db/users/users.json');
    if (!users) {
        sendResponse(res, 404, { error: 'The users were not found.' });
    } else {
        const { error } = schema.validate(req.body);
        const index = getUser(users, req.params.id, true);
        let user = users[index];
        if (user && !error) {
            user = {
                id: user.id,
                ...req.body,
                friendsList: user.friendsList
            };
            users.splice(index, 1, user);
            try {
                fs.writeFileSync(`./db/users/users.json`, JSON.stringify({users: [ ...users ]}));
            } catch (err) {
                sendResponse(res, 500, { message: `${err}` });
            }
            sendResponse(res, 200, { data: user, message: 'The user was successfully updated.' });
        } else {
            if (error) {
                sendResponse(res, 422, { message: `${error.message}` });
            } else {
                sendResponse(res, 404, { error: 'The requested user was not found.' });
            }
        }
    }
});

app.put(`${urls.users}`, (req, res) => {
    sendResponse(res, 400, { message: `An ID is a required parameter.` });
});

/**
 * @description To remove a user from the content
 * @method DELETE
 */
app.delete(`${urls.users}/:id`, (req, res) => {
    if (req.params.id) {
        let { users } = getContent('./db/users/users.json');
        if (!users) {
            sendResponse(res, 404, { error: 'The users were not found.' });
        } else {
            const index = getUser(users, req.params.id, true);
            if (index > -1) {
                users.splice(index, 1);
                try {
                    fs.writeFileSync(`./db/users/users.json`, JSON.stringify({users: [ ...users ]}));
                    sendResponse(res, 202, { message: 'The user was successfully deleted.' });
                } catch (err) {
                    sendResponse(res, 500, { message: `${err}` });
                }
            } else {
                sendResponse(res, 404, { error: 'The requested user was not found.' });
            }
        }
    } else {
        sendResponse(res, 400, { message: `An ID is a required parameter.` });
    }
});

app.delete(`${urls.users}`, (req, res) => {
    sendResponse(res, 400, { message: `An ID is a required parameter.` });
});

/**
 * @description Helper function to get the content from json file
 * @function getContent
 * @params url: string
 * @returns Object
 */
function getContent(url) {
    return !url ? {} : JSON.parse(fs.readFileSync(url));
}

function writeToUsers(url, users) {
    fs.writeFileSync(url, JSON.stringify({
        users: [ 
            ...users, {
            id: users.length + 1,
            ...req.body,
            friendsList: []
        }]
    }));
}

/**
 * @description Helper function to return a user associated with the id param
 * @function getUser
 * @params id: number
 * @returns { id: number, name: string, email: string, dob: string, friendsList: user[] }
 */
function getUser(users, id, index) {
    return index ? users?.findIndex(u => u?.id?.toString() === (id ?? -1)) :
        users?.find(u => u?.id?.toString() === (id ?? -1));
}

/**
 * @description Helper function to send response from server, and log appropriate messages to console
 * @function sendResponse
 * @params res: object, status: number, payload: object
 */
function sendResponse(res, status, payload) {
    if (!payload) {
        status = 500;
        payload = { error: 'Error: Internal server error'};
        console.error(`${payload.error}`);
    }
    if (payload.error) {
        console.error(`\nError: ${payload.error}`);
    } else if (payload.data) {
        console.log(`\nPayload being sent: ${JSON.stringify(payload.data)}`)
    }
    if (status < 400) {
        res.status(status).send(payload.data && payload.message ?
            payload : payload.data ?? payload.message);
    } else {
        res.status(status).send(payload.message ?? payload.error);
    }
    return;
}

/**
 * @description Port listener
 */
app.listen(port, () => {
    console.log(`Listening on the port: ${port}`);
});