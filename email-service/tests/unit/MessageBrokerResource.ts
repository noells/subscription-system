import {ReplaySubject} from 'rxjs';
import * as sinon from 'sinon';
import {Subscriber} from '../../src/lib/Subscriber';
import {Mailer, SmtpMailer} from '../../src/mailer/Mailer';
import {MessageBrokerResource} from '../../src/resource/MessabeBrokerResource';

describe('tests/unit/MessageBrokerResource', () => {
	describe('Given the resource is up and running', () => {
		let resource: MessageBrokerResource;
		let subscriberMock: Subscriber;
		let mailerMock: sinon.SinonStubbedInstance<Mailer>;
		let messagesMock: ReplaySubject<any>;

		before(async () => {
			messagesMock = new ReplaySubject();
			subscriberMock = {
				init: () => Promise.resolve(),
				uninit: () => Promise.resolve(),
				getMessages: (s: string) => messagesMock,
			};

			mailerMock = sinon.createStubInstance(SmtpMailer);
			resource = await MessageBrokerResource.of(subscriberMock, mailerMock);
		});

		describe('When a subscriptionCreated event arrives', () => {
			const subscription = {
				subscriptionId: 'fakeId',
				email: 'test@test.com',
				birthDate: '12/4/76',
				consent: true,
				newsletterId: 'faler3033a',
				gender: 'trans',
			};
			const buffer = Buffer.from(
				JSON.stringify({event: 'subscriptionCreated', payload: subscription}),
			);

			beforeEach(() => {
				sinon.reset();
			});

			it('a mail should be sent to the subscriber', async () => {
				messagesMock.next({content: buffer});
				sinon.assert.calledOnce(mailerMock.send);
			});

			it('a mail should not be sent if the event is not correct', async () => {
				const wrongSubscription = {
					email: 'test@test.com',
					birthDate: '12/4/76',
					consent: true,
					newsletterId: 'faler3033a',
					gender: 'trans',
				};
				const wrongBuffer = Buffer.from(
					JSON.stringify({event: 'subscriptionCreated', payload: wrongSubscription}),
				);

				messagesMock.next({content: wrongBuffer});
				sinon.assert.notCalled(mailerMock.send);
			});
		});

		describe('When a subscriptionDeleted event arrives', () => {
			const subscription = {
				subscriptionId: 'fakeId',
				email: 'test@test.com',
				birthDate: '12/4/76',
				consent: true,
				newsletterId: 'faler3033a',
				gender: 'trans',
			};
			const buffer = Buffer.from(
				JSON.stringify({event: 'subscriptionDeleted', payload: subscription}),
			);

			beforeEach(() => {
				sinon.reset();
			});

			it('a mail should be sent to the subscriber', async () => {
				messagesMock.next({content: buffer});
				sinon.assert.calledOnce(mailerMock.send);
			});

			it('a mail should not be sent if the event is not correct', async () => {
				const wrongSubscription = {
					email: 'test@test.com',
					birthDate: '12/4/76',
					consent: true,
					newsletterId: 'faler3033a',
					gender: 'trans',
				};
				const wrongBuffer = Buffer.from(
					JSON.stringify({event: 'subscriptionDeleted', payload: wrongSubscription}),
				);

				messagesMock.next({content: wrongBuffer});
				sinon.assert.notCalled(mailerMock.send);
			});
		});
	});
});
