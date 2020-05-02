require("dotenv").config();
const _ = require('lodash');
const FulfillmentsRepository = require('./FulfillmentsRepository');

const config = require('./config.json');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

global.gConfig = finalConfig;

const { PRIVATE_PASSWORD } = process.env;

const fulfillmentsRepository = new FulfillmentsRepository(global.gConfig.shopify_url, global.gConfig.api_version, PRIVATE_PASSWORD);

(async  () => {
	// TODO cycle through each block of 250 fulfillments, find all invalids, update all invalids.
	let invalidFulfillments = await fulfillmentsRepository.getInvalidFulfillments();
	// let fulfillmentWasUpdated = await fulfillmentsRepository.updateFulfillmentTrackingUrl(2143621808221, 'LL444859037LU', 'http://google.com', 'loller');
	console.log(invalidFulfillments);
})();
