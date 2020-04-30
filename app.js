require("dotenv").config();

const FulfillmentsRepository = require('./FulfillmentsRepository');
const { PRIVATE_PASSWORD, SHOPIFY_URL } = process.env;
const fulfillmentsRepository = new FulfillmentsRepository(SHOPIFY_URL, PRIVATE_PASSWORD);

(async  () => {
	let invalidFulfillments = await fulfillmentsRepository.getInvalidFulfillments();
	// let fulfillmentWasUpdated = await fulfillmentsRepository.updateFulfillmentTrackingUrl(2143621808221, 'LL444859037LU', 'http://google.com', 'loller');
	console.log(invalidFulfillments);
})();



// const oauth2 = require('simple-oauth2').create(credentials);
