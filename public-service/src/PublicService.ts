import {PublicServiceRestApi} from './api/PublicServiceRestApi';
import {SubscriptionFacade} from './facades/SubscriptionFacade';
import {RpcClient} from './lib/RpcClient';
import {SimpleRpcClient} from './lib/SimpleRpcClient';

interface PublicServiceConfig {
	httpAddress: string;
	httpPort: number;
	rabbitAddress: string;
}

export class PublicService {
	private rpcClient: RpcClient;
	private restIface!: PublicServiceRestApi;

	private constructor(private readonly config: PublicServiceConfig) {
		this.rpcClient = new SimpleRpcClient(this.config.rabbitAddress, 'subscriptions');
	}

	public static of(config: PublicServiceConfig): PublicService {
		return new PublicService(config);
	}

	public async start(): Promise<void> {
		await this.rpcClient.init();
		const subscriptionFacade = new SubscriptionFacade(this.rpcClient);
		this.restIface = await PublicServiceRestApi.start(
			this.config.httpAddress,
			this.config.httpPort,
			{
				subscriptionUseCases: subscriptionFacade,
			},
		);
	}

	public async stop(): Promise<void> {
		await this.restIface.stop();
		await this.rpcClient.uninit();
	}
}
