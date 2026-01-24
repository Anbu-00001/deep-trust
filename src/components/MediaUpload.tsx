import { useState, useCallback } from "react";
import { Upload, Image, Video, Music, X, Loader2 } from "lucide-react";
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
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-secondary/30",
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
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background border border-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={cn(
              "p-4 rounded-full transition-colors",
              isDragging ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
            )}>
              {getFileIcon()}
            </div>
            
            <div>
              <p className="text-lg font-medium">
                {file ? file.name : "Drop media file here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {file 
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "Supports images, videos, and audio files"
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Supported formats */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs text-muted-foreground">Supported:</span>
        {["JPG", "PNG", "MP4", "WebM", "MP3", "WAV"].map((format) => (
          <span
            key={format}
            className="px-2 py-1 text-xs font-mono bg-secondary rounded"
          >
            {format}
          </span>
        ))}
      </div>

      {/* Analyze button */}
      <Button
        variant="hero"
        size="lg"
        className="w-full"
        disabled={!file || isAnalyzing}
        onClick={handleAnalyzeClick}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing Media...
          </>
        ) : (
          <>
            Analyze for Authenticity
          </>
        )}
      </Button>
    </div>
  );
};

export default MediaUpload;
