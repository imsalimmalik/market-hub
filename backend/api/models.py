from django.db import models
from django.conf import settings

class Shop(models.Model):
    """
    Local shop / vendor in the marketplace.
    """
    vendor = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shop",
        null=True,
        blank=True,
    )

    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True)
    rating = models.FloatField(default=0.0)
    verified = models.BooleanField(default=False)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="products",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Offer(models.Model):
    """
    Event / offer for a shop (discount, promotion).
    """

    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="offers",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    discount = models.CharField(max_length=50)
    image = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title


class Review(models.Model):
    """
    Customer review for a shop.
    """

    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    customer_name = models.CharField(max_length=255)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.customer_name} - {self.rating}★"
