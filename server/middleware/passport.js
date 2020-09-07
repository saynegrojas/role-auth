const User = require('../models/User');
const { SECRET } = require('../config');
const { Strategy, ExtractJwt } = require('passport-jwt');

const opts = {
  // Bearer token strategy
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
}

module.exports = passport => {
  passport.use(new Strategy(opts, async (payload, done) => {
    await User.findById(payload.user_id)
      .then((user, callback) => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      }).catch(err => {
        return done(null, false);
      })
  })
  )
}