"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoMdCall } from "react-icons/io";
import { FaFacebook, FaInstagram, FaPinterest } from "react-icons/fa";

const SocialHeader = () => {
  const router = useRouter();

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
            Free Shipping Anywhere in India for orders above Rs 499
          </marquee>

          <span class="d-none d-sm-inline text-sm text-dark">
            Free Shipping Anywhere in India for orders above Rs 499
          </span>

        </div>
        <div class="d-none d-sm-block">
          <Link href={"/contact-us"} className="d-flex align-items-center gap-2 text-dark text-sm md:text-base">
            <IoMdCall size={20} /> <span className="d-none d-md-block">Contact Us</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SocialHeader;
