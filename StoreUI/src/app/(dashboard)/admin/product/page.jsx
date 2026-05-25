"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAllProducts, deleteProductById } from "@/app/api/products";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

const Page = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const [filter, setFilter] = useState({
    name: "",
  });
  const { data: session, status } = useSession();
  let timeoutId;
  useEffect(() => {
    if (!filter) {
      getProducts(pagination.currentPage);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        getProducts(pagination.currentPage, filter);
      }, 500);
    }
  }, [pagination.currentPage, filter]);

  const handleSearchFilter = (e) => {
    setFilter({
      name: e.target.value,
    });
  };

  // Fetch Products
  const getProducts = async (page = 1, filter) => {
    try {
      const data = await fetchAllProducts(
        page - 1,
        pagination.pageSize,
        filter
      );

      if (data) {
        setPagination({
          currentPage: page,
          totalPages: data.pageDetails?.totalPages || 1,
          totalItems: data.pageDetails?.total || 0,
          // totalItems:2,
          pageSize: pagination.pageSize,
        });

        setProducts(data.products || []);
      }
    } catch (error) {
      // console.error("Error fetching products:", error);
      toast.error("Unable loading products");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        currentPage: newPage,
      }));
    }
  };

  const handleDelete = async (id) => {
    const token = session?.user?.token;
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    const result = await deleteProductById(id, token);

    if (result) {
      toast.success("Product deleted successfully!");
      setProducts((prev) => prev.filter((product) => product.id !== id)); // Remove from UI
    }
  };

  return (
    <>
      <div className="mx-xxl-3 px-4 px-sm-5">
        <div className="py-5">
          <div className="row g-4 align-items-center">
            <div className="col">
              <h1 className="h3 m-0">Products</h1>
            </div>
            <div className="col-auto d-flex">
              {/* <a href="#" className="btn btn-secondary me-3">
                Import
              </a> */}
              <a href="/admin/product/new" className="btn btn-primary">
                New product
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-xxl-3 px-4 px-sm-5 pb-6">
        <div className="sa-layout">
          <div className="sa-layout__content">
            <div className="card">
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Start typing to search for Products"
                  className="form-control form-control--search mx-auto ps-6"
                  id="table-search"
                  onChange={(e) => {
                    handleSearchFilter(e);
                  }}
                />
              </div>
              <div className="sa-divider"></div>
              <div
                id="DataTables_Table_0_wrapper"
                className="dataTables_wrapper dt-bootstrap5 no-footer"
              >
                <div className="sa-datatables">
                  <div className="sa-datatables__table">
                    <table className="sa-datatables-init dataTable no-footer">
                      <thead>
                        <tr role="row">
                          <th className="min-w-20x sorting sorting_asc">
                            Product
                          </th>
                          <th className="sorting">Category</th>
                          <th className="sorting">Stock</th>
                          <th className="sorting">Price</th>
                          <th className="w-min sorting_disabled"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="odd">
                            <td className="sorting_1">
                              <div className="d-flex align-items-center">
                                <a
                                target="_blank"
                                  href={`/product/${product.slug}`}
                                  className="me-4"
                                >
                                  <div className="sa-symbol sa-symbol--shape--rounded sa-symbol--size--lg">
                                    <img
                                      src={product?.images.length > 0 ? product.images[0].url : `${process.env.PLACEHOLDER_IMAGE}`}
                                      width={40}
                                      height={40}
                                      alt={product.name}
                                    />
                                  </div>
                                </a>
                                <div>
                                  <a
                                target="_blank"
                                    href={`/product/${product.slug}`}
                                    className="text-reset"
                                  >
                                    {product.name}
                                  </a>
                                  <div className="sa-meta mt-0">
                                    <ul className="sa-meta__list">
                                      <li className="sa-meta__item">
                                        ID:{" "}
                                        <span className="st-copy">
                                          {product.id}
                                        </span>
                                      </li>
                                      <li className="sa-meta__item">
                                        SKU:{" "}
                                        <span className="st-copy">
                                          {product.sku}
                                        </span>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <a
                                href="app-category.html"
                                className="text-reset"
                              >
                                {product.Category[0]?.categoryName ||
                                  "Uncategorized"}
                              </a>
                            </td>
                            <td>{product.quantity}</td>
                            <td>
                              <div className="sa-price">
                                <span className="sa-price__symbol">$</span>
                                <span className="sa-price__integer">
                                  {product.price.toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td style={{ width: 80 }}>
                              <div className="d-flex justify-content-between w-100">
                                <Link href={`/admin/product/${product.id}`}>
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
                                <button
                                  onClick={() => handleDelete(product.id)}
                                >
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

                  <div className="sa-datatables__footer flex flex-col sm:flex-row items-center justify-between gap-4 p-2 mt-5">
                    {/* Pagination */}
                    <div className="sa-datatables__pagination w-full sm:w-auto overflow-auto">
                      <div className="dataTables_paginate paging_simple_numbers">
                        <ul className="pagination pagination-sm flex flex-wrap justify-center sm:justify-start gap-1">
                          {/* Previous Button */}
                          <li
                            className={`paginate_button page-item previous ${pagination.currentPage === 1 ? "disabled" : ""
                              }`}
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                          >
                            <a href="#" className="page-link px-3 py-1 text-sm">
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
                              <a href="#" className="page-link px-3 py-1 text-sm">
                                {index + 1}
                              </a>
                            </li>
                          ))}

                          {/* Next Button */}
                          <li
                            className={`paginate_button page-item next ${pagination.currentPage === pagination.totalPages ? "disabled" : ""
                              }`}
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                          >
                            <a href="#" className="page-link px-3 py-1 text-sm">
                              Next
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Showing X to Y of Z */}
                    <div className="sa-datatables__controls text-center sm:text-right">
                      <div className="sa-datatables__legend text-xs sm:text-sm">
                        <div className="dataTables_info" role="status" aria-live="polite">
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
        </div>
      </div>
    </>
  );
};

export default Page;
