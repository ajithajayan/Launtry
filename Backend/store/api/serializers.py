from rest_framework import serializers
from django.db.models import Sum

from store.models import (
    Customer, Category, Brand, Product, Branch,
    ProductInTransaction, ProductInTransactionDetail, TotalStock, ProductOutTransaction, ProductOutTransactionDetail, ExpiredProduct, DefectiveProduct
)
from django.utils.crypto import get_random_string
from django.db import transaction

# Supplier Serializer
class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

# Category Serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# Brand Serializer
class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'barcode': {'read_only': True},
            'product_code': {'required': False, 'allow_blank': True, 'read_only': True},  # Set to read-only
            'category': {'write_only': True},
            'brand': {'write_only': True},
            'price': {'read_only': False}, 
        }

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    def create(self, validated_data):
        # No need to manually handle product_code, let the model's save method do it
        return super().create(validated_data)
    
# Branch Serializer
class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

# Product In Transaction Detail Serializer
# Product In Transaction Detail Serializer
class ProductInTransactionDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    transaction = serializers.PrimaryKeyRelatedField(read_only=True)  # Mark transaction as read_only
    product_image = serializers.ImageField(source='product.image', read_only=True)  # Include the product image

    class Meta:
        model = ProductInTransactionDetail  # Adjust to your actual model name
        fields = '__all__'  # Add product_image if you want it to be part of all fields, or specify fields explicitly

    def get_product_image(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.product.image.url) if obj.product.image else None
         

# Product In Transaction Serializer
class ProductInTransactionSerializer(serializers.ModelSerializer):
    transaction_details = ProductInTransactionDetailSerializer(many=True, write_only=True)
    

    class Meta:
        model = ProductInTransaction
        fields = '__all__'
    
    def create(self, validated_data):
        details_data = validated_data.pop('transaction_details')
        transaction = ProductInTransaction.objects.create(**validated_data)

        for detail_data in details_data:
            ProductInTransactionDetail.objects.create(
                transaction=transaction,  # Assign the transaction here
                **detail_data
            )
        
        return transaction




# Inventory Serializer

class InventorySerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_code = serializers.CharField(source='product.product_code', read_only=True)
    name = serializers.CharField(source='product.name', read_only=True)
    barcode = serializers.CharField(source='product.barcode', read_only=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True)
    brand_name = serializers.CharField(source='product.brand.name', read_only=True)
    customer_name = serializers.CharField(source='transaction.customer.name', read_only=True)
    inward_stock_date = serializers.DateField(source='transaction.inward_stock_date', read_only=True)
    washing_quantity = serializers.IntegerField(read_only=True)
    quantity = serializers.IntegerField(read_only=True)
    transaction_id = serializers.IntegerField(source='transaction.id', read_only=True)  # Transaction ID
    product_image = serializers.ImageField(source='product.image', read_only=True)  # Product image
    invoice_number = serializers.CharField(source='transaction.supplier_invoice_number', read_only=True)  # Invoice number

    class Meta:
        model = ProductInTransactionDetail
        fields = [
            'product_id', 'product_code', 'name', 'barcode', 'category_name', 
            'brand_name', 'customer_name', 'inward_stock_date', 'washing_quantity', 
            'quantity', 'delivery_date', 'transaction_id', 'product_image', 'invoice_number'  # Ensure all needed fields are included
        ]


class FullTransactionDetailSerializer(serializers.ModelSerializer):
    transaction_details = ProductInTransactionDetailSerializer(many=True, read_only=True)  # Fetch product details
    customer_name = serializers.CharField(source='customer.name', read_only=True)  # Customer name
    supplier_invoice_number = serializers.CharField(read_only=True)  # Invoice number

    class Meta:
        model = ProductInTransaction
        fields = ['supplier_invoice_number', 'customer_name', 'inward_stock_date', 'delivery_date', 'remarks', 'transaction_details']  # Add fields you need


class ProductOutTransactionDetailSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = ProductOutTransactionDetail
        fields = ['product', 'qty_requested']

class ProductOutTransactionSerializer(serializers.ModelSerializer):
    transaction_details = ProductOutTransactionDetailSerializer(many=True, read_only=True)

    class Meta:
        model = ProductOutTransaction
        fields = ['id', 'supplier_invoice_number', 'transaction_details']




class ExpiredProductSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.product_code', read_only=True)
    brand_name = serializers.CharField(source='product.brand.name', read_only=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True)

    class Meta:
        model = ExpiredProduct
        fields = ['id', 'product_id', 'product_name', 'product_code', 'brand_name', 'category_name', 'qty_expired', 'expiry_date', 'remarks']


class DefectiveProductSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.product_code', read_only=True)
    brand_name = serializers.CharField(source='product.brand.name', read_only=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True)

    class Meta:
        model = DefectiveProduct
        fields = ['id', 'product_id', 'product_name', 'product_code', 'brand_name', 'category_name', 'qty_defective', 'remarks']




#  **************************** Reports serializer ****************************************


class InwardQtyReportSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='transaction.supplier.name', read_only=True)
    product_detail = serializers.CharField(source='product.name', read_only=True)
    date = serializers.DateField(source='transaction.purchase_date', read_only=True)
    invoice_number = serializers.CharField(source='transaction.supplier_invoice_number', read_only=True)

    class Meta:
        model = ProductInTransactionDetail
        fields = ['date', 'invoice_number', 'supplier_name', 'product_detail', 'quantity']


class OutwardQtyReportSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='transaction.branch.name', read_only=True)
    branch_code = serializers.CharField(source='transaction.branch.branch_code', read_only=True)
    product_detail = serializers.CharField(source='product.name', read_only=True)
    date = serializers.DateField(source='transaction.date', read_only=True)
    transfer_invoice_number = serializers.CharField(source='transaction.transfer_invoice_number', read_only=True)

    class Meta:
        model = ProductOutTransactionDetail
        fields = ['date', 'transfer_invoice_number', 'branch_name', 'branch_code', 'product_detail', 'qty_requested']


class BranchWiseReportSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='transaction.branch.name', read_only=True)
    branch_code = serializers.CharField(source='transaction.branch.branch_code', read_only=True)
    product_detail = serializers.CharField(source='product.name', read_only=True)
    date = serializers.DateField(source='transaction.date', read_only=True)
    transfer_invoice_number = serializers.CharField(source='transaction.transfer_invoice_number', read_only=True)

    class Meta:
        model = ProductOutTransactionDetail
        fields = ['date', 'transfer_invoice_number', 'branch_name', 'branch_code', 'product_detail', 'qty_requested']



class ExpiredProductReportSerializer(serializers.ModelSerializer):
    product_detail = serializers.CharField(source='product.name', read_only=True)
    supplier_name = serializers.CharField(source='product.productintransactiondetail.transaction.supplier.name', read_only=True)
    supplier_invoice_number = serializers.CharField(source='product.productintransactiondetail.transaction.supplier_invoice_number', read_only=True)

    class Meta:
        model = ExpiredProduct
        fields = ['removal_date', 'supplier_invoice_number', 'supplier_name', 'product_detail', 'qty_expired', 'expiry_date']

class SupplierWiseReportSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='transaction.supplier.name', read_only=True)
    product_detail = serializers.CharField(source='product.name', read_only=True)
    date = serializers.DateField(source='transaction.purchase_date', read_only=True)
    supplier_invoice_number = serializers.CharField(source='transaction.supplier_invoice_number', read_only=True)

    class Meta:
        model = ProductInTransactionDetail
        fields = ['date', 'supplier_invoice_number', 'supplier_name', 'product_detail', 'quantity', 'expiry_date']

class ProductDetailsReportSerializer(serializers.ModelSerializer):
    outward_qty = serializers.SerializerMethodField()
    date = serializers.DateField(source='transaction.purchase_date')
    supplier_invoice_number = serializers.CharField(source='transaction.supplier_invoice_number')
    supplier_name = serializers.CharField(source='transaction.supplier.name')
    product_detail = serializers.CharField(source='product.name')

    class Meta:
        model = ProductInTransactionDetail
        fields = [
            'date',
            'supplier_invoice_number',  # Valid field path
            'supplier_name',  # Valid field path
            'product_detail',  # Valid field path
            'manufacturing_date',
            'expiry_date',
            'quantity',
            'purchased_quantity',
            'remaining_quantity',
            'outward_qty',
        ]

    def get_outward_qty(self, obj):
        outward_qty = ProductOutTransactionDetail.objects.filter(product=obj.product).aggregate(total_out=Sum('qty_requested'))['total_out']
        return outward_qty if outward_qty else 0

