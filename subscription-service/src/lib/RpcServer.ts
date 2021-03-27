import {Observable} from 'rxjs';

export interface RpcPayload {
	method: string;
	payload: unknown;
}

export interface RpcMessage {
	reply(responseData: object): Promise<void>;
	request: RpcPayload;
}

export interface RpcServer {
	init(): Promise<void>;
	uninit(): Promise<void>;
	getRequests(): Observable<RpcMessage>;
}
