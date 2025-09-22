import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

const PLAN_PRICING = {
	pro: 239900, // ₹2,399.00 in paise
	plus: 819900, // ₹8,199.00 in paise
};

function handlePayNow(
	plan: "pro" | "plus",
	setLoading: (b: boolean) => void,
	setError: (e: string | null) => void,
	setSuccess: (b: boolean) => void,
	isAuthenticated: boolean,
	navigate: any,
	refreshUser: () => Promise<void>
) {
	return async () => {
		setLoading(true);
		setError(null);
		setSuccess(false);
		
		if (!isAuthenticated) {
			setError("Please log in to upgrade your plan");
			navigate('/auth/login');
			setLoading(false);
			return;
		}
		
		try {
			const token = localStorage.getItem("forensicx_token");
			if (!token) {
				setError("Please log in to upgrade your plan");
				navigate('/auth/login');
				return;
			}
			const order = await createRazorpayOrder(PLAN_PRICING[plan], plan, token);
			const options = {
				key: "rzp_test_RKCU4kkAe3HIkw", // Your actual Razorpay test key
				amount: order.amount,
				currency: order.currency,
				order_id: order.order_id,
				name: "ForensicX",
				description: `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
				handler: async function (response: any) {
					try {
						await verifyRazorpayPayment(
							response.razorpay_payment_id,
							response.razorpay_order_id,
							response.razorpay_signature,
							token
						);
						// Refresh user data to update plan in UI
						await refreshUser();
						setSuccess(true);
					} catch (e) {
						setError("Payment verification failed");
					}
				},
				prefill: {},
				theme: { color: "#6366f1" },
			};
			// @ts-ignore
			const rzp = new window.Razorpay(options);
			rzp.open();
		} catch (e: any) {
			console.error("Payment error:", e);
			setError(e.message || "Payment failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};
}

export function PricingSection() {
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [success, setSuccess] = React.useState(false);
	const { isAuthenticated, refreshUser } = useAuth();
	const navigate = useNavigate();
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
								plan.popular ? "ring-2 ring-primary shadow-2xl" : ""
							}`}
						>
							{plan.popular && (
								<Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
									Most Popular
								</Badge>
							)}

							<div className="text-center mb-8">
								<div
									className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-${plan.color.replace(
										"text-",
										""
									)}/20 to-${plan.color.replace("text-", "")}/10 flex items-center justify-center mb-4`}
								>
									<plan.icon className={`w-8 h-8 ${plan.color}`} />
								</div>

								<h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
								<p className="text-muted-foreground text-sm mb-4">
									{plan.description}
								</p>

								<div className="flex items-baseline justify-center mb-6">
									<span className="text-5xl font-bold">{plan.price}</span>
									<span className="text-muted-foreground ml-1">
										{plan.period}
									</span>
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
							{plan.name === "Pro" && (
								<Button
									variant={plan.buttonVariant}
									size="lg"
									className={`w-full ${plan.popular ? "hover-glow" : ""}`}
									disabled={loading}
									onClick={handlePayNow("pro", setLoading, setError, setSuccess, isAuthenticated, navigate, refreshUser)}
								>
									Pay Now
								</Button>
							)}
							{plan.name === "Plus" && (
								<Button
									variant={plan.buttonVariant}
									size="lg"
									className="w-full"
									disabled={loading}
									onClick={handlePayNow("plus", setLoading, setError, setSuccess, isAuthenticated, navigate, refreshUser)}
								>
									Pay Now
								</Button>
							)}
							{plan.name === "Free" && (
								<Button
									variant={plan.buttonVariant}
									size="lg"
									className="w-full"
									disabled={loading}
								>
									{plan.buttonText}
								</Button>
							)}
							{error && <div className="text-red-600 mt-2">{error}</div>}
							{success && (
								<div className="text-green-600 mt-2">
									Payment successful! Plan upgraded.
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}