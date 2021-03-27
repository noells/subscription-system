import {expect} from 'chai';
import {filter, map, take} from 'rxjs/operators';
import * as uuid from 'uuid';
import {Events} from '../../src/events/RabbitSubscriptionEvents';
import {RabbitSubscriber} from '../../src/lib/RabbitSubscriber';
import {Subscriber} from '../../src/lib/Subscriber';
import {SubscriptionService} from '../../src/SubscriptionService';
import {SubscriptionDTO} from '../../src/value-objects/Subscription';
import {SubscriptionApi} from './SubscriptionApi';

describe('tests/acceptance/SubscriptionService', () => {
	describe('Given the service is up and running', () => {
		let service: SubscriptionService;
		let serviceApi: SubscriptionApi;
		let subscriber: Subscriber;

		before(async () => {
			service = SubscriptionService.of({
				rabbitAddress: 'amqp://localhost',
				mongoUri: 'mongodb://localhost',
			});
			serviceApi = new SubscriptionApi();
			await Promise.all([service.start(), serviceApi.start()]);

			subscriber = new RabbitSubscriber('amqp://localhost', 'subscriptions');
			await subscriber.init();
		});

		after(async () => {
			await Promise.all([service.stop(), serviceApi.stop()]);
			await subscriber.uninit();
		});

		describe('Given no subscriptions on the system', () => {
			afterEach(async () => {
				const subscriptions = await serviceApi.getAllSubscriptions();
				await Promise.all(
					subscriptions.map((s) => serviceApi.deleteSubscription(s.subscriptionId as string)),
				);
			});

			it('should obtain none if retrieving them', async () => {
				const subscriptions = await serviceApi.getAllSubscriptions();
				expect(subscriptions).to.have.lengthOf(0);
			});

			it('should throw NotFoundError if looking for a specific one', async () => {
				const response = await serviceApi.getSubscriptionById('fakeId');
				expect(((response as unknown) as {error: string}).error).to.equals('Error: NotFound');
			});

			it('should be possible to create a subscription', async () => {
				const subscription = {
					gender: 'female',
					email: 'test@test.com',
					birthDate: '12/4/76',
					consent: true,
					newsletterId: uuid.v4(),
				};
				const {subscriptionId} = await serviceApi.createSubscription(subscription);

				const createdSubscription = await serviceApi.getSubscriptionById(subscriptionId);
				expect(createdSubscription).to.deep.equals({...subscription, subscriptionId});
			});

			describe('When a subscription is created', () => {
				let subscription: SubscriptionDTO;
				let onSubscriptionCreated: Promise<SubscriptionDTO>;

				beforeEach(async () => {
					const subscriptionData = {
						gender: 'female',
						email: 'test3@test.com',
						birthDate: '12/4/76',
						consent: true,
						newsletterId: uuid.v4(),
					};
					onSubscriptionCreated = subscriber
						.getMessages(Events.subscriptionCreated)
						.pipe(
							filter(
								(m) => JSON.parse(m.content.toString()).payload.email === subscriptionData.email,
							),
							map((m) => JSON.parse(m.content.toString()).payload),
							take(1),
						)
						.toPromise();

					const {subscriptionId} = await serviceApi.createSubscription(subscriptionData);
					subscription = {...subscriptionData, subscriptionId};
				});

				afterEach(async () => {
					await serviceApi.deleteSubscription(subscription.subscriptionId as string);
				});

				it('a Subscription Created Event must be emitted', async () => {
					const createdSubscription = await onSubscriptionCreated;
					expect(createdSubscription).to.deep.equals(subscription);
				});
			});
		});

		describe('Given subscriptions on the system', () => {
			let subscriptions: SubscriptionDTO[];

			beforeEach(async () => {
				const createData = [
					{
						gender: 'female',
						email: 'test@test.com',
						birthDate: '12/4/76',
						consent: true,
						newsletterId: uuid.v4(),
					},
					{
						gender: 'trans',
						email: 'test2@test.com',
						birthDate: '17/5/90',
						consent: true,
						newsletterId: uuid.v4(),
					},
					{
						firstName: 'Pepito',
						gender: 'male',
						email: 'test2@test.com',
						birthDate: '17/5/90',
						consent: true,
						newsletterId: uuid.v4(),
					},
				];

				subscriptions = await Promise.all(
					createData.map(async (s) => {
						const {subscriptionId} = await serviceApi.createSubscription(s);
						return {...s, subscriptionId};
					}),
				);
			});

			afterEach(async () => {
				await Promise.all(
					subscriptions.map((s) => serviceApi.deleteSubscription(s.subscriptionId as string)),
				);
			});

			it('should be possible to obtain all of them', async () => {
				const retrievedSubscriptions = await serviceApi.getAllSubscriptions();
				expect(retrievedSubscriptions).to.have.deep.members(subscriptions);
			});

			it('should be possible to get one by ID', async () => {
				const subscription = await serviceApi.getSubscriptionById(
					subscriptions[1].subscriptionId as string,
				);

				expect(subscription).to.deep.equals(subscriptions[1]);
			});

			it('should not be possible to create a duplicate subscription', async () => {
				const duplicatedData = {
					email: subscriptions[2].email,
					birthDate: '17/5/90',
					consent: true,
					newsletterId: subscriptions[2].newsletterId,
				};

				const response = await serviceApi.createSubscription(duplicatedData);
				expect(((response as unknown) as {error: string}).error).to.equals('Error: AlreadyExists');
			});

			it('should throw NotFoundError if deleting a non existant subscription', async () => {
				const response = await serviceApi.deleteSubscription('fakeId');
				expect(((response as unknown) as {error: string}).error).to.equals('Error: NotFound');
			});

			describe('When a subscription is deleted', () => {
				let onSubscriptionDeleted: Promise<SubscriptionDTO>;
				let idToDelete: string;

				beforeEach(async () => {
					idToDelete = subscriptions[1].subscriptionId as string;
					onSubscriptionDeleted = subscriber
						.getMessages(Events.subscriptionDeleted)
						.pipe(
							filter((m) => JSON.parse(m.content.toString()).payload.subscriptionId === idToDelete),
							map((m) => JSON.parse(m.content.toString()).payload),
							take(1),
						)
						.toPromise();

					await serviceApi.deleteSubscription(idToDelete);
				});

				it('a Subscription Deleted Event must be emitted', async () => {
					const deletedSubscription = await onSubscriptionDeleted;
					expect(deletedSubscription).to.deep.equals(subscriptions[1]);
				});
			});
		});
	});
});
