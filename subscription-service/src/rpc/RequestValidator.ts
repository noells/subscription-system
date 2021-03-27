import * as t from 'io-ts';

export const GetSubscriptionsRpcRequest = t.type({
	method: t.literal('getSubscriptions'),
});

export const GetSubscriptionRpcRequest = t.type({
	method: t.literal('getSubscription'),
	payload: t.type({
		subscriptionId: t.string,
	}),
});

const CreateSubscriptionRequestValidator = t.intersection([
	t.type({
		email: t.string,
		birthDate: t.string,
		consent: t.boolean,
		newsletterId: t.string,
	}),
	t.partial({
		firstName: t.string,
		gender: t.string,
	}),
]);

export const CreateSubscriptionRpcRequest = t.type({
	method: t.literal('createSubscription'),
	payload: CreateSubscriptionRequestValidator,
});

export const DeleteSubscriptionRpcRequest = t.type({
	method: t.literal('deleteSubscription'),
	payload: t.type({
		subscriptionId: t.string,
	}),
});
