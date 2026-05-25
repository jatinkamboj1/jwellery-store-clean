"use client"
import { getbannerhomepage } from "@/app/api/homepage";
import { convertS3UrlToLocalPath } from "@/utils/util";
import Link from "next/link";
import React, { useEffect, useState } from 'react'

const SmallBanner = () => {
    const [SmallBanner, setSmallBanner] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchSmallBanner = async (filter = "smallbanner") => {
        const response = await getbannerhomepage(filter);
        setSmallBanner(response.data);
        setIsLoaded(true);
    }

    useEffect(() => {
        if (SmallBanner.length < 1 && !isLoaded) {
            fetchSmallBanner();
        }
    }, [SmallBanner, isLoaded]);

    return (
        <>
            <div className="banner-statistics-area banner">
                <div className="container">
                    <div className="row row-20 mtn-20">
                        {SmallBanner?.map((banner, index) => (

                            <div key={`smallbanner-${index}`} className="col-sm-6">
                                <figure className="banner-statistics mt-20">
                                    {banner.link ? (
                                        <Link href={banner.link ?? '#'}>
                                            <img className="" height="200px" src={convertS3UrlToLocalPath(banner.url)} alt={banner.title} />
                                        </Link>
                                    ):(
                                        <img className="" height="200px" src={convertS3UrlToLocalPath(banner.url)} alt={banner.title} />
                                    )}
                                    <div className="banner-content text-right">
                                        <h5 className="banner-text1">{banner.title}</h5>
                                        <h2 className="banner-text2">{banner.description}</h2>
                                        {/* <a href={banner.link} className="btn btn-text">Shop Now</a> */}
                                    </div>
                                </figure>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default SmallBanner