from rest_framework import permissions

class IsVendor(permissions.BasePermission):
    """
    Custom permission to only allow vendors to access their own shop/products.
    """
    def has_permission(self, request, view):
        # Authenticated users can access protected actions
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Check if the object belongs to the requesting vendor
        # For Shop objects:
        if hasattr(obj, 'vendor'):
            return obj.vendor == request.user
        
        # For Product/Offer/Review objects linked to a Shop:
        if hasattr(obj, 'shop'):
            return obj.shop.vendor == request.user
            
        return False
