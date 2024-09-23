import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { baseUrl } from "../../utils/constants/Constants";
import ProductModal from "./ProductModal";
import SupplierModal from "../Supplier/SupplierModal";
import ReactToPrint from "react-to-print";
import CustomerModal from "./CustomerModal";

const TransactionOutForm = () => {
  const [transactionDetails, setTransactionDetails] = useState({
    purchaseDate: "",
    customer: null,
    customerDate: "",
    customerInvoice: "",
    products: [],
    remarks: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [customerDetails, setCustomerDetails] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState([]);

  const componentRef = useRef();

  // Fetch customers for the customer selection
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${baseUrl}store/suppliers/`);
      const customers = response.data.results.map((customer) => ({
        label: customer.name,
        value: customer.id,
      }));
      setCustomerDetails(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");

  // In your fetch function
  const fetchInvoiceNumbers = async () => {
    try {
      const response = await axios.get(`${baseUrl}store/last-invoice-number/`);
      const newInvoiceNumber = response.data.new_invoice_number;
      setNextInvoiceNumber(newInvoiceNumber); // Set the next invoice number
      // Optionally, set previous invoices if needed
      setInvoiceOptions(/* previous invoice options */);
    } catch (error) {
      console.error("Error fetching invoice numbers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchInvoiceNumbers(); // Fetch invoice numbers on component mount
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [transactionDetails.products]);

  const calculateTotals = () => {
    const total = transactionDetails.products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    const quantity = transactionDetails.products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );
    setTotalAmount(total);
    setTotalQuantity(quantity);
  };

  const handleCustomerChange = (selectedOption) => {
    setTransactionDetails({ ...transactionDetails, customer: selectedOption });
  };

  const handleInvoiceChange = (selectedOption) => {
    setTransactionDetails({
      ...transactionDetails,
      customerInvoice: selectedOption,
    });
  };

  const loadCustomerOptions = (inputValue) => {
    return new Promise((resolve) => {
      const filteredOptions = customerDetails.filter((customer) =>
        customer.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      resolve(filteredOptions);
    });
  };

  const loadInvoiceOptions = (inputValue) => {
    return new Promise((resolve) => {
      const filteredOptions = invoiceOptions.filter((invoice) =>
        invoice.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      resolve(filteredOptions);
    });
  };

  const handleAddProduct = (product) => {
    setTransactionDetails({
      ...transactionDetails,
      products: [...transactionDetails.products, product],
    });
    setShowModal(false);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = transactionDetails.products.filter(
      (_, i) => i !== index
    );
    setTransactionDetails({ ...transactionDetails, products: updatedProducts });
  };

  const handleClearProducts = () => {
    setTransactionDetails({ ...transactionDetails, products: [] });
    setTotalAmount(0);
    setTotalQuantity(0);
  };

  const handleSubmit = async () => {
    const transformedData = {
      inward_stock_date: transactionDetails.purchaseDate,
      customer: transactionDetails.customer?.value || null,
      delivery_date: transactionDetails.customerDate,
      supplier_invoice_number: nextInvoiceNumber, // Use the next invoice number here
      transaction_details: transactionDetails.products.map((product) => ({
        product: product.id,
        delivery_date: product.deliveryDate,
        quantity: product.quantity,
        washing_quantity: product.quantity,
        total: product.price * product.quantity,
      })),
      remarks: transactionDetails.remarks,
    };

    try {
      await axios.post(
        `${baseUrl}store/product-in-transactions/`, // Adjust endpoint for transaction out
        transformedData
      );
      Swal.fire("Success", "Transaction saved successfully", "success");
      handleClearProducts();
    } catch (error) {
      console.error("Error saving transaction:", error);
      Swal.fire("Error", "Failed to save the transaction", "error");
    }

    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6">
      <div ref={componentRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Inward Stock Date
            </label>
            <input
              type="date"
              value={transactionDetails.purchaseDate}
              onChange={(e) =>
                setTransactionDetails({
                  ...transactionDetails,
                  purchaseDate: e.target.value,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Customer */}
          <div className="flex items-center">
            <div className="relative flex-grow">
              <label className="block text-sm font-medium text-gray-700">
                Customer Name
              </label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadCustomerOptions}
                onChange={handleCustomerChange}
                isClearable
                placeholder="Search Customer"
                className="mt-1 block w-full"
                defaultOptions={customerDetails}
              />
              <button
                className="absolute inset-y-10 right-10 flex items-center px-4 text-blue-500 hover:text-blue-700"
                onClick={() => setShowCustomerModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delivery Date
            </label>
            <input
              type="date"
              value={transactionDetails.customerDate}
              onChange={(e) =>
                setTransactionDetails({
                  ...transactionDetails,
                  customerDate: e.target.value,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Invoice Number
            </label>
            {/* Read-only field for the next invoice number */}
            <input
              type="text"
              value={nextInvoiceNumber} // This should be the state holding the fetched number
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />

            {/* AsyncSelect for previous invoice numbers */}
            {/* <AsyncSelect
              cacheOptions
              loadOptions={loadInvoiceOptions} // Function to load previous invoice numbers
              onChange={handleInvoiceChange} // Handle the selection of previous invoice numbers
              isClearable
              placeholder="Search Previous Invoice Numbers"
              className="mt-1 block w-full"
              defaultOptions={invoiceOptions} // Set this to your previous invoice numbers
            /> */}
          </div>
        </div>

        {/* Add Products */}
        <div className="mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded"
          >
            Add Product
          </button>
        </div>

        {/* Product List */}
        <div className="mt-4">
          {transactionDetails.products.length > 0 && (
            <table className="min-w-full bg-white shadow-md rounded">
              <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <tr>
                  <th className="py-3 px-6 text-left">#</th>
                  <th className="py-3 px-6 text-left">Product Code</th>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Quantity</th>
                  <th className="py-3 px-6 text-left">Price</th>
                  <th className="py-3 px-6 text-left">Total</th>
                  <th className="py-3 px-6 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {transactionDetails.products.map((product, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6 text-left">{index + 1}</td>
                    <td className="py-3 px-6 text-left">
                      {product.productCode}
                    </td>
                    <td className="py-3 px-6 text-left">{product.name}</td>
                    <td className="py-3 px-6 text-left">{product.quantity}</td>
                    <td className="py-3 px-6 text-left">{product.price}</td>
                    <td className="py-3 px-6 text-left">
                      {(product.price * product.quantity).toFixed(2)}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Totals */}
        <div className="mt-4 bg-gray-200 p-4 rounded text-right">
          <strong>Total Amount:</strong> {totalAmount.toFixed(2)}
          <br />
          <strong>Total Quantity:</strong> {totalQuantity}
        </div>

        {/* Remarks */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Remarks
          </label>
          <textarea
            value={transactionDetails.remarks}
            onChange={(e) =>
              setTransactionDetails({
                ...transactionDetails,
                remarks: e.target.value,
              })
            }
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded"
          >
            Submit Transaction
          </button>
          <button
            onClick={() => window.print()}
            className="ml-4 inline-flex items-center px-4 py-2 text-white bg-yellow-600 hover:bg-yellow-700 rounded"
          >
            Print Transaction
          </button>
        </div>

        {/* Print Component */}
        <ReactToPrint
          trigger={() => (
            <button style={{ display: "none" }}>Print this out!</button>
          )}
          content={() => componentRef.current}
        />
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          setShowModal={setShowModal}
          addProduct={handleAddProduct} // Make sure this function is defined
          defaultDeliveryDate={transactionDetails.customerDate}
        />
      )}

      {/* Supplier Modal */}
      {showCustomerModal && (
        <CustomerModal
          setShowModal={setShowCustomerModal}
        />
      )}
    </div>
  );
};

export default TransactionOutForm;
