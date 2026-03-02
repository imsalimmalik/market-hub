import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Shield, Star, Loader2 } from "lucide-react";
import SearchBar from "../components/Forms/SearchBar";
import ShopCard from "../components/UI/ShopCard";
import OfferCard from "../components/UI/OfferCard";
import { Shop, Offer } from "../types";

const HomePage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch shops and offers in parallel
        const [shopsRes, offersRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/shops/"),
          fetch("http://127.0.0.1:8000/api/offers/"),
        ]);

        if (shopsRes.ok) {
          const shopsData = await shopsRes.json();
          const mappedShops: Shop[] = shopsData.slice(0, 3).map((s: any) => ({
            id: s.id,
            name: s.name,
            address: s.address,
            phone: s.phone,
            category: s.category,
            rating: s.rating ?? 0,
            verified: s.verified ?? false,
            image:
              s.image || "https://via.placeholder.com/400x300.png?text=Shop",
            description: s.description || "",
            coordinates: {
              lat: s.latitude ?? 0,
              lng: s.longitude ?? 0,
            },
          }));
          setShops(mappedShops);
        }

        if (offersRes.ok) {
          const offersData = await offersRes.json();
          const mappedOffers: Offer[] = offersData
            .slice(0, 3)
            .map((o: any) => ({
              id: o.id,
              shopId: o.shop_id_display || "",
              title: o.title,
              description: o.description,
              startDate: o.start_date,
              endDate: o.end_date,
              discount: o.discount,
              image:
                o.image || "https://via.placeholder.com/400x300.png?text=Offer",
              shopName: o.shop_name || "Unknown Shop",
            }));
          setOffers(mappedOffers);
        }
      } catch (err) {
        console.error("Error fetching data for home page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // In a real app, this would filter shops/products
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Discover Your local shops in Market Hub
              <span className="block text-blue-200">& Real Market Prices</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with local businesses in Market Hub and discover amazing products at competitive prices.
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar onSearch={handleSearch} />
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Local Discovery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Verified Shops</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Real Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Shops
              </h2>
              <p className="text-gray-600 mt-2">
                Discover top-rated local businesses
              </p>
            </div>
            <Link
              to="/shops"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>View All Shops</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
          ) : shops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No shops available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Hot Offers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Ongoing Hot Sales
              </h2>
              <p className="text-gray-600 mt-2">
                Don't miss these amazing deals
              </p>
            </div>
            <Link
              to="/offers"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>View All Offers</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
          ) : offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No active offers at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Own a Local Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our marketplace and reach more customers in your community
          </p>
          <Link
            to="/register-shop"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
          >
            Register Your Shop
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
