import winston, {transports} from 'winston';

class Logger {
	private logger: winston.Logger;

	public constructor() {
		this.logger = winston.createLogger({
			format: winston.format.cli(),
			defaultMeta: {service: 'public-service'},
			transports: [new transports.Console()],
			silent: process.env.NODE_ENV === 'test',
		});
	}

	public info(message: string): void {
		this.logger.info(message);
	}

	public warn(message: string): void {
		this.logger.warn(message);
	}

	public error(message: string): void {
		this.logger.error(message);
	}
}

export const logger = new Logger();
