from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from store.models import (
    ProductOutTransactionDetail, Customer, Category, Brand, Product, Branch,
    ProductInTransaction, ProductInTransactionDetail, TotalStock, ProductOutTransaction, ExpiredProduct, DefectiveProduct
)
from .serializers import (
    BranchWiseReportSerializer, ExpiredProductReportSerializer, ExpiredProductSerializer, FullTransactionDetailSerializer, InwardQtyReportSerializer, OutwardQtyReportSerializer, ProductDetailsReportSerializer, ProductInTransactionDetailSerializer, SupplierSerializer, CategorySerializer, BrandSerializer, ProductSerializer, BranchSerializer,
    ProductInTransactionSerializer, InventorySerializer, ProductOutTransactionSerializer, DefectiveProductSerializer, SupplierWiseReportSerializer
)
from rest_framework.views import APIView
from rest_framework import generics
from django.db.models import F, Value, Case, When, IntegerField
from django.db import transaction
from django.db.models import Sum
from rest_framework.generics import RetrieveAPIView
from rest_framework.generics import GenericAPIView


class DashboardView(APIView):
    def get(self, request):
        total_orders = ProductInTransaction.objects.count()
        pending_orders = ProductInTransaction.objects.filter(is_delivered=False).count()
        completed_orders = ProductInTransaction.objects.filter(is_delivered=True).count()

        # Calculate total revenue from completed transactions
        total_revenue = ProductInTransactionDetail.objects.filter(
            transaction__is_delivered=True
        ).aggregate(total=Sum('total'))['total'] or 0.0

        return Response({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'total_revenue': total_revenue,
        })

# Supplier Views
class SupplierListCreateView(generics.ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = SupplierSerializer

class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.all()
    serializer_class = SupplierSerializer

# Category Views
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# Brand Views
class BrandListCreateView(generics.ListCreateAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

# Product Views
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related('brand', 'category').all()
    serializer_class = ProductSerializer

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def perform_destroy(self, instance):
        # Decrease stock from TotalStock when a product is deleted, if necessary
        try:
            total_stock = TotalStock.objects.get(product=instance)
            total_stock.total_quantity = 0
            total_stock.save()
        except TotalStock.DoesNotExist:
            pass
        
        instance.delete()

# Get total stock of a product
class GetTotalStockView(APIView):
    def get(self, request, product_code, format=None):
        try:
            product = Product.objects.get(product_code=product_code)
            total_stock = TotalStock.objects.get(product=product)
            return Response({'total_stock': total_stock.total_quantity}, status=status.HTTP_200_OK)
        except (Product.DoesNotExist, TotalStock.DoesNotExist):
            return Response({'error': 'Product not found or stock not available'}, status=status.HTTP_404_NOT_FOUND)

# Search product codes
class ProductCodeSearchView(APIView):
    def get(self, request, format=None):
        query = request.GET.get('query', '')
        if query:
            products = Product.objects.filter(product_code__icontains=query)[:10]
            product_codes = products.values('product_code')
            return Response(product_codes, status=status.HTTP_200_OK)
        return Response({'error': 'No query provided'}, status=status.HTTP_400_BAD_REQUEST)

# Branch Views
class BranchListCreateView(generics.ListCreateAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

class BranchDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    lookup_field = 'branch_code'

# Product In Transaction Views
class ProductInTransactionListCreateView(generics.ListCreateAPIView):
    queryset = ProductInTransaction.objects.all()
    serializer_class = ProductInTransactionSerializer

class ProductInTransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductInTransaction.objects.all()
    serializer_class = ProductInTransactionSerializer

    def perform_destroy(self, instance):
        # Decrease stock from TotalStock when a transaction is deleted
        for detail in instance.transaction_details.all():
            product_total_stock = TotalStock.objects.get(product=detail.product)
            product_total_stock.total_quantity -= detail.quantity
            product_total_stock.save()
        
        instance.delete()


class ProductInTransactionUpdateView(generics.UpdateAPIView):
    queryset = ProductInTransaction.objects.all()
    serializer_class = ProductInTransactionSerializer

    def patch(self, request, supplier_invoice_number, *args, **kwargs):
        try:
            transaction = self.get_queryset().get(supplier_invoice_number=supplier_invoice_number)
            transaction.is_delivered = True  # Set to true
            transaction.save()
            return Response({'message': 'Delivery status updated successfully'}, status=status.HTTP_200_OK)
        except ProductInTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)


class InventoryListView(generics.ListAPIView):
    serializer_class = InventorySerializer

    def get_queryset(self):
        # Get the current date
        current_date = timezone.now().date()

        # Check if the exceeded_delivery filter is active
        exceeded_delivery = self.request.query_params.get('exceeded_delivery')

        queryset = ProductInTransactionDetail.objects.select_related(
            'product', 'product__category', 'product__brand',
            'transaction', 'transaction__customer',
        ).annotate(
            product_code=F('product__product_code'),
            name=F('product__name'),
            barcode=F('product__barcode'),
            category_name=F('product__category__name'),
            brand_name=F('product__brand__name'),
            customer_name=F('transaction__customer__name'),
            purchase_date=F('transaction__inward_stock_date'),  # Adjust if needed
            stock_quantity=F('quantity'),
        )

        # Filter by delivery_date if exceeded_delivery is true
        if exceeded_delivery == "true":
            queryset = queryset.filter(delivery_date__lt=current_date)

        # Filter to only show items where delivery is false
        queryset = queryset.filter(transaction__is_delivered=False)

        return queryset

class TransactionView(GenericAPIView):
    serializer_class = FullTransactionDetailSerializer

    def get(self, request, supplier_invoice_number=None):
        if supplier_invoice_number:
            # Fetch transaction by supplier_invoice_number and check is_delivered field
            try:
                transaction = ProductInTransaction.objects.prefetch_related('transaction_details').get(
                    supplier_invoice_number=supplier_invoice_number,
                    is_delivered=False  # Only fetch if is_delivered is False
                )
                serializer = self.serializer_class(transaction)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except ProductInTransaction.DoesNotExist:
                return Response({'error': 'Transaction not found or already delivered'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Fetch and return all supplier_invoice_numbers where is_delivered is False
            transactions = ProductInTransaction.objects.filter(is_delivered=False).values_list('supplier_invoice_number', flat=True)
            return Response({'supplier_invoice_numbers': list(transactions)}, status=status.HTTP_200_OK)




# Product Transaction Out format
class ProductOutTransactionListCreateView(generics.ListCreateAPIView):
    queryset = ProductOutTransaction.objects.all()
    serializer_class = ProductOutTransactionSerializer






# View to remove expired products and track them
class RemoveExpiredProductView(APIView):
    def post(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        qty_to_remove = request.data.get('qty_to_remove', None)
        remarks = request.data.get('remarks', '')

        if not product_id or qty_to_remove is None:
            return Response({"error": "Product ID and quantity to remove are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                in_transaction_details = ProductInTransactionDetail.objects.filter(product_id=product_id, expiry_date__lt=date.today()).order_by('expiry_date')

                remaining_qty_needed = qty_to_remove

                for detail in in_transaction_details:
                    if remaining_qty_needed <= 0:
                        break

                    if detail.remaining_quantity >= remaining_qty_needed:
                        ExpiredProduct.objects.create(
                            product_id=product_id,
                            qty_expired=remaining_qty_needed,
                            expiry_date=detail.expiry_date,
                            remarks=remarks
                        )

                        detail.remaining_quantity -= remaining_qty_needed
                        detail.save()
                        remaining_qty_needed = 0
                    else:
                        ExpiredProduct.objects.create(
                            product_id=product_id,
                            qty_expired=detail.remaining_quantity,
                            expiry_date=detail.expiry_date,
                            remarks=remarks
                        )

                        remaining_qty_needed -= detail.remaining_quantity
                        detail.remaining_quantity = 0
                        detail.save()

                # Update total stock after removal
                total_stock = TotalStock.objects.get(product_id=product_id)
                total_stock.total_quantity -= qty_to_remove
                total_stock.save()

            return Response({"success": "Expired product removed from inventory and details tracked."}, status=status.HTTP_200_OK)
        except ProductInTransactionDetail.DoesNotExist:
            return Response({"error": "Product not found or already removed."}, status=status.HTTP_404_NOT_FOUND)
        except TotalStock.DoesNotExist:
            return Response({"error": "Total stock not found for this product."}, status=status.HTTP_404_NOT_FOUND)

# View to remove defective products and track them
class RemoveDefectiveProductView(APIView):
    def post(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        qty_to_remove = request.data.get('qty_to_remove', None)
        remarks = request.data.get('remarks', '')

        if not product_id or qty_to_remove is None:
            return Response({"error": "Product ID and quantity to remove are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                in_transaction_details = ProductInTransactionDetail.objects.filter(product_id=product_id).order_by('expiry_date')

                remaining_qty_needed = qty_to_remove

                for detail in in_transaction_details:
                    if remaining_qty_needed <= 0:
                        break

                    if detail.remaining_quantity >= remaining_qty_needed:
                        DefectiveProduct.objects.create(
                            product_id=product_id,
                            qty_defective=remaining_qty_needed,
                            remarks=remarks
                        )

                        detail.remaining_quantity -= remaining_qty_needed
                        detail.save()
                        remaining_qty_needed = 0
                    else:
                        DefectiveProduct.objects.create(
                            product_id=product_id,
                            qty_defective=detail.remaining_quantity,
                            remarks=remarks
                        )

                        remaining_qty_needed -= detail.remaining_quantity
                        detail.remaining_quantity = 0
                        detail.save()

                # Update total stock after removal
                total_stock = TotalStock.objects.get(product_id=product_id)
                total_stock.total_quantity -= qty_to_remove
                total_stock.save()

            return Response({"success": "Defective product removed from inventory and details tracked."}, status=status.HTTP_200_OK)
        except ProductInTransactionDetail.DoesNotExist:
            return Response({"error": "Product not found or already removed."}, status=status.HTTP_404_NOT_FOUND)
        except TotalStock.DoesNotExist:
            return Response({"error": "Total stock not found for this product."}, status=status.HTTP_404_NOT_FOUND)


# List view to display all tracked expired products
class TrackedExpiredProductListView(generics.ListAPIView):
    queryset = ExpiredProduct.objects.select_related('product').all()
    serializer_class = ExpiredProductSerializer

# List view to display expired products that are still in stock
from django.db import transaction
from datetime import date

# View to list expired products that have not been removed yet
class ExpiredProductListView(generics.ListAPIView):
    serializer_class = InventorySerializer

    def get_queryset(self):
        current_date = timezone.now().date()
        return ProductInTransactionDetail.objects.select_related(
            'product', 'product__category', 'product__brand', 'transaction', 'transaction__supplier'
        ).filter(
            expiry_date__lt=current_date,
            remaining_quantity__gt=0  # Ensures only products with remaining stock are shown
        )

# View to remove expired products and mark them as removed
class RemoveExpiredProductView(APIView):
    def post(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        qty_to_remove = request.data.get('qty_to_remove', None)
        remarks = request.data.get('remarks', '')

        if not product_id or qty_to_remove is None:
            return Response({"error": "Product ID and quantity to remove are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                in_transaction_details = ProductInTransactionDetail.objects.filter(
                    product_id=product_id, 
                    expiry_date__lt=date.today(),
                    remaining_quantity__gt=0  # Only handle products with remaining stock
                ).order_by('expiry_date')

                remaining_qty_needed = qty_to_remove

                for detail in in_transaction_details:
                    if remaining_qty_needed <= 0:
                        break

                    if detail.remaining_quantity >= remaining_qty_needed:
                        ExpiredProduct.objects.create(
                            product_id=product_id,
                            qty_expired=remaining_qty_needed,
                            expiry_date=detail.expiry_date,
                            remarks=remarks
                        )

                        detail.remaining_quantity -= remaining_qty_needed
                        detail.save()
                        remaining_qty_needed = 0
                    else:
                        ExpiredProduct.objects.create(
                            product_id=product_id,
                            qty_expired=detail.remaining_quantity,
                            expiry_date=detail.expiry_date,
                            remarks=remarks
                        )

                        remaining_qty_needed -= detail.remaining_quantity
                        detail.remaining_quantity = 0
                        detail.save()

                # Update total stock after removal
                total_stock = TotalStock.objects.get(product_id=product_id)
                total_stock.total_quantity -= qty_to_remove
                total_stock.save()

            return Response({"success": "Expired product removed from inventory and details tracked."}, status=status.HTTP_200_OK)
        except ProductInTransactionDetail.DoesNotExist:
            return Response({"error": "Product not found or already removed."}, status=status.HTTP_404_NOT_FOUND)
        except TotalStock.DoesNotExist:
            return Response({"error": "Total stock not found for this product."}, status=status.HTTP_404_NOT_FOUND)
        


#********************************** Reports **************************************** 

class ReportView(APIView):
    def get(self, request, report_type=None):
        if report_type == 'transaction-in':
            return self.get_transaction_in_report(request)
        elif report_type == 'transaction-out':
            return self.get_transaction_out_report(request)
        elif report_type == 'sales':
            return self.get_sales_report(request)
        elif report_type == 'daily':
            return self.get_daily_report(request)
        else:
            return Response({'error': 'Invalid report type'}, status=400)

    def get_transaction_in_report(self, request):
        in_transactions = ProductInTransaction.objects.filter(is_delivered=False)
        serializer = FullTransactionDetailSerializer(in_transactions, many=True)
        return Response({
            'transaction_in': serializer.data
        }, status=200)

    def get_transaction_out_report(self, request):
        out_transactions = ProductInTransaction.objects.filter(is_delivered=True)
        serializer = FullTransactionDetailSerializer(out_transactions, many=True)
        return Response({
            'transaction_out': serializer.data
        }, status=200)

    def get_sales_report(self, request):
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not start_date or not end_date:
            return Response({'error': 'Please provide both start_date and end_date'}, status=400)

        sales_transactions = ProductInTransactionDetail.objects.filter(
            transaction__is_delivered=True,
            transaction__inward_stock_date__range=[start_date, end_date]
        )
        total_sales = sales_transactions.aggregate(Sum('total'))['total__sum'] or 0

        serializer = ProductInTransactionDetailSerializer(sales_transactions, many=True)
        return Response({
            'total_sales': total_sales,
            'sales_details': serializer.data
        }, status=200)

    def get_daily_report(self, request):
        today = timezone.now().date()

        transactions_in = ProductInTransaction.objects.filter(inward_stock_date=today)
        transactions_out = ProductInTransaction.objects.filter(delivery_date=today, is_delivered=True)

        sales_today = ProductInTransactionDetail.objects.filter(
            transaction__is_delivered=True,
            transaction__delivery_date=today
        ).aggregate(Sum('total'))['total__sum'] or 0

        in_serializer = FullTransactionDetailSerializer(transactions_in, many=True)
        out_serializer = FullTransactionDetailSerializer(transactions_out, many=True)

        return Response({
            'transactions_in_today': in_serializer.data,
            'transactions_out_today': out_serializer.data,
            'total_sales_today': sales_today
        }, status=200)