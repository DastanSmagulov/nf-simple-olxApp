import React, { useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "../components/layout/Header";
import CreateProductModal from "../components/CreateProductModal";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
}

// Fetch products function
const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get<Product[]>(
    "https://fakestoreapi.com/products"
  );
  return response.data;
};

const Products: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]); // Initialize products state
  const queryClient = useQueryClient();

  const {
    data: fetchedProducts, // Rename data to fetchedProducts to avoid conflict
    error,
    isLoading,
    refetch,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Update products state when fetchedProducts changes
  React.useEffect(() => {
    if (fetchedProducts) {
      setProducts(fetchedProducts);
    }
  }, [fetchedProducts]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleRefetchProducts = async () => {
    await refetch();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  console.log(products);

  return (
    <>
      <Header onAddClick={openModal} />
      <div className="flex justify-center mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products?.map((product) => (
            <div key={product.id} className="card w-96 bg-base-100 shadow-xl">
              <figure>
                <img src={product.image} alt={product.title} />
              </figure>
              <div className="card-body">
                <h2 className="card-title">
                  {product.title}
                  <div className="badge badge-secondary">NEW</div>
                </h2>
                <p>{product.description}</p>
                <p>Price: ${product.price}</p>
                <div className="card-actions justify-end">
                  <div className="badge badge-outline">Fashion</div>
                  <div className="badge badge-outline">Products</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Render CreateProductModal conditionally based on isModalOpen state */}
      {isModalOpen && (
        <CreateProductModal
          isOpen={isModalOpen}
          onClose={() => {
            closeModal();
            handleRefetchProducts(); // Refetch products after creating a new one
          }}
          setProducts={setProducts} // Pass setProducts as a prop
        />
      )}
    </>
  );
};

export default Products;
