import "./style.css";
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  InputVector,
  Player,
  ServerToClientEvents
} from "@game/shared";
import { createGameInput } from "./input";

const app = document.getElementById("app");

if (!(app instanceof HTMLDivElement)) {
  throw new Error("Missing #app container");
}

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

if (context === null) {
  throw new Error("Canvas 2D context is unavailable");
}

const ctx = context;
const input = createGameInput();

const status = document.createElement("div");
status.className = "status";
status.textContent = "Connecting...";

app.append(canvas, status);

const players = new Map<string, Player>();
let localPlayerId: string | null = null;
let lastSentMove: InputVector | null = null;

const host = window.location.hostname || "localhost";
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `http://${host}:3001`,
  { transports: ["websocket"] }
);

function resizeCanvas(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render();
}

function syncMoveInput(): void {
  const move = input.getMoveVector();

  if (!socket.connected) {
    lastSentMove = null;
    return;
  }

  if (lastSentMove !== null) {
    const isSameMove = move.x === lastSentMove.x && move.y === lastSentMove.y;

    if (isSameMove) {
      return;
    }
  }

  socket.emit("moveInput", { x: move.x, y: move.y });
  lastSentMove = { x: move.x, y: move.y };
}

function stopMoveInput(): void {
  if (!socket.connected) {
    lastSentMove = null;
    return;
  }

  socket.emit("moveInput", { x: 0, y: 0 });
  lastSentMove = { x: 0, y: 0 };
}

function render(): void {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const player of players.values()) {
    const renderX = Math.round(player.x);
    const renderY = Math.round(player.y);

    ctx.fillStyle = player.color;
    ctx.fillRect(renderX, renderY, 24, 24);

    if (player.id === localPlayerId) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(renderX - 2, renderY - 2, 28, 28);
    }
  }
}

function startRenderLoop(): void {
  const tick = (): void => {
    syncMoveInput();
    render();
    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
}

socket.on("connect", () => {
  status.textContent = "Connected";
  lastSentMove = null;
});

socket.on("disconnect", () => {
  status.textContent = "Disconnected";
  localPlayerId = null;
  lastSentMove = null;
  players.clear();
  render();
});

socket.on("connected", (payload) => {
  localPlayerId = payload.id;
});

socket.on("players", (payload) => {
  players.clear();

  for (const player of payload.players) {
    players.set(player.id, player);
  }

  render();
});

socket.on("playerLeft", (payload) => {
  players.delete(payload.id);
  render();
});

input.attach();
window.addEventListener("blur", stopMoveInput);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopMoveInput();
  }
});
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
startRenderLoop();
