import {Publisher} from '../lib/Publisher';
import {RabbitPublisher} from '../lib/RabbitPublisher';
import {Subscription} from '../value-objects/Subscription';
import {SubscriptionEvents} from './SubscriptionEvents';

export enum Events {
	subscriptionCreated = 'subscriptionCreated',
	subscriptionDeleted = 'subscriptionDeleted',
}

export class RabbitSubscriptionEvents implements SubscriptionEvents {
	private publisher: Publisher;
	private constructor(address: string) {
		this.publisher = new RabbitPublisher(address, 'subscriptions');
	}

	public static async start(address: string): Promise<RabbitSubscriptionEvents> {
		const events = new RabbitSubscriptionEvents(address);
		await events.start();

		return events;
	}

	private async start(): Promise<void> {
		await this.publisher.init();
	}

	public async stop(): Promise<void> {
		await this.publisher.uninit();
	}

	public async notifySubscriptionCreated(subscription: Subscription): Promise<void> {
		await this.publisher.publish({
			event: Events.subscriptionCreated,
			payload: subscription.asDTO(),
		});
	}
	public async notifySubscriptionDeleted(subscription: Subscription): Promise<void> {
		await this.publisher.publish({
			event: Events.subscriptionDeleted,
			payload: subscription.asDTO(),
		});
	}
}
