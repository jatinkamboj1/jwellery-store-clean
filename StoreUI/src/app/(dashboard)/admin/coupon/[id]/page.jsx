"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCouponById, updateCoupons } from "@/app/api/discount";
import toast from "react-hot-toast";
import { LogoutUser } from "@/utils/auth";

const Page = () => {
  const [coupon, setCoupon] = useState();
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
  const { id } = useParams();
  const router = useRouter();

  const token = session?.user?.token;

  useEffect(() => {
    if (token && id) {
      fetchCoupons(token);
    }
  }, [token, id]);

  const fetchCoupons = async (token) => {
    if (!token) {
      LogoutUser();
      return;
    }
    const response = await getCouponById(id, token);
    setCoupon(response);

    if (response) {
      setFormState({
        code: response.code,
        description: response.description || null,
        type: response.type,
        amount: response.amount,
        cartAmount: response.cartAmount || { min: null, max: null },
        startDate: new Date(response.startDate).toLocaleDateString("en-GB"),
        endDate: new Date(response.endDate).toLocaleDateString("en-GB"),
        usageLimit: response.usageLimit,
        status: response.status ? "true" : "false",
      });
    }
  };

  const handleSubmit = async () => {
    const token = session?.user?.token;
    if (!token) {
      LogoutUser();
      return;
    }

    const response = await updateCoupons(id, formState, token);
    toast.success(response.message);
    router.push("/admin/coupon");
  };

  return (
    <div className="container container--max--xl">
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Edit Coupon</h1>
          </div>
          <div className="col-auto d-flex">
            {/* <button className="btn btn-secondary me-3">Delete</button> */}
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
                    value={formState.code}
                    onChange={(e) =>
                      setFormState({ ...formState, code: e.target.value })
                    }
                  />
                </div>
                <div className="mb-4">
                  <div className="form-label mb-3">Type <span className="text-danger">*</span></div>
                  <label className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="type"
                      checked={formState.type === "PERCENTAGE"}
                      onChange={() =>
                        setFormState({ ...formState, type: "PERCENTAGE" })
                      }
                    />
                    <span className="form-check-label">Percentage <span className="text-danger">*</span></span>
                  </label>
                  <label className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="type"
                      checked={formState.type === "FIXED"}
                      onChange={() =>
                        setFormState({ ...formState, type: "FIXED" })
                      }
                    />
                    <span className="form-check-label">Fixed amount</span>
                  </label>
                  <label className="form-check mb-0">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="type"
                      checked={formState.type === "FREE_SHIPPING"}
                      onChange={() =>
                        setFormState({ ...formState, type: "FREE_SHIPPING" })
                      }
                    />
                    <span className="form-check-label">Free shipping</span>
                  </label>
                </div>
                <div className="mb-4">
                  <label htmlFor="form-coupon/value" className="form-label">
                    Discount value
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="form-coupon/value"
                    value={formState.amount}
                    onChange={(e) =>
                      setFormState({ ...formState, amount: e.target.value })
                    }
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="form-coupon/limit" className="form-label">
                    Usage limit <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="form-coupon/limit"
                    value={formState.usageLimit}
                    onChange={(e) =>
                      setFormState({ ...formState, usageLimit: e.target.value })
                    }
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
                      onChange={() =>
                        setFormState({ ...formState, status: "true" })
                      }
                    />
                    <span className="form-check-label">Enabled</span>
                  </label>
                  <label className="form-check mb-0">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="status"
                      checked={formState.status === "false"}
                      onChange={() =>
                        setFormState({ ...formState, status: "false" })
                      }
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
                  <input
                    type="text"
                    className="form-control datepicker-here"
                    id="form-coupon/start-date"
                    value={formState.startDate}
                    onChange={(e) =>
                      setFormState({ ...formState, startDate: e.target.value })
                    }
                    data-auto-close="true"
                    data-language="en"
                  />
                </div>
                <div>
                  <label htmlFor="form-coupon/end-date" className="form-label">
                    End date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control datepicker-here"
                    id="form-coupon/end-date"
                    value={formState.endDate}
                    onChange={(e) =>
                      setFormState({ ...formState, endDate: e.target.value })
                    }
                    data-auto-close="true"
                    data-language="en"
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
