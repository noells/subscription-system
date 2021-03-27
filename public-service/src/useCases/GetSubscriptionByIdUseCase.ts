import {SubscriptionDTO} from '../entities/Subscription';

export interface GetSubscriptionUseCase {
	getSubscription(subscriptionId: string): Promise<SubscriptionDTO>;
}
