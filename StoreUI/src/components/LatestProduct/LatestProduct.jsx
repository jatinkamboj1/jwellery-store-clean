"use client"
import React, { useState } from 'react'
import Slider from "@/components/Slider/slider";
import { fetchProductsCard } from '@/app/api/products';
import ProductCard from '../ProductCard/productCard';

const LatestProduct = () => {
    const [LatestProducts, setLatestProduct] = useState([]);
    const fetchFeaturedProduct = async () => {
        const response = await fetchProductsCard(0, 10, { sortBy: 'createdAt' });
        setLatestProduct(response?.data?.products);
    }

    useState(() => {
        if (LatestProducts.length < 1) {
            fetchFeaturedProduct();
        }
    },[LatestProducts]);

    if (LatestProducts?.length < 1) {
        return(<></>);
    }

    return (
        <section className="product-area section-padding">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="section-title text-center">
                            <h2 className="title">Latest products</h2>
                            <p className="sub-title">Add our products to weekly lineup</p>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="product-container">
                            <Slider slides="product-carousel-4" autoPlay={false} arrows={true}>
                                {LatestProducts?.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};



export default LatestProduct