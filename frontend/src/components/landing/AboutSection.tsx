import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Zap, Brain, Shield } from "lucide-react";

const stats = [
  {
    number: "99.3%",
    label: "Detection Accuracy",
    icon: Target,
  },
  {
    number: "1M+",
    label: "Content Analyzed",
    icon: Brain,
  },
  {
    number: "50K+",
    label: "Active Users",
    icon: Users,
  },
  {
    number: "24/7",
    label: "Support Available",
    icon: Shield,
  },
];

const values = [
  {
    title: "Innovation First",
    description: "We leverage cutting-edge AI and machine learning technologies to stay ahead of evolving AI-generated content.",
    icon: Zap,
  },
  {
    title: "Accuracy & Trust",
    description: "Our models are trained on diverse datasets to ensure reliable and unbiased detection across various content types.",
    icon: Award,
  },
  {
    title: "Privacy & Security",
    description: "We prioritize data protection with end-to-end encryption and never store your analyzed content permanently.",
    icon: Shield,
  },
];

export function AboutSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            About ForensicX
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Leading the Future of AI Content Detection
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ForensicX is at the forefront of AI detection technology, empowering individuals 
            and organizations to identify AI-generated content with unprecedented accuracy 
            across text, images, and documents.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center glass hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold mb-6">Our Story</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2024, ForensicX emerged from the growing need to distinguish 
                between human-created and AI-generated content in an era where artificial 
                intelligence has become increasingly sophisticated.
              </p>
              <p>
                Our team of AI researchers, data scientists, and cybersecurity experts 
                recognized that traditional detection methods were becoming obsolete. 
                We set out to build a comprehensive platform that could adapt to the 
                rapidly evolving landscape of AI content generation.
              </p>
              <p>
                Today, ForensicX serves thousands of users worldwide, from content creators 
                and educators to enterprise organizations and research institutions, 
                helping them maintain authenticity and trust in digital content.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="glass p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">🚀</div>
                  <div className="text-sm mt-2">Advanced AI Models</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">🔍</div>
                  <div className="text-sm mt-2">Multi-Modal Detection</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">⚡</div>
                  <div className="text-sm mt-2">Real-Time Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">🛡️</div>
                  <div className="text-sm mt-2">Enterprise Security</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="text-3xl font-bold text-center mb-12">Our Core Values</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="glass hover:scale-105 transition-transform duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold mb-4 text-center">{value.title}</h4>
                  <p className="text-muted-foreground text-center">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="text-center mt-20">
          <div className="glass p-12 rounded-3xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              "To democratize AI content detection technology and empower everyone with the tools 
              needed to distinguish authentic human-created content from AI-generated material, 
              fostering transparency and trust in our digital world."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}