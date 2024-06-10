// productsService.ts

import { axiosInstance, axiosStorageInstance } from "../apiClient";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
}

interface ProductInput {
  productId: number;
  quantity: number;
}

interface CreateProductData {
  userId: number;
  date: string;
  products: ProductInput[];
}

export const createProduct = async (product: Omit<Product, "id">) => {
  const response = await axiosStorageInstance.post("/products", product);
  return response.data;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get<Product[]>("/products");
  return response.data;
};
