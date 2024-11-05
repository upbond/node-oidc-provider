/* eslint-disable no-console */

import * as path from 'node:path';
import * as url from 'node:url';

import { dirname } from 'desm';
import express from 'express'; // eslint-disable-line import/no-unresolved
import helmet from 'helmet';
import { Liquid } from 'liquidjs';

import Provider from '../lib/index.js'; // from 'oidc-provider';
import Account from './support/account.js';
import configuration from './support/configuration.js';
import routes from './routes/express.js';
import custom from './routes/custom.js';

const __dirname = dirname(import.meta.url);

const { PORT = 3000, ISSUER = `http://localhost:${PORT}` } = process.env;
configuration.findAccount = Account.findAccount;

const app = express();

// Initialize Liquid engine
const liquidEngine = new Liquid({
  root: path.join(__dirname, 'views'), // Set views folder
  extname: '.liquid', // Use .liquid as file extension for templates
});

// Use Liquid as the template engine
app.engine('liquid', liquidEngine.express()); 
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.set('view engine', 'liquid'); // Set Liquid as the view engine

// Configure Helmet with content security policy
const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
delete directives['form-action'];
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives,
  },
}));

let server;
try {
  let adapter;
  if (process.env.MONGODB_URI) {
    ({ default: adapter } = await import('./adapters/mongodb.js'));
    await adapter.connect();
  }

  const prod = process.env.NODE_ENV === 'production';

  const provider = new Provider(ISSUER, { adapter, ...configuration });

  if (prod) {
    app.enable('trust proxy');
    provider.proxy = true;

    app.use((req, res, next) => {
      if (req.secure) {
        next();
      } else if (req.method === 'GET' || req.method === 'HEAD') {
        res.redirect(url.format({
          protocol: 'https',
          host: req.get('host'),
          pathname: req.originalUrl,
        }));
      } else {
        res.status(400).json({
          error: 'invalid_request',
          error_description: 'do yourself a favor and only use https',
        });
      }
    });
  }
  
  // Use custom routes
  custom(app, provider, liquidEngine);
  routes(app, provider);
  app.use(provider.callback());

  // Start the server
  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}, check its /.well-known/openid-configuration`);
  });
} catch (err) {
  if (server?.listening) server.close();
  console.error(err);
  process.exitCode = 1;
}
