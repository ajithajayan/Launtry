import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../../utils/constants/Constants';

const SupplierModal = ({ setShowModal, fetchSuppliers, supplier }) => {
  const [name, setName] = useState(supplier?.name || '');
  const [mobileNumber, setMobileNumber] = useState(supplier?.mobile_number || '');
  const [email, setEmail] = useState(supplier?.email || '');
  const [location, setLocation] = useState(supplier?.location || '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      mobile_number: mobileNumber,
      email,
      location,
    };

    try {
      if (supplier) {
        await axios.put(`${baseUrl}store/suppliers/${supplier.id}/`, data);
      } else {
        await axios.post(baseUrl + 'store/suppliers/', data);
      }
      fetchSuppliers();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{supplier ? 'Edit Cusomer' : 'Create Customer'}</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => setShowModal(false)}
          >
            &#10005;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Customer Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mobile Number</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Location</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {supplier ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
