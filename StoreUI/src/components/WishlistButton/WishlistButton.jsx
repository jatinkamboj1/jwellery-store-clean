"use client";
import { useState, useEffect } from "react";
import useWishlistStore from "@/store/wishlistStore";

export default function WishlistButton({ id, token }) {
  const { wishlist, isLoading, addToWishlist, removeFromWishlist } = useWishlistStore();

  // Local state to track if the item is in the wishlist
  const [isInWishlist, setIsInWishlist] = useState(false);

  function check() {
    const itemInWishlist = wishlist.some((item) => item.product.id  === id);
    
    setIsInWishlist(itemInWishlist);
  }
  useEffect(() => {
    check();
  }, [wishlist, id]);

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(token, id); // Remove from wishlist
      setIsInWishlist(false);
    } else {
      addToWishlist(token, id); // Add to wishlist
      setIsInWishlist(true);
    }
  };

  return (
    <button disabled={isLoading} onClick={handleWishlistToggle}>
      {isInWishlist ? (
        <svg width="20" height="20" viewBox="0 0 0.6 0.6" xmlns="http://www.w3.org/2000/svg">
          <path d="M.175.075a.15.15 0 0 0-.106.043.15.15 0 0 0 0 .213L.3.575.531.33a.15.15 0 0 0 0-.213.154.154 0 0 0-.213 0l-.019.02L.28.117A.14.14 0 0 0 .175.075" fill="#e74c3c" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 0.4 0.4" xmlns="http://www.w3.org/2000/svg">
          <path d="M.372.12.363.097.348.077a.1.1 0 0 0-.03-.02.1.1 0 0 0-.071 0 .1.1 0 0 0-.029.019L.217.078.201.094.185.078.184.076A.1.1 0 0 0 .155.057a.1.1 0 0 0-.071 0 .1.1 0 0 0-.03.02.1.1 0 0 0-.024.042L.027.144.03.168.039.19l.015.02L.2.358.348.21.363.19A.1.1 0 0 0 .375.145zM.347.161a.1.1 0 0 1-.017.03L.2.321.07.191.059.177.052.161.05.144.052.125.059.109Q.064.101.07.095L.092.08a.07.07 0 0 1 .052 0l.022.015L.2.129.234.095.256.08a.07.07 0 0 1 .052 0L.33.095l.011.014A.1.1 0 0 1 .35.143L.348.161z" />
        </svg>
      )}
    </button>
  );
}
