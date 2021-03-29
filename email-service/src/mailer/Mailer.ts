import * as mailer from 'nodemailer';

export interface Mail {
	from: string;
	to: string;
	subject: string;
	text: string;
	html: string;
}

interface Transport {
	sendMail(email: Mail): Promise<void>;
}

export interface Mailer {
	send(mail: Mail): Promise<void>;
}

export class SmtpMailer implements Mailer {
	private transporter: Transport;

	public constructor(smtpAddress: string, smtpPort: number) {
		this.transporter = mailer.createTransport({
			host: smtpAddress,
			port: smtpPort,
			secure: false,
			auth: {
				user: 'user@test.com',
				pass: 'pass',
			},
		});
	}

	public async send(mail: Mail): Promise<void> {
		await this.transporter.sendMail(mail);
	}
}
