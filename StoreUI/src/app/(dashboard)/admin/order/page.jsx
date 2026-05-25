"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { allUserOrders, deleteUserOrder } from "@/app/api/orders";

const Page = () => {
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState({
    name: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  const [sort, setSort] = useState({
    title: "orderNumber",
    asc: false,
  });

  let timeoutId;
  // Fetch Orders
  useEffect(() => {
    if (!filter) {
      if (token) fetchOrders(pagination.currentPage);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (token) fetchOrders(pagination.currentPage, filter, sort);
      }, 500);
    }
  }, [token, pagination.currentPage, filter, sort]);

  const fetchOrders = async (page = 1, filter = "", sort) => {
    try {
      const response = await allUserOrders(
        token,
        page - 1,
        pagination.pageSize,
        filter,
        sort
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
      setOrders(response.orders || []);
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

  const handleSortingChange = (e, title) => {
    e.preventDefault();
    if (sort.title !== title) {
      setSort({
        title,
        asc: false,
      });
    } else {
      setSort((prev) => ({
        ...prev,
        title: title,
        asc: !prev.asc,
      }));
    }
  };

  return (
    <div className="container">
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Orders</h1>
          </div>
          <div className="col-auto d-flex">
            <Link href="/admin/order/new" className="btn btn-primary">
              New order
            </Link>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="p-4">
          <input
            type="text"
            placeholder="Start typing to search for orders"
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
                    <th
                      style={{ cursor: "default" }}
                      className={`sorting ${
                        sort.title === "orderNumber"
                          ? sort.asc
                            ? "sorting_asc"
                            : "sorting_desc"
                          : ""
                      }`}
                      onClick={(e) => handleSortingChange(e, "orderNumber")}
                    >
                      Number
                    </th>
                    <th
                      style={{ cursor: "default" }}
                      className={`sorting ${
                        sort.title === "createdAt"
                          ? sort.asc
                            ? "sorting_asc"
                            : "sorting_desc"
                          : ""
                      }`}
                      onClick={(e) => handleSortingChange(e, "createdAt")}
                    >
                      Date
                    </th>
                    <th
                      style={{ cursor: "default" }}
                      className={`sorting ${
                        sort.title === "userId"
                          ? sort.asc
                            ? "sorting_asc"
                            : "sorting_desc"
                          : ""
                      }`}
                      onClick={(e) => handleSortingChange(e, "userId")}
                    >
                      Customer
                    </th>
                    <th
                      style={{ cursor: "default" }}
                      className={`sorting ${
                        sort.title === "paid"
                          ? sort.asc
                            ? "sorting_asc"
                            : "sorting_desc"
                          : ""
                      }`}
                      onClick={(e) => handleSortingChange(e, "paid")}
                    >
                      Paid
                    </th>
                    <th
                      style={{ cursor: "default" }}
                      className={`sorting ${
                        sort.title === "status"
                          ? !sort.asc
                            ? "sorting_asc"
                            : "sorting_desc"
                          : ""
                      }`}
                      onClick={(e) => handleSortingChange(e, "status")}
                    >
                      Status
                    </th>
                    <th
                      style={{ cursor: "default" }}
                      className={`sorting ${
                        sort.title === "quantity"
                          ? sort.asc
                            ? "sorting_asc"
                            : "sorting_desc"
                          : ""
                      }`}
                      onClick={(e) => handleSortingChange(e, "quantity")}
                    >
                      Items
                    </th>
                    <th
                      style={{ cursor: "default" }}
                      className={`sorting ${
                        sort.title === "total"
                          ? sort.asc
                            ? "sorting_asc"
                            : "sorting_desc"
                          : ""
                      }`}
                      onClick={(e) => handleSortingChange(e, "total")}
                    >
                      Total
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((item, index) => (
                    <tr key={`order-${index}`}>
                      <td className="sorting_1">
                        <Link
                          href={`/admin/order/${item.orderNumber}`}
                          className="text-reset"
                        >
                          #{item.orderNumber}
                        </Link>
                      </td>
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
                      <td>
                        <div className="d-flex fs-6">
                          {item.paid === "ONLINE" ? (
                            <div className="badge badge-sa-success">Yes</div>
                          ) : (
                            <div className="badge badge-sa-secondary">No</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex fs-6">
                          <div className="badge badge-sa-primary text-capitalize">
                            {(item.status).toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td>{`${item.products.length} items`}</td>
                      <td>
                        <div className="sa-price">
                          <span className="sa-price__symbol">₹</span>
                          <span className="sa-price__integer">
                            {item.total}
                          </span>
                        </div>
                      </td>
                      <td style={{ width: 80 }}>
                        <div
                          className="d-flex w-100"
                          style={{ justifyContent: "space-between" }}
                        >
                          <Link href={`/admin/order/${item.id}`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 1.56 1.56"
                              space="preserve"
                            >
                              <path d="m.285 1.002.267.267c.012.012.03.012.042 0L1.26.6a.03.03 0 0 0 0-.042L.996.294a.03.03 0 0 0-.042 0L.285.963c-.012.012-.012.03 0 .039m.798-.831a.03.03 0 0 0 0 .042l.264.264c.012.012.03.012.042 0l.075-.075a.113.113 0 0 0 0-.165L1.323.096a.12.12 0 0 0-.171 0zM.063 1.446a.044.044 0 0 0 .051.051l.327-.078a.1.1 0 0 0 .027-.015l.006-.006c.006-.006.009-.027-.003-.039l-.27-.27C.189 1.077.168 1.08.162 1.086l-.006.006a.1.1 0 0 0-.015.027z" />
                            </svg>
                          </Link>
                          {/* <button onClick={(e) => handleDelete(e, item.id)}>
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
                          </button> */}
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
    </div>
  );
};

export default Page;
