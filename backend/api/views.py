from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Shop, Product, Offer, Review
from .serializers import (
    ShopSerializer,
    ProductSerializer,
    OfferSerializer,
    ReviewSerializer,
    UserSerializer,
)
from .permissions import IsVendor


class RegisterVendorView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer


class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all().order_by("-created_at")
    serializer_class = ShopSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsVendor()]

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the vendor
        # Check if user already has a shop
        if Shop.objects.filter(vendor=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You already have a shop registered.")
        serializer.save(vendor=self.request.user)

    def get_queryset(self):
        # For vendor actions or if explicitly requested, filter by owner
        is_my_shop = self.request.query_params.get("my_shop") == "true"
        
        if self.request.user.is_authenticated and (self.action not in ["list", "retrieve"] or is_my_shop):
            return Shop.objects.filter(vendor=self.request.user)
            
        # Public access or general list
        return Shop.objects.all().order_by("-created_at")


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsVendor()]

    def get_queryset(self):
        # Public access for viewing products
        if self.action in ["list", "retrieve"]:
            qs = Product.objects.filter(is_active=True).order_by("-created_at")
            shop_id = self.request.query_params.get("shop_id")
            if shop_id:
                # Use shop__id to ensure matching by string/ObjectId correctly
                qs = qs.filter(shop__id=shop_id)
            return qs

        # Vendor access for managing products
        if self.request.user.is_authenticated:
            # Filter products belonging to the vendor's shop
            return Product.objects.filter(shop__vendor=self.request.user).order_by("-created_at")
        
        return Product.objects.none()

    def perform_create(self, serializer):
        # Ensure vendor can only create products for their own shop
        try:
            # Try to get the specific shop mentioned in the request, but only if owned by user
            shop_id = self.request.data.get('shop_id')
            if shop_id:
                shop = Shop.objects.get(id=shop_id, vendor=self.request.user)
            else:
                # Fallback to the user's first shop if no ID provided
                shop = Shop.objects.filter(vendor=self.request.user).first()
                
            if not shop:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("You must have a shop to create products.")
                
            serializer.save(shop=shop)
        except (Shop.DoesNotExist, Shop.MultipleObjectsReturned):
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Invalid shop selection or multiple shops found.")


class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.all().order_by("-created_at")
    serializer_class = OfferSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsVendor()]

    def get_queryset(self):
        # Public access
        if self.action in ["list", "retrieve"]:
            qs = Offer.objects.all().order_by("-created_at")
            shop_id = self.request.query_params.get("shop_id")
            if shop_id:
                qs = qs.filter(shop__id=shop_id)
            return qs

        # Vendor access
        if self.request.user.is_authenticated:
            return Offer.objects.filter(shop__vendor=self.request.user).order_by("-created_at")
        
        return Offer.objects.none()

    def perform_create(self, serializer):
        try:
            shop = Shop.objects.get(vendor=self.request.user)
            serializer.save(shop=shop)
        except Shop.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You must have a shop to create offers.")


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Reviews are generally public
        qs = Review.objects.all().order_by("-created_at")
        shop_id = self.request.query_params.get("shop_id")
        if shop_id:
            qs = qs.filter(shop_id=shop_id)
        return qs
