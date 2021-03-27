export interface Publisher {
	init(): Promise<void>;
	uninit(): Promise<void>;
	publish<T>(data: T): Promise<void>;
}
