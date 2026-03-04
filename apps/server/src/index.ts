import { createServer } from "node:http";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  InputVector,
  Player,
  ServerToClientEvents
} from "@game/shared";

const PORT = 3001;
const HOST = "0.0.0.0";
const PLAYER_SIZE = 24;
const PLAYER_SPEED = 240;
const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 720;
const SERVER_TICK_MS = 1000 / 60;

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*"
  }
});

const players = new Map<string, Player>();
const playerInputs = new Map<string, InputVector>();

function createPlayer(id: string): Player {
  return {
    id,
    x: Math.floor(Math.random() * 640),
    y: Math.floor(Math.random() * 360),
    color: `hsl(${Math.floor(Math.random() * 360)} 80% 60%)`
  };
}

function broadcastPlayers(): void {
  io.emit("players", { players: [...players.values()] });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function sanitizeInputVector(input: InputVector): InputVector {
  const x = clamp(input.x, -1, 1);
  const y = clamp(input.y, -1, 1);
  const length = Math.hypot(x, y);

  if (length > 1) {
    return {
      x: x / length,
      y: y / length
    };
  }

  return { x, y };
}

function updatePlayers(deltaSeconds: number): boolean {
  let moved = false;

  for (const player of players.values()) {
    const input = playerInputs.get(player.id);

    if (input === undefined || (input.x === 0 && input.y === 0)) {
      continue;
    }

    player.x = clamp(
      player.x + input.x * PLAYER_SPEED * deltaSeconds,
      0,
      WORLD_WIDTH - PLAYER_SIZE
    );
    player.y = clamp(
      player.y + input.y * PLAYER_SPEED * deltaSeconds,
      0,
      WORLD_HEIGHT - PLAYER_SIZE
    );
    moved = true;
  }

  return moved;
}

setInterval(() => {
  if (updatePlayers(SERVER_TICK_MS / 1000)) {
    broadcastPlayers();
  }
}, SERVER_TICK_MS);

io.on("connection", (socket) => {
  const player = createPlayer(socket.id);
  players.set(socket.id, player);
  playerInputs.set(socket.id, { x: 0, y: 0 });

  socket.emit("connected", { id: socket.id });
  broadcastPlayers();

  socket.on("moveInput", (payload) => {
    playerInputs.set(socket.id, sanitizeInputVector(payload));
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    playerInputs.delete(socket.id);
    io.emit("playerLeft", { id: socket.id });
    broadcastPlayers();
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
