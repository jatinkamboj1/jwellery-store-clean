"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoMdCall } from "react-icons/io";
import { FaFacebook, FaInstagram, FaPinterest } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getSettings } from "../../app/api/settings";

const SocialHeader = () => {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState("Free Shipping Anywhere in India for orders above Rs 499");

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSettings();
      if (data && data.announcement) {
        setAnnouncement(data.announcement);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className={`social-header-main-area sticky`}>
      <div className=" px-2 md-px-5 d-flex justify-content-between align-items-center">
        <div className="d-none d-md-flex align-items-center justify-content-center gap-2 h6 text-light my-auto py-1">
          <Link
            href="#"
            className="inline-flex p-1 rounded-circle items-center justify-center w-5 h-5 rounded-full text-dark hover:bg-black hover:text-blue-600 transition"
          >
            <FaFacebook size={20} />
          </Link>
          <Link
            href="#"
            className="inline-flex p-1 rounded-circle items-center justify-center w-5 h-5 rounded-full text-dark hover:bg-black hover:text-blue-600 transition"
          >
            <FaInstagram size={20} />
          </Link>
          <Link
            href="#"
            className="inline-flex p-1 rounded-circle items-center justify-center w-5 h-5 rounded-full text-dark hover:bg-black hover:text-blue-600 transition"
          >
            <FaPinterest size={20} />
          </Link>
        </div>
        <div>
          <marquee direction="left" class="d-block d-sm-none text-sm text-dark">
            {announcement}
          </marquee>

          <span class="d-none d-sm-inline text-sm text-dark">
            {announcement}
          </span>

        </div>
        <div className="hidden sm:flex items-center gap-2 text-gray-700 text-sm whitespace-nowrap">
          <span className="font-semibold">Contact Us:</span>
          <a
            href="mailto:weddingtouchbysaadgi@gmail.com"
            className="hover:text-blue-600 transition-colors"
          >
            weddingtouchbysaadgi@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default SocialHeader;
