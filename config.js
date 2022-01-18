const environment = () => {
  return {
    app: {
      port: parseInt(process.env.APP_PORT),
      host: process.env.APP_HOST,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    sendGrid: {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      SENDGRID_EMAIL_FROM: process.env.SENDGRID_EMAIL_FROM,
    },
  };
};

module.exports = environment;
