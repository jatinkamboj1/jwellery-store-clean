"use client"
import { getFeaturedCategory } from "@/app/api/homepage";
import Slider from "@/components/Slider/slider";
import { convertS3UrlToLocalPath } from "@/utils/util";
import { useEffect, useState } from "react";

const FilterCateroy = () => {
    const [FeturedCategory, setFeturedCategory] = useState([]);

    const featurecategory = async () => {
        const response = await getFeaturedCategory("HOMEPAGE");
        setFeturedCategory(response.categories);
    }
    useEffect(() => {
        featurecategory();
    },[])
    return (
        <section className="product-banner-statistics">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <Slider slides="product-carousel-4">
                            {FeturedCategory.map((item, index) => (
                                <div className="banner-slide-item" key={index}>
                                    <figure className="banner-statistics">
                                        <a href="#">
                                            <img src={convertS3UrlToLocalPath(item.images[0].url)} alt={item.alt} />
                                        </a>
                                        <div className="banner-content banner-content_style2">
                                            <h5 className="banner-text3">
                                                <a href="#">{item.categoryName}</a>
                                            </h5>
                                        </div>
                                    </figure>
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FilterCateroy;
