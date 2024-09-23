import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../../utils/constants/Constants';

const BranchModal = ({ setShowModal, fetchBranches, editingBranch }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contactDetails, setContactDetails] = useState('');

  useEffect(() => {
    if (editingBranch) {
      setName(editingBranch.name);
      setLocation(editingBranch.location);
      setContactDetails(editingBranch.contact_details);
    }
  }, [editingBranch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBranch) {
        // Update existing branch
        await axios.put(`${baseUrl}store/branches/${editingBranch.branch_code}/`, {
          name,
          location,
          contact_details: contactDetails,
        });
      } else {
        // Create new branch
        await axios.post(baseUrl + 'store/branches/', {
          name,
          location,
          contact_details: contactDetails,
        });
      }

      fetchBranches(); // Refresh the branch list after creation or update
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error('Error submitting branch form:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-1/3">
        <h2 className="text-2xl font-bold mb-4">
          {editingBranch ? 'Edit Branch' : 'Create Branch'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="branchName">
              Branch Name
            </label>
            <input
              type="text"
              id="branchName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="branchLocation">
              Location
            </label>
            <input
              type="text"
              id="branchLocation"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactDetails">
              Contact Details
            </label>
            <input
              type="text"
              id="contactDetails"
              value={contactDetails}
              onChange={(e) => setContactDetails(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingBranch ? 'Update Branch' : 'Create Branch'}
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

export default BranchModal;
