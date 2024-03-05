const fs = require('fs-extra');
const path = require('path');

(async () => {
  const emailRendererScriptPath = path.resolve(
    __dirname,
    '../../webapp-libs/webapp-emails/build/email-renderer/index.umd.js',
  );
  const emailRendererScriptDestinationPath = path.resolve(__dirname, 'runtime/email/renderer/index.umd.js')
  await fs.copy(emailRendererScriptPath, emailRendererScriptDestinationPath);
})();
