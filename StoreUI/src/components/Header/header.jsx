"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getNavCategory } from "@/app/api/homepage";
import { useSession } from 'next-auth/react';
import { getCartProductCount } from '@/app/api/cart';
import useWishlistStore from '@/store/wishlistStore';
import useCartStore from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { IoLogOutOutline } from "react-icons/io5";
import { LogoutUser } from '@/utils/auth';
import { usePathname } from "next/navigation";

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { fetchWishlist, wishlist } = useWishlistStore();
    const { fetchCart, cartCount } = useCartStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(0);
    const [search, setSearch] = useState('');
    const [navLinks, setNavLinks] = useState([]);
    const [isLoaded, setIsLoaded] = useState({
        category: false,
        cart: false,
        wishlist: false
    });
    const { data: session, status } = useSession();
  
    useEffect(() => {
        if (session?.user) {
            console.log("🔑 [Debug] Current User Session:", {
                email: session?.user?.email,
                role: session?.user?.role,
                id: session?.user?.id
            });
        } else {
            console.log("🔑 [Debug] No active user session.");
        }
    }, [session]);

    const token = session?.user?.token;

    const headerdata = async () => {
        const response = await getNavCategory();
        setNavLinks(response?.categories);
        setIsLoaded((prev)=>({...prev, category: true}));
    }
    useEffect(() => {
        if(status === "authenticated" && token){
            setIsLoggedIn(true);
            fetchWishlist(token);
            fetchCart(token);
        } else {
            setIsLoggedIn(false);
        }
    }, [isLoaded.cart, token, status]);
    
    
    useEffect(() => {
        if (navLinks?.length < 1 && !isLoaded.category) {
            headerdata();
        }
    }, [navLinks, isLoaded.category]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 49) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    function handleSearch(e) {
        e.preventDefault();
        router.push(`/search/${search}`);
    }

    const handleLogout = (e) => {
        e.preventDefault();
        LogoutUser()
    }


    return (
        <header className="header-area header-wide">
            <div className="main-header d-none d-lg-block">
                <div className={`header-main-area sticky`}>
                    <div className="container">
                        <div className="row align-items-center justify-content-between position-relative px-4">
                            <div className="col-lg-2">
                                {/* <div className="logo">
                                    <a href="/">
                                        <img src="/assets/logo1.png" alt="Brand Logo" style={{filter: "invert(1)"}} />
                                    </a>
                                </div> */}
                                <div className="logo">
    <a href={session?.user?.role?.toUpperCase() === "ADMIN" ? "/admin" : "/"}>
        <img
            src="/assets/logo1.png"
            alt="Brand Logo"
            style={{ filter: "invert(1)" }}
        />
    </a>
</div>
                            </div>
                            <div className="col-lg-7 col-xl-5">
                                <div className="header-right d-flex align-items-center justify-content-xl-between justify-content-lg-end">
                                    <div className="header-search-container">
                                        <form className="header-search-box" onSubmit={handleSearch}>
                                            <input type="text" name='search' value={search} onChange={(e)=>setSearch(e.target.value)} className="header-search-field" placeholder="Search Here..." />
                                            <button type="submit" className="header-search-btn"><i className="pe-7s-search"></i></button>
                                        </form>
                                    </div>
                                    <div className="header-configure-area">
                                        {isLoggedIn ?(
                                            <ul className="nav justify-content-end">
                                                {session?.user?.role?.toUpperCase() !== "ADMIN" && (
                                                    <li>
                                                        <a href="/wishlist">
                                                            <i className="pe-7s-like"></i>
                                                            <div className="notification">{wishlist.length ?? 0}</div>
                                                        </a>
                                                    </li>
                                                )}
                                                <li>
                                                <a href="/cart" className="minicart-btn">
                                                        <i className="pe-7s-shopbag"></i>
                                                        <div className="notification">{cartCount ?? 0}</div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/my-account">
                                                        <i className="pe-7s-user"></i>
                                                    </a>
                                                </li>
                                                {/* <li>
                                                    <button type='button' onClick={(e)=>handleLogout(e)} className='text-light d-flex align-item-center'>
                                                        <i className='pe-7s-power' />
                                                    </button>
                                                </li> */}
                                                {pathname === "/" && (
    <li>
        <button 
            type='button' 
            onClick={(e)=>handleLogout(e)} 
            className='text-light d-flex align-item-center'
        >
            <i className='pe-7s-power' />
        </button>
    </li>
)}
                                            </ul>
                                        ):(
                                            <ul className="nav justify-content-end">
                                                <li className="user-hover">
                                                    <a href="/signin">
                                                        <i className="pe-7s-user"></i>
                                                    </a>
                                                    <ul className="dropdown-list">
                                                        <li><a href="/signin">login</a></li>
                                                        <li><a href="/signup">register</a></li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`mobile-header d-lg-none d-md-block sticky ${!isScrolled ? '' : 'is-sticky'}`}>
                <div className="container-fluid">
                    <div className="row align-items-center">
                        <div className="col-12">
                            <div className="mobile-main-header">
                                {/* <div className="mobile-logo">
                                    <a href="/">
                                        <img src="/assets/logo1.png" alt="Brand Logo" style={{filter: "invert(1)"}} />
                                    </a>
                                </div> */}
                                <div className="mobile-logo">
    <a href={session?.user?.role?.toUpperCase() === "ADMIN" ? "/admin" : "/"}>
        <img
            src="/assets/logo1.png"
            alt="Brand Logo"
            style={{ filter: "invert(1)" }}
        />
    </a>
</div>
                                <div className="mobile-menu-toggler">
                                    {isLoggedIn ?(
                                        <>
                                        <div className="mini-cart-wrap mx-2">
                                            <a href="/cart">
                                                <i className="pe-7s-shopbag"></i>
                                                <div className="notification">{cartCount ?? 0}</div>
                                            </a>
                                        </div>
                                        {session?.user?.role?.toUpperCase() !== "ADMIN" && (
                                            <div className="mini-cart-wrap mx-2 d-none d-md-block">
                                                <a href="/wishlist">
                                                    <i className="pe-7s-like"></i>
                                                    <div className="notification">{wishlist.length ?? 0}</div>
                                                </a>
                                            </div>
                                        )}
                                        <div className="mini-cart-wrap mx-2 d-none d-md-block">
                                            <a href="/my-account">
                                                <i className="pe-7s-user"></i>
                                            </a>
                                        </div>
                                        {pathname === "/" && (
    <li className="mx-2 d-none d-md-block">
        <button 
            type='button' 
            onClick={(e)=>handleLogout(e)} 
            className='d-flex align-item-center'
        >
            <i className='pe-7s-power' />
        </button>
    </li>
)}
                                        {/* <li className="mx-2 d-none d-md-block">
                                            <button type='button' onClick={(e)=>handleLogout(e)} className='d-flex align-item-center'>
                                                <i className='pe-7s-power' />
                                            </button>
                                        </li> */}
                                        </>
                                    ):(
                                        <div className="mini-cart-wrap">
                                            <a href="/signin">
                                                <i className="pe-7s-user"></i>
                                            </a>
                                        </div>
                                    )}
                                    <button onClick={()=>setIsMenuOpen(!isMenuOpen)} className="mobile-menu-btn">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {navLinks?.length > 0 &&(
                <div className={`main-menu-area d-lg-block d-none sticky ${!isScrolled ? '' : 'is-sticky'}`}>
                    <div className="px-4 main-menu">
                        <nav className="desktop-menu">
                            <ul>
                                {navLinks.map((category, index) => (
                                    <li key={`level0-${index}`} className="position-static">
                                        <a href={`/category/${category.slug}`}>{category.categoryName} {Object.keys(category.subCategories).length > 0 && <i className="fa fa-angle-down" />}</a>
                                        {Object.keys(category.subCategories).length > 0 && (<ul className="megamenu dropdown">
                                            {Object.entries(category.subCategories).map(([key, subCategories], subIndex) => (
                                                <li key={`subCategory-${subIndex}`} className="mega-title">
                                                    <span>{key}</span>
                                                    <ul>
                                                        {subCategories.map((subCategory, i) => (
                                                            <li key={`subCategory-${i}`}>
                                                                <a href={`/category/${subCategory.slug}`}>
                                                                    {subCategory.categoryName}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>)}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
            <aside className={`off-canvas-wrapper ${isMenuOpen?"open":""}`}>
                <div className="off-canvas-overlay"  onClick={()=>setIsMenuOpen(!isMenuOpen)}></div>
                <div className="off-canvas-inner-content">
                    <div className="btn-close-off-canvas"  onClick={()=>setIsMenuOpen(!isMenuOpen)}>
                        <i className="pe-7s-close"></i>
                    </div>
                    <div className="off-canvas-inner">
                        <div className="search-box-offcanvas">
                            <form onSubmit={handleSearch}>
                                <input type="text" name='search' value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search Here..." />
                                <button type="submit" className="search-btn"><i className="pe-7s-search"></i></button>
                            </form>
                        </div>
                        <div className="mobile-navigation">
                            {navLinks?.length > 0 &&(<nav>
                                <ul className="mobile-menu">
                                    {navLinks.map((category,i)=>(
                                        <li key={`mobile-links${i}`} className={`menu-item-has-children ${navOpen === i ?'active':''}`}>
                                            {Object.keys(category.subCategories).length > 0 ? (<>
                                            <button onClick={()=>setNavOpen(i)} className="dropdown-btn"><span>{category.categoryName}</span> <i className={navOpen === i ? 'pe-7s-angle-down':'pe-7s-angle-up'} /></button>
                                            <ul className="dropdown-expand">
                                                <li><a href={`/category/${category.slug}`}>All {category.categoryName}</a></li>
                                                {Object.entries(category.subCategories).map(([key, subCategories], subIndex) => (
                                                    <li key={`subCategory-${subIndex}`} className="mega-title">
                                                        <span>{key}</span>
                                                        <ul className='dropdown-expand'>
                                                            {subCategories.map((subCategory, i) => (
                                                                <li key={`subCategory-${i}`}>
                                                                    <a href={`/category/${subCategory.slug}`}>
                                                                        {subCategory.categoryName}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                ))}
                                            </ul>
                                            </>):(
                                                <a href={`/category/${category.slug}`} className="dropdown-btn"><span>{category.categoryName}</span> <i className="pe-7s-angle-down" style={{opacity:0}} /></a>
                                            )}
                                        </li>
                                    ))}
                                    <li className='menu-item-has-children'></li>
                                </ul>
                            </nav>)}
                        </div>
                        <div className="offcanvas-widget-area">
                            <div className="header-configure-area">
                                {isLoggedIn ?(
                                    <ul className="nav justify-content-evenly">
                                        {session?.user?.role?.toUpperCase() !== "ADMIN" && (
                                            <li style={{margin:0}}>
                                                <a href="/wishlist">
                                                    <i className="pe-7s-like"></i>
                                                    <div className="notification">{wishlist.length ?? 0}</div>
                                                </a>
                                            </li>
                                        )}
                                        <li style={{margin:0}}>
                                            <a href="/cart" className="minicart-btn">
                                                <i className="pe-7s-shopbag"></i>
                                                <div className="notification">{cartCount ?? 0}</div>
                                            </a>
                                        </li>
                                        <li style={{margin:0}}>
                                            <a href="/my-account">
                                                <i className="pe-7s-user"></i>
                                            </a>
                                        </li>
                                        {/* <li style={{margin:0}}>
                                            <button type='button' onClick={(e)=>handleLogout(e)} className='d-flex align-item-center'>
                                                <i className='pe-7s-power' />
                                            </button>
                                        </li> */}
                                        {pathname === "/" && (
    <li style={{margin:0}}>
        <button 
            type='button' 
            onClick={(e)=>handleLogout(e)} 
            className='d-flex align-item-center'
        >
            <i className='pe-7s-power' />
        </button>
    </li>
)}
                                    </ul>
                                ):(
                                    <ul className="nav justify-content-end">
                                        <li className="user-hover">
                                            <a href="/signin">
                                                <i className="pe-7s-user"></i>
                                            </a>
                                            <ul className="dropdown-list">
                                                <li><a href="/signin">login</a></li>
                                                <li><a href="/signup">register</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </header>
    );
};

export default Header;
