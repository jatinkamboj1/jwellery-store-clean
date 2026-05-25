"use client"
import React, { useState } from 'react'
import Slider from "@/components/Slider/slider";
import { fetchAllCategories } from '@/app/api/categories';
import Link from 'next/link';
import { convertS3UrlToLocalPath } from '@/utils/util';

const FeaturedCategory = () => {
    const [FeaturedCategories, setFeaturedCategory] = useState([]);
    const fetchFeaturedCategory = async () => {
        const response = await fetchAllCategories(0, 10, {  images: "true" });
        setFeaturedCategory(response?.categories);
    }

    useState(() => {
        if (FeaturedCategories.length < 1) {
            fetchFeaturedCategory();
        }
    },[FeaturedCategories]);

    if (FeaturedCategories?.length < 1) {
        return (<></>);
    }
    return (
        <section className="product-banner-statistics">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <Slider slides="product-carousel-4" arrows={true}>
                            {/* {FeaturedCategories.map((cat,i)=>( */}
                            {FeaturedCategories?.map((cat, i) => (
                                <Link href={`/category/${cat.slug}`} key={`FeaturedCategories-${i}`} className="banner-slide-item">
                                    <figure className="banner-statistics">
                                        <img src={convertS3UrlToLocalPath(cat.images[0].url)} alt="product banner" />
                                        <div className="banner-content banner-content_style2">
                                            <h5 className="banner-text3">{cat.categoryName}</h5>
                                        </div>
                                    </figure>
                                </Link>
                            ))}
                        </Slider>
                    </div>
                </div>
            </div>
        </section>
    );
};



export default FeaturedCategory