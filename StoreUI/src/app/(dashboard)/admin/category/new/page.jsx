"use client";
import { fetchAllSubCategoriesName } from "@/app/api/categories";
import React, { useEffect, useState, useRef } from "react";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import axios from "axios";

import { useSession } from "next-auth/react";
import { addTags, fetchTags } from "@/app/api/tags";
import Popup from "reactjs-popup";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { LogoutUser } from "@/utils/auth";
// import { LogoutUser } from "@/utils/auth";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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
const Page = () => {
  const navigate = useRouter();
  const fileInputRef = useRef();
  const [categories, setCategories] = useState([]);
  const [tag, setTag] = useState([]);
  const [tags, setTags] = useState([]);

  const [formState, setFormState] = useState({
    categoryName: "",
    slug: "",
    description: "",
    subCategories: [],
    // visibility: false,2
    isDisabled: false,
    metaTitle: "",
    // metaDesc: "",
    metaDescription: "",
    // keywords: "",
    visible_on: "",
    images: [],
    tags: [],
    order: null,
  });

  const { data: session, status } = useSession();
  const token = session?.user?.token;
  useEffect(() => {
    // fetchCategories();
    getTags();
  }, []);
  const [isCategory, setIsCategory] = useState(true); // State for Checkbox

  const handleSubmitTags = async (e, close) => {
    e.preventDefault();

    // Prepare data
    const tagData = {
      name: tag,
      isCategory: true,
    };

    const response = await addTags(tagData, token);
    getTags();
    // Reset form fields after submission
    setTag();
    setIsCategory(false);

    // Close popup after saving
    close();
  };

  const getTags = async () => {
    try {
      const response = await fetchTags(token);
      // //console.log("tags", response);
      const formattedTags = response
        .filter((tag) => tag.isCategory === true)
        .map((tag) => {
          return {
            label: tag.name,
            value: tag.id,
          };
        });
      setTags(formattedTags);
    } catch (error) {
      // console.error(
      //   "Error fetching tags :",
      //   error.response?.data || error.message
      // );
    }
  };

  useEffect(() => {
    if (status === "authenticated" && token) {
      fetchCategories(token);
    } else if (status !== "loading") {
      // console.error("No authentication token found");
      LogoutUser();
    }
  }, [token, status]);

  async function fetchCategories(token) {
    try {
      let abc = [{ label: "", value: "" }];

      const response = await fetchAllSubCategoriesName(token);
      if (response.categories) {
        abc = response.categories.map((item, index) => ({
          label: item.categoryName,
          value: item.id,
        }));
      }

      setCategories(abc);
    } catch (error) {
      // console.error("Error fetching categories:", error);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const parsedvalue = true === value || "true" === value;
    setFormState((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "isDisabled" && { isDisabled: parsedvalue }),
    }));
  };

  const handleMultiSelectChange = (name, val) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: val,
    }));
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = [...formState.images];

    files.forEach((file) => {
      const orderNo = newImages.length + 1; // Increment order number
      const reader = new FileReader();

      reader.onload = () => {
        newImages.push({
          id: Date.now(), // Unique ID for tracking
          orderNo,
          base64: reader.result, // Store as base64
          type: orderNo === 1 ? "thumbnail" : "image", // First image is thumbnail
        });

        setFormState((prevState) => ({
          ...prevState,
          images: newImages, // Update state with new images
        }));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id) => {
    setFormState((prevState) => ({
      ...prevState,
      images: prevState.images.filter((img) => img.id !== id), // Remove by ID
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure the token and form state are valid
    const token = session?.user?.token;
    if (!token) {
      console.error("No token found. Ensure the user is logged in.");
      // LogoutUser();
      return;
    }

    if (!formState.categoryName || !formState.slug) {
      // console.error("Form state is empty.");
      toast.error("Please fill in all required fields");
      return;
    }

    //console.log("formState: ", formState);
    if (formState.order === null) {
      // console.error("Form state is empty.");
      toast.error("Order is Required");
      return;
    }
    // const isEmptyField = Object.entries(formState).some(([key, value]) => {
    //   if (key === "subCategories") return false;
    //   if (Array.isArray(value)) return value.length === 0;
    //   return value === "";
    // });

    // if (isEmptyField) {
    //   toast.error(" All fields must be filled .");
    //   return;
    // }

    // if (!formState?.images[0]?.base64) {
    //   toast.error("Please add image");
    // }

    try {
      const response = await axios.post(
        `${process.env.SERVER_URL}/category`,
        formState,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response) {
        toast.success("Category created successfully!");
        navigate.push("/admin/category/");
      }
    } catch (error) {
      // Improved error handling
      // console.error("Error creating category:", error);
    }
  };

  const handleQuillChange = (value) => {
    // Store the rich text content (HTML) inside description
    setFormState((prevState) => ({
      ...prevState,
      description: value, // Update the state with the rich text content (HTML)
    }));
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container--max--xl">
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Create Category</h1>
          </div>
          <div className="col-auto d-flex">
            <button className="btn btn-primary" onClick={handleSubmit}>
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
                    name="categoryName"
                    value={formState.categoryName}
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
                      /catalog/
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
                {/* <div className="mb-4">
                                    <label htmlFor="form-category/description" className="form-label">Description</label>
                                    <ReactQuill id="form-category/description" theme="snow" name="description" value={formState.description} onChange={handleChange} />
                                </div> */}

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
                    name="description"
                    value={formState.description}
                    onChange={handleQuillChange}
                  />
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
                    bring your category to the top of search engines.
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
                      name="isDisabled"
                      value="false"
                      onChange={handleChange}
                      checked={formState.isDisabled === false}
                    />
                    <span className="form-check-label">Published</span>
                  </label>
                  <label className="form-check mb-0">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="isDisabled"
                      value="true"
                      onChange={handleChange}
                      checked={formState.isDisabled === true}
                    />
                    <span className="form-check-label">Hidden</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Order</h2>
                </div>
                <input
                  className="form-control"
                  name="order"
                  type="number"
                  min="1"
                  value={formState.order}
                  onChange={handleChange}
                />
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
                <div className="mb-5 d-flex justify-content-between   ">
                  <h2 className="mb-0 fs-exact-18"> Tag</h2>
                  <Popup
                    trigger={<span className="btn btn-light ">Add Tag</span>}
                    modal
                    closeOnDocumentClick
                  >
                    {(close) => (
                      <form
                        className="p-5 bg-white rounded shadow"
                        onSubmit={(e) => handleSubmitTags(e, close)} // Form Submission
                      >
                        <h2 className="text-lg font-semibold mb-2">Add Tag</h2>
                        <hr className="mb-3" />

                        <table className="w-full border-collapse">
                          <tbody>
                            {/* Tag Input Row */}
                            <tr>
                              <td className="p-2 font-medium">
                                <label htmlFor="tags">Tags:</label>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  id="tags"
                                  placeholder="Enter tag"
                                  className="p-2 w-full border rounded"
                                  value={tag}
                                  onChange={(e) => setTag(e.target.value)}
                                  required
                                />
                              </td>
                            </tr>

                            {/* Is Category Checkbox Row */}
                            {/* <tr>
                              <td className="p-2 font-medium">
                                <label htmlFor="iscategory">Is Category:</label>
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
                <div>
                  <Select
                    name="tags"
                    isMulti
                    options={tags} // ✅ Corrected from tags.value to just tags
                    // value={selectedTags}
                    onChange={(e) =>
                      handleMultiSelectChange(
                        "tags",
                        e?.map((item) => item.value)
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Child categories</h2>
                </div>
                <Select
                  isMulti
                  name="subcategories"
                  options={categories}
                  onChange={(selectedOptions) =>
                    handleMultiSelectChange(
                      "subCategories",
                      selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : []
                    )
                  }
                />
                <div className="form-text">
                  Select a category that will be the child of the current one.
                </div>
              </div>
            </div>

            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Image</h2>
                </div>

                <div className="border p-4 d-flex justify-content-center">
                  <div className="max-w-20x">
                    {Array.isArray(formState.images) &&
                    formState.images.length > 0 ? (
                      <div className="d-flex flex-wrap gap-3">
                        {formState.images.map((img) => (
                          <div key={img.id} className="position-relative">
                            <img
                              src={img.base64} // Now using base64 instead of src
                              className="w-100 h-auto"
                              width="100"
                              height="100"
                              alt={`Uploaded ${img.orderNo}`}
                            />
                            <p className="text-center mb-1">
                              #{img.orderNo} ({img.type})
                            </p>
                            <button
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              onClick={() => handleRemoveImage(img.id)}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={handleButtonClick}
                      >
                        Click to upload images
                      </span>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />

                {Array.isArray(formState.images) &&
                  formState.images.length > 0 && (
                    <div className="mt-4 mb-n2 border p-4 d-flex justify-content-center">
                      <button onClick={handleButtonClick}>
                        Add more images
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
