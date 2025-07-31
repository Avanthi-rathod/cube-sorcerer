// Rubik's Cube data structures and types

export enum FaceColor {
  WHITE = 0,
  RED = 1,
  GREEN = 2,
  YELLOW = 3,
  ORANGE = 4,
  BLUE = 5
}

export enum Move {
  U = 0,   // Up clockwise
  U_PRIME = 1,  // Up counter-clockwise
  R = 2,   // Right clockwise
  R_PRIME = 3,  // Right counter-clockwise
  F = 4,   // Front clockwise
  F_PRIME = 5,  // Front counter-clockwise
  D = 6,   // Down clockwise
  D_PRIME = 7,  // Down counter-clockwise
  L = 8,   // Left clockwise
  L_PRIME = 9,  // Left counter-clockwise
  B = 10,  // Back clockwise
  B_PRIME = 11, // Back counter-clockwise
}

export const MOVE_NAMES = [
  "U", "U'", "R", "R'", "F", "F'",
  "D", "D'", "L", "L'", "B", "B'"
];

export interface CubeState {
  faces: FaceColor[][][]; // 6 faces, each 3x3
}

export interface SolverResult {
  moves: Move[];
  solutionTime: number;
  nodesExplored: number;
  algorithmUsed: string;
}

export interface AlgorithmStats {
  name: string;
  avgTime: number;
  bestTime: number;
  worstTime: number;
  successRate: number;
  totalSolves: number;
}

export enum SolverAlgorithm {
  BFS = 'BFS',
  DFS = 'DFS',
  IDDFS = 'IDDFS',
  KORF_IDA = 'KORF_IDA'
}