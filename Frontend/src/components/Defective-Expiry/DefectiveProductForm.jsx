import React, { useState } from 'react';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from "../../utils/constants/Constants";

const DefectiveProductForm = () => {
  const [productDetails, setProductDetails] = useState({
    id: null,
    qty_defective: 0,
    remarks: "",
    productCode: "",
    brandName: "",
    categoryName: "",
    supplierName: "",
    manufacturingDate: "",
    expiryDate: "",
    availableQuantity: 0,
  });

  const navigate = useNavigate();

  const loadProductOptions = async (inputValue) => {
    const response = await axios.get(`${baseUrl}store/products/?search=${inputValue}`);
    return response.data.results.map((product) => ({
      label: `${product.product_code} - ${product.name}`,
      value: product.id,
    }));
  };

  const handleProductChange = async (selectedOption) => {
    if (selectedOption) {
      try {
        const response = await axios.get(`${baseUrl}store/inventory/?search=${selectedOption.label}`);
        const inventoryItems = response.data.results;

        if (inventoryItems.length > 0) {
          let totalAvailableQuantity = 0;

          inventoryItems.forEach(item => {
            if (item.product_id === selectedOption.value) {
              totalAvailableQuantity += item.remaining_quantity;
            }
          });

          const firstItem = inventoryItems.find(item => item.product_id === selectedOption.value);

          if (firstItem) {
            setProductDetails({
              id: selectedOption.value,
              productCode: firstItem.product_code,
              brandName: firstItem.brand_name,
              categoryName: firstItem.category_name,
              supplierName: firstItem.supplier_name,
              manufacturingDate: firstItem.manufacturing_date,
              expiryDate: firstItem.expiry_date,
              availableQuantity: totalAvailableQuantity,
            });
          } else {
            console.error("Matching inventory not found for the selected product.");
            setProductDetails((prevState) => ({
              ...prevState,
              availableQuantity: 0,
            }));
          }
        } else {
          console.error("No inventory found for the selected product.");
          setProductDetails((prevState) => ({
            ...prevState,
            availableQuantity: 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        setProductDetails((prevState) => ({
          ...prevState,
          availableQuantity: 0,
        }));
      }
    }
  };

  const handleSubmitDefective = async () => {
    if (!productDetails.id) {
      Swal.fire("Error", "Product must be selected before removing defective quantity", "error");
      return;
    }

    try {
      await axios.post(`${baseUrl}store/remove-defective-product/`, {
        product_id: productDetails.id,
        qty_to_remove: productDetails.qty_defective,
        remarks: productDetails.remarks
      });
      Swal.fire("Success", "Defective product removed successfully", "success");
      setProductDetails({
        id: null,
        qty_defective: 0,
        remarks: "",
        productCode: "",
        brandName: "",
        categoryName: "",
        supplierName: "",
        manufacturingDate: "",
        expiryDate: "",
        availableQuantity: 0,
      });
    } catch (error) {
      console.error("Error removing defective product:", error);
      Swal.fire("Error", "Failed to remove defective product", "error");
    }
  };

  const handleNavigateToExpired = () => {
    navigate('/admincontrol/expired-products');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">Remove Defective Product</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
          <AsyncSelect
            loadOptions={loadProductOptions}
            onChange={handleProductChange}
            placeholder="Search Product Code or Name"
            className="mt-1"
            styles={{
              control: (provided) => ({
                ...provided,
                borderColor: '#d1d5db',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#3b82f6',
                },
              }),
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Quantity</label>
          <input
            type="number"
            value={productDetails.availableQuantity}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
          <input
            type="text"
            value={productDetails.brandName}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <input
            type="text"
            value={productDetails.categoryName}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
          <input
            type="text"
            value={productDetails.supplierName}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturing Date</label>
          <input
            type="date"
            value={productDetails.manufacturingDate}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
          <input
            type="date"
            value={productDetails.expiryDate}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Remove</label>
          <input
            type="number"
            value={productDetails.qty_defective}
            onChange={(e) => setProductDetails({ ...productDetails, qty_defective: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
          <input
            type="text"
            value={productDetails.remarks}
            onChange={(e) => setProductDetails({ ...productDetails, remarks: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-between space-x-4">
        <button
          className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition ease-in-out duration-200"
          onClick={handleSubmitDefective}
        >
          Remove Defective Product
        </button>
        <button
          className="bg-yellow-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition ease-in-out duration-200"
          onClick={handleNavigateToExpired}
        >
          View & Remove Expired Products
        </button>
      </div>
    </div>
  );
};

export default DefectiveProductForm;
