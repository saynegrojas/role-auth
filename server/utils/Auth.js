// function for different routes
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// bring secret to pass in sign in token
const { SECRET } = require('../config');
// passport
const passport = require('passport');

// REGISTER USER (admin, super-admin, user)
// passed in from register routes (req.body, user, res)
const userRegister = async (userDets, role, res) => {

  try {
    // validate user
    let usernameTaken = await (validateUsername(userDets.username));
    // console.log(userDets.username)
    if (!usernameTaken) {
      return res.status(400).json({
        message: `Username is already taken`,
        success: false
      });
    }

    // validate email
    let emailNotRegistered = await (validateEmail(userDets.email));
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered`,
        success: false
      });
    }

    // get hash password
    const hashedPassword = await bcrypt.hash(userDets.password, 12);

    // create new user
    const newUser = new User({
      ...userDets,
      password: hashedPassword,
      role: role
    });
    await newUser.save();
    return res.status(201).json({
      message: `Successfully registered!`,
      success: true
    });

  } catch (err) {
    // implement logger function (winston)
    return res.status(500).json({
      message: `Unable to register ${err}`,
      success: false
    });
  }
}

// LOGIN USER
const userLogin = async (userCreds, role, res) => {
  let { username, password } = userCreds;
  // check username in db
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({
      message: `Username ${user.username} is not found. Invalid login credentials.`,
      success: false
    });
  }
  // check user role
  if (user.role != role) {
    return res.status(403).json({
      message: `Please make sure you are logging in from right portal.`,
      success: false
    })
  }
  // this point, user exists compare password
  let isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    // sign in the token and issue to user
    let token = jwt.sign({
      user_id: user._id,
      role: user.role,
      username: user.username,
      email: user.email
    }, SECRET, {
        expiresIn: '7 days'
      }
    );
    // once token is assigned, return token response
    let result = {
      username: user.username,
      role: user.role,
      email: user.email,
      token: `Bearer ${token}`,
      expiresIn: 86400
    };

    // return status w/ spread result values to 201 response 
    res.status(201).json({
      ...result,
      message: `Successfully logged in!`,
      success: true
    });

  } else {
    return res.status(403).json({
      message: `Incorrect password`,
      success: false
    })
  }
}

// go to db and check if existing username exists
const validateUsername = async username => {
  let user = await User.findOne({ username });
  // if found return false, else true
  return user ? false : true;
}

// go to db and check if existing email exists
const validateEmail = async email => {
  let userEmail = await User.findOne({ email });
  // if found return false, else true
  return userEmail ? false : true;
}

// PASSPORT MIDDLEWARE
const userAuth = passport.authenticate('jwt', { session: false });

// expose only certain data from database
const serializeUser = user => {
  return {
    username: user.username,
    email: user.email,
    name: user.name,
    _id: user._id,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  }
}

// CHECK ROLE MIDDLEWARE
// Tenaray !roles.includes(req.user.role) ? res.status(401).json({ message: 'Unauthorized', success: false }) : next();
const checkRole = roles => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    next();
  }
  return res.status(401).json({
    message: "Unauthorized",
    success: false
  })
}

// export functions
module.exports = {
  userRegister,
  userLogin,
  userAuth,
  serializeUser,
  checkRole
};