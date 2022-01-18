const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

// REVIEW Global validator for adding a global log of requests
const validationHandler = (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty())
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: erros.array() });
  next();
};

module.exports = validationHandler;
