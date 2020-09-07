const router = require('express').Router();
const { userRegister, userLogin, userAuth, serializeUser, checkRole } = require('../utils/Auth');

// Registration routes
// user registration
router.post('/register-user', async (req, res) => {
  await userRegister(req.body, 'user', res);
})
// admin registration
router.post('/register-admin', async (req, res) => {
  await userRegister(req.body, 'admin', res);

})
// super admin registration
router.post('/register-super-admin', async (req, res) => {
  await userRegister(req.body, 'super-admin', res);

})
// Login routes
// user login
router.post('/login-user', async (req, res) => {
  await userLogin(req.body, 'user', res);
})
// admin login
router.post('/login-admin', async (req, res) => {
  await userLogin(req.body, 'admin', res);

})
// super admin login
router.post('/login-super-admin', async (req, res) => {
  await userLogin(req.body, 'super-admin', res);

})

// Profile route
// general profile route
router.get('/profile', userAuth, async (req, res) => {
  console.log(serializeUser(req.user));
  // wrap req.user inside serializeUser to expose only fields we want to expose
  return res.json(serializeUser(req.user));
})

// Protected routes
// user protected
router.get('/user-profile', userAuth, checkRole(['user']), async (req, res) => {
  return await res.json(serializeUser(req.user));
})
// admin protected
router.get('/admin-profile', userAuth, checkRole(['admin']), async (req, res, next) => {
  return await res.json(serializeUser(req.user))
})
// super admin protected
router.get('/super-admin-profile', userAuth, checkRole(['super-admin']), async (req, res) => {
  return await res.json(serializeUser(req.user))
})
// super admin & admin protected
router.get('/super-admin-and-admin-profile', userAuth, checkRole(['super-admin', 'admin']), async (req, res) => {
  return await res.json(serializeUser(req.user))
})
module.exports = router;