import {SubscriptionDTO} from '../value-objects/Subscription';

export interface CreateSubscriptionUseCase {
	createSubscription(subscription: Omit<SubscriptionDTO, 'subscriptionId'>): Promise<string>;
}
