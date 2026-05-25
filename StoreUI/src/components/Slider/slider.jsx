"use client"
import React, { useEffect, useState } from 'react';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";


const Slider = (props) => {
  const {
    children,
    CustomDotList,
    slides = "banner", 
    showDots = false, 
    arrows = false, 
    infinite = true, 
    autoPlay = true, 
    autoPlaySpeed = 2500, 
    transitionDuration = 600,
    itemAriaLabel="slide"
  } = props;
  const responsive = {
    "banner" : {
      desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 1,
        slidesToSlide: 1 // optional, default to 1.
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1,
        slidesToSlide: 1 // optional, default to 1.
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1 // optional, default to 1.
      }
    },
    2 : {
      desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 2,
        slidesToSlide: 1 // optional, default to 1.
      },
      tablet: {
        breakpoint: { max: 1024, min: 600 },
        items: 2,
        slidesToSlide: 1 // optional, default to 1.
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1 // optional, default to 1.
      }
    },
    3 : {
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 3,
          slidesToSlide: 1 // optional, default to 1.
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 2,
          slidesToSlide: 1 // optional, default to 1.
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1,
          slidesToSlide: 1 // optional, default to 1.
        }
    },
    'product-carousel-4': {
      superLarge: {
        breakpoint: { max: 4000, min: 1024 },
        items: 4
      },
      large: {
        breakpoint: { max: 1024, min: 768 },
        items: 3
      },
      medium: {
        breakpoint: { max: 768, min: 480 },
        items: 2,
        arrows: false
      },
      small: {
        breakpoint: { max: 480, min: 0 },
        items: 1,
        arrows: false
      }
    },
    'product-carousel-4_2':{
      superLarge: {
        breakpoint: { max: 4000, min: 1024 },
        items: 4
      },
      large: {
        breakpoint: { max: 1024, min: 768 },
        items: 3
      },
      medium: {
        breakpoint: { max: 768, min: 480 },
        items: 2,
        arrows: false,
        rows: 1
      },
      small: {
        breakpoint: { max: 480, min: 0 },
        items: 1,
        arrows: false,
        rows: 1
      }
    },
    "brand-logo-carousel": {
      superLarge: {
        breakpoint: { max: 4000, min: 1200 },
        items: 5
      },
      large: {
        breakpoint: { max: 1200, min: 992 },
        items: 4
      },
      medium: {
        breakpoint: { max: 992, min: 768 },
        items: 3,
        arrows: false
      },
      small: {
        breakpoint: { max: 768, min: 480 },
        items: 2,
        arrows: false
      },
      extraSmall: {
        breakpoint: { max: 480, min: 0 },
        items: 1,
        arrows: false
      }
    },
    "blog-carousel-active": {
      superLarge: {
        breakpoint: { max: 4000, min: 992 },
        items: 3
      },
      large: {
        breakpoint: { max: 992, min: 768 },
        items: 2
      },
      small: {
        breakpoint: { max: 768, min: 0 },
        items: 1,
        arrows: false
      }
    }
  };
  
  const CustomDot = ({ onMove, index, onClick, active }) => {
    return (
      <li className={`slider-dot ${active ? "active" : "inactive"}`} onClick={() => onClick()} dangerouslySetInnerHTML={{ __html: CustomDotList[index]}}>
      </li>
    );
  };

  return (
    <Carousel
      keyBoardControl={true}
      swipeable={true}
      draggable={true}
      renderButtonGroupOutside={true}
      showDots={showDots}
      arrows={arrows}
      responsive={slides && responsive[slides]}
      infinite={infinite}
      autoPlay={autoPlay}
      autoPlaySpeed={autoPlaySpeed}
      transitionDuration={transitionDuration}
      itemAriaLabel={itemAriaLabel}
      customDot={CustomDotList && showDots && <CustomDot/>}
    >
      {children}
    </Carousel>
  )
}

export default Slider
