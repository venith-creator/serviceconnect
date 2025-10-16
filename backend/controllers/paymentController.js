import Stripe from 'stripe';
import Payment from "../models/Payment.js";
import ProviderProfile from "../models/ProviderProfile.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a checkout session for service activation
export const createPayment = async (req, res) => {
    try {
        const providerId = req.user._id;
        const {metadata, amount, currency = "gbp"} = req.body;

        const profile = await ProviderProfile.findOne({user: providerId});
        if (!profile) {
            return res.status(404).json({message: "Provider profile not found"});
        }

        const user = await User.findById(providerId);
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const service = profile.services.id(metadata.serviceId);
        if (!service) {
            return res.status(404).json({message: "Service not found"});
        }

        // Check if service is already active
        if (service.status === "active") {
            return res.status(400).json({
                message: "Service is already active"
            });
        }

        const centAmount = amount * 100;

        // Get or create Stripe customer
        let stripeCustomerId = profile.stripeCustomerId;
        if (!stripeCustomerId) {
            const stripeCustomer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {userId: providerId.toString()}
            });
            stripeCustomerId = stripeCustomer.id;
            profile.stripeCustomerId = stripeCustomerId;
            await profile.save();
        }

        // Create payment record first to get the ID
        const payment = new Payment({
            provider: providerId,
            service: metadata.serviceId,
            amount: amount,
            status: 'pending',
            stripeCustomerId: stripeCustomerId,
            currency: currency,
            description: `Service activation for ${service.category}`
        });

        await payment.save();

        // Create checkout session with payment ID in metadata
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: stripeCustomerId,
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: 'Service Activation',
                            description: `Activation for ${service.category} service`
                        },
                        unit_amount: centAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_APP_URL}/dashboard/provider/subscription?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_APP_URL}/dashboard/provider/subscription?payment_canceled=true`,
            metadata: {
                paymentId: payment._id.toString(),
                providerId: providerId.toString(),
                serviceId: metadata.serviceId.toString(),
                type: "service_activation"
            },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
        });

        // Update payment with session ID
        payment.stripeCheckoutSessionId = session.id;
        await payment.save();

        res.status(200).json({
            url: session.url,
            sessionId: session.id
        });

    } catch (error) {
        console.error('Payment creation error:', error);
        return res.status(500).json({
            message: 'Error creating payment',
            error: error.message
        });
    }
};

// Handle successful checkout session
export const handleCheckoutSessionCompleted = async (session) => {
    try {
        console.log('Processing completed checkout session:', session.id);

        // Find payment by session ID
        const payment = await Payment.findOne({
            stripeCheckoutSessionId: session.id
        });

        if (!payment) {
            console.error('Payment not found for session:', session.id);
            return;
        }

        // Update payment status
        payment.status = 'completed';
        payment.stripePaymentIntentId = session.payment_intent;
        payment.paidAt = new Date();
        await payment.save();

        // Update service status to active
        const profile = await ProviderProfile.findOne({user: payment.provider});
        if (profile) {
            const service = profile.services.id(payment.service);
            if (service) {
                service.status = 'active';
                service.requiresPayment = false;
                service.activatedAt = new Date();
                service.approved = true;
                await profile.save();
                console.log(`Service ${service._id} activated for provider ${payment.provider}`);
            }
        }

        console.log('Payment completed successfully:', payment._id);
        return payment;

    } catch (error) {
        console.error('Error handling checkout session completion:', error);
        throw error;
    }
};

// Handle expired or failed checkout session
export const handleCheckoutSessionExpired = async (session) => {
    try {
        const payment = await Payment.findOneAndUpdate(
            {stripeCheckoutSessionId: session.id},
            {
                status: 'expired',
                expiredAt: new Date()
            },
            {new: true}
        );

        if (payment) {
            console.log('Payment session expired:', payment._id);
        }

        return payment;
    } catch (error) {
        console.error('Error handling expired session:', error);
        throw error;
    }
};

// Get checkout session status
export const getCheckoutSessionStatus = async (req, res) => {
    try {
        const {sessionId} = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        // Find associated payment
        const payment = await Payment.findOne({stripeCheckoutSessionId: sessionId});

        res.json({
            session: {
                id: session.id,
                status: session.status,
                payment_status: session.payment_status,
                customer_email: session.customer_email,
                amount_total: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency
            },
            payment: payment ? {
                id: payment._id,
                status: payment.status,
                amount: payment.amount,
                description: payment.description
            } : null
        });

    } catch (error) {
        console.error('Error retrieving session status:', error);
        res.status(500).json({message: error.message});
    }
};

// Handle Stripe webhook events for checkout
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
        console.error('No signature provided');
        return res.status(400).send('No signature provided');
    }

    if (!webhookSecret) {
        console.error('Webhook secret not configured');
        return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        console.log(`Received webhook event: ${event.type}`);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const completedSession = event.data.object;
                await handleCheckoutSessionCompleted(completedSession);
                break;

            case 'checkout.session.expired':
                const expiredSession = event.data.object;
                await handleCheckoutSessionExpired(expiredSession);
                break;

            case 'payment_intent.succeeded':
                // This might still be called for the underlying payment intent
                const paymentIntent = event.data.object;
                console.log('Payment intent succeeded:', paymentIntent.id);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                break;

            case 'charge.succeeded':
                const charge = event.data.object;
                console.log('Charge succeeded:', charge.id);
                break;

            case 'charge.failed':
                const failedCharge = event.data.object;
                console.log('Charge failed:', failedCharge.id);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.json({received: true});
    } catch (error) {
        console.error('Error handling webhook event:', error);
        res.status(500).json({error: 'Error processing webhook'});
    }
};

// Get all payments for a provider
export const getProviderPayments = async (req, res) => {
    try {
        const payments = await Payment.find({provider: req.user._id})
            .sort({createdAt: -1})
            .populate('service', 'category name');
        res.json(payments);
    } catch (error) {
        console.error('Error getting provider payments:', error);
        res.status(500).json({message: error.message});
    }
};

// Get payment status for a provider
export const getProviderPaymentStatus = async (req, res) => {
    try {
        const providerId = req.user._id;
        const profile = await ProviderProfile.findOne({user: providerId});
        if (!profile) {
            return res.status(404).json({message: "Profile not found"});
        }

        // Check for services that need activation
        const servicesNeedingActivation = profile.services.filter(service =>
            service.status !== 'active' && service.requiresPayment !== false
        );

        // Get pending payments
        const pendingPayments = await Payment.find({
            provider: providerId,
            status: 'pending'
        });

        res.json({
            hasServicesNeedingActivation: servicesNeedingActivation.length > 0,
            services: servicesNeedingActivation,
            totalServices: profile.services.length,
            pendingPayments: pendingPayments.length
        });
    } catch (error) {
        console.error("Error getting provider payment status:", error);
        res.status(500).json({message: error.message});
    }
};

// Get all payments (admin only)
export const getAllPaymentsAdmin = async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({createdAt: -1})
            .populate('provider', 'name email')
            .populate('service', 'category name');
        res.json(payments);
    } catch (error) {
        console.error('Error getting all payments:', error);
        res.status(500).json({message: error.message});
    }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;
        const payment = await Payment.findById(id);
        if (!payment) return res.status(404).json({message: "Payment not found"});

        payment.status = status;
        await payment.save();

        // If marking as completed, activate the service
        if (status === 'completed') {
            const profile = await ProviderProfile.findOne({user: payment.provider});
            if (profile) {
                const service = profile.services.id(payment.service);
                if (service) {
                    service.status = 'active';
                    service.requiresPayment = false;
                    await profile.save();
                }
            }
        }

        res.json(payment);
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({message: error.message});
    }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
    try {
        const {id} = req.params;
        const payment = await Payment.findById(id)
            .populate('provider', 'name email')
            .populate('service', 'category name');
        if (!payment) return res.status(404).json({message: "Payment not found"});
        res.json(payment);
    } catch (error) {
        console.error('Error getting payment by ID:', error);
        res.status(500).json({message: error.message});
    }
};

// Get provider earnings
export const getProviderEarnings = async (req, res) => {
    try {
        const completedPayments = await Payment.find({
            status: "completed"
        });

        const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        const pendingPayments = await Payment.find({
            status: "pending"
        }).countDocuments()
        res.json({
            totalEarnings,
            completed: completedPayments.length,
            pending: pendingPayments,
        });
    } catch (error) {
        console.error('Error getting provider earnings:', error);
        res.status(500).json({message: error.message});
    }
};

// Process refund
export const processRefund = async (req, res) => {
    try {
        const {paymentId, reason} = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({message: "Payment not found"});
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({message: "Only completed payments can be refunded"});
        }

        if (!payment.stripePaymentIntentId) {
            return res.status(400).json({message: "No payment intent associated with this payment"});
        }

        // Process refund through Stripe
        const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            reason: reason || 'requested_by_customer'
        });

        // Update payment status
        payment.status = 'refunded';
        payment.refundedAt = new Date();
        await payment.save();

        // Update service status
        const profile = await ProviderProfile.findOne({user: payment.provider});
        if (profile) {
            const service = profile.services.id(payment.service);
            if (service) {
                service.status = 'inactive';
                service.requiresPayment = true;
                await profile.save();
            }
        }

        res.json({success: true, refund});
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({message: error.message});
    }
};

// Get payment history for a provider
export const getProviderPaymentHistory = async (req, res) => {
    try {
        const {startDate, endDate} = req.query;
        const query = {provider: req.user._id};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const payments = await Payment.find(query)
            .sort({createdAt: -1})
            .populate('service', 'category name');

        res.json(payments);
    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({message: error.message});
    }
};

export const getAllProviderPaymentHistory = async (req, res) => {
    try {
        const {startDate, endDate, page = 1, limit = 20, status} = req.query;
        const query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        if (status) {
            query.status = status.toLowerCase();
        }

        const p = Math.max(Number(page), 1);
        const l = Math.max(Number(limit), 1);
        const skip = (p - 1) * l;

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .sort({createdAt: -1})
                .skip(skip)
                .limit(l)
                .populate("service", "category name")
                .populate("provider", "name email"),
            Payment.countDocuments(query),
        ]);

        res.json({
            data: payments,
            pagination: {
                total,
                page: p,
                limit: l,
                totalPages: Math.ceil(total / l),
            },
        });
    } catch (error) {
        console.error("Error getting payment history:", error);
        res.status(500).json({message: error.message});
    }
};

// Verify payment and service status
export const verifyPaymentStatus = async (req, res) => {
    try {
        const {sessionId} = req.params;

        const payment = await Payment.findOne({stripeCheckoutSessionId: sessionId})
            .populate('provider', 'name email')
            .populate('service', 'category name status');

        if (!payment) {
            return res.status(404).json({message: "Payment not found"});
        }

        // If payment is completed, verify service is active
        if (payment.status === 'completed') {
            const profile = await ProviderProfile.findOne({user: payment.provider});
            if (profile) {
                const service = profile.services.id(payment.service._id);
                if (service && service.status !== 'active') {
                    // Service should be active but isn't - fix it
                    service.status = 'active';
                    service.requiresPayment = false;
                    await profile.save();
                }
            }
        }

        res.json({
            payment: payment,
            serviceActive: payment.status === 'completed'
        });

    } catch (error) {
        console.error('Error verifying payment status:', error);
        res.status(500).json({message: error.message});
    }
};