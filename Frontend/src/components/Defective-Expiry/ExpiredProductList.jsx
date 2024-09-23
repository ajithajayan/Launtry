import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { baseUrl } from "../../utils/constants/Constants";

const ExpiredProductList = () => {
  const [expiredProducts, setExpiredProducts] = useState([]);

  const fetchExpiredProducts = async () => {
    try {
        const response = await axios.get(`${baseUrl}store/expired-products/`);
        setExpiredProducts(response.data.results);
    } catch (error) {
        console.error("Error fetching expired products:", error);
    }
};

useEffect(() => {
    fetchExpiredProducts();
}, []);


  const handleRemoveExpiredProduct = async (product) => {
    const { product_id, remaining_quantity } = product;

    console.log("Removing Product ID:", product_id);

    if (!product_id) {
        Swal.fire("Error", "Product ID is missing. Cannot remove product.", "error");
        return;
    }

    Swal.fire({
        title: 'Remove Expired Product',
        text: `Are you sure you want to remove ${remaining_quantity} units of ${product.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it!',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.post(`${baseUrl}store/remove-expired-product/`, {
                    product_id: product_id,
                    qty_to_remove: remaining_quantity,
                    remarks: "Expired product removed",
                });
                Swal.fire("Removed!", "Expired product has been removed.", "success");

                // Fetch the updated list of expired products
                fetchExpiredProducts();
            } catch (error) {
                console.error("Error removing expired product:", error);
                Swal.fire("Error", "Failed to remove expired product", "error");
            }
        }
    });
};


  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Expired Products</h2>
      {expiredProducts.length > 0 ? (
        <table className="min-w-full bg-white shadow-md rounded">
          <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">Product Code</th>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Brand</th>
              <th className="py-3 px-6 text-left">Category</th>
              <th className="py-3 px-6 text-left">Expiry Date</th>
              <th className="py-3 px-6 text-left">Remaining Quantity</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {expiredProducts.map((product) => (
              <tr key={product.id || product.product_code} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">{product.product_code}</td>
                <td className="py-3 px-6 text-left">{product.name}</td>
                <td className="py-3 px-6 text-left">{product.brand_name}</td>
                <td className="py-3 px-6 text-left">{product.category_name}</td>
                <td className="py-3 px-6 text-left">{product.expiry_date}</td>
                <td className="py-3 px-6 text-left">{product.remaining_quantity}</td>
                <td className="py-3 px-6 text-center">
                  <button
                    onClick={() => handleRemoveExpiredProduct(product)}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No expired products available for removal.
        </div>
      )}
    </div>
  );
};

export default ExpiredProductList;
