import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function UpgradePrompt({ isOpen, onClose, message }: UpgradePromptProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    
    // Check if we're already on the landing page
    if (window.location.pathname === '/') {
      // Already on landing page, just scroll to pricing
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to landing page pricing section
      navigate('/#pricing');
      
      // Scroll to pricing section after navigation
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Upgrade Required
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 mt-4">
            {message || "You've reached your monthly detection limit. Upgrade your plan to continue using ForensicX with more detections and advanced features!"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg my-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-purple-800">Upgrade Benefits:</span>
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Pro Plan: ₹2,399/month - 1,000 detections</li>
            <li>• Plus Plan: ₹5,499/month - Unlimited detections</li>
            <li>• Text, Image & PDF analysis</li>
            <li>• Advanced accuracy reports & API access</li>
            <li>• Priority processing & 24/7 support</li>
          </ul>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={onClose}>
            Maybe Later
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}