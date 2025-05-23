import { InvalidRequest } from '../../helpers/errors.js';
import instance from '../../helpers/weak_cache.js';
import isPlainObject from '../../helpers/_/is_plain_object.js';

/*
 * If claims parameter is provided and supported handles its validation
 * - should not be combined with rt none
 * - should be JSON serialized object with id_token or userinfo properties as objects
 * - claims.userinfo should not be used if authorization result is not access_token
 *
 * Merges requested claims with auth_time as requested if max_age is provided or require_auth_time
 * is configured for the client.
 *
 * Merges requested claims with acr as requested if acr_values is provided
 */
export default async function checkClaims(ctx, next) {
  const { params } = ctx.oidc;

  if (params.claims !== undefined) {
    const { claimsParameter, userinfo } = instance(ctx.oidc.provider).features;

    if (claimsParameter.enabled) {
      if (params.response_type === 'none') {
        throw new InvalidRequest('claims parameter should not be combined with response_type none');
      }

      let claims;

      try {
        claims = JSON.parse(params.claims);
      } catch (err) {
        throw new InvalidRequest('could not parse the claims parameter JSON');
      }

      if (!isPlainObject(claims)) {
        throw new InvalidRequest('claims parameter should be a JSON object');
      }

      if (claims.userinfo === undefined && claims.id_token === undefined) {
        throw new InvalidRequest('claims parameter should have userinfo or id_token properties');
      }

      if (claims.userinfo !== undefined && !isPlainObject(claims.userinfo)) {
        throw new InvalidRequest('claims.userinfo should be an object');
      }

      if (claims.id_token !== undefined && !isPlainObject(claims.id_token)) {
        throw new InvalidRequest('claims.id_token should be an object');
      }

      if (claims.userinfo && !userinfo.enabled) {
        throw new InvalidRequest('claims.userinfo should not be used since userinfo endpoint is not supported');
      }

      if (params.response_type === 'id_token' && claims.userinfo) {
        throw new InvalidRequest('claims.userinfo should not be used if access_token is not issued');
      }

      await claimsParameter.assertClaimsParameter?.(
        ctx,
        claims,
        ctx.oidc.client,
      );
    }
  }

  return next();
}
