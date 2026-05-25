"use client";
import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import { XCircle } from "lucide-react";
import { addTestimonial } from "@/app/api/testimonials";

const Page = () => {
  const fileInputRef = useRef(null);
  const router = useRouter();
  // Auth related code
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [formState, setFormState] = useState({
    name: "",
    review: "",
    link: "",
    rating: 0,
    images: [],
  });

  if (status === "loading") {
    return <LoadingScreen />;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
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

  const handleAltChange = (id, value) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === id ? { ...img, alt: value } : img
      ),
    }));
  };

  const handleRemoveImage = (id) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
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

  const handleSubmit = async (e) => {
    //console.log(formState);
    e.preventDefault();
    try {
      const response = await addTestimonial(token, formState);
      if (response) {
        toast.success("Successfully added testimonial");
        router.push("/admin/testimonials");
      }
    } catch (error) {}
  };

  return (
    <>
      <div className="p-5">
        <div className="row g-4 align-items-center">
          <div className="col">
            <h1 className="h3 m-0">Add Testimonial</h1>
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
      <div className="sa-entity-layout sa-entity-layout--size--md p-5">
        <div className="sa-entity-layout__body bg-white shadow-lg p-5 rounded-md">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">User: <span className="text-danger">*</span></label>
            <br />
            <input
              type="text"
              name="name"
              value={formState.user}
              className="w-100 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
          </div>
          <br />

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Link: <span className="text-danger">*</span></label>
            <br />
            <input
              type="text"
              name="link"
              value={formState.link}
              className="w-100 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
          </div>
          <br />

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Review: <span className="text-danger">*</span></label>
            <br />
            <textarea
              name="review"
              value={formState.review}
              className="w-100 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              onChange={handleInputChange}
            />
          </div>
          <br />

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Rating: <span className="text-danger">*</span></label>
            <br />
            <input
              type="number"
              name="rating"
              value={formState.rating}
              min="0"
              max="5"
              className="w-100 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>

          <div className="upload-container p-5">
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
                      {formState.images.map((image, index) => (
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
                              value={index + 1}
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
      </div>
    </>
  );
};

export default Page;
