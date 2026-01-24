import { AlertTriangle, HelpCircle, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface UncertaintyIndicatorProps {
  trustScore: number;
  uncertaintyFlag: boolean;
  uncertaintyReason?: string;
  className?: string;
}

const UncertaintyIndicator = ({
  trustScore,
  uncertaintyFlag,
  uncertaintyReason,
  className
}: UncertaintyIndicatorProps) => {
  // Show uncertainty warning when score is in uncertain range (40-70) or flag is set
  const isUncertain = uncertaintyFlag || (trustScore >= 40 && trustScore <= 70);
  
  if (!isUncertain) return null;

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-trust-medium/30 bg-trust-medium/5 p-4",
        "animate-fade-in-up",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-trust-medium/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-trust-medium" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-trust-medium">Uncertain Result</h4>
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {uncertaintyReason || 
              "The analysis score falls within an ambiguous range. The detector cannot make a confident determination."}
          </p>
          
          <div className="flex items-center gap-2 pt-2 text-sm">
            <UserCheck className="w-4 h-4 text-trust-medium" />
            <span className="font-medium text-trust-medium">
              Manual review recommended
            </span>
          </div>
          
          <div className="pt-3 border-t border-border mt-3">
            <p className="text-xs text-muted-foreground">
              <strong>Suggested actions:</strong> Cross-reference with additional detection tools, 
              check original source, examine metadata, or consult a human expert.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UncertaintyIndicator;
