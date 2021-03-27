export interface SubscriptionDTO {
	email: string;
	birthDate: string;
	consent: boolean;
	newsletterId: string;
	subscriptionId?: string;
	firstName?: string;
	gender?: string;
}

export class Subscription {
	private constructor(
		private email: string,
		private birthDate: string,
		private consent: boolean,
		private newsletterId: string,
		private subscriptionId?: string,
		private firstName?: string,
		private gender?: string,
	) {}

	public static fromDto(dto: SubscriptionDTO) {
		return new Subscription(
			dto.email,
			dto.birthDate,
			dto.consent,
			dto.newsletterId,
			dto.subscriptionId,
			dto.firstName,
			dto.gender,
		);
	}

	public asDTO(): SubscriptionDTO {
		let subscription = {
			email: this.email,
			birthDate: this.birthDate,
			consent: this.consent,
			newsletterId: this.newsletterId,
		};

		if (this.subscriptionId) {
			subscription = Object.assign({}, subscription, {subscriptionId: this.subscriptionId});
		}

		if (this.firstName) {
			subscription = Object.assign({}, subscription, {firstName: this.firstName});
		}

		if (this.gender) {
			subscription = Object.assign({}, subscription, {gender: this.gender});
		}

		return subscription;
	}
}
