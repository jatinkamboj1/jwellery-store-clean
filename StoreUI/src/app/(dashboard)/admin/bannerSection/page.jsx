"use client";
import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import {
  addBanner,
  deleteBanner,
  fetchBanner,
  updateBanner,
} from "@/app/api/banner";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { convertS3UrlToLocalPath } from "@/utils/util";

const BannerSection = () => {
  const [banners, setBanners] = useState([]);
  const { data: session, status } = useSession();

  const token = session?.user?.token;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [action, setAction] = useState();
  const [id, setId] = useState("");

  // Handle Input Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file.type.includes("video")) {
      setSelectedBanner((prev) => ({ ...prev, content_type: "VIDEO" }));
    } else {
      setSelectedBanner((prev) => ({ ...prev, content_type: "IMAGE" }));
    }

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        handleInputChange("images", reader.result); // Store Base64 in state
      };
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedBanner((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetchBanner();
      setBanners(response);
    } catch (error) {}
  };

  const updateBnners = async () => {
    const response = await updateBanner(id, token, selectedBanner);
    if (response?.message) {
      toast.success(response.message);
      setId();
      setIsModalOpen(false);
      fetchBanners();
    }
  };

  const handleDelete = (id) => {
    const response = deleteBanner(id, token);
    fetchBanners();
  };

  // Open Modal for Adding or Editing
  const openModal = (banner = null, e, action, type) => {
    e.preventDefault();
    setAction(action);
    setId(banner?.id);

    setSelectedBanner(
      banner || {
        images: "",
        link: "",
        title: "",
        heading: "",
        description: "",
        order: "",
        type: type,
      }
    );
    setIsModalOpen(true);
  };
  // Determine which save function to use based on banner type
  const handleAction = () => {
    if (action === "edit") {
      updateBnners();
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    try {
      // API Call to save banner
      const savedBanner = await addBanner(selectedBanner, token);

      // Updating UI after successful save
      setBanners([...banners, savedBanner]);

      // Close Modal
      setIsModalOpen(false);
      setSelectedBanner(token);
      fetchBanners();
    } catch (error) {
      toast.error("Unable to save banner");
      // console.error("Error saving banner:", error);
    }
  };

  // Filter banners by type
  const homepageBanners = banners.filter(
    (banner) => banner.type === "HOMEBANNER"
  );
  const smallBanners = banners.filter(
    (banner) => banner.type === "SMALLBANNER"
  );

  return (
    <div className="banner-container">
      {/* Homepage Banner Section */}
      <h1>BANNERS</h1>
      <div className="banner-section">
        <div className="banner-header">
          <h2>Home Page Banner</h2>
          <button
            className="add-banner-btn"
            onClick={(e) => openModal(null, e, null, "HOMEBANNER")}
          >
            <FaPlus /> Add Homepage Banner
          </button>
        </div>

        {/* Homepage Banner List */}
        {homepageBanners.map((banner) => (
          <div key={banner.id} className="banner-item">
            {banner.content_type === "IMAGE" ? (
              <img src={convertS3UrlToLocalPath(banner.url)} alt={banner.title} />
            ) : banner.content_type === "VIDEO" ? (
              <video controls className="img-fluid w-50 w-md-100 rounded">
                <source src={convertS3UrlToLocalPath(banner.url)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : null}

            <div className="px-4">
              <strong>{banner.title}</strong> <br />
              <small>{banner.heading}</small> <br />
              <small>{banner.description}</small>
            </div>
            <button
              onClick={(e) => openModal(banner, e, "edit")}
              className="p-3"
            >
              <FaEdit />
            </button>
            <button onClick={() => handleDelete(banner.id)} className="p-3">
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      {/* Small Banner Section */}
      <div>
        <div className="banner-header">
          <h2>Small Banner</h2>
          <button
            onClick={(e) => openModal(null, e, null, "SMALLBANNER")}
            className="add-banner-btn"
          >
            <FaPlus /> Add Small Banner
          </button>
        </div>

        {/* Small Banner List */}
        {smallBanners.map((banner) => (
          <div key={banner.id} className="banner-item">
            <img src={convertS3UrlToLocalPath(banner.url)} alt={banner.title} />
            <div>
              <strong>{banner.title}</strong> <br />
              <small>{banner.heading}</small> <br />
              <small>{banner.description}</small>
            </div>
            <button
              onClick={(e) => openModal(banner, e, "edit")}
              className="p-3"
            >
              <FaEdit />
            </button>
            <button onClick={() => handleDelete(banner.id)} className="p-3">
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Popup Form */}
      {isModalOpen && selectedBanner !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedBanner.id ? "Edit Banner" : "Add Banner"}</h3>

            {/* Image Upload */}
            <label htmlFor="imageUpload">
              {(selectedBanner?.images?.length > 0 || selectedBanner?.url) && (
                <img
                  src={
                    selectedBanner.content_type === "IMAGE"
                      ? (convertS3UrlToLocalPath(selectedBanner.images || selectedBanner.url))
                      : "/upload-video.png"
                  } // Ensure images[0] is used if it's an array
                  className="modal-image"
                  alt="Banner"
                />
              )}
            </label>

            <div className="mt-2">
              {!selectedBanner.images && !selectedBanner && (
                <div>
                  <label htmlFor="imageUpload" className="">
                    Source: <span className="text-danger">*</span>
                  </label>
                  <div
                    style={{
                      border: "3px dashed rgb(168, 168, 168)",
                      borderRadius: "10px",
                      margin: "15px",
                      padding: "10px",
                    }}
                  >
                    <label htmlFor="imageUpload">
                      <img src="/upload.png" alt="" />
                    </label>
                  </div>
                </div>
              )}
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {/* Form Fields */}
            <div>
              <div className="modal-form-field">
                <label>Link:<span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="Link"
                  value={selectedBanner.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                  className="input-style"
                />
              </div>
              <div className="modal-form-field d-none">
                <label>Title:<span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="Title"
                  value={selectedBanner.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="input-style"
                />
              </div>
              <div className="modal-form-field d-none">
                <label>Heading:<span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="Heading"
                  value={selectedBanner.heading}
                  onChange={(e) => handleInputChange("heading", e.target.value)}
                  className="input-style"
                />
              </div>
              <div className="modal-form-field d-none">
                <label>Description:<span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="Description"
                  value={selectedBanner.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="input-style"
                />
              </div>
              <div className="modal-form-field">
                <label>Order:<span className="text-danger">*</span></label>
                <input
                  type="number"
                  placeholder="Order"
                  value={selectedBanner.order}
                  onChange={(e) => handleInputChange("order", e.target.value)}
                  className="input-style"
                />
              </div>

              {/* Save and Cancel Buttons */}
              <div className="modal-btn-container">
                <button
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button className="save-btn" onClick={handleAction}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerSection;
