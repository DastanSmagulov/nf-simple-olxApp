import React, { useState, ChangeEvent, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "../../api/services/productService";
import { axiosStorageInstance } from "../../api/apiClient";
import { toast } from "react-toastify";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const CHUNK_SIZE = 1024 * 1024; // 1MB chunk size

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  setProducts,
}) => {
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation<Product, Error, Omit<Product, "id">>({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      setProducts((prevProducts) => [...prevProducts, newProduct]);
      queryClient.invalidateQueries("products");
      onClose();
      console.log("Product was created successfully", newProduct);
    },
    onError: (error) => {
      console.error("Error creating product:", error);
    },
  });

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setUploadProgress(Array.from({ length: selectedFiles.length }, () => 0));
    event.target.value = "";
  };

  const uploadFiles = async () => {
    try {
      const promises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosStorageInstance.post(
          "/files/upload",
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total!) * 100
              );
              const progressArray = [...uploadProgress];
              progressArray[index] = progress;
              setUploadProgress(progressArray);
            },
          }
        );

        if (response.data.location) {
          return response.data.location;
        } else {
          throw new Error("Failed to upload image");
        }
      });

      const imageLinks = await Promise.all(promises);
      return imageLinks;
    } catch (error) {
      toast.error(error.message);
      console.error("Upload error:", error);
      return [];
    }
  };

  const handleCreateProduct = async () => {
    try {
      const imageLinks = await uploadFiles();
      const newProduct = await mutation.mutateAsync({
        title,
        price,
        description,
        image: imageLinks.join(","),
        category,
      });

      if (newProduct) {
        setProducts((prevProducts) => [...prevProducts, newProduct]);
        onClose();
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value));
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="card w-96 bg-base-100 shadow-xl p-5">
        <h2 className="card-title">Create Product</h2>
        <div className="card-body">
          <div className="form-control">
            <label className="label">Title</label>
            <input
              type="text"
              className="input input-bordered"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
          <div className="form-control">
            <label className="label">Price</label>
            <input
              type="number"
              className="input input-bordered"
              value={price}
              onChange={handlePriceChange}
            />
          </div>
          <div className="form-control">
            <label className="label">Description</label>
            <input
              type="text"
              className="input input-bordered"
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>
          <div className="form-control">
            <label className="label">Images</label>
            <input
              type="file"
              multiple
              ref={inputRef}
              onChange={handleFileSelect}
              className="input input-bordered"
            />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {files.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-32 object-cover rounded-md"
                    alt={`Uploaded file ${index}`}
                  />
                  <progress
                    className="progress progress-secondary"
                    value={uploadProgress[index]}
                    max={100}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="form-control">
            <label className="label">Category</label>
            <input
              type="text"
              className="input input-bordered"
              value={category}
              onChange={handleCategoryChange}
            />
          </div>
          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              onClick={handleCreateProduct}
              disabled={mutation.isLoading || files.length === 0}
            >
              {mutation.isLoading ? "Creating..." : "Create"}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;
