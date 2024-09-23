import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/constants/Constants";
import Swal from "sweetalert2";

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [showExceededDelivery, setShowExceededDelivery] = useState(false);
  const [groupedData, setGroupedData] = useState({}); // State for grouped data

  useEffect(() => {
    fetchInventory();
  }, [showExceededDelivery]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}store/inventory/?exceeded_delivery=${showExceededDelivery}`
      );
      const inventoryData = response.data.results;

      setInventory(inventoryData);
      groupInventoryByInvoice(inventoryData); // Group data by invoice
    } catch (error) {
      console.error("Error fetching inventory:", error);
      Swal.fire("Error", "Failed to fetch inventory data", "error");
    }
  };

  const handleShowExceededDelivery = () => {
    setShowExceededDelivery((prev) => !prev);
  };

  const groupInventoryByInvoice = (data) => {
    const grouped = data.reduce((acc, item) => {
      const { invoice_number } = item;
      if (!acc[invoice_number]) {
        acc[invoice_number] = {
          items: [],
          totalQuantity: 0,
          totalAmount: 0, // Assuming the price per product is fixed (replace with actual field)
        };
      }
      acc[invoice_number].items.push(item);
      acc[invoice_number].totalQuantity += item.quantity;
      acc[invoice_number].totalAmount += item.quantity * 10; // Assuming price is calculated like quantity * 10
      return acc;
    }, {});

    setGroupedData(grouped);
  };

  const getRowClassName = (delivery_date) => {
    const currentDate = new Date();
    const deliveryDate = new Date(delivery_date);
    const timeDifference = deliveryDate - currentDate;
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

    if (daysRemaining < 0) {
      return "bg-white-500 text-black"; // Delivery date has passed
    } else if (daysRemaining < 2) {
      return "bg-white-500 text-black"; // Less than 2 days remaining
    }
    return ""; // Default
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleShowExceededDelivery}
        >
          {showExceededDelivery
            ? "Show All Products"
            : "Show Products Exceeding Delivery Date"}
        </button>
      </div>

      {Object.keys(groupedData).length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal border-b border-gray-300">
              <tr>
                {/* <th className="py-3 px-6 text-left border-r border-gray-300">#</th> */}
                <th className="py-3 px-6 text-left border-r border-gray-300">Invoice</th> {/* Moved Invoice column */}
                <th className="py-3 px-6 text-left border-r border-gray-300">Product Image</th>
                {/* <th className="py-3 px-6 text-left border-r border-gray-300">Product Code</th> */}
                <th className="py-3 px-6 text-left border-r border-gray-300">Name</th>
                <th className="py-3 px-6 text-left border-r border-gray-300">Barcode</th>
                <th className="py-3 px-6 text-left border-r border-gray-300">Category</th>
                {/* <th className="py-3 px-6 text-left border-r border-gray-300">Brand</th> */}
                <th className="py-3 px-6 text-left border-r border-gray-300">Customer</th>
                <th className="py-3 px-6 text-left border-r border-gray-300">Inward Stock Date</th>
                <th className="py-3 px-6 text-left border-r border-gray-300">Delivery Date</th>
                {/* <th className="py-3 px-6 text-left border-r border-gray-300">Washing Quantity</th> */}
                <th className="py-3 px-6 text-left border-r border-gray-300">Quantity</th>
                <th className="py-3 px-6 text-left border-r border-gray-300">Total Qty</th>
                <th className="py-3 px-6 text-left border-r border-gray-300">Total Amount</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {Object.keys(groupedData).map((invoiceNumber, index) => {
                const invoiceGroup = groupedData[invoiceNumber];
                const { items, totalQuantity, totalAmount } = invoiceGroup;

                return items.map((item, idx) => (
                  <tr
                    key={item.transaction_id}
                    className={`border-b border-gray-300 hover:bg-gray-100 ${getRowClassName(
                      item.delivery_date
                    )}`}
                  >
                    {/* <td className="py-3 px-6 text-left border-r border-gray-300">{index + 1}</td> */}

                    {/* Merge the invoice column and totals only for the first item of the group */}
                    {idx === 0 && (
                      <td
                        className="py-3 px-6 text-left border-r border-gray-300"
                        rowSpan={items.length}
                      >
                        {invoiceNumber}
                      </td>
                    )}

                    <td className="py-3 px-6 text-left border-r border-gray-300">
                      <img
                        src={item.product_image}
                        alt={item.name}
                        className="w-16 h-16 object-cover"
                      />
                    </td>
                    {/* <td className="py-3 px-6 text-left border-r border-gray-300">{item.product_code}</td> */}
                    <td className="py-3 px-6 text-left border-r border-gray-300">{item.name}</td>
                    <td className="py-3 px-6 text-left border-r border-gray-300">{item.barcode}</td>
                    <td className="py-3 px-6 text-left border-r border-gray-300">{item.category_name}</td>
                    {/* <td className="py-3 px-6 text-left border-r border-gray-300">{item.brand_name}</td> */}
                    <td className="py-3 px-6 text-left border-r border-gray-300">{item.customer_name}</td>
                    <td className="py-3 px-6 text-left border-r border-gray-300">{item.inward_stock_date}</td>
                    <td className="py-3 px-6 text-left border-r border-gray-300">{item.delivery_date}</td>
                    {/* <td className="py-3 px-6 text-left border-r border-gray-300">{item.washing_quantity}</td> */}
                    <td className="py-3 px-6 text-left border-r border-gray-300">{item.quantity}</td>

                    {/* Only add total quantity and amount in the first row */}
                    {idx === 0 && (
                      <>
                        <td
                          className="py-3 px-6 text-left font-bold border-r border-gray-300"
                          rowSpan={items.length}
                        >
                          {totalQuantity}
                        </td>
                        <td
                          className="py-3 px-6 text-left font-bold border-r border-gray-300"
                          rowSpan={items.length}
                        >
                          {totalAmount}
                        </td>
                      </>
                    )}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No products found.{" "}
          {showExceededDelivery
            ? "No products exceeding delivery date."
            : "Inventory is empty."}
        </div>
      )}
    </div>
  );
};

export default InventoryList;
