/**
 * Author : Matt Mitchell
 * Modified by : Alex Lew
 * Date : 09-11-2026
 * 
 * Objective :
 * This code renders the success page with retrieval of Payment Intent details.
 * Modification :
 * This code is spun off from app.js for easier maintenance with minimal interruption to app.js.
 */

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.get('/success', async function (request, response) {
	// return to home page if payment intent is not found
	if (!request.query.payment_intent) {
		return response.redirect('/');
	}

	// retrieve the payment intent details
	try {
		const paymentIntent = await stripe.paymentIntents.retrieve(request.query.payment_intent);
		response.render('success', {
			succeeded: paymentIntent.status === 'succeeded',
			status: paymentIntent.status,
			title: paymentIntent.description,
			amount: paymentIntent.amount_received,
			paymentIntentId: paymentIntent.id
		});
	} catch (error) {
		response.render('success', { error: 'Payment not found !' });
	}
});

module.exports = router;
