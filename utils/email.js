const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const Transport = require("nodemailer-smtp-transport");


//new Email(user, url).sendWelcome();
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Amrith <${process.env.EMAIL_FROM}>`;
    };

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                host: process.env.BREVO_HOST,
                port: process.env.BREVO_PORT,
                secure: false,
                auth: {
                    user: process.env.BREVO_USER,
                    pass: process.env.BREVO_APIKEY
                }
            });
        }
        else {
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        }
    }

    async send(template, subject) {
        //render html based email based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        //define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html)
        };

        //create a transport and send email

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }
}

// const sendEmail = async (options) => {
//     //create a transporter
//     // const transporter = nodemailer.createTransport({
//     //     host: process.env.EMAIL_HOST,
//     //     port: process.env.EMAIL_PORT,
//     //     auth: {
//     //         user: process.env.EMAIL_USERNAME,
//     //         pass: process.env.EMAIL_PASSWORD
//     //     }
//     //     //activate in gmail "less secure app" option
//     // });

//     //define the email options
//     const mailOptions = {
//         from: 'Amrith <amrith@gmail.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }
//     //send the email
//     await transporter.sendMail(mailOptions);
// }

// for nodemailer
// module.exports = sendEmail;