import {Subscription} from '../value-objects/Subscription';

export interface SubscriptionEvents {
	stop(): Promise<void>;
	notifySubscriptionCreated(subscription: Subscription): Promise<void>;
	notifySubscriptionDeleted(subscription: Subscription): Promise<void>;
}
