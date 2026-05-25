"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchUser, updateUserInfoByAdmin } from "@/app/api/users";
import { FaPlus } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { FaPen, FaTrash } from "react-icons/fa";
import {
  addAddress,
  deleteAddress,
  getAddressByUserId,
  updateAddresses,
} from "@/app/api/address";

const Page = () => {
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [isOpen, setisOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [spendTotal, setSpendTotal] = useState(false);
  const [reason, setReason] = useState("add");
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [lastOrders, setLastOrders] = useState([]);
  const [ordersAvg, setOrdersAvg] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addresses, setaddresses] = useState([]);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    name: "",
    stateOrProvince: "",
    country: "",
    zip: "",
  });

  const { id } = useParams();

  const fetchCustomers = async (token) => {
    try {
      const response = await fetchUser(id, token);
      setCustomer(response);
      setCustomer({
        name: response.name || "",
        email: response.email || "",
        phone: response.phone || "",
        registered: response.createdAt || "Nothing Found",
      });
      setOrders(response.orders);
    } catch (error) {}
  };

  // Calculate Total Spend
  useEffect(() => {
    const newTotal = orders.reduce((sum, order) => sum + order.total, 0);
    const newAverage = newTotal / orders.length;
    setOrdersAvg(newAverage);
    setSpendTotal(newTotal);

    // Fetch Latest Order
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const lastOrderDate =
      sortedOrders.length > 0 ? new Date(sortedOrders[0].createdAt) : null;
    setLastOrders(lastOrderDate?.toLocaleDateString("en-GB"));
  }, [orders]);

  useEffect(() => {
    if (token) {
      fetchCustomers(token);
      fetchCustomerAddresses(token);
    }
  }, [token]);

  const fetchCustomerAddresses = async (token) => {
    try {
      const response = await getAddressByUserId(id, token);
      setaddresses(response || []);
    } catch (error) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };

  // Handle the form submission (Save the data)
  const handleSave = async (e) => {
    e.preventDefault();
    const response = await updateUserInfoByAdmin(customer, id, token);
    toast.success("Successfully Updated Personal User Info");
  };

  const handleShowPopup = (e) => {
    e.preventDefault();
    //console.log('addresses.length: ', addresses.length);
    if (addresses.length >= 5) {
      toast.error("You can only add 5 addresses.");
      return;
    }
    setShowPopup(true);
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
      const response = await addAddress(formData, token, id);
      if (response) {
        toast.success("Address Added Successfully");
        fetchCustomerAddresses(token);
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
      // console.error("Error:", error);
      toast.error(error.message ?? "Error submitting address!");
    }
  };

  const updateAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await updateAddresses(formData, token, formData.id);
      toast.success("Address Updated Successfully");
      fetchCustomerAddresses(token);
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
      // console.error("Error:", error);
      toast.error("Error submitting address!");
    }
  };

  const closeModal = async (e) => {
    e.preventDefault();
    setFormData({
      street: "",
      city: "",
      name: "",
      stateOrProvince: "",
      country: "",
      zip: "",
    });
    setShowPopup(false);
    setReason("add");
  };

  const onEdit = async (e, reason, address) => {
    e.preventDefault();
    setReason(reason);
    setFormData(address);
    setShowPopup(true);
  };

  const onDelete = async (e, id) => {
    e.preventDefault();
    try {
      const response = await deleteAddress(id, token);
      setaddresses((prevAddresses) =>
        prevAddresses.filter((address) => address.id !== id)
      );
      toast.success("Address Deleted Successfully");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="container relative">
      {showPopup && (
        <div
          className="inset-0 bg-black bg-opacity-50 flex justify-end items-center z-50 w-full "
          style={{
            position: "absolute",
            zIndex: "999",
            left: "50%",
            top: "5%",
            transform: "transalateX(-50%)",
          }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-96 max-w-md">
            {/* Form Header */}
            <div
              className="flex justify-between items-center mb-4"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                className="inline text-lg font-semibold mb-4"
                style={{ width: "75%", display: "inline" }}
              >
                {reason === "edit" ? "Edit " : "Add "}Address
              </h2>
              <button type="button" onClick={(e) => closeModal(e)}>
                <IoMdClose />
              </button>
            </div>
            <hr />
            {/* Form Body */}
            <form onSubmit={reason === "edit" ? updateAddress : handleSubmit}>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2">
                      <label
                        className="block text-sm font-medium"
                        htmlFor="street"
                      >
                        Street <span className="text-danger">*</span>
                      </label>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street Address"
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <label
                        className="block text-sm font-medium"
                        htmlFor="city"
                      >
                        City <span className="text-danger">*</span>
                      </label>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City"
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <label
                        className="block text-sm font-medium"
                        htmlFor="name"
                      >
                        Name <span className="text-danger">*</span>
                      </label>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Home, Office, etc."
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <label
                        className="block text-sm font-medium"
                        htmlFor="stateOrProvince"
                      >
                        State/Province <span className="text-danger">*</span>
                      </label>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        id="stateOrProvince"
                        name="stateOrProvince"
                        value={formData.stateOrProvince}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="State/Province"
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <label
                        className="block text-sm font-medium"
                        htmlFor="country"
                      >
                        Country <span className="text-danger">*</span>
                      </label>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Country"
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <label
                        className="block text-sm font-medium"
                        htmlFor="zip"
                      >
                        ZIP Code <span className="text-danger">*</span>
                      </label>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ZIP Code"
                        required
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mt-4"
                  style={{ padding: "0.1rem 1rem", minHeight: "auto" }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="py-5 absolute top-0 z-10">
        <div className="row g-4 align-items-center">
          <div className="col">
            <nav className="mb-2" aria-label="breadcrumb" />
            <h1 className="h3 m-0">Customers</h1>
          </div>
          {/* <div className="col-auto d-flex">
            <a href="#" className="btn btn-secondary me-3">
              Delete
            </a>
          </div> */}
        </div>
      </div>
      <div
        className="sa-entity-layout sa-entity-layout--size--md absolute top-0 z-10 position-relative"
        style={{ position: "relative", zIndex: "1" }}
      >
        <div className="sa-entity-layout__body">
          <div className="sa-entity-layout__sidebar">
            <div className="card">
              <div className="card-body d-flex flex-column align-items-center">
                <div className="pt-3">
                  <div
                    className="sa-symbol sa-symbol--shape--circle"
                    style={{ height: "6rem", width: "6rem" }}
                  >
                    <img
                      src={
                        "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid"
                      }
                      width={96}
                      height={96}
                      alt="Profile"
                    />
                  </div>
                </div>
                <div className="w-100 mt-4">
                  <form onSubmit={handleSave}>
                    <div className="fs-exact-16 fw-medium">
                      <input
                        type="text"
                        className="form-control form-control-lg fs-exact-13"
                        placeholder="Full Name"
                        name="name" // Name to match with the state key
                        value={customer?.name}
                        onChange={handleChange} // Update customer state on change
                      />
                    </div>

                    <div className="fs-exact-13 text-muted">
                      <div className="mt-2">
                        <input
                          type="text"
                          className="form-control form-control-lg fs-exact-13"
                          placeholder="Email"
                          name="email" // Name to match with the state key
                          value={customer?.email}
                          onChange={handleChange} // Update customer state on change
                        />
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          className="form-control form-control-lg fs-exact-13"
                          placeholder="Phone Number"
                          name="phone" // Name to match with the state key
                          value={customer?.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 mt-4"
                      style={{ padding: "0.1rem 1rem", minHeight: "auto" }}
                    >
                      Save
                    </button>
                  </form>
                </div>
                <div className="sa-divider my-5" />
                <div className="w-100">
                  <dl className="list-unstyled m-0">
                    <dt className="fs-exact-14 fw-medium">Last Order</dt>
                    <dd className="fs-exact-13 text-muted mb-0 mt-1">
                      {lastOrders}
                    </dd>
                  </dl>
                  <dl className="list-unstyled m-0 mt-4">
                    <dt className="fs-exact-14 fw-medium">
                      Average Order Value
                    </dt>
                    <dd className="fs-exact-13 text-muted mb-0 mt-1">
                      ₹{ordersAvg || 0}
                    </dd>
                  </dl>
                  <dl className="list-unstyled m-0 mt-4">
                    <dt className="fs-exact-14 fw-medium">Registered</dt>
                    <dd className="fs-exact-13 text-muted mb-0 mt-1">
                      {new Date(customer.registered).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="sa-entity-layout__main">
            <div className="card">
              <div className="card-body px-5 py-4 d-flex align-items-center justify-content-between">
                <h2 className="mb-0 fs-exact-18 me-4">Orders</h2>
                <div className="text-muted fs-exact-14 text-end">
                  Total spent ₹{spendTotal || 0} on {orders.length} orders
                </div>
              </div>
              <div className="table-responsive">
                <table className="sa-table text-nowrap">
                  <tbody>
                    {orders.slice(0, 4).map((order, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td>{order.status}</td>
                        <td>{order.products.length || 1} items</td>
                        <td>{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sa-divider" />
              <div className="px-5 py-4 text-center">
                <button
                  type="button"
                  className="text-muted text-hover-underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setisOpen(true);
                  }}
                >
                  View all {orders.length} orders
                </button>
              </div>
            </div>
            <div className="card my-5">
              <div className="card-body px-5 py-4 d-flex align-items-center justify-content-between">
                <h2 className="mb-0 fs-exact-18 me-4">Addresses</h2>
                <button type="button" onClick={(e) => handleShowPopup(e)}>
                  <FaPlus />
                </button>
              </div>

              <div className="sa-divider" />
              {addresses.map((address, index) => (
                <div
                  key={index}
                  className="px-5 py-3 my-2 d-flex align-items-center justify-content-between"
                >
                  <div>
                    <div
                      className="text-muted fs-exact-14 mt-1 text-justify"
                      style={{ width: "90%" }}
                    >
                      {`${address.street}, ${address.city}, ${address.stateOrProvince}, ${address.country}, ${address.zip}`}
                    </div>
                  </div>

                  <div style={{ display: "flex" }}>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={(e) => onEdit(e, "edit", address)}
                      title="Edit Address"
                    >
                      <FaPen />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => onDelete(e, address.id)}
                      title="Delete Address"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="position-absolute bg-light w-90 p-5"
          style={{
            position: "absolute",
            zIndex: "999",
            top: "10%",
            width: "70%",
          }}
        >
          <div className="d-flex justify-content-between mb-5">
            <h5 className="mb-0">Orders</h5>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setisOpen(false);
              }}
            >
              ❌
            </button>
          </div>
          <table className="sa-table text-nowrap border">
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td>{order.status}</td>
                  <td>{order.products.length || 1} items</td>
                  <td>{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Page;
