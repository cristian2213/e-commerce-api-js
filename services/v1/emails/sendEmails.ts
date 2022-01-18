import { join } from 'path';
import htmlToText from 'html-to-text';
import nodemailer from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';
import juice from 'juice';
import pug from 'pug';
import envConfig from '../../../config/v1/env/env.config';
import config from '../../../config';
import {
  HTMLOptions,
  SendEmailOptions,
} from '../../../types/v1/email/email.type';

envConfig();
const configVariables = config();

const transporter = nodemailer.createTransport(
  {
    // development mode
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '1dd6e3a4e47cfe',
      pass: '7fa4facf793a1c',
    },
  }
  // nodemailerSendgrid({
  //   apiKey: configVariables.sendGrid.SENDGRID_API_KEY,
  // })
);

// NOTE Tasks: create the html to the email and create a shedule for sending email to the people who haven't confirmed their emails
const generateHTML = (file: string, options: HTMLOptions) => {
  const html = pug.renderFile(
    join(
      __dirname,
      '..',
      '..',
      '..',
      'views',
      'emails',
      'confirmAccount',
      file
    ),
    options
  );

  return juice(html);
};

const sendEmail = async (options: SendEmailOptions) => {
  let {
    to,
    subject,
    file,
    htmlOptions: { confirmationURL, info, year, userName },
  } = options;

  if (!info) {
    info =
      "we're excited to have you get started, you are almost ready to start enjoying, CiFullMa. Simply click the big yellow button below to verify your email address.";
  }
  const html = generateHTML(file, { confirmationURL, info, year, userName });

  const msg = {
    to,
    from: configVariables.sendGrid.SENDGRID_EMAIL_FROM,
    subject,
    text: htmlToText.htmlToText(html),
    html,
  };
  await transporter.sendMail(msg);
};

export default { sendEmail, generateHTML };
