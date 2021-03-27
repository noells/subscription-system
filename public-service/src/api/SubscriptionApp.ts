import express, {Application, Request, Response} from 'express';
import {RestApp} from './RestApp';
import {logger} from '../logger/Logger';
import * as t from 'io-ts';
import {SubscriptionUseCases} from '../facades/SubscriptionFacade';
import {BadRequest} from 'http-errors';

export type Handler = (req: Request, res: Response) => Promise<void>;

export const handleErrors = (f: Handler) => async (req: Request, res: Response): Promise<void> => {
	const {method, path} = req;
	try {
		logger.info(`Received a request with method ${method} at path ${path}`);
		await f(req, res);
	} catch (e) {
		const status = e.status ?? 500;
		const error = 'status' in e ? e.message : 'Internal server error';
		logger.error(`Received an error while handling ${method} request ${path}: ${e.message}`);
		res.status(status).json({error});
	}
};

const CreateSubscriptionRequestValidator = t.intersection([
	t.type({
		email: t.string,
		birthDate: t.string,
		consent: t.boolean,
		newsletterId: t.string,
	}),
	t.partial({
		firstName: t.string,
		gender: t.string,
	}),
]);

export class SubscriptionApp implements RestApp {
	public constructor(private readonly useCases: SubscriptionUseCases) {}

	public getApp(): Application {
		const app = express();
		app.get('/', handleErrors(this.onGetSubscriptions.bind(this)));
		app.post('/', handleErrors(this.onCreateSubscriptions.bind(this)));
		app.get('/:id', handleErrors(this.onGetSubscription.bind(this)));
		app.delete('/:id', handleErrors(this.onDeleteSubscriptions.bind(this)));
		return app;
	}

	private async onGetSubscriptions(req: Request, res: Response): Promise<void> {
		logger.info('onGetSubscriptions');
		const subscriptions = await this.useCases.getSubscriptions();
		res.status(200).json({subscriptions});
	}

	private async onGetSubscription(req: Request, res: Response): Promise<void> {
		logger.info('onGetSubscription');
		const subscription = await this.useCases.getSubscription(req.params.id);
		res.status(200).json(subscription);
	}

	private async onCreateSubscriptions(req: Request, res: Response): Promise<void> {
		logger.info('onCreateSubscriptions');
		if (!CreateSubscriptionRequestValidator.is(req.body)) {
			logger.error('Invalid request body');
			throw new BadRequest('invalid request body');
		}
		const subscriptionId = await this.useCases.createSubscription(req.body);
		res.status(201).json({subscriptionId});
	}

	private async onDeleteSubscriptions(req: Request, res: Response): Promise<void> {
		logger.info('onDeleteSubscription');
		const requestId = req.params.id;
		await this.useCases.deleteSubscription(requestId);
		res.status(200).json({requestId});
	}
}
