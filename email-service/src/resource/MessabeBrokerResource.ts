import {RabbitSubscriber} from '../lib/RabbitSubscriber';
import {Subscriber} from '../lib/Subscriber';
import {ConsumeMessage} from 'amqplib';
import {logger} from '../logger/Logger';
import * as t from 'io-ts';
import {Mailer} from '../mailer/Mailer';
import {
	createdSubscriptionAsMail,
	deletedSubscriptionAsMail,
} from '../mail-adapters/SubscriptionAdapter';

const Subscription = t.intersection([
	t.type({
		subscriptionId: t.string,
		email: t.string,
		birthDate: t.string,
		consent: t.boolean,
		newsletterId: t.string,
	}),
	t.partial({
		firstName: t.string,
		gender: t.string,
	}),
]);

export const SubscriptionCreated = t.type({
	event: t.literal('subscriptionCreated'),
	payload: Subscription,
});

export const SubscriptionDeleted = t.type({
	event: t.literal('subscriptionDeleted'),
	payload: Subscription,
});

export class MessageBrokerResource {
	private constructor(private readonly subscriber: Subscriber, private readonly mailer: Mailer) {}

	public static of(subscriber: Subscriber, mailer: Mailer): MessageBrokerResource {
		const resource = new MessageBrokerResource(subscriber, mailer);
		resource.init();

		return resource;
	}

	private init() {
		this.subscriber
			.getMessages('subscriptionCreated')
			.subscribe(this.onSubscriptionCreated.bind(this));

		this.subscriber
			.getMessages('subscriptionDeleted')
			.subscribe(this.onSubscriptionDeleted.bind(this));
	}

	private async onSubscriptionCreated(msg: ConsumeMessage): Promise<void> {
		logger.info(`onSubscriptionCreated event: ${msg.content.toString()}`);
		const message = JSON.parse(msg.content.toString());
		if (SubscriptionCreated.is(message)) {
			logger.info('Sending subscription created email');
			const mail = createdSubscriptionAsMail(message.payload);
			return this.mailer.send(mail);
		}

		logger.error('Subscription Created Event not valid');
	}

	private async onSubscriptionDeleted(msg: ConsumeMessage): Promise<void> {
		logger.info(`onSubscriptionDeleted event: ${msg.content.toString()}`);
		const message = JSON.parse(msg.content.toString());
		if (SubscriptionDeleted.is(message)) {
			logger.info('Sending subscription deleted email');
			const mail = deletedSubscriptionAsMail(message.payload);
			return this.mailer.send(mail);
		}

		logger.error('Subscription Deleted Event not valid');
	}
}
