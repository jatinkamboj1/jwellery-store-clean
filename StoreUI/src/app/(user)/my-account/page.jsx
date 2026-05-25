"use client";
import React, { useEffect, useState } from "react";
import "@/styles/myAccount.scss";
import "@/styles/sliders.scss";
import "@/styles/cartPage.scss";
import "@/styles/pagination.scss";
import { LogoutUser } from "@/utils/auth";
import { getUserById, updateUser } from "@/app/api/users";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  addAddress,
  deleteAddress,
  fetchUserAddress,
  updateUserAddress,
} from "@/app/api/address";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { userOrders } from "@/app/api/orders";
import { getUserOrders } from "@/app/api/orders";
import { FaEye } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Decoder from "@/utils/decoder";
import { convertS3UrlToLocalPath } from "@/utils/util";

export default function MyAccount() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const [userData, setUserData] = useState({
    email: null,
    id: null,
    phone: null,
    role: null,
  });

  useEffect(() => {
    if (!token && status === "unauthenticated") {
      router.push("/signin");
    }
    if (token) {
      setUserData(Decoder(token));
    }
  }, [token, router]);

  const [panel, setPanel] = useState("info");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  let panelContent;
  switch (panel) {
    case "order":
      panelContent = <Orders />;
      break;
    case "address":
      panelContent = <Address />;
      break;
    default:
      panelContent = <AccountInfo />;
  }

  return (
    <div className="my-account-wrapper section-padding">
      <div className="container">
        <div className="section-bg-color">
          <div className="row">
            <div className="col-lg-12">
              <div className="myaccount-page-wrapper">
                <div className="row">
                  <div
                    className={`col-lg-3 col-md-4 filter-sidebar ${
                      isSidebarOpen ? "open" : ""
                    }`}
                  >
                    <div
                      className="btn-close-filter"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <i className="pe-7s-close"></i>
                    </div>
                    <SideBar setPanel={setPanel} role={userData.role} />
                  </div>
                  <div className="col-lg-9 col-md-8">{panelContent}</div>
                </div>
                <div
                  className={isSidebarOpen ? "off-canvas-overlay" : ""}
                  onClick={() => setIsSidebarOpen(false)}
                ></div>
                <div className="quantity-cart-box d-flex align-items-center fixed-bottom hide-on-large">
                  <div className="action_link w-100 text-center">
                    <button
                      className=" btn-cart2 w-100 rounded-0"
                      onClick={() => setIsSidebarOpen(true)}
                    >
                      Open Navbar
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

const SideBar = ({ setPanel, role }) => {
  const handleLogout = () => {
    LogoutUser();
  };
  return (
    <div className="myaccount-tab-menu nav" role="tablist">
      {role === "ADMIN" && (
        <a
          className="myaccount-tab-menu-link active"
          href="/admin"
          style={{ backgroundColor: "black" }}
        >
          <i className="fa fa-dashboard"></i> Admin Dashboard
        </a>
      )}
      <button
        className="myaccount-tab-menu-link"
        onClick={() => setPanel("info")}
      >
        <i className="fa fa-user"></i> Account Details
      </button>
      <button
        className="myaccount-tab-menu-link"
        onClick={() => setPanel("order")}
      >
        <i className="fa fa-cart-arrow-down"></i> Orders
      </button>
      <button
        className="myaccount-tab-menu-link"
        onClick={() => setPanel("address")}
      >
        <i className="fa fa-map-marker"></i> address
      </button>
      <a className="myaccount-tab-menu-link" href="/wishlist">
        <i className="fa fa-heart"></i> Wishlist
      </a>
      {/* <button
        className="myaccount-tab-menu-link"
        onClick={() => handleLogout()}
      >
        <i className="fa fa-sign-out"></i> Logout
      </button> */}
    </div>
  );
};

const Orders = () => {
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [orders, setOrders] = useState([]);
  const [pageDetails, setPageDetails] = useState({
    total: 1,
    currentPage: 0,
    limit: 10,
    totalPages: 1,
  });

  const [isPopupOpen, setIsPopupOpen] = useState(true); // State for popup visibility
  const [selectedOrder, setSelectedOrder] = useState(null); // State to store the selected order
  const [isOpen, setIsOpen] = useState(false);

  const fetchUserOrders = async (token, currentPage) => {
    const response = await userOrders(token, currentPage, pageDetails.limit);
    if (response) {
      setOrders(response.orders);
      setPageDetails(response.pageDetails);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= pageDetails.totalPages) return;

    setPageDetails((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const openPopup = () => setIsPopupOpen(true); // Open the popup
  const closePopup = () => {
    setIsPopupOpen(false); // Close the popup
    setSelectedOrder(null); // Clear the selected order
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      // Call your API to cancel the order
      // Example: await cancelOrder(selectedOrder.id, token);
      alert(`Order ${selectedOrder.id} has been canceled.`);
      closePopup(); // Close the popup after cancellation
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };
  const [order, setOrder] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const userOrders = await getUserOrders(token);
      setOrder(userOrders);
    };

    fetchOrders();
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUserOrders(token, pageDetails.currentPage);
    }
  }, [pageDetails.currentPage, token, status]);

  const togglePopup = (order) => {
    //console.log("ordersss", order);
    setSelectedOrder(order);
    setIsOpen(!isOpen);
  };

  return (
    <div className="myaccount-content">
      <div className="d-flex  justify-content-between align-item-center">
        <h3 className="mx-1">My Orders</h3>
      </div>
      <div className="myaccount-table table-responsive text-center">
        <div className="table-responsive">
          <table className="sa-table text-nowrap w-100">
            <thead>
              <tr
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 16%)",
                  alignItems: "center",
                }}
              >
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 16%)",
                    alignItems: "center",
                  }}
                >
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td>{order.status}</td>
                  <td>{order.paid ? "Paid" : "Unpaid"}</td>
                  <td>{order.products.length || 1} items</td>
                  <td>₹{order.actualAmount}</td>
                  <td>
                    <button
                      className=" "
                      onClick={() => togglePopup(order)}
                      title="Order Details"
                    >
                      <FaEye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sa-divider" />
        <div className="paginatoin-area text-center">
          <ul className="pagination-box">
            {/* Previous Button */}
            <li
              onClick={() => handlePageChange(pageDetails.currentPage - 1)}
              className={pageDetails.currentPage < 1 ? "disabled" : ""}
            >
              <button className="previous">
                <i className="pe-7s-angle-left"></i>
              </button>
            </li>

            {/* Page Numbers */}
            {(() => {
              let pages = [];
              const totalPages = Math.ceil(
                pageDetails.total / pageDetails.limit
              );
              const currentPage = pageDetails.currentPage;

              if (totalPages <= 10) {
                pages = Array.from({ length: totalPages }, (_, i) => i + 1);
              } else {
                let startPage = Math.max(0, currentPage - 4);
                let endPage = Math.min(totalPages, currentPage + 5);

                if (startPage > 4) pages.push(0, "...");
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }
                if (endPage < totalPages) pages.push("...", totalPages);
              }
              return pages.map((page, index) => (
                <li
                  key={index}
                  className={`${currentPage + 1 === page ? "active" : ""} ${
                    page === "..." ? "disabled" : ""
                  }`}
                >
                  {page === "..." ? (
                    <span>...</span>
                  ) : (
                    <button onClick={() => handlePageChange(page - 1)}>
                      {page}
                    </button>
                  )}
                </li>
              ));
            })()}

            {/* Next Button */}
            <li
              onClick={() => handlePageChange(pageDetails.currentPage + 1)}
              className={
                pageDetails.currentPage + 1 >= pageDetails.total
                  ? "disabled"
                  : ""
              }
            >
              <button className="next">
                <i className="pe-7s-angle-right"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Popup for Order Details */}
      {isOpen && selectedOrder && (
        <>
          <div className="modal-overlay">
            <div className="modal-back" onClick={togglePopup}></div>
            <div className="modal-content" style={{ overflow: "auto" }}>
              <div className="card mt-2">
                <div className="modal-head">
                  <h4 className="">
                    Order (
                    {new Date(selectedOrder.createdAt)
                      .toLocaleDateString("en-GB")
                      .split("/")
                      .join("-")}
                    )
                  </h4>
                  <button className="modal-close-button" onClick={togglePopup}>
                    <i className="pe-7s-close"></i>
                  </button>
                </div>
                <div className="row p-2 mx-0">
                  <div className="table-responsive col-12 col-md-8 p-0">
                    <div className="priceDetailsContainer">
                      {selectedOrder.products.map((item) => {
                        let cart_item = item.product;
                        if (item.productVariant) {
                          cart_item.name = item.productVariant.variantName;
                          cart_item.isVariant = true;
                          cart_item.variantAttributes =
                            item.productVariant.variantAttributes;
                        }
                        return (
                          <Link
                            href={`/product/${cart_item.slug}`}
                            key={cart_item.id}
                            className="orderItem"
                          >
                            <img
                              src={
                                cart_item?.images.length > 0
                                  ? convertS3UrlToLocalPath(cart_item.images[0].url)
                                  : `${process.env.PLACEHOLDER_IMAGE}`
                              }
                              alt={cart_item.name}
                              className="orderItem-image"
                            />
                            <div className="orderItem-content">
                              <h4 className="orderItem-name">
                                {cart_item.name}
                              </h4>
                              <div className="orderItem-price">
                                <span>{item.quantity}</span>
                                <span>x</span>
                                <span>₹{item.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="priceDetailsContainer">
                      <h3 className="priceDetailsTitle">Price Details</h3>
                      <div className="priceDetailsContent">
                        <div className="priceRow">
                          <span>
                            Price (
                            {selectedOrder.products
                              .reduce(
                                (total, sub) => total + 1 * sub.quantity,
                                0
                              )
                              .toFixed(2)}{" "}
                            items)
                          </span>
                          <span>₹{selectedOrder.total}</span>
                        </div>
                        {selectedOrder?.Discount.length > 0 && (
                          <div className="priceRow">
                            <span>Discount</span>
                            <span> ₹{selectedOrder?.Discount[0].amount}</span>
                          </div>
                        )}
                        <div className="priceRow">
                          <span>Delivery Charges</span>
                          <span>₹{selectedOrder.ShippingAmount}</span>
                        </div>
                        <div className="totalAmountRow">
                          <span>Total Amount</span>
                          <span>₹{selectedOrder.actualAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 col-12 col-md-4 p-0">
                    <div className="p-2 priceDetailsContainer">
                      <h4 className="mb-3 fs-exact-18"> Address</h4>
                      <div className="row">
                        <address className="col-12 col-sm-6 col-md-12 mb-2">
                          <p>
                            {selectedOrder.billingStreet},{" "}
                            {selectedOrder.billingCity},{" "}
                            {selectedOrder.billingState} (
                            {selectedOrder.billingZip}),{" "}
                            {selectedOrder.billingCountry}
                          </p>
                        </address>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style>{`body { overflow: hidden; }`}</style>
        </>
      )}
    </div>
  );
};

const Address = () => {
  const { data: session, status } = useSession();
  const [address, setAddress] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [reason, setReason] = useState("add");

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    stateOrProvince: "",
    country: "",
    zip: "",
  });

  const token = session?.user?.token;
  const fetchUserAddres = async (token) => {
    const response = await fetchUserAddress(token);
    setAddress(response);
  };

  const handleShowPopup = (e, action, data) => {
    e.preventDefault();
    setFormData(data);
    setReason("edit");
    setShowPopup(true);
  };

  const closeModal = async (e) => {
    e.preventDefault();
    setShowPopup(false);
    // setReason("add");
    setFormData({
      street: "",
      city: "",
      stateOrProvince: "",
      country: "",
      zip: "",
    });
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addAddress(formData, token);
      if (response) {
        toast.success("Address Added Successfully");
        fetchUserAddres(token);
        setShowPopup(false);
        setReason("add");
        setFormData({
          street: "",
          city: "",
          stateOrProvince: "",
          country: "",
          zip: "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message ?? "Error submitting address!");
    }
  };

  const updateAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserAddress(formData, token, formData.id);
      toast.success("Address Updated Successfully");
      fetchUserAddres(token);

      setShowPopup(false);
      setReason("add");
      setFormData({
        street: "",
        city: "",
        stateOrProvince: "",
        country: "",
        zip: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting address!");
    }
  };

  const onDelete = async (e, id) => {
    e.preventDefault();
    try {
      const response = await deleteAddress(id, token);
      toast.success("Address Deleted Successfully");
      fetchUserAddres(token);
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  useEffect(() => {
    fetchUserAddres(token);
  }, [token]);

  return (
    <div className="myaccount-content">
      {showPopup && (
        <div className="address-popup">
          <div className="address-popup-wrap">
            <div className="d-flex flex-column gap-1 mb-2">
              <div className="d-flex justify-content-between items-center">
                <h4 className="inline text-lg font-semibold">Address Info</h4>
                <button type="button" onClick={(e) => closeModal(e)}>
                  <IoMdClose size={24} />
                </button>
              </div>
              <span className="text-danger small">
                * All fields are required
              </span>
            </div>
            <hr />

            {/* Form Body */}
            <form
              className="mt-0"
              onSubmit={reason === "edit" ? updateAddress : handleSubmit}
            >
              <div className="address-form">
                {[
                  {
                    label: "Name",
                    name: "name",
                    placeholder: "Name (For Quick Ref)",
                  },
                  {
                    label: "Street",
                    name: "street",
                    placeholder: "Street Address",
                  },
                  { label: "City", name: "city", placeholder: "City" },
                  {
                    label: "State/Province",
                    name: "stateOrProvince",
                    placeholder: "State/Province",
                  },
                  { label: "Country", name: "country", placeholder: "Country" },
                  { label: "ZIP Code", name: "zip", placeholder: "ZIP Code" },
                ].map(({ label, name, placeholder }) => (
                  <div key={name} className="address-form-field">
                    <input
                      type="text"
                      id={name}
                      name={name}
                      value={formData[name]}
                      onChange={handleAddressChange}
                      placeholder={placeholder}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="myaccount-tab-menu-link active w-100 text-center"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="d-flex card_border justify-content-between align-item-center">
        <h4>Address</h4>
        {address?.length !== 5 && (
          <button type="button" onClick={(e) => setShowPopup(true)}>
            <FaPlus />
          </button>
        )}
      </div>

      <div className="row">
        {address?.length !== 0 &&
          address?.map((add, index) => (
            <div key={`address-${index}`} className="col-12 col-md-6">
              <div className="my-address">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="m-0">
                    <strong>{add.name}</strong>
                  </h6>
                  <div className="d-flex gap-3">
                    <button
                      onClick={(e) => handleShowPopup(e, "edit", add)}
                      title="Edit Address"
                    >
                      <FaPen size={16} />
                    </button>
                    <button
                      onClick={(e) => onDelete(e, add.id)}
                      title="Delete Address"
                    >
                      <FaTrash size={16} color="red" />
                    </button>
                  </div>
                </div>
                <address>
                  {add.street}, {add.city}, {add.country}
                </address>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const AccountInfo = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    phone: "",
  });
  const token = session?.user?.token;
  const fetchUserByid = async (token) => {
    const response = await getUserById(token);
    setUser((prev) => ({
      ...prev,
      name: response?.name || "",
      email: response?.email || "",
      phone: response?.phone || "",
    }));
  };
  useEffect(() => {
    if (token) fetchUserByid(token);
  }, [token]);

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.password === user.newPassword) {
      toast.error("Current password and new password should not be same");
    }
    if (user.newPassword !== user.confirmPassword) {
      toast.error("New password and confirm password should be same");
    }

    try {
      const response = await updateUser(token, user);
      setUser((prev) => ({
        ...prev,
        name: response?.name,
        email: response?.email,
        phone: response?.phone,
      }));

      toast.success("User updated successfully");
    } catch (error) {}
  };

  return (
    <div className="myaccount-content">
      <h5>Account Details</h5>
      <div className="account-details-form">
        <form
          action="#"
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          {/* <div className="row">
            <div className="col-lg-6">
              <div className="single-input-item">
                <label for="first-name" className="required">
                  First Name
                </label>
                <input type="text" id="first-name" placeholder="First Name" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="single-input-item">
                <label for="last-name" className="required">
                  Last Name
                </label>
                <input type="text" id="last-name" placeholder="Last Name" />
              </div>
            </div>
          </div> */}
          <div className="single-input-item">
            <label for="user-name" className="required">
              user Name
            </label>
            <input
              type="text"
              id="user-name"
              placeholder="user Name"
              name="name"
              required
              value={user?.name}
              onChange={(e) => {
                handleChange(e);
              }}
            />
          </div>
          <div className="single-input-item">
            <label for="email" className="required">
              Email Addres
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              name="email"
              required
              value={user?.email}
              readOnly
            />
          </div>
          <div className="single-input-item">
            <label for="email" className="required">
              Phone number
            </label>
            <input
              type="tel"
              id="number"
              placeholder="Enter Your Number"
              name="phone"
              required
              value={user?.phone}
              onChange={(e) => {
                handleChange(e);
              }}
            />
          </div>
          <fieldset>
            <legend>Password change</legend>
            <div className="single-input-item">
              <label for="current-pwd" className="">
                Current Password
              </label>
              <input
                type="password"
                id="current-pwd"
                placeholder="Current Password"
                name="password"
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="single-input-item">
                  <label for="new-pwd" className="">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-pwd"
                    placeholder="New Password"
                    name="newPassword"
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="single-input-item">
                  <label for="confirm-pwd" className="">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-pwd"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
            </div>
          </fieldset>
          <div className="single-input-item">
            <button className="btn btn-sqr" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
