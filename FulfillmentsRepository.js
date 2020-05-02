const {URLSearchParams} = require('url');
const fetch = require("node-fetch");

class FulfillmentsRepository {
	constructor(shopifyUrl, accessToken, apiVersion) {
		this.baseUrl = `https://${shopifyUrl}/admin/api/${apiVersion}/`;
		this.headers = {
			'X-Shopify-Access-Token': accessToken,
			'Content-Type': "application/json"
		};
	}

	validateResponse(response) {
		if (response.ok) {
			return response;
		} else {
			throw Error(response.statusText);
		}
	}

	async getInvalidFulfillments(limit = 50, urlContains) {
		let params = {
			fulfillment_status: 'shipped',
			status: 'closed',
			fields: [
				'fulfillments',
				'id',
				'fulfillment_status'
			],
			limit: limit
		};

		let queryString = new URLSearchParams(params).toString();

		let invalidFulfillments = [];

		await fetch(`${this.baseUrl}orders.json?${queryString}`, {headers: this.headers})
			.then(this.validateResponse)
			.then(data => data.json())
			.then(async json => {
				await json.orders.forEach(order => {
					let fulfillments = order.fulfillments.filter(function (fulfillment) {
						return fulfillment.tracking_url.indexOf(urlContains) === -1;
					});

					invalidFulfillments = [...invalidFulfillments, ...fulfillments];
				});
			});

		return invalidFulfillments.map((fulfillments) => {
			return {
				id: fulfillments.id,
				order_id: fulfillments.order_id,
				tracking_number: fulfillments.tracking_number,
				tracking_url: fulfillments.tracking_url,
				company: fulfillments.company
			}
		});
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
