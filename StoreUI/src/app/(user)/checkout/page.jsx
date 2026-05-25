"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getUserById } from "@/app/api/users";
import { clearUserCart, fetchUserCart } from "@/app/api/cart";
import "@/styles/checkout.scss";
import "@/styles/cartPage.scss";
import { applyCoupon } from "@/app/api/discount";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { addOrder } from "@/app/api/orders";
import { fetchUserAddress, getAddressType } from "@/app/api/address";

export default function Checkout() {
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const router = useRouter();
  const [showShipping, setShowShipping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [couponDetail, setCouponDetail] = useState({
    data: {
      discount: 0,
    },
    error: null,
  });
  const [deliveryCharges, setDeliveryCharges] = useState(200);
  // const {shipping, setShipping} = useState([]);
  // const {billing, setBilling} = useState([]);
  const [address, setAddress] = useState([]);
  const [formData, setFormData] = useState({
    userName: "",
    mobileNumber: "",
    customerRemarks: "",
    categories: [],
    products: [],
    discountIds: [],
    paid: "COD",
    cancellationExpiry: "",
    status: "PENDING",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "",
  });

  const fetchAddress = async () => {
    const response = await getAddressType(token);
    if (response) {
      setAddress(response);
    }
  };

  const fetchUser = async () => {
    const responce = await getUserById(token);
    if (responce) {
      setUser(responce);
      setFormData((prev) => ({
        ...prev,
        mobileNumber: responce.phone,
        userName: responce.name,
      }));
    }
  };

  const fetchCart = async () => {
    const response = await fetchUserCart(token);
    if (response) {
      setCartItems(response);
    }
    setIsLoaded(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    if (status === "authenticated" && token) {
      if (cartItems.length < 1 && !isLoaded) {
        fetchUser();
        fetchCart();
        fetchAddress();
      }
      if (cartItems.length < 1 && isLoaded) {
        router.push("/");
      }
    }
  }, [token]);

  const totalProductPrice = cartItems.reduce(
    (total, item) =>
      total +
      (item.productVariant ? item.productVariant.price : item.product.price) *
        item.quantity,
    0
  );

  const totalPrice = (deliveryCharges + totalProductPrice).toFixed(2);

  const totalDisPrice = cartItems
    .reduce(
      (total, item) =>
        total +
        (item.productVariant
          ? item.productVariant?.discountedPrice
            ? item.productVariant.discountedPrice
            : item.productVariant.price
          : item.product?.discountedPrice
          ? item.product.discountedPrice
          : item.product.price) *
          item.quantity,
      0
    )
    .toFixed(2);

  const disPrice = (totalPrice - totalDisPrice).toFixed(2);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Handle Apply Discount
  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    const response = await applyCoupon(totalDisPrice, coupon, token);
    if (response?.message) toast.success(response?.message);
    if (response?.discount) {
      let discount = 0;
      //console.log("response.type", response);

      if (response.discount.type === "PERCENTAGE") {
        const amount = response.discount.amount;
        discount = (totalDisPrice * amount) / 100;
      }
      setCouponDetail({ data: { ...response.discount, discount } });
    }
  };

  const handleBillingChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setFormData({
        ...formData,
        billingStreet: "",
        billingCity: "",
        billingState: "",
        billingCountry: "",
        billingZip: "",
      });
      return;
    }
    const data = address[value];
    const shippingStreet = data.street;
    const shippingCity = data.city;
    const shippingState = data.stateOrProvince;
    const shippingCountry = data.country;
    const shippingZip = data.zip;
    setFormData({
      ...formData,
      billingStreet: shippingStreet,
      billingCity: shippingCity,
      billingState: shippingState,
      billingCountry: shippingCountry,
      billingZip: shippingZip,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    formData.cancellationExpiry = new Date(
      new Date().setDate(new Date().getDate() + 2)
    ).toISOString();
    if (couponDetail.data?.id) {
      formData.discountIds = [couponDetail.data.id];
    }
    let finalProducts = [];
    cartItems.map((item) => {
      let newObject = {};
      newObject.productId = item.product.id;
      newObject.quantity = item.quantity;
      newObject.price = item.product.price;
      if (item.productVariant) {
        newObject.productVariant = item.productVariant.id;
      }
      finalProducts.push(newObject);
    });
    formData.products = finalProducts;

    const response = await addOrder(token, formData);
    if (response?.order?.id) {
      const data = await clearUserCart(token);
      toast.success("Added Order Successfully");
      router.push("/");
    }
  };

  return (
    <div className="checkout-page-wrapper section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-7">
            <div className="checkout-billing-details-wrap">
              <h5 className="checkout-title">Billing Details</h5>
              <div className="billing-form-wrap">
                <form action="#">
                  <div className="row">
                    <div className="col-12 col-md-6">
                      <div className="single-input-item">
                        <label htmlFor="name" className="required">
                          Name
                        </label>
                        <input
                          onChange={(e) => handleChange(e)}
                          type="text"
                          id="userName"
                          name="userName"
                          value={formData.userName}
                          placeholder="Name"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="single-input-item">
                        <label htmlFor="phonenumber">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <input
                          onChange={(e) => handleChange(e)}
                          type="text"
                          id="mobileNumber"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          placeholder="Phone Number"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="single-input-item">
                    <label htmlFor="email" className="required">
                      Email Address
                    </label>
                    <input
                      onChange={(e) => handleChange(e)}
                      type="email"
                      id="email"
                      value={user.email}
                      placeholder="Email Address"
                      required
                      readOnly
                    />
                  </div>
                  <div className="single-input-item">
                    <label htmlFor="shipping">
                      Select Address <span className="text-danger">*</span>
                    </label>
                    <select
                      className="address-select"
                      onChange={handleBillingChange}
                    >
                      <option id="shipping" value="">
                        Enter Address Manualy
                      </option>
                      {address.map((item, i) => (
                        <option key={`address-${i}`} value={i}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="single-input-item">
                      {/* <label htmlFor="billingStreet" className="required mt-20">Street address</label> */}
                      <input
                        onChange={(e) => handleChange(e)}
                        type="text"
                        id="billingStreet"
                        name="billingStreet"
                        value={formData.billingStreet}
                        placeholder="Street address Line 1"
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="single-input-item">
                          {/* <label htmlFor="billingCity" className="required">Town / City</label> */}
                          <input
                            onChange={(e) => handleChange(e)}
                            type="text"
                            id="billingCity"
                            name="billingCity"
                            value={formData.billingCity}
                            placeholder="Town / City"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="single-input-item">
                          {/* <label htmlFor="billingState">State / Divition</label> */}
                          <input
                            onChange={(e) => handleChange(e)}
                            type="text"
                            id="billingState"
                            name="billingState"
                            value={formData.billingState}
                            placeholder="State / Divition"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="single-input-item">
                          {/* <label htmlFor="billingZip" className="required">Postcode / ZIP</label> */}
                          <input
                            onChange={(e) => handleChange(e)}
                            type="text"
                            id="billingZip"
                            name="billingZip"
                            value={formData.billingZip}
                            placeholder="Postcode / ZIP"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="single-input-item">
                          {/* <label htmlFor="billingCountry" className="required">Country</label> */}
                          <input
                            onChange={(e) => handleChange(e)}
                            type="text"
                            id="billingCountry"
                            name="billingCountry"
                            value={formData.billingCountry}
                            placeholder="Country"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="single-input-item">
                    <label htmlFor="customerRemarks">Order Note</label>
                    <textarea
                      onChange={(e) => handleChange(e)}
                      name="customerRemarks"
                      value={formData.customerRemarks}
                      id="customerRemarks"
                      cols="30"
                      rows="3"
                      placeholder="Notes about your order, e.g. special notes for delivery."
                    ></textarea>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="order-summary-details">
              <h5 className="checkout-title">Your Order Summary</h5>
              <div className="order-summary-content">
                <div className="priceDetailsContent">
                  <div className="priceRow">
                    <span>Price ({totalItems} items)</span>
                    <span>₹{totalProductPrice.toFixed(2)}</span>
                  </div>
                  <div className="priceRow">
                    <span>Discount</span>
                    <span>- ₹{disPrice}</span>
                  </div>
                  {couponDetail.data?.discount ? (
                    <div className="priceRow">
                      <span>Coupons for you</span>
                      <span>- ₹{couponDetail.data.discount.toFixed(2)}</span>
                    </div>
                  ) : (
                    <></>
                  )}
                  {/* <div className="priceRow">
                                    <span>Platform Fee</span>
                                    <span>₹3</span>
                                    </div> */}
                  <div className="priceRow">
                    <span>Delivery Charges</span>
                    <span>₹{deliveryCharges}</span>
                  </div>
                  <div className="totalAmountRow">
                    <span>Total Amount</span>
                    <span>
                      ₹{(totalDisPrice - couponDetail.data.discount).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="apply-coupon-wrapper">
                  <input
                    type="text"
                    name="discount"
                    placeholder="Enter Coupon Code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="couponInput"
                  />
                  <button onClick={handleApplyDiscount} className="btn btn-sqr">
                    Apply
                  </button>
                  {couponDetail.error && (
                    <p className="errorMessage">{couponDetail.error}</p>
                  )}
                </div>
                <p className="savingsMessage">
                  You will save ₹
                  {(
                    parseFloat(disPrice) + couponDetail.data?.discount ?? 0
                  ).toFixed(2)}{" "}
                  on this order
                </p>
                <div className="order-payment-method">
                  <div className="single-payment-method show">
                    <div className="payment-method-name">
                      <div className="custom-control custom-radio">
                        <input
                          type="radio"
                          id="cashon"
                          name="paymentmethod"
                          value="cash"
                          className="custom-control-input"
                          checked
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="cashon"
                        >
                          Cash On Delivery
                        </label>
                      </div>
                    </div>
                    <div className="payment-method-details" data-method="cash">
                      <p>Pay with cash upon delivery.</p>
                    </div>
                  </div>
                  {/* <div className="single-payment-method">
                                        <div className="payment-method-name">
                                            <div className="custom-control custom-radio">
                                                <input type="radio" id="directbank" name="paymentmethod" value="bank" className="custom-control-input" />
                                                <label className="custom-control-label" htmlFor="directbank">Direct Bank
                                                    Transfer</label>
                                            </div>
                                        </div>
                                        <div className="payment-method-details" data-method="bank">
                                            <p>Make your payment directly into our bank account. Please use your Order
                                                ID as the payment reference. Your order will not be shipped until the
                                                funds have cleared in our account..</p>
                                        </div>
                                    </div>
                                    <div className="single-payment-method">
                                        <div className="payment-method-name">
                                            <div className="custom-control custom-radio">
                                                <input type="radio" id="checkpayment" name="paymentmethod" value="check" className="custom-control-input" />
                                                <label className="custom-control-label" htmlFor="checkpayment">Pay with
                                                    Check</label>
                                            </div>
                                        </div>
                                        <div className="payment-method-details" data-method="check">
                                            <p>Please send a check to Store Name, Store Street, Store Town, Store State
                                                / County, Store Postcode.</p>
                                        </div>
                                    </div>
                                    <div className="single-payment-method">
                                        <div className="payment-method-name">
                                            <div className="custom-control custom-radio">
                                                <input type="radio" id="paypalpayment" name="paymentmethod" value="paypal" className="custom-control-input" />
                                                <label className="custom-control-label" htmlFor="paypalpayment">Paypal <img src="assets/images/icon/paypal-card.jpg" className="img-fluid paypal-card" alt="Paypal" /></label>
                                            </div>
                                        </div>
                                        <div className="payment-method-details" data-method="paypal">
                                            <p>Pay via PayPal; you can pay with your credit card if you don’t have a
                                                PayPal account.</p>
                                        </div>
                                    </div> */}
                  <div className="summary-footer-area">
                    <div className="custom-control custom-checkbox mb-20">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="terms"
                        required
                      />
                      <label className="custom-control-label" htmlFor="terms">
                        I have read and agree to the website{" "}
                        <a href="index.html">terms and conditions.</a>
                      </label>
                    </div>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="btn btn-cart2 w-100"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
