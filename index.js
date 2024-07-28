require('dotenv').config();

const express = require('express'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    cors = require('cors'),
    path = require('path');

const db_endpoint = process.env.DB_ENDPOINT;
const port = process.env.PORT || 3000;

const passportSetup = require('./config/passport-setup');
const authRoute = require('./routes/auth/route');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(express.static('public'));

mongoose
  .connect(db_endpoint, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => console.log("database connection established"))
  .catch((error) => console.error("database connection error:", error));

app.get('/', (req, res) => {
  res.status(200).send('Welcome to Recto Server!');
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy-policy.html'));
})

app.use('/api/auth', authRoute);

app.listen(port, () => {
    console.log(`recto-server listening on port no:${port}`);
});