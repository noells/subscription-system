import amqp, {Channel, Connection, ConsumeMessage} from 'amqplib';
import {ReplaySubject} from 'rxjs';
import {logger} from '../logger/Logger';

export class SimpleRpcServer {
	private static readonly RCP_QUEUE = 'rcp_queue';
	private connection!: Connection;
	private channel!: Channel;
	// private messages: ReplaySubject<RPCMessage>;

	public constructor(private readonly address: string, private readonly topic: string) {}

	public async init(): Promise<void> {
		this.connection = await amqp.connect(this.address);
		this.channel = await this.connection.createChannel();
		this.channel.assertQueue(`${SimpleRpcServer.RCP_QUEUE}.${this.topic}`, {durable: false});
		this.channel.prefetch(1);
		logger.info('Awaiting RPC requests');
		this.channel.consume(`${SimpleRpcServer.RCP_QUEUE}.${this.topic}`, this.onMessage.bind(this));
	}

	public async uninit(): Promise<void> {
		await this.channel.close();
		await this.connection.close();
	}

	private onMessage(msg: ConsumeMessage | null): void {
		if (msg === null) {
			return;
		}
		logger.info(`Received rpc message: ${msg.content.toString()}`);
		console.log(`Received rpc message: ${msg.content.toString()}`);

		this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(msg.content.toString()), {
			correlationId: msg.properties.correlationId,
		});

		this.channel.ack(msg);
	}
}
