import React, { useState } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { baseUrl } from "../../utils/constants/Constants";

const ProductModal = ({ setShowModal, addProduct, defaultDeliveryDate }) => {
  const [productDetails, setProductDetails] = useState({
    productCode: "",
    name: "",
    brandName: "",
    categoryName: "",
    barcode: "",
    deliveryDate: defaultDeliveryDate || "",
    quantity: 0,
    price: 0,
    id: null,
    image: "",
  });

  const loadProductOptions = async (inputValue) => {
    const response = await axios.get(`${baseUrl}store/products/?search=${inputValue}`);
    return response.data.results.map((product) => ({
      label: `${product.product_code} - ${product.name}`,
      value: product.id,
    }));
  };

  const handleProductChange = async (selectedOption) => {
    if (selectedOption) {
      const response = await axios.get(`${baseUrl}store/products/${selectedOption.value}/`);
      const product = response.data;
      setProductDetails({
        productCode: product.product_code,
        name: product.name,
        brandName: product.brand_name,
        categoryName: product.category_name,
        barcode: product.barcode,
        price: product.price || 0,
        image: product.image || "",
        id: product.id,
        deliveryDate: productDetails.deliveryDate,
        quantity: productDetails.quantity,
      });
    }
  };

  const handleSaveProduct = () => {
    addProduct(productDetails);
    setShowModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg mx-auto p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Add Product</h2>
        
        {/* Product Field on a Separate Line */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Product</label>
          <AsyncSelect
            loadOptions={loadProductOptions}
            onChange={handleProductChange}
            placeholder="Search Product Code or Name"
            className="mt-1 block w-full"
          />
        </div>

        {/* Grid for Other Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {productDetails.image && (
            <div className="flex flex-col items-center col-span-1 md:col-span-3">
              <img
                src={productDetails.image}
                alt={productDetails.name}
                className="w-32 h-32 object-cover mb-4"
              />
              <span className="text-sm text-gray-600">{productDetails.name}</span>
            </div>
          )}
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              value={productDetails.brandName}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={productDetails.categoryName}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Barcode</label>
            <input
              type="text"
              value={productDetails.barcode}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
            <input
              type="date"
              value={productDetails.deliveryDate}
              onChange={(e) => setProductDetails({ ...productDetails, deliveryDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={productDetails.quantity}
              onChange={(e) => setProductDetails({ ...productDetails, quantity: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={productDetails.price}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleSaveProduct}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
