const prisma = require('../../config/prisma');

const validatePromo = async (req, res) => {
  try {
    const { code, amount } = req.body;

    const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });

    if (!promo) return res.status(404).json({ success: false, message: 'Invalid promo code' });
    if (!promo.isActive) return res.status(400).json({ success: false, message: 'Promo code is no longer active' });
    if (promo.expiresAt && new Date() > promo.expiresAt) return res.status(400).json({ success: false, message: 'Promo code has expired' });
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return res.status(400).json({ success: false, message: 'Promo code usage limit reached' });
    if (promo.minAmount && amount < promo.minAmount) return res.status(400).json({ success: false, message: `Minimum booking amount is ₦${promo.minAmount.toLocaleString()}` });

    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = (amount * promo.discountValue) / 100;
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else {
      discount = promo.discountValue;
    }

    discount = Math.min(discount, amount);

    res.json({
      success: true,
      message: 'Promo code applied!',
      data: {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discount: Math.round(discount),
        finalAmount: Math.round(amount - discount)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPromo = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minAmount, maxDiscount, usageLimit, expiresAt } = req.body;

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minAmount: minAmount ? parseFloat(minAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.status(201).json({ success: true, data: promo });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Promo code already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPromos = async (req, res) => {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: promos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const togglePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await prisma.promoCode.findUnique({ where: { id } });
    const updated = await prisma.promoCode.update({ where: { id }, data: { isActive: !promo.isActive } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePromo = async (req, res) => {
  try {
    await prisma.promoCode.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Promo code deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { validatePromo, createPromo, getAllPromos, togglePromo, deletePromo };