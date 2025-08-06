import { useState, useCallback, useRef, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Flag, RotateCcw, Cpu, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChessBoardProps {
  gameMode: 'ai' | 'online' | 'local';
  timeControl?: number;
  increment?: number;
  aiEngine?: 'stockfish' | 'leela';
  onGameEnd?: (result: string, moves: string[]) => void;
}

export default function ChessBoard({ 
  gameMode, 
  timeControl = 600, 
  increment = 0, 
  aiEngine = 'stockfish',
  onGameEnd 
}: ChessBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [whiteTime, setWhiteTime] = useState(timeControl);
  const [blackTime, setBlackTime] = useState(timeControl);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'draw' | 'resign'>('playing');
  const [isThinking, setIsThinking] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Timer logic
  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = setInterval(() => {
        if (isWhiteTurn) {
          setWhiteTime(prev => {
            if (prev <= 1) {
              setGameStatus('checkmate');
              onGameEnd?.('black_wins', gameHistory);
              toast({
                title: "Time's up!",
                description: "White ran out of time. Black wins!",
              });
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime(prev => {
            if (prev <= 1) {
              setGameStatus('checkmate');
              onGameEnd?.('white_wins', gameHistory);
              toast({
                title: "Time's up!",
                description: "Black ran out of time. White wins!",
              });
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isWhiteTurn, gameStatus, gameHistory, onGameEnd, toast]);

  // AI move logic (simplified)
  const makeAIMove = useCallback(async () => {
    setIsThinking(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const moves = game.moves();
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move(randomMove);
      
      if (move) {
        setGame(gameCopy);
        setGamePosition(gameCopy.fen());
        setGameHistory(prev => [...prev, move.san]);
        setIsWhiteTurn(!gameCopy.turn());
        
        // Add increment
        setBlackTime(prev => prev + increment);
        
        // Check for game end
        if (gameCopy.isGameOver()) {
          if (gameCopy.isCheckmate()) {
            setGameStatus('checkmate');
            const winner = gameCopy.turn() === 'w' ? 'black_wins' : 'white_wins';
            onGameEnd?.(winner, [...gameHistory, move.san]);
          } else {
            setGameStatus('draw');
            onGameEnd?.('draw', [...gameHistory, move.san]);
          }
        }
      }
    }
    
    setIsThinking(false);
  }, [game, gameHistory, increment, onGameEnd]);

  // Handle piece drop
  const onDrop = useCallback((sourceSquare: Square, targetSquare: Square) => {
    if (gameStatus !== 'playing') return false;
    if (gameMode === 'ai' && !isWhiteTurn) return false; // Prevent user moves during AI turn
    
    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for simplicity
      });
      
      if (move) {
        setGame(gameCopy);
        setGamePosition(gameCopy.fen());
        setGameHistory(prev => [...prev, move.san]);
        setIsWhiteTurn(!gameCopy.turn());
        
        // Add increment
        if (isWhiteTurn) {
          setWhiteTime(prev => prev + increment);
        } else {
          setBlackTime(prev => prev + increment);
        }
        
        // Check for game end
        if (gameCopy.isGameOver()) {
          if (gameCopy.isCheckmate()) {
            setGameStatus('checkmate');
            const winner = gameCopy.turn() === 'w' ? 'black_wins' : 'white_wins';
            onGameEnd?.(winner, [...gameHistory, move.san]);
            toast({
              title: "Checkmate!",
              description: `${winner.split('_')[0]} wins!`,
            });
          } else {
            setGameStatus('draw');
            onGameEnd?.('draw', [...gameHistory, move.san]);
            toast({
              title: "Draw!",
              description: "The game ended in a draw.",
            });
          }
        }
        
        // Make AI move if in AI mode
        if (gameMode === 'ai' && !gameCopy.isGameOver()) {
          setTimeout(makeAIMove, 500);
        }
        
        return true;
      }
    } catch (error) {
      return false;
    }
    
    return false;
  }, [game, gameStatus, gameMode, isWhiteTurn, gameHistory, increment, onGameEnd, makeAIMove, toast]);

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGamePosition(newGame.fen());
    setGameHistory([]);
    setWhiteTime(timeControl);
    setBlackTime(timeControl);
    setIsWhiteTurn(true);
    setGameStatus('playing');
    setIsThinking(false);
  };

  const resign = () => {
    setGameStatus('resign');
    const winner = isWhiteTurn ? 'black_wins' : 'white_wins';
    onGameEnd?.(winner, gameHistory);
    toast({
      title: "Resignation",
      description: `${isWhiteTurn ? 'White' : 'Black'} resigned. ${winner.split('_')[0]} wins!`,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto p-4">
      {/* Chess Board */}
      <div className="flex-1 max-w-2xl">
        <Card className="chess-board overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {gameMode === 'ai' ? (
                  <>
                    <Cpu className="h-5 w-5" />
                    vs {aiEngine === 'stockfish' ? 'Stockfish' : 'Leela Chess Zero'}
                  </>
                ) : gameMode === 'online' ? (
                  <>
                    <Users className="h-5 w-5" />
                    Online Match
                  </>
                ) : (
                  'Local Game'
                )}
              </CardTitle>
              <Badge variant={gameStatus === 'playing' ? 'default' : 'secondary'}>
                {gameStatus === 'playing' ? 'In Progress' : 
                 gameStatus === 'checkmate' ? 'Checkmate' :
                 gameStatus === 'draw' ? 'Draw' : 'Resigned'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Black timer */}
            <div className="flex items-center justify-between p-4 bg-muted">
              <span className="font-semibold">Black</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono text-lg ${!isWhiteTurn && gameStatus === 'playing' ? 'text-destructive font-bold' : ''}`}>  
                  {formatTime(blackTime)}
                </span>
              </div>
            </div>
            
            {/* Chess board */}
            <div className="relative">
              <Chessboard
                fen={gamePosition}
                onPieceDrop={onDrop}
                boardWidth={Math.min(600, window.innerWidth - 40)}
                customBoardStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              />
              
              {isThinking && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* White timer */}
            <div className="flex items-center justify-between p-4 bg-muted">
              <span className="font-semibold">White</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono text-lg ${isWhiteTurn && gameStatus === 'playing' ? 'text-destructive font-bold' : ''}`}>  
                  {formatTime(whiteTime)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Game controls */}
        <div className="flex gap-2 mt-4">
          <Button onClick={resetGame} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            New Game
          </Button>
          {gameStatus === 'playing' && (
            <Button onClick={resign} variant="destructive" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Resign
            </Button>
          )}
        </div>
      </div>
      
      {/* Game info sidebar */}
      <div className="w-full lg:w-80">
        <Card>
          <CardHeader>
            <CardTitle>Game History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {gameHistory.length === 0 ? (
                <p className="text-muted-foreground">No moves yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-1 text-sm">
                  {gameHistory.map((move, index) => (
                    <div key={index} className={`p-1 rounded ${index % 2 === 0 ? 'bg-muted' : ''}`}>  
                      <span className="text-muted-foreground mr-2">
                        {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}
                      </span>
                      {move}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}