import React from "react";
import Image from "next/image";
import Script from "next/script";

const Footer = () => {
  return (
    <>
      <div className="scroll-top not-visible">
        <i className="fa fa-angle-up"></i>
      </div>
      <footer className="footer-widget-area">
        <div className="footer-top section-padding">
          <div className="container">
            <div className="row">
              <div className="col-lg-3 col-md-4 col-sm-7">
                <div className="widget-item">
                  <div className="widget-title">
                    <div className="widget-logo">
                      <a href="/">
                        <img
                          src="/assets/logo.png"
                          loading="lazy"
                          alt="brand logo"
                        />
                      </a>
                    </div>
                  </div>
                  <div className="newsletter-wrapper">
                    <p className="newsletter-wrapper-text">Be the first to know about sales, new product launches and exclusive offers!</p>
                    <form className="newsletter-inner" id="mc-form">
                      <input
                        type="email"
                        className="news-field"
                        id="mc-email"
                        autoComplete="off"
                        placeholder="Enter your email address"
                      />
                      <button className="news-btn" id="mc-submit">
                        <i className="pe-7s-mail" />
                      </button>
                    </form>
                  </div>
                  <div className="footer-payment mt-3">
                    <img
                      src="/assets/images/icon/payment.png"
                      alt="payment method"
                    />
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-2 col-sm-5">
                <div className="widget-item">
                  <h6 className="widget-title">Company</h6>
                  <div className="widget-body">
                    <address className="contact-block">
                      <ul>
                        <li>
                          <a href="#">Careers</a>
                        </li>
                        <li>
                          <a href="/about-us">About Us</a>
                        </li>
                        <li>
                          <a href="#">Locate Stores</a>
                        </li>
                        <li>
                          <a href="/contact-us">Contact Us</a>
                        </li>
                        <li>
                          <a href="#">Sitemap</a>
                        </li>
                        <li>
                          <a href="#">Blogs</a>
                        </li>
                        <li>
                          <a href="#">Happy Customers</a>
                        </li>
                      </ul>
                    </address>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-3 col-sm-5">
                <div className="widget-item">
                  <h6 className="widget-title">Policy</h6>
                  <div className="widget-body">
                    <address className="contact-block">
                      <ul>
                        <li>
                          <a href="#">Track Orders</a>
                        </li>
                        <li>
                          <a href="#">Returns Center</a>
                        </li>
                        <li>
                          <a href="#">Shipping and Delivery</a>
                        </li>
                        <li>
                          <a href="#">Return Policy</a>
                        </li>
                        <li>
                          <a href="#">E & S Policy</a>
                        </li>
                        <li>
                          <a href="#">Grievances</a>
                        </li>
                        <li>
                          <a href="#">Terms of Service</a>
                        </li>
                        <li>
                          <a href="#">Offer T&C</a>
                        </li>
                        <li>
                          <a href="#">Privacy Policy</a>
                        </li>
                      </ul>
                    </address>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-3 col-sm-5">
                <div className="widget-item">
                  <h6 className="widget-title">Support Details</h6>
                  <div className="widget-body">
                    <ul className="contact-block contacter">
                      <li>
                      <span>Phone/Whatsapp</span>
                        <a href="tel:+918968945525">
                          (+91) 8968945525
                        </a>
                      </li>
                      <li>
                        <span>Contact us at</span>
                        <a href="mailto:weddingtouchbysaadgi@gmail.com">
                          weddingtouchbysaadgi@gmail.com
                        </a>
                      </li>
                      <li>
                        <span>Live Chat Support</span>
                        <a href="#">
                          Mon - Sat (10 AM - 7 PM)
                        </a>
                      </li>
                      <li>
                        <span>Call Support</span>
                        <a href="#">
                            Mon - Sat (10 AM - 7 PM)
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="row ">
              <div className="col text-center d-flex justify-content-center">
                <div className="copyright-text">
                  <p className="mb-0">
                    Copyright &copy; 2025 <b>WEEDING TOUCH BY SAADGI </b>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
