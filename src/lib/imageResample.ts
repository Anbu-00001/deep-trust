/**
 * Deterministic image resampling that matches the reference PIL pipeline of
 * the pinned detector models.
 *
 * Browser `drawImage` resampling is undocumented and varies across engines,
 * and resampling is part of what these classifiers read. We therefore
 * reimplement PIL's separable resize directly:
 *  - fixed-support kernels (no antialias), weights normalized per output pixel
 *  - bicubic (a = -0.5) and bilinear (triangle) filters
 *
 * Input and output are RGBA buffers (1 byte per channel).
 */

export type Kernel = (x: number) => number;

function cubicKernel(x: number): number {
  const a = -0.5;
  const ax = Math.abs(x);
  if (ax < 1) return (a + 2) * ax * ax * ax - (a + 3) * ax * ax + 1;
  if (ax < 2) return a * ax * ax * ax - 5 * a * ax * ax + 8 * a * ax - 4 * a;
  return 0;
}

function triangleKernel(x: number): number {
  const ax = Math.abs(x);
  return ax < 1 ? 1 - ax : 0;
}

export function kernelFor(filter: "bicubic" | "bilinear"): Kernel {
  return filter === "bicubic" ? cubicKernel : triangleKernel;
}

/**
 * Fixed-support precomputed weights for one dimension, following PIL's
 * `ImagingResampleHorizontal/Vertical`: the sampling center for output
 * coordinate x is (x + 0.5) * srcLen / dstLen - 0.5, clamped to the source.
 */
function buildWeights(srcLen: number, dstLen: number, kernel: Kernel): { starts: Int32Array; indices: Int32Array; weights: Float32Array; window: number } {
  const scale = srcLen / dstLen;
  const support = kernel === cubicKernel ? 2 : 1;
  const window = Math.max(1, Math.ceil(support * Math.max(1, scale)) + 2) * 2;
  const starts = new Int32Array(dstLen);
  const indices = new Int32Array(dstLen * window);
  const weights = new Float32Array(dstLen * window);

  for (let out = 0; out < dstLen; out++) {
    const center = (out + 0.5) * scale - 0.5;
    const start = Math.floor(center - support * Math.max(1, scale) * 0.5 - 0.5);
    starts[out] = start;
    let sum = 0;
    let count = 0;
    for (let j = 0; j < window; j++) {
      const w = kernel((j + start - center) / Math.max(1, scale));
      if (w !== 0) {
        weights[out * window + j] = w;
        sum += w;
        count++;
      }
    }
    for (let j = 0; j < window; j++) {
      const idx = start + j;
      indices[out * window + j] = idx < 0 ? 0 : idx >= srcLen ? srcLen - 1 : idx;
      if (sum !== 0 && weights[out * window + j] !== 0) weights[out * window + j] /= sum;
    }
    if (count === 0) {
      // Degenerate mapping: fall back to nearest sample.
      const idx = center < 0 ? 0 : center >= srcLen ? srcLen - 1 : Math.round(center);
      indices[out * window] = idx;
      weights[out * window] = 1;
    }
  }
  return { starts, indices, weights, window };
}

/** Separable resample of an RGBA buffer. Output alpha is carried through. */
export function resizeRgba(
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
  filter: "bicubic" | "bilinear"
): Uint8ClampedArray {
  const kernel = kernelFor(filter);
  const wx = buildWeights(srcW, dstW, kernel);
  const wy = buildWeights(srcH, dstH, kernel);

  // Horizontal pass: srcH x dstW
  const mid = new Float32Array(srcH * dstW * 4);
  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < dstW; x++) {
      const start = wx.starts[x];
      let r = 0, g = 0, b = 0, a = 0;
      for (let j = 0; j < wx.window; j++) {
        const w = wx.weights[x * wx.window + j];
        if (w === 0) continue;
        const si = (y * srcW + wx.indices[x * wx.window + j]) * 4;
        r += src[si] * w;
        g += src[si + 1] * w;
        b += src[si + 2] * w;
        a += src[si + 3] * w;
      }
      const di = (y * dstW + x) * 4;
      mid[di] = r; mid[di + 1] = g; mid[di + 2] = b; mid[di + 3] = a;
    }
  }

  // Vertical pass: dstH x dstW
  const out = new Uint8ClampedArray(dstW * dstH * 4);
  for (let y = 0; y < dstH; y++) {
    const start = wy.starts[y];
    for (let x = 0; x < dstW; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let j = 0; j < wy.window; j++) {
        const w = wy.weights[y * wy.window + j];
        if (w === 0) continue;
        const si = (wy.indices[y * wy.window + j] * dstW + x) * 4;
        r += mid[si] * w;
        g += mid[si + 1] * w;
        b += mid[si + 2] * w;
        a += mid[si + 3] * w;
      }
      const di = (y * dstW + x) * 4;
      out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a;
    }
  }
  return out;
}

export function findShortestEdgeResize(width: number, height: number, target = 440): { width: number; height: number } {
  const shortest = Math.min(width, height);
  if (shortest === target) return { width, height };
  const scale = target / shortest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
