import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileType } from "@/models/TranslationJob";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  acceptedFileTypes?: FileType[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  isLoading,
  acceptedFileTypes = ["pdf", "docx", "txt", "pptx", "xlsx", "html"],
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        if (!fileExtension || !acceptedFileTypes.includes(fileExtension as FileType)) {
          setError(`Unsupported file type. Accepted types: ${acceptedFileTypes.join(", ").toUpperCase()}`);
          return;
        }

        // Basic size check (e.g., 100MB limit)
        if (file.size > 100 * 1024 * 1024) {
          setError("File size exceeds 100MB limit.");
          return;
        }

        onFileSelected(file);
      }
    },
    [onFileSelected, acceptedFileTypes]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    disabled: isLoading,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/html": [".html"],
    },
  });

  const borderColor = isDragReject
    ? "border-red-500"
    : isDragActive
    ? "border-blue-500"
    : "border-gray-300 dark:border-gray-600";

  const backgroundColor = isDragActive ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-800";

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
        ${borderColor} ${backgroundColor} transition-colors duration-200 ease-in-out
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <svg
          className="w-10 h-10 mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
        {isDragActive ? (
          <p className="mb-2 text-lg text-gray-600 dark:text-gray-400">Drop the file here ...</p>
        ) : (
          <p className="mb-2 text-lg text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {acceptedFileTypes.map((type) => `.${type}`).join(", ").toUpperCase()} (MAX. 100MB)
        </p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default FileUploader;