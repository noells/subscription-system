import {PublicService} from './PublicService';
import {logger} from './logger/Logger';

const main = async (): Promise<void> => {
	logger.info('Starting Service...');
	const service = PublicService.of({
		httpPort: 8888,
		rabbitAddress: 'amqp://rabbitmq',
	});
	await service.start();

	const stop = async (): Promise<void> => {
		logger.info('Stopping Service...');
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
