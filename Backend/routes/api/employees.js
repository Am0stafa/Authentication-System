const express = require('express');
const roles = require('../../config/rolesList');
const router = express.Router();
const employeesController = require('../../controllers/employeesController');
const { verifyJWT } = require('../../middleware/verifyJWT');
const verifyRoles = require('../../middleware/verifyRoles');

router.use(verifyJWT)

router.route('/')
    .get(employeesController.getAllEmployees)
    .post(verifyRoles(roles.Admin, roles.Editor), employeesController.createNewEmployee)
    .put(verifyRoles(roles.Admin, roles.Editor), employeesController.updateEmployee)
    .delete(verifyRoles(roles.Admin), employeesController.deleteEmployee);

router.route('/:id')
    .get(employeesController.getEmployee);

module.exports = router;