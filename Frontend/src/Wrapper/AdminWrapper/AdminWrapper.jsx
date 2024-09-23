import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import AdminSignin from "../../pages/admin/AdminSignin";
import { Outlet, useRoutes } from "react-router-dom";
import Page404 from "../../components/404/Page404";
import ThemeProvider from "../../components/admin/elements/theme";
import "../../assets/Styles/main.scss";
import DashboardLayout from "../../pages/admin/DashboardLayout";
import Dashboard from "../../pages/admin/Dashboard";
import BranchList from "../../components/Branch/BranchList";
import BrandList from "../../components/Brand/BrandList";
import CategoryList from "../../components/Categories/CategoryList";
import SupplierList from "../../components/Supplier/SupplierList";
import ProductList from "../../components/Products/ProductList";
import AdminPrivateRoute from "../../components/Private/AdminPrivateRoute";
import TransactionForm from "../../components/Transaction In/TransactionForm";
import InventoryList from "../../components/Inventory/InventoryList";
import StockOutTransactionForm from "../../components/Transaction Out/TransactionOutForm";
import TransactionOutForm from "../../components/Transaction Out/TransactionOutForm";
import DefectiveProductForm from "../../components/Defective-Expiry/DefectiveProductForm";
import ExpiredProductList from "../../components/Defective-Expiry/ExpiredProductList";
import ReportPage from "../../components/Reports/ReportPage";


function AdminWrapper() {
  const routes = useRoutes([
    {
      path: "/login",
      element: <AdminSignin />,
    },
    {
      element: (
        // <AdminPrivateRoute>
          <ThemeProvider>
            <DashboardLayout>
              <Outlet />
            </DashboardLayout>
          </ThemeProvider>
        // </AdminPrivateRoute>
      ),
      children: [
        { path: "/", element: <Dashboard /> },
        { path: "/Brands", element: <BrandList /> },
        { path: "/Categories", element: <CategoryList /> },
        { path: "/Branches", element: <BranchList /> },
        { path: "/Suppliers", element: <SupplierList /> },
        { path: "/Products", element: <ProductList /> },
        { path: "/Supplier-Orders", element: <TransactionForm /> },
        { path: "/Inventory", element: <InventoryList /> },
        { path: "/Branch-Orders", element: <TransactionOutForm /> },
        { path: "/Defectives", element: <DefectiveProductForm /> },
        { path: "/expired-products", element: <ExpiredProductList /> },
        { path: "/Reports", element: <ReportPage /> },
        

      ],
    },
    {
      path: "*",
      element: <Page404 />,
    },
  ]);

  return routes;
}

export default AdminWrapper;
