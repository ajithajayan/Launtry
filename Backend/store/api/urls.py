from django.urls import path
from .views import (
    DashboardView, InventoryListView, ProductInTransactionUpdateView, ProductOutTransactionListCreateView, ReportView, SupplierListCreateView, SupplierDetailView,
    CategoryListCreateView, CategoryDetailView,
    BrandListCreateView, BrandDetailView,
    ProductListCreateView, ProductDetailView, GetTotalStockView, ProductCodeSearchView,
    BranchListCreateView, BranchDetailView,
    ProductInTransactionListCreateView, ProductInTransactionDetailView,ExpiredProductListView, RemoveExpiredProductView, RemoveDefectiveProductView, TrackedExpiredProductListView, TransactionView
)

urlpatterns = [
    
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # Supplier URLs
    path('suppliers/', SupplierListCreateView.as_view(), name='supplier-list-create'),
    path('suppliers/<int:pk>/', SupplierDetailView.as_view(), name='supplier-detail'),

    # Category URLs
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),

    # Brand URLs
    path('brands/', BrandListCreateView.as_view(), name='brand-list-create'),
    path('brands/<int:pk>/', BrandDetailView.as_view(), name='brand-detail'),

    # Product URLs
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<str:product_code>/total_stock/', GetTotalStockView.as_view(), name='get_total_stock'),
    path('products/search_codes/', ProductCodeSearchView.as_view(), name='search_product_codes'),

    # Branch URLs
    path('branches/', BranchListCreateView.as_view(), name='branch-list-create'),
    path('branches/<str:branch_code>/', BranchDetailView.as_view(), name='branch-detail'),

    # Product In Transaction URLs
    path('product-in-transactions/', ProductInTransactionListCreateView.as_view(), name='product-in-transaction-list-create'),
    path('product-in-transactions/<int:pk>/', ProductInTransactionDetailView.as_view(), name='product-in-transaction-detail'),
    path('product-in-transactions/update-delivery/<str:supplier_invoice_number>/', ProductInTransactionUpdateView.as_view(), name='update-delivery-status'),

    # Inventory
    path('inventory/', InventoryListView.as_view(), name='inventory-list'),


    
  
   # Fetch all supplier_invoice_numbers
    path('transactions/', TransactionView.as_view(), name='all_supplier_invoices'),
    
    # Fetch a transaction by supplier_invoice_number
    path('transactions/<str:supplier_invoice_number>/', TransactionView.as_view(), name='transaction_by_invoice'),
    # Product Out Transaction URLs

    path('product-out-transactions/', ProductOutTransactionListCreateView.as_view(), name='product-out-transaction-list-create'),

    # Expired Product and Defective Product API view

    path('expired-products/', ExpiredProductListView.as_view(), name='expired-product-list'),
    path('remove-expired-product/', RemoveExpiredProductView.as_view(), name='remove-expired-product'),
    path('remove-defective-product/', RemoveDefectiveProductView.as_view(), name='remove-defective-product'),
    path('tracked-expired-products/', TrackedExpiredProductListView.as_view(), name='tracked-expired-products'),


    # Reports form the admin side
     path('reports/<str:report_type>/', ReportView.as_view(), name='report_view'),

]
