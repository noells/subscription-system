import amqp, {Channel, Connection, ConsumeMessage} from 'amqplib';
import {Observable, ReplaySubject} from 'rxjs';
import {logger} from '../logger/Logger';
import {RpcMessage, RpcServer} from './RpcServer';

export class SimpleRpcServer implements RpcServer {
	private static readonly RCP_QUEUE = 'rcp_queue';
	private connection!: Connection;
	private channel!: Channel;
	private requests: ReplaySubject<RpcMessage>;

	public constructor(private readonly address: string, private readonly topic: string) {
		this.requests = new ReplaySubject();
	}

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

	public getRequests(): Observable<RpcMessage> {
		return this.requests;
	}

	private onMessage(msg: ConsumeMessage | null): void {
		if (msg === null) {
			return;
		}
		logger.info(`Received rpc message: ${msg.content.toString()}`);

		const reply = (responseData: object) =>
			this.channel.sendToQueue(
				msg.properties.replyTo,
				Buffer.from(JSON.stringify({payload: responseData})),
				{
					correlationId: msg.properties.correlationId,
				},
			);

		this.requests.next({
			reply: (reply as unknown) as () => Promise<void>,
			request: JSON.parse(msg.content.toString()),
		});

		this.channel.ack(msg);
	}
}
