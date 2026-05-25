const prisma = require("../prismaClient");

// ✅ Get all wishlist items for a user
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const wishlist = await prisma.wishlist.findMany({
            where: { userId },
            select: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        discountedPrice: true,
                        quantity: true,
                        tags: true,
                        brandName: true,
                        images: {
                        select: {
                            url: true,
                            type: true,
                            description: true,
                        },
                        },
                        ProductVariant: {
                        select: {
                            id: true,
                            variantName: true,
                            price: true,
                            discountedPrice: true,
                            quantity: true,
                            variantAttributes: {
                            select: {
                                name: true,
                                value: true,
                            },
                            },
                        },
                        },
                    },
                } 
            },
        });

        res.json(wishlist);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
};

// ✅ Add an item to wishlist
exports.addWishlistItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Get product by id
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: "Product not found" });

        const userWishlistCount = await prisma.wishlist.count({
            where: { userId },
        });

        if (userWishlistCount > 49) {
            return res.status(400).json({ error: "Cannot keep more than 50 items in wishlist" });
        }
        
        // Add to wishlist
        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId,
                productId: product.id,
            },
            select: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        discountedPrice: true,
                        quantity: true,
                        tags: true,
                        brandName: true,
                        images: {
                        select: {
                            url: true,
                            type: true,
                            description: true,
                        },
                        },
                        ProductVariant: {
                        select: {
                            id: true,
                            variantName: true,
                            price: true,
                            discountedPrice: true,
                            quantity: true,
                            variantAttributes: {
                            select: {
                                name: true,
                                value: true,
                            },
                            },
                        },
                        },
                    },
                } 
            },
        });

        res.status(201).json(wishlistItem);
    } catch (error) {
        console.error("Error adding item to wishlist:", error);
        res.status(500).json({ error: "Failed to add item" });
    }
};

// ✅ Remove an item from wishlist
exports.removeWishlistItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: "Product not found" });

        await prisma.wishlist.deleteMany({
            where: { userId, productId: product.id },
        });

        res.json({ message: "Item removed from wishlist" });
    } catch (error) {
        console.error("Error removing item:", error);
        res.status(500).json({ error: "Failed to remove item" });
    }
};

// ✅ Remove all items from wishlist
exports.clearWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.wishlist.deleteMany({ where: { userId } });

        res.json({ message: "Wishlist cleared successfully" });
    } catch (error) {
        console.error("Error clearing wishlist:", error);
        res.status(500).json({ error: "Failed to clear wishlist" });
    }
};
