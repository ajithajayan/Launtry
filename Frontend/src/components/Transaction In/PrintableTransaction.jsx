import React from 'react';

const PrintableTransaction = React.forwardRef(({ transactionDetails, totalAmount, totalQuantity }, ref) => {
  return (
    <div ref={ref} className="p-4">
      <h1 className="text-xl font-bold">Transaction Receipt</h1>
      <p><strong>Inward Stock Date:</strong> {transactionDetails.purchaseDate}</p>
      <p><strong>Customer:</strong> {transactionDetails.customer?.label || "N/A"}</p>
      <p><strong>Delivery Date:</strong> {transactionDetails.customerDate}</p>
      <p><strong>Invoice Number:</strong> {transactionDetails.customerInvoice}</p>
      <h2 className="mt-4 font-bold">Products</h2>
      <table className="min-w-full bg-white shadow-md rounded">
        <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <tr>
            <th className="py-3 px-6 text-left">Product Name</th>
            <th className="py-3 px-6 text-left">Quantity</th>
            <th className="py-3 px-6 text-left">Price</th>
            <th className="py-3 px-6 text-left">Total</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {transactionDetails.products.map((product, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left">{product.name}</td>
              <td className="py-3 px-6 text-left">{product.quantity}</td>
              <td className="py-3 px-6 text-left">{product.price.toFixed(2)}</td>
              <td className="py-3 px-6 text-left">{(product.price * product.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 bg-gray-200 p-2 rounded text-right">
        <strong>Total Amount:</strong> {totalAmount.toFixed(2)}
        <br />
        <strong>Total Quantity:</strong> {totalQuantity}
      </div>
      <p className="mt-2"><strong>Remarks:</strong> {transactionDetails.remarks}</p>
    </div>
  );
});

export default PrintableTransaction;
