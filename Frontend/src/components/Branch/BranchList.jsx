import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import BranchModal from './BranchModal';
import { baseUrl } from '../../utils/constants/Constants';

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null); // State to store the branch being edited

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(baseUrl + 'store/branches/');
      console.log(response.data); // Debug: Check the fetched data
      setBranches(response.data.results);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const deleteBranch = async (branchCode) => {
    try {
      await axios.delete(`${baseUrl}store/branches/${branchCode}/`);
      fetchBranches(); // Refresh the branch list after deletion
      Swal.fire('Deleted!', 'Branch has been deleted.', 'success');
    } catch (error) {
      console.error('Error deleting branch:', error);
    }
  };

  const confirmDelete = (branchCode) => {
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
        deleteBranch(branchCode);
      }
    });
  };

  const editBranch = (branch) => {
    setEditingBranch(branch);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold">Branches</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => {
            setEditingBranch(null);
            setShowModal(true);
          }}
        >
          Create Branch
        </button>
      </div>

      {branches.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Branch Code</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Location</th>
                <th className="py-3 px-6 text-left">Contact Details</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {branches.map((branch) => (
                <tr key={branch.branch_code} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{branch.branch_code}</td>
                  <td className="py-3 px-6 text-left">{branch.name}</td>
                  <td className="py-3 px-6 text-left">{branch.location}</td>
                  <td className="py-3 px-6 text-left">{branch.contact_details}</td>
                  <td className="py-3 px-6 text-center space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      onClick={() => editBranch(branch)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => confirmDelete(branch.branch_code)}
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
        <div className="text-center py-8 text-gray-500">No branches available. Create a new one to get started.</div>
      )}

      {showModal && (
        <BranchModal
          setShowModal={setShowModal}
          fetchBranches={fetchBranches}
          editingBranch={editingBranch} // Pass the branch being edited to the modal
        />
      )}
    </div>
  );
};

export default BranchList;
