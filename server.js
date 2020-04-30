const express = require("express");
const bodyParser = require("body-parser");
const FulfillmentsRepository = require('./FulfillmentsRepository');

const { PRIVATE_PASSWORD, SHOPIFY_URL } = process.env;
const fulfillmentsRepository = new FulfillmentsRepository(SHOPIFY_URL, PRIVATE_PASSWORD);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));

app.post('/webhooks/fulfillment', (req, res) => {
	res.send('OK');

	const data = req.body;
	console.log({
		id: data.id,
		order_id: data.order_id,
		tracking_number: data.tracking_number,
		tracking_url: data.tracking_url,
		tracking_company: data.tracking_company
	});

	let newTrackingUrl = `https://www.urbandeal.nl/apps/parcelpanel?nums=${data.tracking_number}`;

	let fulfillmentWasUpdated = fulfillmentsRepository.updateFulfillmentTrackingUrl( data.id, data.tracking_number, newTrackingUrl, data.tracking_company);
	console.log(fulfillmentWasUpdated)
});

app.listen(PORT, () => console.log(`Listening for Shopify webhook event data on port ${PORT}. Started ${new Date().toString()}`));
