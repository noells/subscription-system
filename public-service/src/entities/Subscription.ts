export interface SubscriptionDTO {
	subscriptionId: string;
	email: string;
	birthDate: string;
	consent: boolean;
	newsletterId: string;
	firstName?: string;
	gender?: string;
}
