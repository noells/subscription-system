import {SubscriptionDTO} from '../entities/Subscription';

export interface GetSubscriptionsUseCase {
	getSubscriptions(): Promise<SubscriptionDTO[]>;
}
