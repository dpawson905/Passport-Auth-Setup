const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `Darrell Pawson <${process.env.EMAIL_FROM}>`;
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await sgMail.send(mailOptions);
  }

  async sendWelcome(title) {
    await this.send("welcome", `Welcome to ${title}`);
  }

  async resendToken() {
    await this.send(
      "resendToken",
      "Here is your token (valid for only 10 minutes)"
    );
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }

  async sendPasswordChange() {
    await this.send("passwordChanged", "Your password has been changed");
  }
};
