import {RpcClient} from '../../src/lib/RpcClient';
import {SimpleRpcClient} from '../../src/lib/SimpleRpcClient';
import {SubscriptionDTO} from '../../src/value-objects/Subscription';

export class SubscriptionApi {
	private rpcClient: RpcClient;

	public constructor() {
		this.rpcClient = new SimpleRpcClient('amqp://localhost', 'subscriptions');
	}

	public async start() {
		await this.rpcClient.init();
	}

	public async stop() {
		await this.rpcClient.uninit();
	}

	public async getAllSubscriptions(): Promise<SubscriptionDTO[]> {
		const response = await this.rpcClient.rpc<{subscriptions: SubscriptionDTO[]}>({
			method: 'getSubscriptions',
		});

		return response.payload.subscriptions;
	}

	public async getSubscriptionById(subscriptionId: string): Promise<SubscriptionDTO> {
		const response = await this.rpcClient.rpc<SubscriptionDTO>({
			method: 'getSubscription',
			payload: {subscriptionId},
		});

		return response.payload;
	}

	public async createSubscription(
		subscriptionData: Omit<SubscriptionDTO, 'subscriptionId'>,
	): Promise<{subscriptionId: string}> {
		const response = await this.rpcClient.rpc<{subscriptionId: string}>({
			method: 'createSubscription',
			payload: subscriptionData,
		});

		return response.payload;
	}

	public async deleteSubscription(subscriptionId: string): Promise<{subscriptionId: string}> {
		const response = await this.rpcClient.rpc<{subscriptionId: string}>({
			method: 'deleteSubscription',
			payload: {subscriptionId},
		});

		return response.payload;
	}
}
