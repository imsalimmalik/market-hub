from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Shop, Product, Offer, Review


class UserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


class ShopSerializer(serializers.ModelSerializer):
    # Explicitly represent Mongo ObjectId as string
    id = serializers.CharField(read_only=True)
    vendor_id = serializers.CharField(source="vendor.id", read_only=True)

    class Meta:
        model = Shop
        fields = [
            "id",
            "vendor_id",
            "name",
            "address",
            "phone",
            "category",
            "description",
            "image",
            "rating",
            "verified",
            "latitude",
            "longitude",
            "created_at",
        ]
        read_only_fields = ["id", "vendor_id", "rating", "verified", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    # Represent ObjectId as string
    id = serializers.CharField(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(),
        source="shop",
        write_only=True,
    )
    shop_id_display = serializers.CharField(source="shop.id", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "shop_id",
            "shop_id_display",
            "name",
            "description",
            "price",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "shop_id_display", "created_at", "updated_at"]


class OfferSerializer(serializers.ModelSerializer):
    # Represent ObjectId as string
    id = serializers.CharField(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(),
        source="shop",
        write_only=True,
        required=False,
        allow_null=True,
    )
    shop_id_display = serializers.CharField(source="shop.id", read_only=True)
    shop_name = serializers.CharField(source="shop.name", read_only=True)
    vendor_id = serializers.CharField(source="shop.vendor.id", read_only=True)

    class Meta:
        model = Offer
        fields = [
            "id",
            "shop_id",
            "shop_id_display",
            "shop_name",
            "vendor_id",
            "title",
            "description",
            "start_date",
            "end_date",
            "discount",
            "image",
            "created_at",
        ]
        read_only_fields = ["id", "shop_id_display", "created_at", "shop_name", "vendor_id"]


class ReviewSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(),
        source="shop",
        write_only=True,
    )
    shop_id_display = serializers.CharField(source="shop.id", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "shop_id",
            "shop_id_display",
            "customer_name",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "shop_id_display", "created_at"]
