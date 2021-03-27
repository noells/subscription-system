import amqp, {Channel, Connection, ConsumeMessage, Replies} from 'amqplib';
import {BadRequest, Conflict, NotFound} from 'http-errors';
import * as t from 'io-ts';
import {ReplaySubject} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import * as uuid from 'uuid';
import {logger} from '../logger/Logger';
import {RpcClient, RpcResponse} from './RpcClient';

export interface RpcRequest {}

const ErrorResponse = t.type({
	error: t.string,
});

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
		const parsedResponse = JSON.parse(response.content.toString());

		if (ErrorResponse.is(parsedResponse.payload)) {
			throw this.handleRpcError(parsedResponse.payload.error);
		}

		return {
			...parsedResponse,
		};
	}

	private onMessage(msg: ConsumeMessage | null) {
		if (msg === null) {
			return;
		}

		logger.info(`Got: ${msg.content.toString()}`);
		this.responses.next(msg);
	}

	private handleRpcError(error: string) {
		if (error.includes('BadRequest')) {
			throw new BadRequest();
		} else if (error.includes('NotFound')) {
			throw new NotFound();
		} else if (error.includes('AlreadyExists')) {
			throw new Conflict();
		}

		throw Error('Error making the request');
	}
}
