const express = require('express');
const cors = require('cors');
const bp = require('body-parser');
const { connect } = require('mongoose');
const { success, error } = require('consola');
const passport = require('passport');

// constants
const { DB, PORT } = require('./config');

// init app
const app = express();

// middleware
app.use(cors());
app.use(bp.json());
app.use(passport.initialize());

require('./middleware/passport')(passport);

// use router middleware
app.use('/api/users', require('./routes/users'))

// This way will start app ONLY after it connects to the database
const startApp = async () => {
  try {
    // connection to db
    await connect(DB, {
      useFindAndModify: true,
      useUnifiedTopology: true,
      useNewUrlParser: true
    });

    success({
      message: `Successfully connected to Database: ${DB}`,
      badge: true
    });

    // listen to server
    app.listen(PORT, () =>
      success({
        message: `Server started on port ${PORT}`,
        badge: true
      })
    );
  } catch (err) {
    error({
      message: `Unable to connect to Database: ${err}`,
      badge: true
    })
    startApp();
  }
}
startApp();