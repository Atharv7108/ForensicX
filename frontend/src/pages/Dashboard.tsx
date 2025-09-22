import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  ImageIcon,
  FileCheck,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Upload,
  Video,
  Mic,
  Database,
  Crown,
  Star,
} from "lucide-react";
import { detectText, detectImage, detectPdf } from "@/services/api";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageAnalysisResult, setImageAnalysisResult] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [pdfAnalysisResult, setPdfAnalysisResult] = useState<any>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) return;

    setIsAnalyzing(true);

    try {
      const result = await detectText(textInput);
      const isAI = result.label === "AI";
      const confidence = result.confidence * 100; // Convert to percentage
      const aiPercentage = result.ai_percentage;

      const analysisResult = {
        confidence: confidence,
        isAI: isAI,
        highlights: result.highlights,
        analyzedText: textInput,
        aiPercentage: aiPercentage,
      };

      setAnalysisResult(analysisResult);
    } catch (error) {
      console.error("Error detecting text:", error);
      // Handle error - could show a toast or alert
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalysis = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);

    try {
      const result = await detectImage(imageFile);
      const isAI = result.image_result.label !== "natural";
      const confidence = result.image_result.confidence ? result.image_result.confidence * 100 : 0;

      // Map API response to frontend format
      const detectedElements = [
        { type: "AI Generated", confidence: result.image_result.label === "ai_generated" ? confidence : 0, selected: result.image_result.label === "ai_generated" },
        { type: "AI Enhanced", confidence: result.image_result.label === "ai_enhanced" ? confidence : 0, selected: result.image_result.label === "ai_enhanced" },
        { type: "Real", confidence: result.image_result.label === "natural" ? confidence : 0, selected: result.image_result.label === "natural" },
      ];

      const analysisResult = {
        confidence: confidence,
        isAI: isAI,
        detectedElements: detectedElements,
        ocrText: result.text_result ? result.text_result.text : "",
        textAnalysis: result.text_result ? {
          isAI: result.text_result.label === "AI",
          confidence: result.text_result.confidence * 100,
          text: result.text_result.text,
        } : null,
      };

      setImageAnalysisResult(analysisResult);
    } catch (error) {
      console.error("Error detecting image:", error);
      // Handle error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);

      try {
        // Extract text from PDF using the backend API
        const result = await detectPdf(file);

        // Use the extracted_text from API response if available
        if (result.extracted_text) {
          setPdfText(result.extracted_text);
        } else if (result.text_result) {
          setPdfText("PDF text extraction in progress... Click 'Analyze PDF Content' to process the document.");
        } else {
          setPdfText("No text found in the PDF document, or text extraction failed.");
        }
      } catch (error) {
        console.error("Error extracting PDF text:", error);
        setPdfText("Error extracting text from PDF. Please try again.");
      }
    }
  };

  const handlePdfAnalysis = async () => {
    if (!pdfFile) return;

    setIsAnalyzing(true);

    try {
      // Use the comprehensive PDF detection that handles both text and images
      const result = await detectPdf(pdfFile);

      // Handle text analysis results with granular highlights
      let textAnalysisResult = null;
      if (result.text_result) {
        const isAI = result.text_result.label === "AI";
        const confidence = result.text_result.confidence * 100;
        const aiPercentage = result.text_result.ai_percentage;

        textAnalysisResult = {
          confidence: confidence,
          isAI: isAI,
          highlights: result.text_result.highlights,
          analyzedText: result.extracted_text,
          aiPercentage: aiPercentage,
        };
      }

      // Handle image analysis results
      const imageResults = result.images.map((img, index) => ({
        imageIndex: index + 1,
        page: img.page,
        imageLabel: img.image_label,
        imageConfidence: img.image_confidence * 100,
        ocrText: img.ocr_text,
        textAnalysis: img.text_result ? {
          isAI: img.text_result.label === "AI",
          confidence: img.text_result.confidence * 100,
          text: img.text_result.text,
        } : null,
      }));

      const analysisResult = {
        textResult: textAnalysisResult,
        imageResults: imageResults,
        extractedText: result.extracted_text,
      };

      setPdfAnalysisResult(analysisResult);
    } catch (error) {
      console.error("Error analyzing PDF:", error);
      // Handle error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderHighlightedText = (text: string, highlights: any[]) => {
    if (!highlights || highlights.length === 0) return text;

    let result = [];
    let lastIndex = 0;

    highlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, highlight.start)}
          </span>
        );
      }

      // Add highlighted text - using yellow for AI detection
      result.push(
        <span
          key={`highlight-${index}`}
          className={`px-1 rounded ${
            highlight.type === 'ai'
              ? 'bg-yellow-200 text-yellow-900 border border-yellow-400'
              : 'bg-neon-green/20 text-neon-green border border-neon-green/30'
          }`}
          title={`${highlight.type === 'ai' ? 'AI Generated' : 'Human Written'} - ${highlight.confidence}% confidence`}
        >
          {text.slice(highlight.start, highlight.end)}
        </span>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(
        <span key="remaining">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 mt-16">{/* Added mt-16 for navbar spacing */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Detection Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze text, images, and documents for AI-generated content.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Current Plan Card */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              {user?.plan_type === 'plus' ? (
                <Crown className="h-4 w-4 text-yellow-500" />
              ) : user?.plan_type === 'pro' ? (
                <Star className="h-4 w-4 text-blue-500" />
              ) : (
                <Zap className="h-4 w-4 text-gray-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2 capitalize">
                {user?.plan_type || 'Free'}
              </div>
              <Badge
                variant="outline"
                className={`
                  ${user?.plan_type === 'plus' ? 'border-yellow-500 text-yellow-500' : ''}
                  ${user?.plan_type === 'pro' ? 'border-blue-500 text-blue-500' : ''}
                  ${(!user?.plan_type || user?.plan_type === 'free') ? 'border-gray-500 text-gray-500' : ''}
                `}
              >
                {user?.plan_type === 'plus' ? 'Plus Plan' : 
                 user?.plan_type === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detections Used</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {user?.monthly_detections || 0} / {
                  user?.plan_type === 'plus' ? '1,000' :
                  user?.plan_type === 'pro' ? '500' : '20'
                }
              </div>
              <Progress 
                value={
                  user?.plan_type === 'plus' ? ((user?.monthly_detections || 0) / 1000) * 100 :
                  user?.plan_type === 'pro' ? ((user?.monthly_detections || 0) / 500) * 100 :
                  ((user?.monthly_detections || 0) / 20) * 100
                } 
                className="mb-2" 
              />
              <p className="text-xs text-muted-foreground">
                {user?.plan_type === 'plus' ? `${1000 - (user?.monthly_detections || 0)} detections remaining` :
                 user?.plan_type === 'pro' ? `${500 - (user?.monthly_detections || 0)} detections remaining` :
                 `${20 - (user?.monthly_detections || 0)} detections remaining this month`}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-neon-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-green">99.3%</div>
              <p className="text-xs text-muted-foreground">
                Based on your last 100 detections
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Content Found</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">23%</div>
              <p className="text-xs text-muted-foreground">
                Of analyzed content this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detection Tabs */}
        <Tabs defaultValue="text" className="space-y-6">
          <TabsList className="glass grid w-full grid-cols-6">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Bulk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Text Content Analysis</CardTitle>
                <CardDescription>
                  Paste or type text to analyze for AI-generated content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  placeholder="Enter the text you want to analyze for AI-generated content..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[200px] glass bg-background/50"
                />
                
                <Button 
                  onClick={handleTextAnalysis}
                  disabled={!textInput.trim() || isAnalyzing}
                  className="hover-glow"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Detect AI Content
                    </>
                  )}
                </Button>

                {analysisResult && (
                  <div className="space-y-4 p-6 rounded-lg glass border border-border/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Analysis Results</h3>
                      <Badge
                        variant={analysisResult.isAI ? "destructive" : "default"}
                        className={analysisResult.isAI ? "bg-destructive" : "bg-neon-green"}
                      >
                        {analysisResult.isAI ? "AI Detected" : "Human Written"}
                      </Badge>
                    </div>

                    {/* AI Percentage Display */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>AI Content Percentage</span>
                        <span className="font-medium text-warning">
                          {analysisResult.aiPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={analysisResult.aiPercentage} className="bg-background/30" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Overall Confidence</span>
                        <span className="font-medium">
                          {analysisResult.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={analysisResult.confidence} />
                    </div>

                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {analysisResult.isAI
                          ? `This text contains ${analysisResult.aiPercentage.toFixed(1)}% AI-generated content.`
                          : `This text appears to be mostly human-written with only ${analysisResult.aiPercentage.toFixed(1)}% AI content.`
                        }
                      </div>

                      {analysisResult.analyzedText && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Highlighted Content:</h4>
                          <div className="p-4 rounded-lg bg-background/50 border border-border/30 text-sm leading-relaxed">
                            {renderHighlightedText(analysisResult.analyzedText, analysisResult.highlights)}
                          </div>
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                              <span>AI Generated</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-neon-green/20 border border-neon-green/30 rounded"></div>
                              <span>Human Written</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Image Analysis</CardTitle>
                <CardDescription>
                  Upload images to detect AI-generated or enhanced content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={imageInputRef}
                    className="glass bg-background/50"
                  />
                  
                  {imagePreview && (
                    <div className="space-y-4">
                      <div className="border border-border/30 rounded-lg p-4 glass">
                        <img 
                          src={imagePreview} 
                          alt="Uploaded image" 
                          className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
                        />
                      </div>
                      
                      <Button 
                        onClick={handleImageAnalysis}
                        disabled={isAnalyzing}
                        className="hover-glow"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Analyzing Image...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Analyze Image
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {imageAnalysisResult && (
                  <div className="space-y-4 p-6 rounded-lg glass border border-border/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Image Analysis Results</h3>
                      <Badge
                        variant={imageAnalysisResult.isAI ? "destructive" : "default"}
                        className={imageAnalysisResult.isAI ? "bg-destructive" : "bg-neon-green"}
                      >
                        {imageAnalysisResult.isAI ? "AI Generated" : "Authentic"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Overall Confidence</span>
                        <span className="font-medium">
                          {imageAnalysisResult.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={imageAnalysisResult.confidence} />
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Detection Results:</h4>
                      {imageAnalysisResult.detectedElements.map((element: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/20">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            element.selected
                              ? 'bg-neon-green text-background'
                              : 'border-2 border-border'
                          }`}>
                            {element.selected && <CheckCircle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{element.type}</span>
                            <div className="text-xs text-muted-foreground">
                              {element.confidence}% confidence
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* OCR Text and Analysis */}
                    {imageAnalysisResult.ocrText && (
                      <div className="space-y-4 border-t border-border/30 pt-4">
                        <h4 className="text-md font-medium">Extracted Text Analysis:</h4>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">OCR Text:</h5>
                          <div className="p-4 rounded-lg bg-background/50 border border-border/30 text-sm leading-relaxed">
                            {imageAnalysisResult.ocrText}
                          </div>
                        </div>

                        {imageAnalysisResult.textAnalysis && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium">Text Content Analysis:</h5>
                              <Badge
                                variant={imageAnalysisResult.textAnalysis.isAI ? "destructive" : "default"}
                                className={imageAnalysisResult.textAnalysis.isAI ? "bg-destructive" : "bg-neon-green"}
                              >
                                {imageAnalysisResult.textAnalysis.isAI ? "AI Detected" : "Human Written"}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Text Confidence Level</span>
                                <span className="font-medium">
                                  {imageAnalysisResult.textAnalysis.confidence.toFixed(1)}%
                                </span>
                              </div>
                              <Progress value={imageAnalysisResult.textAnalysis.confidence} />
                            </div>

                            <div className="text-sm text-muted-foreground">
                              {imageAnalysisResult.textAnalysis.isAI
                                ? "The extracted text shows patterns consistent with AI-generated content."
                                : "The extracted text appears to be human-written."
                              }
                            </div>

                            <div className="space-y-2">
                              <h6 className="text-sm font-medium">Highlighted Content:</h6>
                              <div className="p-4 rounded-lg bg-background/50 border border-border/30 text-sm leading-relaxed">
                                {renderHighlightedText(imageAnalysisResult.textAnalysis.text, [
                                  {
                                    start: 0,
                                    end: Math.min(50, imageAnalysisResult.textAnalysis.text.length),
                                    type: imageAnalysisResult.textAnalysis.isAI ? "ai" : "human",
                                    confidence: imageAnalysisResult.textAnalysis.confidence
                                  }
                                ])}
                              </div>
                              <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                                  <span>AI Generated</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-neon-green/20 border border-neon-green/30 rounded"></div>
                                  <span>Human Written</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pdf">
            <Card className="glass">
              <CardHeader>
                <CardTitle>PDF Document Analysis</CardTitle>
                <CardDescription>
                  Upload PDF files to extract and analyze text content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    ref={pdfInputRef}
                    className="glass bg-background/50"
                  />
                  
                  {pdfFile && pdfText && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Extracted Text Preview:</h4>
                        <Textarea
                          value={pdfText}
                          readOnly
                          className="min-h-[200px] glass bg-background/50"
                        />
                      </div>
                      
                      <Button 
                        onClick={handlePdfAnalysis}
                        disabled={isAnalyzing}
                        className="hover-glow"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Analyzing PDF...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Analyze PDF Content
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {pdfAnalysisResult && (
                  <div className="space-y-4 p-6 rounded-lg glass border border-border/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">PDF Analysis Results</h3>
                      <Badge
                        variant={pdfAnalysisResult.textResult?.isAI ? "destructive" : "default"}
                        className={pdfAnalysisResult.textResult?.isAI ? "bg-destructive" : "bg-neon-green"}
                      >
                        {pdfAnalysisResult.textResult?.isAI ? "AI Detected" : "Human Written"}
                      </Badge>
                    </div>

                    {/* Text Analysis Results */}
                    {pdfAnalysisResult.textResult && (
                      <div className="space-y-4">
                        <h4 className="text-md font-medium">Text Content Analysis:</h4>

                        {/* AI Percentage Display */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>AI Content Percentage</span>
                            <span className="font-medium text-warning">
                              {pdfAnalysisResult.textResult.aiPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={pdfAnalysisResult.textResult.aiPercentage} className="bg-background/30" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Overall Confidence</span>
                            <span className="font-medium">
                              {pdfAnalysisResult.textResult.confidence.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={pdfAnalysisResult.textResult.confidence} />
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {pdfAnalysisResult.textResult.isAI
                            ? `This PDF contains ${pdfAnalysisResult.textResult.aiPercentage.toFixed(1)}% AI-generated text content.`
                            : `This PDF appears to be mostly human-written with only ${pdfAnalysisResult.textResult.aiPercentage.toFixed(1)}% AI content.`
                          }
                        </div>

                        {pdfAnalysisResult.textResult.analyzedText && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Highlighted Content:</h4>
                            <div className="p-4 rounded-lg bg-background/50 border border-border/30 text-sm leading-relaxed max-h-64 overflow-y-auto">
                              {renderHighlightedText(pdfAnalysisResult.textResult.analyzedText, pdfAnalysisResult.textResult.highlights)}
                            </div>
                            <div className="flex gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                                <span>AI Generated</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-neon-green/20 border border-neon-green/30 rounded"></div>
                                <span>Human Written</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Image Analysis Results */}
                    {pdfAnalysisResult.imageResults && pdfAnalysisResult.imageResults.length > 0 && (
                      <div className="space-y-4 border-t border-border/30 pt-4">
                        <h4 className="text-md font-medium">Image Analysis Results:</h4>
                        <div className="space-y-4">
                          {pdfAnalysisResult.imageResults.map((imgResult: any, index: number) => (
                            <div key={index} className="p-4 rounded-lg bg-background/30 border border-border/20">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-sm font-medium">Image {imgResult.imageIndex} (Page {imgResult.page})</h5>
                                <Badge
                                  variant={imgResult.imageLabel !== "natural" ? "destructive" : "default"}
                                  className={imgResult.imageLabel !== "natural" ? "bg-destructive" : "bg-neon-green"}
                                >
                                  {imgResult.imageLabel === "ai_generated" ? "AI Generated" :
                                   imgResult.imageLabel === "ai_enhanced" ? "AI Enhanced" : "Authentic"}
                                </Badge>
                              </div>

                              <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Image Confidence</span>
                                  <span className="font-medium">
                                    {imgResult.imageConfidence.toFixed(1)}%
                                  </span>
                                </div>
                                <Progress value={imgResult.imageConfidence} />
                              </div>

                              {imgResult.ocrText && (
                                <div className="space-y-2">
                                  <h6 className="text-xs font-medium text-muted-foreground">OCR Text:</h6>
                                  <p className="text-sm p-2 bg-background/50 rounded border border-border/20">
                                    {imgResult.ocrText}
                                  </p>
                                </div>
                              )}

                              {imgResult.textAnalysis && (
                                <div className="space-y-2 mt-3">
                                  <h6 className="text-xs font-medium text-muted-foreground">OCR Text Analysis:</h6>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={imgResult.textAnalysis.isAI ? "destructive" : "default"}
                                      className={imgResult.textAnalysis.isAI ? "bg-destructive" : "bg-neon-green"}
                                    >
                                      {imgResult.textAnalysis.isAI ? "AI Text" : "Human Text"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {imgResult.textAnalysis.confidence.toFixed(1)}% confidence
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!pdfAnalysisResult.textResult && (!pdfAnalysisResult.imageResults || pdfAnalysisResult.imageResults.length === 0) && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No analyzable content found in the PDF.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Video Analysis</CardTitle>
                <CardDescription>
                  Upload videos to detect AI-generated content and deepfakes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-12 text-center">
                  <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p className="text-muted-foreground mb-4">
                    Advanced video analysis and deepfake detection in development
                  </p>
                  <Badge variant="outline" className="glass">
                    Future Feature
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Audio Analysis</CardTitle>
                <CardDescription>
                  Upload audio files to detect AI-generated speech and voice cloning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-12 text-center">
                  <Mic className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p className="text-muted-foreground mb-4">
                    AI voice detection and speech analysis capabilities in development
                  </p>
                  <Badge variant="outline" className="glass">
                    Future Feature
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Bulk Processing</CardTitle>
                <CardDescription>
                  Upload multiple files for batch AI detection processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-12 text-center">
                  <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p className="text-muted-foreground mb-4">
                    Bulk upload and batch processing capabilities in development
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Badge variant="outline" className="glass">
                      Future Feature
                    </Badge>
                    <Badge variant="outline" className="glass">
                      Pro Plan
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}