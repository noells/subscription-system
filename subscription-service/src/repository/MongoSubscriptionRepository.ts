import {Collection, MongoClient} from 'mongodb';
import * as uuid from 'uuid';
import {Subscription, SubscriptionDTO} from '../value-objects/Subscription';
import {SubscriptionRepository} from './SubscriptionRepository';

export class MongoSubscriptionRepository implements SubscriptionRepository {
	private static readonly SUBSCRIPTIONS_REPOSITORY = 'subscriptions';
	private client: MongoClient;
	private collection!: Collection<SubscriptionDTO>;

	private constructor(uri: string) {
		this.client = new MongoClient(uri);
	}

	public static async start(uri: string): Promise<SubscriptionRepository> {
		const repo = new MongoSubscriptionRepository(uri);
		await repo.start();
		return repo;
	}

	public async start(): Promise<void> {
		await this.client.connect();
		this.collection = await this.client
			.db(MongoSubscriptionRepository.SUBSCRIPTIONS_REPOSITORY)
			.collection<SubscriptionDTO>(MongoSubscriptionRepository.SUBSCRIPTIONS_REPOSITORY);

		await this.collection.createIndex({subscriptionId: 1}, {unique: true});
		await this.collection.createIndex(
			{email: 1, newsletterId: 1},
			{
				unique: true,
			},
		);
	}

	public async stop(): Promise<void> {
		await this.client.close();
	}

	public async getAll(): Promise<Subscription[]> {
		const rawSubscriptions = await this.collection.find().toArray();
		return rawSubscriptions.map((s) => Subscription.fromDto(s));
	}

	public async getById(subscriptionId: string): Promise<Subscription> {
		const subscription = await this.collection.findOne({subscriptionId});
		if (!subscription) {
			throw Error('NotFound');
		}
		return Subscription.fromDto(subscription);
	}

	public async createSubscription(subscription: Subscription): Promise<Subscription> {
		const subscriptionId = uuid.v4();
		const subscriptionData = {...subscription.asDTO(), subscriptionId};
		try {
			const result = await this.collection.insertOne(subscriptionData);
			if (result.insertedCount !== 1) {
				throw Error('Error: NotCreated');
			}
		} catch (err) {
			if (err.code === 11000) {
				throw Error('AlreadyExists');
			}

			throw err;
		}
		return Subscription.fromDto(subscriptionData);
	}

	public async deleteSubscription(subscriptionId: string): Promise<string> {
		const result = await this.collection.deleteOne({subscriptionId});
		if (result.deletedCount !== 1) {
			throw Error('Error: NotFound');
		}
		return subscriptionId;
	}
}
