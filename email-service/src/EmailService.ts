import {RabbitSubscriber} from './lib/RabbitSubscriber';
import {Subscriber} from './lib/Subscriber';
import {SmtpMailer} from './mailer/Mailer';
import {MessageBrokerResource} from './resource/MessabeBrokerResource';

interface EmailServiceConfig {
	rabbitAddress: string;
	smtpAddress: string;
	smtpPort: number;
}

export class EmailService {
	private subscriber: Subscriber;
	private messageBrokerResource!: MessageBrokerResource;

	private constructor(private readonly config: EmailServiceConfig) {
		this.subscriber = new RabbitSubscriber(this.config.rabbitAddress, 'subscriptions');
	}

	public static of(config: EmailServiceConfig): EmailService {
		return new EmailService(config);
	}

	public async start(): Promise<void> {
		const mailer = new SmtpMailer(this.config.smtpAddress, this.config.smtpPort);
		await this.subscriber.init();
		this.messageBrokerResource = MessageBrokerResource.of(this.subscriber, mailer);
	}

	public async stop(): Promise<void> {
		await this.subscriber.uninit();
	}
}
