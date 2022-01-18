import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { verify } from 'argon2';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import envConfig from '../../../config/v1/env/env.config';
import config from '../../../config';
import { PayloadToken } from '../../../types/v1/jwt/jwt.type';
import UsersService from '../users/users';
import { errorsHandler } from '../../../helpers/v1/handlers/errorsHandler';
import ShippingHandler from '../emails/sendEmails';

envConfig();

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountConfirmationPath } = req.body;
    req.body.signUp = true;
    const user: any = await UsersService.createUser(req, res);

    const confirmationURL = `${accountConfirmationPath}/${user.token}`;

    await ShippingHandler.sendEmail({
      to: user.email,
      subject: 'Confirm Account 🔐',
      file: 'confirmAccount.pug',
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
  } catch (error: any) {
    errorsHandler(req, res, error, error.message);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user: any = await UsersService.findByEmail(email);
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
        message: 'Passwords does not match',
      });

    const payload: PayloadToken = {
      sub: user.id,
      roles: user.roles,
      email: user.email,
      name: user.name,
    };

    const token = generateJWT(payload);
    return res.status(StatusCodes.OK).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      token,
    });
  } catch (error: any) {
    errorsHandler(req, res, error, error.message);
  }
};

const confirmAccount = async (req: Request, res: Response) => {
  try {
    const user: any = await UsersService.certifyToken(req, res);

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

const generateJWT = (payload: PayloadToken, ttl = '1h'): string => {
  const token: string = JWT.sign(payload, config()['jwt'].secret as string, {
    expiresIn: ttl,
  });
  return token;
};

const comparePasswords = async (
  hash: string,
  password: string
): Promise<boolean | never> => {
  try {
    if (!hash || !password)
      throw new Error('The hash and password parameters are required');

    const comparison = await verify(hash, password);
    if (!comparison) throw new Error('The passwords are not the same');

    return comparison;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export default { signUp, login, generateJWT, comparePasswords, confirmAccount };
