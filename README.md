# 1. Background

Stripe Press Shop is a simple e-commerce application that a customer can use to purchase a book. A customer picks one of three books, pays on the payment page, and gets a confirmation with the total charged and the Payment Intent ID.

Overall, the solution is built with the Payment Intents API [0] on the server and the Payment Element [1] on the browser.

# 2. Value Proposition for Your Organisation

## 2.1 Seamless Payment experience
The solution focuses on the user experience, with a simple and elegant UI design that gives customers confidence when paying for the product they are purchasing. The Payment page shows only the payment methods that make sense for that customer and currency. Customers who have saved their details with Link [2] can pay in a couple of taps.

## 2.2 Speed to value for the customers
Customers can pay in less than a minute, while Stripe takes care of everything under the hood, from setting up the payment request, rendering the payment page and validating the card, to confirming the payment.

## 2.3 Trusted and robust system
Peace of mind for the customers with Stripe fraud prevention [3]. Customer is required to authenticate the payment on their bank app with 3D Secure [4]. On top of that, customer's payment is securely collected and transmitted directly to Stripe, reducing your PCI obligation [5]. The system is also built for resiliency, which has zero-tolerance for double charging.

## 2.4 Speed to market 
Comprehensive documentation with ready-to-use Node.js samples [6]/[7], so a developer can go from a new sandbox account to a working solution in a short duration, without building the payment form from scratch.

# 3. Configure the application

## 3.1 Prerequisites

### 3.1.1 Set up a Stripe account and use a sandbox

Create a free Stripe account at [dashboard.stripe.com/register](https://dashboard.stripe.com/register). Then open a sandbox [8], which is a safe test environment that does not involve real money.

In the sandbox, go to `API keys` [9], and keep these two keys handy:
* Publishable key, `pk_test_` : to be used in the browser to load the Payment Element
* Secret key, `sk_test_` : to create Payment Intent

### 3.1.2 Initialisation of the environment

You will need Node.js [10] to run the app, the Stripe CLI [11] to receive webhooks on your computer, and Git [12] to download the code from Github.

**MacOS** : Launch a new terminal and run the following commands (suggest to use [Homebrew](https://brew.sh)).
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
(Run the *Next steps* commands that Homebrew prints at the end, then launch a new terminal to run the rest of the commands)
```bash
brew install node
brew install stripe/stripe-cli/stripe
brew install git
```

**Windows** : Launch a new PowerShell window and run the following commands.
```powershell
winget install OpenJS.NodeJS.LTS
winget install --id Git.Git -e
```
(Launch a new PowerShell window and run the rest of the commands)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### 3.1.3. Check that everything is installed

Run these commands on Terminal or PowerShell window, to verify your installations.
```bash
node -v
stripe version
git --version
```
## 3.2 Download the project and install its packages

Create a new folder in your laptop and download the Github project.

* On Mac, right click on your new folder, select "New Terminal at Folder", and follow the commands below.
* On Windows, use File Explorer, in your new folder, click "Alt + D", and "Ctrl + C" to copy the directory path of your new folder. Launch a new Command Prompt, type "cd " and paste the directory path, press "enter" key, and run the following commands.

```bash
git clone https://github.com/granix04/e-commerce-application.git
cd e-commerce-application
npm install
```

## 3.3 Set up the webhook to get its signing secret

Stripe uses webhooks to tell the app about payment events, even when the customer has closed the browser after completing the payment [13]. Launch a new terminal and type the following commands.

```bash
stripe login
```
This logs in to your Stripe account from the CLI. It opens your browser, where you pick the right sandbox and click the `Authorise` button.

```bash
stripe listen --all-snapshot --forward-to localhost:3000/webhook
```
It starts forwarding events to the app's webhook route. The CLI prints a line like this : Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxx. Copy the secret. Leave this terminal open while you use the app.

## 3.4 Update `sample.env`
Rename `sample.env` to `.env` and populate with your Stripe account's sandbox API keys, webhook secret, and save the file. If there is an error rename the file, please use the terminal on the same folder path and run this command : mv sample.env .env

```text
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

# 4. Running the Application

Launch a new terminal on `e-commerce-application` folder and start the app by running the following command.

```bash
npm start
```

When you see `Getting served on port 3000`, open [http://localhost:3000](http://localhost:3000) in your web browser.

You now have two terminals to watch:

* The terminal running `stripe listen` : Every webhook Stripe sends (eg. --> payment_intent.created [evt_3UYS1TPwprLXBHL41Yow9z0H]), and the status code the app replied with (eg. [200] POST http://localhost:3000/webhook [evt_3UYS1TPwprLXBHL41Yow9z0H])
* The terminal running `npm start` : The app's own log (eg. `PaymentIntent succeeded: pi_...`)

## 4.1 Successful Payment

### 4.1.1 Buy any book with a successful payment and 3D Secure

1. On the home page, click `Purchase - $xx` on any book
2. On the payment page, choose `Card` and enter `4242 4242 4242 4242`, any future expiry date, any 3 digit CVC and any postal code
3. Click `Pay`
4. You will be taken to the success page. It shows the book, the `total charged` and the `Payment Intent ID` (it starts with `pi_`).
5. Validate in the Stripe Dashboard. In your sandbox, open `Transactions` on the left panel and click on the newest payment. Check that:
* The status is **Succeeded** and the amount matches the book, for example S$23.00. In the payment's `Recent activity`, it shows *3D Secure attempt acknowledged* (see 5.5.2).
* The description is the book's title
* Under `Metadata`, `sku` shows the book's SKU (eg. `SKU0001`, `SKU0002` or `SKU0003`)
* The payment ID matches the `pi_` ID on the success page
6. Check the webhook. In the `stripe listen` terminal you will see `payment_intent.succeeded` with a `[200]` reply. In the `npm start` terminal you'll see `PaymentIntent succeeded: pi_...` with the same ID.

## 4.2 Payment Failure

### 4.2.1 Buy any book with a general decline, insufficient funds or an expired card

1. Go back to the home page and buy any book with one of these cards:

* General decline : `4000 0000 0000 0002`, error message : Your card has been declined.
* Insufficient funds : `4000 0000 0000 9995`, error message : Your card has insufficient funds.
* Expired card : `4000 0000 0000 0069`, error message : Your card has expired. For the expired card scenario, you still enter a future expiry date. The Payment Element does not accept a date in the past, so Stripe uses this card number to act out an expired card.

What happens:

1. The error message appears in red font under the payment form, and the `Pay` button can be clicked again.
2. The customer stays on the payment page and can try another card straight away. The same Payment Intent is used for the second attempt.
3. Validate on the Stripe Dashboard. The payment appears in `Transactions` as **Failed**, with the decline reason, for example *Insufficient funds*. If the customer then pays with a good card, the same payment changes to **Succeeded**, and its "Recent Acitivites" shows both attempts.
4. Check the webhook. The `stripe listen` terminal shows `payment_intent.payment_failed` with a `[200]` reply, and the `npm start` terminal shows `PaymentIntent failed: pi_...`

You can try the other test cards listed in section 4.3 to simulate different payment failures.

### 4.2.2 The customer experiences a network connectivity issue

Please refer to section 6.1 on future enhancement. 

This is a common case, where the customer experiences network issue. To mitigate the issue, the current solution sends an idempotency key [14], in the form of a v4 UUID, with every PaymentIntent request. The key protects against a network retry creating a duplicate.

### 4.2.3 The customer refreshes on the checkout page

Please refer to section 6.1 on future enhancement. 

This is an edge case where the internet connection drops and the payment page does not load. The customer will try to refresh the browser, or close the payment page and start again from the home page.

Every time the payment page loads, the server creates a new PaymentIntent in the current solution. So a refresh creates a second PaymentIntent, and the customer sees a fresh payment form.

However, the customer is never charged twice. A PaymentIntent only takes money when it is confirmed, and that only happens when the customer clicks `Pay`. The PaymentIntent left behind by the refresh stays unpaid with the status `requires_payment_method`, and it shows as **Incomplete** on the Dashboard.

## 4.3 Test Cards

Use any future expiry date, any 3 digit CVC and any postal code. The full list is in the Stripe testing docs [15].

* Successful payment : `4242 4242 4242 4242`, message : Succeeded
* Successful payment (Mastercard) : `5555 5555 5555 4444`, message : Succeeded
* 3D Secure required : `4000 0025 0000 3155`, message : Authentication window opens, then Succeeded
* 3D Secure always asked : `4000 0027 6000 3184`, message : Authentication window opens on every payment, then Succeeded
* General decline : `4000 0000 0000 0002`, message : Your card has been declined. (`card_declined`)
* Insufficient funds : `4000 0000 0000 9995`, message : Your card has insufficient funds. (`insufficient_funds`)
* Lost card : `4000 0000 0000 9987`, message : Your card has been declined. (`lost_card`)
* Expired card : `4000 0000 0000 0069`, message : Your card has expired. (`expired_card`)
* Incorrect CVC : `4000 0000 0000 0127`, message : Your card's security code is incorrect. (`incorrect_cvc`)
* Processing error : `4000 0000 0000 0119`, message : An error occurred while processing your card. Try again in a little bit. (`processing_error`)

The message in brackets is the decline reason you will see on the Stripe Dashboard. For a lost card, the customer only sees a general decline message, so the real reason is not revealed to the person holding the card.

# 5. The Solution

Let's break down the solution into a few components : the approach, the payment sequence, the user journey, the Stripe APIs used and the architecture of the solution. The future improvements are in section 6.

## 5.1 The approach

The entire solution was driven by the Stripe documentation and API reference, as well as my experience of building a production-grade solution for a client in Singapore. The solution takes into consideration the best practice, fraud prevention and resiliency, and it reuses the sample code from the documentation, contextualised to the app.

## 5.2 Payment sequence diagram 

The sequence diagram details the step-by-step activities, from the customer checking out the product until the webhook sends the final payment status back to the app.

```text
Browser (Client Side)              Server Side                           Stripe
--------------------              --------------------                  ------------------------
a. GET /checkout?item=2  -------> b. switch (item) → amount = 2500
                                    on checkout.js
                                  c. stripe.paymentIntents.create --->  pi_… created
                                    on checkout.js
                      <---------- d. server-side rendering
e. stripe.elements({mode, currency, amount})
mount('#payment-element')
customer types card, clicks Pay
f. elements.submit()  (validation)
g. stripe.confirmPayment({elements, clientSecret}) ----------------->  charge (3D Secure strongly 
                                                                        recommended)
                      <---------------------------------------------   h. redirect /success
                                                                        payment_intent=pi_…            
i. GET /success ----------------> stripe.paymentIntents.retrieve --->  amount, status
                                    on success.js
                      <---------- "Paid $25.00 · pi_…"
                                  POST /webhook  <-------------------  j. payment_intent.succeeded
                                    on webhook.js
```

## 5.3 User journey

Here is the detailed explanation according to the payment sequence diagram above.

a. On the browser, customer picks a book where each `Purchase` button links to `/checkout?item=1`, `2` or `3`.
b. The server looks up the book. The `switch` in `checkout.js`, the `/checkout` route mounted in `app.js`, sets the title, the amount in cents, and the SKU. The price always comes from the server, so a customer can't change it in the browser.
c. The server creates a PaymentIntent [0] via checkout.js, where it tracks one payment from start to finish [16]. It's created with:
* `amount` = `2300` (the price, always in cents)
* `currency` = `sgd`
* `automatic_payment_methods` = `{ enabled: true }` (The Dashboard decides which payment methods to offer [17])
* `description` = The book's title (Shown on the Stripe Dashboard and on the success page)
* `metadata` = `{ sku: 'SKU0001' }` (For tracing and audit between the app and Stripe [18])
* `idempotencyKey` = `v4 UUID` (to avoid creating same PaymentIntent after a network failure [14])
d. The server renders the payment page using the client secret. This is the server side rendering approach from the Payment Intents docs [6]
e. The Payment page shows the Payment Element. Stripe.js loads from `js.stripe.com`, then the script creates Elements with the same `mode`, `currency` and `amount` as the Payment Intent, then mounts the Payment Element into `payment-element` section of HTML [7].
f. When the customer clicks `Pay`, the script first calls `elements.submit()` to check the form and show any mistakes.
g. Then it calls `stripe.confirmPayment()` [19] with the client secret and a `return_url` that redirects to `/success` upon successful charge. The `Pay` button is disabled while this runs, so a double click can't send a duplicate payment. 3D Secure is strongly recommended to prevent fraud [4].
h. On success, Stripe redirects to `/success` and adds the Payment Intent ID to the address. If the payment fails, there's no redirect. The error message shows on the payment page and the customer can try again.
i. To prevent URL injectio, instead of relying on address bar, `/success` route retrieves the details of Payment Intent from Stripe and shows the actual `amount_received` and the `pi_` ID. If someone injects a fake ID, they get *Payment not found !*. If the payment has not finished yet, the page shows its status instead of *Success*.
j. Separately from the browser, Stripe sends `payment_intent.succeeded` [13] to `POST /webhook`. Webhook is the key component to ensure data integrity between the app and Stripe, where payment status can be synced, even after customer closes the tab right after payment.

## 5.4 List of Stripe APIs

Based on the sequence diagram above, here is the list of Stripe APIs used by respective functions.

```text
Stripe function                             Stripe API
-------------------------------             -------------------------------
c. stripe.paymentIntents.create ------->    Post on /v1/payment_intents [0]
g. stripe.confirmPayment()      ------->    Post on /v1/payment_intents/:id/confirm [20]
i. stripe.paymentIntents.retrieve ----->    Get on /v1/payment_intents/:id [21]
```

## 5.5 Architecture Consideration

### 5.5.1 Modularisation of the solution

In order for the app to thrive in today’s volatile, uncertain, complex and ambiguous world, the solution needs to deliver changes rapidly, frequently and reliably. This is the concept of Microservice Architecture, where application is structured into a set of independently deployable, loosely coupled components.

As such, the app needs a refactor, where the routes are modularised and allow plug-and-play. In practice, we do not often change the production code while adding new features. Every change to working code is a risk to the payments that already work. Keeping each feature in its own file means the checkout and webhook code stay untouched when a new feature goes live, with minimal changes to `app.js`.

The routes in the solution have been modularised [22].
```text
e-commerce-application/src/route/
* checkout.js
* success.js
* webhook.js
```

With this layout, adding a new feature such as refund means one new JavaScript file in `src/route` and one new line in `app.js` :
```javascript
app.use(require('./src/route/refund'));
```

### 5.5.2 Fraud Prevention

Stripe Radar reduces fraud by 32% on average, and there is a 92% likelihood that a charge comes from a card Stripe has seen before.

We can easily set up fraud prevention on Stripe via Radar [3]. Built-in Radar rule `Request 3D Secure if 3D Secure is supported for card` has been enabled on the Dashboard [23]. With this rule, the customer is asked to authenticate with their bank app whenever the card supports 3D Secure.

The outcome of 3D Secure decides what happens next [24]. If the customer is authenticated, Stripe goes ahead with the charge. If the authentication fails, the Payment Intent goes back to `requires_payment_method` and the customer sees an error and can try again. In other cases, eg. the bank only acknowledges the attempt, the charge can still go ahead. This is what can be seen with the test card `4242 4242 4242 4242`, where the Dashboard shows *3D Secure attempt acknowledged* (see 4.1.1).

### 5.5.3 Resiliency

The solution has strong focus on error handling and prevention of double charging.

* Error handling with message on card failures. Declines, expired cards, etc, show a clear message on the payment page, and the customer can retry without losing the order [25].
* Idempotency key to avoid duplicate charge. Every request that creates a Payment Intent carries an idempotency key [14], so if the network fails and the request is retried, Stripe returns the same Payment Intent instead of creating a new one.
* Webhook as the source of truth for the status of every payment. If our server is unreachable, Stripe automatically retries the webhook for up to three days in live mode [13].

# 6. Future Improvement

The future improvements focus on making Stripe integration more resilient and observable.

## 6.1 Order-to-Cash flow

It is not optimal to have abandoned Payment Intents due to page refresh during poor network connectivity (see 4.2.3). In reality, Order-to-Cash is the industry common flow, where the system first generates an order and Payment Intent, only then proceed to payment page. In this case, we decouple the Payment Intent creation from the payment page. 

1. Customer clicks `Purchase`. The server creates an order in the database (eg. `ORD0001`, status `pending`, SKU, amount)
2. In the process of creating the order, the server creates the Payment Intent, with `metadata.order_id` and idempotency key, and saves the `pi_` ID and the key on the order
3. Payment page loads with `/checkout?order=ORD0001`. If the customer refreshes the page, there is no new PaymentIntent, because the same PaymentIntent has already been created during the order capture process. This enforces integrity with one PaymentIntent for each order.

## 6.2 Structured Logging

It is industry best practice to have a structured logging mechanism for tracking and audit purpose. Today the app writes plain text logs such as `PaymentIntent succeeded: pi_...` on the terminal. In production, we need a full-blown logging when many customers are making payments around the same time. 

With logging, each log line is written with key fields and it is best to link to the order and payment record. Sample payload as below.

```json
{"time":"2026-11-07T10:15:02Z","event":"payment_intent.succeeded","order_id":"ORD0001","payment_intent":"pi_...","sku":"SKU0001","amount":2300,"currency":"sgd"}
```

Logging is not only useful for receiving webhook events, it is also critical to keep a record of all errors during the payment process, which serves as a good analysis for future improvement.

## 6.3 Automatic Retry

This is an enhancement to section 4.2.2, where the current solution does not have retry mechanism whenever there is a network connectivity issue. 

We can set the maxNetworkRetries [26] so that failed network calls are retried safely with the same idempotency key, which we recommended earlier in section 6.1 to be saved in the order record. Retries could use exponential backoff to avoid repeatedly sending requests during an ongoing failure.

## 6.4 Advanced Radar Rules

The rule in 5.5.2 asks every customer for 3D Secure. An optimal approach is to only challenge the risky payments, so the good customers check out quickly. For example, we can enable the following rules, among others. [23].

* Turn on `Block if CVC verification fails based on risk score` to block payments that fail the CVC check, unless Stripe sees the payment as low risk
* Enable `Request 3D Secure if :risk_level: != 'normal' and :amount_in_usd: > 25` to request 3D Secure only for risky payments, so that low risk customers pay without the extra step
* Turn on `Request 3D Secure if is_missing(:seconds_since_card_first_seen:)` for new cards, so that a card that Stripe has never seen on our account must authenticate

## 6.5 Liability Shift

A liability shift defines who’s responsible when a payment is identified as fraudulent. 

When a customer tells their bank that a payment was not made by them, the bank raises a fraud dispute (chargeback) and the business usually loses the money plus a dispute fee. With a liability shift, the bank takes on the loss instead of the business [27]. A liability shift can be expected when the payment was successfully authenticated with 3D Secure and later receives an eligible fraud dispute, but it isn't guaranteed.

We can track it in the app. The webhook in `webhook.js` can listen to `charge.succeeded` and read the `three_d_secure` property on the card information in the Charge’s `payment_method_details`, and save the value together with the order record [24]. When a dispute arrives, the team can see straight away if a liability shift is likely.

## 6.6 API Rate Limiting

Stripe limits how many API requests a Stripe account can send in a short period of time, to keep the API stable and prevent abuse [28]. In live mode, the global API rate limit is 100 requests per second, while most endpoints, including Payment Intents, have 25 requests per second.

When a limit is hit, Stripe replies with HTTP `429` and the header `Stripe-Rate-Limited-Reason`, which explains why the request was rate-limited [28].

Related to 6.3, we should retry with exponential backoff and a small random delay, especially when Stripe replies with HTTP `429`, so that the retries do not add more load [28]. Contact Stripe support ahead of a big sale, eg. a book launch, as a flash sale is a common reason for hitting the limit.

On the other hand, fraudsters could try many stolen cards to find which ones work, which is known as card testing [29]. Stripe recommends using one of its recommended integrations, such as the Payment Element, to take advantage of the automated CAPTCHA based protection [29].

# 7. Challenges

During the building of solution, error occurred.

* Webhook printed 400 on the terminal running `stripe listen`. As part of the debugging, I realised the error refers to failure of signature verification [30], and further probe brought me to Stripe document on making sure the parser comes after the webhook route [31].

# 8. References

[0] https://docs.stripe.com/api/payment_intents/create\
[1] https://docs.stripe.com/payments/payment-element\
[2] https://docs.stripe.com/payments/link\
[3] https://docs.stripe.com/radar\
[4] https://docs.stripe.com/payments/3d-secure\
[5] https://docs.stripe.com/security/guide\
[6] https://docs.stripe.com/payments/payment-intents?lang=node\
[7] https://docs.stripe.com/payments/payment-element/migration\
[8] https://docs.stripe.com/sandboxes\
[9] https://docs.stripe.com/keys\
[10] https://nodejs.org/en/download\
[11] https://docs.stripe.com/stripe-cli\
[12] https://git-scm.com/downloads\
[13] https://docs.stripe.com/webhooks?lang=node\
[14] https://docs.stripe.com/api/idempotent_requests\
[15] https://docs.stripe.com/testing\
[16] https://docs.stripe.com/payments/paymentintents/lifecycle\
[17] https://docs.stripe.com/payments/payment-methods/dynamic-payment-methods\
[18] https://docs.stripe.com/metadata\
[19] https://docs.stripe.com/js/payment_intents/confirm_payment\
[20] https://docs.stripe.com/api/payment_intents/confirm\
[21] https://docs.stripe.com/api/payment_intents/retrieve\
[22] https://stackoverflow.com/questions/27712768/how-to-modularize-routing-with-node-js-express\
[23] https://docs.stripe.com/radar/rules#request-3d-secure\
[24] https://docs.stripe.com/payments/3d-secure/authentication-flow\
[25] https://docs.stripe.com/error-handling\
[26] https://docs.stripe.com/error-low-level\
[27] https://docs.stripe.com/payments/3d-secure/authentication-flow#disputed-payments\
[28] https://docs.stripe.com/rate-limits\
[29] https://docs.stripe.com/disputes/prevention/card-testing\
[30] https://docs.stripe.com/webhooks/quickstart?lang=node\
[31] https://docs.stripe.com/events/manage-webhook-endpoints?lang=node