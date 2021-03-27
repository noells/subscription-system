import {SubscriptionCrudFacade} from '../../../src/facades/SubscriptionCrudFacade';
import {SubscriptionRepository} from '../../../src/repository/SubscriptionRepository';
import * as sinon from 'sinon';
import {Subscription, SubscriptionDTO} from '../../../src/value-objects/Subscription';
import {SubscriptionEvents} from '../../../src/events/SubscriptionEvents';
import {expect} from 'chai';
import * as uuid from 'uuid';

describe('tests/unit/facades/SubscriptionCrudFacade', () => {
	describe('Given the facade is up and running', () => {
		let facade: SubscriptionCrudFacade;
		let repositoryMock: sinon.SinonStubbedInstance<SubscriptionRepository>;
		let subscriptionEventsMock: sinon.SinonStubbedInstance<SubscriptionEvents>;

		before(() => {
			repositoryMock = {
				getAll: sinon.stub(),
				getById: sinon.stub(),
				createSubscription: sinon.stub(),
				deleteSubscription: sinon.stub(),
				stop: sinon.stub(),
			};
			subscriptionEventsMock = {
				notifySubscriptionCreated: sinon.stub(),
				notifySubscriptionDeleted: sinon.stub(),
				stop: sinon.stub(),
			};
			facade = SubscriptionCrudFacade.of(repositoryMock, subscriptionEventsMock);
		});

		describe('When getting all subscriptions', () => {
			let subscriptions: Subscription[];

			beforeEach(() => {
				subscriptions = [
					Subscription.fromDto({
						subscriptionId: uuid.v4(),
						email: 'test@test.com',
						birthDate: '12/4/76',
						consent: true,
						newsletterId: Math.random().toString(),
						gender: 'trans',
					}),
					Subscription.fromDto({
						subscriptionId: uuid.v4(),
						gender: 'female',
						email: 'test@test.com',
						birthDate: '12/4/76',
						consent: true,
						newsletterId: Math.random().toString(),
					}),
				];
				repositoryMock.getAll.resolves(subscriptions);
			});

			it('should return all subscriptions', async () => {
				const expectedSubscriptions = await facade.getSubscriptions();
				expect(expectedSubscriptions).to.have.deep.members(subscriptions.map((s) => s.asDTO()));
			});
		});

		describe('When getting an specific subscription', () => {
			let subscriptions: Subscription[];

			beforeEach(() => {
				subscriptions = [
					Subscription.fromDto({
						subscriptionId: uuid.v4(),
						email: 'test@test.com',
						birthDate: '12/4/76',
						consent: true,
						newsletterId: Math.random().toString(),
						gender: 'trans',
					}),
					Subscription.fromDto({
						subscriptionId: uuid.v4(),
						gender: 'female',
						email: 'test@test.com',
						birthDate: '12/4/76',
						consent: true,
						newsletterId: Math.random().toString(),
					}),
				];
				repositoryMock.getById
					.withArgs(subscriptions[1].asDTO().subscriptionId as string)
					.resolves(subscriptions[1]);
			});

			it('should return a subscription', async () => {
				const subscription = await facade.getSubscription(
					subscriptions[1].asDTO().subscriptionId as string,
				);

				expect(subscription).to.deep.equals(subscriptions[1].asDTO());
			});
		});

		describe('When creating a subscription', () => {
			let subscription: SubscriptionDTO;
			let subscriptionId: string;
			let resolvedSubscription: Subscription;

			beforeEach(() => {
				sinon.reset();
				subscriptionId = uuid.v4();
				subscription = {
					gender: 'female',
					email: 'test@test.com',
					birthDate: '12/4/76',
					consent: true,
					newsletterId: Math.random().toString(),
				};

				resolvedSubscription = Subscription.fromDto({subscriptionId, ...subscription});
				repositoryMock.createSubscription
					.withArgs(Subscription.fromDto(subscription))
					.resolves(resolvedSubscription);
			});

			it('should create a subscription', async () => {
				const createdId = await facade.createSubscription(subscription);
				expect(createdId).to.equals(subscriptionId);
			});

			it('should notify that a subscription has been created', async () => {
				await facade.createSubscription(subscription);
				sinon.assert.calledOnceWithExactly(
					subscriptionEventsMock.notifySubscriptionCreated,
					resolvedSubscription,
				);
			});
		});

		describe('When deleting a subscription', () => {
			let subscription: Subscription;
			let subscriptionId: string;

			beforeEach(() => {
				sinon.reset();
				subscriptionId = uuid.v4();
				subscription = Subscription.fromDto({
					subscriptionId,
					gender: 'female',
					email: 'test@test.com',
					birthDate: '12/4/76',
					consent: true,
					newsletterId: Math.random().toString(),
				});
				repositoryMock.getById.withArgs(subscriptionId).resolves(subscription);
				repositoryMock.deleteSubscription.withArgs(subscriptionId).resolves(subscriptionId);
			});

			it('should delete a subscription', async () => {
				const deletedId = await facade.deleteSubscription(subscriptionId);
				expect(deletedId).to.equals(subscriptionId);
			});

			it('should notify that a subscription has been deleted', async () => {
				await facade.deleteSubscription(subscriptionId);
				sinon.assert.calledOnceWithExactly(
					subscriptionEventsMock.notifySubscriptionDeleted,
					subscription,
				);
			});
		});
	});
});
