"use client";
import "@/styles/productCard.scss";
import "@/styles/pagination.scss";
import "@/styles/sidebar.scss";
import "@/styles/plp.scss";
import ProductCard from "@/components/ProductCard/productCard";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProductsCard, getProductsByCategoryId } from "@/app/api/products";
import { fetchCategoryBySlug } from "@/app/api/categories";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import Link from "next/link";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
export default function Category() {
    const { id } = useParams();
    const [products, setProducts] = useState();
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100);
    const [pageDetails, setPageDetails] = useState({
        total: 1,
        currentPage: 0,
        limit: 12,
        totalPages: 1,
        filterPrice: {
            min:0,
            max:100
        }
    });
    const [filter, setFilter] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false); // State to control aside bar visibility

    const fetchProducts = async () => {
        try {
            const response = await fetchProductsCard(pageDetails.currentPage, pageDetails.limit, { name: id, ...filter });
            if (response) {
                // //console.log("fetchProductsCard: ", response);
                setProducts(response?.data?.products);
                const {filterPrice, ...data} = response?.data?.pageDetails;
                if (filterPrice?.min && filterPrice.min < pageDetails.filterPrice.min) {
                    data.filterPrice.min = filterPrice.min;
                }
                if (filterPrice?.max && filterPrice.max > pageDetails.filterPrice.max) {
                    data.filterPrice.max = filterPrice.max;
                    setMaxPrice(filterPrice.max);
                }
                setPageDetails((prev)=>({...prev, ...data}));
            }
        } catch (error) { }
    };

    // Filter
    const handleDrage = (e) => {
        setMinPrice(e[0]);
        setMaxPrice(e[1]);
    };

    const handleFilter = () => {
        setFilter({
            minPrice,
            maxPrice
        });
        setPageDetails({ currentPage: 0 });
    };

    const handleSort = (e) => {
        const value = e.target.value;
        const [sortBy, sortOrder] = value.split('-');
        
        setFilter({
            sortBy,
            sortOrder
        });
        setPageDetails({ currentPage: 0 });
    };

    // Handle Page Change
    const handlePageChange = (newPage) => {
        if (newPage < 0 || newPage >= pageDetails.totalPages) return;

        setPageDetails((prev) => ({
            ...prev,
            currentPage: newPage,
        }));
    };

    useEffect(() => {
        fetchProducts();
    }, [pageDetails.currentPage, filter]);

    if (!products) {
        return <LoadingScreen />
    }

    return (
        <div className="shop-main-wrapper bt-padding">
            <div className="container">
                <div className="section-title text-center">
                    <h2 className="title">Search Results</h2>
                    <p className="sub-title">Searching for product &quot;{id}&quot;</p>
                </div>
                {products.length > 0 ? (
                    <>
                    <div className="row">
                        <div className={`col-12 col-md-4 col-lg-3 filter-sidebar ${isFilterOpen ? 'open' : ''}`}>
                            <aside className="sidebar-wrapper">
                                <div className="btn-close-filter"  onClick={()=>setIsFilterOpen(false)}>
                                    <i className="pe-7s-close"></i>
                                </div>
                                <div className="d-block d-md-none sidebar-single">
                                    <h5 className="sidebar-title">Sort By</h5>
                                    <div className="sidebar-body">
                                        <select className="nice-select w-100" name="sortby" onChange={handleSort}>
                                            <option value="name-asc">Relevance</option>
                                            <option value="price-asc">Price (Low - High)</option>
                                            <option value="price-desc">Price (High - Low)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mobile-of">
                                    {products.length > 0 ? (
                                        <>
                                            <div className="sidebar-single">
                                                <h5 className="sidebar-title">Price</h5>
                                                <div className="sidebar-body">
                                                    <div className="price-range-wrap">
                                                        <div className="price-range">
                                                            <div className="price-input">
                                                                <span>Min Price: ₹{minPrice}</span>
                                                                <span style={{ marginInlineStart: 30 }}>Max Price: ₹{maxPrice}</span>
                                                            </div>
                                                            <RangeSlider value={[minPrice, maxPrice]} min={pageDetails?.filterPrice.min} max={pageDetails?.filterPrice.max} onInput={(e) => { handleDrage(e); }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="sidebar-single">
                                                <button onClick={handleFilter} className="filter-btn">Apply filter</button>
                                            </div>
                                        </>
                                    ) : (<></>)}
                                </div>

                            </aside>
                        </div>
                        <div className="col-12 col-md-8 col-lg-9">
                            <div className="shop-product-wrapper">
                                <div className="shop-top-bar">
                                    <div className="row align-items-center">
                                        <div className="col-lg-7 col-md-6 order-2 order-md-1">
                                            <div className="top-bar-left">
                                                <div className="product-amount">
                                                    <p>Showing  {(pageDetails.limit * pageDetails.currentPage) + 1} - {pageDetails.total < (pageDetails.limit * (pageDetails.currentPage + 1)) ? pageDetails.total : pageDetails.limit * (pageDetails.currentPage + 1)} of {pageDetails.total} results</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-none d-md-block col-lg-5 col-md-6 order-1 order-md-2">
                                            <div className="top-bar-right">
                                                <div className="product-short">
                                                    <p>Sort By : </p>
                                                    <select className="nice-select" name="sortby" onChange={handleSort}>
                                                        <option value="name-asc">Relevance</option>
                                                        <option value="price-asc">Price (Low - High)</option>
                                                        <option value="price-desc">Price (High - Low)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="shop-product-wrap grid-view product-col-3 mbn-30">
                                    {products && products.map((product, index) => (
                                        <ProductCard product={product} key={`pro-${index}`} />
                                    ))}
                                </div>

                                <div className="paginatoin-area text-center">
                                    <ul className="pagination-box">
                                        {/* Previous Button */}
                                        <li
                                            onClick={() => handlePageChange(pageDetails.currentPage - 1)}
                                            className={pageDetails.currentPage < 1 ? "disabled" : ""}
                                        >
                                            <button className="previous">
                                                <i className="pe-7s-angle-left"></i>
                                            </button>
                                        </li>

                                        {/* Page Numbers */}
                                        {(() => {
                                            let pages = [];
                                            const totalPages = Math.ceil(pageDetails.total / pageDetails.limit);
                                            const currentPage = pageDetails.currentPage;

                                            if (totalPages <= 10) {
                                                pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                                            } else {
                                                let startPage = Math.max(0, currentPage - 4);
                                                let endPage = Math.min(totalPages, currentPage + 5);

                                                if (startPage > 4) pages.push(0, "...");
                                                for (let i = startPage; i <= endPage; i++) {
                                                    pages.push(i);
                                                }
                                                if (endPage < totalPages) pages.push("...", totalPages);
                                            }
                                            return pages.map((page, index) => (
                                                <li
                                                    key={index}
                                                    className={`${currentPage + 1 === page ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
                                                >
                                                    {page === "..." ? (
                                                        <span>...</span>
                                                    ) : (
                                                        <button onClick={() => handlePageChange((page - 1))}>
                                                            {page}
                                                        </button>
                                                    )}
                                                </li>
                                            ));
                                        })()}

                                        {/* Next Button */}
                                        <li
                                            onClick={() => handlePageChange(pageDetails.currentPage + 1)}
                                            className={pageDetails.currentPage + 1 >= pageDetails.total ? "disabled" : ""}
                                        >
                                            <button className="next">
                                                <i className="pe-7s-angle-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="quantity-cart-box d-flex align-items-center fixed-bottom hide-on-large">
                        <div className="action_link w-100 text-center">
                            <button className=" btn-cart2 w-100 rounded-0" onClick={() => setIsFilterOpen(true)}>
                                Filter
                            </button>
                        </div>
                    </div>
                    </>
                        ) : (
                            <div className="row">
                                <h4 className="text-center">Result holds no products.</h4>
                            </div>
                        )}
            </div>
        </div>
    );
}
