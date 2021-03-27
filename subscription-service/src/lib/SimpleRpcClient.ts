import amqp, {Channel, Connection, ConsumeMessage, Replies} from 'amqplib';
import {ReplaySubject} from 'rxjs';
import {take, filter} from 'rxjs/operators';
import {logger} from '../logger/Logger';
import {RpcClient, RpcResponse} from './RpcClient';
import * as uuid from 'uuid';

export interface RpcRequest {}

export class SimpleRpcClient implements RpcClient {
	private static readonly RCP_QUEUE = 'rcp_queue';
	private connection!: Connection;
	private channel!: Channel;
	private queue!: Replies.AssertQueue;

	private responses: ReplaySubject<ConsumeMessage>;

	public constructor(private readonly address: string, private readonly topic: string) {
		this.responses = new ReplaySubject();
	}

	public async init(): Promise<void> {
		this.connection = await amqp.connect(this.address);
		this.channel = await this.connection.createChannel();
		this.queue = await this.channel.assertQueue('', {exclusive: true});
	}

	public async uninit(): Promise<void> {
		await this.channel.close();
		await this.connection.close();
	}

	public async rpc<T>(request: RpcRequest): Promise<RpcResponse<T>> {
		this.channel.consume(this.queue.queue, this.onMessage.bind(this), {noAck: true});
		const correlationId = uuid.v4();
		const waitResponse = this.responses
			.pipe(
				filter((m) => m.properties.correlationId === correlationId),
				take(1),
			)
			.toPromise();

		this.channel.sendToQueue(
			`${SimpleRpcClient.RCP_QUEUE}.${this.topic}`,
			Buffer.from(JSON.stringify(request)),
			{
				correlationId,
				replyTo: this.queue.queue,
			},
		);
		const response = await waitResponse;
		return {
			...JSON.parse(response.content.toString()),
		};
	}

	private onMessage(msg: ConsumeMessage | null) {
		if (msg === null) {
			return;
		}

		logger.info(`Got: ${msg.content.toString()}`);
		this.responses.next(msg);
	}
}
