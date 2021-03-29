import {logger} from './logger/Logger';
import {EmailService} from './EmailService';

const main = async (): Promise<void> => {
	logger.info('Starting Email Service...');
	const service = EmailService.of({
		rabbitAddress: 'amqp://rabbitmq',
		smtpAddress: 'smtp',
		smtpPort: 1025,
	});
	await service.start();

	const stop = async (): Promise<void> => {
		logger.info('Stopping Email Service...');
		await service.stop();
		logger.info('Service successfully stopped.');
		process.exit(0);
	};

	process.on('SIGTERM', stop);
	process.on('SIGINT', stop);
};

main()
	.then(() => logger.info('Service started.'))
	.catch((err) => {
		logger.error(`Error while starting service: ${err}`);
		process.exit(-1);
	});
