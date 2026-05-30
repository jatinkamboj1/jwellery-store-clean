"use client";
import { addItemToCart } from "@/app/api/cart";
import {
  fetchProductBySlug,
  fetchRelativeProducts,
  fetchReviewByProductId,
} from "@/app/api/products";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import ProductCard from "@/components/ProductCard/productCard";
import Slider from "@/components/Slider/slider";
import WishlistButton from "@/components/WishlistButton/WishlistButton";
import "@/styles/productCard.scss";
import "@/styles/products.scss";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCamera, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { createReview } from "@/app/api/review";
import { convertS3UrlToLocalPath } from "@/utils/util";

export default function Product() {
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [product, setProduct] = useState({});
  const [productField, setProductField] = useState({
    name: null,
    description: null,
    shortDescription: null,
    discountedPrice: null,
    price: null,
    quantity: null,
    sku: null,
    images: [],
  });
  const [formData, setFormData] = useState({
    slug: id,
    review: "",
    rating: 1,
    images: [],
  });
  const [pageDetails, setPageDetails] = useState({
    offset: 0,
    limit: 5,
    currentPage: 1,
    totalPages: 1,
    total: 1,
  });
  const [reviews, setReviews] = useState([]);

  const [orderField, setOrderField] = useState({
    productId: null,
    productVarientId: null,
    quantity: 1,
  });
  const [products, setProducts] = useState([]);

  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const role = session?.user?.role;

  const handleAddToCart = async () => {
    if (status === "authenticated" && token) {
      const response = await addItemToCart(
        token,
        orderField.productId,
        orderField.productVarientId,
        orderField.quantity
      );
      //console.log("response: ", response);
      // toast.info(response.message);
      toast.success(response.message);
    } else {
      toast.error("Please login to buy products");
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductData();
      fetchProducts();
    }
  }, [id]);

  const handleQty = (type) => {
    let quantity = orderField.quantity;
    if (type === "inc") {
      quantity += 1;
    } else {
      quantity -= 1;
    }
    if (quantity > 0 && quantity <= productField.quantity) {
      setOrderField((prev) => ({ ...prev, quantity }));
    }
  };

  const handleVarient = (item) => {
    const data = {};
    const data2 = {};
    if (item.variantName) {
      data.name = item.variantName;
    }
    if (item.discountedPrice) {
      data.discountedPrice = item.discountedPrice;
    } else {
      data.discountedPrice = null;
    }
    if (item.price) {
      data.price = item.price;
    }
    if (item.id) {
      data.productVarientId = item.id;
      setOrderField((prev) => ({ ...prev, productVarientId: item.id }));
    }

    if (item.description) {
      data2.description = item.description;
    }
    if (item.shortDescription) {
      data2.shortDescription = item.shortDescription;
    }
    if (item.quantity) {
      data2.quantity = item.quantity;
    }
    if (item.ccDistance) {
      data2.ccDistance = item.ccDistance;
    }
    if (item.mechanism) {
      data2.mechanism = item.mechanism;
    }
    if (item.installationToCabinet) {
      data2.installationToCabinet = item.installationToCabinet;
    }
    if (item.diameter) {
      data2.diameter = item.diameter;
    }
    if (item.magnet) {
      data2.magnet = item.magnet;
    }
    if (item.material) {
      data2.material = item.material;
    }
    if (item.cataloguePage) {
      data2.cataloguePage = item.cataloguePage;
    }
    if (item.surfaceFinishing) {
      data2.surfaceFinishing = item.surfaceFinishing;
    }
    if (item.boardThickness) {
      data2.boardThickness = item.boardThickness;
    }
    if (item.quantityInBox) {
      data2.quantityInBox = item.quantityInBox;
    }
    if (item.slidesThickness) {
      data2.slidesThickness = item.slidesThickness;
    }
    if (item.brackets) {
      data2.brackets = item.brackets;
    }
    if (item.model) {
      data2.model = item.model;
    }
    if (item.fixingType) {
      data2.fixingType = item.fixingType;
    }
    if (item.colour) {
      data2.colour = item.colour;
    }
    if (item.loadingCapacity) {
      data2.loadingCapacity = item.loadingCapacity;
    }
    if (item.length) {
      data2.length = item.length;
    }
    if (item.doorPosition) {
      data2.doorPosition = item.doorPosition;
    }
    if (item.staticLoadingCapacity) {
      data2.staticLoadingCapacity = item.staticLoadingCapacity;
    }
    if (item.synchronisation) {
      data2.synchronisation = item.synchronisation;
    }
    if (item.softClose) {
      data2.softClose = item.softClose;
    }
    if (item.pushForOpen) {
      data2.pushForOpen = item.pushForOpen;
    }
    if (item.setWithMountingPlate) {
      data2.setWithMountingPlate = item.setWithMountingPlate;
    }
    if (item.lengthOfEjection) {
      data2.lengthOfEjection = item.lengthOfEjection;
    }
    if (item.typeOfTread) {
      data2.typeOfTread = item.typeOfTread;
    }
    if (item.heightAdjustment) {
      data2.heightAdjustment = item.heightAdjustment;
    }
    if (item.height) {
      data2.height = item.height;
    }
    setProductField((prev) => ({ ...prev, ...data, ...data2 }));

    if (item.quantity > 1 && orderField.quantity > item.quantity) {
      setOrderField((prev) => ({ ...prev, quantity: item.quantity }));
    }
  };

  const fetchAllReviewByProductId = async (page = -1) => {
    try {
      const response = await fetchReviewByProductId(
        id,
        pageDetails.offset,
        pageDetails.limit
      );
      if (response) {
        setReviews(response.reviews);
        setPageDetails(response.pageDetails);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (id) {
      fetchAllReviewByProductId(pageDetails.currentPage);
    }
  }, [id, pageDetails.currentPage]);

  const fetchProducts = async () => {
    try {
      const response = await fetchRelativeProducts(0, 10, id);
      if (response?.data?.products) {
        const product = response?.data?.products;
        setProducts(product);
      }
    } catch (error) {}
  };

  const fetchProductData = async () => {
    try {
      const response = await fetchProductBySlug(id);
      if (response?.data) {
        const product = response.data;
        setProduct(product);
        const {
          id,
          images,
          name,
          description,
          shortDescription,
          discountedPrice,
          price,
          quantity,
          sku,
          ProductVariant,
          ccDistance,
          mechanism,
          installationToCabinet,
          diameter,
          magnet,
          material,
          cataloguePage,
          surfaceFinishing,
          boardThickness,
          quantityInBox,
          slidesThickness,
          brackets,
          model,
          fixingType,
          colour,
          loadingCapacity,
          length,
          doorPosition,
          staticLoadingCapacity,
          synchronisation,
          softClose,
          pushForOpen,
          setWithMountingPlate,
          lengthOfEjection,
          typeOfTread,
          heightAdjustment,
          height,
        } = product;
        setProductField({
          id,
          images,
          name,
          description,
          shortDescription,
          discountedPrice,
          price,
          quantity,
          sku,
          ccDistance,
          mechanism,
          installationToCabinet,
          diameter,
          magnet,
          material,
          cataloguePage,
          surfaceFinishing,
          boardThickness,
          quantityInBox,
          slidesThickness,
          brackets,
          model,
          fixingType,
          colour,
          loadingCapacity,
          length,
          doorPosition,
          staticLoadingCapacity,
          synchronisation,
          softClose,
          pushForOpen,
          setWithMountingPlate,
          lengthOfEjection,
          typeOfTread,
          heightAdjustment,
          height,
        });
        setOrderField({ productId: id, quantity: 1 });

        if (ProductVariant.length > 0) {
          setTimeout(() => {
            handleVarient(ProductVariant[0]);
          }, 100);
        }
      }
    } catch (error) {}
  };

  if (!product?.name) {
    return <LoadingScreen />;
  }

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (!files.length) return;
    if (files.length > 2) {
      toast.error("Cannot add more than two images.");
    }

    const newImages = [...formData.images];
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          id: Date.now() + index,
          base64: e.target.result,
          alt: "",
          order: newImages.length + 1,
        });

        setFormData((prev) => ({
          ...prev,
          images: newImages,
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRating = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await createReview(token, formData);
    // toast.info(response.message);
    toast.success(response.message);
    fetchProductData();
    setFormData({ ...formData, review: "", rating: 1, images: [] });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pageDetails.totalPages) return;

    setPageDetails((prev) => ({
      ...prev,
      currentPage: newPage,
      offset: (newPage - 1) * prev.limit, // ✅ Correct offset calculation
    }));
  };

    return (
        <>
            <div className="shop-main-wrapper section-padding pb-0">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 order-1 order-lg-2">
                            <div className="product-details-inner">
                                <div className="row">
                                    <div className="col-lg-5">
                                        <Slider arrows={true}>
                                            {productField.images.map((image, index) => (
                                                <div key={`product_slide-${index}`} className="pro-large-img img-zoom">
                                                    <img src={convertS3UrlToLocalPath(image.url)} alt={`${image?.description ?? product.name}`} />
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>
                                    <div className="col-lg-7">
                                        <div className="product-details-des">
                                            <div className="manufacturer-name">
                                                <span>{product.brandName}</span>
                                              <div className="useful-links">
  {role !== "ADMIN" && (
    <WishlistButton id={product.id} token={token} />
  )}
</div>
                                            </div>
                                            <h1 className="product-name">{productField.name}</h1>
                                            <div className="ratings d-flex">
                                                {/* <span><i className="fa fa-star-o"></i></span>
                                                <span><i className="fa fa-star-o"></i></span>
                                                <span><i className="fa fa-star-o"></i></span>
                                                <span><i className="fa fa-star-o"></i></span>
                                                <span><i className="fa fa-star-o"></i></span> */}
                        {[1, 2, 3, 4, 5].map((value, index) =>
                          value <=
                          Math.floor(product.averageRating._count.rating) ? (
                            <FaStar key={index} size={18} color="#ffc107" />
                          ) : value ===
                              Math.ceil(product.averageRating._count.rating) &&
                            product.averageRating._count.rating % 1 !== 0 ? (
                            <FaStarHalfAlt
                              key={index}
                              size={18}
                              color="#ffc107"
                            />
                          ) : (
                            <FaStar key={index} size={18} color="#e4e5e9" />
                          )
                        )}
                        <div className="pro-review">
                          <span>
                            {product.averageRating._count.rating} Reviews
                          </span>
                        </div>
                      </div>
                      <div className="price-box">
                        {productField.discountedPrice ? (
                          <>
                            <span className="price-regular">
                              £{productField.discountedPrice.toFixed(2)}
                            </span>
                            <span className="price-old">
                              <del>£{productField.price.toFixed(2)}</del>
                            </span>
                          </>
                        ) : (
                          <span className="price-regular">
                            £{productField.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="availability">
                        <i className="fa fa-check-circle"></i>
                        <span>{productField.quantity} in stock</span>
                      </div>
                      {product?.shortDescription && (
                        <p
                          className="pro-desc"
                          dangerouslySetInnerHTML={{
                            __html: productField.shortDescription,
                          }}
                        />
                      )}
                      <div className="quantity-cart-box d-flex align-items-center">
                        <h6 className="option-title">qty:</h6>
                        <div className="quantity">
                          <div className="pro-qty d-flex ">
                            <button
                              className="qtybtn"
                              onClick={() => handleQty("dec")}
                            >
                              -
                            </button>
                            <input type="text" value={orderField.quantity} />
                            <button
                              className="qtybtn"
                              onClick={() => handleQty("inc")}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="action_link">
                          <button
                            className="btn btn-cart2"
                            onClick={handleAddToCart}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                      {Object.entries(product.groupedVariantsObj).map(
                        ([section, items]) => (
                          <div
                            key={`varient-${section}`}
                            className={
                              section === "color" ? "color-option" : "pro-size"
                            }
                          >
                            <h6 className="option-title">{section} :</h6>
                            {section === "color" ? (
                              <ul className="color-categories">
                                {items.map((item) => (
                                  <li
                                    key={item.variantName}
                                    className={
                                      item.id === orderField.productVarientId
                                        ? "active"
                                        : ""
                                    }
                                  >
                                    <span
                                      onClick={() => handleVarient(item)}
                                      className="color-val"
                                      style={{ background: item.value }}
                                    ></span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <select className="nice-select">
                                {items.map((item) => (
                                  <option
                                    key={item.variantName}
                                    onChange={() => handleVarient(item)}
                                    selected={
                                      item.id === orderField.productVarientId
                                    }
                                    value={item.value}
                                  >
                                    {item.variantName}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )
                      )}
                      <div className="dropdown-wrapper">
                        <div className="dropdown-head">
                          <span className="offer-text">
                            <strong>Product Description</strong>
                          </span>
                          <span>
                            <i className="fa fa-plus"></i>
                          </span>
                        </div>
                        <div className="dropdown-content">
                          <div
                            className="tab-one"
                            dangerouslySetInnerHTML={{
                              __html: productField.description,
                            }}
                          />
                          <table className="table table-bordered product-desc-table">
                            <tbody>
                              {product.brandName && (
                                <tr>
                                  <td>
                                    <b>Brand Name</b>
                                  </td>
                                  <td>{product.brandName}</td>
                                </tr>
                              )}

                              <table className="table table-bordered product-desc-table">
                                <tbody>
                                  {product.metalType.length > 0 && (
                                    <tr>
                                      <td>
                                        <b>Metal</b>
                                      </td>
                                      <td>
                                        {product.metalType.map(
                                          (metal) => `${metal}, `
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                  {product.polishType.length > 0 && (
                                    <tr>
                                      <td>
                                        <b>Polish</b>
                                      </td>
                                      <td>
                                        {product.polishType.map(
                                          (polish) => `${polish}, `
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                  {product.stoneType.length > 0 && (
                                    <tr>
                                      <td>
                                        <b>Stone</b>
                                      </td>
                                      <td>
                                        {product.stoneType.map(
                                          (stone) => `${stone}, `
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                  {product.occasionType.length > 0 && (
                                    <tr>
                                      <td>
                                        <b>Occasion</b>
                                      </td>
                                      <td>
                                        {product.occasionType.map(
                                          (occasion) => `${occasion}, `
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                  {product.collectionType.length > 0 && (
                                    <tr>
                                      <td>
                                        <b>Collection</b>
                                      </td>
                                      <td>
                                        {product.collectionType.map(
                                          (collection) => `${collection}, `
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </tbody>
                          </table>
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
      {products.length > 0 && (
        <section className="related-products section-padding">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="section-title text-center">
                  <h2 className="title">Related Products</h2>
                  <p className="sub-title">
                    Add related products to weekly lineup
                  </p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <Slider slides="product-carousel-4" arrows={true}>
                  {products &&
                    products.map((product, index) => (
                      <ProductCard product={product} key={`pro-${index}`} />
                    ))}
                </Slider>
              </div>
            </div>
          </div>
        </section>
      )}
      <section className="related-products reviews-tab section-padding">
        <div className="container">
          {/* Section Title */}
          <div className="row">
            <div className="col-12 text-center">
              <div className="section-title">
                <h2 className="title">Customer Reviews</h2>
                <p className="sub-title">Add Review</p>
              </div>
            </div>
          </div>

          {/* Reviews & Form */}
          <div className="row">
            {/* Review List */}
            <div className={token ? "col-lg-6 col-md-12" : "col-12"}>
              <h5>
                {product.averageRating._count.rating} Reviews for{" "}
                <span>{product.name}</span>
              </h5>

              
              {reviews.map((review, index) => (
                <div
                  className="total-reviews d-flex align-items-start mb-4"
                  key={index}
                >
                  <div className="rev-avatar me-3">
                    <img
                      src="/assets/Avtar.png"
                      alt="User Avatar"
                      className="rounded-circle img-fluid"
                      width={50}
                    />
                  </div>
                  <div className="review-box">
                    {/* Star Ratings */}
                    <div className="ratings mb-1">
                      {[1, 2, 3, 4, 5].map((value) =>
                        value <= Math.floor(review.rating) ? (
                          <FaStar key={value} size={18} color="#ffc107" />
                        ) : value === Math.ceil(review.rating) &&
                          review.rating % 1 !== 0 ? (
                          <FaStarHalfAlt
                            key={value}
                            size={18}
                            color="#ffc107"
                          />
                        ) : (
                          <FaStar key={value} size={18} color="#e4e5e9" />
                        )
                      )}
                    </div>
                    {/* Author & Date */}
                    <div className="post-author">
                      <p>
                        <strong>{review.user.name}</strong> •{" "}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="row g-3">
                      {review.images &&
                        review.images.map((img, index) => (
                          <div key={index} className="col-6 col-md-4 col-lg-3">
                            <img
                              src={convertS3UrlToLocalPath(img.url)}
                              alt={`Uploaded ${index}`}
                              className="img-fluid border rounded"
                            />
                          </div>
                        ))}
                    </div>

                    {/* Review Text */}
                    <p>{review.review}</p>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div className="sa-datatables__footer ">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="sa-datatables__pagination ">
                    <div className="dataTables_paginate paging_simple_numbers">
                      <ul className="pagination pagination-sm">
                        {/* Previous Button */}
                        <li
                          className={`paginate_button page-item previous ${
                            pageDetails.currentPage === 1 ? "disabled" : ""
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
                              className={`paginate_button page-item ${
                                pageDetails.currentPage === index + 1
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
                          className={`paginate_button page-item next ${
                            pageDetails.currentPage === pageDetails.totalPages
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
                        className="dataTables_info "
                        role="status"
                        aria-live="polite"
                      >
                        {`Showing ${
                          parseInt(pageDetails.offset) + 1
                        } to ${Math.min(
                          parseInt(pageDetails.offset) +
                            parseInt(pageDetails.limit),
                          parseInt(pageDetails.total)
                        )} of ${parseInt(pageDetails.total)}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            {token && (
              <div className="col-lg-6 col-md-12 mt-4 mt-lg-0">
                <form className="review-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>
                      <span className="text-danger">*</span> Your Review
                    </label>
                    <textarea
                      className="form-control"
                      name="review"
                      value={formData.review}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="text-danger">*</span> Rating
                    </label>
                    <div>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <FaStar
                          key={value}
                          size={24}
                          onClick={() => handleRating(value)}
                          color={
                            value <= formData.rating ? "#ffc107" : "#e4e5e9"
                          }
                          style={{ cursor: "pointer", marginRight: 5 }}
                        />
                      ))}
                    </div>
                    <div className="my-2">
                      <div>
                        <label>Image:</label>
                      </div>
                      <br />
                      <div className="row g-3">
                        {formData.images.length > 0 &&
                          formData.images.map((img, index) => (
                            <div
                              key={index}
                              className="col-6 col-md-4 col-lg-3"
                            >
                              <img
                                src={convertS3UrlToLocalPath(img.base64)}
                                alt={`Uploaded ${index}`}
                                className="img-fluid border rounded"
                              />
                            </div>
                          ))}
                      </div>
                      <button
                        type="button"
                        className="border px-3 py-2 h4"
                        onClick={handleButtonClick}
                      >
                        <FaCamera />
                      </button>
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        className="invisible"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <button
                    className="btn bg-primary text-light w-100 p-2"
                    type="submit"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
