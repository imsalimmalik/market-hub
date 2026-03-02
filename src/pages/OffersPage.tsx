import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import OfferCard from "../components/UI/OfferCard";
import { Offer } from "../types";

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const offersRes = await fetch("http://127.0.0.1:8000/api/offers/");
        if (!offersRes.ok) {
          console.error("Failed to fetch offers");
          setLoading(false);
          return;
        }
        const data = await offersRes.json();
        if (Array.isArray(data)) {
          const mapped: Offer[] = data.map((o: any) => ({
            id: o.id,
            shopId: o.shop_id_display || "",
            title: o.title,
            description: o.description,
            startDate: o.start_date,
            endDate: o.end_date,
            discount: o.discount,
            image: o.image || "https://via.placeholder.com/400x300.png?text=Offer",
            shopName: o.shop_name || "Unknown Shop",
          }));
          setOffers(mapped);
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Current Offers & Events</h1>
          <p className="text-gray-600 mt-2">Discover amazing deals from local shops</p>
        </div>

        {offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers available</h3>
            <p className="text-gray-500">Check back later for exciting deals!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;
