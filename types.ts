export interface User {
  id: string;
  name: string;
  avatar: string;
}

export type GameStatus = 'WAITING' | 'ROLLING' | 'WINNER';

export interface GameState {
  users: User[];
  status: GameStatus;
  winner: User | null;
  winnersHistory: User[];
}

export type EventType =
  | { type: 'JOIN'; payload: User }
  | { type: 'RESET'; payload: null }
  | { type: 'START_DRAW'; payload: null }
  | { type: 'SHOW_WINNER'; payload: User }
  | { type: 'SYNC_REQUEST'; payload: null }
  | { type: 'SYNC_RESPONSE'; payload: User[] };

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
