import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, parse, sep } from 'path';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { errorsHandler } from './../../../../helpers/v1/handlers/errorsHandler';
import { Request, Response } from 'express';
import Log, { LogInstance } from '../../../../models/v1/logs/log';
import generateRandomString from '../../../../helpers/v1/globals/generateRandomString';
import rootPath from '../../../../helpers/v1/paths/rootPath';

const createLog = async (req: Request, res: Response): Promise<LogInstance> => {
  const { failedUploads, successfulUploads } = req.body.validation;
  const { filePath } = req.body;
  try {
    const log = await Log.create({
      logType: 'products',
      successfulUploads: successfulUploads.length,
      failedUploads: failedUploads.length,
      errors: JSON.stringify(failedUploads),
      userId: req.body.userId,
      filePath,
    });
    return log;
  } catch (error: any) {
    return error;
  }
};

const findLog = async (req: Request): Promise<any> => {
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

const downloadLog = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const log = await Log.findByPk(id);

    if (!log)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: ReasonPhrases.NOT_FOUND,
        message: `Log #${id} doesn't exist`,
      });

    const errors = JSON.parse(log.errors);

    if (errors.length === 0)
      return res.status(StatusCodes.NO_CONTENT).json({
        statusCode: ReasonPhrases.NO_CONTENT,
        message: `The log #${id} doesn't have errors for downloading`,
      });

    const savingDir = join(rootPath(), 'storage', 'v1', 'logs', 'products'); // /src
    if (!existsSync(savingDir)) mkdirSync(savingDir, { recursive: true });

    const normalizedPath = join(...log.filePath.split(sep));
    const { dir, name } = parse(normalizedPath.replace('docs', 'logs'));
    const fileToDownload = join(dir, name) + '.txt';

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + generateRandomString(12) + '.txt' + '"'
    );

    if (existsSync(fileToDownload)) {
      return res.download(fileToDownload);
    }

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

const getLogs = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    errorsHandler(req, res, error);
  }
};

const getLog = async (req: Request, res: Response) => {
  try {
    const response = await findLog(req);
    if (!response.id) return res.status(StatusCodes.NOT_FOUND).json(response);
    return res.status(StatusCodes.OK).json(response);
  } catch (error: any) {
    errorsHandler(req, res, error);
  }
};

const deleteLog = async (req: Request, res: Response) => {
  try {
    const response = await findLog(req);
    if (!response.id) return res.status(StatusCodes.NOT_FOUND).json(response);
    await response.destroy();
    return res.status(StatusCodes.OK).json({
      statusCode: ReasonPhrases.OK,
      message: `Log #${response.id} was deleted!`,
    });
  } catch (error: any) {
    errorsHandler(req, res, error);
  }
};

export default {
  createLog,
  downloadLog,
  getLogs,
  getLog,
  deleteLog,
};
