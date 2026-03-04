import { createServer } from "node:http";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  Player,
  ServerToClientEvents
} from "@game/shared";

const PORT = 3001;
const HOST = "0.0.0.0";

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*"
  }
});

const players = new Map<string, Player>();

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

io.on("connection", (socket) => {
  const player = createPlayer(socket.id);
  players.set(socket.id, player);

  socket.emit("connected", { id: socket.id });
  broadcastPlayers();

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("playerLeft", { id: socket.id });
    broadcastPlayers();
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
