import 'dotenv/config'
import pg from 'pg';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt, { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';

let saltRounds = 4;
const app = express();
app.use(cors());
const port = 4000;
app.use(bodyParser.json());

console.log(process.env.connectionString);

const db = new pg.Client({
    connectionString: process.env.connectionString,
});

db.connect();

app.post('/register', async (req, res) => {
    console.log(req.body);
    let { uid, password, username } = req.body;
    if ((await db.query(`select * from users where uid = '${uid}'`)).rows[0] == null) {
        bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
            if (err) {
                console.log(err);
                res.send({ msg: 'error occured' });
            }
            else {

                // mail transporter config
                const mailTransporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: process.env.user,
                        pass: process.env.pass
                    }
                })

                // otp generation
                let otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
                let details = {
                    from: process.env.user,
                    to: 'priyanshuntak@gmail.com',
                    subject: 'OTP verification',
                    text: `Your OTP from PeerLink is ${otp}.`
                }
                // sending mail and updating db
                mailTransporter.sendMail(details, async (err) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        await db.query(`insert into users(uid,password, otp, username) values('${uid}', '${hashedPassword}', ${otp},'${username}')`);
                        res.send({ msg: 'user registered' })
                        console.log('sent successfully');
                    }
                })
            }
        })

    }
    else {
        res.send({ msg: 'user already registered' });
    }
})

app.post('/otp', async (req, res) => {
    let { uid, otp } = req.body;
    let storedOtp = await db.query(`select * from users where uid = '${uid}'`)
    if (storedOtp.rows[0] == null) {
        res.send({ msg: 'wrong uid' })
    }
    else {
        storedOtp = storedOtp.rows[0].otp;
        if (storedOtp == otp) {
            await db.query(`update users set verified = true where uid = '${uid}'`)
            res.send({ msg: 'email verified' })
        }
        else {
            res.send({ msg: 'wrong otp' })
        }
    }
})

app.post('/login', async (req, res) => {
    //fix login
    let { uid, password } = req.body;
    let userDetails = ((await db.query(`select * from users where uid = '${uid}'`)).rows[0])
    // console.log(hashedPassword);
    if (userDetails == null) {
        res.send({ msg: 'Invalid Login' })
    }
    else if (userDetails.verified != true) {
        res.send({ msg: 'Email not verified' })
    }
    else {
        let hashedPassword = userDetails.password
        if ((await db.query(`select * from pendingrequests where uid = '${uid}'`)))
            bcrypt.compare(password, hashedPassword, async (err, result) => {
                if (err) {
                    console.log('error occured');
                    res.send({ msg: 'error occured' })
                }
                if (result) {
                    const sessionId = uuidv4();
                    await db.query(`update users set sessionid = '${sessionId}' where uid = '${uid}'`);
                    res.send({ msg: "login success", sessionId: sessionId });
                }
                else {
                    res.send({ msg: 'invalid credentials' })
                }
            })
    }
})

app.post('/session', async (req, res) => {
    let user = '';
    if (req.body.sessionID) {
        let prevId = (await db.query(`select * from users where sessionID = '${req.body.sessionID}'`));
        prevId = prevId.rows[0];
        console.log(prevId);
        if (prevId != null) {
            user = prevId.uid;
            console.log(user);
            res.send({
                username: prevId.username,
                uid: user
            });
        }
        else {
            res.send('null')
        }
    }
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});