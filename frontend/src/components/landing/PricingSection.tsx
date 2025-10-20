import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
		price: "₹5,499",
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
	plus: 549900, // ₹5,499.00 in paise
};

function handlePayNow(
	plan: "pro" | "plus",
	setLoading: (b: boolean) => void,
	setError: (e: string | null) => void,
	isAuthenticated: boolean,
	navigate: any,
	refreshUser: () => Promise<void>
) {
	return async () => {
		console.log('Payment initiated for plan:', plan);
		console.log('Authentication status:', isAuthenticated);
		
		setLoading(true);
		setError(null);
		
		if (!isAuthenticated) {
			console.log('User not authenticated, redirecting to login');
			setError("Please log in to upgrade your plan");
			navigate('/login');
			setLoading(false);
			return;
		}
		
		try {
			const token = localStorage.getItem("forensicx_token");
			console.log('Token found:', !!token);
			
			if (!token) {
				console.log('No token found, redirecting to login');
				setError("Please log in to upgrade your plan");
				navigate('/login');
				setLoading(false);
				return;
			}
			
			console.log(`Creating Razorpay order for ${plan} plan with amount ${PLAN_PRICING[plan]}`);
			const order = await createRazorpayOrder(PLAN_PRICING[plan], plan, token);
			console.log('Order created successfully:', order);
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
						// Redirect to dashboard after successful payment
						window.location.href = '/dashboard';
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
			let errorMessage = "Payment failed. Please try again.";
			
			if (e.response?.data?.detail) {
				errorMessage = `Payment failed: ${e.response.data.detail}`;
			} else if (e.response?.status === 401) {
				errorMessage = "Authentication failed. Please log in again.";
				navigate('/login');
			} else if (e.response?.status === 404) {
				errorMessage = "Payment service unavailable. Please contact support.";
			} else if (e.message) {
				errorMessage = `Payment Error: ${e.message}`;
			}
			
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};
}

export function PricingSection() {
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const { isAuthenticated, refreshUser, loading: authLoading } = useAuth();
	const navigate = useNavigate();
	
	const sectionRef = useRef<HTMLElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const subtitleRef = useRef<HTMLParagraphElement>(null);
	const cardsRef = useRef<HTMLDivElement[]>([]);
	const backgroundRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			// Set initial states
			gsap.set([titleRef.current, subtitleRef.current], {
				opacity: 0,
				y: 50
			});

			gsap.set(cardsRef.current, {
				opacity: 0,
				y: 100,
				scale: 0.8,
				rotationX: 45
			});

			// Create floating price particles
			for (let i = 0; i < 15; i++) {
				const particle = document.createElement('div');
				particle.className = 'absolute rounded-full pointer-events-none';
				
				// Random currency symbols and pricing elements
				const symbols = ['₹', '$', '€', '¥', '%', '+', '-'];
				const symbol = symbols[Math.floor(Math.random() * symbols.length)];
				particle.textContent = symbol;
				particle.style.fontSize = `${Math.random() * 12 + 8}px`;
				particle.style.color = 'rgba(99, 102, 241, 0.2)';
				particle.style.left = `${Math.random() * 100}%`;
				particle.style.top = `${Math.random() * 100}%`;
				particle.style.fontWeight = 'bold';
				backgroundRef.current?.appendChild(particle);

				gsap.to(particle, {
					y: "random(-80, 80)",
					x: "random(-50, 50)",
					rotation: "random(-180, 180)",
					opacity: "random(0.1, 0.4)",
					duration: "random(6, 12)",
					ease: "sine.inOut",
					repeat: -1,
					yoyo: true,
					delay: Math.random() * 3
				});
			}

			// Scroll-triggered animations
			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: "top 70%",
				onEnter: () => {
					const tl = gsap.timeline();

					// Header animations
					tl.to(titleRef.current, {
						opacity: 1,
						y: 0,
						duration: 1,
						ease: "power3.out"
					})
					.to(subtitleRef.current, {
						opacity: 1,
						y: 0,
						duration: 0.8,
						ease: "power2.out"
					}, "-=0.5");

					// Cards stagger animation with special treatment for popular plan
					cardsRef.current.forEach((card, index) => {
						const isPopular = plans[index]?.popular;
						const delay = isPopular ? 0.8 : 0.5 + (index * 0.2);
						
						gsap.to(card, {
							opacity: 1,
							y: 0,
							scale: isPopular ? 1.05 : 1,
							rotationX: 0,
							duration: 0.8,
							ease: "back.out(1.7)",
							delay
						});

						// Popular badge animation
						if (isPopular) {
							const badge = card.querySelector('.popular-badge');
							if (badge) {
								gsap.fromTo(badge, 
									{ scale: 0, rotation: -180 },
									{ 
										scale: 1, 
										rotation: 0, 
										duration: 0.6, 
										ease: "back.out(2)",
										delay: delay + 0.3
									}
								);
							}
						}
					});
				}
			});

			// Individual card interactions
			cardsRef.current.forEach((card, index) => {
				if (card) {
					const isPopular = plans[index]?.popular;
					const icon = card.querySelector('.pricing-icon');
					const iconBg = card.querySelector('.pricing-icon-bg');
					const price = card.querySelector('.pricing-price');
					const button = card.querySelector('.pricing-button');
					const features = card.querySelectorAll('.pricing-feature');

					card.addEventListener('mouseenter', () => {
						const tl = gsap.timeline();

						// Card transformation
						tl.to(card, {
							y: -20,
							scale: isPopular ? 1.08 : 1.05,
							rotationY: 5,
							boxShadow: isPopular ? 
								"0 25px 50px rgba(99, 102, 241, 0.3)" : 
								"0 20px 40px rgba(0, 0, 0, 0.2)",
							duration: 0.4,
							ease: "power2.out"
						});

						// Icon animations
						if (iconBg) {
							tl.to(iconBg, {
								scale: 1.3,
								rotation: 180,
								duration: 0.5,
								ease: "back.out(1.7)"
							}, 0);
						}

						if (icon) {
							tl.to(icon, {
								scale: 1.2,
								rotation: -180,
								duration: 0.5,
								ease: "back.out(1.7)"
							}, 0);
						}

						// Price animation
						if (price) {
							tl.to(price, {
								scale: 1.1,
								color: "#06B6D4",
								textShadow: "0 0 20px rgba(6, 182, 212, 0.5)",
								duration: 0.3
							}, 0.1);
						}

						// Button pulse
						if (button) {
							tl.to(button, {
								scale: 1.05,
								boxShadow: isPopular ? 
									"0 0 30px rgba(99, 102, 241, 0.6)" : 
									"0 0 20px rgba(6, 182, 212, 0.4)",
								duration: 0.3
							}, 0.2);
						}

						// Features cascade
						features.forEach((feature, i) => {
							tl.to(feature, {
								x: 10,
								color: "#06B6D4",
								duration: 0.2,
								ease: "power2.out"
							}, 0.1 + (i * 0.05));
						});

						// Create energy rings
						for (let i = 0; i < 3; i++) {
							const ring = document.createElement('div');
							ring.className = `absolute inset-0 rounded-2xl border-2 border-primary/20 pointer-events-none`;
							card.appendChild(ring);

							gsap.fromTo(ring, 
								{ scale: 1, opacity: 0.5 },
								{ 
									scale: 1.2 + (i * 0.1), 
									opacity: 0,
									duration: 1,
									ease: "power2.out",
									delay: i * 0.2,
									onComplete: () => ring.remove()
								}
							);
						}
					});

					card.addEventListener('mouseleave', () => {
						gsap.to(card, {
							y: 0,
							scale: isPopular ? 1.05 : 1,
							rotationY: 0,
							boxShadow: isPopular ? 
								"0 10px 30px rgba(99, 102, 241, 0.2)" : 
								"0 4px 6px rgba(0, 0, 0, 0.1)",
							duration: 0.3,
							ease: "power2.out"
						});

						gsap.to([iconBg, icon], {
							scale: 1,
							rotation: 0,
							duration: 0.3,
							ease: "power2.out"
						});

						if (price) {
							gsap.to(price, {
								scale: 1,
								color: "inherit",
								textShadow: "none",
								duration: 0.3
							});
						}

						if (button) {
							gsap.to(button, {
								scale: 1,
								boxShadow: "none",
								duration: 0.3
							});
						}

						features.forEach((feature) => {
							gsap.to(feature, {
								x: 0,
								color: "inherit",
								duration: 0.3
							});
						});
					});
				}
			});

		}, sectionRef);

		return () => ctx.revert();
	}, []);

	return (
		<section ref={sectionRef} className="py-16 relative overflow-hidden">
			{/* Animated background */}
			<div ref={backgroundRef} className="absolute inset-0 pointer-events-none" />
			
			<div className="container mx-auto px-6 relative z-10">
				<div className="text-center mb-16">
					<h2 
						ref={titleRef}
						className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent"
					>
						Choose Your Detection Plan
					</h2>
					<p 
						ref={subtitleRef}
						className="text-xl text-muted-foreground max-w-3xl mx-auto"
					>
						Scale your AI detection capabilities with flexible pricing options
						designed for individuals, professionals, and enterprises.
					</p>
					{error && (
						<div className="mt-6 mx-auto max-w-md p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
							{error}
						</div>
					)}
				</div>
				
				<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{plans.map((plan, index) => (
						<div
							key={index}
							ref={(el) => {
								if (el) cardsRef.current[index] = el;
							}}
							className={`relative p-8 rounded-2xl glass cursor-pointer border border-border/50 hover:border-primary/30 transition-colors duration-300 ${
								plan.popular ? "ring-2 ring-primary shadow-2xl scale-105" : ""
							}`}
						>
							{plan.popular && (
								<Badge className="popular-badge absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground shadow-lg">
									Most Popular
								</Badge>
							)}

							{/* Gradient overlay */}
							<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

							<div className="text-center mb-8 relative z-10">
								<div className="pricing-icon-bg w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-primary/20 to-accent/10 flex items-center justify-center mb-4 relative">
									<plan.icon className={`pricing-icon w-8 h-8 ${plan.color} relative z-10`} />
								</div>

								<h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
								<p className="text-muted-foreground text-sm mb-4">
									{plan.description}
								</p>

								<div className="flex items-baseline justify-center mb-6">
									<span className="pricing-price text-5xl font-bold">{plan.price}</span>
									<span className="text-muted-foreground ml-1">
										{plan.period}
									</span>
								</div>
							</div>

							<ul className="space-y-4 mb-8 relative z-10">
								{plan.features.map((feature, featureIndex) => (
									<li key={featureIndex} className="pricing-feature flex items-center gap-3 transition-colors duration-200">
										<Check className="w-5 h-5 text-neon-green" />
										<span className="text-sm">{feature}</span>
									</li>
								))}
							</ul>
							
							<div className="relative z-10">
								{plan.name === "Pro" && (
									<Button
										variant={plan.buttonVariant}
										size="lg"
										className={`pricing-button w-full ${plan.popular ? "hover-glow" : ""} transition-all duration-300`}
										disabled={loading || authLoading}
										onClick={handlePayNow("pro", setLoading, setError, isAuthenticated, navigate, refreshUser)}
									>
										{authLoading ? "Loading..." : "Pay Now"}
									</Button>
								)}
								{plan.name === "Plus" && (
									<Button
										variant={plan.buttonVariant}
										size="lg"
										className="pricing-button w-full transition-all duration-300"
										disabled={loading || authLoading}
										onClick={handlePayNow("plus", setLoading, setError, isAuthenticated, navigate, refreshUser)}
									>
										{authLoading ? "Loading..." : "Pay Now"}
									</Button>
								)}
								{plan.name === "Free" && (
									<Button
										variant={plan.buttonVariant}
										size="lg"
										className="pricing-button w-full transition-all duration-300"
										disabled={loading}
									>
										{plan.buttonText}
									</Button>
								)}
								{error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
							</div>

							{/* Corner decorations */}
							<div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />
							<div className="absolute bottom-4 left-4 w-1 h-1 bg-accent/40 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}