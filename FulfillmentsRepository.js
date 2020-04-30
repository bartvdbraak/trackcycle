const {URLSearchParams} = require('url');
const fetch = require("node-fetch");

class FulfillmentsRepository {

	constructor(shopifyUrl, accessToken) {
		this.baseUrl = `https://${shopifyUrl}/admin/api/2020-04/`;
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

	async getInvalidFulfillments(limit = 50, urlContains = 'urbandeal') {
		let params = {
			fulfillment_status: 'shipped',
			status: 'closed',
			fields: [
				'fulfillments',
				'id',
				'fulfillment_status'
			],
			limit: 50
		};

		let queryString = new URLSearchParams(params).toString();

		let invalidFulfillments = [];

		await fetch(`${this.baseUrl}orders.json?${queryString}`, {headers: this.headers})
			.then(this.validateResponse)
			.then(data => data.json())
			.then(async json => {
				await json.orders.forEach(order => {
					let fulfillments = order.fulfillments.filter(function (fulfillment) {
						return fulfillment.tracking_url.indexOf(urlContains) == -1;
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

	async updateFulfillmentTrackingUrl(id, number, url, company = 'CNE LU', notifyCustomer = true) {
		let options = {
			headers: this.headers,
			method: 'POST',
			body: JSON.stringify({
				'fulfillment': {
					'notify_customer': true,
					'tracking_info': {
						'number': number,
						'url': url,
						'company': company
					}
				}
			}),
		};

		let request = await fetch(`${this.baseUrl}/fulfillments/${id}/update_tracking.json`, options);

		return request.status === 200;
	}

}

module.exports = FulfillmentsRepository;
