// controllers/paymentController.js
import Payment from "../models/Payment.js";
import ProviderProfile from "../models/ProviderProfile.js";

export const createSubscriptionPayment = async (req, res) => {
  const providerId = req.user._id;
  const { serviceId } = req.body;

  const profile = await ProviderProfile.findOne({ user: providerId });
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  const service = profile.services.id(serviceId);
  if (!service) return res.status(404).json({ message: "Service not found" });

  // First service = $20, others = $10
  const isFirst = profile.services[0]._id.equals(service._id);
  const amount = isFirst ? 20 : 10;

  const payment = new Payment({
    provider: providerId,
    service: service._id,
    amount,
    type: "subscription",
  });

  await payment.save();

  res.status(201).json(payment);
};

export const getProviderPayments = async (req, res) => {
  const payments = await Payment.find({ provider: req.user._id }).sort({ createdAt: -1 });
  res.json(payments);
};

export const getAllPaymentsAdmin = async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
};

export const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    payment.status = status;
    await payment.save();
    res.json(payment);
};

export const getPaymentById = async (req, res) => {
  const { id } = req.params;
  const payment = await Payment.findById(id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  res.json(payment);
};
export const getProviderEarnings = async (req, res) => {
  const providerId = req.user._id;
  const payments = await Payment.find({ provider: providerId, status: "completed" });

  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
  res.json({ totalEarnings, payments });
};

// Additional functions like refundPayment can be added here

// Note: Actual payment processing (e.g., via Stripe) is not implemented here   and would require secure handling of payment details.   This is a simplified version for demonstration purposes only.

