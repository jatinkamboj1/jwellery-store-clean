"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { userOrder } from "@/app/api/orders";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import { convertS3UrlToLocalPath } from "@/utils/util";

const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(25);
  const [discountedValue, setDiscountedValue] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    try {
      const response = await userOrder(token, id);
      setOrders(response);
      setProducts(response.products);
      setDiscounts(response.Discount[0]);
    } catch (error) {}
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Login to continue");
      router.push("/signin");
    }
    if (token && status === "authenticated") fetchOrders();
  }, [token, status]);

  useEffect(() => {
    const totalPrice = products.reduce((total, item) => {
      return total + item.quantity * item.product.price;
    }, 0);
    setSubTotal(totalPrice);
  }, [products]);
  //console.log('products: ', products);

  useEffect(() => {
    let discount;
    if (discounts?.type === "FIXED") {
      discount = discounts?.amount;
    } else if (discounts?.type === "PERCENTAGE") {
      discount = (subTotal * discounts?.amount) / 100;
    } else {
      discount = 0;
    }
    setDiscountedValue(discount);
  }, [subTotal]);

  useEffect(() => {
    const total = subTotal - discountedValue + shippingCharges;
    setTotal(total);
  }, [subTotal, discountedValue, shippingCharges]);

  if (orders?.length === 0) return <LoadingScreen />;

  return (
    <div className="container bg-white shadow-sm my-4 p-4">
      <div className="text-center py-4">
        <div className="d-flex justify-content-center mb-3">
          <div className="bg-dark rounded-circle p-3">
            <FaShoppingCart className="text-white display-4" />
          </div>
        </div>
        <h2 className="h4 font-weight-bold">Purchase Confirmation</h2>
        <p className="text-secondary">
          Thanks for your purchase. We will send tracking info when your order
          ships.
        </p>
        <p className="text-muted">
          Get special goods and gifts only on our site.
        </p>
        <Link href={"/"} className="btn-dark rounded my-3 py-2 px-3">
          GO TO SITE
        </Link>
      </div>
      <div className="border-top py-3">
        <span>
          Order Number{" "}
          <Link className="text-dark underline-hover" href={"/"}>
            #{`${orders.orderNumber}`}
          </Link>
        </span>
      </div>

      <div className="border-top pt-3">
        {/* Order Items */}
        <div className="order-details">
          <div className="border w-100">
            {products.length > 0 &&
              products.map((item) => (
                <div
                  key={item.id}
                  className="order-items d-flex p-3 align-items-center"
                >
                  <img
                    src={
                      convertS3UrlToLocalPath(item.product.images[0]) || "https://images.weserv.nl/?url=https://developers.google.com/static/maps/documentation/streetview/images/error-image-generic.png&w=100&h=100"
                    }
                    alt={item.name}
                    className="img-thumbnail me-3"
                  />
                  <div className="order-info d-flex justify-content-between w-100">
                    <div className="order-product-name">
                      <h5 className="fw-bold">{item.product.name}</h5>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-end">
                      <p className="fw-bold">${item.product.price}</p>
                      {/* {item.product.discountedPrice && (
                      <p className="text-decoration-line-through text-muted">
                        ${item.product.discountedPrice}
                      </p>
                    )} */}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Summary */}
          <div className="order-summary p-3">
            <h5 className="border-bottom pb-1">Order Summary</h5>
            <div className="d-flex justify-content-between gap-5 mt-2">
              <span>Subtotal</span>
              <span>${subTotal?.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between gap-5">
              <span>Shipping</span>
              <span>${shippingCharges?.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between gap-5">
              <span>Discount</span>
              <span>-${discountedValue.toFixed(2) || 0}</span>
            </div>
            <div className="d-flex justify-content-between gap-5 fw-bold mt-2">
              <span>Total</span>
              <span>${total?.toFixed(2)}</span>
            </div>
            {/* <p className="text-end text-success">You saved $60.00</p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
