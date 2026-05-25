"use client";
import React, { useEffect, useState } from "react";
import Slider from "@/components/Slider/slider";
import { getbannerhomepage } from "@/app/api/homepage";
import Link from "next/link";
import { convertS3UrlToLocalPath } from "@/utils/util";

const Slider_Section = () => {
  const [HomeBanner, setHomeBanner] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchHomeBanner = async (filter = "HOMEBANNER") => {
    const response = await getbannerhomepage(filter);
    setHomeBanner(response.data);
    setIsLoaded(true);
  };

  useEffect(() => {
    if (HomeBanner.length < 1 && !isLoaded) {
      fetchHomeBanner();
    }
  }, [HomeBanner, isLoaded]);

  return (
    <>
      <section className="slider-area">
        <Slider arrows={true}>
          {HomeBanner?.map((slide) =>
            slide?.link ? (
              slide.content_type === "VIDEO" ? (
                <Link href={slide.link} key={slide.id} relative>
                  <video src={convertS3UrlToLocalPath(slide.url)} autoPlay loop muted playsInline style={{width: "100%", height: "50vh", objectFit: "cover", position:"absolute", zIndex:"1"}}>
                    <source src={convertS3UrlToLocalPath(slide.url)} type="video/mp4" />
                  </video>
                  <div className="container absolute z-40">
                    <div className="row">
                      <div className="col-md-12">
                        <div
                          className={`hero-slider-content ${slide.slideClass}`}
                        >
                          <h2 className="slide-title">
                            {slide.title} <span>{slide.subtitle}</span>
                          </h2>
                          <h4 className="slide-desc">{slide.description}</h4>
                          {slide.link && slide.heading && (
                            <Link href={slide.link} className="btn btn-hero">
                              {slide.heading}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                href={slide.link}
                key={slide.id}
                className="hero-single-slide hero-overlay"
              >
                <div
                  className="hero-slider-item bg-img"
                  style={
                    slide.content_type === "IMAGE"
                      ? { backgroundImage: `url("${convertS3UrlToLocalPath(slide.url)}")` }
                      : {}
                  }
                >
                  <div className="container">
                    <div className="row">
                      <div className="col-md-12">
                        <div
                          className={`hero-slider-content ${slide.slideClass}`}
                        >
                          <h2 className="slide-title">
                            {slide.title} <span>{slide.subtitle}</span>
                          </h2>
                          <h4 className="slide-desc">{slide.description}</h4>
                          {slide.link && slide.heading && (
                            <Link href={slide.link} className="btn btn-hero">
                              {slide.heading}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              )
            ) : (
              <div key={slide.id} className="hero-single-slide">
                <div
                  className="hero-slider-item bg-img"
                  style={{ backgroundImage: `url("${convertS3UrlToLocalPath(slide.url)}")` }}
                >
                  <div className="container">
                    <div className="row">
                      <div className="col-md-12">
                        <div
                          className={`hero-slider-content ${slide.slideClass}`}
                        >
                          <h2 className="slide-title">
                            {slide.title} <span>{slide.subtitle}</span>
                          </h2>
                          <h4 className="slide-desc">{slide.description}</h4>
                          {slide.link && slide.heading && (
                            <Link href={slide.link} className="btn btn-hero">
                              {slide.heading}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </Slider>
      </section>
    </>
  );
};

export default Slider_Section;
