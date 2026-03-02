import React from "react";
import { Product } from "../../types";
import { Trash2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onDelete,
  showDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
            View Details
          </button>
          {showDelete && onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
              title="Delete Product"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
