/**
 * Author : Alex Lew
 * Date : 09-11-2026
 * 
 * Objective :
 * To handle the webhook events from Stripe.
 */

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), function (request, response) {

	let event;
	// verify webhook events' signature
	try {
		event = stripe.webhooks.constructEvent(request.body, request.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
	} catch (err) {
		return response.status(400).send(`Webhook Error: ${err.message}`);
	}
	// handle the webhook events
	switch (event.type) {
		case 'payment_intent.succeeded':
			console.log('PaymentIntent succeeded:', event.data.object.id);
			break;
		case 'payment_intent.processing':
			console.log('PaymentIntent processing:', event.data.object.id);
			break;
		case 'payment_intent.payment_failed':
			console.log('PaymentIntent failed:', event.data.object.id);
			break;
		case 'payment_intent.created':
			console.log(`PaymentIntent created:`,event.data.object.id);
			break;
		case 'charge.succeeded':
			console.log(`Charge succeeded:`,event.data.object.id);
			break;
		case 'charge.updated':
			console.log(`Charge updated:`,event.data.object.id);
			break;
		case 'charge.failed':
			console.log(`Charge failed:`,event.data.object.id);
			break;
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	response.json({ received: true });
});

module.exports = router;
