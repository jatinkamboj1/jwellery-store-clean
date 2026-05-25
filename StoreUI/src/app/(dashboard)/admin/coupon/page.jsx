"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { deleteCoupon, getAllCoupons } from "@/app/api/discount";
import toast from "react-hot-toast";

const Page = () => {
  const [coupons, setCoupons] = useState([]);
  const [filter, setFilter] = useState({
    code: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  const { data: session, status } = useSession();

  const token = session?.user?.token;
  let timeoutId;

  useEffect(() => {
    if (!filter) {
      if (token) fetchCoupons(token, pagination.currentPage);
    } else {
      // Clear the previous timeout if the user is still typing
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (token) fetchCoupons(token, pagination.currentPage, filter);
      }, 3000);
    }
  }, [token, pagination.currentPage, filter]);

  const fetchCoupons = async (token, page = 1, filter = "") => {
    // //console.log(`Fetching products for page ${page}...`);
    const response = await getAllCoupons(
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
    setCoupons(response.discounts || []);
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
      code: e.target.value,
    });
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure to delete this coupon!")) return;
    const response = await deleteCoupon(id, token);
    setCoupons((prevCoupons) =>
      prevCoupons.filter((coupon) => coupon.id !== id)
    );
    toast.success(response.message);
  };

  return (
    <div className="container">
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <nav className="mb-2" aria-label="breadcrumb" />
            <h1 className="h3 m-0">Coupons</h1>
          </div>
          <div className="col-auto d-flex">
            <a href="/admin/coupon/new" className="btn btn-primary">
              New coupon
            </a>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="p-4">
          <input
            type="text"
            placeholder="Start typing to search for coupons"
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
              <table
                className="sa-datatables-init text-nowrap dataTable no-footer"
                data-sa-search-input="#table-search"
                id="DataTables_Table_0"
                role="grid"
                aria-describedby="DataTables_Table_0_info"
              >
                <thead>
                  <tr role="row">
                    <th
                      className="sorting sorting_asc"
                      aria-sort="ascending"
                      aria-label="Code: activate to sort column descending"
                    >
                      Code
                    </th>
                    <th
                      className="sorting"
                      aria-label="Type: activate to sort column ascending"
                    >
                      Type
                    </th>
                    <th
                      className="sorting"
                      aria-label="Discount: activate to sort column ascending"
                    >
                      Discount
                    </th>
                    {/* <th
                      className="sorting"
                      aria-label="Status: activate to sort column ascending"
                    >
                      Status
                    </th> */}
                    <th
                      className="sorting"
                      aria-label="Start date: activate to sort column ascending"
                    >
                      Start date
                    </th>
                    <th
                      className="sorting"
                      aria-label="End date: activate to sort column ascending"
                    >
                      End date
                    </th>
                    <th
                      className="w-min sorting_disabled"
                      data-orderable="false"
                      rowSpan={1}
                      colSpan="1"
                      aria-label=""
                    />
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((item, index) => (
                    <tr key={`coupon-${index}`}>
                      <td className="sorting_1">
                        <Link
                          href={`/admin/coupon/${item.id}`}
                          className="text-reset"
                        >
                          {item.code}
                        </Link>
                      </td>
                      <td>{item.type}</td>
                      <td>{item.amount}</td>
                      {/* <td>
                        <div className="d-flex fs-16">
                          <div
                            className="badge badge-sa-pill badge-sa-info"
                            style={{ color: "black" }}
                          >
                            {item.Status}
                          </div>
                        </div>
                      </td> */}
                      <td>
                        {new Date(item.startDate).toLocaleDateString("en-GB")}
                      </td>

                      <td>
                        {new Date(item.endDate).toLocaleDateString("en-GB")}
                      </td>
                      <td style={{ width: 80 }}>
                        <div
                          className="d-flex w-100"
                          style={{ justifyContent: "space-between" }}
                        >
                          <Link href={`/admin/coupon/${item.id}`}>
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
                      className={`paginate_button page-item previous ${pagination.currentPage === 1 ? "disabled" : ""
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
                        className={`paginate_button page-item ${pagination.currentPage === index + 1 ? "active" : ""
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
                      className={`paginate_button page-item next ${pagination.currentPage === pagination.totalPages
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
