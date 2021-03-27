import {Observable} from 'rxjs';
import {ConsumeMessage} from 'amqplib';

export interface Subscriber {
	init(): Promise<void>;
	uninit(): Promise<void>;
	getMessages(eventType: string): Observable<ConsumeMessage>;
}
