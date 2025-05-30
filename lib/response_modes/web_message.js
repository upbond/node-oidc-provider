import jsesc from 'jsesc';

import pushInlineSha from '../helpers/script_src_sha.js';

const statusCodes = new Set([200, 400, 500]);

export default function webMessage(ctx, redirectUri, response) {
  ctx.type = 'html';

  if (!statusCodes.has(ctx.status)) {
    ctx.status = 'error' in response ? 400 : 200;
  }

  ctx.response.remove('X-Frame-Options');
  const csp = ctx.response.get('Content-Security-Policy');
  if (csp?.includes('frame-ancestors')) {
    ctx.response.set('Content-Security-Policy', csp.split(';')
      .filter((directive) => !directive.includes('frame-ancestors'))
      .join(';'));
  }

  const data = jsesc({
    response,
    redirect_uri: redirectUri,
  }, { json: true, isScriptContext: true });

  ctx.body = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Web Message Response</title>
</head>
<body>
  <script>${pushInlineSha(ctx, `
    (function(win, doc) {
      var data = ${data};

      var response = data.response;
      var redirect_uri = data.redirect_uri;

      var authorization_response = { type: 'authorization_response', response: response };

      var respond = function (target, origin) {
        doc.scripts[0].parentElement.removeChild(doc.scripts[0]);
        target.postMessage(authorization_response, origin);
        win.close();
      };

      var mainWin = win.opener || win.parent;
      respond(mainWin, redirect_uri);
    })(this, this.document);
  `)}</script>
</body>
</html>`;
}
