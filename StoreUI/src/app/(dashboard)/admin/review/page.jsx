"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { allUserOrders, deleteUserOrder } from "@/app/api/orders";
import { deleteReview, fetchAllReviews, updateReview } from "@/app/api/review";

const Page = () => {
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState({
    name: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const [formState, setFormState] = useState({
    user: "",
    product: "",
    review: "",
    rating: 0,
    isValid: undefined,
    isVisible: undefined,
  });
  let timeoutId;
  // Fetch Orders
  useEffect(() => {
    if (!filter) {
      if (token) fetchReviews(pagination.currentPage);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (token) fetchReviews(pagination.currentPage, filter);
      }, 500);
    }
  }, [token, pagination.currentPage, filter]);
  const fetchReviews = async (page = 1, filter = "") => {
    try {
      const response = await fetchAllReviews(
        token,
        page - 1,
        pagination.pageSize,
        filter
      );
      if (response) {
        setPagination({
          currentPage: page,
          totalPages: response.pageDetails?.totalPages || 1,
          totalItems: response.pageDetails?.total || 0,
          // totalItems:2,
          pageSize: pagination.pageSize,
        });
      }
      setReviews(response.reviews || []);
    } catch (error) {}
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        currentPage: newPage,
      }));
    }
  };

  const handleSearchFilter = (e) => {
    setFilter({
      name: e.target.value,
    });
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    // //console.log(id);
    const response = await deleteReview(token, id);
    if (response) {
      fetchReviews(pagination.currentPage, filter);
      toast.success("Successfully deleted review");
    }
  };

  const handleEdit = (e, index) => {
    e.preventDefault();
    setIsOpen(true);
    const data = reviews[index];
    // //console.log(data);
    setFormState({
      id: data.id,
      user: data.user.name,
      rating: data.rating,
      product: data.product.name,
      review: data.review,
      isValid: data.isValid,
      isVisible: data.isVisible,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = (e) => {
    setIsOpen(false);
    emptyFormState();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateReview(token, formState.id, formState);
      if (response) {
        fetchReviews(pagination.currentPage, filter);
        setIsOpen(false);
        toast.success("Successfully Updated Review");
        emptyFormState();
      }
    } catch (error) {}
  };

  const emptyFormState = () => {
    setFormState({
      user: "",
      product: "",
      review: "",
      rating: 0,
      isValid: undefined,
      isVisible: undefined,
    });
  };

  return (
    <div className="container position-relative">
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Reviews</h1>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="p-4">
          <input
            type="text"
            placeholder="Start typing to search for custoemer's reviews"
            className="form-control form-control--search mx-auto ps-6"
            id="table-search"
            onChange={(e) => handleSearchFilter(e)}
          />
        </div>
        <div className="sa-divider" />
        <div className="dataTables_wrapper dt-bootstrap5 no-footer">
          <div className="sa-datatables">
            <div className="sa-datatables__table">
              <table className="sa-datatables-init text-nowrap dataTable no-footer">
                <thead>
                  <tr role="row">
                    {/* <th className="sorting sorting_desc">Number</th> */}
                    <th className="sorting">Date</th>
                    <th className="sorting">Customer</th>
                    <th className="sorting">Product</th>
                    <th className="sorting">Rating</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((item, index) => (
                    <tr key={`order-${index}`} title={item.review}>
                      {/* <td className="sorting_1">#{index + 1}</td> */}
                      <td>
                        {new Date(item.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        <Link
                          href={`/admin/customer/${item.user.id}`}
                          className="text-reset"
                        >
                          {item.user.name}
                        </Link>
                      </td>

                      <td>{item.product.name}</td>
                      <td>
                        <div className="d-flex fs-6">{item.rating}</div>
                      </td>

                      <td style={{ width: 80 }}>
                        <div
                          className="d-flex w-100"
                          style={{ justifyContent: "space-between" }}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleEdit(e, index)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 1.56 1.56"
                              space="preserve"
                            >
                              <path d="m.285 1.002.267.267c.012.012.03.012.042 0L1.26.6a.03.03 0 0 0 0-.042L.996.294a.03.03 0 0 0-.042 0L.285.963c-.012.012-.012.03 0 .039m.798-.831a.03.03 0 0 0 0 .042l.264.264c.012.012.03.012.042 0l.075-.075a.113.113 0 0 0 0-.165L1.323.096a.12.12 0 0 0-.171 0zM.063 1.446a.044.044 0 0 0 .051.051l.327-.078a.1.1 0 0 0 .027-.015l.006-.006c.006-.006.009-.027-.003-.039l-.27-.27C.189 1.077.168 1.08.162 1.086l-.006.006a.1.1 0 0 0-.015.027z" />
                            </svg>
                          </button>
                          <button onClick={(e) => handleDelete(e, item.id)}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="-0.015 0 0.57 0.57"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M.148.447c0 .014.021.033.034.033h.206C.402.48.422.461.422.447V.18H.148zM.45.104H.377L.34.06H.23L.193.104H.12v.044h.33z"
                                fillRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sa-datatables__footer">
              <div className="sa-datatables__pagination">
                <div className="dataTables_paginate paging_simple_numbers">
                  <ul className="pagination pagination-sm">
                    {/* Previous Button */}
                    <li
                      className={`paginate_button page-item previous ${
                        pagination.currentPage === 1 ? "disabled" : ""
                      }`}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                    >
                      <a href="#" className="page-link">
                        Previous
                      </a>
                    </li>

                    {/* Page Numbers */}
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <li
                        key={index}
                        className={`paginate_button page-item ${
                          pagination.currentPage === index + 1 ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        <a href="#" className="page-link">
                          {index + 1}
                        </a>
                      </li>
                    ))}

                    {/* Next Button */}
                    <li
                      className={`paginate_button page-item next ${
                        pagination.currentPage === pagination.totalPages
                          ? "disabled"
                          : ""
                      }`}
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                    >
                      <a href="#" className="page-link">
                        Next
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Showing X to Y of Z */}
              <div className="sa-datatables__controls">
                <div className="sa-datatables__legend">
                  <div
                    className="dataTables_info"
                    role="status"
                    aria-live="polite"
                  >
                    Showing
                    {(pagination.currentPage - 1) * pagination.pageSize +
                      1} to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.pageSize,
                      pagination.totalItems
                    )}{" "}
                    of {pagination.totalItems}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="position-absolute pop-positions bg-white shadow-lg">
          <div className="d-flex justify-content-between align-item-center">
            <h4>Edit Review</h4>
            <button
              type="button"
              onClick={(e) => {
                handleClose(e);
              }}
            >
              ❌
            </button>
          </div>
          <hr />
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">User:</label>
            <div>
              <input
                type="text"
                name="user"
                disabled
                value={formState.user}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Product:</label>
            <div>
              <input
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                disabled
                name="product"
                value={formState.product}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Review:</label>
            <div>
              <textarea
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="review"
                value={formState.review}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Rating:</label>
            <div>
              <input
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number"
                name="rating"
                value={formState.rating}
                min="0"
                max="5"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="d-flex gap-3 mb-3">
            <div>
              <input
                type="checkbox"
                name="isValid"
                checked={formState.isValid || false}
                onChange={handleInputChange}
              />
            </div>
            <label className="block text-sm font-medium">Is Valid</label>
          </div>

          <div className="d-flex gap-3 mb-3">
            <div>
              <input
                className="w-100 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="checkbox"
                name="isVisible"
                checked={formState.isVisible || false}
                onChange={handleInputChange}
              />
            </div>
            <label className="block text-sm font-medium">Is Visible</label>
          </div>
          <div>
            <button
              className="btn btn-primary mt-2 w-100"
              onClick={(e) => handleSubmit(e)}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
