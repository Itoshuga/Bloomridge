export type PlayerId = string;

export type Player = {
  id: PlayerId;
  x: number;
  y: number;
  color: string;
};

export type ServerToClientEvents = {
  connected: (payload: { id: PlayerId }) => void;
  players: (payload: { players: Player[] }) => void;
  playerLeft: (payload: { id: PlayerId }) => void;
};

export type ClientToServerEvents = Record<string, never>;
