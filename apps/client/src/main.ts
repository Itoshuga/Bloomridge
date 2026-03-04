import "./style.css";
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  Player,
  ServerToClientEvents
} from "@game/shared";

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

const status = document.createElement("div");
status.className = "status";
status.textContent = "Connecting...";

app.append(canvas, status);

const players = new Map<string, Player>();
let localPlayerId: string | null = null;

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

function render(): void {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const player of players.values()) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, 24, 24);

    if (player.id === localPlayerId) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(player.x - 2, player.y - 2, 28, 28);
    }
  }
}

socket.on("connect", () => {
  status.textContent = "Connected";
});

socket.on("disconnect", () => {
  status.textContent = "Disconnected";
  localPlayerId = null;
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

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
