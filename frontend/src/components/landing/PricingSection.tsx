import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for trying out our AI detection capabilities",
    icon: Star,
    color: "text-muted-foreground",
    features: [
      "50 detections per month",
      "Text analysis",
      "Basic accuracy reports",
      "Email support",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "₹2,399",
    period: "/month",
    description: "Ideal for professionals and content creators",
    icon: Zap,
    color: "text-primary",
    popular: true,
    features: [
      "1,000 detections per month",
      "Text, image & PDF analysis",
      "Advanced accuracy reports",
      "Priority processing",
      "API access",
      "24/7 support",
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
  },
  {
    name: "Plus",
    price: "₹8,199",
    period: "/month",
    description: "For teams and organizations with high-volume needs",
    icon: Crown,
    color: "text-accent",
    features: [
      "Unlimited detections",
      "All detection types",
      "Custom model training",
      "Bulk processing",
      "Advanced analytics",
      "Dedicated support",
      "White-label options",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
  },
];

export function PricingSection() {
  return (
    <section className="py-24 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Detection Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Scale your AI detection capabilities with flexible pricing options 
            designed for individuals, professionals, and enterprises.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-2xl glass hover:scale-105 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-primary shadow-2xl' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-${plan.color.replace('text-', '')}/20 to-${plan.color.replace('text-', '')}/10 flex items-center justify-center mb-4`}>
                  <plan.icon className={`w-8 h-8 ${plan.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                
                <div className="flex items-baseline justify-center mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-neon-green" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={plan.buttonVariant} 
                size="lg" 
                className={`w-full ${plan.popular ? 'hover-glow' : ''}`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}