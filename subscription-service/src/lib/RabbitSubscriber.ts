import {Subscriber} from './Subscriber';
import ampq, {Connection, Channel, Replies, ConsumeMessage} from 'amqplib';
import {ReplaySubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

export class RabbitSubscriber implements Subscriber {
	private connection!: Connection;
	private channel!: Channel;
	private queue!: Replies.AssertQueue;

	private messages: ReplaySubject<ConsumeMessage>;

	public constructor(private readonly address: string, private readonly exchange: string) {
		this.messages = new ReplaySubject();
	}

	public async init(): Promise<void> {
		this.connection = await ampq.connect(this.address);
		this.channel = await this.connection.createChannel();
		await this.channel.assertExchange(this.exchange, 'fanout', {durable: false});
		this.queue = await this.channel.assertQueue('', {exclusive: true});
		await this.channel.bindQueue(this.queue.queue, this.exchange, '');

		this.channel.consume(this.queue.queue, this.onMessage.bind(this), {noAck: true});
	}

	public async uninit(): Promise<void> {
		await this.channel.close();
		await this.connection.close();
	}

	public getMessages(eventType: string): Observable<ConsumeMessage> {
		return this.messages.pipe(filter((m) => JSON.parse(m.content.toString()).event === eventType));
	}

	private onMessage(msg: ConsumeMessage | null) {
		if (!msg) {
			return;
		}
		this.messages.next(msg);
	}
}
