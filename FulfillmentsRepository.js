const fetch = require("node-fetch");

class FulfillmentsRepository {
	constructor(shopifyUrl, accessToken, apiVersion) {
		this.baseUrl = `https://${shopifyUrl}/admin/api/${apiVersion}/`;
		this.headers = {
			'X-Shopify-Access-Token': accessToken,
			'Content-Type': "application/json"
		};
	}

	async updateFulfillmentTrackingUrl(id, number, url, company, notifyCustomer, name) {
		let options = {
			headers: this.headers,
			method: 'POST',
			body: JSON.stringify({
				'fulfillment': {
					'notify_customer': notifyCustomer,
					'tracking_info': {
						'number': number,
						'url': url,
						'company': company
					}
				}
			}),
		};

		let request = await fetch(`${this.baseUrl}fulfillments/${id}/update_tracking.json`, options);

		if(request.status !== 200) {
			throw new Error(`${new Date().toString()}: Tracking url for ${ name } could not be updated. Error status: ${ request.status }`);
		}
	}

}

module.exports = FulfillmentsRepository;
