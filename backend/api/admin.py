from django.contrib import admin

from .models import Shop, Product, Offer, Review


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "phone", "verified", "created_at")
    list_filter = ("category", "verified")
    search_fields = ("name", "address", "phone")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "price", "is_active", "created_at")
    list_filter = ("is_active", "shop")
    search_fields = ("name", "shop__name")


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ("title", "shop", "discount", "start_date", "end_date", "created_at")
    list_filter = ("start_date", "end_date", "shop")
    search_fields = ("title", "shop__name", "description")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("shop", "customer_name", "rating", "created_at")
    list_filter = ("rating", "shop")
    search_fields = ("customer_name", "comment", "shop__name")

