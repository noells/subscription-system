import {CreateSubscriptionUseCase} from '../useCases/CreateSubscriptionUseCase';
import {GetSubscriptionsUseCase} from '../useCases/GetSubscriptionsUseCase';
import {DeleteSubscriptionUseCase} from '../useCases/DeleteSubscriptionUseCase';
import {SubscriptionDTO} from '../entities/Subscription';
import {GetSubscriptionUseCase} from '../useCases/GetSubscriptionByIdUseCase';

export interface SubscriptionUseCases
	extends GetSubscriptionsUseCase,
		GetSubscriptionUseCase,
		CreateSubscriptionUseCase,
		DeleteSubscriptionUseCase {}

export class SubscriptionFacade implements SubscriptionUseCases {
	public async getSubscriptions(): Promise<SubscriptionDTO[]> {
		throw new Error('Method not implemented.');
	}

	public async getSubscription(subscriptionId: string): Promise<SubscriptionDTO> {
		throw new Error('Method not implemented.');
	}

	public async createSubscription(
		subscription: Omit<SubscriptionDTO, 'subscriptionId'>,
	): Promise<string> {
		throw new Error('Method not implemented.');
	}

	public async deleteSubscription(subscriptionId: string): Promise<string> {
		throw new Error('Method not implemented.');
	}
}
