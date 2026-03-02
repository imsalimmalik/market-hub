from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ShopViewSet,
    ProductViewSet,
    OfferViewSet,
    ReviewViewSet,
    RegisterVendorView,
)


router = DefaultRouter()
router.register(r"shops", ShopViewSet, basename="shop")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"offers", OfferViewSet, basename="offer")
router.register(r"reviews", ReviewViewSet, basename="review")

urlpatterns = [
    path("register/", RegisterVendorView.as_view(), name="register"),
] + router.urls

