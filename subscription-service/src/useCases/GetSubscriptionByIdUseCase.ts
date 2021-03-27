import {SubscriptionDTO} from '../value-objects/Subscription';

export interface GetSubscriptionUseCase {
	getSubscription(subscriptionId: string): Promise<SubscriptionDTO>;
}
