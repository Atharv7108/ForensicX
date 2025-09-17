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
  User,
  Settings,
  LogOut,
  Upload,
  Video,
  Mic,
  Database,
  Globe
} from "lucide-react";

export default function Dashboard() {
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
    
    // Simulate API call
    setTimeout(() => {
      const mockResult = {
        confidence: Math.random() * 100,
        isAI: Math.random() > 0.5,
        highlights: [
          { start: 0, end: Math.min(50, textInput.length), type: "ai", confidence: 85 },
          { start: Math.min(60, textInput.length), end: Math.min(120, textInput.length), type: "human", confidence: 92 },
          { start: Math.min(130, textInput.length), end: Math.min(180, textInput.length), type: "ai", confidence: 78 },
        ],
        analyzedText: textInput,
      };
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2000);
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
    
    // Simulate API call
    setTimeout(() => {
      const mockResult = {
        confidence: Math.random() * 100,
        isAI: Math.random() > 0.5,
        detectedElements: [
          { type: "AI Generated", confidence: 92, selected: true },
          { type: "AI Enhanced", confidence: 67, selected: false },
          { type: "Real", confidence: 23, selected: false },
        ],
      };
      
      setImageAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      // Simulate PDF text extraction
      const mockText = `This is extracted text from the PDF document. 

Lorem ipsum dolor sit amet, consectetur adipiscing elit. This section appears to be written by AI based on repetitive patterns and unnatural flow.

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

The following paragraph shows characteristics typical of human writing with natural variations and personal insights that reflect genuine experience and knowledge.`;
      
      setPdfText(mockText);
    }
  };

  const handlePdfAnalysis = async () => {
    if (!pdfFile || !pdfText) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResult = {
        confidence: Math.random() * 100,
        isAI: Math.random() > 0.5,
        highlights: [
          { start: 80, end: 200, type: "ai", confidence: 89 },
          { start: 250, end: 350, type: "human", confidence: 94 },
          { start: 400, end: 520, type: "human", confidence: 88 },
        ],
        analyzedText: pdfText,
      };
      
      setPdfAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2500);
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
      
      // Add highlighted text
      result.push(
        <span
          key={`highlight-${index}`}
          className={`px-1 rounded ${
            highlight.type === 'ai' 
              ? 'bg-destructive/20 text-destructive border border-destructive/30' 
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
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">AI Detector</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="glass">
              Pro Plan
            </Badge>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Detection Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze text, images, and documents for AI-generated content.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detections Used</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">247 / 1,000</div>
              <Progress value={24.7} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                753 detections remaining this month
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
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Confidence Level</span>
                        <span className="font-medium">
                          {analysisResult.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={analysisResult.confidence} />
                    </div>

                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {analysisResult.isAI 
                          ? "This text shows patterns consistent with AI-generated content."
                          : "This text appears to be human-written."
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
                              <div className="w-3 h-3 bg-destructive/20 border border-destructive/30 rounded"></div>
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
                        variant={pdfAnalysisResult.isAI ? "destructive" : "default"}
                        className={pdfAnalysisResult.isAI ? "bg-destructive" : "bg-neon-green"}
                      >
                        {pdfAnalysisResult.isAI ? "AI Detected" : "Human Written"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Confidence Level</span>
                        <span className="font-medium">
                          {pdfAnalysisResult.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={pdfAnalysisResult.confidence} />
                    </div>

                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {pdfAnalysisResult.isAI 
                          ? "This PDF content shows patterns consistent with AI-generated text."
                          : "This PDF content appears to be human-written."
                        }
                      </div>

                      {pdfAnalysisResult.analyzedText && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Highlighted Content:</h4>
                          <div className="p-4 rounded-lg bg-background/50 border border-border/30 text-sm leading-relaxed max-h-64 overflow-y-auto">
                            {renderHighlightedText(pdfAnalysisResult.analyzedText, pdfAnalysisResult.highlights)}
                          </div>
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-destructive/20 border border-destructive/30 rounded"></div>
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