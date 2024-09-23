from django.contrib import admin
from .models import Product, TotalStock, ProductInTransactionDetail,ProductInTransaction

admin.site.register(Product)
admin.site.register(TotalStock)
admin.site.register(ProductInTransactionDetail)
admin.site.register(ProductInTransaction)

# Register your models here.
