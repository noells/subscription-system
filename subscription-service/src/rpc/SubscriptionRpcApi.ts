import {SubscriptionUseCases} from '../facades/SubscriptionCrudFacade';
import {RpcMessage, RpcServer} from '../lib/RpcServer';
import {SimpleRpcServer} from '../lib/SimpleRpcServer';
import {logger} from '../logger/Logger';
import {
	CreateSubscriptionRpcRequest,
	DeleteSubscriptionRpcRequest,
	GetSubscriptionRpcRequest,
	GetSubscriptionsRpcRequest,
} from './RequestValidator';

export class SubscriptionRpcApi {
	private static readonly RPC_SUBSCRIPTION_TOPIC = 'subscriptions';
	private rpcServer: RpcServer;

	private constructor(private readonly useCases: SubscriptionUseCases, address: string) {
		this.rpcServer = new SimpleRpcServer(address, SubscriptionRpcApi.RPC_SUBSCRIPTION_TOPIC);
	}

	public static async start(
		useCases: SubscriptionUseCases,
		address: string,
	): Promise<SubscriptionRpcApi> {
		const rpcApi = new SubscriptionRpcApi(useCases, address);
		await rpcApi.start();
		return rpcApi;
	}

	private async start(): Promise<void> {
		await this.rpcServer.init();
		this.rpcServer.getRequests().subscribe(this.onMessage.bind(this));
	}

	public async stop(): Promise<void> {
		await this.rpcServer.uninit();
	}

	private async onMessage(rpcMessage: RpcMessage): Promise<void> {
		logger.info(
			`Received request for ${rpcMessage.request.method} with data: ${JSON.stringify(
				rpcMessage.request.payload,
			)}`,
		);

		if (GetSubscriptionsRpcRequest.is(rpcMessage.request)) {
			try {
				const subscriptions = await this.useCases.getSubscriptions();
				await rpcMessage.reply({subscriptions});
			} catch (err) {
				await rpcMessage.reply({error: err.toString()});
			}
		} else if (GetSubscriptionRpcRequest.is(rpcMessage.request)) {
			try {
				const subscription = await this.useCases.getSubscription(
					rpcMessage.request.payload.subscriptionId,
				);
				await rpcMessage.reply(subscription);
			} catch (err) {
				await rpcMessage.reply({error: err.toString()});
			}
		} else if (CreateSubscriptionRpcRequest.is(rpcMessage.request)) {
			try {
				const subscriptionId = await this.useCases.createSubscription(rpcMessage.request.payload);
				await rpcMessage.reply({subscriptionId});
			} catch (err) {
				await rpcMessage.reply({error: err.toString()});
			}
		} else if (DeleteSubscriptionRpcRequest.is(rpcMessage.request)) {
			try {
				const subscriptionId = await this.useCases.deleteSubscription(
					rpcMessage.request.payload.subscriptionId,
				);
				await rpcMessage.reply({subscriptionId});
			} catch (err) {
				await rpcMessage.reply({error: err.toString()});
			}
		} else {
			logger.warn(`Invalid request: ${rpcMessage.request}`);
			await rpcMessage.reply({error: 'BadRequest'});
		}
	}

	private async handleRequest<T>(
		f: (...args: any) => Promise<T>,
		reply: (data: T | {error: string}) => Promise<void>,
		...args: any[]
	): Promise<void> {
		try {
			const response = await f(...args);
			await reply(response);
		} catch (err) {
			logger.error(`error while performing request: ${err}`);
			await reply({error: err.toString()});
		}
	}
}
