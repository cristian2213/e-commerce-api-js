const { join } = require('path');
const { readFileSync } = require('fs');
const htmlToText = require('html-to-text');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const juice = require('juice');
const pug = require('pug');
const config = require('../../../config');
const {
  sendGrid: { SENDGRID_EMAIL_FROM, SENDGRID_API_KEY },
} = config();
const { rootPath } = require('../../../helpers/paths/path');

const transporter = nodemailer.createTransport(
  {
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '12e7b2ca6e641c',
      pass: 'f7912422296091',
    },
  }
  // nodemailerSendgrid({
  //   apiKey: configVariables.sendGrid.SENDGRID_API_KEY,
  // })
);

/**
 * generateHTML(req, res)
 * @param {string} file - File name to use
 * @param {Object} options - The data to output in the template
 * @description Function to generate an email template through a given file
 * @returns [{string}] [Returns all the email template in a big string]
 */
const generateHTML = (file, options) => {
  const { userName, info, confirmationURL, year } = options;
  const template = `${readFileSync(
    join(rootPath(), 'views', 'emails', 'confirmAccount', file),
    { encoding: 'utf-8' }
  )}`;
  let html = '';
  let lastPosition = null;
  // REVIEW To make this recursive and reusable
  [
    ['@username', userName],
    ['@emailInfo', info],
    ['@confirmationUrl', confirmationURL],
    ['@year', year],
  ].forEach((value) => {
    const lastIndex = template.search(value[0]);
    if (!lastPosition) {
      html += `${template.substring(0, lastIndex)}${value[1]}`;
    } else {
      const firstIndex = lastPosition + value[0].length;
      html += `${template.substring(firstIndex, lastIndex)}${value[1]}`; // It's not correctly parsing the variables
    }
    lastPosition = lastIndex - 1;
  });
  return juice(html);
};

/**
 * sendEmail(req, res)
 * @param {Object} options - The data to output in the email
 * @description Function to send emails
 * @returns [{null}] [void]
 */
const sendEmail = async (options) => {
  let {
    to,
    subject,
    file,
    htmlOptions: { confirmationURL, info, year, userName },
  } = options;

  if (!info) {
    info =
      'We are excited for you to start, you are almost ready to start enjoying CIFULLMA, Just click the big yellow button below to verify your email address.';
  }
  const html = generateHTML(file, { confirmationURL, info, year, userName });

  const msg = {
    to,
    from: SENDGRID_EMAIL_FROM,
    subject,
    text: htmlToText.htmlToText(html),
    html,
  };
  await transporter.sendMail(msg);
};

module.exports = { sendEmail, generateHTML };
