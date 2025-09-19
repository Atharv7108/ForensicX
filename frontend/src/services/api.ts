import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Adjust if backend runs on different host/port

export interface TextDetectionResponse {
  label: string;
  confidence: number;
  highlights: Array<{
    start: number;
    end: number;
    type: string;
    confidence: number;
  }>;
  ai_percentage: number;
}

export interface ImageDetectionResponse {
  image_result: {
    label: string;
    confidence: number | null;
    note?: string;
  };
  text_result: {
    label: string;
    confidence: number;
    text: string;
  } | null;
}

export interface PdfDetectionResponse {
  text_result: {
    label: string;
    confidence: number;
    highlights: Array<{
      start: number;
      end: number;
      type: string;
      confidence: number;
    }>;
    ai_percentage: number;
  } | null;
  images: Array<{
    page: number;
    img_index: number;
    image_label: string;
    image_confidence: number;
    ocr_text: string;
    text_result: {
      label: string;
      confidence: number;
      text: string;
    } | null;
  }>;
  extracted_text: string;
}

export async function detectText(text: string): Promise<TextDetectionResponse> {
  const response = await axios.post(API_BASE_URL + "/detect-text", { text });
  return response.data;
}

export async function detectImage(file: File): Promise<ImageDetectionResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(API_BASE_URL + "/detect-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function detectPdf(file: File): Promise<PdfDetectionResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(API_BASE_URL + "/detect-pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
