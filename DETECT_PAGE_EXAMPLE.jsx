// Example: DetectPage.jsx - Disease Detection Component
// Shows how to use the Hugging Face integration with the predict edge function

import React, { useState, useRef } from "react";
import { useDetection } from "../hooks/useDetection";
import { useFarm } from "../hooks/useFarm";
import { AlertCard } from "../components/ui/AlertCard";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../lib/AuthContext";

export default function DetectPageExample() {
  const { currentUser } = useAuth();
  const { currentFarm } = useFarm();
  const {
    predictFromUrl,
    predictFromBase64,
    predictFromFile,
    loading,
    error,
    prediction,
    clearError,
  } = useDetection();

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  if (!currentUser || !currentFarm) {
    return <div>Loading farm data...</div>;
  }

  /**
   * Handler for file selection from gallery/file system
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handler for camera capture
   */
  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Submit image for prediction
   */
  const handleSubmitPrediction = async () => {
    if (!selectedFile || !currentFarm.id || !currentUser.id) {
      alert("Please select an image first");
      return;
    }

    try {
      clearError();
      console.log("Starting prediction for file:", selectedFile.name);

      // Method 1: Convert to base64 and send (good for freshly captured images)
      const result = await predictFromFile(
        selectedFile,
        currentFarm.id,
        currentUser.id
      );

      if (result) {
        console.log("Prediction successful:", result);
        // Show success message or update UI
        alert(
          `Detected: ${result.disease}\nConfidence: ${result.confidence}%`
        );

        // Reset form
        setSelectedFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  };

  /**
   * Alternative: Submit by image URL (if image is already in cloud storage)
   */
  const handleSubmitFromUrl = async (imageUrl) => {
    try {
      clearError();
      console.log("Starting prediction for URL:", imageUrl);

      const result = await predictFromUrl(
        imageUrl,
        currentFarm.id,
        currentUser.id
      );

      if (result) {
        console.log("Prediction successful:", result);
        alert(
          `Detected: ${result.disease}\nConfidence: ${result.confidence}%`
        );
      }
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  };

  /**
   * Alternative: Submit base64 directly if you have it
   */
  const handleSubmitBase64 = async (base64Data) => {
    try {
      clearError();

      const result = await predictFromBase64(
        base64Data,
        currentFarm.id,
        currentUser.id
      );

      if (result) {
        console.log("Prediction successful:", result);
        alert(
          `Detected: ${result.disease}\nConfidence: ${result.confidence}%`
        );
      }
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  };

  /**
   * Determine UI color based on disease severity
   */
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "red";
      case "Medium":
        return "yellow";
      case "Low":
        return "green";
      default:
        return "gray";
    }
  };

  /**
   * Determine if result is healthy
   */
  const isHealthy =
    prediction && prediction.disease.toLowerCase().includes("healthy");

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Disease Detection" subtitle="Analyze leaf health" />

      <div className="p-6 max-w-2xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-red-700 hover:text-red-900 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Image Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Image</h2>

          {/* Camera Input */}
          <div className="mb-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
              📷 Take Photo
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleCameraCapture}
            />
          </div>

          {/* File Input */}
          <div className="mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              disabled={loading}
            >
              🖼️ Select from Gallery
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-lg max-h-80 object-cover"
              />
              <p className="text-sm text-gray-600 mt-2">
                File: {selectedFile?.name}
              </p>
            </div>
          )}

          {/* Submit Button */}
          {selectedFile && (
            <button
              onClick={handleSubmitPrediction}
              disabled={loading}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-semibold"
            >
              {loading ? "Analyzing... 🔄" : "Analyze Disease 🔬"}
            </button>
          )}
        </div>

        {/* Prediction Results */}
        {prediction && (
          <div
            className={`rounded-lg shadow p-6 ${
              isHealthy ? "bg-green-50" : "bg-orange-50"
            }`}
          >
            <h2 className="text-lg font-semibold mb-4">
              {isHealthy ? "✅ Plant Status" : "⚠️ Detection Result"}
            </h2>

            <AlertCard
              type={isHealthy ? "success" : "warning"}
              title={prediction.disease}
              message={`Confidence: ${prediction.confidence}% | Severity: ${prediction.severity}`}
            />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-gray-600">Confidence</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {prediction.confidence}%
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-gray-600">Severity</p>
                <p
                  className={`text-2xl font-bold text-${getSeverityColor(
                    prediction.severity
                  )}-600`}
                >
                  {prediction.severity}
                </p>
              </div>
            </div>

            {!isHealthy && (
              <div className="mt-4 bg-white p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">
                  Recommended Actions:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Apply appropriate fungicide</li>
                  <li>Remove affected leaves</li>
                  <li>Improve air circulation</li>
                  <li>Monitor for spread</li>
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedFile(null);
                setImagePreview(null);
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Analyze Another
            </button>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> The AI model analyzes leaf images to detect
            diseases like powdery mildew, downy mildew, and other grape vine
            diseases. For best results, ensure good lighting and focus on the
            affected leaf area.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * INTEGRATION EXAMPLES:
 *
 * Example 1: Using predictFromFile (from camera or gallery)
 * =========================================================
 * const { predictFromFile } = useDetection();
 * const file = fileInputRef.current.files[0];
 * const result = await predictFromFile(file, farmId, userId);
 *
 *
 * Example 2: Using predictFromUrl (for cloud-stored images)
 * ===========================================================
 * const { predictFromUrl } = useDetection();
 * const result = await predictFromUrl(
 *   'https://storage.googleapis.com/my-image.jpg',
 *   farmId,
 *   userId
 * );
 *
 *
 * Example 3: Using predictFromBase64 (if you have base64 data)
 * =============================================================
 * const { predictFromBase64 } = useDetection();
 * const result = await predictFromBase64(
 *   'iVBORw0KGgoAAAANSUhEUg...',
 *   farmId,
 *   userId
 * );
 *
 *
 * Example 4: Batch predictions
 * =============================
 * const { predictFromFile } = useDetection();
 * const imageFiles = [...];
 *
 * const results = await Promise.all(
 *   imageFiles.map(file => predictFromFile(file, farmId, userId))
 * );
 */
