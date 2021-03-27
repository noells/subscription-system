import {SubscriptionDTO} from '../entities/Subscription';
import {RpcClient} from '../lib/RpcClient';
import {CreateSubscriptionUseCase} from '../useCases/CreateSubscriptionUseCase';
import {DeleteSubscriptionUseCase} from '../useCases/DeleteSubscriptionUseCase';
import {GetSubscriptionUseCase} from '../useCases/GetSubscriptionByIdUseCase';
import {GetSubscriptionsUseCase} from '../useCases/GetSubscriptionsUseCase';

export interface SubscriptionUseCases
	extends GetSubscriptionsUseCase,
		GetSubscriptionUseCase,
		CreateSubscriptionUseCase,
		DeleteSubscriptionUseCase {}

export class SubscriptionFacade implements SubscriptionUseCases {
	public constructor(private readonly rpcClient: RpcClient) {}

	public async init(): Promise<void> {
		await this.rpcClient.init();
	}

	public async uninit(): Promise<void> {
		await this.rpcClient.uninit();
	}

	public async getSubscriptions(): Promise<SubscriptionDTO[]> {
		const subscriptions = await this.rpcClient.rpc<{subscriptions: SubscriptionDTO[]}>({
			method: 'getSubscriptions',
		});

		return subscriptions.payload.subscriptions;
	}

	public async getSubscription(subscriptionId: string): Promise<SubscriptionDTO> {
		const subscription = await this.rpcClient.rpc<SubscriptionDTO>({
			method: 'getSubscription',
			payload: {
				subscriptionId,
			},
		});

		return subscription.payload;
	}

	public async createSubscription(
		subscription: Omit<SubscriptionDTO, 'subscriptionId'>,
	): Promise<string> {
		const createResponse = await this.rpcClient.rpc<{subscriptionId: string}>({
			method: 'createSubscription',
			payload: subscription,
		});

		return createResponse.payload.subscriptionId;
	}

	public async deleteSubscription(subscriptionId: string): Promise<string> {
		const deleteResponse = await this.rpcClient.rpc<{subscriptionId: string}>({
			method: 'deleteSubscription',
			payload: {
				subscriptionId,
			},
		});

		return deleteResponse.payload.subscriptionId;
	}
}
