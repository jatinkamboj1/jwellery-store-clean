"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useSession } from "next-auth/react";
import { applyCoupon } from "@/app/api/discount";
import toast from "react-hot-toast";
import { addOrder } from "@/app/api/orders";
import { useRouter } from "next/navigation";
import { LogoutUser } from "@/utils/auth";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";

const Page = () => {
  const router = useRouter();
  // Auth related code
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  // Other UseStates
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [userDetails, setUsertDetails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedcategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [filteredProductsData, setFilteredProducts] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [productVariantDetails, setProductVariantDetails] = useState([]);
  const [productVariant, setProductVariant] = useState([]);
  const [formState, setFormState] = useState({
    userId: null,
    addressId: null,
    categories: [],
    products: [],
    discountIds: [],
    paid: "COD",
    cancellationExpiry: "",
    status: "PENDING",
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
  });
  const [selectedProduct, setSelectedProduct] = useState({
    productId: "",
    quantity: 1,
  });
  const [quantity, setQuantity] = useState("0");
  const [cart, setCart] = useState([]);
  const [selectedProductVariant, setSelectedProductVariant] = useState({
    productVariantId: "",
    quantity: 1,
  });

  const [discount, setDiscount] = useState("");
  const [discountDetails, setDiscountDetails] = useState({});

  // Fetch Users and Categories
  useEffect(() => {
    if (status === "authenticated" && token) {
      fetchUsers(token);
      fetchCategories();
    } else {
      // console.error("No authentication token found");
      // LogoutUser();
    }
  }, [status, token]);

  // Fetch Users
  const fetchUsers = async (token) => {
    try {
      const response = await axios.get(`${process.env.SERVER_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const formattedUsers = response.data.users.map((user) => {
        return {
          value: user.id,
          label: user.name,
        };
      });

      setUsers(formattedUsers);
      setUsertDetails(response.data.users);
    } catch (error) {
      // console.error("Error fetching users:", error);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.SERVER_URL}/category`);
      const formattedCategories = response.data.categories.map((category) => {
        return {
          value: category.id,
          label: category.categoryName,
        };
      });

      setCategories(formattedCategories);
    } catch (error) {
      // console.error("Error fetching categories:", error);
    }
  };

  // Fetch Products
  useEffect(() => {
    if (selectedcategories.val && selectedcategories.val.length > 0) {
      fetchProducts(selectedcategories);
    }
  }, [selectedcategories]);

  const fetchProducts = async (categories) => {
    try {
      const response = await axios.get(
        `${process.env.SERVER_URL}/product/names`,
        {
          params: {
            categories,
          },
        }
      );
      const formattedProducts = response.data.products.map((products) => {
        return {
          value: products.id,
          label: products.name,
        };
      });

      setProducts(formattedProducts);
      setProductDetails(response.data.products);
    } catch (error) {
      // console.error("Error fetching Products:", error);
    }
  };

  // Fetch Product Variants
  useEffect(() => {
    if (productIds.length > 0 && token) fetchVariants();
  }, [productIds, token]);

  const fetchVariants = async () => {
    try {
      const response = await axios.get(
        `${process.env.SERVER_URL}/product/variants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            productIds,
          },
        }
      );
      const formattedVariants = response.data.map((variant) => ({
        value: variant.id,
        label: variant.variantName,
      }));

      setProductVariant(formattedVariants);
      setProductVariantDetails(response.data);
    } catch (error) { }
  };

  function getDefaultAddresses(users) {
    return (
      users
        .flatMap((user) => user.Address || [])
        .find((address) => address.isDefault === true) || null
    );
  }
  // Handle DropDown Change
  const handleMultiSelectChange = (name, val) => {
    setFormState((prevState) => {
      const updatedFormState = {
        ...prevState,
        [name]: val,
      };

      // Handle selectedCategories if 'userId' field is updated
      if (name === "userId") {
        const filteredUsers = userDetails.filter((user) => user.id === val);
        setSelectedUser(filteredUsers);
        const defaultAddress = getDefaultAddresses(filteredUsers);
        setFormState((prev) => {
          return { ...prev, addressId: defaultAddress?.id };
        });
      }

      // Handle selectedCategories if 'categories' field is updated
      if (name === "categories") {
        setSelectedCategories((prevState) => ({
          ...prevState,
          val,
        }));
      }

      return updatedFormState;
    });
  };

  // Handle DropDown Change For Products and ProductVariants
  const handleProductMuiltiSelectChange = (name, val) => {
    const filtereProduct = productDetails.filter(
      (product) => product.id === val
    );
    setQuantity(filtereProduct[0].quantity);

    const newProduct = {
      productId: val,
      quantity: 1,
    };
    setSelectedProduct({
      ...newProduct,
    });

    setProductIds([filtereProduct[0].id]);

    setFormState((prevState) => ({
      ...prevState,
      products: filtereProduct[0].id,
    }));
  };

  const handleProductVariantMuiltiSelectChange = (name, val) => {
    const filterVariant = productVariantDetails.filter(
      (product) => product.id === val
    );
    setQuantity(filterVariant[0].quantity);

    const newProduct = {
      productVariantId: val,
      quantity: 1,
    };
    setSelectedProductVariant({
      ...newProduct,
    });
  };

  useEffect(() => {
    if (
      products &&
      products.length > 0 &&
      formState.products &&
      formState.products.length > 0
    ) {
      const filteredProducts = productDetails.filter((product) => {
        return formState.products.includes(product.id);
      });
      setFilteredProducts(filteredProducts);
    }
  }, [products, formState.products, productDetails]);

  // Handle Add To Cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    const filteredProducts = productDetails.filter(
      (product) => product.id === selectedProduct.productId
    );
    filteredProducts[0].stock = parseInt(selectedProduct.quantity);
    setFormState((prevState) => ({
      ...prevState,
      categories: [],
    }));

    setCart((prev) => {
      return [...prev, filteredProducts[0]];
    });
    setSelectedProduct({
      productId: "",
      quantity: "",
    });
    setIsOpen(false);
  };

  // Handle Add Variant To Cart
  const handleAddVarientToCart = (e) => {
    e.preventDefault();
    const filteredProducts = productVariantDetails.filter(
      (product) => product.id === selectedProductVariant.productVariantId
    );
    filteredProducts[0].stock = parseInt(selectedProductVariant.quantity);
    filteredProducts[0].images = filteredProducts[0].product.images;
    setFormState((prev) => ({
      ...prev,
      categories: [],
    }));
    setCart((prev) => {
      return [...prev, filteredProducts[0]];
    });
    setSelectedProductVariant({
      productVariantId: "",
      quantity: 1,
    });
    setIsOpen(false);
  };

  // Product Quantity Change
  const handleQuantityChange = (e, value, index) => {
    e.preventDefault();
    setCart((prevCart) =>
      prevCart.map((item, i) =>
        i === index ? { ...item, stock: parseInt(e.target.value) } : item
      )
    );
  };

  // Remove Product
  const removeProduct = (index) => {
    setCart((prevData) => {
      const updatedData = [...prevData];
      updatedData.splice(index, 1);
      return updatedData;
    });
  };

  // Handle Apply Discount
  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    const amount =
      cart.reduce(
        (subTotal, product) => subTotal + product.price * product.stock,
        0
      ) || 0;
    const response = await applyCoupon(amount, discount, token);
    if (response?.message) toast.success(response?.message);
    if (response?.discount) setDiscountDetails(response.discount);
  };

  const handleChange = (name, value) => {
    setFormState((prev)=>(
      {...prev, [name]:value}
    ));
  }

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    formState.cancellationExpiry = new Date(
      new Date().setDate(new Date().getDate() + 2)
    ).toISOString();
    if (discountDetails?.id) {
      
      formState.discountIds.push(discountDetails.id);
    }
    let finalProducts = [];
    let newObject;
    cart.map((product) => {
      if ("productId" in product) {
        newObject = {
          productVariantId: product.id,
          quantity: product.stock,
        };
      }
      if ("ProductVariant" in product) {
        newObject = {
          productId: product.id,
          quantity: product.stock,
        };
      }
      finalProducts.push(newObject);
    });
    formState.products = finalProducts;
    const response = await addOrder(token, formState);
    if (response?.order?.id) {
      toast.success("Added Order Successfully");
      router.push("/admin/order");
    }
  };

  // Calculation UseStates
  const [subTotal, setSubTotal] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [shipphingCharge, setShipphingCharge] = useState(25);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidByCustomer, setPaidByCustomer] = useState(0);
  const [finalBalance, setFinalBalance] = useState(0);

  // Calculate Sub total, discount value, shipping charges
  useEffect(() => {
    const amount =
      cart.reduce(
        (subTotal, product) => subTotal + product.price * product.stock,
        0
      ) || 0;
    setSubTotal(amount);
    if (discountDetails.type === "PERCENTAGE") {
      setDiscountValue((amount * discountDetails.amount) / 100);
    } else if (discountDetails.type === "FIXED") {
      setDiscountValue(discountDetails.amount);
    } else if (discountDetails.type === "SHIPPING_FREE") {
      setDiscountValue(0);
      setShipphingCharge(0);
    }
  }, [cart, discountDetails]);

  const handleNoteChange = (e) => {
    e.preventDefault();
    setFormState((prev) => {
      return { ...prev, customerRemarks: e.target.value };
    });
  };

  // Calcualte Total Amount
  useEffect(() => {
    const totalAmount =
      parseFloat(subTotal) -
      parseFloat(discountValue) +
      parseFloat(shipphingCharge) || 0;
    setTotal(totalAmount);
  }, [subTotal, discountValue, shipphingCharge]);

  // Calculate Paid By Customer amount
  useEffect(() => {
    if (paymentMethod && total) {
      if (paymentMethod === "COD") {
        setPaidByCustomer(0);
        setFinalBalance(total);
      } else {
        setPaidByCustomer(total);
        setFinalBalance(0);
      }
    }
  }, [total, paymentMethod]);
  
  
  const handleBillingChange = (e) => {
    const value = e.target.value;
    if (!value) {
        setFormState({
        ...formState,
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingCountry: '',
        billingZip: ''
        });
        return;
    }
    const data = selectedUser[0].Address[value];
    const billingStreet = data.street;
    const billingCity = data.city;
    const billingState = data.stateOrProvince;
    const billingCountry = data.country;
    const billingZip = data.zip;
    setFormState({
    ...formState,
    billingStreet,
    billingCity,
    billingState,
    billingCountry,
    billingZip,
    });
  };

  if (status === "loading") {
    return <LoadingScreen />;
  }
  
  return (
    <>
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Add Order</h1>
          </div>
          <div className="col-auto d-flex">
            <button
              className="btn btn-primary"
              type="submit"
              onClick={handleSubmit}
            >
              Create Order
            </button>
          </div>
        </div>
      </div>
      <div className="sa-entity-layout sa-entity-layout--size--md" style={{ position: "relative" }} >
        <div className="sa-entity-layout__body">
          <div className="sa-entity-layout__main">
            <div className="card my-5">
              <div className="sa-card-area">
                <textarea
                  className="sa-card-area__area"
                  rows={2}
                  placeholder="Notes about order"
                  value={formState.customerRemarks}
                  onChange={(e) => handleNoteChange(e)}
                />
                <div className="sa-card-area__card">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-edit"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Order Information</h2>
                </div>
                {/* Users Drop-Down */}
                <div className="mb-4">
                  <label
                    htmlFor="form-category/name"
                    className="form-label"
                  >
                    Users <span className="text-danger">*</span>
                  </label>
                  <Select
                    name="users"
                    options={users}
                    onChange={(e) =>
                      handleMultiSelectChange("userId", e.value)
                    }
                  />
                </div>
                <div>
                  Add Product Details:{"  "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(true);
                    }}
                    style={{
                      fontSize: "1.5rem",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            {isOpen && (
              <div
                className="p-5"
                style={{
                  position: "absolute",
                  zIndex: "999",
                  width: "100%",
                  top: "5%",
                  backgroundColor: "white",
                  boxShadow: "1px 1px 10px 1px black",
                  borderRadius: "10px",
                }}
              >
                {/* Pop-up Form Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "item-center",
                  }}
                >
                  <h3>Details:</h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
                    }}
                  >
                    ❌
                  </button>
                </div>
                <hr />
                {/* Pop Up Form Body */}
                <div>
                  {/* Category Drop-Down */}
                  <div className="mb-4">
                    <label
                      htmlFor="form-category/name"
                      className="form-label"
                    >
                      Categories <span className="text-danger">*</span>
                    </label>
                    <Select
                      name="categories"
                      // isMulti
                      options={categories}
                      onChange={(e) =>
                        handleMultiSelectChange(
                          "categories",
                          e ? e.value : null
                          // e.map((option) => option.value)
                        )
                      }
                    />
                  </div>
                  {/* Product Drop-Down */}
                  {formState.categories.length !== 0 && (
                    <div className="mb-4">
                      <label
                        htmlFor="form-category/name"
                        className="form-label"
                      >
                        Product <span className="text-danger">*</span>
                      </label>

                      <Select
                        name="products"
                        // isMulti
                        options={products}
                        // onChange={(e) => {
                        //   const selectedProducts = e
                        //     ? e.map((option) => option.value)
                        //     : [];
                        onChange={(e) => {
                          const selectedProducts = e ? e.value : null;
                          handleProductMuiltiSelectChange(
                            "products",
                            selectedProducts
                          );
                        }}
                      />
                    </div>
                  )}
                  {/* Product Variant Drop-Down */}
                  {formState.categories.length !== 0 &&
                    productVariant.length > 0 && (
                      <div className="mb-4">
                        <label
                          htmlFor="form-category/name"
                          className="form-label"
                        >
                          Product Variant <span className="text-danger">*</span>
                        </label>
                        <Select
                          name="productVariantId"
                          // isMulti
                          options={productVariant}
                          // value={productVariant.filter((product) =>
                          //   formState?.productVariant?.some(
                          //     (productInState) =>
                          //       productInState.productId ===
                          //         product.value ||
                          //       productInState.productVariantId ===
                          //         product.value
                          //   )
                          // )}
                          onChange={(e) => {
                            const selectedProducts = e ? e.value : null;
                            handleProductVariantMuiltiSelectChange(
                              "productVariantId",
                              selectedProducts
                            );
                          }}
                        />
                      </div>
                    )}
                  {formState.categories.length !== 0 &&
                    selectedProduct.productId !== "" && (
                      <div className="mb-4">
                        <label htmlFor="quantity" className="form-label">
                          Quantity
                        </label>
                        <br />
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          min="1"
                          max={quantity}
                          className="form-input"
                          placeholder="1"
                          onChange={(e) => {
                            e.preventDefault();

                            if (
                              selectedProductVariant.productVariantId === ""
                            ) {
                              setSelectedProduct((prevState) => ({
                                ...prevState,
                                quantity: e.target.value,
                              }));
                            } else {
                              setSelectedProductVariant((prevState) => ({
                                ...prevState,
                                quantity: e.target.value,
                              }));
                            }
                          }}
                        />
                      </div>
                    )}
                </div>
                {/* Pop Up Form Footer */}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) =>
                    selectedProductVariant.productVariantId === ""
                      ? handleAddToCart(e)
                      : handleAddVarientToCart(e)
                  }
                >
                  Add to Cart
                </button>
              </div>
            )}

            <div className="card my-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Product Details</h2>
                </div>
              </div>

              <div className="w-full bg-white p-2 rounded-lg shadow-md my-3 ">
                {filteredProductsData && filteredProductsData.length > 0 ? (
                  <table className="w-100 table-auto mb-4  px-5">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left w-[200px]">
                          Image
                        </th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formState.products.length > 0 &&
                        filteredProductsData &&
                        cart.map((data, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">
                              <img
                                src={data?.images.length > 0 ? data.images[0].url : `${process.env.PLACEHOLDER_IMAGE}`}
                                alt="Product"
                                width="80px"
                                height="100px"
                                className="w-[100px] h-auto"
                              />
                            </td>

                            <td className="px-4 py-2">
                              <p>{data.name || data.variantName}</p>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                onChange={(e) =>
                                  handleQuantityChange(e, e.value, index)
                                }
                                min={1}
                                max={data.quantity}
                                value={data.stock}
                                className="w-full"
                              />
                            </td>

                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => removeProduct(index)} // Trigger removeProduct on click
                                className="text-red-500 hover:text-red-700"
                              >
                                <span className="text-xl">❌</span>{" "}
                                {/* Cross icon */}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-600">
                    Please select a{" "}
                    {formState.categories.length > 0
                      ? "products"
                      : "categories"}{" "}
                    in the fields above
                  </p>
                )}
              </div>
            </div>
            {/* Items Card */}
            <div className="card mt-5">
              <div className="card-body px-5 py-4 d-flex align-items-center justify-content-between">
                <h2 className="mb-0 fs-exact-18 me-4">Items</h2>
              </div>
              <div className="table-responsive">
                <table className="sa-table">
                  <tbody>
                    {formState.products.length > 0 &&
                      cart.map((product) => (
                        <tr key={product.id}>
                          <td className="min-w-20x">
                            <div className="d-flex align-items-center">
                              <img
                                src={product?.images.length > 0 ? product.images[0].url : `${process.env.PLACEHOLDER_IMAGE}`}
                                className="me-4"
                                width="90"
                                // height="40"
                                alt={product.name}
                              />
                              <a
                                href="app-product.html"
                                className="text-reset pl-4"
                              >
                                {product.name || product.variantName}
                              </a>
                            </div>
                          </td>
                          <td className="text-end" colSpan="2">
                            <div className="sa-price">
                              <span className="sa-price__symbol">₹</span>
                              <span className="sa-price__integer">
                                {product.price}
                              </span>
                              <span> x </span>
                              <span className="text-end">
                                {product.stock}
                              </span>
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="sa-price">
                              <span className="sa-price__symbol">₹</span>
                              <span className="sa-price__integer">
                                {(product.price * product.stock).toFixed(2)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>

                  <tbody className="sa-table__group">
                    <tr>
                      <td colSpan="3">Subtotal</td>
                      <td className="text-end">
                        <div className="sa-price">
                          <span className="sa-price__symbol">₹</span>
                          <span className="sa-price__integer">
                            {subTotal.toFixed(2) || 0}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3">
                        <span>
                          Apply Discount:{" "}
                          <input
                            type="text"
                            name="discount"
                            onChange={(e) => {
                              e.preventDefault();
                              setDiscount(e.target.value);
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-primary mx-3"
                            onClick={(e) => handleApplyDiscount(e)}
                          >
                            Apply
                          </button>
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="sa-price">
                          <span className="sa-price__symbol">₹</span>
                          <span className="sa-price__integer">
                            {discountValue ? `${discountValue}` : "0"}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3">
                        Shipping
                        <div className="text-muted fs-exact-13">
                          via FedEx International
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="sa-price">
                          <span className="sa-price__symbol">₹</span>
                          <span className="sa-price__integer">
                            {shipphingCharge || 0}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tbody>
                    <tr>
                      <td colSpan="3">Total</td>
                      <td className="text-end">
                        <div className="sa-price">
                          <span className="sa-price__symbol">₹</span>
                          <span className="sa-price__integer">
                            {total.toFixed(2) || 0}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Balance Card */}
            <div className="card my-5">
              <div className="card-body px-5 py-4 d-flex align-items-center justify-content-between">
                <h2 className="mb-0 fs-exact-18 me-4">Balance</h2>
              </div>
              <table className="sa-table">
                <tbody className="sa-table__group">
                  <tr>
                    <td>Grand Total</td>
                    <td className="text-end">
                      <div className="sa-price">
                        <span className="sa-price__symbol">₹</span>
                        <span className="sa-price__integer">
                          {total.toFixed(2) || 0}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* <tr>
                    <td>Return Total</td>
                    <td className="text-end">
                      <div className="sa-price">
                        <span className="sa-price__symbol">₹</span>
                        <span className="sa-price__integer">0</span>
                      </div>
                    </td>
                  </tr> */}
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      Payment Method
                      <div>
                        <label>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="COD"
                            onChange={(e) =>
                              setPaymentMethod(e.target.value)
                            }
                          />{" "}
                          COD
                        </label>
                        <label style={{ marginLeft: "10px" }}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="ONLINE"
                            onChange={(e) =>
                              setPaymentMethod(e.target.value)
                            }
                          />{" "}
                          Pay Online
                        </label>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody className="sa-table__group">
                  <tr>
                    <td>Paid by customer</td>
                    <td className="text-end">
                      <div className="sa-price">
                        <span className="sa-price__symbol">₹</span>
                        <span className="sa-price__integer">
                          {paidByCustomer.toFixed(2) || 0}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody>
                  <tr>
                    <td>
                      Balance{" "}
                      <span className="text-muted">
                        (customer owes you)
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="sa-price">
                        <span className="sa-price__symbol">₹</span>
                        <span className="sa-price__integer">
                          {finalBalance.toFixed(2) || 0}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Customer Details */}
          {selectedUser && selectedUser.length > 0 && (
            <div className="sa-entity-layout__sidebar">
              <div className="card">
                <div className="card-body d-flex align-items-center justify-content-between pb-0 pt-4">
                  <h2 className="fs-exact-16 mb-0">Customer</h2>
                </div>
                <div className="card-body pt-4 fs-exact-14">
                  <div className="card-body d-flex align-items-center pt-4 px-0">
                    <div className="sa-symbol sa-symbol--shape--circle sa-symbol--size--lg">
                      <img
                        src="https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid"
                        width="40"
                        height="40"
                        alt=""
                      />
                    </div>
                    <div className="ms-3 ps-2">
                      <div className="fs-exact-14 fw-medium">
                        {selectedUser[0]?.name}
                      </div>
                      <div className="fs-exact-13 text-muted">
                        This is a first order
                      </div>
                    </div>
                  </div>
                  <div>{selectedUser[0]?.name}</div>
                  <div className="mt-1">
                    <a href="#">{selectedUser[0]?.email}</a>
                  </div>
                  <div className="text-muted mt-1">
                    {selectedUser[0]?.phone}
                  </div>
                </div>
              </div>
              <div className="card mt-5">
                <div className="card-body d-flex align-items-center justify-content-between pb-0 pt-4">
                  <h2 className="fs-exact-16 mb-0">User Address </h2>
                </div>
                  <div className="card-body pt-4 fs-exact-14">
                    <div className="single-input-item">
                        <label htmlFor="shipping" className="form-label">Select Address</label>
                        <select className="address-form-select" onChange={handleBillingChange}>
                            <option id="shipping" value="">Enter Address Manualy</option>
                            {selectedUser[0].Address.map((item,i)=>(
                                <option key={`address-${i}`} value={i}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="address-form">
                        {[
                          { label: "Street", name: "billingStreet" },
                          { label: "City", name: "billingCity" },
                          { label: "State/Province", name: "billingState" },
                          { label: "ZIP Code", name: "billingZip" },
                          { label: "Country", name: "billingCountry" },
                        ].map(({ label, name }) => (
                            <div key={name} className="address-form-field">
                              <input
                              className="form-control mt-4"
                                type="text"
                                id={name}
                                name={name}
                                value={formState[name]}
                                onChange={(e)=>handleChange(name, e.target.value)}
                                placeholder={label}
                                required
                              />
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
