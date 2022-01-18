const errorsHandler = require('../../../helpers/handlers/errorsHandler');
// import Role from '../../../models/v1/users/roles';

const createRoles = async (req: any, res: Response) => {
  try {
    const { roles } = req.body;
    const userRoles = [];

    for (let i = 0; i < roles.length; i++) {
      const role = await Role.create({
        name: roles[i].id || roles[i],
        userId: req.body.id || req.user.sub,
      });
      userRoles.push(role.name);
    }
    return userRoles;
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const deleteRoles = async (req: Request, res: Response) => {
  try {
    const { roles } = req.body;
    for (let i = 0; i < roles.length; i++) {
      await Role.destroy({
        where: {
          id: roles[i].id,
        },
      });
    }
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

export default {
  createRoles,
  deleteRoles,
};
