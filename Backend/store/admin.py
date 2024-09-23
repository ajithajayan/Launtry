from django.contrib import admin
from .models import Product, TotalStock, ProductInTransactionDetail

admin.site.register(Product)
admin.site.register(TotalStock)
admin.site.register(ProductInTransactionDetail)

# Register your models here.
