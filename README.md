## TrackCycle
This project runs a server to interact with new fulfillments on a Shopify store. It uses webhooks to indicate a new fulfillment and has the ability to change the Tracking URL to something that is custom.

## Getting started

Follow the steps below to get started using this project on a Shopify store.

### Prerequisites
- Shopify Store Private App (`yourstore.myshopify.com`)
- Web server / Ngrok.io

#### Getting a Shopify Private App

- Go to your stores admin panel, then navigate to *Apps*, and scroll down till you see the following:
> Working with a developer on your shop? Manage private apps

- Go to **Manage private apps**, then **Create new private app**;
- Give the application a **name** and enter your **email**;
- Click **Show inactive Admin API permissions** and select `Read and write` access scope for: **Fulfillment services (read_fulfillments, write_fulfillments)**;
- Use `2020-04` for the **API Version**;
- Click **save**.

You will see and be needing the following information for the configuration:

- Password
- Shared Secret

#### Setting up a webhook endpoint

- Go to **Shopify Settings**, then navigate to **Notifications** and scroll down and take note of:
> All your webhooks will be signed with ... so you can verify their integrity.

- This will be our `HTTP_X_SHOPIFY_HMAC_SHA256` in the configuration.
- Click **Create webhook** with:
  - **Event** as `Fulfillment creation`, 
  - **Format** as `JSON`, 
  - **URL** either your custom domain (such as `https://yourdomain.com/webhooks/fulfillment/create`) or a tunneled location (shown in later steps),
  - **API version** as `2020-04`.
- **Save webhook**.

## Installing

Clone this repository and install the required node modules.
```
git clone https://github.com/bartvdbraak/trackcycle.git
npm install
```

## Configuring

Change `.env.example` to `.env`. Change the following environment variables:
- `PRIVATE_PASSWORD` to **Password** from the created Private App;
- `HTTP_X_SHOPIFY_HMAC_SHA256` to the **Signed Secret** from the **Shopify notifcations/webhooks** page;
- `LISTEN_PORT` to the port on which our server will be listening (Default `3000`)
- `SHOPIFY_URL` to the URL of your store (e.g. `yourstore.myshopify.com`)

Change `config.json.example` to `config.json`. Change the following config variables:
- `api_version` to the Shopify API version we used (`2020-04`);
- `new_tracking_url` to new tracking URL without the number (e.g. `https://www.17track.net?nums=`);
- `default_shipping_company` to a default shipping company when it was left blank by fulfiller;
- `notify_customer` to either `true` if you want to send a confirmation email to the customer or `false` if not.

# Testing on local server

## Install ngrok.io

- Go to [their website](https://ngrok.com/download) and follow the instructions,
 
 or
- MacOS: `brew cask install ngrok` with HomeBrew

## Start server and tunnel

In one terminal we have to start the node.js server:
```
npm run start
```
Open a new terminal or tab with the following command (Replace the `3000` with the `LISTEN_PORT`):
```
ngrok http 3000
```
In this output we will see an address we need (e.q. `https://abc123.ngrok.io`). Copy this address.

## Change the webhook endpoint

- Go to Shopify Settings, then navigate to Notifications and scroll down.
- Click the webhook event we have just created and change `URL` to the address we copied plus `/webhooks/fulfillment/created`
  
  Example: `https://abc123.ngrok.io/webhooks/fulfillment/created`
- Save webhook.

## Test the webhook

- Go to Shopify Settings, then navigate to Notifications and scroll down.
- In the webhook event we have just created, click `Send test notification`.
- In the error logs (`error.log`) we will see an error output. This is correct since we correctly received a notification but this notification refers to a non-existent fulfillment (which we cannot change, thus `403` error).

# Deploying to Production server

If you are unsure about how to do this, please read the [following guide](https://www.digitalocean.com/community/tutorials/how-to-use-pm2-to-setup-a-node-js-production-environment-on-an-ubuntu-vps) on how to set up a Node.JS server on DigitalOcean or other server hosts.

## Rsync to production server

`rsync -rlzqcOD --exclude={.env.development,.env.example,config.json.example,.gitignore,.git,.idea} ./`

## PM2 as processmanager for Node

`pm2 start server.js --name TrackCycle`
