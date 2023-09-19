const AWS = require('@aws-sdk/client-ses');
const nodemailer = require('nodemailer');

const { renderEmail } = require('./renderer/index.umd.js');

const config = {
  awsEndpoint: process.env.AWS_ENDPOINT_URL,
  fromEmail: process.env.FROM_EMAIL,
};

const sesClient = new AWS.SES({
  endpoint: config.awsEndpoint,
});

exports.sendEmail = async function (event) {
  const { to, type } = event.detail || {};
  const { subject, html } = renderEmail(type, {
    ...event.detail,
  });

  return sesClient.sendEmail({
    Source: config.fromEmail,
    Destination: { ToAddresses: [to] },
    ReplyToAddresses: [config.fromEmail],
    Message: {
      Subject: { Charset: 'UTF-8', Data: subject },
      Body: { Html: { Charset: 'UTF-8', Data: html } },
    },
  });
};

exports.sendEmailLocal = async function (event) {
  const { to, type } = event.detail || {};
  const { subject, html } = renderEmail(type, {
    ...event.detail,
    webAppUrl: config.webAppUrl,
  });

  const transport = nodemailer.createTransport({
    host: 'mailcatcher',
    port: 1025,
  });
  transport.sendMail({ to, subject, html, from: config.fromEmail });
};
