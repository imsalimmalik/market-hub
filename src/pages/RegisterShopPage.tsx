import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Plus, Trash2 } from "lucide-react";
import { ShopFormData, ProductFormData } from "../types";
const categories = [
  "All Categories",
  "Grocery",
  "Electronics",
  "Clothing",
  "Books",
  "Restaurant",
  "Pharmacy",
  "Beauty",
  "Sports",
  "Home & Garden",
];

const RegisterShopPage: React.FC = () => {
  const navigate = useNavigate();
  const [shopData, setShopData] = useState<ShopFormData>({
    name: "",
    address: "",
    phone: "",
    category: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    const checkExistingShop = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/shops/?my_shop=true",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const myShops = await response.json();
          if (myShops.length > 0) {
            // Already has a shop, redirect to its detail page
            navigate(`/shop/${myShops[0].id}`);
          }
        }
      } catch (err) {
        console.error("Error checking existing shop", err);
      }
    };
    checkExistingShop();
  }, [navigate]);

  const [products, setProducts] = useState<ProductFormData[]>([]);
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: "",
    price: 0,
    description: "",
    image: "",
  });

  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      // 1) Create shop
      const shopResponse = await fetch("http://127.0.0.1:8000/api/shops/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shopData),
      });

      if (!shopResponse.ok) {
        console.error("Failed to register shop", await shopResponse.text());
        alert("Failed to register shop. Please try again.");
        return;
      }

      const createdShop = await shopResponse.json();

      // 2) Create products for this shop
      if (products.length > 0) {
        await Promise.all(
          products.map((product) =>
            fetch("http://127.0.0.1:8000/api/products/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                shop_id: createdShop.id,
                name: product.name,
                price: product.price,
                description: product.description,
                image: product.image || "",
              }),
            })
          )
        );
      }

      alert("Shop and products registered successfully!");
      setShopData({
        name: "",
        address: "",
        phone: "",
        category: "",
        description: "",
        image: "",
      });
      setProducts([]);
    } catch (error) {
      console.error("Error registering shop:", error);
      alert("Something went wrong while saving to the server.");
    }
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      setProducts([...products, { ...newProduct }]);
      setNewProduct({ name: "", price: 0, description: "", image: "" });
    }
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Register Your Shop at Market Hub
          </h1>

          {/* Shop Information */}
          <form onSubmit={handleShopSubmit} className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Shop Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shopData.name}
                    onChange={(e) =>
                      setShopData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your shop name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={shopData.category}
                    onChange={(e) =>
                      setShopData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.slice(1).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shopData.phone}
                    onChange={(e) =>
                      setShopData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={shopData.address}
                    onChange={(e) =>
                      setShopData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St, City"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={shopData.description}
                  onChange={(e) =>
                    setShopData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your shop and what makes it special..."
                />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Logo/Image URL
                  </label>
                  <input
                    type="text"
                    value={shopData.image || ""}
                    onChange={(e) =>
                      setShopData((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/your-shop-image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    (Optional) Upload Preview
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        Paste an image URL on the left. File upload storage can
                        be added later.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add Products
              </h2>

              {/* Add Product Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
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
                      placeholder="Product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.price || ""}
                      onChange={(e) =>
                        setNewProduct((prev) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Brief product description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image URL
                    </label>
                    <input
                      type="text"
                      value={newProduct.image || ""}
                      onChange={(e) =>
                        setNewProduct((prev) => ({
                          ...prev,
                          image: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/product.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Products List */}
              {products.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Added Products
                  </h3>
                  <div className="space-y-2">
                    {products.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-green-600 font-semibold">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200"
              >
                Register Shop
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterShopPage;
