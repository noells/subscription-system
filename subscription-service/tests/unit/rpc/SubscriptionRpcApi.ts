import {SimpleRpcClient} from '../../../src/lib/SimpleRpcClient';
import {SubscriptionRpcApi} from '../../../src/rpc/SubscriptionRpcApi';
import * as sinon from 'sinon';
import {
	SubscriptionCrudFacade,
	SubscriptionUseCases,
} from '../../../src/facades/SubscriptionCrudFacade';
import * as uuid from 'uuid';
import {expect} from 'chai';

describe('tests/unit/SubscriptionRpcApi', () => {
	describe('Given the rpc iface is up and running', () => {
		let rpcApi: SubscriptionRpcApi;
		let rpcClient: SimpleRpcClient;
		let useCasesMock: sinon.SinonStubbedInstance<SubscriptionUseCases>;

		before(async () => {
			useCasesMock = sinon.createStubInstance(SubscriptionCrudFacade);
			rpcApi = await SubscriptionRpcApi.start(useCasesMock, 'amqp://localhost');

			rpcClient = new SimpleRpcClient('amqp://localhost', 'subscriptions');
			await rpcClient.init();
		});

		after(async () => {
			await rpcClient.uninit();
			await rpcApi.stop();
		});

		it('should be possible to getSubscriptions', async () => {
			await rpcClient.rpc({method: 'getSubscriptions'});
			sinon.assert.calledOnce(useCasesMock.getSubscriptions);
		});

		it('should be possible to getSubscription by id', async () => {
			const subscriptionId = uuid.v4();
			await rpcClient.rpc({method: 'getSubscription', payload: {subscriptionId}});
			sinon.assert.calledOnceWithExactly(useCasesMock.getSubscription, subscriptionId);
		});

		it('should be possible to create a subscription', async () => {
			const subscription = {
				email: 'test@test.com',
				birthDate: '12/4/76',
				consent: true,
				newsletterId: Math.random().toString(),
			};
			const subscriptionId = uuid.v4();
			useCasesMock.createSubscription.resolves(subscriptionId);

			const receivedSubscriptionId = await rpcClient.rpc<{subscriptionId: string}>({
				method: 'createSubscription',
				payload: subscription,
			});
			sinon.assert.calledOnceWithExactly(useCasesMock.createSubscription, subscription);
			expect(receivedSubscriptionId.payload.subscriptionId).to.equals(subscriptionId);
		});

		it('should be possible to delete a subscription', async () => {
			const subscriptionId = uuid.v4();
			useCasesMock.deleteSubscription.resolves(subscriptionId);
			const response = await rpcClient.rpc<{subscriptionId: string}>({
				method: 'deleteSubscription',
				payload: {subscriptionId},
			});
			sinon.assert.calledOnceWithExactly(useCasesMock.deleteSubscription, subscriptionId);
			expect(response.payload.subscriptionId).to.equals(subscriptionId);
		});

		it('a non valid request should receive an error', async () => {
			const errorRequest = await rpcClient.rpc<{error: string}>({method: 'invalid'});
			expect(errorRequest.payload).to.deep.equals({error: 'BadRequest'});
		});
	});
});
