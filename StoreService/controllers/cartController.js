const prisma = require('../prismaClient'); // Import prisma client (adjust path as needed)

const getAllCartProducts = async (req, res) => {
    const userId = req.user.id; // Assuming userId is available in req.user from authentication

    try {
        // Get the user's cart
        const cart = await prisma.cart.findUnique({
            where: {
                userId: userId,
            },
            select: {
                id: true, // Select the cart id
                products: {
                    select: {
                        id: true, // Select product item id
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                brandName: true,
                                discountedPrice: true,
                                quantity: true,
                                images: {
                                  select: {
                                    url: true,
                                  },
                                },
                            }
                        },
                        productVariant: {
                            select: {
                                id: true,
                                variantName: true,
                                price: true,
                                quantity: true,
                                discountedPrice: true,
                                variantAttributes: {
                                  select: {
                                    name: true,
                                    value: true,
                                  },
                                },
                            }
                        },
                        quantity: true
                    },
                    orderBy: {
                        id: "asc",
                    },
                },
            },
        });        

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        return res.status(200).json(cart.products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteAllCartProducts = async (req, res) => {
    const userId = req.user.id; // Assuming userId is available in req.user from authentication

    try {
        // Delete all products from the user's cart
        const deletedCart = await prisma.cart.update({
            where: {
                userId: userId
            },
            data: {
                products: {
                    deleteMany: {} // This deletes all products in the cart
                }
            }
        });

        return res.status(200).json({ message: 'All cart products deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllCartProductsCount = async (req, res) => {
    const userId = req.user.id; // Assuming userId is available in req.user from authentication

    try {
        // Get the user's cart
        const cart = await prisma.cart.findUnique({
            where: {
                userId: userId
            },
            include: {
                products: true // Only include cart items (no details about the products)
            }
        });

        if (!cart) {
            // return res.status(404).json({ error: 'Cart not found' });
            return res.status(200).json({ count: 0 });
        }

        // Return the count of products in the cart
        return res.status(200).json({ count: cart.products.length });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getCartProduct = async (req, res) => {
    const { id } = req.params; // Product ID passed in URL params
    const userId = req.user.id; // Assuming userId is available in req.user from authentication

    try {
        // Get the product in the cart by its ID for the logged-in user
        const cartProduct = await prisma.cartItem.findFirst({
            where: {
                cart: {
                    userId: userId
                },
                id: id
            },
            include: {
                product: true, // Include product details
                productVariant: true // Include product variant details
            }
        });

        if (!cartProduct) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        return res.status(200).json(cartProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteCartProduct = async (req, res) => {
    const { id } = req.params; // Product ID passed in URL params
    const userId = req.user.id; // Assuming userId is available in req.user from authentication

    try {
        // Delete the product from the cart
        const deletedCartProduct = await prisma.cartItem.delete({
            where: {
                id: id
            }
        });

        if (!deletedCartProduct) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        return res.status(200).json({ message: 'Product deleted from cart successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const addToCart = async (req, res) => {
    const { productId, productVariantId, quantity } = req.body;
    const userId = req.user.id; // Assuming the userId is in req.user after authentication

    try {
        // Check if the user has a cart
        let cart = await prisma.cart.findFirst({
            where: {
                userId: userId
            }
        });

        // If no cart exists, create a new one
        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: userId,
                },
            });
        }

        // Check if the product is already in the cart
        const existingCartItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: productId,
                productVariantId: productVariantId,
            },
        });

        // If the product or variant is already in the cart, update the quantity
        if (existingCartItem) {
            // Update the quantity of the product or variant
            const updatedCartItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: {
                    quantity: existingCartItem.quantity + quantity, // Add the new quantity to the existing one
                },
            });

            // Optionally, update the cart's total amount if you need
            // await updateCartTotal(cart.id);

            return res.status(200).json({ message: 'Product quantity updated', cart: updatedCartItem });
        }

        const data= {
            cart: { connect: { id: cart.id } }, // Connect the existing cart
            product: { connect: { id: productId } },
            quantity: quantity,
        };
        if (productVariantId) {
            data.productVariant = { connect: { id: productVariantId } };
        }
        // If the product or variant is not in the cart, create a new cart item
        const newCartItem = await prisma.cartItem.create({
            data,
        });

        // Optionally, update the cart's total amount
        // await updateCartTotal(cart.id);

        return res.status(200).json({ message: 'Product added to cart', cartItem: newCartItem });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Helper function to update the cart's total price and other amounts
const updateCartTotal = async (cartId) => {
    // Get all cart items for the cart
    const cartItems = await prisma.cartItem.findMany({
        where: {
            cartId: cartId
        },
        include: {
            product: true,
            productVariant: true
        }
    });

    let total = 0;
    let actualAmount = 0;

    // Calculate the total and actual amounts
    cartItems.forEach(item => {
        const price = item.productVariant ? item.productVariant.price : item.product.price;
        const discountedPrice = item.productVariant ? item.productVariant.discountedPrice : item.product.discountedPrice;
        const itemPrice = discountedPrice || price; // Use discountedPrice if available
        total += itemPrice * item.quantity;
        actualAmount += itemPrice * item.quantity; // You could apply more calculations here if needed (e.g., discounts, taxes)
    });

    // Update the cart with the new total
    await prisma.cart.update({
        where: { id: cartId },
        data: {
            total: total,
            actualAmount: actualAmount,
        },
    });
};

const updateCartItemQuantity = async (req, res) => {
    const { id, action } = req.body; // Get the cart item ID and the action (increment or decrement)
    const userId = req.user.id; // Assuming userId is available in req.user after authentication

    try {
        // Fetch the cart item
        const cartItem = await prisma.cartItem.findUnique({
            where: {
                id: id,
            },
            include: {
                cart: true, // Include the cart to verify it's the correct user
            }
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        // Ensure the cart belongs to the correct user
        if (cartItem.cart.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to modify this cart item' });
        }

        // Determine new quantity based on action
        let newQuantity;
        if (action === 'increment') {
            newQuantity = cartItem.quantity + 1;
        } else if (action === 'decrement') {
            newQuantity = cartItem.quantity - 1;

            // Prevent going below 1 item
            if (newQuantity < 1) {
                return res.status(400).json({ error: 'Quantity cannot be less than 1' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid action. Use "increment" or "decrement"' });
        }

        // Update the cart item with the new quantity
        const updatedCartItem = await prisma.cartItem.update({
            where: {
                id: id,
            },
            data: {
                quantity: newQuantity,
            },
        });

        return res.status(200).json({
            message: `Quantity ${action}ed successfully`,
            cartItem: updatedCartItem,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    updateCartItemQuantity,
    addToCart,
    getAllCartProducts,
    deleteAllCartProducts,
    getAllCartProductsCount,
    getCartProduct,
    deleteCartProduct
};
