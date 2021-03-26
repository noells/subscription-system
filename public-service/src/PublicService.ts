import {PublicServiceRestApi} from './api/PublicServiceRestApi';
import {SubscriptionFacade} from './facades/SubscriptionFacade';

export class PublicService {
	private restIface!: PublicServiceRestApi;

	private constructor() {}

	public static of(): PublicService {
		return new PublicService();
	}

	public async start(): Promise<void> {
		const subscriptionFacade = new SubscriptionFacade();
		this.restIface = await PublicServiceRestApi.start('127.0.0.1', 8888, {
			subscriptionUseCases: subscriptionFacade,
		});
	}

	public async stop(): Promise<void> {
		await this.restIface.stop();
	}
}
