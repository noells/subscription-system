import {SubscriptionDTO} from '../entities/Subscription';

export interface CreateSubscriptionUseCase {
	createSubscription(subscription: Omit<SubscriptionDTO, 'subscriptionId'>): Promise<string>;
}
