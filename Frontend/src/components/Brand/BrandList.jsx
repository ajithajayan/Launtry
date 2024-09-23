import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BrandModal from './BrandModal'; // Modal component for creating a brand
import { baseUrl } from '../../utils/constants/Constants';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(baseUrl + 'store/brands/');
      console.log(response.data); // Debug: Check the fetched data
      setBrands(response.data.results); // Access the results array
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const deleteBrand = async (brandId) => {
    try {
      await axios.delete(`${baseUrl}store/brands/${brandId}/`);
      fetchBrands(); // Refresh the brand list after deletion
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold">Brands</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowModal(true)}
        >
          Create Brand
        </button>
      </div>

      {brands.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Brand ID</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{brand.id}</td>
                  <td className="py-3 px-6 text-left">{brand.name}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => deleteBrand(brand.id)}
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
        <div className="text-center py-8 text-gray-500">No brands available. Create a new one to get started.</div>
      )}

      {showModal && (
        <BrandModal 
          setShowModal={setShowModal}
          fetchBrands={fetchBrands}
        />
      )}
    </div>
  );
};

export default BrandList;
