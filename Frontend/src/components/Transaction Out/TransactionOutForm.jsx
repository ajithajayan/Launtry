import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import Swal from "sweetalert2";
import { baseUrl } from "../../utils/constants/Constants";
import ReactToPrint from "react-to-print";

const TransactionOutForm = () => {
  const [transactionDetails, setTransactionDetails] = useState({
    date: "",
    branch: null,
    transferInvoiceNumber: "",
    branchInCharge: "",
    products: [],
    remarks: "",
  });

  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const componentRef = useRef(); // Reference for the print component

  useEffect(() => {
    const fetchInvoiceNumbers = async () => {
      try {
        const response = await axios.get(`${baseUrl}store/transactions/`);
        const invoiceData = response.data.supplier_invoice_numbers.map(
          (invoiceNumber) => ({
            label: invoiceNumber,
            value: invoiceNumber,
          })
        );
        setInvoiceOptions(invoiceData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        Swal.fire("Error", "Failed to fetch invoice numbers", "error");
      }
    };
    fetchInvoiceNumbers();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [transactionDetails.products]);

  const calculateTotals = () => {
    const quantityTotal = transactionDetails.products.reduce(
      (sum, product) => sum + product.qty_requested,
      0
    );

    const amountTotal = transactionDetails.products.reduce(
      (sum, product) => sum + parseFloat(product.total) || 0,
      0
    );

    setTotalQuantity(quantityTotal);
    setTotalAmount(amountTotal.toFixed(2));
  };

  const handleTransactionChange = async (selectedOption) => {
    if (selectedOption) {
      try {
        const response = await axios.get(
          `${baseUrl}store/transactions/${selectedOption.value}/`
        );
        const data = response.data;

        setTransactionDetails({
          ...transactionDetails,
          date: data.inward_stock_date,
          branch: null,
          transferInvoiceNumber: data.supplier_invoice_number,
          branchInCharge: data.customer_name,
          products:
            data.transaction_details.map((product) => ({
              id: product.product,
              name: product.product_name,
              qty_requested: product.quantity,
              total: product.total,
              delivery_date: product.delivery_date,
              product_image: `${baseUrl}${product.product_image}`, // Include product image
            })) || [],
        });
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        Swal.fire("Error", "Failed to fetch transaction details", "error");
      }
    } else {
      setTransactionDetails({
        ...transactionDetails,
        date: "",
        branch: null,
        transferInvoiceNumber: "",
        branchInCharge: "",
        products: [],
      });
    }
  };

  const handleClearProducts = () => {
    setTransactionDetails({ ...transactionDetails, products: [] });
    setTotalQuantity(0);
    setTotalAmount(0);
  };

  const handleSubmit = async () => {
    const transformedData = {
      date: transactionDetails.date,
      branch: transactionDetails.branch?.value || null,
      transfer_invoice_number: transactionDetails.transferInvoiceNumber,
      branch_in_charge: transactionDetails.branchInCharge,
      transaction_details: transactionDetails.products.map((product) => ({
        product: product.id,
        qty_requested: product.qty_requested,
      })),
      remarks: transactionDetails.remarks,
    };
  
    const confirmDelivery = await Swal.fire({
      title: "Confirm Delivery",
      text: "Do you want to deliver the items?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, deliver!",
      cancelButtonText: "No, cancel!",
    });
  
    if (confirmDelivery.isConfirmed) {
      // Call the API to update is_delivered using the transferInvoiceNumber
      try {
        await axios.patch(
          `${baseUrl}store/product-in-transactions/update-delivery/${transactionDetails.transferInvoiceNumber}/`,
          {
            is_delivered: true,
          }
        );
        Swal.fire("Success", "Delivery status updated successfully", "success");
  
        // Clear the table selection after successful update
        handleClearProducts();
      } catch (error) {
        console.error("Error updating delivery status:", error);
        Swal.fire("Error", "Failed to update delivery status", "error");
        return; // Stop further execution if the update fails
      }
    }
  
    // Now proceed to save the transaction
    // try {
    //   await axios.post(
    //     `${baseUrl}store/product-out-transactions/`,
    //     transformedData
    //   );
    //   Swal.fire("Success", "Transaction saved successfully", "success");
    //   handleClearProducts(); // Clear the table selection after saving
    // } catch (error) {
    //   console.error("Error saving transaction:", error);
    //   Swal.fire("Error", "Failed to save the transaction", "error");
    // }
  };
  
  

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={transactionDetails.date}
            onChange={(e) =>
              setTransactionDetails({
                ...transactionDetails,
                date: e.target.value,
              })
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Transfer Invoice Number
          </label>
          <AsyncSelect
            cacheOptions
            defaultOptions={invoiceOptions}
            onChange={handleTransactionChange}
            isClearable
            placeholder="Search Invoice Number"
            className="mt-1 block w-full"
          />
        </div>
      </div>

      <div className="mt-6">
        {transactionDetails.products.length > 0 ? (
          <div ref={componentRef} className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded">
              <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <tr>
                  <th className="py-3 px-6 text-left">#</th>
                  <th className="py-3 px-6 text-left">Product Name</th>
                  <th className="py-3 px-6 text-left">Image</th>{" "}
                  {/* New Image Column */}
                  <th className="py-3 px-6 text-left">Requested Quantity</th>
                  <th className="py-3 px-6 text-left">Total</th>
                  <th className="py-3 px-6 text-left">Delivery Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {transactionDetails.products.map((product, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6 text-left">{index + 1}</td>
                    <td className="py-3 px-6 text-left">{product.name}</td>
                    <td className="py-3 px-6 text-left">
                      <img
                        src={product.product_image}
                        alt={product.name}
                        className="w-16 h-16 object-cover"
                      />{" "}
                      {/* Display Image */}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {product.qty_requested}
                    </td>
                    <td className="py-3 px-6 text-left">{product.total}</td>
                    <td className="py-3 px-6 text-left">
                      {product.delivery_date || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 bg-gray-200 p-4 rounded text-right">
              <strong>Total Quantity:</strong> {totalQuantity} <br />
              <strong>Total Amount:</strong> QAR {totalAmount}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No products available for the selected transaction.
          </div>
        )}
      </div>

      <div className="mt-6 flex space-x-4">
        <ReactToPrint
          trigger={() => (
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Print
            </button>
          )}
          content={() => componentRef.current}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleSubmit}
        >
          Save
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleClearProducts}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default TransactionOutForm;
