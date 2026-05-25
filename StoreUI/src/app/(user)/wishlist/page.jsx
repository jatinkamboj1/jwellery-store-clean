"use client";
import "@/styles/productCard.scss";
import "@/styles/plp.scss";
import "@/styles/pagination.scss";
import "@/styles/sidebar.scss";
import ProductCard from "@/components/ProductCard/productCard";
import { useSession } from "next-auth/react";
import useWishlistStore from "@/store/wishlistStore";
import { useEffect } from "react";
import "@/styles/wishlist.css"


export default function Wishlist() {
    const { data: session, status } = useSession();
    const token = session?.user?.token;
    const { wishlist, fetchWishlist } = useWishlistStore();

    useEffect(()=>{
        if (token) fetchWishlist(token);
    }, [token])

    return (
        <div className="shop-main-wrapper bt-padding">
            <div className="container">
                <div className="section-title text-center">
                    <h2 className="title">Wishlist</h2>
                    <p className="sub-title">Add Wishlist to weekly lineup</p>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="shop-product-wrapper">

                            {wishlist.length > 0 ?(<div className="shop-product-wrap grid-view product-col-4 mbn-30">
                                {wishlist.map((product, index)=> (
                                    <ProductCard product={product.product} key={`pro-${index}`} />
                                ))}
                            </div>):(
                                <></>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
