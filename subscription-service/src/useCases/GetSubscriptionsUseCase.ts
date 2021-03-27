import {SubscriptionDTO} from '../value-objects/Subscription';

export interface GetSubscriptionsUseCase {
	getSubscriptions(): Promise<SubscriptionDTO[]>;
}
