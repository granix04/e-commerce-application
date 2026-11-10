/**
 * Author : Matt Mitchell
 * Modified by : Alex Lew
 * Date : 09-11-2026
 * 
 * Objective :
 * This code includes basic flow of creating a Payment Intent and handling of error messages.
 * Modification :
 * This code is spun off from app.js for easier maintenance with minimal interruption to app.js.
 */

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.get('/checkout', async function (request, response) {

	const bookItem = request.query.item;
	let title, amount, error, sku;

	// Hardcode product details to avoid using database
	switch (bookItem) {
		case '1':
			title = "The Art of Doing Science and Engineering"
			amount = 2300
			sku = "SKU0001"
			break;
		case '2':
			title = "The Making of Prince of Persia: Journals 1985-1993"
			amount = 2500
			sku = "SKU0002"
			break;
		case '3':
			title = "Working in Public: The Making and Maintenance of Open Source"
			amount = 2800
			sku = "SKU0003"
			break;
		default:
			error = "No item selected"
			break;
	}

	let clientSecret;

	if (!error) {
		// create a payment intent
		try {
			const paymentIntent = await stripe.paymentIntents.create({
				amount: amount,
				currency: 'sgd',
				automatic_payment_methods: { enabled: true },
				description: title,
				metadata: { sku: sku }
			}, {
				// Idempotency key: v4 UUID, as recommended by Stripe
				idempotencyKey: crypto.randomUUID()
			});
			clientSecret = paymentIntent.client_secret;
		} catch (err) {
			// show user-friendly error message
			switch(err.type) {
				case 'StripeRateLimitError':
				case 'StripeConnectionError':
				case 'StripeAPIError':
					error = 'We could not reach our payment provider. Please try again in a moment.';
					console.log(error);
					break;
				case 'StripeInvalidRequestError':
				case 'StripeAuthenticationError':
					error = 'Payment is unavailable right now. Please contact us.';
					console.log(error);
					break;
				default:
					error = 'An unexpected error occurred. Please try again in a moment.';
					console.log(error);
			}
		}
	}

	response.render('checkout', {
		title: title,
		amount: amount,
		error: error,
		client_secret: clientSecret,
		publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
	});

});

module.exports = router;
