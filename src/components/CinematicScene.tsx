import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MEDIA } from '../constants/media';

interface CinematicSceneProps {
  progress: number;
  quality: 'auto' | '1080p' | '720p';
  stillness: boolean;
  onVideoReady?: () => void;
  onVideoProgress?: (bufferedSeconds: number) => void;
  onVideoError?: (err: Error) => void;
  videoRefOut?: React.MutableRefObject<HTMLVideoElement | null>;
}

export const CinematicScene: React.FC<CinematicSceneProps> = ({
  progress,
  quality,
  stillness,
  onVideoReady,
  onVideoProgress,
  onVideoError,
  videoRefOut
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [hasDepthAtlas, setHasDepthAtlas] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Pointer smoothing for depth parallax
  const pointerTarget = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerCurrent = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPointerInside = useRef<boolean>(false);

  // WebGL context and resources
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const sceneTextureRef = useRef<WebGLTexture | null>(null);
  const depthTextureRef = useRef<WebGLTexture | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    u_resolution: WebGLUniformLocation | null;
    u_pointer: WebGLUniformLocation | null;
    u_time: WebGLUniformLocation | null;
    u_hasDepth: WebGLUniformLocation | null;
    u_scene: WebGLUniformLocation | null;
    u_depth: WebGLUniformLocation | null;
  } | null>(null);

  // Sync video ref out
  useEffect(() => {
    if (videoRefOut) {
      videoRefOut.current = videoRef.current;
    }
  });

  // Track viewport width for mobile poster / auto quality
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport, { passive: true });
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Determine active video source based on quality and viewport
  const activeVideoSrc = React.useMemo(() => {
    if (quality === '1080p') return MEDIA.desktopVideo;
    if (quality === '720p') return MEDIA.mobileVideo;
    // auto
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    return (window.innerWidth <= 900 || isCoarse) ? MEDIA.mobileVideo : MEDIA.desktopVideo;
  }, [quality]);

  // Video seeking management according to Section 9 specifications:
  // "Change currentTime only when the previous seek has finished and the difference from the target exceeds 1/24 second."
  const lastTargetTime = useRef<number>(0);
  const lastUpdatedTime = useRef<number>(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration) || stillness) return;

    const targetVideoTime = progress * Math.max(0, video.duration - 0.045);
    lastTargetTime.current = targetVideoTime;

    if (!video.seeking && Math.abs(targetVideoTime - video.currentTime) > 1 / 24) {
      video.currentTime = targetVideoTime;
    }
  }, [progress, stillness]);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (Math.abs(lastTargetTime.current - video.currentTime) > 1 / 24) {
      video.currentTime = lastTargetTime.current;
    }
  }, []);

  // Monitor buffering progress
  const handleTimeOrProgressUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      onVideoProgress?.(bufferedEnd);
    }
  }, [onVideoProgress]);

  // Handle pointer movements for depth parallax
  useEffect(() => {
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    const onPointerMove = (e: PointerEvent) => {
      isPointerInside.current = true;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      pointerTarget.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    };

    const onPointerLeave = () => {
      isPointerInside.current = false;
      pointerTarget.current = { x: 0, y: 0 };
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  // Initialize WebGL and load Depth Atlas
  useEffect(() => {
    if (stillness) return;

    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) {
      setWebGlSupported(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      setWebGlSupported(false);
      return;
    }

    glRef.current = gl;

    // Vertex shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Exact fragment shader from prompt specification
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_scene;
      uniform sampler2D u_depth;
      uniform vec2 u_resolution;
      uniform vec2 u_pointer;
      uniform float u_time;
      uniform float u_hasDepth;

      float depthAt(vec2 uv, float index) {
        vec2 grid = vec2(8.0, 6.0);
        vec2 tile = vec2(mod(index, grid.x), floor(index / grid.x));
        return texture2D(
          u_depth,
          (tile + clamp(uv, vec2(0.008), vec2(0.992))) / grid
        ).r;
      }

      void main() {
        vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
        float screen = u_resolution.x / u_resolution.y;
        float image = 16.0 / 9.0;
        vec2 cover = vec2(min(1.0, screen/image), min(1.0, image/screen));
        uv = (uv - 0.5) * cover * 0.97 + 0.5;
        float frame = clamp((u_time - 0.25) * 2.0, 0.0, 47.0);
        float d = mix(
          depthAt(uv, floor(frame)),
          depthAt(uv, min(47.0, ceil(frame))),
          fract(frame)
        );
        uv += u_pointer * vec2(0.014, 0.011) * (d - 0.35) * u_hasDepth;
        gl_FragColor = texture2D(u_scene, clamp(uv, vec2(0.001), vec2(0.999)));
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) {
      setWebGlSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setWebGlSupported(false);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      setWebGlSupported(false);
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    uniformsRef.current = {
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_pointer: gl.getUniformLocation(program, 'u_pointer'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_hasDepth: gl.getUniformLocation(program, 'u_hasDepth'),
      u_scene: gl.getUniformLocation(program, 'u_scene'),
      u_depth: gl.getUniformLocation(program, 'u_depth')
    };

    // Textures
    const createTexture = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return tex;
    };

    sceneTextureRef.current = createTexture();
    depthTextureRef.current = createTexture();

    // Load Depth Atlas
    const depthImg = new Image();
    depthImg.crossOrigin = 'anonymous';
    depthImg.src = MEDIA.depthAtlas;
    depthImg.onload = () => {
      if (!glRef.current || !depthTextureRef.current) return;
      gl.bindTexture(gl.TEXTURE_2D, depthTextureRef.current);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, depthImg);
      setHasDepthAtlas(true);
    };
    depthImg.onerror = () => {
      console.warn('Depth atlas failed to load, proceeding without depth displacement.');
      setHasDepthAtlas(false);
    };

    // Handle context loss
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebGlSupported(false);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      if (glRef.current) {
        if (sceneTextureRef.current) gl.deleteTexture(sceneTextureRef.current);
        if (depthTextureRef.current) gl.deleteTexture(depthTextureRef.current);
        if (programRef.current) gl.deleteProgram(programRef.current);
      }
    };
  }, [stillness]);

  // Animation frame rendering loop
  useEffect(() => {
    if (!webGlSupported || stillness) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(50, time - lastTime);
      lastTime = time;

      const gl = glRef.current;
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const uniforms = uniformsRef.current;

      if (!gl || !canvas || !video || !uniforms) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Smooth pointer: alpha = 1 - Math.pow(0.945, dt/16.667)
      const alpha = 1 - Math.pow(0.945, dt / 16.667);
      pointerCurrent.current.x += (pointerTarget.current.x - pointerCurrent.current.x) * alpha;
      pointerCurrent.current.y += (pointerTarget.current.y - pointerCurrent.current.y) * alpha;

      // Update canvas size with DPR capped at 1.5
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const displayWidth = Math.floor(canvas.clientWidth * dpr);
      const displayHeight = Math.floor(canvas.clientHeight * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
      }

      gl.useProgram(programRef.current);

      // Upload video frame if ready
      if (video.readyState >= 2 && !video.seeking) {
        if (lastUpdatedTime.current !== video.currentTime) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, sceneTextureRef.current);
          try {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
            lastUpdatedTime.current = video.currentTime;
          } catch (e) {
            console.error('Error uploading video texture:', e);
          }
        }
      }

      // Bind scene texture unit 0
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sceneTextureRef.current);
      gl.uniform1i(uniforms.u_scene, 0);

      // Bind depth texture unit 1
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, depthTextureRef.current);
      gl.uniform1i(uniforms.u_depth, 1);

      // Pass uniforms
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.u_pointer, pointerCurrent.current.x, pointerCurrent.current.y);
      gl.uniform1f(uniforms.u_time, video.currentTime || 0);
      gl.uniform1f(uniforms.u_hasDepth, hasDepthAtlas ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [webGlSupported, hasDepthAtlas, stillness]);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-[100svh] overflow-hidden pointer-events-none z-0">
      {/* Fallback & Loading Poster Image with subtle scale 1.031 */}
      <img
        src={isMobile ? MEDIA.mobileOpeningPoster : MEDIA.openingPoster}
        alt="SERRA Sanctuary Stone Canyon"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 select-none"
        style={{
          transform: 'scale(1.031)',
          opacity: (videoRef.current && videoRef.current.readyState >= 2) ? 0 : 1
        }}
      />

      {/* Background Video Element (Always present, muted, inline, preloaded) */}
      {!stillness && (
        <video
          ref={videoRef}
          src={activeVideoSrc}
          preload="auto"
          muted
          playsInline
          onLoadedData={() => onVideoReady?.()}
          onSeeked={handleSeeked}
          onProgress={handleTimeOrProgressUpdate}
          onTimeUpdate={handleTimeOrProgressUpdate}
          onError={(e) => onVideoError?.(new Error('Video loading error: ' + e.currentTarget.error?.message))}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 select-none ${
            webGlSupported ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ transform: 'scale(1.031)' }}
        />
      )}

      {/* WebGL Canvas for Depth Parallax Shader */}
      {webGlSupported && !stillness && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover select-none"
          style={{ transform: 'scale(1.031)' }}
        />
      )}

      {/* Precision Readability Gradient Overlay specified in Section 6 */}
      <div className="absolute inset-0 w-full h-full readability-gradient pointer-events-none" />
    </div>
  );
};
