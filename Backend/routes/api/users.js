const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const ROLES_LIST = require("../../config/rolesList");
const verifyRoles = require("../../middleware/verifyRoles");
const { verifyJWT } = require("../../middleware/verifyJWT");

router.route("/getMail/:email").get(usersController.isValidEmail);

router.use(verifyJWT);

router.route("/me").get(usersController.getMe);

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsers);

router
  .route("/:id")
  .get(verifyRoles(ROLES_LIST.Admin), usersController.getUser)
  .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);

module.exports = router;
