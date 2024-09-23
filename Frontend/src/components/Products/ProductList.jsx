import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "./ProductForm";
import ProductEditForm from "./ProductEditForm";
import { baseUrl } from "../../utils/constants/Constants";
import Swal from "sweetalert2";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(baseUrl + "store/products/");
      setProducts(response.data.results);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const deleteProduct = async (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${baseUrl}store/products/${productId}/`);
          fetchProducts(); // Refresh the product list after deletion
          Swal.fire("Deleted!", "Product has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire("Error!", "Failed to delete the product.", "error");
        }
      }
    });
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex space-x-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => {
              setEditingProduct(null); // Reset the editing product
              setShowModal(true); // Show the modal for creating a new product
            }}
          >
            Add Product
          </button>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Product Code</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Image</th>{" "}
                {/* Add Image Header */}
                <th className="py-3 px-6 text-left">Barcode</th>
                <th className="py-3 px-6 text-left">Category</th>
                <th className="py-3 px-6 text-left">Brand</th>
                <th className="py-3 px-6 text-left">Price (QAR)</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">
                    {product.product_code}
                  </td>
                  <td className="py-3 px-6 text-left">{product.name}</td>
                  <td className="py-3 px-6 text-left">
                    {product.image_url && (
                      <img
                        src={product.image_url} // Directly use product.image_url
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                  </td>

                  {/* Display the image */}
                  <td className="py-3 px-6 text-left">{product.barcode}</td>
                  <td className="py-3 px-6 text-left">
                    {product.category_name}
                  </td>
                  <td className="py-3 px-6 text-left">{product.brand_name}</td>
                  <td className="py-3 px-6 text-left">{product.price}</td>
                  <td className="py-3 px-6 text-center space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 mb-2 rounded hover:bg-yellow-600"
                      onClick={() => editProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No products available. Add a new product to get started.
        </div>
      )}

      {showModal && !editingProduct && (
        <ProductForm
          setShowModal={setShowModal}
          fetchProducts={fetchProducts}
        />
      )}

      {showModal && editingProduct && (
        <ProductEditForm
          product={editingProduct}
          setShowModal={setShowModal}
          fetchProducts={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductList;
