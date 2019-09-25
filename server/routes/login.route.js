const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
const User = require('../models/user.model');
const conn = require('../config/db');

const app = express();

const client = new OAuth2Client(process.env.CLIENT_ID);
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
        username: payload.given_name + payload.family_name,
        email: payload.email,
        img: payload.picture
    }
}

app.post('/oauth-login', async (req, res) => {
    const body = req.body;

    const googleInfo = await verify(body.idtoken)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            })
        });

    conn.query('SELECT * FROM users WHERE email = ? AND active = 1', googleInfo.email, (err, result) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (result.length > 0) {
            if (result.google === 0) {
                return res.status(400).json({
                    ok: false,
                    err: 'Normal authentication must be used instead of Google'
                });
            } else {
                const user = new User(
                    result[0].id_user,
                    result[0].username,
                    googleInfo.email,
                    'null',
                    googleInfo.img,
                    1,
                    result[0].role,
                    1
                );

                const token = jwt.sign(
                    _.pick(user, ['id_user', 'username', 'email', 'img', 'google', 'role', 'active']),
                    process.env.SECRET_KEY,
                    { expiresIn: process.env.EXPIRATION }
                );

                return res.json(token);
            }
        } else {
            const newUser = new User(
                null,
                googleInfo.username,
                googleInfo.email,
                'null',
                googleInfo.img,
                1,
                2,
                1
            );

            conn.query('INSERT INTO users SET ?', newUser, (err, inserted) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                newUser.id_user = inserted.insertId;

                const token = jwt.sign(
                    _.pick(newUser, ['id_user', 'username', 'email', 'img', 'google', 'role', 'active']),
                    process.env.SECRET_KEY,
                    { expiresIn: process.env.EXPIRATION }
                );

                return res.json(token);
            });
        }
    });
});

module.exports = app;