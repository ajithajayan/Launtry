# Generated by Django 5.0.1 on 2024-09-23 08:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0002_product_price_alter_productintransactiondetail_total'),
    ]

    operations = [
        migrations.AddField(
            model_name='productintransaction',
            name='is_delivered',
            field=models.BooleanField(default=False),
        ),
    ]
