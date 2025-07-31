import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SolverAlgorithm, SolverResult, AlgorithmStats } from '@/types/cube';
import { Play, Square, RotateCcw, Zap, TrendingUp } from 'lucide-react';

interface AlgorithmPanelProps {
  onSolve: (algorithm: SolverAlgorithm) => Promise<void>;
  isLoading: boolean;
  currentResult?: SolverResult;
  stats: AlgorithmStats[];
}

export function AlgorithmPanel({ onSolve, isLoading, currentResult, stats }: AlgorithmPanelProps) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SolverAlgorithm>(SolverAlgorithm.BFS);

  const algorithms = [
    {
      name: SolverAlgorithm.BFS,
      icon: Play,
      description: 'Breadth-First Search - Optimal for 8 scrambles',
      color: 'text-primary',
      expectedTime: '< 3s for 8 moves'
    },
    {
      name: SolverAlgorithm.DFS,
      icon: Square,
      description: 'Depth-First Search - Fast but not always optimal',
      color: 'text-accent',
      expectedTime: '< 2s variable depth'
    },
    {
      name: SolverAlgorithm.IDDFS,
      icon: RotateCcw,
      description: 'Iterative Deepening - Good balance',
      color: 'text-secondary',
      expectedTime: '< 3s for moderate scrambles'
    },
    {
      name: SolverAlgorithm.KORF_IDA,
      icon: Zap,
      description: "Korf's IDA* - Advanced heuristic solver",
      color: 'text-yellow-400',
      expectedTime: '< 10s for 13 moves'
    }
  ];

  const handleSolve = async (algorithm: SolverAlgorithm) => {
    setSelectedAlgorithm(algorithm);
    await onSolve(algorithm);
  };

  const getAlgorithmStats = (algorithm: SolverAlgorithm) => {
    return stats.find(s => s.name === algorithm);
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card className="bg-card border-border neon-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <TrendingUp className="w-5 h-5 text-primary" />
          Solving Algorithms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {algorithms.map((algorithm) => {
            const Icon = algorithm.icon;
            const algorithmStats = getAlgorithmStats(algorithm.name);
            const isSelected = selectedAlgorithm === algorithm.name;
            
            return (
              <div
                key={algorithm.name}
                className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-primary bg-primary/10 neon-glow' 
                    : 'border-border bg-secondary/50 hover:border-primary/50'
                }`}
                onClick={() => setSelectedAlgorithm(algorithm.name)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${algorithm.color}`} />
                  <span className="font-medium text-sm">{algorithm.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {algorithm.description}
                </p>
                <p className="text-xs text-accent mb-2">
                  {algorithm.expectedTime}
                </p>
                
                {algorithmStats && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Avg Time:</span>
                      <Badge variant="outline" className="text-xs">
                        {formatTime(algorithmStats.avgTime)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Success Rate:</span>
                      <Badge 
                        variant={algorithmStats.successRate > 80 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {algorithmStats.successRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => handleSolve(selectedAlgorithm)}
          disabled={isLoading}
          variant="neon"
          size="lg"
          className="w-full animate-pulse-neon"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-transparent border-t-current rounded-full" />
              Solving with {selectedAlgorithm}...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Solve with {selectedAlgorithm}
            </>
          )}
        </Button>

        {currentResult && (
          <Card className="bg-secondary/50 border-accent/30">
            <CardContent className="p-4">
              <h4 className="font-medium text-accent mb-2">Latest Solution</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Algorithm:</span>
                  <Badge className="ml-2">{currentResult.algorithmUsed}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <Badge variant="outline" className="ml-2">
                    {formatTime(currentResult.solutionTime)}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Moves:</span>
                  <Badge variant="secondary" className="ml-2">
                    {currentResult.moves.length}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Nodes:</span>
                  <Badge variant="outline" className="ml-2">
                    {currentResult.nodesExplored.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}