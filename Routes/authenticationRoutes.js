/**
 * @swagger
 * /api/authentication/register:
 *   post:
 *     summary: Register user
 *     tags: [Authentication Api]
 *     description: Use this endpoint to register a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/authentication/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication Api]
 *     description: Use this endpoint to authenticate a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/authentication/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication Api]
 *     description: Use this endpoint to log out a user.
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized access
 */

const express = require("express");
const router = express.Router();

const AuthenticationRoutes  = require("../Controllers/authenticationController");

router.post("/login", AuthenticationRoutes.login);
router.post("/register", AuthenticationRoutes.register);
router.post("/logout", AuthenticationRoutes.logout);

module.exports = router;
