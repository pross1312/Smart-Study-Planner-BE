import nodemailer, {Transporter, SendMailOptions} from "nodemailer";
import {Validator} from "./validator";
import {debugLog} from "../log/logger";

const mailerEmail = process.env.MAILER;
const mailerPassword = process.env.MAILER_PASSWORD;

interface SendMailResult {
    accepted: Array<string>;
    rejected: Array<string>;
    ehlo: Array<string>;
    envelopeTime: number;
    messageTime: number;
    messageSize: number;
    response: string;
    envelope: {
        from: string;
        to: Array<string>;
    };
    messageId: string;
}

const mailerConfig = {
    service: "gmail",
    auth: {
        user: mailerEmail,
        pass: mailerPassword,
    }
};

const Mailer = {
    async send(to: string, subject: string, html: string): Promise<SendMailResult> {
        return new Promise((resolve, reject) => {
            if (!Validator.isEmail(to)) reject("Trying to send to invalid email");

            const transporter: Transporter = nodemailer.createTransport(mailerConfig);
            const mailOptions = {
                from: "smartstudyplanner@gmail.com",
                to,
                subject,
                html
            };
            debugLog("Sent mail: ", mailOptions);
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        })
    }
};

export {Mailer, SendMailResult};
