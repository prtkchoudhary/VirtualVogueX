// This is the Reviews Component used to render product reviews on that individual product's page - "ReviewsComp"

import React from "react";
import "../App.css";

const ReviewsComp = ({ products }) => {
  return (
    <div>

      <div className="review-list-container">

        {products.map((product) => (
          <div key={product._id}>
            {product.reviews.length === 0
            ? <div> There are no reviews for this product yet! </div>
            :
            product.reviews.map((review) => (

              <li key={review._id}> 
                {review.verified === "Y"? <b>{review.user} <img src="https://res.cloudinary.com/dl6m7txan/image/upload/v1603098320/tick_izasmd.png" alt="Verified" width="20"/>  says:</b> : <b> {review.user}  says:</b>} <p className="review">{review.body}</p>
              </li>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsComp;