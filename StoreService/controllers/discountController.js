const prisma = require("../prismaClient");

const buildFilterQuery = (filters) => {
  const query = {};
  for (const key in filters) {
    if (filters[key]) {
      query[key] = { contains: filters[key], mode: "insensitive" };
    }
  }
  return query;
};

const getAllDiscountCoupons = async (req, res) => {
  const { offset = 0, limit = 10, ...filters } = req.query;
  try {
    const parsedOffset = Math.max(parseInt(offset, 10) || 0);
    const parsedLimit = Math.min(parseInt(limit, 10) || 10);

    const where = buildFilterQuery(filters);

    const discounts = await prisma.discount.findMany({
      where,
      skip: parsedLimit * parsedOffset,
      take: parsedLimit,
      include: {
        user: true,
      },
    });
    const total = await prisma.discount.count({ where });

    return res.status(200).json({
      discounts,
      pageDetails: {
        total,
        offset: parsedOffset,
        limit: parsedLimit,
        currentPage: Math.floor(parsedOffset / parsedLimit) + 1,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const createDiscountCoupon = async (req, res) => {
  try {
    delete req.body.status;
    const data = req.body;
    const amount = parseFloat(req.body.amount);
    const usageLimit = parseInt(req.body.usageLimit);
    const discount = await prisma.discount.create({
      data: {
        ...data,
        amount,
        usageLimit,
      },
    });
    return res
      .status(201)
      .json({ message: "Successfully created a coupon", discount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const getDiscountCouponById = async (req, res) => {
  const id = req.params.id;
  try {
    const discount = await prisma.discount.findUnique({ where: { id } });
    if (!discount)
      return res.status(404).json({ message: "Discount coupon not found" });
    return res.status(200).json(discount);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const updateDiscountCoupon = async (req, res) => {
  const id = req.params.id;
  try {
    const discount = await prisma.discount.findUnique({ where: { id } });
    if (!discount)
      return res.status(404).json({ message: "Discount coupon not found" });
    const { code, type, amount, usageLimit, cartAmount } = req.body;
    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        code: code || discount.code,
        type: type || discount.type,
        amount: parseFloat(amount) || discount.amount,
        usageLimit: parseInt(usageLimit) || discount.usageLimit,
        cartAmount: cartAmount || discount.cartAmount,
      },
    });
    return res.status(200).json({
      message: "Successfully updated a discount coupon",
      updatedDiscount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const deleteDiscountCoupon = async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.discount.delete({ where: { id } });
    return res
      .status(200)
      .json({ message: "Successfully deleted discount coupon" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const applyDiscountCoupon = async (req, res) => {
  const currentDateISO = new Date().toISOString();
  try {
    const { amount, code } = req.query;
    const discount = await prisma.discount.findUnique({
      where: { code },
    });

    // Check If Discount Coupon Is Valid Or Not
    if (!discount)
      return res.status(404).json({ message: "Invalid Coupon Code" });

    // Check If Discount Coupon Is Active
    if (
      discount.startDate > currentDateISO &&
      discount.endDate < currentDateISO
    )
      return res
        .status(200)
        .json({ message: "This coupon is currently not available" });

    // Check If Discount Coupon Met Minimum Amount
    if (parseFloat(discount.cartAmount.min) > parseFloat(amount))
      return res.status(200).json({
        message: `Minimum Cart Amount Should be ${discount.cartAmount.min}`,
      });

    // Check If Discount Coupon Met Maximum Amount
    if (parseFloat(discount.cartAmount.max) < parseFloat(amount))
      return res.status(200).json({
        message: `Maximum Cart Amount Should be ${discount.cartAmount.max}`,
      });
    return res
      .status(200)
      .json({ message: "Coupon applied successfully", discount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = {
  getAllDiscountCoupons,
  createDiscountCoupon,
  getDiscountCouponById,
  updateDiscountCoupon,
  deleteDiscountCoupon,
  applyDiscountCoupon,
};
