import { ClientFactory } from './ClientFactory';
import logger from './logger-service';

export default {
	logger,
	web3: ClientFactory.web3(),
};
