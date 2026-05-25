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
    const [category, setCategory] = useState();
    const [tags, setTags] = useState();
    const [products, setProducts] = useState();
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [pageDetails, setPageDetails] = useState({
        total: 1,
        currentPage: 0,
        limit: 12,
        totalPages: 1,
    });
    const [filter, setFilter] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false); // State to control aside bar visibility

    let timeoutId;
    const discounts = [
        { label: '10%', value: 10 },
        { label: '20%', value: 20 },
        { label: '40%', value: 40 },
        { label: '60%', value: 60 },
        { label: '70%', value: 70 },
    ];

    useEffect(() => {
        if (id) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const response = await fetchCategoryBySlug(id);
            if (response) {
                setCategory(response.category);
                setTags(response.groupedTags);
                setMinPrice(response.category.filterPrice.min);
                setMaxPrice(response.category.filterPrice.max);
            }
        } catch (error) { }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetchProductsCard(pageDetails.currentPage, pageDetails.limit, { categoryId: id, ...filter });
            if (response) {
                // //console.log("fetchProductsCard: ", response);
                setProducts(response?.data?.products);
                setPageDetails(response?.data?.pageDetails);
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

    // Handle Page Change
    const handlePageChange = (newPage) => {
        if (newPage < 0 || newPage >= pageDetails.totalPages) return;

        setPageDetails((prev) => ({
            ...prev,
            currentPage: newPage,
        }));
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

    useEffect(() => {
        // if (!filter) {
        //     fetchProducts();
        // } else {
        //     if (pageDetails.currentPage !== 1) {
        //         setPageDetails({currentPage: 1});                
        //     }
        //     clearTimeout(timeoutId);
        //     timeoutId = setTimeout(() => {
        //         fetchProducts();
        //     }, 1000);
        // }
        fetchProducts();
    }, [pageDetails.currentPage, filter]);

    if (!category || !products) {
        return <LoadingScreen />
    }

    return (
        <div className="shop-main-wrapper bt-padding">
            <div className="container">
                <div className="section-title text-center">
                    <h2 className="title">{category.categoryName}</h2>
                    <p className="sub-title" dangerouslySetInnerHTML={{__html: category.description}} />
                </div>
                {products.length > 0 ? (
                    <>
                    <div className="row">
                        <div className="shop-top-bar d-none d-md-grid d-lg-none">
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
                        <div className={`col-12 col-md-4 col-lg-3 filter-sidebar ${isFilterOpen ? 'open' : ''}`}>
                            <aside className="sidebar-wrapper mt-md-0 mt-lg-5">
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
                                    {Object.entries(category.subCategories).map(([section, items]) => {
                                        if (items.length < 1) {
                                            return;
                                        }
                                        return (<div key={section} className="sidebar-single">
                                            <h5 className="sidebar-title">{section}</h5>
                                            <div className="sidebar-body">
                                                <ul className="shop-categories">
                                                    {items.map((item) => (
                                                        <li key={item.slug}><Link href={`/category/${item.slug}`}>{item.categoryName}</Link></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>)
                                    })}

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
                                                            <RangeSlider value={[minPrice, maxPrice]} min={category?.filterPrice.min} max={category?.filterPrice.max} onInput={(e) => { handleDrage(e); }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {Object.entries(tags).map(([section, items]) => {
                                                if (items.length < 1) {
                                                    return;
                                                }
                                                return (<div key={section} className="sidebar-single">
                                                    <h5 className="sidebar-title">{section.replace('is', '')} Type</h5>
                                                    <div className="sidebar-body">
                                                        <ul className="shop-categories">
                                                            {items.map((item) => (
                                                                <li key={item.name}>
                                                                    <div className="custom-control custom-checkbox">
                                                                        <input type="checkbox" className="custom-control-input" id="customCheck2" />
                                                                        <label className="custom-control-label" htmlFor="customCheck2">
                                                                            {item.name}
                                                                        </label>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>)
                                            })}

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
                                <div className="shop-top-bar d-md-none d-lg-grid">
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
                        <h4 className="text-center">Category holds no products.</h4>
                    </div>
                )}
            </div>
        </div>
    );
}
