"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  fetchAllSubCategoriesName,
  fetchCategoryById,
  updateCategoryById,
} from "@/app/api/categories";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Popup from "reactjs-popup";
import { addTags, fetchTags } from "@/app/api/tags";

import Select from "react-select";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
  const fileInputRef = useRef();
  const [image, setImage] = useState(null);
  const [tag, setTag] = useState([]);
  const [tags, setTags] = useState([]);
  const [isCategory, setIsCategory] = useState(true); // State for Checkbox

  const [categories, setCategories] = useState([
    { value: "1", label: "Chocolate" },
    { value: "2", label: "Strawberry" },
    { value: "3", label: "Vanilla" },
  ]);
  const [formState, setFormState] = useState({
    categoryName: "",
    slug: "",
    description: "",
    order: null,
    subCategories: [],
    isDisabled: false,
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    images: [],
    tags: [],
    visible_on: "",
  });

  const { data: session, status } = useSession();
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  useEffect(() => {
    if (id && status === "authenticated") {
      fetchCategories(id);
    }
    getTags();
  }, [id, status]);
  const token = session?.user?.token;

  useEffect(() => {
    if (status === "authenticated" && token) {
      fetchSubCategories(token);
    } else if (status !== "loading") {
      // console.error("No authentication token found");
      LogoutUser();
    }
  }, [token, status]);

  async function fetchSubCategories(token) {
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
  const fetchCategories = async (categoryId) => {
    try {
      if (!categoryId) {
        // console.error("Invalid categoryId");
        return;
      }

      const token = session?.user?.token;
      if (!token) {
        // console.error("No authentication token found");
        logout();
        return;
      }

      const categoryData = await fetchCategoryById(categoryId, token);
      //console.log("API Response:", categoryData);

      if (!categoryData) {
        // console.error("Category data not found");
        toast.error("Unable to fetch category");
        return;
      }

      setFormState({
        categoryName: categoryData.categoryName || "",
        slug: categoryData.slug || "",
        description: categoryData.description || "",
        order: categoryData.order || null,
        metaTitle: categoryData.metaTitle || "",
        metaDescription: categoryData.metaDescription || "",
        keywords: categoryData.keywords || "",
        subCategories:
          categoryData.subCategories?.map((subCat) => ({
            value: subCat.id,
            label: subCat.categoryName,
          })) || [],
        images: categoryData.images ?? [],
        isDisabled: categoryData.isDisabled || false,
        visible_on: categoryData.visible_on || "",
        tags: categoryData.Tag?.map((tags) => ({
          value: tags.id,
          label: tags.name,
        })),
      });
    } catch (error) {
      // console.error("Error fetching category:", error);
    }
  };
  const handleSubmitTags = async (e, close) => {
    e.preventDefault();

    // Prepare data
    const tagData = {
      name: tag,
      isCategory: true,
    };

    const response = await addTags(tagData, token);
    getTags();

    // //console.log("Response:", response);

    // Reset form fields after submission
    setTag();
    setIsCategory(false);

    // Close popup after saving
    close();
  };

  const getTags = async () => {
    try {
      const response = await fetchTags(token);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const parsedvalue = true === value || "true" === value;
    setFormState((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "isDisabled" && { isDisabled: parsedvalue }),
    }));
  };
  const handleMultiSelectChange = (selectedOptions, name) => {
    // //console.log(selectedOptions, name);
    setFormState((prevState) => ({
      ...prevState,
      [name]: selectedOptions || [],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = [];

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

  const handleReplaceImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = (id) => {
    setFormState((prevState) => ({
      ...prevState,
      images: prevState.images.filter((image) => image.id !== id),
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = session?.user?.token;
      if (!token) {
        return;
      }

      const updatedCategory = {
        categoryName: formState.categoryName,
        slug: formState.slug,
        description: formState.description,
        metaTitle: formState.metaTitle,
        metaDescription: formState.metaDescription,
        keywords: formState.keywords,
        subCategories: formState.subCategories.map((sub) => sub.value),
        images: formState.images || [],
        isDisabled: formState.isDisabled,
        tags: formState.tags,
        visible_on: formState.visible_on,
        order: formState.order,
      };

      const categoryData = await updateCategoryById(id, token, updatedCategory);

      if (categoryData) {
        // //console.log("Category updated successfully:", categoryData);
        toast.success("Successfully Updates Categories");
        router.push("/admin/category");
      }
    } catch (error) {
      // console.error("Error updating category:", error);
    }
  };

  return (
    <div className="container container--max--xl">
      <div className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Edit Category</h1>
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
                      /catalog
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
                      setFormState({ ...formState, description: value })
                    }
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
                    name="metaDescription"
                    rows={2}
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
                  <label className="form-check mb-0">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="isDisabled"
                      value={false}
                      onChange={handleChange}
                      checked={formState.isDisabled === false}
                    />
                    <span className="form-check-label">Published</span>
                  </label>
                  <label className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="isDisabled"
                      value={true}
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
                <div className="mb-5 d-flex justify-content-between  ">
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
                    value={formState.tags}
                    options={tags}
                    // value={selectedTags}
                    onChange={(e) => {
                      handleMultiSelectChange(e, "tags");
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">child category</h2>
                </div>
                <Select
                  name="subCategories"
                  isMulti
                  options={categories}
                  value={formState.subCategories}
                  onChange={(e) => {
                    handleMultiSelectChange(e, "subCategories");
                  }}
                />
                <div className="form-text">
                  Select a category that will be the child of the current one.
                </div>
              </div>
            </div>
            <div className="card w-100 mt-5">
              <div className="card-body p-5">
                <div className="mb-5">
                  <h2 className="mb-0 fs-exact-18">Images</h2>
                </div>
                <div className="border p-4 d-flex flex-wrap justify-content-center">
                  <div className="max-w-20x">
                    {Array.isArray(formState.images) &&
                    formState.images.length > 0 ? (
                      <div className="d-flex flex-wrap gap-3">
                        {formState.images.map((img, i) => (
                          <div key={`pic-${i}`} className="position-relative">
                            <img
                              src={img.url ?? img.base64}
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
                        onClick={handleReplaceImage}
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
                  style={{ display: "none" }}
                  onChange={handleImageUpload} // Handle new image upload
                />

                {/* {Array.isArray(formState.images) && formState.images.length > 0 && (<div className="mt-4 mb-n2 border p-4 d-flex justify-content-center">
                  <button
                    onClick={handleReplaceImage}
                  >
                    Add more images
                  </button>
                </div>)} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
