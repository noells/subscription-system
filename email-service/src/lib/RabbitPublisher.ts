import {Publisher} from './Publisher';
import ampq, {Connection, Channel} from 'amqplib';

export class RabbitPublisher implements Publisher {
	private connection!: Connection;
	private channel!: Channel;

	public constructor(private readonly address: string, private readonly exchange: string) {}

	public async init(): Promise<void> {
		this.connection = await ampq.connect(this.address);
		this.channel = await this.connection.createChannel();

		await this.channel.assertExchange(this.exchange, 'fanout', {
			durable: false,
		});
	}

	public async uninit(): Promise<void> {
		await this.channel.close();
		await this.connection.close();
	}

	public async publish<T>(data: T): Promise<void> {
		await this.channel.publish(this.exchange, '', Buffer.from(JSON.stringify(data)));
	}
}
