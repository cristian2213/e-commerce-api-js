const { Role } = require('../../../config/db/models/index');
const errorsHandler = require('../../../helpers/handlers/errorsHandler');
const { StatusCodes } = require('http-status-codes');

const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    return res.status(StatusCodes.OK).json(roles);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const createRoles = async (req, res) => {
  const { roles } = req.body;
  const userRoles = [];

  for (let i = 0; i < roles.length; i++) {
    const role = await Role.create({
      name: roles[i].id || roles[i],
      userId: req.body.id || req.user.sub,
    });
    userRoles.push(role.name);
  }
  return userRoles;
};

const deleteRoles = async (req, res) => {
  const { roles } = req.body;
  for (let i = 0; i < roles.length; i++) {
    await Role.destroy({
      where: {
        id: roles[i].id,
      },
    });
  }
};

module.exports = {
  createRoles,
  deleteRoles,
  getRoles,
};
