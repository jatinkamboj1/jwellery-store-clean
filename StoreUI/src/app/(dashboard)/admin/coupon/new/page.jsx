"use client";
import { createCoupon } from "@/app/api/discount";
import { useState } from "react";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";

import { useSession } from "next-auth/react";
import { LogoutUser } from "@/utils/auth";

const Page = () => {
  const [formState, setFormState] = useState({
    code: null,
    description: null,
    type: "FIXED",
    amount: null,
    cartAmount: { min: null, max: null },
    startDate: null,
    endDate: null,
    usageLimit: null,
    status: "false",
  });

  const { data: session, status } = useSession();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCartChange = (name, val) => {
    setFormState((prevState) => ({
      ...prevState,
      cartAmount: {
        ...prevState.cartAmount,
        [name]: val,
      },
    }));
  };

  const handleDateChange = (name, val) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: val,
    }));
  };

  const handleSubmit = async () => {
    const token = session?.user?.token;
    if (!token) {
      LogoutUser();
      return;
    }

    try {
      const response = await createCoupon(formState, token);
      toast.success(response.message);
      setFormState({
        code: null,
        description: null,
        type: "FIXED",
        amount: null,
        cartAmount: { min: null, max: null },
        startDate: null,
        endDate: null,
        usageLimit: null,
        status: "false",
      });
    } catch (error) {
      // console.error("Error creating coupon:", error);
      toast.error("Failed to create coupon.");
    }
  };

  return (
    <div className="container container--max--xl">
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Add Coupon</h1>
          </div>
          <div className="col-auto d-flex">
            <button onClick={handleSubmit} className="btn btn-primary">
              Save
            </button>
          </div>
        </div>
      </div>
      <div className="sa-entity-layout sa-entity-layout--size--md">
        <div className="sa-entity-layout__body">
          <div className="sa-entity-layout__main">
            <div className="card">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Basic information</h2>
                </div>
                <div className="mb-4">
                  <label htmlFor="form-coupon/code" className="form-label">
                    Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="form-coupon/code"
                    placeholder="QWERTY12"
                    name="code"
                    value={formState.code}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <div className="form-label mb-3">Type <span className="text-danger">*</span></div>
                  <label className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={formState.type === "PERCENTAGE"}
                      name="type"
                      value={"PERCENTAGE"}
                      onChange={handleChange}
                    />
                    <span className="form-check-label">Percentage</span>
                  </label>
                  <label className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={formState.type === "FIXED"}
                      name="type"
                      value={"FIXED"}
                      onChange={handleChange}
                    />
                    <span className="form-check-label">Fixed amount</span>
                  </label>
                  <label className="form-check mb-0">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={formState.type === "SHIPPING_FREE"}
                      name="type"
                      value={"SHIPPING_FREE"}
                      onChange={handleChange}
                    />
                    <span className="form-check-label">Free shipping</span>
                  </label>
                </div>
                <div className="mb-4">
                  <label htmlFor="form-coupon/value" className="form-label">
                    Discount value <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="form-coupon/value"
                    name="amount"
                    value={formState.amount}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="form-coupon/limit" className="form-label">
                    Usage limit <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="form-coupon/limit"
                    name="usageLimit"
                    min="1"
                    value={formState.usageLimit}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Cart Conditions</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 48%)",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <label htmlFor="form-coupon/value" className="form-label">
                        Min Cart Value <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="form-coupon/value"
                        value={formState.cartAmount.min}
                        onChange={(e) =>
                          handleCartChange("min", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="form-coupon/value" className="form-label">
                        Max Cart Value <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="form-coupon/value"
                        value={formState.cartAmount.max}
                        onChange={(e) =>
                          handleCartChange("max", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sa-entity-layout__sidebar">
            <div className="card w-100">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Status <span className="text-danger">*</span></h2>
                </div>
                <div className="mb-n2 mt-n3">
                  <label className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="status"
                      checked={formState.status === "true"}
                      value="true"
                      onChange={handleChange}
                    />
                    <span className="form-check-label">Enabled</span>
                  </label>
                  <label className="form-check mb-0">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="status"
                      checked={formState.status === "false"}
                      value="false"
                      onChange={handleChange}
                    />
                    <span className="form-check-label">Disabled</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Schedule</h2>
                  <div className="mt-3 text-muted">
                    Use these settings to limit the coupon expiration date.
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="form-coupon/start-date"
                    className="form-label"
                  >
                    Start date <span className="text-danger">*</span>
                  </label>
                  <DatePicker
                    className="form-control"
                    selected={formState.startDate}
                    onChange={(date) => handleDateChange("startDate", date)}
                  />
                </div>
                <div>
                  <label htmlFor="form-coupon/end-date" className="form-label">
                    End date <span className="text-danger">*</span>
                  </label>
                  <DatePicker
                    className="form-control"
                    selected={formState.endDate}
                    onChange={(date) => handleDateChange("endDate", date)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
