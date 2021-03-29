import {Mail} from '../mailer/Mailer';

interface Subscription {
	subscriptionId: string;
	email: string;
	birthDate: string;
	consent: boolean;
	newsletterId: string;
	firstName?: string;
	gender?: string;
}

const buildCreatedMailText = (subscription: Subscription): string => {
	const greeting = subscription.firstName ? `Hello, ${subscription.firstName}` : 'Hello!';
	const body = `You have a new subscription in the newsletter: ${subscription.newsletterId}`;
	return `${greeting}\n${body}`;
};

const buildCreatedMailHtml = (subscription: Subscription): string => {
	const greeting = subscription.firstName
		? `<h1>Hello, ${subscription.firstName}</h1>`
		: '<h1>Hello!</h1>';
	const body = `<p>You have a new subscription in the newsletter: ${subscription.newsletterId}</p>`;
	return `${greeting}\n${body}`;
};

const buildDeletedMailText = (subscription: Subscription): string => {
	const greeting = subscription.firstName ? `Hello, ${subscription.firstName}` : 'Hello!';
	const body = `You have a have removed a subscription to the newsletter: ${subscription.newsletterId}`;
	return `${greeting}\n${body}`;
};

const buildDeletedMailHtml = (subscription: Subscription): string => {
	const greeting = subscription.firstName
		? `<h1>Hello, ${subscription.firstName}</h1>`
		: '<h1>Hello!</h1>';
	const body = `<p>You have a removed a subscription to the newsletter: ${subscription.newsletterId}</p>`;
	return `${greeting}\n${body}`;
};

export const createdSubscriptionAsMail = (subscription: Subscription): Mail => ({
	from: '"Mail Service 👻" <mail@service.com>',
	to: subscription.email,
	subject: 'New Subscription',
	text: buildCreatedMailText(subscription),
	html: buildCreatedMailHtml(subscription),
});

export const deletedSubscriptionAsMail = (subscription: Subscription): Mail => ({
	from: '"Mail Service 👻" <mail@service.com>',
	to: subscription.email,
	subject: 'Deleted Subscription',
	text: buildDeletedMailText(subscription),
	html: buildDeletedMailHtml(subscription),
});
