"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
// Dynamically import ReactQuill to ensure it's only loaded on the client side
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import { XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import Popup from "reactjs-popup";
import { addProduct } from "@/app/api/products";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { addTags, fetchTags } from "@/app/api/tags";
import { toast } from "react-hot-toast";
import { LogoutUser } from "@/utils/auth";

const Page = () => {
  const visible_on = [
    {
      label: "Homepage",
      value: "HOMEPAGE",
    },
    {
      label: "Crosspage",
      value: "CROSSPAGE",
    },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editVariantIndex, setEditVariantIndex] = useState();
  const router = useRouter();
  // const [tags, setTags] = useState([]);

  const [tags, setTags] = useState({
    name: "",
    isCategory: false,
    isMetal: false,
    isPolish: false,
    isStone: false,
    isOccasion: false,
    isCollection: false,
  });

  const [formState, setFormState] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    shortDescription: "",
    quantity: 0,
    price: 0,
    discountedPrice: null,
    categoryId: [],
    tags: [],
    visibility: false,
    metaTitle: "",
    metaDescription: "",
    visible_on: "",
    metalType: [],
    polishType: [],
    stoneType: [],
    occasionType: [],
    collectionType: [],

    // keywords: "",
    images: [],
    productVariants: [
      {
        variantName: "",
        description: "",
        shortDescription: "",
        sku: "",
        price: 0,
        quantity: 0,
        salableQuantity: 0,
        keywords: "",
        attributes: [{ name: "", value: "" }],
        images: [],
      },
    ],
  });

  const [popupFormState, setPopupFormState] = useState({
    productVariants: [
      {
        description: "",
        shortDescription: "",
        variantName: "",
        sku: "",
        price: "",
        quantity: "",
        attributes: [{ name: "", value: "" }],
        images: [],
      },
    ],
  });

  const [variantType, setvariantType] = useState("");
  const [variantTypes, setVariantTypes] = useState([]);
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const [submittedVariants, setSubmittedVariants] = useState([]);
  const [tag, setTag] = useState([]);
  const [metal, setMetal] = useState([]);
  const [polish, setPolish] = useState([]);
  const [occasion, setOccasion] = useState([]);
  const [collection, setCollection] = useState([]);
  const [stone, setStone] = useState([]);

  const variantTypeChange = (e) => {
    e.preventDefault();
    setvariantType(e.target.value);

    // //console.log(e.target.value);
  };
  const savePopupData = () => {
    setFormState((prev) => {
      const updatedState = {
        ...prev,
        productVariants: submittedVariants,
      };

      // //console.log("Updated Form State:", updatedState);
      return updatedState;
    });
  };

  useEffect(() => {
    fetchCategories();
    if (token) getTags();
  }, [token]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.SERVER_URL}/category/names`
      );
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

  const getTags = async () => {
    try {
      const response = await fetchTags(token);

      if (response?.length) {
        const filteredTags = response.filter(
          (item) =>
            !item.isCategory &&
            !item.isMetal &&
            !item.isPolish &&
            !item.isStone &&
            !item.isOccasion &&
            !item.isCollection
        );

        setTag(filteredTags);
        setMetal(response.filter((item) => item.isMetal));
        setPolish(response.filter((item) => item.isPolish));
        setOccasion(response.filter((item) => item.isOccasion));
        setCollection(response.filter((item) => item.isCollection));
        setStone(response.filter((item) => item.isStone));
      }
      // setTags(formattedTags);
    } catch (error) {
      // console.error(
      //   "Error fetching tags :",
      //   error.response?.data || error.message
      // );
    }
  };

  const fetchVariantTypes = async () => {
    try {
      const response = await axios.get(
        `${process.env.SERVER_URL}/product/varient-types`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVariantTypes(response.data.variants);
    } catch (error) {
      // console.error(
      //   "Error fetching variant types:",
      //   error.response?.data || error.message
      // );
    }
  };
  useEffect(() => {
    if (token) fetchVariantTypes();
  }, [token]);

  const handleMultiSelectChange = (name, val) => {
    // //console.log('name, val: ', name, val);
    // Ensure val is an array of objects
    if (!Array.isArray(val)) {
      val = [];
    }

    setFormState((prevState) => ({
      ...prevState,
      [name]: val,
    }));
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "slug") {
      const regex = /^[a-z0-9\-]*$/;
      if (!regex.test(value)) {
        toast.error("Invalid slug.");
        return;
      }
    }

    setFormState((prevState) => ({
      ...prevState,
      [name]: name === "visibility" ? value === "true" : value,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setPopupFormState((prevState) => {
      const updatedVariants = [...prevState.productVariants];
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };
      return { ...prevState, productVariants: updatedVariants };
    });
  };

  const handleAttributeChange = (variantIndex, attrIndex, event) => {
    const { name, value } = event.target;
    setPopupFormState((prevState) => {
      const updatedVariants = [...prevState.productVariants];
      updatedVariants[variantIndex].attributes[attrIndex] = {
        ...updatedVariants[variantIndex].attributes[attrIndex],
        [name]: value,
      };
      return { ...prevState, productVariants: updatedVariants };
    });
  };

  const handleQuillChange = (name, value) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const newImages = [...formState.images];

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          id: Date.now() + index,
          base64: e.target.result, // Base64 image preview
          alt: "",
          order: newImages.length + 1,
        });

        setFormState((prev) => ({
          ...prev,
          images: newImages,
        }));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImagesChange = (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const newImages = [...popupFormState.productVariants[0].images];

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          id: Date.now() + index,
          base64: e.target.result, // Base64 image preview
          alt: "",
          order: newImages.length + 1,
        });
        setPopupFormState((prev) => ({
            productVariants: [{...popupFormState.productVariants[0], images: newImages}],
        }));
      };

      reader.readAsDataURL(file);
    });
  };
  // Handle Alt Text Change
  const handleAltChange = (id, value) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === id ? { ...img, alt: value } : img
      ),
    }));
  };

  const handleVariantAltChange = (id, value) => {
    setPopupFormState((prev) => ({
      ...prev,
      productVariants: prev.productVariants.map((variant, index) =>
        index === 0
          ? {
              ...variant,
              images: variant.images.map((img) =>
                img.id === id ? { ...img, alt: value } : img
              ),
            }
          : variant
      ),
    }));
  };
  // Handle Order Change
  const handleOrderChange = (id, value) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === id ? { ...img, order: Number(value) } : img
      ),
    }));
  };

  const handleVariantOrderChange = (id, value) => {
    setPopupFormState((prev) => ({
      ...prev,
      productVariants: prev.productVariants.map((variant, index) =>
        index === 0
          ? {
              ...variant,
              images: variant.images.map((img) =>
                img.id === id ? { ...img, order: Number(value) } : img
              ),
            }
          : variant
      ),
    }));
  };
  // Remove Image
  const handleRemoveImage = (id) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const handleVariantRemoveImage = (id) => {
    setPopupFormState((prev) => ({
      ...prev,
      productVariants: prev.productVariants.map((variant, index) =>
        index === 0
          ? {
              ...variant,
              images: variant.images.filter((img) => img.id !== id),
            }
          : variant
      ),
    }));
  };
  const handleVariantSubmit = async (e, close) => {
    e.preventDefault();
    // //console.log("Submitting Variant Type:", variantType);
    const type = variantType;
    if (!type.trim()) {
      toast.error("Variant Type Name is required!");
      return;
    }

    try {
      // //console.log(process.env.SERVER_URL);
      const response = await axios.post(
        `${process.env.SERVER_URL}/product/varient-types`,
        { name: type },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        fetchVariantTypes();

        close();
        toast.success("Variant Type added successfully!");
      }
    } catch (error) {
      // console.error(
      //   "Error adding variant type:",
      //   error.response?.data || error.message
      // );
      toast.error("Failed to add Variant Type.");
    }
  };

  useEffect(() => {
    // //console.log("formState: ", formState);
  }, [formState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formState.name === "" ||
      formState.slug === "" ||
      formState.price === "" ||
      formState.quantity === "" ||
      formState.sku === "" ||
      formState.visibility === ""
    ) {
      toast.error("All fields are required");
      return false;
    }
    // //console.log("Popup Form State before saving:", formState);

    try {
      const token = session?.user?.token;

      if (!token) {
        // console.error("Authentication required");
        LogoutUser();
        return;
      }

      const result = await addProduct(formState, token);
      // //console.log(result);
      if (result) {
        toast.success("Product Added Successfully");

        setTimeout(() => {
          router.push("/admin/product");
        }, 2000);
      }
    } catch (error) {
      // console.error("Error submitting form:", error);
      toast.error("Unable adding product.");
    }
  };

  const fileInputRef = useRef(null);
  const fileInputRef1 = useRef(null);
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  const handleVariantButtonClick = () => {
    fileInputRef1.current.click();
  };

  // const [tag, setTag] = useState(""); // State for Tag Name
  const [isCategory, setIsCategory] = useState(false); // State for Checkbox

  const handleSubmitTags = async (e, close) => {
    e.preventDefault();

    // Prepare data

    const response = await addTags(tags, token);
    getTags();
    setTags({
      name: "",
      isCategory: false,
      isMetal: false,
      isPolish: false,
      isStone: false,
      isOccasion: false,
      isCollection: false,
    });

    // Reset form fields after submission
    setIsCategory(false);

    // Close popup after saving
    close();
  };

  const handleVarientSave = (e) => {
    e.preventDefault();
    setSubmittedVariants((prev) => {
      return [...prev, ...popupFormState.productVariants];
    });

    setPopupFormState({
      productVariants: [
        {
          description: "",
          shortDescription: "",
          variantName: "",
          sku: "",
          price: "",
          quantity: "",
          images: [],
          attributes: [{ name: "", value: "" }],
        },
      ],
    });
  };
  useEffect(() => {
    savePopupData();
  }, [submittedVariants]);

  const editVariantData = (e) => {
    e.preventDefault();
    setSubmittedVariants((prev) => {
      const updatedVariants = [...prev];
      updatedVariants[editVariantIndex - 1] = popupFormState.productVariants[0];
      return updatedVariants;
    });
    setEditVariantIndex();
    setPopupFormState({
      productVariants: [
        {
          description: "",
          shortDescription: "",
          variantName: "",
          sku: "",
          price: "",
          quantity: "",
          images: [],
          attributes: [{ name: "", value: "" }],
        },
      ],
    });
    setIsOpen(false);
  };

  const handleOpenVariantForm = (e, variant, i) => {
    e.preventDefault();
    setIsOpen(true);
    setPopupFormState((prevState) => ({
      ...prevState,
      productVariants: [variant],
    }));
    setEditVariantIndex(i);
  };
  const handleInputTags = (e, tag) => {
    e.preventDefault();
    const { name, value } = e.target;

    // //console.log("name, value: ", name, value, tag);

    setTags((prevTags) => ({
      ...prevTags,
      name: value,
      [name]: name === tag ? true : value,
    }));
  };

  return (
    <>
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Add Product</h1>
          </div>

          <div className="col-auto d-flex">
            <button
              className="btn btn-primary"
              type="submit"
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <div className="sa-entity-layout sa-entity-layout--size--md">
        <div className="sa-entity-layout__body">
          <div className="sa-entity-layout__main">
            <div className="card">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Basic information</h2>
                </div>
                <div className="mb-4">
                  <label htmlFor="form-category/name" className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="form-category/name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="form-category/slug" className="form-label">
                    Slug <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group--sa-slug">
                    <span
                      className="input-group-text"
                      id="form-category/slug-addon"
                    >
                      /product/
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="form-category/slug"
                      name="slug"
                      value={formState.slug}
                      onChange={handleChange}
                    />
                  </div>
                  <div id="form-category/slug-help" className="form-text">
                    Unique human-readable category identifier. No longer than
                    255 characters.
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="form-category/description"
                    className="form-label"
                  >
                    Description
                  </label>

                  <ReactQuill
                    id="form-category/description"
                    theme="snow"
                    value={formState.description}
                    onChange={(value) =>
                      handleQuillChange("description", value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="form-product/short-description"
                    className="form-label"
                  >
                    Short description
                  </label>

                  <ReactQuill
                    id="form-category/shortDescription"
                    theme="snow"
                    value={formState.shortDescription}
                    onChange={(value) =>
                      handleQuillChange("shortDescription", value)
                    }
                  />

                  {/* <ReactQuill id="form-category/description" theme="snow" name="shortDescription" value={formState.shortDescription} onChange={handleChange} /> */}
                </div>
              </div>
            </div>

            <div className="card mt-5">
              <div className="card-body p-5">
                <div
                  className="mb-5 "
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h2 className="mb-0 fs-exact-18">Inventory</h2>
                </div>
                <div className="row g-4">
                  <div className="col">
                    <label htmlFor="form-product/price" className="form-label">
                      Price <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="form-product/price"
                      name="price"
                      min={1}
                      value={formState.price}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <label
                      htmlFor="form-product/discounted-price"
                      className="form-label"
                    >
                      Discounted Price
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="form-product/discounted-price"
                      name="discountedPrice"
                      value={formState.discountedPrice}
                      min={0}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row g-4">
                  <div className="col">
                    <label
                      htmlFor="form-product/quantity"
                      className="form-label"
                    >
                      Stock quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      min={0}
                      type="number"
                      className="form-control"
                      id="form-product/quantity"
                      name="quantity"
                      value={formState.quantity}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="form-product/sku" className="form-label">
                      SKU <span className="text-danger">*</span>
                    </label>
                    <input
                      type="string"
                      className="form-control"
                      id="form-product/sku"
                      name="sku"
                      value={formState.sku}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Varient */}
            <div className="card mt-5">
              <div className="card-body p-5">
                <div
                  className="mb-5 "
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h2 className="mb-0 fs-exact-18">Varients</h2>
                  {/* Button to Open Popup */}
                  <Popup
                    trigger={
                      <span className="btn btn-light mb-3">
                        Add Variant Type
                      </span>
                    }
                    modal
                    closeOnDocumentClick
                  >
                    {(close) => (
                      <div className="p-5 bg-white rounded ">
                        <h2 className="text-lg font-semibold mb-2">
                          Add Variant
                        </h2>
                        <hr />
                        {/* Your Form or Content */}
                        <form>
                          <label htmlFor="variantType">
                            Variant Type Name:
                            <span className="text-danger">*</span>{" "}
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Variant Type"
                            id="variantType"
                            className=" p-2 w-ful l"
                            onChange={(e) => {
                              variantTypeChange(e);
                            }}
                          />
                          <br />
                          <button
                            type="button"
                            className="bg-blue-500 text-black px-4 py-2 rounded mt-3 btn-primary btn"
                            onClick={(e) => handleVariantSubmit(e, close)}
                          >
                            Save & Close
                          </button>
                        </form>
                      </div>
                    )}
                  </Popup>
                </div>
                <div>
                  <Popup
                    open={isOpen}
                    trigger={
                      <button
                        title="Add Variant"
                        className="p-2 bg-blue-600 text-black  flex items-center justify-center w-100 h-10 ml-40"
                        style={{ fontSize: "1.2rem" }}
                      >
                        <p className="mb-0 fs-exact-18 btn btn-outline-dark border">
                          Add Product Variant
                        </p>
                      </button>
                    }
                    modal
                    closeOnDocumentClick
                  >
                    {(close) => (
                      <div
                        className="card mt-5 p-2"
                        style={{
                          maxHeight: "80vh",
                          width: "60vw",
                          overflow: "auto",
                        }}
                      >
                        <form className="mt-5">
                          <div className="">
                            <div className="card-body ">
                              <button
                                type="button"
                                className="btn-close float-end"
                                aria-label="Close"
                                onClick={close}
                              ></button>
                              <h2 className="mb-1">Product Variants</h2>
                              {//console.log('popupFormState: ', popupFormState)}
                              {popupFormState.productVariants.map(
                                (variant, index) => (
                                  <div
                                    key={index}
                                    className="variant-section p-2 mb-4"
                                  >
                                    <h5 className="mt-3">
                                      Variant Type{" "}
                                      <span className="text-danger">*</span>
                                    </h5>
                                    {variant.attributes.map(
                                      (attr, attrIndex) => (
                                        <div
                                          key={attrIndex}
                                          className="row g-3 mt-2"
                                        >
                                          <div className="col">
                                            <Select
                                              name="name"
                                              value={{
                                                value: attr.name,
                                                label: attr.name,
                                              }}
                                              onChange={(selectedOption) => {
                                                if (selectedOption) {
                                                  handleAttributeChange(
                                                    index,
                                                    attrIndex,
                                                    {
                                                      target: {
                                                        name: "name",
                                                        value:
                                                          selectedOption.value,
                                                      },
                                                    }
                                                  );
                                                }
                                              }}
                                              options={
                                                variantTypes?.map(
                                                  (variant) => ({
                                                    value: variant.name,
                                                    label: variant.name,
                                                  })
                                                ) || []
                                              }
                                              placeholder="Select Attribute"
                                            />
                                          </div>
                                          <div className="col">
                                            <input
                                              type="text"
                                              name="value"
                                              value={attr.value}
                                              placeholder="Attribute Value"
                                              className="form-control"
                                              onChange={(e) =>
                                                handleAttributeChange(
                                                  index,
                                                  attrIndex,
                                                  e
                                                )
                                              }
                                            />
                                          </div>
                                        </div>
                                      )
                                    )}

                                    <div className="row g-3 mt-2">
                                      <div className="col">
                                        <label className="form-label">
                                          Variant Name{" "}
                                          <span className="text-danger">*</span>
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          name="variantName"
                                          value={variant.variantName}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              index,
                                              "variantName",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="col">
                                        <label className="form-label">
                                          SKU
                                        </label>
                                        <input
                                          type="string"
                                          className="form-control"
                                          name="sku"
                                          value={variant.sku}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              index,
                                              "sku",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    </div>

                                    <div className="row g-3 mt-2">
                                      <div className="col">
                                        <label className="form-label">
                                          Price{" "}
                                          <span className="text-danger">*</span>
                                        </label>
                                        <input
                                          type="number"
                                          className="form-control"
                                          name="price"
                                          value={variant.price}
                                          min={1}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              index,
                                              "price",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="col">
                                        <label className="form-label">
                                          Quantity{" "}
                                          <span className="text-danger">*</span>
                                        </label>
                                        <input
                                          type="number"
                                          className="form-control"
                                          name="quantity"
                                          min={1}
                                          value={variant.quantity}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              index,
                                              "quantity",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="mb-3">
                                        <label className="form-label">
                                          Description
                                        </label>
                                        <ReactQuill
                                          value={variant.description}
                                          onChange={(value) =>
                                            handleVariantChange(
                                              index,
                                              "description",
                                              value
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="mb-3">
                                        <label className="form-label">
                                          Short Description
                                        </label>
                                        <ReactQuill
                                          value={variant.shortDescription}
                                          onChange={(value) =>
                                            handleVariantChange(
                                              index,
                                              "shortDescription",
                                              value
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className="row g-3 mt-2">
                                      <div className="upload-container px-5">
                                        {variant.images?.length > 0 && (
                                          <div className="table-wrapper">
                                            {//console.log(
                                              "variant.images: ",
                                              variant.images.length
                                            )}
                                            <div className="overflow-auto">
                                              <table className="upload-table">
                                                <thead>
                                                  <tr>
                                                    <th>Image</th>
                                                    <th>Alt Text</th>
                                                    <th>Order</th>
                                                    <th></th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {variant.images.map(
                                                    (image) => (
                                                      <tr key={image.id}>
                                                        <td>
                                                          <img
                                                            alt={image.alt}
                                                            src={image.base64}
                                                          />
                                                        </td>
                                                        <td>
                                                          <input
                                                            className="upload-input"
                                                            type="text"
                                                            placeholder="Enter alt text"
                                                            value={image.alt}
                                                            onChange={(e) =>
                                                              handleVariantAltChange(
                                                                image.id,
                                                                e.target.value
                                                              )
                                                            }
                                                          />
                                                        </td>
                                                        <td>
                                                          <input
                                                            className="upload-input upload-number"
                                                            type="number"
                                                            value={image.order}
                                                            onChange={(e) =>
                                                              handleVariantOrderChange(
                                                                image.id,
                                                                e.target.value
                                                              )
                                                            }
                                                          />
                                                        </td>
                                                        <td>
                                                          <button
                                                            className="remove-btn"
                                                            onClick={() =>
                                                              handleVariantRemoveImage(
                                                                image.id
                                                              )
                                                            }
                                                          >
                                                            <XCircle
                                                              size={18}
                                                            />
                                                          </button>
                                                        </td>
                                                      </tr>
                                                    )
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}

                                        <div className="file-upload-container">
                                          <button
                                            type="button"
                                            className="edit-images-button w-100"
                                            onClick={handleVariantButtonClick}
                                          >
                                            Upload Images
                                          </button>

                                          <input
                                            type="file"
                                            multiple
                                            ref={fileInputRef1}
                                            className="hidden hide"
                                            onChange={handleImagesChange}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-primary mt-3"
                            onClick={(e) => {
                              close();
                              editVariantIndex
                                ? editVariantData(e)
                                : handleVarientSave(e);
                            }}
                          >
                            Save Changes
                          </button>
                        </form>
                      </div>
                    )}
                  </Popup>
                </div>
                {submittedVariants.length > 0 && (
                  <table className="table mt-4">
                    <thead>
                      <tr>
                        <th>Variant Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedVariants.map((variant, index) => (
                        <tr key={index}>
                          <td>{variant.variantName}</td>
                          <td>{variant.price}</td>
                          <td>{variant.quantity}</td>
                          <td>
                            <div className="d-flex gap-5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  handleOpenVariantForm(e, variant, index + 1);
                                }}
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
                              <button
                                type="button"
                                onClick={(e) => {
                                  setSubmittedVariants((prevVariants) =>
                                    prevVariants.filter((_, i) => i !== index)
                                  );
                                }}
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
                )}
              </div>
            </div>

            {/* Image section */}
            <div className="card mt-5 pb-4">
              <div className="card-body p-5">
                <div className="upload-header">
                  <h2 className="fs-exact-18">Upload Images</h2>
                </div>
              </div>

              <div className="upload-container px-5">
                {formState.images?.length > 0 && (
                  <div className="table-wrapper">
                    <div className="overflow-auto">
                      <table className="upload-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Alt Text</th>
                            <th>Order</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formState.images.map((image) => (
                            <tr key={image.id}>
                              <td>
                                <img alt={image.alt} src={image.base64} />
                              </td>
                              <td>
                                <input
                                  className="upload-input"
                                  type="text"
                                  placeholder="Enter alt text"
                                  value={image.alt}
                                  onChange={(e) =>
                                    handleAltChange(image.id, e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="upload-input upload-number"
                                  type="number"
                                  value={image.order}
                                  onChange={(e) =>
                                    handleOrderChange(image.id, e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <button
                                  className="remove-btn"
                                  onClick={() => handleRemoveImage(image.id)}
                                >
                                  <XCircle size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="file-upload-container">
                  <button
                    type="button"
                    className="edit-images-button w-100"
                    onClick={handleButtonClick}
                  >
                    Upload File
                  </button>

                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden hide"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
            {/*  Search engine optimization */}
            <div className="card mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">
                    Search engine optimization
                  </h2>
                  <div className="mt-3 text-muted">
                    Provide information that will help improve the snippet and
                    bring your product to the top of search engines.
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="form-category/seo-title"
                    className="form-label"
                  >
                    Page title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="form-category/seo-title"
                    name="metaTitle"
                    value={formState.metaTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="form-category/seo-description"
                    className="form-label"
                  >
                    Meta description
                  </label>
                  <textarea
                    id="form-category/seo-description"
                    className="form-control"
                    rows={2}
                    name="metaDescription"
                    value={formState.metaDescription}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="sa-entity-layout__sidebar">
            <div className="card w-100">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">
                    Visibility <span className="text-danger">*</span>
                  </h2>
                </div>
                <div className="mb-4">
                  <label className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="visibility"
                      value="true"
                      onChange={handleChange}
                      // onClick={(e) => {
                      //   //console.log(
                      //     e.target.value === "true" || e.target.value === true
                      //   );
                      // }}
                      checked={formState.visibility === true}
                    />
                    <span className="form-check-label">Published</span>
                  </label>
                  <label className="form-check mb-0">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="visibility"
                      value="false"
                      onChange={handleChange}
                      checked={formState.visibility === false}
                    />

                    <span className="form-check-label">Hidden</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Visible On</h2>
                </div>
                <Select
                  name="visible_on"
                  options={visible_on}
                  onChange={(selectedOptions) =>
                    setFormState((prev) => {
                      return { ...prev, visible_on: selectedOptions.value };
                    })
                  }
                />
              </div>
            </div>
            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">
                    Category <span className="text-danger">*</span>
                  </h2>
                </div>
                <Select
                  name="categoryId"
                  isMulti
                  options={categories}
                  // value={formState}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "categoryId",
                      e?.map((item) => item.value)
                    )
                  }
                />

                <div className="form-text">
                  Select a category will show this product.
                </div>
              </div>
            </div>
            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0 fs-exact-18">Tags</h2>
                    <Popup
                      trigger={
                        <span className="btn btn-light mb-3">Add Tag</span>
                      }
                      modal
                      closeOnDocumentClick
                    >
                      {(close) => (
                        <form
                          className="p-5 rounded shadow bg-white"
                          onSubmit={(e) => handleSubmitTags(e, close)} // Form Submission
                        >
                          <h2 className="text-lg font-semibold mb-2">
                            Add Tag
                          </h2>
                          <hr className="mb-3" />

                          <table className="w-full border-collapse">
                            <tbody>
                              {/* Tag Input Row */}
                              <tr>
                                <td className="p-2 font-medium">
                                  <label htmlFor="tags">
                                    Tags: <span className="text-danger">*</span>
                                  </label>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    id="tags"
                                    name="name"
                                    placeholder="Enter tag"
                                    className="p-2 w-full border rounded"
                                    value={tags.name}
                                    onChange={(e) => handleInputTags(e, "tag")}
                                    required
                                  />
                                </td>
                              </tr>

                              {/* Is Category Checkbox Row */}
                              {/* <tr>
                                <td className="p-2 font-medium">
                                  <label htmlFor="iscategory">
                                    Is Category:
                                  </label>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="checkbox"
                                    id="iscategory"
                                    name="iscategory"
                                    checked={isCategory}
                                    onChange={(e) =>
                                      setIsCategory(e.target.checked)
                                    }
                                  />
                                </td>
                              </tr> */}

                              {/* Submit Button Row */}
                              <tr>
                                <td colSpan="2" className="p-2 text-center">
                                  <button
                                    type="submit"
                                    className="bg-blue-500 btn btn-primary px-4 py-2 rounded mt-3"
                                  >
                                    Save & Close
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </form>
                      )}
                    </Popup>
                  </div>
                </div>
                <Select
                  name="tags"
                  isMulti
                  options={tag.map((t) => {
                    return { value: t.name, label: t.name };
                  })}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "tags",
                      e?.map((item) => item.value)
                    )
                  }
                />
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0 fs-exact-18">Metals</h2>
                    <Popup
                      trigger={
                        <span className="btn btn-light mb-3">Add Metal</span>
                      }
                      modal
                      closeOnDocumentClick
                    >
                      {(close) => (
                        <form
                          className="p-5 rounded shadow bg-white"
                          onSubmit={(e) => handleSubmitTags(e, close)} // Form Submission
                        >
                          <h2 className="text-lg font-semibold mb-2">
                            Add Metals
                          </h2>
                          <hr className="mb-3" />

                          <table className="w-full border-collapse">
                            <tbody>
                              {/* Tag Input Row */}
                              <tr>
                                <td className="p-2 font-medium">
                                  <label htmlFor="Metals">
                                    Metal:{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    id="Metals"
                                    placeholder="Enter Metals"
                                    className="p-2 w-full border rounded"
                                    value={tags.name}
                                    name="isMetal"
                                    onChange={(e) =>
                                      handleInputTags(e, "isMetal")
                                    }
                                    required
                                  />
                                </td>
                              </tr>
                              {/* Submit Button Row */}
                              <tr>
                                <td colSpan="2" className="p-2 text-center">
                                  <button
                                    type="submit"
                                    className="bg-blue-500 btn btn-primary px-4 py-2 rounded mt-3"
                                  >
                                    Save & Close
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </form>
                      )}
                    </Popup>
                  </div>
                </div>
                <Select
                  name="metalType"
                  isMulti
                  options={metal.map((t) => {
                    return { value: t.name, label: t.name };
                  })}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "metalType",
                      e?.map((item) => item.value)
                    )
                  }
                />
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0 fs-exact-18">Polish</h2>
                    <Popup
                      trigger={
                        <span className="btn btn-light mb-3">Add Polish</span>
                      }
                      modal
                      closeOnDocumentClick
                    >
                      {(close) => (
                        <form
                          className="p-5 rounded shadow bg-white"
                          onSubmit={(e) => handleSubmitTags(e, close)} // Form Submission
                        >
                          <h2 className="text-lg font-semibold mb-2">
                            Add Polish
                          </h2>
                          <hr className="mb-3" />

                          <table className="w-full border-collapse">
                            <tbody>
                              {/* Tag Input Row */}
                              <tr>
                                <td className="p-2 font-medium">
                                  <label htmlFor="Polish">
                                    Polish:{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    id="Polish"
                                    placeholder="Enter Polish"
                                    className="p-2 w-full border rounded"
                                    value={tags.name}
                                    name="isPolish"
                                    onChange={(e) =>
                                      handleInputTags(e, "isPolish")
                                    }
                                    required
                                  />
                                </td>
                              </tr>
                              {/* Submit Button Row */}
                              <tr>
                                <td colSpan="2" className="p-2 text-center">
                                  <button
                                    type="submit"
                                    className="bg-blue-500 btn btn-primary px-4 py-2 rounded mt-3"
                                  >
                                    Save & Close
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </form>
                      )}
                    </Popup>
                  </div>
                </div>
                <Select
                  name="polishType"
                  isMulti
                  options={polish.map((p) => {
                    return { value: p.name, label: p.name };
                  })}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "polishType",
                      e?.map((item) => item.value)
                    )
                  }
                />
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0 fs-exact-18">Stone</h2>
                    <Popup
                      trigger={
                        <span className="btn btn-light mb-3">Add Stone</span>
                      }
                      modal
                      closeOnDocumentClick
                    >
                      {(close) => (
                        <form
                          className="p-5 rounded shadow bg-white"
                          onSubmit={(e) => handleSubmitTags(e, close)} // Form Submission
                        >
                          <h2 className="text-lg font-semibold mb-2">
                            Add Stone
                          </h2>
                          <hr className="mb-3" />

                          <table className="w-full border-collapse">
                            <tbody>
                              {/* Tag Input Row */}
                              <tr>
                                <td className="p-2 font-medium">
                                  <label htmlFor="Stone">
                                    Stone:{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    id="Stone"
                                    placeholder="Enter Stone"
                                    className="p-2 w-full border rounded"
                                    value={tags.name}
                                    name="isStone"
                                    onChange={(e) =>
                                      handleInputTags(e, "isStone")
                                    }
                                    required
                                  />
                                </td>
                              </tr>
                              {/* Submit Button Row */}
                              <tr>
                                <td colSpan="2" className="p-2 text-center">
                                  <button
                                    type="submit"
                                    className="bg-blue-500 btn btn-primary px-4 py-2 rounded mt-3"
                                  >
                                    Save & Close
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </form>
                      )}
                    </Popup>
                  </div>
                </div>
                <Select
                  name="stoneType"
                  isMulti
                  options={stone.map((s) => {
                    return { value: s.name, label: s.name };
                  })}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "stoneType",
                      e?.map((item) => item.value)
                    )
                  }
                />
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0 fs-exact-18">Occasion</h2>
                    <Popup
                      trigger={
                        <span className="btn btn-light mb-3">Add Occasion</span>
                      }
                      modal
                      closeOnDocumentClick
                    >
                      {(close) => (
                        <form
                          className="p-5 rounded shadow bg-white"
                          onSubmit={(e) => handleSubmitTags(e, close)} // Form Submission
                        >
                          <h2 className="text-lg font-semibold mb-2">
                            Add Occasion
                          </h2>
                          <hr className="mb-3" />

                          <table className="w-full border-collapse">
                            <tbody>
                              {/* Tag Input Row */}
                              <tr>
                                <td className="p-2 font-medium">
                                  <label htmlFor="Occasion">
                                    Occasion:{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    id="Occasion"
                                    placeholder="Enter Occasion"
                                    className="p-2 w-full border rounded"
                                    value={tags.name}
                                    name="isOccasion"
                                    onChange={(e) =>
                                      handleInputTags(e, "isOccasion")
                                    }
                                    required
                                  />
                                </td>
                              </tr>
                              {/* Submit Button Row */}
                              <tr>
                                <td colSpan="2" className="p-2 text-center">
                                  <button
                                    type="submit"
                                    className="bg-blue-500 btn btn-primary px-4 py-2 rounded mt-3"
                                  >
                                    Save & Close
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </form>
                      )}
                    </Popup>
                  </div>
                </div>
                <Select
                  name="occasionType"
                  isMulti
                  options={occasion.map((o) => {
                    return { value: o.name, label: o.name };
                  })}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "occasionType",
                      e?.map((item) => item.value)
                    )
                  }
                />
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0 fs-exact-18">Collection</h2>
                    <Popup
                      trigger={
                        <span className="btn btn-light mb-3">
                          Add Collection
                        </span>
                      }
                      modal
                      closeOnDocumentClick
                    >
                      {(close) => (
                        <form
                          className="p-5 rounded shadow bg-white"
                          onSubmit={(e) => handleSubmitTags(e, close)} // Form Submission
                        >
                          <h2 className="text-lg font-semibold mb-2">
                            Add Collection
                          </h2>
                          <hr className="mb-3" />

                          <table className="w-full border-collapse">
                            <tbody>
                              {/* Tag Input Row */}
                              <tr>
                                <td className="p-2 font-medium">
                                  <label htmlFor="Collection">
                                    Collection:{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    id="Collection"
                                    placeholder="Enter Collection"
                                    className="p-2 w-full border rounded"
                                    value={tags.name}
                                    name="isCollection"
                                    onChange={(e) =>
                                      handleInputTags(e, "isCollection")
                                    }
                                    required
                                  />
                                </td>
                              </tr>
                              {/* Submit Button Row */}
                              <tr>
                                <td colSpan="2" className="p-2 text-center">
                                  <button
                                    type="submit"
                                    className="bg-blue-500 btn btn-primary px-4 py-2 rounded mt-3"
                                  >
                                    Save & Close
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </form>
                      )}
                    </Popup>
                  </div>
                </div>
                <Select
                  name="collectionType"
                  isMulti
                  options={collection.map((c) => {
                    return { value: c.name, label: c.name };
                  })}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "collectionType",
                      e?.map((item) => item.value)
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
