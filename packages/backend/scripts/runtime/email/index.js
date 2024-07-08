let _renderEmail;

try {
  const { renderEmail } = require('./renderer/index.umd');
  _renderEmail = renderEmail;
} catch {
  _renderEmail = (emailType, emailData) => {
    const errorMsg =
      'Email renderer script is missing. Make sure `pnpm nx run webapp-emails:build` is run earlier and' +
      'packages/webapp-libs/webapp-emails/build/email-renderer/index.umd.js is copied into packages/backend/scripts/emails/renderer .';
    if (process.env.DEBUG !== 'True') {
      throw Error(errorMsg);
    }

    return {
      subject: emailType,
      html: `<!DOCTYPE html>
<html lang="en">
    <body>
      <h1>Error: Missing renderer script</h1>
      <p>${errorMsg}</p>
      <p>Email Type: ${emailType}</p>
      <p>Data: ${JSON.stringify(emailData)}</p>
    </body>
</html>
`,
    };
  };
}

module.exports = { renderEmail: _renderEmail };
