const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const { Op } = require('sequelize');
const { Tag } = require('../../../config/db/models/index');
const errorsHandler = require('../../../helpers/handlers/errorsHandler');

const createTag = async (req, res) => {
  const { name } = req.body;
  try {
    const tag = await findOrFail(name);
    if (tag)
      return throwJSONResponse(
        res,
        StatusCodes.BAD_REQUEST,
        `The tag "${name}" exists already`
      );

    const newTag = await Tag.create({ name });
    return res.status(StatusCodes.CREATED).json(newTag);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    return res.status(StatusCodes.OK).json(tags);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const getTag = async (req, res) => {
  const { tagId } = req.params;
  try {
    const tag = await findOrFail(tagId);
    if (!tag) return throwJSONResponse(res);
    return res.status(StatusCodes.OK).json(tag);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const updateTag = async (req, res) => {
  const { tagId } = req.params;
  const { name } = req.body;
  try {
    const tag = await findOrFail(tagId);
    if (!tag) return throwJSONResponse(res);

    const updatedTag = await tag.update({ name });
    await updateTag.reload();
    return res.status(StatusCodes.OK).json(updateTag);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const deleteTag = async (req, res) => {
  const { tagId } = req.params;
  try {
    const tag = await findOrFail(tagId);
    if (!tag) return throwJSONResponse(res);

    await tag.destroy();

    return res.status(StatusCodes.OK).json(tag);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const findOrFail = async (tagRef) => {
  const tag = await Tag.findOne({
    where: {
      [Op.or]: [{ id: tagRef }, { name: tagRef }],
    },
  });
  return tag ? tag : false;
};

const throwJSONResponse = (
  response,
  statusCode = StatusCodes.NOT_FOUND,
  message = ReasonPhrases.NOT_FOUND
) => {
  response.status(StatusCodes.NOT_FOUND).json({
    statusCode,
    message,
  });
};

const checkTags = async (tagIDs) => {
  const tags = await Tag.findAll({
    where: {
      id: {
        [Op.in]: tagIDs,
      },
    },
  });

  if (tags.length < tagIDs.length)
    throw new Error('Some tags do not exist, please check and try again');

  return true;
};

module.exports = {
  checkTags,
  createTag,
  getTags,
  getTag,
  updateTag,
  deleteTag,
};
