"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateUserOrder, userOrder } from "@/app/api/orders";
import Select from "react-select";

const Page = () => {
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
  ];

  const { id } = useParams();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState([]);
  const [discountDetails, setDiscountDetails] = useState({});
  const [products, setProducts] = useState([]);
  const [productVarients, setProductVarients] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState();
  const [subTotal, setSubTotal] = useState(0);
  const [discounted, setDiscounted] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(25);
  const [total, setTotal] = useState(0);
  const [paid, setPaid] = useState(0);

  // Form State
  const [formState, setFormState] = useState({
    vendorRemarks: "",
    addressId: "",
    status: "",
  });

  useEffect(() => {
    if (token) fetchOrder();
  }, [token]);

  const fetchOrder = async () => {
    try {
      const response = await userOrder(token, id);
      setOrder(response);
      setFormState({
        customerRemarks: response.customerRemarks,
        addressId: response.addressId,
        billingStreet: response.billingStreet,
        billingCity: response.billingCity,
        billingState: response.billingState,
        billingCountry: response.billingCountry,
        billingZip: response.billingZip
      });
      setUser(response.user);
      setDiscountDetails(response.Discount[0]);
      
      response.products.forEach((item) => {
        // //console.log('response', item);
        if (item.productId === null) {
          item.productVariant.stock = item.quantity;
          setProductVarients((prev) => [...prev, item.productVariant]);
        } else {
          item.product.stock = item.quantity;
          setProducts((prev) => [...prev, item.product]);
        }
      });

      setCart(response.products);
    } catch (error) { }
  };

  const handleAddressChange = (e, id) => {
    e.preventDefault();
    setFormState((prev) => {
      return { ...prev, addressId: id };
    });
  };

  useEffect(() => {
    const productTotal =
      products.reduce(
        (subTotal, product) => subTotal + product.price * product.stock,
        0
      ) || 0;
    const productVariantTotal =
      productVarients.reduce(
        (subTotal, product) => subTotal + product.price * product.stock,
        0
      ) || 0;
    setSubTotal(productTotal + productVariantTotal);
  }, [products, productVarients, discountDetails]);

  useEffect(() => {
    if (discountDetails?.type && discountDetails.type === "PERCENTAGE") {
      setDiscounted(`${discountDetails.amount}%`);
    } else if (discountDetails?.type && discountDetails.type === "FIXED") {
      setDiscounted(`${discountDetails.amount}`);
    } else {
      setDiscounted(0);
    }
    setShippingCharges(order.ShippingAmount);
  }, [subTotal]);

  // useEffect(() => {
  //   const total = subTotal - discounted + shippingCharges;
  //   setTotal(total);
  // }, [subTotal, discounted]);

  useEffect(() => {
    const paid = order.paid === "COD" ? 0 : total;
    setPaid(paid);
  }, [total]);

  const handleNoteChange = (e) => {
    e.preventDefault();
    setFormState((prev) => {
      return { ...prev, vendorRemarks: e.target.value };
    });
  };

  const handleStatusChange = (selectedOption) => {
    setFormState((prev) => {
      return { ...prev, status: selectedOption.value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await updateUserOrder(formState, id, token);
    if (response) {
      toast.success("Successfully Updated Order");
      router.push("/admin/order");
    }
  };
  
  const handleBillingChange = (e) => {
    const value = e.target.value;
    if (!value) {
        setFormState({
        ...formState,
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingCountry: '',
        billingZip: ''
        });
        return;
    }
    const data = user.Address[value];
    const billingStreet = data.street;
    const billingCity = data.city;
    const billingState = data.stateOrProvince;
    const billingCountry = data.country;
    const billingZip = data.zip;
    setFormState({
    ...formState,
    billingStreet,
    billingCity,
    billingState,
    billingCountry,
    billingZip,
    });
  };

  return (
    <div
      className="container container--max--xl"
    // style={{ position: "relative " }}
    >
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Order Details</h1>
          </div>
          <div className="col-auto d-flex">
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => handleSubmit(e)}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
      <div className="sa-page-meta mb-5">
        <div className="sa-page-meta__body">
          <div className="sa-page-meta__list">
            <div className="sa-page-meta__item">
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <div className="sa-page-meta__item">
              {order?.products?.length} items
            </div>
            <div className="sa-page-meta__item">Total ₹{order.total || 0}</div>
            <div className="sa-page-meta__item d-flex align-items-center fs-6">
              <span className="badge badge-sa-success me-2">
                {order.paid === "COD" ? "Paid" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="sa-entity-layout sa-entity-layout--size--md">
        <div className="sa-entity-layout__body">
          <div className="sa-entity-layout__main">


            <div
              className="mt-5 bg-white p-4"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "start",
                gap: "20px",
                marginBottom: "10px"
              }}
            >
              {(order.vendorRemarks || order.customerRemarks) && (
                <div className="d-flex gap-5 align-items-center justify-content-center">
                  {/* <p>Remarks</p> */}
                  {order?.vendorRemarks && <p>VendorNotes: {order.vendorRemarks}</p>}
                  {order?.customerRemarks && <p>CustomerNotes: {order.customerRemarks}</p>}
                </div>
              )}

            </div>
            <div className="sa-card-area">
              <textarea
                className="sa-card-area__area"
                rows={2}
                placeholder="Notes about order"
                value={formState.customerRemarks}
                onChange={(e) => handleNoteChange(e)}
              />

              <div className="sa-card-area__card">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-edit"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>

            </div>
            <div
              className="mt-5 bg-white p-4"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "start",
                gap: "20px",
              }}
            >
              <h6>Order Status:</h6>
              <Select
                options={statusOptions}
                value={statusOptions.find(
                  (opt) => opt.value === formState.status
                )}
                onChange={handleStatusChange}
                className="w-50"
              />
            </div>

            {/* Items */}
            <div className="card mt-5">
              <div className="card-body px-5 py-4 d-flex align-items-center justify-content-between">
                <h2 className="mb-0 fs-exact-18 me-4">Items</h2>
              </div>
              <div className="table-responsive">
                <table className="sa-table">
                  <tbody>
                    {products.length > 0 &&
                      products.map((item) => (
                        <tr key={item.id}>
                          <td className="min-w-20x">
                            <div className="d-flex align-items-center">
                              <img
                                src={item?.images.length > 0 ? item.images[0].url : `${process.env.PLACEHOLDER_IMAGE}`}
                                className="me-4"
                                width="40"
                                height="40"
                                alt=""
                              />
                              <a href="app-product.html" className="text-reset">
                                {item.name || "Unknown Product"}
                              </a>
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="sa-price">
                              <span className="sa-price__symbol">₹</span>
                              <span className="sa-price__integer">
                                {item.price || 0}
                              </span>
                            </div>
                          </td>
                          <td className="text-end">{item.stock}</td>
                          <td className="text-end">
                            <div className="sa-price">
                              <span className="sa-price__symbol">₹</span>
                              <span className="sa-price__integer">
                                {(item.price || 0) * item.stock}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {productVarients.length > 0 &&
                      productVarients.map((item) => (
                        <tr key={item.id}>
                          <td className="min-w-20x">
                            <div className="d-flex align-items-center">
                              <img
                                src={item?.product?.images.length > 0 ? item.product.images[0].url : `${process.env.PLACEHOLDER_IMAGE}`}
                                className="me-4"
                                width="40"
                                height="40"
                                alt=""
                              />
                              <a href="app-product.html" className="text-reset">
                                {item.variantName || "Unknown Product"}
                              </a>
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="sa-price">
                              <span className="sa-price__symbol">₹</span>
                              <span className="sa-price__integer">
                                {item.price || 0}
                              </span>
                            </div>
                          </td>
                          <td className="text-end">{item.stock}</td>
                          <td className="text-end">
                            <div className="sa-price">
                              <span className="sa-price__symbol">₹</span>
                              <span className="sa-price__integer">
                                {(item.price || 0) * item.stock}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tbody className="sa-table__group">
                    <tr>
                      <td colSpan="3">Subtotal</td>
                      <td className="text-end">
                        <div className="sa-price">
                          <span className="sa-price__symbol">₹</span>
                          <span className="sa-price__integer">{subTotal.toFixed(2)}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3">
                        Discount Coupon Applied{" "}
                        <span className="text-muted">
                          ({discountDetails?.code})
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="sa-price">
                          <span className="sa-price__integer">
                            {discounted}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3">
                        Shipping
                        <div className="text-muted fs-exact-13">
                          via FedEx International
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="sa-price">
                          <span className="sa-price__symbol">₹</span>
                          <span className="sa-price__integer">
                            {shippingCharges}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tbody>
                    <tr>
                      <td colSpan="3">Total</td>
                      <td className="text-end">
                        <div className="sa-price">
                          <span className="sa-price__symbol">₹</span>
                          <span className="sa-price__integer">{order.actualAmount}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Balance */}
            {/* <div className="card mt-5">
              <div className="card-body px-5 py-4 d-flex align-items-center justify-content-between">
                <h2 className="mb-0 fs-exact-18 me-4">Balance</h2>
              </div>
              <table className="sa-table">
                <tbody className="sa-table__group">
                  <tr>
                    <td>Order Total</td>
                    <td className="text-end">
                      <div className="sa-price">
                        <span className="sa-price__symbol">₹</span>
                        <span className="sa-price__integer">{total}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Pa</td>
                    <td className="text-end">
                      <div className="sa-price">
                        <span className="sa-price__symbol">₹</span>
                        <span className="sa-price__integer">0</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody className="sa-table__group">
                  <tr>
                    <td>Paid by customer</td>
                    <td className="text-end">
                      <div className="sa-price">
                        <span className="sa-price__symbol">₹</span>
                        <span className="sa-price__integer">{paid}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Refunded</td>
                    <td className="text-end">
                      <div className="sa-price">
                        <span className="sa-price__symbol">₹</span>
                        <span className="sa-price__integer">0</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody>
                  <tr>
                    <td>
                      Balance{" "}
                      <span className="text-muted">(customer owes you)</span>
                    </td>
                    <td className="text-end">
                      <div className="sa-price">
                        <span className="sa-price__symbol">₹</span>
                        <span className="sa-price__integer">
                          {total - paid}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div> */}
          </div>

          {/* User */}
          {user !== undefined && (
            <div className="sa-entity-layout__sidebar">
              <div className="card">
                <div className="card-body d-flex align-items-center justify-content-between pb-0 pt-4">
                  <h2 className="fs-exact-16 mb-0">Customer</h2>
                </div>
                <div className="card-body pt-4 fs-exact-14">
                  <div className="card-body d-flex align-items-center pt-4 px-0">
                    <div className="sa-symbol sa-symbol--shape--circle sa-symbol--size--lg">
                      <img
                        src="https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid"
                        width="40"
                        height="40"
                        alt=""
                      />
                    </div>
                    <div className="ms-3 ps-2">
                      <div className="fs-exact-14 fw-medium">{user.name}</div>
                    </div>
                  </div>
                  <div>{user.name}</div>
                  <div className="mt-1">
                    <a href="#">{user.email}</a>
                  </div>
                  <div className="text-muted mt-1">{user.phone}</div>
                </div>
              </div>
              <div className="card mt-5">
                <div className="card-body d-flex align-items-center justify-content-between pb-0 pt-4">
                  <h2 className="fs-exact-16 mb-0">User Address </h2>
                </div>
                  <div className="card-body pt-4 fs-exact-14">
                    <div className="single-input-item">
                        <label htmlFor="shipping" className="form-label">Select Address</label>
                        <select className="address-form-select" onChange={handleBillingChange}>
                            <option id="shipping" value="">Enter Address Manualy</option>
                            {user.Address.map((item,i)=>(
                                <option key={`address-${i}`} value={i}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="address-form">
                        {[
                          { label: "Street", name: "billingStreet" },
                          { label: "City", name: "billingCity" },
                          { label: "State/Province", name: "billingState" },
                          { label: "ZIP Code", name: "billingZip" },
                          { label: "Country", name: "billingCountry" },
                        ].map(({ label, name }) => (
                            <div key={name} className="address-form-field">
                              <input
                              className="form-control mt-4"
                                type="text"
                                id={name}
                                name={name}
                                value={formState[name]}
                                onChange={(e)=>handleChange(name, e.target.value)}
                                placeholder={label}
                                required
                              />
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
