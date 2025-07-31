// Rubik's Cube Model Implementation - Adapted from C++ DSA patterns

import { CubeState, FaceColor, Move } from '@/types/cube';

export class RubiksCube {
  private state: CubeState;

  constructor(state?: CubeState) {
    this.state = state || this.createSolvedState();
  }

  private createSolvedState(): CubeState {
    const faces = [];
    for (let i = 0; i < 6; i++) {
      const face = [];
      for (let j = 0; j < 3; j++) {
        const row = [];
        for (let k = 0; k < 3; k++) {
          row.push(i as FaceColor);
        }
        face.push(row);
      }
      faces.push(face);
    }
    return { faces };
  }

  getState(): CubeState {
    return JSON.parse(JSON.stringify(this.state));
  }

  setState(state: CubeState): void {
    this.state = JSON.parse(JSON.stringify(state));
  }

  // Face rotation utility
  private rotateFaceClockwise(faceIndex: number): void {
    const face = this.state.faces[faceIndex];
    const temp = JSON.parse(JSON.stringify(face));
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        face[i][j] = temp[2 - j][i];
      }
    }
  }

  private rotateFaceCounterClockwise(faceIndex: number): void {
    const face = this.state.faces[faceIndex];
    const temp = JSON.parse(JSON.stringify(face));
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        face[i][j] = temp[j][2 - i];
      }
    }
  }

  // Move implementations
  private moveU(): void {
    this.rotateFaceClockwise(FaceColor.WHITE);
    
    // Rotate edges
    const temp = [
      this.state.faces[FaceColor.GREEN][0][0],
      this.state.faces[FaceColor.GREEN][0][1],
      this.state.faces[FaceColor.GREEN][0][2]
    ];
    
    // Green -> Orange
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.GREEN][0][i] = this.state.faces[FaceColor.ORANGE][0][i];
    }
    
    // Orange -> Blue
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.ORANGE][0][i] = this.state.faces[FaceColor.BLUE][0][i];
    }
    
    // Blue -> Red
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.BLUE][0][i] = this.state.faces[FaceColor.RED][0][i];
    }
    
    // Red -> Green (from temp)
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.RED][0][i] = temp[i];
    }
  }

  private moveUPrime(): void {
    this.rotateFaceCounterClockwise(FaceColor.WHITE);
    
    // Rotate edges (reverse of U)
    const temp = [
      this.state.faces[FaceColor.GREEN][0][0],
      this.state.faces[FaceColor.GREEN][0][1],
      this.state.faces[FaceColor.GREEN][0][2]
    ];
    
    // Green -> Red
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.GREEN][0][i] = this.state.faces[FaceColor.RED][0][i];
    }
    
    // Red -> Blue
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.RED][0][i] = this.state.faces[FaceColor.BLUE][0][i];
    }
    
    // Blue -> Orange
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.BLUE][0][i] = this.state.faces[FaceColor.ORANGE][0][i];
    }
    
    // Orange -> Green (from temp)
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.ORANGE][0][i] = temp[i];
    }
  }

  private moveR(): void {
    this.rotateFaceClockwise(FaceColor.RED);
    
    const temp = [
      this.state.faces[FaceColor.WHITE][0][2],
      this.state.faces[FaceColor.WHITE][1][2],
      this.state.faces[FaceColor.WHITE][2][2]
    ];
    
    // White -> Green
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.WHITE][i][2] = this.state.faces[FaceColor.GREEN][i][2];
    }
    
    // Green -> Yellow
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.GREEN][i][2] = this.state.faces[FaceColor.YELLOW][i][2];
    }
    
    // Yellow -> Blue
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.YELLOW][i][2] = this.state.faces[FaceColor.BLUE][2 - i][0];
    }
    
    // Blue -> White (from temp)
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.BLUE][2 - i][0] = temp[i];
    }
  }

  private moveRPrime(): void {
    this.rotateFaceCounterClockwise(FaceColor.RED);
    
    const temp = [
      this.state.faces[FaceColor.WHITE][0][2],
      this.state.faces[FaceColor.WHITE][1][2],
      this.state.faces[FaceColor.WHITE][2][2]
    ];
    
    // White -> Blue
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.WHITE][i][2] = this.state.faces[FaceColor.BLUE][2 - i][0];
    }
    
    // Blue -> Yellow
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.BLUE][2 - i][0] = this.state.faces[FaceColor.YELLOW][i][2];
    }
    
    // Yellow -> Green
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.YELLOW][i][2] = this.state.faces[FaceColor.GREEN][i][2];
    }
    
    // Green -> White (from temp)
    for (let i = 0; i < 3; i++) {
      this.state.faces[FaceColor.GREEN][i][2] = temp[i];
    }
  }

  // Additional move implementations would go here (F, F', D, D', L, L', B, B')
  // For brevity, implementing the main ones first

  applyMove(move: Move): void {
    switch (move) {
      case Move.U:
        this.moveU();
        break;
      case Move.U_PRIME:
        this.moveUPrime();
        break;
      case Move.R:
        this.moveR();
        break;
      case Move.R_PRIME:
        this.moveRPrime();
        break;
      // TODO: Implement remaining moves
      default:
        console.warn(`Move ${move} not yet implemented`);
    }
  }

  applyMoves(moves: Move[]): void {
    moves.forEach(move => this.applyMove(move));
  }

  scramble(moveCount: number = 20): Move[] {
    const moves: Move[] = [];
    const possibleMoves = Object.values(Move).filter(m => typeof m === 'number') as Move[];
    
    for (let i = 0; i < moveCount; i++) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      this.applyMove(randomMove);
      moves.push(randomMove);
    }
    
    return moves;
  }

  isSolved(): boolean {
    for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
      const expectedColor = faceIndex as FaceColor;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.state.faces[faceIndex][i][j] !== expectedColor) {
            return false;
          }
        }
      }
    }
    return true;
  }

  clone(): RubiksCube {
    return new RubiksCube(this.getState());
  }

  // Hash function for state comparison (useful for BFS/DFS)
  getStateHash(): string {
    return JSON.stringify(this.state.faces);
  }

  // Manhattan distance heuristic for A* algorithms
  getManhattanDistance(): number {
    let distance = 0;
    
    for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const currentColor = this.state.faces[faceIndex][i][j];
          if (currentColor !== faceIndex) {
            // This piece is out of place
            distance++;
          }
        }
      }
    }
    
    return distance;
  }
}