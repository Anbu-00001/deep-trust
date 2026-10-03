import { useState, useCallback } from "react";
import { Upload, Image, Video, Music, X, Loader2, FileKey, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
  onClear?: () => void;
}

const MediaUpload = ({ onAnalyze, isAnalyzing, onClear }: MediaUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    onClear?.();
  };

  const handleAnalyzeClick = () => {
    if (file) {
      onAnalyze(file);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-12 h-12" />;
    if (file.type.startsWith("image/")) return <Image className="w-12 h-12" />;
    if (file.type.startsWith("video/")) return <Video className="w-12 h-12" />;
    if (file.type.startsWith("audio/")) return <Music className="w-12 h-12" />;
    return <Upload className="w-12 h-12" />;
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative flex min-h-[300px] flex-1 cursor-crosshair items-center justify-center overflow-hidden rounded border border-dashed p-6 transition-colors duration-200",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/60 hover:bg-secondary/20",
          file && "border-primary/30"
        )}
      >
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
               className="max-h-72 mx-auto rounded object-contain"
            />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Remove selected file"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
                className="absolute right-2 top-2"
            >
              <X className="w-4 h-4" />
              </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded border transition-colors",
              isDragging ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
            )}>
              {getFileIcon()}
            </div>
            
            <div>
              <p className="font-mono text-sm font-bold uppercase">
                {file ? file.name : "Place evidence file here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {file 
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "or select a local image, video, or audio file"
                }
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded border border-border bg-border text-xs">
        <div className="flex items-center gap-2 bg-card px-3 py-2 text-muted-foreground"><FileKey className="h-3.5 w-3.5" /> SHA-256 on intake</div>
        <div className="flex items-center gap-2 bg-card px-3 py-2 text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" /> 100 MB maximum</div>
      </div>

      {/* Analyze button */}
      <Button
        variant="default"
        size="lg"
        className="w-full"
        disabled={!file || isAnalyzing}
        onClick={handleAnalyzeClick}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Assessing evidence…
          </>
        ) : (
          <>
            Begin evidence assessment
          </>
        )}
      </Button>
    </div>
  );
};

export default MediaUpload;
