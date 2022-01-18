const { StatusCodes, ReasonPhrases } = require('http-status-codes');

const errorsHandler = (_req, res, error, msg) => {
  console.log(error);
  const errorCode = StatusCodes.INTERNAL_SERVER_ERROR;
  return res.status(errorCode).json({
    statusCode: errorCode,
    message: msg ? msg : ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

module.exports = errorsHandler;
