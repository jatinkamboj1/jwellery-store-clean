import Slider from "@/components/Slider/slider";
import Image from "next/image";
import "@/styles/homepage.scss";
import "@/styles/productCard.scss";
import "@/styles/blogPLP.scss";
import "@/styles/testimonials.scss";
import "@/styles/sliders.scss";
import "@/styles/policies.scss";
// import { getbannerhomepage } from "./api/homepage";
import Slider_Section from "@/components/Slider_Section/Slider_Section";
import SmallBanner from "@/components/SmallBanner/SmallBanner";
import FeaturedProduct from "@/components/FeaturedProduct/FeaturedProduct";
import LatestProduct from "@/components/LatestProduct/LatestProduct";
import FilterCateroy from "@/components/FilterCategory/FilterCateroy";
import Testimonial from "@/components/Testimonial/Testimonial";
import FeaturedCategory from "@/components/FeaturedCategory/FeaturedCategory";


export default function Home() {
    // const [homeBanner, setHomeBanner] = useState("SMALLBAnner");

    // const fetchHomeBanner = async (filter = "HOMEBANNER") => {
    //     const response = await getbannerhomepage(filter);
    //     //console.log("fetchHomeBanner data", response);
    // }

    // const fetchSmallBanner = async (filter = "smallbanner") => {
    //     const response = await getbannerhomepage(filter);
    //     //console.log("fetchamallbanner data", response);
    // }

    // fetchHomeBanner();
    // fetchSmallBanner();


    return (
        <main>
            <section className="slider-area">
                <Slider_Section />
            </section>
            <div className="twitter-feed">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="twitter-feed-content text-center">
                                <p>Explore our exquisite jewelry collection, featuring timeless designs and stunning craftsmanship. Find the perfect piece to elevate your style and make every moment special.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SmallBanner />
            <LatestProduct />
            <FeaturedCategory />
            <FeaturedProduct />
            <Testimonial />

            <div className="service-policy section-padding">
                <div className="container">
                    <div className="row mtn-30">
                        <div className="col-6 col-lg-3">
                            <div className="policy-item">
                                <div className="policy-icon">
                                    <i className="pe-7s-plane"></i>
                                </div>
                                <div className="policy-content">
                                    <h6>Free Shipping</h6>
                                    <p>Free shipping all order</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="policy-item">
                                <div className="policy-icon">
                                    <i className="pe-7s-help2"></i>
                                </div>
                                <div className="policy-content">
                                    <h6>Support 24/7</h6>
                                    <p>Support 24 hours a day</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="policy-item">
                                <div className="policy-icon">
                                    <i className="pe-7s-back"></i>
                                </div>
                                <div className="policy-content">
                                    <h6>Money Return</h6>
                                    <p>30 days for free return</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="policy-item">
                                <div className="policy-icon">
                                    <i className="pe-7s-credit"></i>
                                </div>
                                <div className="policy-content">
                                    <h6>100% Payment Secure</h6>
                                    <p>We ensure secure payment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
