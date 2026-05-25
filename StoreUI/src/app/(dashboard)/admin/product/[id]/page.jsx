"use strict";
"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import axios from "axios";
import { useParams } from "next/navigation";
import { fetchProductById, updateProduct } from "@/app/api/products";
import { useSession } from "next-auth/react";
import { XCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Popup from "reactjs-popup";
import { useRouter } from "next/navigation";
import { fetchTags, addTags } from "@/app/api/tags";

const Page = () => {
  const ref = useRef();

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

  const Navigate = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [variantTypes, setVariantTypes] = useState([]);
  const [editVariantIndex, setEditVariantIndex] = useState();
  const [categories, setCategories] = useState([]);
  const { id } = useParams();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [formState, setFormState] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    shortDescription: "",
    quantity: 0,
    price: 0,
    discountedPrice: null,
    categories: [],
    tags: [],
    visibility: false,
    metaTitle: "",
    metaDescription: "",
    visible_on: "",
    keywords: "",
    images: [],
    metalType: [],
    polishType: [],
    stoneType: [],
    occasionType: [],
    collectionType: [],
    productVariants: [],
  });
  // const [tagOptions, setTags] = useState([]);
  // const [tag, setTag] = useState([]);
  const [tag, setTag] = useState({
    name: "",
    isCategory: false,
    isMetal: false,
    isPolish: false,
    isStone: false,
    isOccasion: false,
    isCollection: false,
  });

  const [tags, setTags] = useState([]);
  const [metal, setMetal] = useState([]);
  const [polish, setPolish] = useState([]);
  const [occasion, setOccasion] = useState([]);
  const [collection, setCollection] = useState([]);
  const [stone, setStone] = useState([]);

  const [isCategory, setIsCategory] = useState(false);
  const [submittedPopUpFormState, setSubmittedPopUpFormState] = useState([]);
  const [popupFormState, setPopupFormState] = useState({
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

  useEffect(() => {
    if (id && token) {
      loadProduct(id, token);
    }
    fetchCategories();
    getTags();
  }, [id, token]);

  const loadProduct = async (productId) => {
    try {
      if (!token) {
        console.warn("Token is not available yet, skipping fetch.");
        return;
      }

      const productData = await fetchProductById(productId, token);
      if (!productData) {
        // console.error("No data received from API");
        toast.error("Product data not found");
        return;
      }

      setProductData(productData.data || productData);

      setSubmittedPopUpFormState((prev) => ({
        ...prev,
        productVariants: productData.ProductVariant.map((variant) => ({
          description: variant.description || "",
          shortDescription: variant.shortDescription || "",
          variantName: variant.variantName || "",
          sku: variant.sku || "",
          images: variant.images || [],
          price: variant.price ? variant.price.toString() : "",
          quantity: variant.quantity ? variant.quantity.toString() : "",
          attributes: variant.variantAttributes
            ? variant.variantAttributes.map((attr) => ({
                name: attr.name || "",
                value: attr.value || "",
              }))
            : [{ name: "", value: "" }],
        })),
      }));
    } catch (error) {
      // console.error("Error loading product:", error);
    }
  };

  const setProductData = (productData) => {
    const data = {
      name: productData.name || "",
      slug: productData.slug || "",
      sku: productData.sku || "",
      description: productData.description || "",
      shortDescription: productData.shortDescription || "",
      quantity: productData.quantity || 0,
      price: productData.price || 0,
      discountedPrice: productData.discountedPrice || null,
      categories: productData.Category || [],
      tags: productData.Tag || [""],
      visible_on: productData.visible_on || "",
      visibility: productData.visibility || false,
      metaTitle: productData.metaTitle || "",
      metaDescription: productData.metaDescription || "",
      keywords: productData.keywords || "",
      metalType: productData.metalType || "",
      polishType: productData.polishType,
      stoneType: productData.stoneType,
      occasionType: productData.occasionType,
      collectionType: productData.collectionType,
      images: productData.images || [],
    };
    const productVariants =
      productData.ProductVariant && productData.ProductVariant.length > 0
        ? productData.ProductVariant.map((variant) => ({
            variantName: variant.variantName || "",
            description: variant.description || "",
            shortDescription: variant.shortDescription || "",
            sku: variant.sku || "",
            price: variant.price || 0,
            quantity: variant.quantity || 0,
            salableQuantity: variant.salableQuantity || 0,
            keywords: variant.keywords || "",
            images: variant.images || [],
            attributes: Array.isArray(variant.variantAttributes)
              ? variant.variantAttributes
              : [],
          }))
        : [];
    data["productVariants"] = productVariants;

    setFormState(data);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.SERVER_URL}/category/names`
      );
      const formattedCategories = response.data.categories.map((category) => ({
        value: category.id,
        label: category.categoryName,
      }));
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

        setTags(filteredTags);
        setMetal(response.filter((item) => item.isMetal));
        setPolish(response.filter((item) => item.isPolish));
        setOccasion(response.filter((item) => item.isOccasion));
        setCollection(response.filter((item) => item.isCollection));
        setStone(response.filter((item) => item.isStone));
      }
    } catch (error) {}
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: name === "visibility" ? value === "true" : value,
    }));
  };

  const handleEditorChange = (name) => (value) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    // //console.log("selectedOptions: ", selectedOptions);
    if (name === "categories") {
      setFormState((prevState) => {
        const updatedState = {
          ...prevState,
          [name]: selectedOptions.map((option) => ({
            id: option.value, // Convert back to original format
            categoryName: option.label, // Keep label consistent
          })), // Ensures state is always an array
        };
        return updatedState;
      });
    } else {
      // setFormState((prevState) => {
      //   const updatedState = {
      //     ...prevState,
      //     [name]: selectedOptions.map((option) => ({
      //       id: option.value, // Convert back to original format
      //       name: option.label, // Keep label consistent
      //     })), // Ensures state is always an array
      //   };
      //   return updatedState;
      // });
      if (!Array.isArray(selectedOptions)) {
        selectedOptions = [];
      }

      setFormState((prevState) => ({
        ...prevState,
        [name]: selectedOptions.map((option) => option.value), // Store only values
      }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    setPopupFormState((prevState) => {
      const updatedVariants = [...prevState.productVariants];
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };
      return { ...prevState, productVariants: updatedVariants };
    });
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
          base64: e.target.result,
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
          productVariants: [
            { ...popupFormState.productVariants[0], images: newImages },
          ],
        }));
      };

      reader.readAsDataURL(file);
    });
  };

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

  const handleVarientSave = (e) => {
    e.preventDefault();
    // setSubmittedPopUpFormState((prev) => {
    //   prev.productVariants.push(popupFormState.productVariants[0]);
    //   return prev;
    // });
    const data = submittedPopUpFormState;
    const abc = data["productVariants"];
    abc.push(popupFormState.productVariants[0]);
    data["productVariants"] = abc;

    // setSubmittedPopUpFormState((prev) => ({
    //   ...prev,
    //   productVariants: [
    //     ...prev.productVariants,
    //     popupFormState.productVariants[0],
    //   ],
    // }));
    setSubmittedPopUpFormState(data);

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
    if (submittedPopUpFormState) savePopupData();
  }, [submittedPopUpFormState]);

  const savePopupData = () => {
    const productVariants = Array.isArray(submittedPopUpFormState)
      ? [...submittedPopUpFormState]
      : submittedPopUpFormState?.productVariants || [];
    const data = formState;
    data["productVariants"] = productVariants;

    setFormState(data);
  };

  const editVariantData = (e) => {
    e.preventDefault();
    const data = submittedPopUpFormState;
    const abc = data["productVariants"][editVariantIndex - 1];
    // abc.push(popupFormState.productVariants[0]);
    data["productVariants"][editVariantIndex - 1] =
      popupFormState.productVariants[0];

    setSubmittedPopUpFormState({ productVariants: data["productVariants"] });
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
          attributes: [{ name: "", value: "" }],
          images: [],
        },
      ],
    });
  };

  const handleRemoveImage = (id) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
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

  const handleVariantSubmit = async (e, close) => {
    e.preventDefault();
    const type = variantType;
    if (!type.trim()) {
      toast.warning("Variant Type Name is required!");
      return;
    }

    try {
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

  // Clean and validate data before submission
  const prepareFormData = (state) => {
    const cleaned = { ...state };
    // Ensure all numbers are properly formatted
    cleaned.price = Number(cleaned.price) || 0;
    cleaned.quantity = Number(cleaned.quantity) || 0;
    cleaned.discountedPrice = cleaned.discountedPrice
      ? Number(cleaned.discountedPrice)
      : null;

    // Clean product variants
    cleaned.productVariants = cleaned.productVariants.map((variant) => ({
      ...variant,
      price: Number(variant.price) || 0,
      quantity: Number(variant.quantity) || 0,
      salableQuantity: Number(variant.salableQuantity) || 0,
    }));

    // Remove any non-serializable properties if needed
    cleaned.images = cleaned.images.map((img) => ({
      id: img.id,
      alt: img.alt,
      order: img.order,
      base64: img.base64 || img.url,
    }));

    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare and clean the data
      const cleanedData = prepareFormData(formState);

      // Validate JSON formatting
      let productData;
      try {
        productData = JSON.stringify(cleanedData);
        JSON.parse(productData);
      } catch (jsonError) {
        // toast.error("Invalid format in form data");
        return;
      }

      // Call the updateProduct function
      const response = await updateProduct(id, productData, token);

      if (response) {
        toast.success("Product updated successfully!");
        // Redirect to the product list page
        Navigate.push("/admin/product/");
      } else {
        toast.error("Failed to update product. No response received.");
      }
    } catch (error) {
      // console.error("Submission Error:", {
      //   message: error.message,
      //   stack: error.stack,
      //   response: error.response?.data,
      //   formState: formState,
      // });

      toast.error(
        "Something went wrong: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const [variantType, setvariantType] = useState("");

  const variantTypeChange = (e) => {
    e.preventDefault();
    setvariantType(e.target.value);
  };

  // Handle changes in variant attributes

  // const updateVariantField = (variantIndex, field, value) => {
  //   const updatedVariants = [...formState.productVariants];
  //   updatedVariants[variantIndex][field] = value;
  //   setFormState({ ...formState, productVariants: updatedVariants });
  // };

  // const updateAttributeField = (variantIndex, attrIndex, field, value) => {
  //   const updatedVariants = [...formState.productVariants];
  //   updatedVariants[variantIndex].attributes[attrIndex][field] = value;
  //   setFormState({ ...formState, productVariants: updatedVariants });
  // };

  // Add New Tag
  const handleSubmitTags = async (e, close) => {
    e.preventDefault();

    // Prepare data
    // const tagData = {
    //   name: tag,
    //   isCategory: isCategory,
    // };

    const response = await addTags(tag, token);
    getTags();
    setTag({
      name: "",
      isCategory: false,
      isMetal: false,
      isPolish: false,
      isStone: false,
      isOccasion: false,
      isCollection: false,
    });

    // Reset form fields after submission
    // setTag(tagData);
    setIsCategory(false);

    // Close popup after saving
    close();
  };

  const handleOpenVariantForm = (e, variant, i) => {
    e.preventDefault();
    setIsOpen(true);
    setPopupFormState((prevState) => ({
      ...prevState,
      productVariants: [variant],
    }));
    setEditVariantIndex(i);
    ref.current.open();
  };

  const handleAction = (e) => {
    handleClose();
    if (editVariantIndex) {
      editVariantData(e);
    } else {
      handleVarientSave(e);
    }
    // editVariantIndex ? editVariantData(e) : handleVarientSave(e);
  };

  const handleClose = () => {
    setIsOpen(false);
    ref.current.close();
    setPopupFormState({
      productVariants: [
        {
          description: "",
          shortDescription: "",
          variantName: "",
          sku: "",
          price: "",
          quantity: "",
          attributes: [{ name: "", value: "" }],
        },
      ],
    });
    close();
  };
  const handleInputTags = (e, tag) => {
    e.preventDefault();
    const { name, value } = e.target;

    setTag((prevTags) => ({
      ...prevTags,
      name: value,
      [name]: name === tag ? true : value,
    }));
  };
  const fileInputRef1 = useRef(null);
  const handleVariantButtonClick = () => {
    fileInputRef1.current.click();
  };

  return (
    <>
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Edit Product</h1>
          </div>
          <div className="col-auto d-flex">
            <button onClick={handleSubmit} className="btn btn-primary">
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
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                    onChange={handleEditorChange("description")}
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
                    id="form-product/short-description"
                    theme="snow"
                    value={formState.shortDescription}
                    onChange={handleEditorChange("shortDescription")}
                  />
                </div>
              </div>
            </div>
            <div className="card mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
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
                      value={formState.price}
                      onChange={handleInputChange}
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
                      value={formState.discountedPrice || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="row g-4 mt-4">
                  <div className="col">
                    <label
                      htmlFor="form-product/quantity"
                      className="form-label"
                    >
                      Stock quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="form-product/quantity"
                      name="quantity"
                      value={formState.quantity}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="form-product/sku" className="form-label">
                      SKU <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="form-product/sku"
                      name="sku"
                      value={formState.sku}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Variant */}
            <div className="card mt-5 p-5">
              <div className="d-flex justify-content-between">
                <h5 className="mt-3">Variant</h5>
                <Popup
                  ref={ref}
                  trigger={
                    <button
                      title="Add Variant"
                      className="p-2 bg-blue-600 text-black rounded-full flex items-center justify-center w-10 h-10 ml-40"
                      style={{ fontSize: "1.2rem" }}
                    >
                      <button className="btn btn-outline-dark d-inline">
                        Add Product Varient
                      </button>
                    </button>
                  }
                  modal
                  // closeOnDocumentClick
                  // defaultOpen={true}
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
                              onClick={handleClose}
                            ></button>
                            <h2 className="mb-1">Product Variants</h2>
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
                                  {variant.attributes.map((attr, attrIndex) => (
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
                                                    value: selectedOption.value,
                                                  },
                                                }
                                              );
                                            }
                                          }}
                                          options={
                                            variantTypes?.map((variant) => ({
                                              value: variant.name,
                                              label: variant.name,
                                            })) || []
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
                                  ))}

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
                                      <label className="form-label">SKU</label>
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
                                                {variant.images.map((image) => (
                                                  <tr key={image.id}>
                                                    <td>
                                                      <img
                                                        alt={image.alt}
                                                        src={image.url || image.base64}
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
                            handleAction(e);
                          }}
                        >
                          Save Changes
                        </button>
                      </form>
                    </div>
                  )}
                </Popup>
              </div>

              {/* Varient Type PopUp */}
              <Popup
                trigger={
                  <span className="btn btn-primary mb-3 w-100 my-4">
                    Add Variant Type
                  </span>
                }
                modal
                closeOnDocumentClick
              >
                {(close) => (
                  <div className="p-5 bg-white rounded shadow-lg ">
                    <h2 className="text-lg font-semibold mb-2">Add Variant</h2>
                    <hr />
                    {/* Your Form or Content */}
                    <form>
                      <label htmlFor="variantType">
                        Variant Type Name:{" "}
                        <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Variant Type"
                        id="variantType"
                        className="border p-2 w-ful l"
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

              {/* product varient */}
              {submittedPopUpFormState?.productVariants?.length > 0 && (
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
                    {submittedPopUpFormState.productVariants.map(
                      (variant, index) => (
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
                                  setSubmittedPopUpFormState((prevState) => ({
                                    ...prevState, // Spread existing state
                                    productVariants:
                                      prevState.productVariants.filter(
                                        (_, i) => i !== index
                                      ), // Remove the specific variant
                                  }));
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
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Edit Images</h2>
                </div>
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                  {formState.images.length > 0 && (
                    <div className="table-wrapper">
                      <table className="responsive-table w-full table-auto mb-4">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Image</th>
                            <th className="px-4 py-2 text-left">Alt Text</th>
                            <th className="px-4 py-2 text-left">Order</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formState.images.map((image) => (
                            <tr key={image.id} className="border-t">
                              <td className="px-4 py-2">
                                <img
                                  alt={image.alt}
                                  className="w-[50px] h-[50px] object-cover rounded-md"
                                  src={image.url || image.base64}
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  className="w-full border rounded px-2 py-1"
                                  type="text"
                                  placeholder="Enter alt text"
                                  value={image.alt}
                                  onChange={(e) =>
                                    handleAltChange(image.id, e.target.value)
                                  }
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  className="w-16 border rounded px-2 py-1"
                                  type="number"
                                  value={image.order}
                                  onChange={(e) =>
                                    handleOrderChange(image.id, e.target.value)
                                  }
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  className="text-red-500 flex items-center gap-1"
                                  onClick={() => handleRemoveImage(image.id)}
                                >
                                  <XCircle className="w-5 h-5" /> Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Responsive File Upload Button */}
                  <div className="mt-4 text-center">
                    <label className="custom-file-upload">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidefield"
                      />
                      <span className="btn-upload">
                        <span className="w-5 h-5 inline-block mr-2" /> Upload
                        Images
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                      checked={formState.visibility === true}
                      onChange={handleInputChange}
                    />
                    <span className="form-check-label">Published</span>
                  </label>
                  <label className="form-check mb-0">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="visibility"
                      value="false"
                      checked={formState.visibility === false}
                      onChange={handleInputChange}
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
                  value={visible_on.find(
                    (option) => option.value === formState.visible_on
                  )}
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
                    Categories <span className="text-danger">*</span>
                  </h2>
                </div>
                <Select
                  name="categories"
                  isMulti
                  options={categories}
                  value={formState.categories.map((cat) => ({
                    value: cat.id,
                    label: cat.categoryName,
                  }))}
                  onChange={(selected) => {
                    handleMultiSelectChange("categories", selected);
                  }}
                />
                <div className="form-text">
                  Select categories where this product will appear.
                </div>
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5 d-flex justify-content-between align-items-center">
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
                        <h2 className="text-lg font-semibold mb-2">Add Tag</h2>
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

                <Select
                  name="tags"
                  isMulti
                  options={tags.map((tag) => {
                    return {
                      value: tag.id,
                      label: tag.name,
                    };
                  })}
                  value={tags
                    .filter((tag) =>
                      formState.tags.some(
                        (selectedTag) =>
                          (selectedTag.id || selectedTag) === tag.id
                      )
                    ) // Correct check
                    .map((tag) => ({
                      value: tag.id,
                      label: tag.name,
                    }))}
                  onChange={(selected) => {
                    handleMultiSelectChange("tags", selected);
                  }}
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
                                    value={metal.name}
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
                  value={
                    formState.metalType.map((val) => ({
                      value: val,
                      label: val,
                    })) || []
                  }
                  options={metal.map((t) => {
                    return { value: t.name, label: t.name };
                  })}
                  // onChange={(e) =>
                  //   handleMultiSelectChange(
                  //     "metalType",
                  //     e?.map((item) => item.value)
                  //   )
                  // }
                  onChange={(selected) => {
                    handleMultiSelectChange("metalType", selected);
                  }}
                />
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0 fs-exact-18">polish</h2>
                    <Popup
                      trigger={
                        <span className="btn btn-light mb-3">Add polish</span>
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
                            Add polish
                          </h2>
                          <hr className="mb-3" />

                          <table className="w-full border-collapse">
                            <tbody>
                              {/* Tag Input Row */}
                              <tr>
                                <td className="p-2 font-medium">
                                  <label htmlFor="polish">
                                    polish:{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    id="polish"
                                    placeholder="Enter polish"
                                    className="p-2 w-full border rounded"
                                    value={polish.name}
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
                  name="metalType"
                  isMulti
                  value={
                    formState.polishType.map((val) => ({
                      value: val,
                      label: val,
                    })) || []
                  }
                  options={polish.map((t) => {
                    return { value: t.name, label: t.name };
                  })}
                  // onChange={(e) =>
                  //   handleMultiSelectChange(
                  //     "metalType",
                  //     e?.map((item) => item.value)
                  //   )
                  // }
                  onChange={(selected) => {
                    handleMultiSelectChange("polishType", selected);
                  }}
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
                                    value={stone.name}
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
                  name="metalType"
                  isMulti
                  value={
                    formState.stoneType.map((val) => ({
                      value: val,
                      label: val,
                    })) || []
                  }
                  options={stone.map((t) => {
                    return { value: t.name, label: t.name };
                  })}
                  // onChange={(e) =>
                  //   handleMultiSelectChange(
                  //     "metalType",
                  //     e?.map((item) => item.value)
                  //   )
                  // }
                  onChange={(selected) => {
                    handleMultiSelectChange("stoneType", selected);
                  }}
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
                                    value={occasion.name}
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
                  value={
                    formState.occasionType.map((val) => ({
                      value: val,
                      label: val,
                    })) || []
                  }
                  options={occasion.map((t) => {
                    return { value: t.name, label: t.name };
                  })}
                  // onChange={(e) =>
                  //   handleMultiSelectChange(
                  //     "metalType",
                  //     e?.map((item) => item.value)
                  //   )
                  // }
                  onChange={(selected) => {
                    handleMultiSelectChange("occasionType", selected);
                  }}
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
                  value={
                    formState.collectionType.map((val) => ({
                      value: val,
                      label: val,
                    })) || []
                  }
                  options={collection.map((t) => {
                    return { value: t.name, label: t.name };
                  })}
                  // onChange={(e) =>
                  //   handleMultiSelectChange(
                  //     "metalType",
                  //     e?.map((item) => item.value)
                  //   )
                  // }
                  onChange={(selected) => {
                    handleMultiSelectChange("collectionType", selected);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Page;
