import { Activity, BookOpen, FileClock, ScanSearch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Header = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-12 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-full items-center justify-between px-3 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-primary/40 bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <span className="font-mono text-sm font-bold uppercase">DeepTrust</span>
          <span className="hidden border-l border-border pl-3 font-mono text-[10px] uppercase text-muted-foreground sm:block">
            Media integrity workspace
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="mr-2 hidden items-center gap-2 font-mono text-[10px] uppercase text-muted-foreground md:flex">
            <Activity className="h-3 w-3 text-success" /> Ready
          </div>
          {[
            { label: "New analysis", icon: ScanSearch, href: "#workspace" },
            { label: "Method notes", icon: BookOpen, href: "#method" },
            { label: "Report history", icon: FileClock, href: "#reports" },
          ].map(({ label, icon: Icon, href }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <a href={href} aria-label={label}><Icon className="h-4 w-4" /></a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
