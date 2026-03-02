import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Phone,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  Trash2,
  Tag,
} from "lucide-react";
import ProductCard from "../components/UI/ProductCard";
import { Shop, Product, Review, ReviewFormData, Offer } from "../types";

const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<(Shop & { vendor_id?: string }) | null>(
    null
  );
  const [isOwner, setIsOwner] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<(Offer & { vendor_id?: string })[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState<ReviewFormData>({
    customerName: "",
    rating: 5,
    comment: "",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "",
    image: "",
  });
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    discount: "",
    startDate: "",
    endDate: "",
    image: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const shopRes = await fetch(`http://127.0.0.1:8000/api/shops/${id}/`);
        if (!shopRes.ok) {
          setShop(null);
          setLoading(false);
          return;
        }
        const s = await shopRes.json();

        // Get user token and ID to check ownership
        const token = localStorage.getItem("access_token");
        const username = localStorage.getItem("username");

        const mappedShop: Shop & { vendor_id?: string } = {
          id: s.id,
          vendor_id: s.vendor_id,
          name: s.name,
          address: s.address,
          phone: s.phone,
          category: s.category,
          rating: s.rating ?? 0,
          verified: s.verified ?? false,
          image: s.image || "https://via.placeholder.com/400x300.png?text=Shop",
          description: s.description || "",
          coordinates: {
            lat: s.latitude ?? 0,
            lng: s.longitude ?? 0,
          },
        };
        setShop(mappedShop);

        // Check if current user is the owner
        if (token && username) {
          try {
            // We can check if the shop's vendor_id matches a profile or just trust the backend
            // but for UI logic we'll check if the shop's vendor matches the current logged-in user.
            // A better way would be to have a /me endpoint, but for now let's use the fact
            // that the backend will only return vendor_id for the owner if we wanted to be strict.
            // Let's check if the shop is in the user's "my shop" list by trying to fetch it
            // from the vendor-only endpoint.
            const ownerCheck = await fetch(
              `http://127.0.0.1:8000/api/shops/?my_shop=true`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (ownerCheck.ok) {
              const myShops = await ownerCheck.json();
              const isMine = myShops.some((ms: any) => ms.id === s.id);
              setIsOwner(isMine);
            }
          } catch (e) {
            console.error("Error checking shop ownership", e);
          }
        }

        const productsRes = await fetch(
          `http://127.0.0.1:8000/api/products/?shop_id=${encodeURIComponent(
            id
          )}`
        );
        if (productsRes.ok) {
          const pData = await productsRes.json();
          const mappedProducts: Product[] = pData.map((p: any) => ({
            id: p.id,
            shopId: id,
            name: p.name,
            price: parseFloat(p.price),
            image:
              p.image || "https://via.placeholder.com/300x200.png?text=Product",
            description: p.description || "",
          }));
          setProducts(mappedProducts);
        }

        const offersRes = await fetch(
          `http://127.0.0.1:8000/api/offers/?shop_id=${encodeURIComponent(id)}`
        );
        if (offersRes.ok) {
          const oData = await offersRes.json();
          const mappedOffers: Offer & { vendor_id?: string }[] = oData.map(
            (o: any) => ({
              id: o.id,
              shopId: id,
              vendor_id: o.vendor_id,
              title: o.title,
              description: o.description,
              startDate: o.start_date,
              endDate: o.end_date,
              discount: o.discount,
              image: o.image || "",
              shopName: s.name,
            })
          );
          setOffers(mappedOffers);
        }

        const reviewsRes = await fetch(
          `http://127.0.0.1:8000/api/reviews/?shop_id=${encodeURIComponent(id)}`
        );
        if (reviewsRes.ok) {
          const rData = await reviewsRes.json();
          const mappedReviews: Review[] = rData.map((r: any) => ({
            id: r.id,
            shopId: id,
            customerName: r.customer_name,
            rating: r.rating,
            comment: r.comment,
            date: r.created_at,
          }));
          setReviews(mappedReviews);
        }
      } catch (err) {
        console.error("Error loading shop detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/reviews/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: id,
          customer_name: newReview.customerName,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });
      if (!res.ok) {
        console.error("Failed to create review", await res.text());
        alert("Failed to submit review.");
        return;
      }
      const created = await res.json();
      const mapped: Review = {
        id: created.id,
        shopId: id,
        customerName: created.customer_name,
        rating: created.rating,
        comment: created.comment,
        date: created.created_at,
      };
      setReviews((prev) => [mapped, ...prev]);
      setNewReview({ customerName: "", rating: 5, comment: "" });
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Something went wrong while submitting review.");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newProduct.name || !newProduct.price) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Please login to add products.");
        return;
      }
      const res = await fetch("http://127.0.0.1:8000/api/products/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shop_id: id,
          name: newProduct.name,
          price: newProduct.price,
          description: newProduct.description,
          image: newProduct.image,
        }),
      });
      if (!res.ok) {
        console.error("Failed to add product", await res.text());
        alert("Failed to add product.");
        return;
      }
      const created = await res.json();
      const mapped: Product = {
        id: created.id,
        shopId: id,
        name: created.name,
        price: parseFloat(created.price),
        image:
          created.image ||
          "https://via.placeholder.com/300x200.png?text=Product",
        description: created.description || "",
      };
      setProducts((prev) => [mapped, ...prev]);
      setNewProduct({ name: "", price: 0, description: "", image: "" });
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Something went wrong while adding product.");
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newOffer.title || !newOffer.discount) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Please login to add offers.");
        return;
      }
      const res = await fetch("http://127.0.0.1:8000/api/offers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shop_id: id,
          title: newOffer.title,
          description: newOffer.description,
          discount: newOffer.discount,
          start_date: newOffer.startDate,
          end_date: newOffer.endDate,
          image: newOffer.image,
        }),
      });
      if (!res.ok) {
        console.error("Failed to add offer", await res.text());
        alert("Failed to add offer.");
        return;
      }
      const created = await res.json();
      const mapped: Offer & { vendor_id?: string } = {
        id: created.id,
        shopId: id,
        vendor_id: created.vendor_id,
        title: created.title,
        description: created.description,
        startDate: created.start_date,
        endDate: created.end_date,
        discount: created.discount,
        image: created.image || "",
        shopName: shop?.name || "",
      };
      setOffers((prev) => [mapped, ...prev]);
      alert("Offer added successfully!");
      setNewOffer({
        title: "",
        description: "",
        discount: "",
        startDate: "",
        endDate: "",
        image: "",
      });
    } catch (err) {
      console.error("Error adding offer:", err);
      alert("Something went wrong while adding offer.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/products/${productId}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/offers/${offerId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
      } else {
        alert("Failed to delete offer.");
      }
    } catch (err) {
      console.error("Error deleting offer:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Loading shop...
          </h2>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Shop Not Found
          </h2>
          <p className="text-gray-600">
            The shop you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Banner */}
      <div className="relative h-64 lg:h-80 bg-gray-200 overflow-hidden">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold">{shop.name}</h1>
              {shop.verified && (
                <div className="flex items-center space-x-1 bg-green-500 px-2 py-1 rounded-full text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Verified</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 fill-current text-yellow-400" />
                <span>{shop.rating}</span>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {shop.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shop Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Shop
              </h2>
              <p className="text-gray-600 mb-6">{shop.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{shop.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{shop.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">9:00 AM - 9:00 PM</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Products
              </h2>

              {isOwner && (
                <div className="space-y-8 mb-8">
                  {/* Add Product Form */}
                  <form
                    onSubmit={handleAddProduct}
                    className="bg-gray-50 rounded-lg p-4 space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Add Product
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.price || ""}
                          onChange={(e) =>
                            setNewProduct((prev) => ({
                              ...prev,
                              price: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={newProduct.description}
                          onChange={(e) =>
                            setNewProduct((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={newProduct.image}
                          onChange={(e) =>
                            setNewProduct((prev) => ({
                              ...prev,
                              image: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                      Add Product
                    </button>
                  </form>

                  {/* Add Offer Form */}
                  <form
                    onSubmit={handleAddOffer}
                    className="bg-blue-50 rounded-lg p-4 space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-blue-900">
                      Create Special Offer / Event
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Offer Title
                        </label>
                        <input
                          type="text"
                          value={newOffer.title}
                          onChange={(e) =>
                            setNewOffer((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full border border-blue-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g. Summer Sale"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Discount Detail
                        </label>
                        <input
                          type="text"
                          value={newOffer.discount}
                          onChange={(e) =>
                            setNewOffer((prev) => ({
                              ...prev,
                              discount: e.target.value,
                            }))
                          }
                          className="w-full border border-blue-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g. 20% OFF"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={newOffer.startDate}
                          onChange={(e) =>
                            setNewOffer((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full border border-blue-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={newOffer.endDate}
                          onChange={(e) =>
                            setNewOffer((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          className="w-full border border-blue-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newOffer.description}
                          onChange={(e) =>
                            setNewOffer((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full border border-blue-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Image URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={newOffer.image}
                          onChange={(e) =>
                            setNewOffer((prev) => ({
                              ...prev,
                              image: e.target.value,
                            }))
                          }
                          className="w-full border border-blue-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                      Create Offer
                    </button>
                  </form>
                </div>
              )}

              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showDelete={isOwner}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No products available at the moment.
                </p>
              )}
            </div>

            {/* Offers/Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Special Offers & Events
              </h2>
              {offers.length > 0 ? (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                          <Tag className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-blue-900">
                            {offer.title} - {offer.discount}
                          </h3>
                          <p className="text-blue-800 text-sm">
                            {offer.description}
                          </p>
                          <p className="text-blue-600 text-xs mt-1">
                            {offer.startDate} to {offer.endDate}
                          </p>
                        </div>
                      </div>
                      {isOwner && offer.vendor_id === shop?.vendor_id && (
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title="Delete Offer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No active offers at the moment.
                </p>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Customer Reviews
              </h2>

              <div className="space-y-4 mb-8">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {review.customerName}
                      </span>
                      <span className="text-yellow-500 font-medium">
                        {"★".repeat(review.rating)}{" "}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No reviews yet. Be the first to leave one!
                  </p>
                )}
              </div>

              {/* Add Review Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="border-t pt-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add Your Review
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newReview.customerName}
                      onChange={(e) =>
                        setNewReview((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <select
                      value={newReview.rating}
                      onChange={(e) =>
                        setNewReview((prev) => ({
                          ...prev,
                          rating: parseInt(e.target.value),
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience..."
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Interactive Map</p>
                  <p className="text-sm text-gray-500">
                    Location: {shop.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  onClick={() => {
                    window.location.href = `tel:${shop.phone}`;
                  }}
                >
                  Call Shop
                </button>
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  onClick={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      shop.address
                    )}`;
                    window.open(url, "_blank");
                  }}
                >
                  Get Directions
                </button>
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  onClick={async () => {
                    const shareUrl = window.location.href;
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: shop.name,
                          text: `Check out ${shop.name} on LocalShop`,
                          url: shareUrl,
                        });
                      } else if (navigator.clipboard) {
                        await navigator.clipboard.writeText(shareUrl);
                        alert("Shop link copied to clipboard.");
                      } else {
                        alert(shareUrl);
                      }
                    } catch {
                      // user cancelled share
                    }
                  }}
                >
                  Share Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailPage;
