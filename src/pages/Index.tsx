import { useState, useCallback } from 'react';
import { RubiksCube3D } from '@/components/cube/RubiksCube3D';
import { SimpleCube3D } from '@/components/cube/SimpleCube3D';
import { AlgorithmPanel } from '@/components/solver/AlgorithmPanel';
import { GameControls } from '@/components/game/GameControls';
import { RubiksCube } from '@/utils/cubeModel';
import { RubiksSolver } from '@/utils/solverAlgorithms';
import { SolverAlgorithm, SolverResult, AlgorithmStats } from '@/types/cube';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Cpu, Zap, Trophy, Brain } from 'lucide-react';

const Index = () => {
  const [cube, setCube] = useState(() => new RubiksCube());
  const [solver] = useState(() => new RubiksSolver());
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<SolverResult | undefined>();
  const [scrambleCount, setScrambleCount] = useState(0);
  const [gameMode, setGameMode] = useState<'practice' | 'challenge' | 'speedrun'>('practice');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [stats, setStats] = useState<AlgorithmStats[]>([
    { name: SolverAlgorithm.BFS, avgTime: 0, bestTime: Infinity, worstTime: 0, successRate: 0, totalSolves: 0 },
    { name: SolverAlgorithm.DFS, avgTime: 0, bestTime: Infinity, worstTime: 0, successRate: 0, totalSolves: 0 },
    { name: SolverAlgorithm.IDDFS, avgTime: 0, bestTime: Infinity, worstTime: 0, successRate: 0, totalSolves: 0 },
    { name: SolverAlgorithm.KORF_IDA, avgTime: 0, bestTime: Infinity, worstTime: 0, successRate: 0, totalSolves: 0 }
  ]);
  const [bestTimes, setBestTimes] = useState<{ [key: string]: number }>({});

  const updateStats = useCallback((result: SolverResult) => {
    setStats(prevStats => {
      return prevStats.map(stat => {
        if (stat.name === result.algorithmUsed) {
          const newTotalSolves = stat.totalSolves + 1;
          const newAvgTime = (stat.avgTime * stat.totalSolves + result.solutionTime) / newTotalSolves;
          const newBestTime = Math.min(stat.bestTime, result.solutionTime);
          const newWorstTime = Math.max(stat.worstTime, result.solutionTime);
          const successRate = result.moves.length > 0 ? 
            ((stat.successRate * stat.totalSolves + 100) / newTotalSolves) :
            ((stat.successRate * stat.totalSolves) / newTotalSolves);

          return {
            ...stat,
            avgTime: newAvgTime,
            bestTime: newBestTime,
            worstTime: newWorstTime,
            successRate,
            totalSolves: newTotalSolves
          };
        }
        return stat;
      });
    });

    if (result.moves.length > 0) {
      setBestTimes(prev => ({
        ...prev,
        [result.algorithmUsed]: Math.min(prev[result.algorithmUsed] || Infinity, result.solutionTime)
      }));
    }
  }, []);

  const handleScramble = useCallback((moves: number) => {
    const newCube = new RubiksCube();
    const scrambleMoves = newCube.scramble(moves);
    setCube(newCube);
    setScrambleCount(moves);
    setCurrentResult(undefined);
    
    toast(`Cube scrambled with ${moves} moves!`, {
      description: "Ready to solve with your chosen algorithm",
      duration: 2000,
    });
  }, []);

  const handleReset = useCallback(() => {
    const newCube = new RubiksCube();
    setCube(newCube);
    setScrambleCount(0);
    setCurrentResult(undefined);
    
    toast("Cube reset to solved state", {
      description: "Ready for a new challenge!",
      duration: 2000,
    });
  }, []);

  const handleSolve = useCallback(async (algorithm: SolverAlgorithm) => {
    if (cube.isSolved()) {
      toast("Cube is already solved!", {
        description: "Try scrambling it first",
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    setIsAutoRotating(false);
    
    try {
      let result: SolverResult;
      
      toast(`Starting ${algorithm} solver...`, {
        description: "This may take a few moments",
        duration: 1000,
      });

      switch (algorithm) {
        case SolverAlgorithm.BFS:
          result = await solver.solveBFS(cube);
          break;
        case SolverAlgorithm.DFS:
          result = await solver.solveDFS(cube);
          break;
        case SolverAlgorithm.IDDFS:
          result = await solver.solveIDDFS(cube);
          break;
        case SolverAlgorithm.KORF_IDA:
          result = await solver.solveKorfIDA(cube);
          break;
        default:
          throw new Error(`Unknown algorithm: ${algorithm}`);
      }

      if (result.moves.length > 0) {
        // Apply the solution to show the solved cube
        const solvedCube = cube.clone();
        solvedCube.applyMoves(result.moves);
        setCube(solvedCube);
        
        toast(`Solved in ${(result.solutionTime / 1000).toFixed(2)}s!`, {
          description: `${result.moves.length} moves, ${result.nodesExplored.toLocaleString()} nodes explored`,
          duration: 5000,
        });
      } else {
        toast("No solution found", {
          description: "Try a simpler scramble or different algorithm",
          duration: 3000,
        });
      }

      setCurrentResult(result);
      updateStats(result);
      
    } catch (error) {
      console.error('Solving error:', error);
      toast("Solving failed", {
        description: "An error occurred while solving the cube",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setIsAutoRotating(true);
    }
  }, [cube, solver, updateStats]);

  const handleCubeClick = useCallback(() => {
    setIsAutoRotating(!isAutoRotating);
  }, [isAutoRotating]);

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 neon-glow">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Rubik's Cube Solver
                </h1>
                <p className="text-sm text-muted-foreground">
                  Advanced algorithms • Real-time 3D visualization • Gaming features
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="neon-glow">
                <Brain className="w-3 h-3 mr-1" />
                Korf's IDA*
              </Badge>
              <Badge variant="outline" className="neon-glow">
                <Zap className="w-3 h-3 mr-1" />
                &lt; 10s target
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Game Controls */}
          <div className="lg:col-span-1 space-y-6">
            <GameControls
              onScramble={handleScramble}
              onReset={handleReset}
              isLoading={isLoading}
              isSolved={cube.isSolved()}
              scrambleCount={scrambleCount}
              gameMode={gameMode}
              onGameModeChange={setGameMode}
              bestTimes={bestTimes}
            />
            
            {/* Performance Stats */}
            <Card className="bg-card border-border neon-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.filter(s => s.totalSolves > 0).map(stat => (
                    <div key={stat.name} className="p-3 rounded-lg bg-secondary/50 border border-accent/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{stat.name}</span>
                        <Badge variant="outline">
                          {stat.totalSolves} solves
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Avg:</span>
                          <span className="ml-1 text-accent">
                            {(stat.avgTime / 1000).toFixed(2)}s
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Best:</span>
                          <span className="ml-1 text-primary">
                            {(stat.bestTime / 1000).toFixed(2)}s
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - 3D Cube */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border neon-glow h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <span>3D Cube Visualization</span>
                  <div className="flex items-center gap-2">
                    {cube.isSolved() && (
                      <Badge className="animate-pulse-neon">
                        <Trophy className="w-3 h-3 mr-1" />
                        Solved!
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCubeClick}
                      className="text-xs"
                    >
                      {isAutoRotating ? 'Stop Rotation' : 'Auto Rotate'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[500px]">
                {/* Temporarily use SimpleCube3D for debugging */}
                <div className="p-4">
                  <SimpleCube3D />
                </div>
                {/* Original cube - currently debugging
                <RubiksCube3D
                  cube={cube}
                  isAnimating={isAutoRotating}
                  onCubeClick={handleCubeClick}
                />
                */}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Algorithm Controls */}
          <div className="lg:col-span-1">
            <AlgorithmPanel
              onSolve={handleSolve}
              isLoading={isLoading}
              currentResult={currentResult}
              stats={stats}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border neon-glow">
            <div className="text-sm text-muted-foreground">
              <span className="text-accent font-medium">BFS/DFS/IDDFS:</span> Target &lt; 3s for 8 scrambles
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">Korf's IDA*:</span> Target &lt; 10s for 13 scrambles
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;