"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Window from "@/components/Window";
import WindowTitlebar from "@/components/WindowTitlebar";

type Point = { x: number; y: number };

const GRID = 18;
const CELL = 20;
const SPEED_MS = 120;

export default function GameWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);

  const snakeRef = useRef<Point[]>([{ x: 8, y: 8 }]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 12, y: 8 });
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef<Point | null>(null);

  const randomFood = useCallback((snake: Point[]) => {
    let p: Point;
    do {
      p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake.some((s) => s.x === p.x && s.y === p.y));
    return p;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = randomFood(snakeRef.current);
    setScore(0);
    setGameOver(false);
  }, [randomFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    // grid tipis
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, GRID * CELL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(GRID * CELL, i * CELL);
      ctx.stroke();
    }

    // food
    const f = foodRef.current;
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2.6, 0, Math.PI * 2);
    ctx.fill();

    // snake
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#34d399" : "#10b981";
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 5);
      ctx.fill();
    });
  }, []);

  const tick = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const head = snakeRef.current[0];
    const newHead: Point = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

    const hitWall = newHead.x < 0 || newHead.y < 0 || newHead.x >= GRID || newHead.y >= GRID;
    const hitSelf = snakeRef.current.some((s) => s.x === newHead.x && s.y === newHead.y);

    if (hitWall || hitSelf) {
      setGameOver(true);
      setRunning(false);
      setBest((b) => Math.max(b, score));
      if (loopRef.current) clearInterval(loopRef.current);
      return;
    }

    const ateFood = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
    const newSnake = [newHead, ...snakeRef.current];
    if (ateFood) {
      setScore((s) => s + 1);
      foodRef.current = randomFood(newSnake);
    } else {
      newSnake.pop();
    }
    snakeRef.current = newSnake;
    draw();
  }, [draw, randomFood, score]);

  const startGame = useCallback(() => {
    resetGame();
    setRunning(true);
  }, [resetGame]);

  useEffect(() => {
    if (running) {
      loopRef.current = setInterval(tick, SPEED_MS);
    }
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [running, tick]);

  useEffect(() => {
    draw();
  }, [draw, running]);

  // Dipakai bersama oleh keyboard, swipe, dan tombol D-pad di layar
  const setDirection = useCallback((nd: Point) => {
    const d = dirRef.current;
    // cegah belok 180 derajat langsung
    if (nd.x === -d.x && nd.y === -d.y) return;
    nextDirRef.current = nd;
  }, []);

  // Keyboard controls
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const map: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };
      const nd = map[e.key];
      if (!nd) return;
      e.preventDefault();
      setDirection(nd);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setDirection]);

  // Touch swipe controls (di area canvas)
  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    let nd: Point | null = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) < 20) return;
      nd = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      if (Math.abs(dy) < 20) return;
      nd = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    setDirection(nd);
  }

  return (
    <Window name="Game" widthClass="w-[26rem]">
      <WindowTitlebar name="Game" title="Snake" />

      <div className="flex-1 p-5 flex flex-col items-center bg-neutral-900 overflow-y-auto">
        <div className="flex items-center justify-between w-full max-w-[360px] mb-3 text-sm text-white/80">
          <span>Skor: <b className="text-emerald-400">{score}</b></span>
          <span>Terbaik: <b className="text-amber-400">{best}</b></span>
        </div>

        <div
          className="relative w-full max-w-[min(90vw,360px)] aspect-square rounded-xl overflow-hidden border border-white/10 touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <canvas
            ref={canvasRef}
            width={GRID * CELL}
            height={GRID * CELL}
            className="block w-full h-full"
          />

          {(!running || gameOver) && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 text-white">
              {gameOver && <p className="text-lg font-semibold">Game Over 🐍</p>}
              <button
                onClick={startGame}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-medium text-sm"
              >
                {gameOver ? "Main Lagi" : "Mulai Main"}
              </button>
              <p className="text-[11px] text-white/50 text-center px-6">
                Gunakan tombol panah / WASD di desktop,<br />atau swipe / tombol di layar HP
              </p>
            </div>
          )}
        </div>

        {/* D-pad on-screen — kontrol utama untuk mobile, muncul selama game berjalan */}
        {running && !gameOver && (
          <div className="md:hidden mt-5 grid grid-cols-3 grid-rows-3 gap-2 w-[168px] select-none">
            <span />
            <button
              onClick={() => setDirection({ x: 0, y: -1 })}
              aria-label="Atas"
              className="col-start-2 row-start-1 w-12 h-12 rounded-xl bg-white/10 active:bg-white/20 flex items-center justify-center text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
            <span />

            <button
              onClick={() => setDirection({ x: -1, y: 0 })}
              aria-label="Kiri"
              className="col-start-1 row-start-2 w-12 h-12 rounded-xl bg-white/10 active:bg-white/20 flex items-center justify-center text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
            <span className="col-start-2 row-start-2 rounded-xl bg-white/5" />
            <button
              onClick={() => setDirection({ x: 1, y: 0 })}
              aria-label="Kanan"
              className="col-start-3 row-start-2 w-12 h-12 rounded-xl bg-white/10 active:bg-white/20 flex items-center justify-center text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <span />
            <button
              onClick={() => setDirection({ x: 0, y: 1 })}
              aria-label="Bawah"
              className="col-start-2 row-start-3 w-12 h-12 rounded-xl bg-white/10 active:bg-white/20 flex items-center justify-center text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
            <span />
          </div>
        )}
      </div>
    </Window>
  );
}
