import { useState, useRef, useEffect } from "react";
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
  TrendingUp,
} from "lucide-react";
import { detectText, detectImage, detectPdf } from "@/services/api";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardBackground } from "@/components/background/DashboardBackground";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  
  // Detection history state
  const [detectionHistory, setDetectionHistory] = useState<Array<{
    type: 'Human' | 'AI';
    confidence: number;
    timestamp: Date;
    contentType: 'text' | 'image' | 'pdf';
  }>>([]);
  
  // Upgrade prompt state
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  
  // GSAP refs
  const dashboardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsCardsRef = useRef<HTMLDivElement[]>([]);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Load detection history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('forensicx_detection_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setDetectionHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading detection history:', error);
      }
    }
  }, []);

  // Function to add detection result to history
  const addToDetectionHistory = (type: 'Human' | 'AI', confidence: number, contentType: 'text' | 'image' | 'pdf') => {
    const newDetection = {
      type,
      confidence,
      timestamp: new Date(),
      contentType
    };
    
    const updatedHistory = [newDetection, ...detectionHistory].slice(0, 10); // Keep only last 10 results
    setDetectionHistory(updatedHistory);
    
    // Save to localStorage
    localStorage.setItem('forensicx_detection_history', JSON.stringify(updatedHistory));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([headerRef.current, tabsRef.current], {
        opacity: 0,
        y: 30
      });

      gsap.set(statsCardsRef.current, {
        opacity: 0,
        y: 50,
        scale: 0.9
      });

      // Entrance animations
      const tl = gsap.timeline();

      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      })
      .to(statsCardsRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: {
          amount: 0.4,
          from: "start"
        }
      }, "-=0.3")
      .to(tabsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.2");

      // Card hover animations
      statsCardsRef.current.forEach((card) => {
        if (card) {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              y: -5,
              scale: 1.02,
              duration: 0.3,
              ease: "power2.out"
            });
          });

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        }
      });

    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  // Animation for analysis results
  const animateResults = (resultElement: HTMLElement) => {
    if (resultElement) {
      gsap.fromTo(resultElement, 
        {
          opacity: 0,
          y: 30,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        }
      );
    }
  };

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
      
      // Add to detection history
      addToDetectionHistory(
        isAI ? 'AI' : 'Human',
        confidence,
        'text'
      );
    } catch (error: any) {
      console.error("Error detecting text:", error);
      
      // Handle quota exceeded for text detection
      if (error.response?.status === 429) {
        const message = error.response?.data?.detail || "You've reached your monthly detection limit. Upgrade your plan for more detections!";
        setUpgradeMessage(message);
        setShowUpgradePrompt(true);
        
        setAnalysisResult({
          confidence: 0,
          isAI: false,
          detectedElements: [],
          highlights: [],
          aiPercentage: 0,
          errorMessage: message
        });
      } else {
        setAnalysisResult({
          confidence: 0,
          isAI: false,
          detectedElements: [],
          highlights: [],
          aiPercentage: 0,
          errorMessage: `Analysis failed: ${error.message || 'Unknown error'}`
        });
      }
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
        { type: "Natural", confidence: result.image_result.label === "natural" ? confidence : 0, selected: result.image_result.label === "natural" },
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
      
      // Add to detection history
      addToDetectionHistory(
        isAI ? 'AI' : 'Human',
        confidence,
        'image'
      );
    } catch (error: any) {
      console.error("Error detecting image:", error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        setImageAnalysisResult({
          image_result: {
            label: "Authentication Required",
            confidence: null,
            note: "Please log in to use image detection. You will be redirected to login."
          },
          text_result: null
        });
      } else if (error.response?.status === 429) {
        // Quota exceeded - show upgrade prompt
        const message = error.response?.data?.detail || "You've reached your monthly detection limit. Upgrade your plan for more detections!";
        setUpgradeMessage(message);
        setShowUpgradePrompt(true);
        
        setImageAnalysisResult({
          image_result: {
            label: "Limit Exceeded",
            confidence: null,
            note: message
          },
          text_result: null
        });
      } else {
        setImageAnalysisResult({
          image_result: {
            label: "Error",
            confidence: null,
            note: `Analysis failed: ${error.message || 'Unknown error'}`
          },
          text_result: null
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      // Don't extract text immediately - wait for user to click analyze
      setPdfText("PDF file selected. Click 'Analyze PDF Content' to process the document.");
      // Clear any previous analysis results
      setPdfAnalysisResult(null);
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
      
      // Add to detection history (use text result if available)
      if (textAnalysisResult) {
        addToDetectionHistory(
          textAnalysisResult.isAI ? 'AI' : 'Human',
          textAnalysisResult.confidence,
          'pdf'
        );
      }
    } catch (error: any) {
      console.error("Error analyzing PDF:", error);
      
      // Handle quota exceeded for PDF detection
      if (error.response?.status === 429) {
        const message = error.response?.data?.detail || "You've reached your monthly detection limit. Upgrade your plan for more detections!";
        setUpgradeMessage(message);
        setShowUpgradePrompt(true);
        
        setPdfAnalysisResult({
          textResult: null,
          imageResults: [],
          extractedText: "",
          errorMessage: message
        });
      } else {
        setPdfAnalysisResult({
          textResult: null,
          imageResults: [],
          extractedText: "",
          errorMessage: `Analysis failed: ${error.message || 'Unknown error'}`
        });
      }
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
    <div ref={dashboardRef} className="min-h-screen relative overflow-hidden">
      {/* Dashboard-specific background */}
      <DashboardBackground />
      
      <Navbar />
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 mt-16 relative z-10">
        <div ref={headerRef} className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
            Detection Dashboard
          </h1>
          <p className="text-muted-foreground">
            Analyze text, images, and documents for AI-generated content.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Plan Card */}
          <Card 
            ref={(el) => {
              if (el) statsCardsRef.current[0] = el;
            }}
            className="glass-dashboard relative overflow-hidden group transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              {user?.plan_type === 'plus' ? (
                <Crown className="h-4 w-4 text-yellow-500 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] transition-all duration-300" />
              ) : user?.plan_type === 'pro' ? (
                <Star className="h-4 w-4 text-blue-500 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-300" />
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

          <Card 
            ref={(el) => {
              if (el) statsCardsRef.current[1] = el;
            }}
            className="glass-dashboard relative overflow-hidden group transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
              <FileCheck className="h-4 w-4 text-blue-500 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-300" />
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

                    <Card 
            ref={(el) => {
              if (el) statsCardsRef.current[2] = el;
            }}
            className="glass-dashboard relative overflow-hidden group transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Detection History</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-300" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {detectionHistory.length > 0 ? (
                  <>
                    {/* Mini Graph with real data */}
                    <div className="flex items-end gap-1 h-12">
                      {detectionHistory.slice(0, 7).reverse().map((detection, index) => (
                        <div
                          key={index}
                          className={`flex-1 ${
                            detection.type === 'Human' ? 'bg-neon-green' : 'bg-yellow-500'
                          } rounded-sm transition-all duration-300 hover:opacity-80 relative group/bar`}
                          style={{ height: `${(detection.confidence / 100) * 100}%` }}
                        >
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background/90 px-2 py-1 rounded text-xs opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap border border-border/30">
                            {detection.type}: {detection.confidence.toFixed(1)}%<br/>
                            <span className="text-muted-foreground">{detection.contentType}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                          <span className="text-muted-foreground">Human</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-muted-foreground">AI</span>
                        </div>
                      </div>
                      <span className="text-muted-foreground">Last {Math.min(detectionHistory.length, 7)} scans</span>
                    </div>
                    
                    {/* Summary */}
                    <div className="text-xs text-muted-foreground border-t border-border/20 pt-2">
                      Average confidence: <span className="text-foreground font-medium">
                        {(detectionHistory.slice(0, 7).reduce((acc, curr) => acc + curr.confidence, 0) / Math.min(detectionHistory.length, 7)).toFixed(1)}%
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Empty state */}
                    <div className="flex items-center justify-center h-12 border-2 border-dashed border-border/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">No detections yet</p>
                    </div>
                    
                    {/* Legend for empty state */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                          <span className="text-muted-foreground">Human</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-muted-foreground">AI</span>
                        </div>
                      </div>
                      <span className="text-muted-foreground">Run some detections to see results</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detection Tabs */}
        <Tabs defaultValue="text" className="space-y-6">
          <TabsList className="glass-dashboard grid w-full grid-cols-6">
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
                      {!analysisResult.errorMessage && (
                        <Badge
                          variant={analysisResult.isAI ? "destructive" : "default"}
                          className={analysisResult.isAI ? "bg-destructive" : "bg-neon-green"}
                        >
                          {analysisResult.isAI ? "AI Detected" : "Human Written"}
                        </Badge>
                      )}
                    </div>

                    {/* Handle error states for text analysis */}
                    {analysisResult.errorMessage ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium">Analysis Error</p>
                          <p className="text-sm text-red-600">{analysisResult.errorMessage}</p>
                        </div>
                      </div>
                    ) : (
                      <>
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
                    </>
                    )}
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
                    </div>

                    {/* Handle error states */}
                    {imageAnalysisResult.image_result?.label === "Limit Exceeded" ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium">Detection Limit Reached</p>
                          <p className="text-sm text-red-600">{imageAnalysisResult.image_result.note}</p>
                        </div>
                      </div>
                    ) : imageAnalysisResult.image_result?.label === "Error" ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-800">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium">Analysis Error</p>
                          <p className="text-sm text-orange-600">{imageAnalysisResult.image_result.note}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Detection Results:</h4>
                        {imageAnalysisResult.detectedElements?.map((element: any, index: number) => (
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
                    )}

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
      
      {/* Upgrade Prompt Modal */}
      <UpgradePrompt 
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        message={upgradeMessage}
      />
    </div>
  );
}