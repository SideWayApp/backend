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
 *             $ref: '#/components/schemas/User'
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           required: true
 *         password:
 *           type: string
 *           required: true
 *         tokens:
 *           type: array
 *           items:
 *             type: string
 *         preferences:
 *           type: object
 *           properties:
 *             accessibility:
 *               type: boolean
 *               default: false
 *             clean:
 *               type: boolean
 *               default: false
 *             scenery:
 *               type: boolean
 *               default: false
 *             security:
 *               type: boolean
 *               default: false
 *             speed:
 *               type: boolean
 *               default: false
 *           required:
 *             - accessibility
 *             - clean
 *             - scenery
 *             - security
 *             - speed
 *         signUpData:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               required: true
 *             gender:
 *               type: string
 *               required: true
 *             age:
 *               type: string
 *               required: true
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
 *     security:
 *       - bearerAuth: [] 
 */

/**
 * @swagger
 * /api/authentication/refreshToken:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Authentication Api]
 *     description: Use this endpoint to refresh an expired authentication token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/authentication/users/{refreshToken}:
 *   get:
 *     summary: Get user information using access token
 *     description: Returns user information based on the provided access token.
 *     tags: [Authentication Api]
 *     parameters:
 *       - in: path
 *         name: refreshToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Refresh token
 *     responses:
 *       '200':
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: not found
 */

const express = require("express");
const router = express.Router();
const authenticate = require('../Common/authentication_middleware')

const AuthenticationRoutes  = require("../Controllers/authenticationController");

router.post("/login", AuthenticationRoutes.login);
router.post("/register", AuthenticationRoutes.register);
router.post("/logout",authenticate, AuthenticationRoutes.logout);
router.post("/refreshToken", AuthenticationRoutes.refreshToken)
router.get("/users/:refreshToken",AuthenticationRoutes.getUser)

module.exports = router;
