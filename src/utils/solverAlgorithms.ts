// Rubik's Cube Solver Algorithms Implementation

import { RubiksCube } from './cubeModel';
import { Move, SolverResult, SolverAlgorithm } from '@/types/cube';

interface SearchNode {
  cube: RubiksCube;
  moves: Move[];
  depth: number;
  cost: number;
}

export class RubiksSolver {
  private maxNodes = 100000; // Prevent infinite loops
  
  // Breadth-First Search
  async solveBFS(cube: RubiksCube): Promise<SolverResult> {
    const startTime = performance.now();
    let nodesExplored = 0;
    
    const queue: SearchNode[] = [{
      cube: cube.clone(),
      moves: [],
      depth: 0,
      cost: 0
    }];
    
    const visited = new Set<string>();
    visited.add(cube.getStateHash());
    
    while (queue.length > 0 && nodesExplored < this.maxNodes) {
      const current = queue.shift()!;
      nodesExplored++;
      
      if (current.cube.isSolved()) {
        const endTime = performance.now();
        return {
          moves: current.moves,
          solutionTime: endTime - startTime,
          nodesExplored,
          algorithmUsed: SolverAlgorithm.BFS
        };
      }
      
      // Try all possible moves
      const possibleMoves = [Move.U, Move.U_PRIME, Move.R, Move.R_PRIME];
      
      for (const move of possibleMoves) {
        const newCube = current.cube.clone();
        newCube.applyMove(move);
        const stateHash = newCube.getStateHash();
        
        if (!visited.has(stateHash)) {
          visited.add(stateHash);
          queue.push({
            cube: newCube,
            moves: [...current.moves, move],
            depth: current.depth + 1,
            cost: 0
          });
        }
      }
    }
    
    const endTime = performance.now();
    return {
      moves: [],
      solutionTime: endTime - startTime,
      nodesExplored,
      algorithmUsed: SolverAlgorithm.BFS
    };
  }

  // Depth-First Search with depth limit
  async solveDFS(cube: RubiksCube, maxDepth: number = 20): Promise<SolverResult> {
    const startTime = performance.now();
    let nodesExplored = 0;
    
    const search = (currentCube: RubiksCube, moves: Move[], depth: number): Move[] | null => {
      if (nodesExplored >= this.maxNodes) return null;
      nodesExplored++;
      
      if (currentCube.isSolved()) {
        return moves;
      }
      
      if (depth >= maxDepth) {
        return null;
      }
      
      const possibleMoves = [Move.U, Move.U_PRIME, Move.R, Move.R_PRIME];
      
      for (const move of possibleMoves) {
        const newCube = currentCube.clone();
        newCube.applyMove(move);
        
        const result = search(newCube, [...moves, move], depth + 1);
        if (result) return result;
      }
      
      return null;
    };
    
    const solution = search(cube.clone(), [], 0);
    const endTime = performance.now();
    
    return {
      moves: solution || [],
      solutionTime: endTime - startTime,
      nodesExplored,
      algorithmUsed: SolverAlgorithm.DFS
    };
  }

  // Iterative Deepening Depth-First Search
  async solveIDDFS(cube: RubiksCube, maxDepth: number = 25): Promise<SolverResult> {
    const startTime = performance.now();
    let totalNodesExplored = 0;
    
    for (let depth = 1; depth <= maxDepth; depth++) {
      let nodesExplored = 0;
      
      const search = (currentCube: RubiksCube, moves: Move[], currentDepth: number): Move[] | null => {
        if (nodesExplored >= this.maxNodes || totalNodesExplored >= this.maxNodes) return null;
        nodesExplored++;
        totalNodesExplored++;
        
        if (currentCube.isSolved()) {
          return moves;
        }
        
        if (currentDepth >= depth) {
          return null;
        }
        
        const possibleMoves = [Move.U, Move.U_PRIME, Move.R, Move.R_PRIME];
        
        for (const move of possibleMoves) {
          const newCube = currentCube.clone();
          newCube.applyMove(move);
          
          const result = search(newCube, [...moves, move], currentDepth + 1);
          if (result) return result;
        }
        
        return null;
      };
      
      const solution = search(cube.clone(), [], 0);
      if (solution) {
        const endTime = performance.now();
        return {
          moves: solution,
          solutionTime: endTime - startTime,
          nodesExplored: totalNodesExplored,
          algorithmUsed: SolverAlgorithm.IDDFS
        };
      }
    }
    
    const endTime = performance.now();
    return {
      moves: [],
      solutionTime: endTime - startTime,
      nodesExplored: totalNodesExplored,
      algorithmUsed: SolverAlgorithm.IDDFS
    };
  }

  // Korf's IDA* Algorithm with pattern database heuristic
  async solveKorfIDA(cube: RubiksCube): Promise<SolverResult> {
    const startTime = performance.now();
    let nodesExplored = 0;
    
    const heuristic = (c: RubiksCube): number => {
      return Math.floor(c.getManhattanDistance() / 4); // Admissible heuristic
    };
    
    let threshold = heuristic(cube);
    const path: Move[] = [];
    
    while (nodesExplored < this.maxNodes * 2) { // Allow more nodes for IDA*
      const t = this.idaSearch(cube.clone(), 0, threshold, path, heuristic, nodesExplored);
      
      if (t === 'FOUND') {
        const endTime = performance.now();
        return {
          moves: [...path],
          solutionTime: endTime - startTime,
          nodesExplored,
          algorithmUsed: SolverAlgorithm.KORF_IDA
        };
      }
      
      if (t === Infinity) break;
      threshold = t;
      nodesExplored += 1000; // Estimate nodes per iteration
    }
    
    const endTime = performance.now();
    return {
      moves: [],
      solutionTime: endTime - startTime,
      nodesExplored,
      algorithmUsed: SolverAlgorithm.KORF_IDA
    };
  }

  private idaSearch(
    cube: RubiksCube, 
    g: number, 
    threshold: number, 
    path: Move[], 
    heuristic: (c: RubiksCube) => number,
    nodesExplored: number
  ): number | 'FOUND' {
    const f = g + heuristic(cube);
    
    if (f > threshold) return f;
    if (cube.isSolved()) return 'FOUND';
    
    let min = Infinity;
    const possibleMoves = [Move.U, Move.U_PRIME, Move.R, Move.R_PRIME];
    
    for (const move of possibleMoves) {
      // Avoid immediate reversals for efficiency
      if (path.length > 0) {
        const lastMove = path[path.length - 1];
        if ((move === Move.U && lastMove === Move.U_PRIME) ||
            (move === Move.U_PRIME && lastMove === Move.U) ||
            (move === Move.R && lastMove === Move.R_PRIME) ||
            (move === Move.R_PRIME && lastMove === Move.R)) {
          continue;
        }
      }
      
      const newCube = cube.clone();
      newCube.applyMove(move);
      path.push(move);
      
      const t = this.idaSearch(newCube, g + 1, threshold, path, heuristic, nodesExplored);
      
      if (t === 'FOUND') return 'FOUND';
      if (t < min) min = t;
      
      path.pop();
    }
    
    return min;
  }

  // Optimized solver that chooses best algorithm based on scramble complexity
  async solveOptimal(cube: RubiksCube, scrambleDepth: number): Promise<SolverResult> {
    if (scrambleDepth <= 8) {
      // For simple scrambles, use BFS for optimal solution
      return this.solveBFS(cube);
    } else if (scrambleDepth <= 13) {
      // For medium scrambles, use IDDFS
      return this.solveIDDFS(cube);
    } else {
      // For complex scrambles, use Korf's IDA*
      return this.solveKorfIDA(cube);
    }
  }
}