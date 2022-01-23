const { Op } = require('sequelize');
const argon2 = require('argon2');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const { User, Role } = require('../../../config/db/models/index');
const errorsHandler = require('../../../helpers/handlers/errorsHandler');
const generateRandomToken = require('../../../helpers/tokens/generateRandomToken');
const { createRoles, deleteRoles } = require('../roles/roles');

/**
 * getUsers(req, res)
 * @param {Request} req
 * @param {Response} res
 * @param {Object} req.user - The payload of the token
 * @description Function to get all users from database
 * @returns [{Object|Object}] [Returns an User object | Json object]
 */
const createUser = async (req, res) => {
  try {
    const payload = req.body;
    const { name, email, password } = payload;
    const { token, expirationDate: tokenExpiration } = generateRandomToken();

    const user = await User.create({
      name,
      email,
      password,
      token,
      tokenExpiration,
    });

    req.body.id = user.id;
    const userRoles = await createRoles(req, res);

    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: userRoles,
      token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (req.body.signUp) return responseUser;

    return res.status(StatusCodes.CREATED).json(responseUser);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * getUsers(req, res)
 * @param {Request} req
 * @param {Response} res
 * @param {Object} req.user - The payload of the token
 * @description Function to get all users from database
 * @returns [{ Object[] }] [Returns an object array of Users]
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Role,
        as: 'roles',
        attributes: ['name'],
      },
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });
    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * updateUser(req, res)
 * @param {Request} req
 * @param {Response} res
 * @param {Object} req.user - The payload of the token
 * @description Function to update an user from database
 * @returns [{Object|Object}] [Returns a Json object | User object]
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    let user = await User.findByPk(id, {
      include: {
        model: Role,
        as: 'roles',
        attributes: ['id'],
      },
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });

    if (!user)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });

    if (req.body.email) {
      const result = await emailExists(req, res);
      if (result === true)
        return res.status(StatusCodes.BAD_REQUEST).json({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'The email exists already',
        });
    }

    if (req.body.roles) {
      const newRoles = req.body.roles;
      req.body.roles = user.roles;
      await deleteRoles(req, res);
      req.body.roles = newRoles;
      await createRoles(req, res);
    }

    if (req.body.password) {
      const hash = await argon2.hash(req.body.password);
      req.body.password = hash;
    }

    const newData = req.body;
    await User.update(newData, {
      where: { id },
    });

    delete newData.password;
    user = { ...user.toJSON(), ...newData };
    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * getUser(req, res)
 * @param {Request} req
 * @param {Response} res
 * @param {Object} req.user - The payload of the token
 * @description Function to get an user from database
 * @returns [{Object}] [Returns a Json object]
 */
const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: {
        model: Role,
        as: 'roles',
        attributes: ['name'],
      },
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });

    if (!user)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * deleteUser(req, res)
 * @param {Request} req
 * @param {Response} res
 * @param {Object} req.user - The payload of the token
 * @description Function to delete an user from database
 * @returns [{Object}] [Returns a Json object]
 */
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id, {
      include: {
        model: Role,
        as: 'roles',
        attributes: ['id'],
      },
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });
    if (!user)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });

    await User.destroy({
      where: { id },
    });
    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * emailExists(req, res)
 * @param {Request} req
 * @param {Response} res
 * @description Helper function to check if the user email exists
 * @returns [{Object|boolean}] [Returns an User object | false]
 */
const emailExists = async (req, res) => {
  const { id } = req.params || req.body;
  const user = await User.findOne({
    attributes: ['id', 'email'],
    where: {
      [Op.and]: [
        { email: req.body.email || req.user.email },
        {
          id: {
            [Op.ne]: id,
          },
        },
      ],
    },
  });
  return user ? true : false;
};

/**
 * resetPassword(req, res)
 * @param {Request} req
 * @param {Response} res
 * @description Function to reset password by email
 * @returns [{Object}] [Returns a Json object]
 */
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      where: {
        email,
        emailVerifiedAt: {
          [Op.ne]: null,
        },
      },
    });

    if (!user)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: "The account doesn't exist, or It hasn't been confirmed.",
      });

    const data = generateRandomToken(); // by default 1h

    user.token = data.token;
    user.tokenExpiration = data.expirationDate;
    await user.save();
    const resetLink = `http://${req.headers.host}${req.baseUrl}/reset-password/${data.token}`; // FIXME in production mode to https (front route)

    // FIXME TO CALL HERE THE FUNCTION TO SEND EMAIL

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message:
        "we've sent a verification link to your email for resetting your password",
      token: data.token, // FIXME delete me, when the front is done
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * confirmToken(req, res)
 * @param {Request} req
 * @param {Response} res
 * @description Function to confirm the token sent to the mail, If It has a valid token the UI should show the component to change the password
 * @returns [{Object}] [Returns a Json object]
 */
const confirmToken = async (req, res) => {
  try {
    const user = await certifyToken(req, res);
    if (user === false) {
      return res.status(StatusCodes.FORBIDDEN).json({
        statusCode: StatusCodes.FORBIDDEN,
        message: 'Expired token, please generate a new token',
        hasValidToken: false,
      });
    }

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: ReasonPhrases.OK,
      hasValidToken: true,
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * updatePassword(req, res)
 * @param {Request} req
 * @param {Response} res
 * @description Function to change the password
 * @returns [{Object}] [Returns a Json object]
 */
const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await certifyToken(req, res);

    if (user === false) {
      return res.status(StatusCodes.FORBIDDEN).json({
        statusCode: StatusCodes.FORBIDDEN,
        message: 'Expired token, please generate a new token',
        hasValidToken: false,
      });
    }

    user.token = null;
    user.tokenExpiration = null;
    user.password = await argon2.hash(password);
    await user.save();

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: 'The password field was updated',
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * certifyToken(req, res)
 * @param {Request} req
 * @param {Response} res
 * @description Helper function to check if the token is active
 * @returns [{Object|boolean}] [Returns an User object | false]
 */
const certifyToken = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    where: {
      token,
      tokenExpiration: {
        [Op.gte]: Date.now(), // >=
      },
    },
  });

  return user ? user : false;
};

/**
 * findByEmail(req, res)
 * @param {Request} req
 * @param {Response} res
 * @description Helper function to check if the user exists
 * @returns [{Object|null}] [Returns a User object | null]
 */
const findByEmail = async (email) => {
  const user = await User.findOne({
    attributes: [
      'id',
      'name',
      'email',
      'password',
      'emailVerifiedAt',
      'createdAt',
      'updatedAt',
    ],
    where: {
      email,
    },
  });
  return user;
};

/**
 * checkUser(req, res)
 * @param {number} userId
 * @description Helper function to validate if the user exists by Id
 * @throws {Error} Throw an error if the user doesn't exist
 * @returns [{undefined}] [void]
 */
const checkUser = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error(`The user with the ID ${userId} doesn't exist`);
    return true;
  } catch (error) {
    const regex = /exist/gi;
    if (!regex.test(error.message))
      throw new Error(`Validation error, please try again`);
    throw error;
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  getUser,
  deleteUser,
  findByEmail,
  resetPassword,
  confirmToken,
  updatePassword,
  certifyToken,
  checkUser,
};
