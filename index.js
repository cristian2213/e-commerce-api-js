const dotenv = require('dotenv');
const getEnvironment = require('./helpers/env/getEnvironment.helper');
dotenv.config({ path: getEnvironment() });

const express = require('express');
const cors = require('cors');
const { join } = require('path');
const swaggerUi = require('swagger-ui-express');
const routerV1 = require('./routes/v1/router');
const validateSchema = require('./helpers/env/validationSchema.helper');
const swagger = require('./swagger/swagger.json');

const app = express();
const port = process.env.APP_PORT || 3000;
const host = process.env.APP_HOST || 'localhost';
const swaggerDoc = swagger;

const bootstrap = async () => {
  try {
    await validateSchema();

    app.use(express.json());
    app.use(
      cors({
        origin: '*',
      })
    );

    app.use(
      '/storate-images',
      express.static(join(__dirname, 'storage', 'v1', 'images'))
    );

    app.use(
      '/storate-docs',
      express.static(join(__dirname, 'storage', 'v1', 'docs'))
    );

    app.use(
      '/storate-logs',
      express.static(join(__dirname, 'storage', 'v1', 'logs'))
    );

    app.use('/api/v1', routerV1);
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

    app.listen(port, host, () => {
      console.log(
        `**** Server's running on the host http://${host}:${port} ****`
      );
      console.log(
        `**** Swagger is running on the host http://${host}:${port}/api/v1/docs ****`
      );
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

bootstrap();

module.exports = app;
