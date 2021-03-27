export interface RpcRequest {
	method: string;
	payload?: object;
}

export interface RpcResponse<T> {
	payload: T;
}

export interface RpcClient {
	init(): Promise<void>;
	uninit(): Promise<void>;
	rpc<T>(message: RpcRequest): Promise<RpcResponse<T>>;
}
