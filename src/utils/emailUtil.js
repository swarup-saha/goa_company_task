var SibApiV3Sdk = require("sib-api-v3-sdk");
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
  process.env.SENDGRID_API_KEY;
const sendMail = (email, subject, message) => {
  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail({
      sender: { email: "noreply@swarup.com", name: "swarup" },
      subject: subject,
      htmlContent: `<!DOCTYPE html><html><body><p> ${message} </p></body></html>`,
      messageVersions: [
        {
          to: [
            {
              email: email,
            },
          ],
        },
      ],
    })
    .then(
      function (data) {
        console.log(data);
      },
      function (error) {
        console.error(error);
      }
    );
};

module.exports = {
  sendMail,
};
