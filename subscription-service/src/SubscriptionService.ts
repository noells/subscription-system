import {RabbitSubscriptionEvents} from './events/RabbitSubscriptionEvents';
import {SubscriptionEvents} from './events/SubscriptionEvents';
import {SubscriptionCrudFacade} from './facades/SubscriptionCrudFacade';
import {MongoSubscriptionRepository} from './repository/MongoSubscriptionRepository';
import {SubscriptionRepository} from './repository/SubscriptionRepository';
import {SubscriptionRpcApi} from './rpc/SubscriptionRpcApi';

interface SubscriptionServiceConfig {
	rabbitAddress: string;
	mongoUri: string;
}

export class SubscriptionService {
	private rpcApi!: SubscriptionRpcApi;
	private subscriptionRepository!: SubscriptionRepository;
	private subscriptionEvents!: SubscriptionEvents;

	private constructor(private readonly config: SubscriptionServiceConfig) {}

	public static of(config: SubscriptionServiceConfig): SubscriptionService {
		return new SubscriptionService(config);
	}

	public async start(): Promise<void> {
		this.subscriptionRepository = await MongoSubscriptionRepository.start(this.config.mongoUri);
		this.subscriptionEvents = await RabbitSubscriptionEvents.start(this.config.rabbitAddress);

		const subscriptionFacade = SubscriptionCrudFacade.of(
			this.subscriptionRepository,
			this.subscriptionEvents,
		);
		this.rpcApi = await SubscriptionRpcApi.start(subscriptionFacade, this.config.rabbitAddress);
	}

	public async stop(): Promise<void> {
		await this.rpcApi.stop();
		await this.subscriptionRepository.stop();
		await this.subscriptionEvents.stop();
	}
}
