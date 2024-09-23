import React, { useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../../utils/constants/Constants';

const BrandModal = ({ setShowModal, fetchBrands }) => {
  const [brandName, setBrandName] = useState('');

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    try {
      await axios.post(baseUrl + 'store/brands/', {
        name: brandName,
      });
      fetchBrands(); // Refresh the brand list after creation
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error('Error creating brand:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-1/3">
        <h2 className="text-2xl font-bold mb-4">Create Brand</h2>
        <form onSubmit={handleCreateBrand}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="brandName">
              Brand Name
            </label>
            <input
              type="text"
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandModal;
