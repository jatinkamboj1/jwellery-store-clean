"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LogoutUser } from "@/utils/auth";


const links = [
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 13.1c-4.4 0-8 3.4-8-3C0 5.6 3.6 2 8 2s8 3.6 8 8.1c0 6.4-3.6 3-8 3M8 4c-3.3 0-6 2.7-6 6 0 4 2.4.9 5 .2 0-.3.1-.7.4-1l3-2.3c.4-.3 1-.2 1.3.3s.2 1.1-.2 1.4l-2.2 1.7c2.5.9 4.8 3.6 4.8-.2C14 6.7 11.3 4 8 4"/>
                </svg>`,
    name: "Dashboard",
    link: "/admin",
  },

  {
    id: 0,
    icon: `<svg fill="#fff" width="1em" height="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M21,2H3A1,1,0,0,0,2,3V21a1,1,0,0,0,1,1H21a1,1,0,0,0,1-1V3A1,1,0,0,0,21,2ZM20,20H4V4H20Z"/>
</svg>`,
    name: "Banners",
    link: "/admin/bannerSection",
  },
  {
    id: 1,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path style={{ opacity: "1", fill: "#000", fillOpacity: "1", stroke: "none", strokeWidth: ".49999997", strokeMiterlimit: "4", strokeDasharray: "none", strokeOpacity: "1" }} d="M8 2.128 4.528 7.472h6.928zm-3.472 6.4A2.926 2.926 0 0 0 1.6 11.472a2.928 2.928 0 1 0 2.928 -2.944m4 0V14.4H14.4V8.528z" /></svg>`,
    name: "Catalog",
    link: "/admin/category",
  },
  {
    id: 2,
    icon: `<svg width="16" height="16" viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg"><path d="M1.48.84a.04.04 0 0 1 .04.037v.563a.12.12 0 0 1-.116.12H.6a.12.12 0 0 1-.12-.116V.88A.04.04 0 0 1 .517.84zm-.31.167-.002.002-.229.248-.104-.1a.03.03 0 0 0-.04-.002l-.002.002-.043.038a.024.024 0 0 0-.002.036l.002.002.147.139a.06.06 0 0 0 .043.018.06.06 0 0 0 .043-.018l.117-.125.009-.009.008-.009.011-.012.004-.004.008-.009.112-.119a.03.03 0 0 0 .002-.036l-.002-.002-.043-.038a.03.03 0 0 0-.04-.002M1.48.44a.12.12 0 0 1 .12.12v.12a.04.04 0 0 1-.04.04H.44A.04.04 0 0 1 .4.68V.56A.12.12 0 0 1 .52.44z" /></svg>`,
    name: "Products",
    link: "/admin/product",
  },
  {
    id: 3,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"><path d="M8 10c-3.3 0-6 2.7-6 6H0c0-3.2 1.9-6 4.7-7.3C3.7 7.8 3 6.5 3 5c0-2.8 2.2-5 5-5s5 2.2 5 5c0 1.5-.7 2.8-1.7 3.7 2.8 1.3 4.7 4 4.7 7.3h-2c0-3.3-2.7-6-6-6m0-8C6.3 2 5 3.3 5 5s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3" /></svg>`,
    name: "Customers",
    link: "/admin/customer",
  },
  {
    id: 3,
    icon: `
<svg fill="#fff" width="1em" height="1em" viewBox="0 0 14 14" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <path d="m 1.4358383,12.895149 c -0.38924,-0.1993 -0.43281,-0.3751 -0.41279,-1.665 0.0158,-1.0195 0.0314,-1.1697 0.14735,-1.4205004 0.26312,-0.5694 0.88589,-1.0631 1.46037,-1.1579 l 0.21,-0.035 0.62728,1.0597 c 0.345,0.5829004 0.63415,1.0358004 0.64256,1.0065004 0.008,-0.029 0.0415,-0.3472 0.0736,-0.7065004 0.0525,-0.5882 0.0468,-0.6826 -0.0575,-0.9472 -0.0637,-0.1617 -0.11586,-0.32 -0.11586,-0.3517 0,-0.033 0.26499,-0.058 0.62678,-0.058 l 0.62678,0 -0.12063,0.345 c -0.10456,0.2991 -0.11523,0.4309 -0.0802,0.9905 0.0222,0.3551004 0.0611,0.6584004 0.0864,0.6740004 0.0253,0.016 0.32158,-0.4318 0.65846,-0.9942004 l 0.61252,-1.0226 0.18995,0.04 c 0.58752,0.1229 1.19054,0.5979 1.42811,1.1248 0.12949,0.2872004 0.1425,0.4062004 0.1588,1.4528004 0.0156,0.9994 0.005,1.1659 -0.0896,1.35 -0.21721,0.425 -0.1746,0.4199 -3.4974,0.4199 -2.70948,0 -2.98802,-0.01 -3.17496,-0.1049 z m 2.71495,-4.9624004 c -0.76247,-0.3317 -1.3488,-1.7133 -1.07583,-2.5352 0.48535,-1.4612 2.58633,-1.4612 3.07167,0 0.27559,0.8297 -0.31945,2.2162 -1.08916,2.5378 -0.25463,0.1064 -0.65878,0.1053 -0.90668,0 z m 3.58006,-2.0213 0,-0.6365 -0.34018,-0.028 c -0.27583,-0.023 -0.36661,-0.059 -0.48,-0.1908 -0.13962,-0.1623 -0.13984,-0.1653 -0.13984,-1.9339 l 0,-1.7713 0.17539,-0.1754 0.17539,-0.1753 2.76131,0 2.7613097,0 0.16835,0.1448 0.16835,0.1448 0,1.8101 0,1.8102 -0.19595,0.175 -0.19595,0.1751 -1.7831,0 -1.7830997,0 -0.64599,0.644 -0.64599,0.644 0,-0.6366 z"/>
</svg>`,
    name: "Testimonials",
    link: "/admin/testimonials",
  },
  {
    id: 4,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"><path d="M14.2 10.3c-.1.4-.5.7-.9.7H4.8c-.5 0-.9-.3-1-.8L2.2 4c-.1-.6-.6-1-1.2-1H.4C.2 3 0 2.8 0 2.6V1.4c0-.2.2-.4.4-.4h1.4c1 0 1.9.7 2.1 1.7l1.5 6.1c.1.1.3.2.4.2h6.5c.1 0 .2-.1.3-.2l1.1-3.4c.1-.2 0-.4-.2-.4H7.4c-.2 0-.4-.2-.4-.4V3.4c0-.2.2-.4.4-.4H15c.6 0 1 .4 1 1v1zM4.5 13c.8 0 1.5.7 1.5 1.5S5.3 16 4.5 16 3 15.3 3 14.5 3.7 13 4.5 13m7 0c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5" /></svg>`,
    name: "Orders",
    link: "/admin/order",
  },
  {
    id: 5,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"><path d="M11.5 3C12.9 3 14 4.1 14 5.5c0 2.7-4.3 6.4-6 7.4-1.7-1-6-4.7-6-7.4C2 4.1 3.1 3 4.5 3c.8 0 1.5.3 1.9.9L8 5.3l1.6-1.4c.4-.6 1.1-.9 1.9-.9m0-2c-1.4 0-2.7.6-3.5 1.7C7.2 1.6 5.9 1 4.5 1 2 1 0 3 0 5.5 0 10 7 15 8 15s8-5 8-9.5C16 3 14 1 11.5 1" /></svg>`,
    name: "Marketing",
    link: "/admin/coupon",
  },
];
const SideNav = () => {
  const [activeNo, setActiveNo] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    LogoutUser();
  };

  const pathname = usePathname();
  const activeStyle = {
    backgroundColor: "#264177",
    fontWeight: "bold",
    color: "white",
    borderLeft: "4px solid #1e3a8a",
  };
  function handelDrop(value) {
    if (value === activeNo) {
      setActiveNo(0);
    } else {
      setActiveNo(value);
    }
  }
  const handleDropdown = (value) => {
    setActiveNo(activeNo === value ? null : value);
  };
  const plus = `<svg width="18" height="18" viewBox="0 0 0.36 0.36" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M.18.045a.02.02 0 0 0-.022.022v.09h-.09a.022.022 0 1 0 0 .045h.09v.09a.022.022 0 1 0 .045 0v-.09h.09a.022.022 0 1 0 0-.045H.202V.068A.02.02 0 0 0 .18.046" /></svg>`;
  const minus = `<svg width="18" height="18" viewBox="0 0 0.54 0.54" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M.405.247h-.27a.045.045 0 0 0 0 .09h.27a.045.045 0 0 0 0-.09" /></svg>`;
  return (
    <div className="sa-app__sidebar" style={{width: isMenuOpen?240:""}}>
      <div className="sa-sidebar">
      <div className="sa-app__sidebar-closeOff"  onClick={()=>setIsMenuOpen(!isMenuOpen)}>
          <i className={isMenuOpen ? "pe-7s-angle-left":"pe-7s-angle-right"}></i>
      </div>
        <div className="sa-sidebar__header">
        <Link href={"/admin"}>
          <Image
            height={52}
            width={240}
            src="/assets/logo1.png"
            alt="Brand Logo"
            />
          </Link>
        </div>
        <div className="sa-sidebar__body">
          <ul className="sa-nav sa-nav--sidebar">
            <li className="sa-nav__section">
              <ul className="sa-nav__menu sa-nav__menu--root">
                {links.map((item, index) => (
                  <li
                    key={`menu-${index}`}
                    className={`sa-nav__menu-item sa-nav__menu-item--has-icon ${
                      activeNo == item.id ||
                      item.sub?.some((sub) => pathname === sub.link)
                        ? "sa-nav__menu-item--open"
                        : ""
                    }`}
                  >
                    {item.sub && item.sub.length > 0 ? (
                      <>
                        <a
                          onClick={() => handleDropdown(item.id)}
                          className="sa-nav__link"
                        >
                          <span
                            className="sa-nav__icon"
                            dangerouslySetInnerHTML={{ __html: item.icon }}
                          />
                          <span className="sa-nav__title">{item.name}</span>
                          <span className="sa-nav__arrow">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="6"
                              height="9"
                              viewBox="0 0 6 9"
                              fill="currentColor"
                            >
                              <path d="M5.605.213c.402.4.502.999.101 1.399l-3.01 2.899 3.01 2.898c.401.4.401 1.1-.101 1.399-.401.3-.903.3-1.304-.099L-.013 4.511 4.401.313c.301-.4.903-.4 1.204-.1" />
                            </svg>
                          </span>
                        </a>
                        <ul className="sa-nav__menu sa-nav__menu--sub">
                          {item.sub.map((sub, index) => (
                            <li
                              key={`submenu-${index}`}
                              className="sa-nav__menu-item"
                            >
                              <Link
                                href={sub.link}
                                className="sa-nav__link"
                                style={pathname === sub.link ? activeStyle : {}}
                              >
                                <span className="sa-nav__menu-item-padding"></span>
                                <span className="sa-nav__title">
                                  {sub.name}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <a
                        href={item.link}
                        onClick={() => handleDropdown(item.id)}
                        className="sa-nav__link"
                      >
                        <span
                          className="sa-nav__icon"
                          dangerouslySetInnerHTML={{ __html: item.icon }}
                        />
                        <span className="sa-nav__title">{item.name}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <ul>
                <li>
                  <p className="sa-nav__link" onClick={(e) => handleLogout(e)}>
                    Logout
                  </p>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <div className="sa-app__sidebar-shadow"></div>
      <div className="sa-app__sidebar-backdrop"></div>
    </div>
  );
};

export default SideNav;
