import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Image as ImageIcon, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface Room {
  code: string;
  currentRound: number;
  maxRounds: number;
}

interface GeneratingPhaseProps {
  room: Room;
  word: string;
}

export const GeneratingPhase = ({ room, word }: GeneratingPhaseProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Sparkles, text: "Analyzing your creative prompts...", color: "text-yellow-400" },
    { icon: Zap, text: "Generating unique AI images...", color: "text-blue-400" },
    { icon: ImageIcon, text: "Adding final touches...", color: "text-purple-400" },
  ];

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 1;
      });
    }, 200);

    // Cycle through steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        <Badge className="bg-purple-500/20 border-purple-500/30 animate-pulse">
          Round {room.currentRound}/{room.maxRounds}
        </Badge>

        <Card className="glass p-12 border-primary/50 animate-scale-in">
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-20 h-20 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 animate-ping"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-black text-gradient">
                AI is Creating Magic! ✨
              </h2>
              <p className="text-xl text-muted-foreground">
                Generating images for: <span className="font-bold text-foreground">{word}</span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progress}% Complete</p>
            </div>

            {/* Animated Steps */}
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = idx === currentStep;
                return (
                  <div 
                    key={idx}
                    className={`flex items-center justify-center gap-2 transition-all duration-300 ${
                      isActive ? 'scale-110 opacity-100' : 'opacity-50 scale-100'
                    }`}
                  >
                    <StepIcon className={`w-5 h-5 ${step.color} ${isActive ? 'animate-pulse' : ''}`} />
                    <p className={`text-sm ${isActive ? 'font-semibold' : 'text-muted-foreground'}`}>
                      {step.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Get ready to vote for your favorite!
              </p>
              <p className="text-xs text-muted-foreground/60">
                This usually takes 10-15 seconds
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
