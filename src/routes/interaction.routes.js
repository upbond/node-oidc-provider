import Router from '@koa/router';
import { InteractionController } from '../controllers/interaction.controller.js';

export const createInteractionRoutes = (provider) => {
  const router = new Router();
  const controller = new InteractionController(provider);

  router.get('/interaction/:uid/login', controller.login.bind(controller));
  router.post('/interaction/:uid/login', controller.loginSubmit.bind(controller));
  router.get('/interaction/:uid/consent', controller.consent.bind(controller));
  router.post('/interaction/:uid/consent', controller.consentSubmit.bind(controller));

  return router;
}; 