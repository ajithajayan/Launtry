import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SupplierModal from './SupplierModal';
import { baseUrl } from '../../utils/constants/Constants';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(baseUrl + 'store/suppliers/');
      setSuppliers(response.data.results);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const deleteSupplier = async (supplierId) => {
    try {
      await axios.delete(`${baseUrl}store/suppliers/${supplierId}/`);
      fetchSuppliers(); // Refresh the supplier list after deletion
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const confirmDelete = (supplierId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSupplier(supplierId);
        Swal.fire(
          'Deleted!',
          'Supplier has been deleted.',
          'success'
        );
      }
    });
  };

  const openModal = (supplier = null) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold"> Customers</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => openModal()}
        >
          Create Customer Details
        </button>
      </div>

      {suppliers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Customer Name</th>
                <th className="py-3 px-6 text-left">Mobile Number</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Location</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{supplier.name}</td>
                  <td className="py-3 px-6 text-left">{supplier.mobile_number}</td>
                  <td className="py-3 px-6 text-left">{supplier.email}</td>
                  <td className="py-3 px-6 text-left">{supplier.location}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2"
                      onClick={() => openModal(supplier)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => confirmDelete(supplier.id)}
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
        <div className="text-center py-8 text-gray-500">No Cusomer Details available. Create a new one to get started.</div>
      )}

      {showModal && (
        <SupplierModal 
          setShowModal={setShowModal}
          fetchSuppliers={fetchSuppliers}
          supplier={selectedSupplier}
        />
      )}
    </div>
  );
};

export default SupplierList;
