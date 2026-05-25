"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { allUserOrders } from "@/app/api/orders";
import { allUsers } from "@/app/api/users";
import { fetchAllProducts } from "@/app/api/products";

const Page = () => {
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchUsers();
      fetchProducts();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await allUserOrders(token);
      response.orders.total = response.pageDetails.total;
      setOrders(response.orders);
    } catch (error) {}
  };

  const fetchUsers = async () => {
    try {
      const response = await allUsers(token);
      response.users.total = response.pageDetails.total;
      setUsers(response.users);
    } catch (error) {}
  };

  const fetchProducts = async () => {
    try {
      const response = await fetchAllProducts(token);
      response.products.total = response.pageDetails.total;
      setProducts(response.products);
    } catch (error) {}
  };

  return (
    <div className="container pb-6">
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Dashboard</h1>
          </div>
        </div>
      </div>
      <div className="row g-4 g-xl-5">
        <div className="col-12 col-md-4 d-flex">
          <div className="card saw-indicator flex-grow-1">
            <Link href="/admin/order" className="text-dark">
              <div className="sa-widget-header saw-indicator__header">
                <h2 className="sa-widget-header__title">Total Orders</h2>
              </div>
              <div className="saw-indicator__body">
                <div className="saw-indicator__value">{orders.total || 0}</div>
              </div>
            </Link>
          </div>
        </div>
        <div className="col-12 col-md-4 d-flex">
          <div
            className="card saw-indicator flex-grow-1"
            data-sa-container-query='{"340":"saw-indicator--size--lg"}'
          >
            <Link href="/admin/customer" className="text-dark">
              <div className="sa-widget-header saw-indicator__header">
                <h2 className="sa-widget-header__title">Total Customers</h2>
              </div>
              <div className="saw-indicator__body">
                <div className="saw-indicator__value">{users.total || 0}</div>
              </div>
            </Link>
          </div>
        </div>
        <div className="col-12 col-md-4 d-flex">
          <div
            className="card saw-indicator flex-grow-1"
            data-sa-container-query='{"340":"saw-indicator--size--lg"}'
          >
            <Link href="/admin/product" className="text-dark">
              <div className="sa-widget-header saw-indicator__header">
                <h2 className="sa-widget-header__title">Total Products</h2>
              </div>
              <div className="saw-indicator__body">
                <div className="saw-indicator__value">{products.total || 0}</div>
              </div>
            </Link>
          </div>
        </div>
        <div className="col-12 col-xxl-9 d-flex">
          <div className="card flex-grow-1 saw-table">
            <div className="sa-widget-header saw-table__header">
              <h2 className="sa-widget-header__title">Recent orders</h2>
            </div>
            <div className="saw-table__body sa-widget-table text-nowrap">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Items Bought</th> {/* New column for items bought */}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <Link
                          href={`/admin/order/${row.id}`}
                          className="text-reset"
                        >
                          #{index + 1}
                        </Link>
                      </td>
                      <td>
                        <div className="d-flex fs-6">
                          <div className={`badge badge-sa-primary`}>
                            {row.status}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Link
                          href={`/admin/customer/${row.user.id}`}
                          className="text-reset"
                        >
                          {row.user.name}
                        </Link>
                      </td>
                      <td>{new Date(row.createdAt).toLocaleString()}</td>
                      <td>{row.total}</td>
                      <td>{row.products.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* <div className="col-12 col-lg-6 d-flex">
                    <div className="card flex-grow-1">
                        <div className="card-body">
                            <div className="sa-widget-header">
                                <h2 className="sa-widget-header__title">Recent reviews</h2>
                            </div>
                        </div>
                        <ul className="list-group list-group-flush">
                            {productData.map((product, index) => (
                            <li className="list-group-item py-2" key={index}>
                                <div className="d-flex align-items-center py-3">
                                    <a href="app-product.html" className="me-4">
                                        <div className="sa-symbol sa-symbol--shape--rounded sa-symbol--size--lg">
                                        <img src={product.imageUrl} width="40" height="40" alt="" />
                                        </div>
                                    </a>
                                    <div className="d-flex align-items-center flex-grow-1 flex-wrap">
                                        <div className="col">
                                            <a href="app-product.html" className="text-reset fs-exact-14">
                                                {product.productName}
                                            </a>
                                            <div className="text-muted fs-exact-13">
                                                Reviewed by <a href="app-customer.html" className="text-reset">{product.reviewBy}</a>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-auto">
                                            <div className="sa-rating ms-sm-3 my-2 my-sm-0" style={{ "--sa-rating--value": product.rating }}>
                                                <div className="sa-rating__body"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-muted fs-exact-13">
                                    Items Bought: {product.itemsBought}
                                </div>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div> */}
      </div>
    </div>
  );
};

export default Page;
