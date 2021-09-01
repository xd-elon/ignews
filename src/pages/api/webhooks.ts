import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import stripe from "stripe";
import Stripe from "stripe";
import { saveSubscription } from "./_lib/managerSubscripOption";

async function buffer(readable: Readable) {
    const chunks = [];

    for await (const chunk of readable) {
        chunks.push(
            typeof chunk === 'string' ? Buffer.from(chunk) : chunk
        );
    }

    return Buffer.concat(chunks);
}

export const config = {
    api: {
        bodyParser: false
    }
}

const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscriptions.created',
    'customer.subscriptions.updated',
    'customer.subscriptions.deleted'
])


export default async(req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const buf = await buffer(req)
        const secret = req.headers['stripe-signature']

        let event: Stripe.Event;

        try {
            event = stripe.Webhooks.constructor(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            return res.status(400).send(`Webhook error: ${err.message}`)
        }

        const { type } = event;

        if(relevantEvents.has(type)) {
            try {
                switch(type) {
                    case 'customer.subscriptions.created':
                    case 'customer.subscriptions.updated':
                    case 'customer.subscriptions.deleted':

                        const subscription = event.data.object as Stripe.Subscription;

                        await saveSubscription(
                            subscription.id,
                            subscription.customer.toString(),
                            type === 'customer.subscriptions.created'
                        )

                        break;
                    case 'checkout.session.completed':
                   
                   

                    const checkoutSession = event.data.object as Stripe.Checkout.Session
                        
                    await saveSubscription(
                        checkoutSession.subscription.toString(),
                        checkoutSession.customer.toString(),
                        true
                    )


                        break;
                    default:
                        throw new Error('UnhandLed event')
                }
            } catch(err) {
                return res.json( {erro: "webhook handler filed"})
            }

        }

        res.status(200).json({received: true})
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}