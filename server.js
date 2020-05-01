require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
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

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));

app.post(global.gConfig.listen_endpoint, async (req, res) => {
	res.send('OK');

	const data = req.body;
	console.log({
		id: data.id,
		order_id: data.order_id,
		tracking_number: data.tracking_number,
		tracking_url: data.tracking_url,
		tracking_company: data.tracking_company
	});

	let newTrackingCompany = global.gConfig.default_shipping_company;
	if (data.tracking_company) newTrackingCompany = data.tracking_company;

	let newTrackingUrl = `${global.gConfig.new_tracking_url}${data.tracking_number}`;

	let success;
	if (fulfillmentsRepository.fulfillmentTrackingUrlIncorrect(data.tracking_url, global.gConfig.new_tracking_url)) {
		success = await fulfillmentsRepository.updateFulfillmentTrackingUrl(data.id, data.tracking_number, newTrackingUrl, newTrackingCompany, global.gConfig.notify_customer)
	}
	console.log(PRIVATE_PASSWORD)
	console.log(success)
});

app.listen(global.gConfig.node_port, () => console.log(`Listening for Shopify webhook event data on port ${global.gConfig.node_port}. Started ${new Date().toString()}`));
