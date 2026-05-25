"use client";
import { useEffect, useState } from "react";
import Slider from "../Slider/slider";
import { fetchAllTestimonials } from "@/app/api/testimonials";

export default function Testimonial() {
    const [testimonials, setTestimonials] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchTestimonials = async () => {
        const response = await fetchAllTestimonials(0, 0);
        setTestimonials(response?.testimonials);
        setIsLoaded(true);
    }

    useEffect(() => {
        if (testimonials.length < 1 && !isLoaded) {
            fetchTestimonials();
        }
    }, [testimonials, isLoaded]);

    if (!(testimonials?.length > 0)) {
        return (<></>);
    }
    return (
        <section className="testimonial-area section-padding bg-img" style={{ backgroundImage: 'url("/assets/images/testimonials-bg.jpg")' }}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="section-title text-center">
                            <h2 className="title">testimonials</h2>
                            <p className="sub-title">What they say</p>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="testimonial-content-wrapper">
                            <Slider>
                                {testimonials?.map((testimonial, key) => (
                                    <div key={`testimonial-${key}`} className="testimonial-content">
                                        <p>{testimonial.review}</p>
                                        <div className="ratings">
                                            {Array.from({ length: testimonial.rating }).map((_, index) => (
                                                <span key={`rating--${index}`}><i className="fa fa-star-o"></i></span>
                                            ))}
                                        </div>
                                        <h5 className="testimonial-author">{testimonial.name}</h5>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}