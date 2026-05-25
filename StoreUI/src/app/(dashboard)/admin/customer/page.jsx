"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { allUsers, deleteUser } from "@/app/api/users";

const Page = () => {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState({
    name: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  const { data: session, status } = useSession();

  const token = session?.user?.token;

  const handleSearchFilter = (e) => {
    e.preventDefault();
    setFilter({
      name: e.target.value,
    });
  };
  let timeoutId;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        currentPage: newPage,
      }));
    }
  };

  const default_image =
    "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid";

  const fetchCustomers = async (token, page = 1, filter = "") => {
    try {
      const response = await allUsers(
        token,
        page - 1,
        pagination.pageSize,
        filter
      );
      setCustomers(response.users);
      setPagination({
        currentPage: page,
        totalPages: response.pageDetails?.totalPages || 1,
        totalItems: response.pageDetails?.total || 0,
        // totalItems:2,
        pageSize: pagination.pageSize,
      });
    } catch (error) {
      // console.error(error);
      toast.error("Unable to fetch customers");
    }
  };

  useEffect(() => {
    if (!filter) {
      if (token) fetchCustomers(token);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (token) fetchCustomers(token, pagination.currentPage, filter);
      }, 500);
    }
  }, [token, filter, pagination.currentPage]);

  const data = customers;

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure to delete this coupon!")) return;
    try {
      const response = await deleteUser(token, id);
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.id !== id)
      );
      if (response) toast.success("Successfully deleted customer");
    } catch (error) {
      // console.error(error);
      toast.error("Unable to delete customer");
    }
  };

  return (
    <div className="container">
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <nav className="mb-2" aria-label="breadcrumb" />
            <h1 className="h3 m-0">Customers</h1>
          </div>
          <div className="col-auto d-flex">
            <a href="/admin/customer/new" className="btn btn-primary">
              New Customer
            </a>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="p-4">
          <input
            type="text"
            placeholder="Start typing to search for customers"
            className="form-control form-control--search mx-auto ps-6"
            id="table-search"
            onChange={(e) => handleSearchFilter(e)}
          />
        </div>
        <div className="sa-divider" />
        <div
          id="DataTables_Table_0_wrapper"
          className="dataTables_wrapper dt-bootstrap5 no-footer"
        >
          <div className="sa-datatables">
            <div className="sa-datatables__table">
              <table className="sa-datatables-init dataTable no-footer">
                <thead>
                  <tr role="row">
                    <th
                      className="sorting"
                      aria-label="Name: activate to sort column descending"
                    >
                      {" "}
                      Name
                    </th>
                    <th
                      className="sorting"
                      aria-label="Registered: activate to sort column ascending"
                    >
                      Registered
                    </th>
                    <th
                      className="sorting"
                      aria-label="Spent: activate to sort column ascending"
                    >
                      Spent
                    </th>
                    <th
                      className="sorting"
                      data-orderable="false"
                      aria-label=""
                    />
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={`customer-${index}`}>
                      <td className="sorting_1">
                        <div className="d-flex align-items-center">
                          <Link
                            href={`/admin/customer/${item.id}`}
                            className="me-4"
                          >
                            <div className="sa-symbol sa-symbol--shape--rounded sa-symbol--size--lg">
                              <img
                                src={item.img || default_image}
                                width="40"
                                height="40"
                                alt=""
                              />
                            </div>
                          </Link>
                          <div>
                            <Link
                              href={`/admin/customer/${item.id}`}
                              className="text-reset"
                            >
                              {item.name}
                            </Link>
                            <div className="text-muted mt-n1">{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-nowrap">
                        {" "}
                        {new Date(item.accountCreatedIn).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td>
                        <div className="sa-price">
                          <span className="sa-price__symbol">$</span>
                          <span className="sa-price__integer">
                            {item.spentAmount || 0}
                          </span>
                        </div>
                      </td>
                      <td style={{ width: 80 }}>
                        <div
                          className="d-flex w-100"
                          style={{ justifyContent: "space-between" }}
                        >
                          <Link href={`/admin/customer/${item.id}`}>
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
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
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
