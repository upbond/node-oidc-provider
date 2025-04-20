import Koa from 'koa';
import mount from 'koa-mount';
import cors from '@koa/cors';
import bodyParser from 'koa-body';
import views from '@koa/ejs';
import { Provider } from 'oidc-provider';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createInteractionRoutes } from './routes/interaction.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const port = process.env.PORT || 3000;

// Initialize OIDC Provider
const configuration = {
  clients: [{
    client_id: 'oidc-client',
    client_secret: 'some-secret',
    grant_types: ['authorization_code'],
    redirect_uris: ['http://localhost:3000/callback'],
    response_types: ['code'],
  }],
  features: {
    // Core OIDC features
    devInteractions: { enabled: true }, // ❗ Required for development
    claimsParameter: { enabled: true },
    clientCredentials: { enabled: true },
    encryption: { enabled: true },
    introspection: { enabled: true },
    registration: { enabled: true },
    revocation: { enabled: true },
    userinfo: { enabled: true },
    
    // JWT features
    jwtIntrospection: { enabled: true },
    jwtResponseModes: { enabled: true },
    jwtUserinfo: { enabled: true },
    
    // Resource indicators
    resourceIndicators: { enabled: true }, // ❗ Required for resource indicators
    
    // Device flow
    deviceFlow: { enabled: true },
    
    // DPoP
    dPoP: { enabled: true },
    
    // mTLS
    mTLS: { enabled: true },
    
    // Request objects
    requestObjects: { enabled: true },
    
    // Pushed Authorization Requests
    pushedAuthorizationRequests: { enabled: true },
    
    // Registration Management
    registrationManagement: { enabled: true },
    
    // Logout features
    rpInitiatedLogout: { enabled: true },
    backchannelLogout: { enabled: true },
    
    // CIBA
    ciba: { enabled: true },
    
    // FAPI
    fapi: { enabled: false },
  },
  claims: {
    openid: ['sub', 'did'],
    profile: ['name', 'email'],
  },
  interactions: {
    url(ctx, interaction) {
      return `/interaction/${interaction.uid}`;
    },
  },
  cookies: {
    keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
  },
  ttl: {
    AccessToken: 1 * 60 * 60, // 1 hour in seconds
    AuthorizationCode: 10 * 60, // 10 minutes in seconds
    IdToken: 1 * 60 * 60, // 1 hour in seconds
    DeviceCode: 10 * 60, // 10 minutes in seconds
    RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds
  },
  formats: {
    default: 'opaque',
    AccessToken: 'jwt',
    ClientCredentials: 'jwt',
  },
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  responseTypes: ['code', 'id_token', 'id_token token', 'code id_token', 'code token', 'code id_token token'],
  subjectTypes: ['public', 'pairwise'],
  pairwiseSalt: 'some-salt',
  conformIdTokenClaims: true,
  pkce: {
    methods: ['S256'],
    required: () => false,
  },
  rotateRefreshToken: true,
  clientBasedCORS: () => true,
  findAccount: async (ctx, id) => {
    return {
      accountId: id,
      async claims() {
        return {
          sub: id,
          did: 'did:key:z6Mkw...',
          name: 'John Doe',
          email: 'john@example.com',
        };
      },
    };
  },
};

const provider = new Provider('http://localhost:3000', configuration);

// Configure EJS
views(app, {
  root: join(__dirname, 'views'),
  layout: false,
  viewExt: 'ejs',
  cache: false,
  debug: true,
});

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message,
      error_description: err.error_description,
    };
  }
});

// Enable CORS
app.use(cors());

// Enable body parsing
// app.use(bodyParser());

// Mount OIDC routes
app.use(mount('/', provider.app));

// Mount interaction routes
const interactionRoutes = createInteractionRoutes(provider);
app.use(interactionRoutes.routes());
app.use(interactionRoutes.allowedMethods());

// Serve static files
app.use(mount('/assets', async (ctx) => {
  ctx.body = 'Static files will be served here';
}));

// Start server
app.listen(port, () => {
  console.log(`OIDC Provider listening at http://localhost:${port}`);
  console.log(`Discovery endpoint: http://localhost:${port}/oidc/.well-known/openid-configuration`);
}); 