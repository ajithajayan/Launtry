import React, { useState } from 'react';
import axios from 'axios';
import { baseUrl } from "../../utils/constants/Constants";

const ReportPage = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportOptions = [
    { label: 'Inward Quantity Report', value: 'inward-qty' },
    { label: 'Outward Quantity Report', value: 'outward-qty' },
    { label: 'Branch Wise Report', value: 'branch-wise' },
    { label: 'Expired Product Report', value: 'expired-products' },
    { label: 'Supplier Wise Report', value: 'supplier-wise' },
    { label: 'Product Details Report', value: 'product-details' },
    { label: 'Daily Report', value: 'daily' }, // New daily report option
  ];

  const handleReportChange = async (event) => {
    const report = event.target.value;
    setSelectedReport(report);
    setReportData([]); // Clear previous report data
    if (report) {
      if (report === 'daily') {
        generateDailyReport();
      } else {
        setLoading(true);
        try {
          const response = await axios.get(`${baseUrl}store/reports/${report}/`);
          setReportData(response.data || []); // Ensure that results are always an array
        } catch (error) {
          console.error("Error fetching report data:", error);
          setReportData([]); // Reset report data on error
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const generateDailyReport = async () => {
    try {
      const response = await axios.get(`${baseUrl}store/reports/daily/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daily_report_${new Date().toLocaleDateString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error generating daily report:", error);
    }
  };

  const renderTableHeaders = () => {
    if (reportData.length === 0) return null;
    return (
      <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
        <tr>
          {Object.keys(reportData[0] || {}).map((key) => (
            <th key={key} className="py-3 px-6 text-left">{key.replace(/_/g, ' ').toUpperCase()}</th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderTableRows = () => {
    if (reportData.length === 0) return null;

    return (
      <tbody className="text-gray-600 text-sm">
        {reportData.map((row, index) => (
          <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
            {Object.values(row || {}).map((value, idx) => (
              <td key={idx} className="py-3 px-6 text-left">
                {typeof value === 'string' && Date.parse(value)
                  ? new Date(value).toLocaleDateString()
                  : value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Select a Report</h2>
      <div className="mb-4">
        <select
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedReport}
          onChange={handleReportChange}
        >
          <option value="">Select a Report</option>
          {reportOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading report...</div>
      ) : reportData.length > 0 ? (
        <table className="min-w-full bg-white shadow-md rounded">
          {renderTableHeaders()}
          {renderTableRows()}
        </table>
      ) : (
        selectedReport !== 'daily' && <div className="text-center py-8 text-gray-500">No report selected or no data available.</div>
      )}
    </div>
  );
};

export default ReportPage;
