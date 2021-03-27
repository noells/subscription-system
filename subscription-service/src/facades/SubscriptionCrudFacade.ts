import {SubscriptionEvents} from '../events/SubscriptionEvents';
import {SubscriptionRepository} from '../repository/SubscriptionRepository';
import {CreateSubscriptionUseCase} from '../useCases/CreateSubscriptionUseCase';
import {DeleteSubscriptionUseCase} from '../useCases/DeleteSubscriptionUseCase';
import {GetSubscriptionUseCase} from '../useCases/GetSubscriptionByIdUseCase';
import {GetSubscriptionsUseCase} from '../useCases/GetSubscriptionsUseCase';
import {Subscription, SubscriptionDTO} from '../value-objects/Subscription';

export interface SubscriptionUseCases
	extends GetSubscriptionsUseCase,
		GetSubscriptionUseCase,
		CreateSubscriptionUseCase,
		DeleteSubscriptionUseCase {}

export class SubscriptionCrudFacade implements SubscriptionUseCases {
	private constructor(
		private readonly repository: SubscriptionRepository,
		private readonly subscriptionEvents: SubscriptionEvents,
	) {}

	public static of(repository: SubscriptionRepository, subscriptionEvents: SubscriptionEvents) {
		return new SubscriptionCrudFacade(repository, subscriptionEvents);
	}

	public async getSubscriptions(): Promise<SubscriptionDTO[]> {
		const subscriptions = await this.repository.getAll();
		return subscriptions.map((s) => s.asDTO());
	}

	public async getSubscription(subscriptionId: string): Promise<SubscriptionDTO> {
		const subscription = await this.repository.getById(subscriptionId);
		return subscription.asDTO();
	}

	public async createSubscription(data: Omit<SubscriptionDTO, 'subscriptionId'>): Promise<string> {
		const subscription = Subscription.fromDto(data);
		const createdSubscription = await this.repository.createSubscription(subscription);
		await this.subscriptionEvents.notifySubscriptionCreated(createdSubscription);

		return createdSubscription.asDTO().subscriptionId as string;
	}

	public async deleteSubscription(subscriptionId: string): Promise<string> {
		const subscription = await this.repository.getById(subscriptionId);
		await this.subscriptionEvents.notifySubscriptionDeleted(subscription);
		return this.repository.deleteSubscription(subscriptionId);
	}
}
