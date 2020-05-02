require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const FulfillmentsRepository = require('./FulfillmentsRepository');
const config = require('./config.json');

const { PRIVATE_PASSWORD, HTTP_X_SHOPIFY_HMAC_SHA256, LISTEN_PORT, SHOPIFY_URL } = process.env;
const fulfillmentsRepository = new FulfillmentsRepository(SHOPIFY_URL, PRIVATE_PASSWORD, config.api_version);

const app = express();

app.use(bodyParser.json({
	verify: verifyHmac
}));
app.use(bodyParser.urlencoded({
	extended: true,
}));

app.post('/webhooks/fulfillment/created', async (req, res) => {
	res.send('OK');

	const data = req.body;
	let newTrackingCompany = data.tracking_company || config.default_shipping_company;
	let newTrackingUrl = `${config.new_tracking_url}${data.tracking_number}`;

	if (data.tracking_url === null || data.tracking_url.indexOf(newTrackingUrl) === -1) {
		try {
			await fulfillmentsRepository.updateFulfillmentTrackingUrl(
				data.id,
				data.tracking_number,
				newTrackingUrl,
				newTrackingCompany,
				config.notify_customer,
				data.name);
		} catch (error) {
			console.error(error);
		}
	}
});

function verifyHmac(req, res, buf, encoding) {
	if (!buf || !buf.length)
		throw new Error('No content');

	const rawBody = buf.toString(encoding);
	const calculatedHmac = crypto.createHmac('sha256', HTTP_X_SHOPIFY_HMAC_SHA256)
		.update(rawBody).digest('base64');

	if(req.header('X-Shopify-Hmac-SHA256') !== calculatedHmac) {
		throw new Error('Invalid HMAC');
	}
}

app.listen(LISTEN_PORT, () => console.log(`Listening for Shopify webhook event data on port ${LISTEN_PORT}. Started ${new Date().toString()}`));
