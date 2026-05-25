"use client"
import React, { useState } from 'react'
import Slider from "@/components/Slider/slider";
import { fetchProductsCard } from '@/app/api/products';
import ProductCard from '../ProductCard/productCard';

const FeaturedProduct = () => {
    const [FeaturedProducts, setFeaturedProduct] = useState([]);
    const fetchFeaturedProduct = async () => {
        const response = await fetchProductsCard(0, 10, { visible_on: 'HOMEPAGE' });
        setFeaturedProduct(response?.data?.products);
    }

    useState(() => {
        if (FeaturedProducts.length < 1) {
            fetchFeaturedProduct();
        }
    },[FeaturedProducts]);

    if (FeaturedProducts?.length < 1) {
        return (<></>);
    }

    return (
        <section className="product-area section-padding">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                            <div className="section-title text-center">
                                <h2 className="title">Featured Products</h2>
                                <p className="sub-title">Add featured products to weekly lineup</p>
                            </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="product-container">
                            <Slider slides="product-carousel-4" autoPlay={false} arrows={true}>
                                {FeaturedProducts?.map((product) => (
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



export default FeaturedProduct