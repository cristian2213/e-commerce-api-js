const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const config = require('../../../config');
const {
  jwt: { secret },
} = config();
const { User } = require('../../../config/db/models/index');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    if (!token)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "The token wasn't attached to the request",
      });

    const decodedToken = jwt.verify(token, secret);
    const user = await User.findByPk(decodedToken.sub);

    if (!user) throw new Error(`The user #${decodedToken.sub} doesn't exist`);

    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'The token is not valid',
    });
  }
};

module.exports = verifyToken;
