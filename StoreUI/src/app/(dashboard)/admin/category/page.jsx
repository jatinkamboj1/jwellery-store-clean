"use client";
import Link from "next/link";
import Bin from "@/components/svg/Bin";
import Edit from "@/components/svg/Edit";
import { useEffect, useState } from "react";
import { fetchAllCategories, deleteCategoryId } from "@/app/api/categories";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
const Page = () => {
  const data = [
    {
      id: "asdasf",
      categoryName: "Jewelry",
      parentCategory: "Rings",
      isActive: true,
      productsLength: 3,
    },
    {
      id: "asdasf",
      categoryName: "Gold Rings",
      parentCategory: "Rings",
      isActive: true,
      productsLength: 3,
    },
    {
      id: "asdasf",
      categoryName: "Diamond Rings",
      parentCategory: "Rings",
      isActive: true,
      productsLength: 3,
    },
    {
      id: "asdasf",
      categoryName: "Platinum Rings",
      parentCategory: "Rings",
      isActive: false,
      productsLength: 2,
    },
    {
      id: "asdasf",
      categoryName: "Bangles",
      parentCategory: "Bangles",
      isActive: true,
      productsLength: 3,
    },
    {
      id: "asdasf",
      categoryName: "Gold Bangles",
      parentCategory: "Bangles",
      isActive: true,
      productsLength: 3,
    },
    {
      id: "asdasf",
      categoryName: "Silver Bangles",
      parentCategory: "Bangles",
      isActive: false,
      productsLength: 2,
    },
    {
      id: "asdasf",
      categoryName: "Earrings",
      parentCategory: "Earrings",
      isActive: true,
      productsLength: 3,
    },
    {
      id: "asdasf",
      categoryName: "Gold Earrings",
      parentCategory: "Earrings",
      isActive: true,
      productsLength: 3,
    },
    {
      id: "asdasf",
      categoryName: "Diamond Earrings",
      parentCategory: "Earrings",
      isActive: false,
      productsLength: 2,
    },
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  // const [pageNumber, setPageNumber] = useState([]);
  const [pageDetails, setPageDetails] = useState({
    total: 1,
    offset: 0,
    limit: 10,
    currentPage: 1,
    totalPages: 1,
  });
  const [filter, setFilter] = useState({
    categoryName: "",
  });
  const { data: session, status } = useSession();

  let timeoutId;

  useEffect(() => {
    setPageDetails((prev) => ({
      ...prev,
      totalPages: Math.ceil(prev.total / prev.limit), // Use prev to avoid stale values
    }));
  }, [pageDetails.total, pageDetails.limit]); // ✅ Dependency updated

  // Filter
  const handleSearchFilter = (e) => {
    setFilter({
      categoryName: e.target.value,
    });
  };
  // Handle Page Change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pageDetails.totalPages) return;

    setPageDetails((prev) => ({
      ...prev,
      currentPage: newPage,
      offset: (newPage - 1) * prev.limit, // ✅ Correct offset calculation
    }));
  };

  useEffect(() => {
    if (!filter) {
      fetchCategories(pageDetails.offset, pageDetails.limit); // ✅ Fetch with correct params
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchCategories(pageDetails.offset, pageDetails.limit, filter);
      }, 500);
    }
  }, [pageDetails.currentPage, pageDetails.limit, filter]);

  // ✅ Fetch only when relevant changes
  async function fetchCategories(offset, limit, filter) {
    try {
      const response = await fetchAllCategories(offset, limit, filter);
      setCategories(response.categories);
      setPageDetails(response.pageDetails);
      // setPageDetails((prev) => ({
      //   ...prev,
      //   total: response.total, // ✅ Ensure total is updated dynamically
      // }));
    } catch (error) {
      // console.error("Error fetching categories:", error);
    }
  }

  const handleDelete = async (id) => {
    const token = session?.user?.token;
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    const result = await deleteCategoryId(id, token);
    if (result) {
      fetchCategories(pageDetails.offset, pageDetails.limit, filter);
      toast.success("Category deleted successfully!");
    }
  };

  // useEffect(() => {
  //   if (searchTerm) {
  //     const filteredCategories = categories.filter((category) =>
  //       category.name.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //     setCategories(filteredCategories);
  //   } else {
  //     fetchCategories();
  //   }
  // }, [searchTerm]);

  return (
    <div className="mx-sm-2 px-2 px-sm-3 px-xxl-4 pb-6">
      <div className="container">
        <div className="py-5">
          <div className="row g-4 align-items-center">
            <div className="col">
              <h1 className="h3 m-0">Categories</h1>
            </div>
            <div className="col-auto d-flex">
              <Link href="category/new" className="btn btn-primary">
                New category
              </Link>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-4">
            {/* <input
              type="text"
              placeholder="Start typing to search for categories"
              className="form-control form-control--search mx-auto ps-6"
              value={searchTerm}
              onChange={(e) => handleSearchFilter(e)}
            /> */}
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
                <table className="sa-datatables-init">
                  <thead>
                    <tr>
                      <th className="min-w-15x">Name</th>
                      <th className="min-w-15x">Parent</th>
                      <th>Items</th>
                      <th>Visibility</th>
                      <th className="w-min">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((item, index) => (
                      <tr key={`category-${index}`}>
                        <td>
                          <Link
                            target="_blank"
                            href={`/category/${item.slug}`}
                            className="text-reset"
                          >
                            {item.categoryName}
                          </Link>
                        </td>
                        <td>{item.parent?.categoryName}</td>
                        <td>{item.products.length}</td>
                        <td>
                          {!item.isDisabled ? (
                            <div className="badge badge-sa-success">
                              Visible
                            </div>
                          ) : (
                            <div className="badge badge-sa-secondary">
                              Hidden
                            </div>
                          )}
                        </td>
                        <td style={{ width: 80 }}>
                          <div
                            className="d-flex w-100"
                            style={{ justifyContent: "space-between" }}
                          >
                            <Link href={`/admin/category/${item.id}`}>
                              <Edit />
                            </Link>
                            <button onClick={() => handleDelete(item.id)}>
                              <Bin />
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
                        className={`paginate_button page-item previous ${pageDetails.currentPage === 1 ? "disabled" : ""
                          }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            handlePageChange(pageDetails.currentPage - 1)
                          }
                          disabled={pageDetails.currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>

                      {/* Page Numbers */}
                      {Array.from(
                        { length: pageDetails.totalPages },
                        (_, index) => (
                          <li
                            key={index}
                            className={`paginate_button page-item ${pageDetails.currentPage === index + 1
                              ? "active"
                              : ""
                              }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        )
                      )}

                      {/* Next Button */}
                      <li
                        className={`paginate_button page-item next ${pageDetails.currentPage === pageDetails.totalPages
                          ? "disabled"
                          : ""
                          }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            handlePageChange(pageDetails.currentPage + 1)
                          }
                          disabled={
                            pageDetails.currentPage === pageDetails.totalPages
                          }
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="sa-datatables__controls">
                  <div className="sa-datatables__legend">
                    <div
                      className="dataTables_info"
                      role="status"
                      aria-live="polite"
                    >
                      {`Showing ${pageDetails.offset + 1} to ${Math.min(
                        pageDetails.offset + pageDetails.limit,
                        pageDetails.total
                      )} of ${pageDetails.total}`}
                    </div>
                  </div>
                </div>
              </div>
              {/*  */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
