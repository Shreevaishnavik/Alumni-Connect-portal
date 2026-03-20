const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validate } = require('../../middleware/validator');
const authMiddleware = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');
const rateLimiter = require('../../middleware/rateLimiter');
const logger = require('../../middleware/logger');
const userController = require('./user.controller');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student', 'alumni').required(),
  batch: Joi.number().required(),
  department: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string(),
  company: Joi.string().allow(''),
  designation: Joi.string().allow(''),
  bio: Joi.string().allow(''),
  skills: Joi.array().items(Joi.string()),
  batch: Joi.number(),
  department: Joi.string()
});

// Auth Routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', rateLimiter, validate(loginSchema), userController.login);

// Protected Routes - apply auth and logger
router.use(authMiddleware, logger);

router.get('/me', userController.getMe);
router.get('/directory', userController.getDirectory);
router.get('/profile/:id', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

// Connections
router.post('/connect/:targetId', userController.sendConnectionRequest);
router.put('/connect/:requesterId/accept', userController.acceptConnection);
router.put('/connect/:requesterId/decline', userController.declineConnection);

// Admin Routes
router.get('/admin/all', roleCheck('admin'), userController.getAllUsersAdmin);
router.put('/admin/:id/role', roleCheck('admin'), userController.updateUserRoleAdmin);
router.delete('/admin/:id', roleCheck('admin'), userController.deleteUserAdmin);

module.exports = router;
