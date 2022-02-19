const JWT = require('jsonwebtoken');
const { verify } = require('argon2');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const {
  createUser,
  certifyToken,
  findByEmail,
  registerUserConnections,
} = require('../users/users');
const errorsHandler = require('../../../helpers/handlers/errorsHandler');
const { sendEmail } = require('../emails/sendEmails');
const config = require('../../../config');
const {
  jwt: { secret },
} = config();

/**
 * signUp(req, res)
 * @param {Request} req
 * @param {Response} res
 * @description Function to sign up through email
 * @returns [{Object}] [Returns a Json object with the verify link]
 */
const signUp = async (req, res) => {
  try {
    const { accountConfirmationPath } = req.body;
    req.body.signUp = true;
    const user = await createUser(req, res);

    const confirmationURL = `${accountConfirmationPath}/${user.token}`;

    await sendEmail({
      to: user.email,
      subject: 'Confirm Account 🔐',
      file: 'index.html',
      htmlOptions: {
        userName: user.name,
        confirmationURL,
        info: false,
        year: new Date().getFullYear(),
      },
    });

    return res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "We've seen a confirmation email to your account",
      confirmationURL,
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * signIn(req, res)
 * @param {Request} req
 * @param {Response} res
 * @description Function to sign in through an email and password
 * @returns [{Object|Object}] [Returns a Json object with validation errors | Returns a Json object with an User object and the token]
 */
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findByEmail(email);
    if (!user)
      return res.status(StatusCodes.NOT_ACCEPTABLE).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: `The e-mail ${email} does not exist`,
      });

    if (!user.emailVerifiedAt)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: `E-mail ${email} hasn't been verified`,
      });

    const match = await comparePasswords(user.password, password);
    if (!match)
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'The password does not match',
      });

    const payload = {
      sub: user.id,
      roles: user.roles,
      email: user.email,
      name: user.name,
    };

    const jwtTimeToLive = 1000 * 60 * 60 + ''; // 1h

    const { token, ttl } = generateJWT(
      payload,
      +jwtTimeToLive + 1000 * 120 + ''
    );

    const response = await registerUserConnections(user.id);
    if (response.statusCode === 400) {
      return res.status(response.statusCode).json({
        statusCode: response.statusCode,
        message: "User can't log in with an active session",
      });
    }

    return res.status(StatusCodes.OK).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      token: {
        token,
        ttl: jwtTimeToLive,
      },
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

async function signOut(req, res) {
  const { sub: userId } = req.user;
  try {
    const response = await registerUserConnections(userId, 'disconnected');
    return res.status(response.statusCode).json({
      statusCode: response.statusCode,
      message:
        response.statusCode === 200
          ? 'User disconnected successfully'
          : "User can't be disconnected without before logging in",
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
}

/**
 * confirmAccount(req, res)
 * @param {Request} req
 * @param {Response} res
 * @description Function to confirm the user account through the email sent previously to the user email
 * @returns [{Object|Object}] [Returns a Json object with validation errors | Returns a Json object with a success message ]
 */
const confirmAccount = async (req, res) => {
  try {
    const user = await certifyToken(req, res);

    if (user === false) {
      return res.status(StatusCodes.FORBIDDEN).json({
        statusCode: StatusCodes.FORBIDDEN,
        message: 'Expired token, please generate a new token',
        hasValidToken: false,
        verifiedAccount: false,
      });
    }
    user.token = null;
    user.tokenExpiration = null;
    user.emailVerifiedAt = Date.now();
    await user.save();

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: ReasonPhrases.OK,
      hasValidToken: true,
      verifiedAccount: true,
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/**
 * generateJWT(payload, ttl = '1h')
 * @param {Object} payload - Data to fill the token
 * @param {string|null} ttl - Token lifetime, by default (1h)
 * @returns [{string}] [Returns the token]
 */
const generateJWT = (payload, ttl = '1h') => {
  const token = JWT.sign(payload, secret, { expiresIn: ttl });
  return { token, ttl };
};

/**
 * comparePasswords(has, password)
 * @param {string} hash - Password encryted previously
 * @param {string} password - User password in raw
 * @throws {Error} - Throw an error if the password doesn't match
 * @returns [{boolean}] [Returns true if the password matches or false otherwise.]
 */
const comparePasswords = async (hash, password) => {
  try {
    if (!hash || !password)
      throw new Error('The hash and password parameters are required');

    const comparison = await verify(hash, password);
    // if (!comparison) throw new Error('The passwords are not the same');
    return comparison;
  } catch {}
};

module.exports = {
  signUp,
  signIn,
  generateJWT,
  comparePasswords,
  confirmAccount,
  signOut,
};
