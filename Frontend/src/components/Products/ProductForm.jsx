import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { baseUrl } from "../../utils/constants/Constants";

const ProductForm = ({ fetchProducts, setShowModal }) => {
  const [productCode, setProductCode] = useState("");
  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState({ label: "Pieces", value: "pieces" });
  const [price, setPrice] = useState(""); // Add state for the price
  const [image, setImage] = useState(null); // Add state for the image

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchBrands = async () => {
    const response = await axios.get(baseUrl + "store/brands/");
    setBrands(response.data.results.map((brand) => ({ label: brand.name, value: brand.id })));
  };

  const fetchCategories = async () => {
    const response = await axios.get(baseUrl + "store/categories/");
    setCategories(response.data.results.map((category) => ({ label: category.name, value: category.id })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("product_code", productCode || null);
    formData.append("name", name);
    formData.append("brand", selectedBrand?.value);
    formData.append("category", selectedCategory?.value);
    formData.append("unit_type", selectedUnit.value);
    formData.append("price", price); // Append the price field
    if (image) {
      formData.append("image", image); // Append the image file
    }

    try {
      await axios.post(baseUrl + "store/products/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchProducts();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white w-full max-w-3xl mx-4 md:mx-0 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-lg overflow-hidden mt-20">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          onClick={() => setShowModal(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Code (Optional)</label>
                <input
                  type="text"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <Select
                  value={selectedUnit}
                  onChange={setSelectedUnit}
                  options={[
                    { label: "Pieces", value: "pieces" },
                    { label: "Kilograms", value: "kilograms" },
                    { label: "Liters", value: "liters" },
                    { label: "Meters", value: "meters" },
                    { label: "Pounds", value: "pounds" },
                  ]}
                  className="mt-1 block w-full"
                  isSearchable
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <Select
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  options={brands}
                  className="mt-1 block w-full"
                  isSearchable
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categories}
                  className="mt-1 block w-full"
                  isSearchable
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
              >
                Create Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
