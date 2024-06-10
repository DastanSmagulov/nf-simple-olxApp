import React, { useState, ChangeEvent } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { axiosInstance } from "../../api/apiClient";
import "./FileUploader.css";

function FileUploader() {
  const [file, setFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [loadedBytes, setLoadedBytes] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(URL.createObjectURL(uploadedFile));
    const formData = new FormData();
    formData.append("file", uploadedFile);

    axiosInstance
      .post("files/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total;
          setLoadedBytes(loaded);
          setTotalBytes(total);
          const percent = (loaded / total) * 100;
          setUploadProgress(Math.round(percent));
          setStatus(`${Math.round(percent)}% uploaded...`);
        },
      })
      .then((response: AxiosResponse<any>) => {
        setStatus("Upload successful!");
        setUploadProgress(100);
        console.log(response.data);
      })
      .catch((error: AxiosError<any>) => {
        setStatus("Upload failed!");
        console.error(error);
      });
  };

  return (
    <div className="file-uploader-container">
      <input type="file" name="file" onChange={uploadFile} />
      <label>
        File progress: <progress value={uploadProgress} max={100} />
      </label>
      <p>{status}</p>
      <p>
        uploaded {loadedBytes} bytes of {totalBytes}
      </p>
      {file && (
        <img
          src={file}
          alt="Preview"
          style={{ width: "300px", height: "100px" }}
        />
      )}
    </div>
  );
}

export default FileUploader;
