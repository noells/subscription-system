import {PublicServiceRestApi} from '../../../src/api/PublicServiceRestApi';
import portfinder from 'portfinder';
import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {expect} from 'chai';
import * as sinon from 'sinon';
import {SubscriptionFacade, SubscriptionUseCases} from '../../../src/facades/SubscriptionFacade';
import {SubscriptionDTO} from '../../../src/entities/Subscription';

const assertBadRequest = async <T>(response: AxiosResponse<T>): Promise<Chai.Assertion> =>
	expect(response.status).to.equals(400);

const assertBadRequests = async <T>(responses: Promise<AxiosResponse<T>>[]) =>
	(await Promise.all(responses)).map(assertBadRequest);

describe('tests/unit/api/PublicServiceRestApi', () => {
	let address: string;
	let port: number;
	let restApi: PublicServiceRestApi;
	let restClient: AxiosInstance;
	let subscriptionUseCasesMock: sinon.SinonStubbedInstance<SubscriptionUseCases>;

	before(async () => {
		address = '127.0.0.1';
		port = await portfinder.getPortPromise();
		subscriptionUseCasesMock = sinon.createStubInstance(SubscriptionFacade);

		restApi = await PublicServiceRestApi.start(address, port, {
			subscriptionUseCases: subscriptionUseCasesMock,
		});

		restClient = axios.create({
			baseURL: `http://${address}:${port}/`,
			maxRedirects: 0,
			validateStatus: () => true,
		});
	});

	after(async () => {
		await restApi.stop();
	});

	describe('When attacking the subscription endpoints', () => {
		it('should delegate a get subscriptions on the use cases', async () => {
			await restClient.get('/subscriptions');
			sinon.assert.calledOnce(subscriptionUseCasesMock.getSubscriptions);
		});

		it('should delegate a get subscription on the use cases', async () => {
			const id = Math.random().toString();
			await restClient.get(`/subscriptions/${id}`);
			sinon.assert.calledOnceWithExactly(subscriptionUseCasesMock.getSubscription, id);
		});

		it('should delegate a delete subscription on the use cases', async () => {
			const id = Math.random().toString();
			await restClient.delete(`/subscriptions/${id}`);
			sinon.assert.calledOnceWithExactly(subscriptionUseCasesMock.deleteSubscription, id);
		});

		it('should delegate a create subscription on the use cases', async () => {
			const subscription: Omit<SubscriptionDTO, 'subscriptionId'> = {
				email: 'test@test.com',
				birthDate: '12/4/76',
				consent: true,
				newsletterId: Math.random().toString(),
			};
			await restClient.post('/subscriptions', subscription);
			sinon.assert.calledOnceWithExactly(subscriptionUseCasesMock.createSubscription, subscription);
		});

		it('should throw an error when creating a subscription with wrong data', async () => {
			sinon.reset();
			const subscription = {
				email: 'test@test.com',
				birthDate: '12/4/76',
				consent: 1,
				newsletterId: Math.random().toString(),
			};
			await assertBadRequests([restClient.post('/subscriptions', subscription)]);

			sinon.assert.notCalled(subscriptionUseCasesMock.createSubscription);
		});
	});
});
