import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Tag, X } from "lucide-react";
import { Offer } from "../../types";

interface OfferCardProps {
  offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const startDate = offer.startDate
    ? new Date(offer.startDate).toLocaleDateString()
    : "N/A";
  const endDate = offer.endDate
    ? new Date(offer.endDate).toLocaleDateString()
    : "N/A";

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative h-48">
        <img
          src={offer.image}
          alt={offer.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
          <Tag className="h-4 w-4" />
          <span className="font-semibold">{offer.discount} OFF</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {offer.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
          {offer.description}
        </p>

        <div className="flex items-center space-x-2 text-gray-500 text-xs mb-4">
          <Calendar className="h-4 w-4" />
          <span>
            {startDate} - {endDate}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <span className="text-sm text-blue-600 font-medium truncate max-w-[120px]">
            {offer.shopName}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            View Offer
          </button>
        </div>
      </div>

      {/* Offer Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-56 sm:h-72 flex-shrink-0">
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold text-xl shadow-xl">
                  {offer.discount} OFF
                </span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {offer.title}
                </h2>
                <span className="inline-block self-start text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  {offer.shopName}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              <div className="space-y-3 mb-8 text-gray-600">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <span className="font-semibold block text-gray-900">
                      Valid Period
                    </span>
                    <span>
                      {startDate} to {endDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    navigate(`/shop/${offer.shopId}`);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Visit Shop
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferCard;
