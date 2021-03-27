import {Subscription} from '../value-objects/Subscription';

export interface SubscriptionRepository {
	stop(): Promise<void>;
	getAll(): Promise<Subscription[]>;
	getById(subscriptionId: string): Promise<Subscription>;
	createSubscription(subscription: Subscription): Promise<Subscription>;
	deleteSubscription(subscriptionId: string): Promise<string>;
}
