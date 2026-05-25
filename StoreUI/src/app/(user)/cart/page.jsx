
"use client";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";
import { fetchUserCart, removeItemFromCart, updateCartItemQuantity } from "@/app/api/cart";
import { useSession } from "next-auth/react";
import "@/styles/cartPage.scss";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import useCartStore from "@/store/cartStore";
import Link from "next/link";
import { convertS3UrlToLocalPath } from "@/utils/util";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const { fetchCart, cartItems, removeFromCart } = useCartStore();

  // const [cartItems, setCartItems] = useState([]);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(1599); // Default discount
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  // const fetchCart = async()=> {
  //   const response = await fetchUserCart(token);
  //   if (response) {
  //     setCartItems(response);
  //   }
  // };

  useEffect(() => {
    if (status === "authenticated" && token) {
      fetchCart(token);
    }
  }, [token]);

  const validCoupons = {
    SAVE100: 100,
    SAVE500: 500,
    SAVE1000: 1000,
  };

  // const handleCheckout = () => {
  //   const amount = Number(totalDisPrice);

  //   if (amount < 1) {
  //     const popup = document.createElement("div");
  //     popup.className = "simple-popup";
  //     popup.innerText = "Order cannot be placed for amount less than 1";

  //     document.body.appendChild(popup);

  //     setTimeout(() => {
  //       popup.remove();
  //     }, 2000);

  //     return;
  //   }
  //   router.push("/checkout");
  // };
const handleCheckout = () => {
  if (cartItems.length === 0) return;

  const amount = Number(totalDisPrice);

  if (amount < 1) {
    const popup = document.createElement("div");
    popup.className = "simple-popup";
    popup.innerText = "Order cannot be placed for amount less than 1";

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 2000);
    return;
  }

  router.push("/checkout");
};

  const applyCoupon = () => {
    if (validCoupons[coupon.toUpperCase()]) {
      setDiscount(discount + validCoupons[coupon.toUpperCase()]);
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid Coupon Code");
    }
  };
  // Decrease quantity
  const handleDecrement = (id) => {
    handleQuantityChange(id, "decrement");
  };

  // Increase quantity
  const handleIncrement = (id) => {
    handleQuantityChange(id, "increment");
  };

  const handleQuantityChange = async (cartItemId, action) => {
    try {
      // Update the cart item quantity (increment or decrement)
      const updatedItem = await updateCartItemQuantity(token, cartItemId, action);
      // Update the local cart items state with the updated item
      // setCartItems(prevItems =>
      //     prevItems.map(item =>
      //         item.id === updatedItem.id ? updatedItem : item
      //     )
      // );
      if (updatedItem) {

        fetchCart(token);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Remove item from cart
  const handleRemove = async (id) => {
    removeFromCart(token, id);
  };

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + ((item.productVariant ? item.productVariant.price : item.product.price) * item.quantity),
    0
  ).toFixed(2);

  const totalDisPrice = cartItems.reduce(
    (total, item) => total + ((item.productVariant ? (item.productVariant?.discountedPrice ? item.productVariant.discountedPrice : item.productVariant.price) : (item.product?.discountedPrice ? item.product.discountedPrice : item.product.price)) * item.quantity),
    0
  ).toFixed(2);

  const disPrice = (totalPrice - totalDisPrice).toFixed(2);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (!cartItems) {
    return <LoadingScreen />
  }

  return (
    <div className="pageContainer">
      <div className="mainContainer">
        {/* Cart Items Section */}
        <div className="cartContainer">
          <h2 className="cartTitle">Shopping Cart</h2>

          {cartItems.length === 0 ? (
            <p className="emptyCartMessage">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => {
              let cart_item = item.product;
              if (item.productVariant) {
                cart_item.name = item.productVariant.variantName;
                cart_item.price = item.productVariant.price;
                cart_item.discountedPrice = item.productVariant.discountedPrice;
                cart_item.quantity = item.productVariant.quantity;
                cart_item.isVariant = true;
                cart_item.variantAttributes = item.productVariant.variantAttributes;
              }
              return (
                <div key={cart_item.id} className="cartItem">
                  <Link href={`/product/${cart_item.slug}`} className="imageContainer">
                    <img
                      src={cart_item?.images.length > 0 ? convertS3UrlToLocalPath(cart_item.images[0].url) : `${process.env.PLACEHOLDER_IMAGE}`}
                      alt={cart_item.name}
                      className="productImage"
                    />
                  </Link>
                  {//console.log('cart_item', cart_item)}
                  <div className="detailsContainer">
                    <Link href={`/product/${cart_item.slug}`} style={{ color: "black" }} className="productName">{cart_item.name}</Link>
                    <p className="productDescription">{cart_item.brandName}</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p className="stockStatus">{cart_item.quantity > 0 ? "In Stock" : "Out of Stock"}</p>
                      <p className="productPrice d-block d-md-none">₹{(cart_item.discountedPrice ?? cart_item.price).toFixed(2)}</p>
                    </div>
                    {cart_item?.variantAttributes && cart_item.variantAttributes.map((item, index) => {
                      // Capitalize the first letter of the 'name'
                      const label = item.name.charAt(0).toUpperCase() + item.name.slice(1);

                      return (
                        <span className="productVarient" key={index} style={{ color: item.value }}>
                          {`${label}: ${item.value}`}
                        </span>
                      );
                    })}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div className="quantityControls">
                        <button className="quantityButton" onClick={() => handleDecrement(item.id)} >
                          <FaMinus />
                        </button>

                        <span className="quantityInput">{item.quantity}</span>

                        <button className="quantityButton" onClick={() => handleIncrement(item.id)} >
                          <FaPlus />
                        </button>
                      </div>
                      <button className="removeButton d-block d-md-none" onClick={() => handleRemove(item.id)}>
                        <FaTrashAlt />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                  <div className="d-none d-md-block">
                    <p className="productPrice">₹{(cart_item.discountedPrice ?? cart_item.price).toFixed(2)}</p>
                    <button className="removeButton" onClick={() => handleRemove(item.id)}>
                      <FaTrashAlt />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Price Details Section */}
        <div>
          <div className="priceDetailsContainer" >
            <h3 className="priceDetailsTitle">Price Details</h3>
            <div className="priceDetailsContent">
              <div className="priceRow">
                <span>Price ({totalItems} items)</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="priceRow">
                <span>Discount</span>
                <span> ₹{disPrice}</span>
              </div>
              {/* <div className="priceRow">
              <span>Coupons for you</span>
              <span>– ₹100</span>
            </div>
            <div className="priceRow">
              <span>Platform Fee</span>
              <span>₹3</span>
            </div>
            <div className="priceRow">
              <span>Delivery Charges</span>
              <span>₹144 ₹64</span>
            </div> */}
              <div className="totalAmountRow">
                <span>Total Amount</span>
                <span>₹{totalDisPrice}</span>
              </div>
            </div>
            <p className="savingsMessage">
              You will save ₹{disPrice} on this order
            </p>
            {/* <a href="/checkout" className="btn btn-cart2 w-100">Proceed to Checkout</a> */}
       <button
  onClick={handleCheckout}
  className="btn btn-cart2 w-100"
  disabled={cartItems.length === 0}
>
  Proceed to Checkout
</button>
          </div>

          {/* <div className="priceDetailsContainer">
          <h3 className="priceDetailsTitle">DISCOUNT DETAILS</h3>
          <div className="priceDetailsContent">
            <div className="priceRow">
              <span>Price ({cartItems.length} items)</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="priceRow">
              <span>Discount</span>
              <span>– ₹{discount}</span>
            </div>
            <div className="priceRow">
              <span>Platform Fee</span>
              <span>₹3</span>
            </div>
            <div className="priceRow">
              <span>Delivery Charges</span>
              <span>₹144 ₹64</span>
            </div>
            <div className="totalAmountRow">
              <span>Total Amount</span>
              <span>₹{totalPrice - discount + 3 + 64}</span>
            </div>
          </div>

          {!couponApplied && (
            <div>
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="couponInput"
              />
              <button onClick={applyCoupon} className="applyButton">Apply</button>
              {couponError && <p className="errorMessage">{couponError}</p>}
            </div>
          )}

          <p className="savingsMessage">
            You will save ₹{discount} on this order
          </p>
        </div> */}
        </div>
      </div>

    </div>
  );
};

export default Page;