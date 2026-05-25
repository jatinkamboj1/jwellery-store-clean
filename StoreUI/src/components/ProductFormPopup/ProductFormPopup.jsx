"use client";
import { useState } from "react";

export default function ProductFormPopup({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    description: "",
    shortDescription: "",
    variantName: "",
    keywords: "",
    sku: "",
    price: 0.0,
    quantity: 0,
    salableQuantity: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  return (
    <div className="card mt-5">
      <div className="card-body p-5">
        {/* <h2 className="mb-0 fs-exact-18">Add Product</h2> */}
        <form className="mt-5">
          <div className="card">
            <div className="card-body p-5">
              <div className="mb-5">
                <h2 className="mb-0 fs-exact-18">Product Varient</h2>
              </div>
              <div className="row g-4">
                <div className="col">
                  <label
                    htmlFor="form-product/description"
                    className="form-label"
                  >
                    description
                  </label>
                  <input
                    type="string"
                    className="form-control"
                    id="form-product/description"
                    name="description"
                    // value={formState.price}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label
                    htmlFor="form-product/shortDescription"
                    className="form-label"
                  >
                    shortDescription
                  </label>
                  <input
                    type="string"
                    className="form-control"
                    id="form-product/shortDescription"
                    name="shortDescription"
                    // value={formState.discountedPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row g-4">
                <div className="col">
                  <label
                    htmlFor="form-product/variantName"
                    className="form-label"
                  >
                    variantName{" "}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="form-product/variantName"
                    name="variantName"
                    // value={formState.quantity}
                    onChange={handleChange}
                  />
                </div>

                <div className="col">
                  <label htmlFor="form-product/Sku" className="form-label">
                    sku
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="form-product/Sku"
                    name="Sku"
                    // value={formState.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row g-4">
                <div className="col">
                  <label htmlFor="form-product/price" className="form-label">
                    price
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="form-product-price"
                    name="price"
                    step="0.01" // Allows decimal values (e.g., 10.50)
                    min="0" // Ensures non-negative values
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label htmlFor="form-product/Keywords" className="form-label">
                    Keywords
                  </label>
                  <input
                    type="string"
                    className="form-control"
                    id="form-product/Keywords"
                    name="Keywords"
                    // value={formState.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row g-4">
                <div className="col">
                  <label htmlFor="form-product/quantity" className="form-label">
                    quantity
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="form-product/quantity"
                    name="quantity"
                    // value={formState.sku}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label
                    htmlFor="form-product/salableQuantity"
                    className="form-label"
                  >
                    salableQuantity
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="form-product/salableQuantity"
                    name="salableQuantity"
                    // value={formState.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
