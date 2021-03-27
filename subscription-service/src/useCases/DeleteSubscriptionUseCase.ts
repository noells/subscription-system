export interface DeleteSubscriptionUseCase {
	deleteSubscription(subscriptionId: string): Promise<string>;
}
