from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
import os
import barcode
from barcode.writer import ImageWriter
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.crypto import get_random_string
from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save
from django.utils.crypto import get_random_string
import barcode
from barcode.writer import ImageWriter
from io import BytesIO
from django.utils import timezone
from django.db import models, transaction
from django.core.exceptions import ValidationError

# Customer model
class Customer(models.Model):  # Changed from Supplier to Customer
    name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.name

# Category model
class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

# Brand model
class Brand(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name



# Product Model
from django.db import models
from django.utils.crypto import get_random_string

class Product(models.Model):
    name = models.CharField(max_length=255)
    unit_type = models.CharField(max_length=100, default='pieces')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    product_code = models.CharField(max_length=100, blank=True, null=True, unique=True)
    barcode = models.CharField(max_length=100, unique=True, blank=True, null=True)
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Add price field

    def save(self, *args, **kwargs):
        # Generate a product code if not provided
        if not self.product_code:
            last_product = Product.objects.filter(product_code__startswith='P').order_by('-id').first()
            if last_product and last_product.product_code:
                last_code = int(last_product.product_code[1:])  # Strip the 'P' and convert to int
                self.product_code = f'P{last_code + 1}'
            else:
                self.product_code = 'P5001'  # Start from P5001 if no products exist

        # Generate barcode if not provided
        if not self.barcode:
            self.barcode = self.generate_unique_barcode()

        super().save(*args, **kwargs)

    def generate_unique_barcode(self):
        while True:
            barcode_number = get_random_string(12, allowed_chars='0123456789')
            if not Product.objects.filter(barcode=barcode_number).exists():
                return barcode_number

    def __str__(self):
        return f"{self.name} ({self.product_code})"


# ProductInTransaction Model
class ProductInTransaction(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    inward_stock_date = models.DateField()
    supplier_invoice_number = models.CharField(max_length=100)
    delivery_date = models.DateField()  # Date provided by the supplier
    remarks = models.TextField(blank=True, null=True)  # Remarks or comments about the transaction
    is_delivered = models.BooleanField(default=False)
    def save(self, *args, **kwargs):
        super(ProductInTransaction, self).save(*args, **kwargs)
        # Update stock for all products after the transaction is saved
        for detail in self.transaction_details.all():
            product_total_stock, created = TotalStock.objects.get_or_create(product=detail.product)
            product_total_stock.total_quantity += detail.quantity
            product_total_stock.save()  

    def __str__(self):
        return f"Transaction {self.id} - {self.supplier.name} on {self.purchase_date}"


# ProductInTransactionDetail Model
class ProductInTransactionDetail(models.Model):
    transaction = models.ForeignKey(ProductInTransaction, on_delete=models.CASCADE, related_name='transaction_details')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    delivery_date = models.DateField()
    quantity = models.PositiveIntegerField()  
    washing_quantity = models.PositiveIntegerField()   
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Total for the product in the transaction

    def save(self, *args, **kwargs):
        # Calculate total based on product price and quantity
        if self.quantity and self.product.price is not None:
            self.total = self.product.price * self.quantity
        
        super(ProductInTransactionDetail, self).save(*args, **kwargs)




# TotalStock Model
class TotalStock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    total_quantity = models.PositiveIntegerField(default=0)
    remaining_quantity = models.PositiveIntegerField(default=0)  # Add this line

    def __str__(self):
        return f"{self.product.name} - {self.remaining_quantity} remaining"


# Branch model
class Branch(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    branch_code = models.CharField(max_length=10, primary_key=True, unique=True, blank=True)
    contact_details = models.CharField(max_length=15)

    def save(self, *args, **kwargs):
        if not self.branch_code:
            last_branch = Branch.objects.order_by('-branch_code').first()
            if last_branch and last_branch.branch_code.startswith("BR"):
                last_code = int(last_branch.branch_code[2:])
                new_code = last_code + 1
            else:
                new_code = 121211
            self.branch_code = f'BR{new_code}'

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name





class ProductOutTransaction(models.Model):
    date = models.DateField(default=timezone.now)
    branch = models.ForeignKey('Branch', on_delete=models.CASCADE)
    transfer_invoice_number = models.CharField(max_length=255)
    branch_in_charge = models.CharField(max_length=255)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Out Transaction {self.id} - {self.branch.name} on {self.date}"
    

class ProductOutTransactionDetail(models.Model): 
    transaction = models.ForeignKey(ProductOutTransaction, on_delete=models.CASCADE, related_name='transaction_details')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty_requested = models.PositiveIntegerField()

    def save(self, *args, **kwargs):
        with transaction.atomic():
            # Update remaining_quantity in ProductInTransactionDetail
            in_transaction_details = ProductInTransactionDetail.objects.filter(product=self.product).order_by('expiry_date')

            remaining_qty_needed = self.qty_requested

            for detail in in_transaction_details:
                if detail.remaining_quantity >= remaining_qty_needed:
                    detail.remaining_quantity -= remaining_qty_needed
                    detail.save()
                    break
                else:
                    remaining_qty_needed -= detail.remaining_quantity
                    detail.remaining_quantity = 0
                    detail.save()

            super(ProductOutTransactionDetail, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.qty_requested} units"
    


# Expired Product Details

class ExpiredProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty_expired = models.PositiveIntegerField()
    removal_date = models.DateField(auto_now_add=True)
    expiry_date = models.DateField()
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} - Expired: {self.qty_expired} on {self.removal_date}"

# Defective Product Details

class DefectiveProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty_defective = models.PositiveIntegerField()
    removal_date = models.DateField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} - Defective: {self.qty_defective} on {self.removal_date}"



