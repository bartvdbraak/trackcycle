require("dotenv").config();
const FulfillmentsRepository = require('./FulfillmentsRepository');

const config = require('./config.json');
const { PRIVATE_PASSWORD, SHOPIFY_URL } = process.env;

const fulfillmentsRepository = new FulfillmentsRepository(SHOPIFY_URL, config.api_version, PRIVATE_PASSWORD);

(async  () => {
	// TODO cycle through each block of num fulfillments, find all invalids, update all invalids.
	let invalidFulfillments = await fulfillmentsRepository.getInvalidFulfillments();
	// let fulfillmentWasUpdated = await fulfillmentsRepository.updateFulfillmentTrackingUrl(2143621808221, 'LL444859037LU', 'http://google.com', 'loller');
	console.log(invalidFulfillments);
})();
