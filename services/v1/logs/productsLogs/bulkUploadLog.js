const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join, parse, sep } = require('path');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const errorsHandler = require('./../../../../helpers/handlers/errorsHandler');
const { Log } = require('../../../../config/db/models/index');
const generateRandomString = require('../../../../helpers/tokens/generateRandomString');
const { rootPath } = require('../../../../helpers/paths/path');

const createLog = async (req, res) => {
  const { failedUploads, successfulUploads } = req.body.validation;
  const { filePath } = req.body;
  try {
    const log = await Log.create({
      logType: 'product',
      successfulUploads: successfulUploads.length,
      failedUploads: failedUploads.length,
      errors: JSON.stringify(failedUploads),
      userId: req.body.userId,
      filePath,
    });
    return log;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const findLog = async (req) => {
  const { userId } = req.body;
  const id = req.body.logId ? req.body.logId : req.params.logId;
  const log = await Log.findOne({
    attributes: { exclude: ['errors', 'filePath', 'deletedAt'] },
    where: {
      id,
      userId,
    },
  });
  if (!log)
    return {
      statusCode: ReasonPhrases.NOT_FOUND,
      message: `Log #${id} doesn't exist`,
    };
  return log;
};

const downloadLog = async (req, res) => {
  const { logId } = req.params;
  try {
    const log = await Log.findByPk(logId);

    if (!log)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: ReasonPhrases.NOT_FOUND,
        message: `Log #${logId} doesn't exist`,
      });

    const errors = JSON.parse(log.errors);

    if (errors.length === 0)
      return res.status(StatusCodes.NO_CONTENT).json({
        statusCode: ReasonPhrases.NO_CONTENT,
        message: `The log #${logId} doesn't have errors for downloading`,
      });

    const savingDir = join(rootPath(), 'storage', 'logs', 'products');
    if (!existsSync(savingDir)) mkdirSync(savingDir, { recursive: true });

    const normalizedPath = join(...log.filePath.split(sep));
    const { dir, name } = parse(normalizedPath.replace('docs', 'logs')); // PARSE return an object with path information
    const fileToDownload = join(dir, name) + '.txt';

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + generateRandomString() + '.txt' + '"'
    );

    if (existsSync(fileToDownload)) {
      return res.download(fileToDownload);
    }

    // GENERATE file
    const totalErrors = errors.length;
    const txtFileContent = [];
    for (let i = 0; i < totalErrors; i++) {
      const { productRow, column, value, message } = errors[i];
      const content = `Row: ${productRow} - Column: ${column} \n \t Value: ${value} \n \t Error: ${message} \n \n`;
      txtFileContent.push(content);
    }

    writeFileSync(fileToDownload, txtFileContent.join(''), {
      encoding: 'utf-8',
    });

    return res.download(fileToDownload);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const getLogs = async (req, res) => {
  const { userId } = req.body;

  try {
    const logs = await Log.findAll({
      attributes: { exclude: ['errors', 'filePath', 'deletedAt'] },
      where: {
        id: userId,
      },
    });
    return res.status(StatusCodes.OK).json({
      logs,
      totalLog: logs.length,
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const getLog = async (req, res) => {
  try {
    const response = await findLog(req);
    if (!response.id) return res.status(StatusCodes.NOT_FOUND).json(response);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const deleteLog = async (req, res) => {
  try {
    const response = await findLog(req);
    if (!response.id) return res.status(StatusCodes.NOT_FOUND).json(response);
    await response.destroy();
    return res.status(StatusCodes.OK).json({
      statusCode: ReasonPhrases.OK,
      message: `Log #${response.id} was deleted!`,
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

module.exports = {
  createLog,
  downloadLog,
  getLogs,
  getLog,
  deleteLog,
};
