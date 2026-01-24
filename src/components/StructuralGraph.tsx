import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Node {
  id: number;
  x: number;
  y: number;
  suspicious?: boolean;
}

interface Edge {
  from: number;
  to: number;
  suspicious?: boolean;
}

interface StructuralGraphProps {
  className?: string;
  animated?: boolean;
}

const StructuralGraph = ({ className, animated = true }: StructuralGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes] = useState<Node[]>(() => generateNodes());
  const [edges] = useState<Edge[]>(() => generateEdges(nodes));
  const animationRef = useRef<number>();
  const [progress, setProgress] = useState(animated ? 0 : 1);

  function generateNodes(): Node[] {
    const nodeCount = 24;
    const nodes: Node[] = [];
    
    // Generate nodes in a facial landmark-like pattern
    const centerX = 200;
    const centerY = 150;
    
    // Eyes region
    for (let i = 0; i < 6; i++) {
      nodes.push({
        id: i,
        x: centerX - 60 + (i % 3) * 30 + Math.random() * 10,
        y: centerY - 40 + Math.floor(i / 3) * 20 + Math.random() * 5,
        suspicious: i === 2 // Mark one as suspicious
      });
    }
    
    // Right eye region
    for (let i = 6; i < 12; i++) {
      nodes.push({
        id: i,
        x: centerX + 30 + ((i - 6) % 3) * 30 + Math.random() * 10,
        y: centerY - 40 + Math.floor((i - 6) / 3) * 20 + Math.random() * 5,
      });
    }
    
    // Nose region
    for (let i = 12; i < 16; i++) {
      nodes.push({
        id: i,
        x: centerX - 15 + ((i - 12) % 2) * 30 + Math.random() * 5,
        y: centerY + ((i - 12) < 2 ? 0 : 30) + Math.random() * 10,
      });
    }
    
    // Mouth region
    for (let i = 16; i < 22; i++) {
      nodes.push({
        id: i,
        x: centerX - 40 + ((i - 16) % 6) * 16 + Math.random() * 5,
        y: centerY + 60 + Math.sin((i - 16) * 0.5) * 10 + Math.random() * 5,
        suspicious: i === 18 || i === 19
      });
    }
    
    // Face outline
    nodes.push({ id: 22, x: centerX - 80, y: centerY - 20, suspicious: false });
    nodes.push({ id: 23, x: centerX + 80, y: centerY - 20, suspicious: false });
    
    return nodes;
  }

  function generateEdges(nodes: Node[]): Edge[] {
    const edges: Edge[] = [];
    
    // Connect nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].x - nodes[j].x, 2) + 
          Math.pow(nodes[i].y - nodes[j].y, 2)
        );
        
        if (dist < 60) {
          edges.push({
            from: i,
            to: j,
            suspicious: nodes[i].suspicious || nodes[j].suspicious
          });
        }
      }
    }
    
    return edges;
  }

  useEffect(() => {
    if (!animated) return;

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animated]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 300 * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, 400, 300);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 400; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 300);
      ctx.stroke();
    }
    for (let y = 0; y <= 300; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(400, y);
      ctx.stroke();
    }

    // Draw edges
    const visibleEdges = Math.floor(edges.length * progress);
    edges.slice(0, visibleEdges).forEach((edge) => {
      const fromNode = nodes[edge.from];
      const toNode = nodes[edge.to];
      
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.strokeStyle = edge.suspicious 
        ? "rgba(239, 68, 68, 0.4)" 
        : "rgba(45, 212, 191, 0.3)";
      ctx.lineWidth = edge.suspicious ? 2 : 1;
      ctx.stroke();
    });

    // Draw nodes
    const visibleNodes = Math.floor(nodes.length * progress);
    nodes.slice(0, visibleNodes).forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.suspicious ? 6 : 4, 0, Math.PI * 2);
      
      if (node.suspicious) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
        ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = "rgba(45, 212, 191, 0.8)";
        ctx.shadowColor = "rgba(45, 212, 191, 0.3)";
        ctx.shadowBlur = 8;
      }
      
      ctx.fill();
      ctx.shadowBlur = 0;
    });

  }, [nodes, edges, progress]);

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg"
        style={{ maxWidth: "400px", aspectRatio: "4/3" }}
      />
      
      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Normal Keypoint</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Suspicious Region</span>
        </div>
      </div>
    </div>
  );
};

export default StructuralGraph;
