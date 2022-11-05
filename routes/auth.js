const CryptoJS = require("crypto-js");
const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const { authentication } = getContent('./db/auth/auth.json');

router.post('/login', (req, res) => {
    if (req) {
        if ((req.body?.email ?? '') && (req.body?.password ?? '')) {
            const user = getContent(`.${process.env.USERS_CONTENT}`)?.users?.find(user => user.email === req.body.email);
            if (user?.id) {
                const auth = getContent(`.${process.env.AUTH_CONTENT}`)?.authentication?.find(auth => auth?.[user.id]);
                if (auth && (auth[user.id]?.encrypted ?? '') === req.body.password) {
                    res.status(200).send({ status: 200, data: user, token: jwt.sign({
                        time: new Date(),
                        userId: user.id,
                    }, process.env.JWT_SECRET_KEY) });
                } else {
                    res.status(401).send({ status: 401, message: 'Login failure' });
                }
            } else {
                res.status(404).send({ status: 404, message: 'No user exists' });
            }
        } else {
            if (!req.body) {
                res.status(400).send({ status: 401, message: 'User data is required' });
            } else {
                if (!req.body.email) {
                    res.status(400).send({ status: 401, message: 'An email is a required field' });
                } else {
                    res.status(400).send({ status: 401, message: 'A password is required' });
                }
            }
        }
    } else {
        res.status(500).send({ status: 500, error: 'Internal server error' });
    }
    
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

function decrypt(value) {
    if (value === null || value === undefined) {
        return '';
    }
    var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(value),
    });
    return CryptoJS.AES.decrypt(
        cipherParams,
        CryptoJS.enc.Utf8.parse(process.env.KEY),
        {
            iv: CryptoJS.enc.Utf8.parse(process.env.SALT),
        }
    ).toString(CryptoJS.enc.Utf8);
}

module.exports = router;