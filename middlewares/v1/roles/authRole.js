const { Roles, RolesValues } = require('./../../../helpers/roles/roles');
const { StatusCodes } = require('http-status-codes');

const isCustomer = (req, res, next) => {
  const roles = req.user.roles;
  for (const role of roles) {
    checkRole(res, role);
    if (role === Roles.CUSTOMER) {
      return next();
    }
  }
  return res.status(StatusCodes.FORBIDDEN).json({
    statusCode: StatusCodes.FORBIDDEN,
    message: 'Your user does not have permissions to execute this action',
  });
};

const isAdmin = (req, res, next) => {
  const roles = req.user.roles;
  for (const role of roles) {
    checkRole(res, role);
    if (role === Roles.ADMIN) {
      return next();
    }
  }
  return res.status(StatusCodes.FORBIDDEN).json({
    statusCode: StatusCodes.FORBIDDEN,
    message: 'Your user does not have permissions to execute this action',
  });
};

const isDealer = (req, res, next) => {
  const roles = req.body.user.roles;
  for (const role of roles) {
    checkRole(res, role);
    if (role === Roles.DEALER) {
      return next();
    }
  }
  return res.status(StatusCodes.FORBIDDEN).json({
    statusCode: StatusCodes.FORBIDDEN,
    message: 'Your user does not have permissions to execute this action',
  });
};

const checkRole = (res, role) => {
  if (!RolesValues.includes(role)) {
    return res.status(StatusCodes.NOT_ACCEPTABLE).json({
      statusCodes: StatusCodes.NOT_ACCEPTABLE,
      message: `Role ${role} doesn't exist`,
    });
  }
};

module.exports = {
  isCustomer,
  isAdmin,
  isDealer,
  checkRole,
};
