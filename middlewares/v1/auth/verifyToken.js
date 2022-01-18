const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const config = require('../../../config');
// import User from '../../../models/v1/users/user';
console.log(config);
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    if (!token)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "The token wasn't attached to the request",
      });

    const decodedToken = jwt.verify(token, config()['jwt'].secret);
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

export default verifyToken;
