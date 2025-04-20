import { Provider } from 'oidc-provider';

export class InteractionController {
  constructor(provider) {
    this.provider = provider;
  }

  async login(ctx) {
    const { uid, prompt, params } = await this.provider.interactionDetails(ctx.req, ctx.res);
    const client = await this.provider.Client.find(params.client_id);

    await ctx.render('login', {
      uid,
      prompt,
      params,
      client,
      title: 'Sign-in',
    });
  }

  async loginSubmit(ctx) {
    const { uid, prompt, params } = await this.provider.interactionDetails(ctx.req, ctx.res);
    
    // Here we'll integrate with Web3Auth MPC and DID generation
    // For now, we'll just use a mock DID
    const did = 'did:key:z6Mkw...';
    
    const result = {
      login: {
        account: ctx.request.body.login,
        did,
      },
    };

    await this.provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  }

  async consent(ctx) {
    const interaction = await this.provider.interactionDetails(ctx.req, ctx.res);
    const { prompt: { name, details }, params, session: { accountId } } = interaction;
    
    await ctx.render('consent', {
      uid: interaction.uid,
      prompt: name,
      details,
      params,
      title: 'Authorize',
      accountId,
    });
  }

  async consentSubmit(ctx) {
    const { prompt, params, session: { accountId } } = await this.provider.interactionDetails(ctx.req, ctx.res);
    
    let { grantId } = interaction;
    let grant;

    if (grantId) {
      grant = await this.provider.Grant.find(grantId);
    } else {
      grant = new this.provider.Grant({
        accountId,
        clientId: params.client_id,
      });
    }

    if (prompt.details.missingOIDCScope) {
      grant.addOIDCScope(prompt.details.missingOIDCScope.join(' '));
    }

    if (prompt.details.missingOIDCClaims) {
      grant.addOIDCClaims(prompt.details.missingOIDCClaims);
    }

    grantId = await grant.save();

    const consent = {};
    if (!interaction.grantId) {
      consent.grantId = grantId;
    }

    const result = { consent };
    await this.provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: true,
    });
  }
} 