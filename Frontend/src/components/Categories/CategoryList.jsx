import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryModal from './CategoryModal'; // Modal component for creating a category
import { baseUrl } from '../../utils/constants/Constants';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(baseUrl + 'store/categories/');
      console.log(response.data); // Debug: Check the fetched data
      setCategories(response.data.results); // Access the results array
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${baseUrl}store/categories/${categoryId}/`);
      fetchCategories(); // Refresh the category list after deletion
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold">Categories</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowModal(true)}
        >
          Create Category
        </button>
      </div>

      {categories.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Category ID</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{category.id}</td>
                  <td className="py-3 px-6 text-left">{category.name}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => deleteCategory(category.id)}
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
        <div className="text-center py-8 text-gray-500">No categories available. Create a new one to get started.</div>
      )}

      {showModal && (
        <CategoryModal 
          setShowModal={setShowModal}
          fetchCategories={fetchCategories}
        />
      )}
    </div>
  );
};

export default CategoryList;
