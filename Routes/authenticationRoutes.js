const express = require("express");
const router = express.Router();
const AuthenticationRoutes  = require("../Controllers/authenticationController");
const authenticate = require('../Common/authentication_middleware')

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
 *           required:
 *             - name
 *             - gender
 *             - age
 *         favorites:
 *           type: array
 *           items:
 *             type: string
 *         recents:
 *           type: array
 *           items:
 *             type: string
 */ 

router.post("/register", AuthenticationRoutes.register);

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

router.post("/login", AuthenticationRoutes.login);

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

router.post("/logout",authenticate, AuthenticationRoutes.logout);

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

router.post("/refreshToken", AuthenticationRoutes.refreshToken);

/**
 * @swagger
 * /api/authentication/user:
 *   get:
 *     summary: Get user information
 *     description: Returns the user information associated with the provided JWT token
 *     tags: [Authentication Api]
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized - the request did not include a valid JWT access token.
 *       '403':
 *         description: Forbidden - the request was not authorized or there was an error processing the request.
 */

router.get("/user",AuthenticationRoutes.getUser);

/**
 * @swagger
 * /api/authentication/editUserPreferences:
 *   put:
 *     summary: Update user preferences.
 *     description: Updates the user's preferences based on the input data.
 *     tags: [Authentication Api]
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       description: Object containing the user's preferences to update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 properties:
 *                   accessibility:
 *                     type: string
 *                   clean:
 *                     type: string
 *                   scenery:
 *                     type: string
 *                   security:
 *                     type: string
 *                   speed:
 *                     type: string
 *                 required:
 *                   - accessibility
 *                   - clean
 *                   - scenery
 *                   - security
 *                   - speed
 *     responses:
 *       200:
 *         description: User preferences have been updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: "Preferences updated."
 *       401:
 *         description: User is not authorized to access this resource.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Unauthorized access."
 *       403:
 *         description: User is forbidden from accessing this resource.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Forbidden access."
 */

router.put("/editUserPreferences",AuthenticationRoutes.editUserPreferences);

/**
 * @swagger
 * /api/authentication/deleteUser:
 *   delete:
 *     summary: Delete a user.
 *     description: Deletes the user associated with the authenticated JWT token.
 *     tags: [Authentication Api]
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: The user was successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user deleted
 *       '401':
 *         description: Unauthorized - the request did not include a valid JWT access token.
 *       '403':
 *         description: Forbidden - the request was not authorized or there was an error processing the request.
 */

router.delete("/deleteUser",AuthenticationRoutes.deleteUser);

/**
 * @swagger
 * /api/authentication/addFavorite:
 *   put:
 *     summary: Adds a favorite to a user's list of favorites.
 *     description: Adds the specified favorite to the user's list of favorites. Requires a valid JWT access token.
 *     tags: [Authentication Api]
 *     requestBody:
 *       description: The favorite to add to the user's list.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               favorite:
 *                 type: string
 *                 description: The favorite to add to the user's list.
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       '200':
 *         description: Successfully added the favorite to the user's list of favorites.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: The message "favorite added".
 *       '401':
 *         description: Unauthorized - the request did not include a valid JWT access token.
 *       '403':
 *         description: Forbidden - the request was not authorized or there was an error processing the request.
 */

router.put("/addFavorite",AuthenticationRoutes.addFavorite);

/**
 * @swagger
 * /api/authentication/addRecent:
 *   put:
 *     summary: Adds a recent location to a user's list of recents.
 *     description: Adds the specified recent location to the user's list of recents. Requires a valid JWT access token.
 *     tags: [Authentication Api]
 *     requestBody:
 *       description: The recent to add to the user's list.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recent:
 *                 type: string
 *                 description: The recent to add to the user's list.
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       '200':
 *         description: Successfully added the recent location to the user's list of recents.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: The message "recent added".
 *       '401':
 *         description: Unauthorized - the request did not include a valid JWT access token.
 *       '403':
 *         description: Forbidden - the request was not authorized or there was an error processing the request.
 */

router.put("/addRecent",AuthenticationRoutes.addRecent);

/**
 * @swagger
 * /api/authentication/deleteFavorite:
 *   delete:
 *     summary: deletes a favorite location from the user's list of favorites.
 *     description: Deletes the specified favorite location from the user's list of favorites. Requires a valid JWT access token.
 *     tags: [Authentication Api]
 *     requestBody:
 *       description: The favorite to add to the user's list.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               favorite:
 *                 type: string
 *                 description: The favorite to delete from the user's list.
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       '200':
 *         description: Successfully deleted the favorite location from the user's list of favorites.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: The message "favorite deleted".
 *       '401':
 *         description: Unauthorized - the request did not include a valid JWT access token.
 *       '403':
 *         description: Forbidden - the request was not authorized or there was an error processing the request.
 */

router.delete("/deleteFavorite",AuthenticationRoutes.deleteFavorite);

/**
 * @swagger
 * /api/authentication/deleteRecent:
 *   delete:
 *     summary: deletes a recent location from the user's list of favorites.
 *     description: Deletes the specified recent location from the user's list of favorites. Requires a valid JWT access token.
 *     tags: [Authentication Api]
 *     requestBody:
 *       description: The recent to add to the user's list.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recent:
 *                 type: string
 *                 description: The recent to delete from the user's list.
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       '200':
 *         description: Successfully deleted the recent location from the user's list of recents.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: The message "recent deleted".
 *       '401':
 *         description: Unauthorized - the request did not include a valid JWT access token.
 *       '403':
 *         description: Forbidden - the request was not authorized or there was an error processing the request.
 */

router.delete("/deleteRecent",AuthenticationRoutes.deleteRecent);

module.exports = router;
