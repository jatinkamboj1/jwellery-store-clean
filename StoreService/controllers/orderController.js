// controllers/orderController.js
const prisma = require("../prismaClient");

// Helper function to calculate discount
const calculateDiscount = (total, discounts) => {
  return discounts.reduce((discountAmount, discount) => {
    if (discount.type === "PERCENTAGE") {
      return discountAmount + (total * discount.amount) / 100;
    } else if (discount.type === "FIXED") {
      return discountAmount + discount.amount;
    }
    return discountAmount;
  }, 0);
};

// Helper function to parse pagination
const parsePagination = (query) => {
  return {
    currentPage: parseInt(query.currentPage, 10) || 0,
    offset: parseInt(query.offset, 10) || 0,
    limit: parseInt(query.limit, 10) || 10,
  };
};

// Get all orders with pagination and filtering
exports.getOrders = async (req, res) => {
  try {
    const { currentPage, offset, limit } = parsePagination(req.query);
    const { name, ...otherFilters } = req.query;
    const filters = { ...req.query };
    // const asc = req.query.asc === "true" ? "asc" : "desc";
    //console.log("req.query.asc: ", req.query.asc);
    const asc = req.query.asc?.toLowerCase() === "true" ? "asc" : "desc";

    const title = req.query.title;
    let orderBy = { createdAt: "desc" };
    if (title === "userId") {
      title;
      orderBy = {
        user: {
          name: asc,
        },
      };
    }
    if (title === "quantity") {
      orderBy = {
        products: {
          _count: asc,
        },
      };
    }
if (title && title !== "userId" && title !== "quantity") {
  orderBy = { [title]: asc };
}
    //console.log("orderBy: ", orderBy);
    delete filters.currentPage;
    delete filters.limit;
    delete filters.offset;
    delete filters.name;
    delete filters.title;
    delete filters.asc;

    const userFilters = name
      ? { name: { contains: name, mode: "insensitive" } }
      : {};

    const orders = await prisma.order.findMany({
      where: {
        user: userFilters,
        ...filters,
      },
      skip: offset * limit,
      take: limit,
      orderBy,
      include: { user: true, products: true, Discount: true },
    });

    const total = await prisma.order.count({
      where: { ...filters, user: userFilters },
    });

    res.json({
      orders,
      pageDetails: {
        total,
        offset,
        limit,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get user orders by user ID with pagination and filtering
exports.getUserOrdersById = async (req, res) => {
  try {
    let { id } = req.params;
    if (id === "user") id = req.user.id;

    const { currentPage, limit } = parsePagination(req.query);
    const filters = { ...req.query };
    delete filters.currentPage;
    delete filters.limit;
    const orders = await prisma.order.findMany({
      where: { userId: id, ...filters },
      skip: currentPage * limit,
      take: limit,
      include: {
        products: {
          include: {
            product: { include: { images: true, ProductVariant: true } },
          },
        },
        Discount: true,
      },
    });

    const total = await prisma.order.count({
      where: { userId: id, ...filters },
    });

    res.json({
      orders,
      pageDetails: {
        total,
        limit,
        currentPage,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get user orders by token with pagination and filtering
exports.getUserOrdersByToken = async (req, res) => {
  try {
    const id = req.user.id; // Extract user ID from the token

    const orders = await prisma.order.findMany({
      where: { userId: id },
      include: {
        products: {
          include: {
            product: { include: { images: true, ProductVariant: true } },
          },
        },
        Discount: true,
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    let {
      userName,
      mobileNumber,
      billingStreet,
      billingCity,
      billingState,
      billingZip,
      billingCountry,
      userId,
      addressId,
      products,
      discountIds,
      status,
      customerRemarks,
    } = req.body;
    if (!userId) {
      userId = req.user.id;
    }
    let total = 0;
    const orderProducts = [];

    for (const item of products) {
      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product)
          return res.status(400).json({ error: "Invalid product ID" });
        total += product.price * item.quantity;
        orderProducts.push({
          productId: item.productId,
          quantity: item.quantity,
        });
      } else if (item.productVariantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.productVariantId },
        });
        if (!variant)
          return res.status(400).json({ error: "Invalid product variant ID" });
        total += variant.price * item.quantity;
        orderProducts.push({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        });
      }
    }

    let discountAmount = 0;
    let discounts = [];
    if (discountIds) {
      discounts = await prisma.discount.findMany({
        where: { id: { in: discountIds } },
      });
      discountAmount = calculateDiscount(total, discounts);
    }

    const actualAmount = total - discountAmount;
    //console.log('actualAmount: ', actualAmount);
    if (actualAmount <= 0 || parseFloat(actualAmount) <= 0) {
      return res.status(400).json({ error: "Order not create" });
    }
    const uss = {};
    if (userName) {
      uss.userName = userName;
    }
    if (mobileNumber) {
      uss.mobileNumber = mobileNumber;
    }
    const order = await prisma.order.create({
      data: {
        user: { connect: { id: userId } },
        // addressId,
        total,
        actualAmount,
        status,
        customerRemarks,
        Discount: {
          connect: discounts.map((discount) => ({ id: discount.id })),
        },
        products: { create: orderProducts },
        paid: "COD",
        cancellationExpiry: new Date().toISOString(),
        billingStreet,
        billingCity,
        billingState,
        billingZip,
        billingCountry,
        ...uss,
      },
      include: { products: true, Discount: true },
    });

    res.status(201).json({ order, updatedCartValue: actualAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder)
      return res.status(404).json({ error: "Order not found" });
    if (existingOrder.status === "CONFIRMED")
      return res
        .status(400)
        .json({ error: "Order cannot be updated as it is already confirmed" });

    const updatedOrder = await prisma.order.update({ where: { id }, data });
    res.status(200).json({ updatedOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderNumber = parseInt(id);
    const order = await prisma.order.findFirst({
      where: { id },
      include: {
        user: { include: { Address: true } },
        products: {
          include: {
            product: { include: { images: true } },
            productVariant: {
              include: { product: { include: { images: true } } },
            },
          },
        },
        Discount: true,
      },
    });
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
