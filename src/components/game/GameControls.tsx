import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shuffle, 
  RotateCcw, 
  Timer, 
  Trophy, 
  Target,
  Gamepad2,
  Settings
} from 'lucide-react';

interface GameControlsProps {
  onScramble: (moves: number) => void;
  onReset: () => void;
  isLoading: boolean;
  isSolved: boolean;
  scrambleCount: number;
  gameMode: 'practice' | 'challenge' | 'speedrun';
  onGameModeChange: (mode: 'practice' | 'challenge' | 'speedrun') => void;
  bestTimes: { [key: string]: number };
}

export function GameControls({
  onScramble,
  onReset,
  isLoading,
  isSolved,
  scrambleCount,
  gameMode,
  onGameModeChange,
  bestTimes
}: GameControlsProps) {
  const [customMoves, setCustomMoves] = useState(20);

  const gameModes = [
    {
      id: 'practice' as const,
      name: 'Practice',
      icon: Settings,
      description: 'Free practice with custom scrambles',
      color: 'text-primary'
    },
    {
      id: 'challenge' as const,
      name: 'Challenge',
      icon: Target,
      description: 'Solve specific difficulty levels',
      color: 'text-accent'
    },
    {
      id: 'speedrun' as const,
      name: 'Speedrun',
      icon: Timer,
      description: 'Beat your best times',
      color: 'text-yellow-400'
    }
  ];

  const quickScrambles = [
    { moves: 8, label: 'Easy', time: '3s', color: 'bg-green-500' },
    { moves: 13, label: 'Medium', time: '10s', color: 'bg-yellow-500' },
    { moves: 20, label: 'Hard', time: '15s', color: 'bg-orange-500' },
    { moves: 25, label: 'Expert', time: '30s', color: 'bg-red-500' }
  ];

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card className="bg-card border-border neon-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Game Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game Mode Selector */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Game Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {gameModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = gameMode === mode.id;
              
              return (
                <div
                  key={mode.id}
                  className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-primary/10 neon-glow' 
                      : 'border-border bg-secondary/50 hover:border-primary/50'
                  }`}
                  onClick={() => onGameModeChange(mode.id)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className={`w-4 h-4 ${mode.color}`} />
                    <span className="text-xs font-medium">{mode.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Scrambles */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Quick Scrambles</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickScrambles.map((scramble) => (
              <Button
                key={scramble.moves}
                onClick={() => onScramble(scramble.moves)}
                disabled={isLoading}
                variant="solver"
                size="sm"
                className="flex items-center justify-between p-3 h-auto"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${scramble.color}`} />
                  <div className="text-left">
                    <div className="text-sm font-medium">{scramble.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {scramble.moves} moves
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {scramble.time}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Scramble */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Custom Scramble</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={customMoves}
                onChange={(e) => setCustomMoves(parseInt(e.target.value) || 20)}
                min={1}
                max={50}
                className="bg-input border-border"
                placeholder="Number of moves"
              />
            </div>
            <Button
              onClick={() => onScramble(customMoves)}
              disabled={isLoading}
              variant="gaming"
              size="default"
            >
              <Shuffle className="w-4 h-4" />
              Scramble
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-accent/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status</span>
            {isSolved && <Trophy className="w-4 h-4 text-yellow-400" />}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Scramble:</span>
              <Badge className="ml-2">{scrambleCount} moves</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">State:</span>
              <Badge 
                variant={isSolved ? "default" : "secondary"}
                className="ml-2"
              >
                {isSolved ? 'Solved' : 'Scrambled'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Best Times */}
        {Object.keys(bestTimes).length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Best Times
            </Label>
            <div className="space-y-2">
              {Object.entries(bestTimes).map(([algorithm, time]) => (
                <div key={algorithm} className="flex justify-between items-center p-2 rounded bg-secondary/30">
                  <span className="text-sm">{algorithm}</span>
                  <Badge variant="outline">{formatTime(time)}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <Button
          onClick={onReset}
          disabled={isLoading}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Cube
        </Button>
      </CardContent>
    </Card>
  );
}