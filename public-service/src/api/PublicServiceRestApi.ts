import {json, urlencoded} from 'body-parser';
import express, {Application} from 'express';
import http, {Server} from 'http';
import {SubscriptionUseCases} from '../facades/SubscriptionFacade';
import {logger} from '../logger/Logger';
import {SubscriptionApp} from './SubscriptionApp';

interface RestApiUseCases {
	subscriptionUseCases: SubscriptionUseCases;
}

export class PublicServiceRestApi {
	private app!: Application;
	private server!: Server;

	private constructor(private readonly port: number, private readonly useCases: RestApiUseCases) {}

	public static async start(
		port: number,
		useCases: RestApiUseCases,
	): Promise<PublicServiceRestApi> {
		const api = new PublicServiceRestApi(port, useCases);
		await api.start();

		return api;
	}

	private async start(): Promise<void> {
		this.app = express();
		this.app.use(urlencoded({extended: false}));
		this.app.use(json());

		const subscriptionApp = new SubscriptionApp(this.useCases.subscriptionUseCases);
		this.app.use('/subscriptions', subscriptionApp.getApp());

		this.server = http.createServer(this.app);

		logger.info(`Starting HTTP server on port ${this.port}`);
		await new Promise<void>((res) => this.server.listen(this.port, res));
	}

	public async stop(): Promise<void> {
		logger.info('Stopping HTTP server...');
		this.server.removeAllListeners();
		await this.server.close();
		logger.info('HTTP Server stopped');
	}
}
