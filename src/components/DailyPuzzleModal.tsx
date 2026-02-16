"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, RefreshCw, CheckCircle2, Calculator, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MEMORY_ICONS = ["💻", "🚀", "🧠", "📚", "⚡", "🎓", "🔍", "🏆"];
const WORD_LIST = ["STUDY", "BRAIN", "LOGIC", "LEARN", "SMART", "QUEST", "SKILL", "WRITE"];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface DailyPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function DailyPuzzleModal({ isOpen, onClose, onComplete }: DailyPuzzleModalProps) {
  // Determine puzzle type based on the day of the week
  const puzzleType = useMemo(() => {
    const day = new Date().getDay(); // 0-6
    if (day % 3 === 0) return 'memory';
    if (day % 3 === 1) return 'math';
    return 'word';
  }, []);

  // Shared state
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);

  // Memory game state
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  // Math game state
  const [mathProblem, setMathProblem] = useState({ q: "", a: 0 });
  const [userAnswer, setUserAnswer] = useState("");

  // Word game state
  const [scrambledWord, setScrambledWord] = useState({ original: "", scrambled: "" });
  const [wordGuess, setWordGuess] = useState("");

  const initializeGame = useCallback(() => {
    setIsWon(false);
    setMoves(0);
    setUserAnswer("");
    setWordGuess("");

    if (puzzleType === 'memory') {
      const gameIcons = [...MEMORY_ICONS, ...MEMORY_ICONS];
      const shuffledIcons = gameIcons.sort(() => Math.random() - 0.5);
      setCards(shuffledIcons.map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false
      })));
      setFlippedCards([]);
    } else if (puzzleType === 'math') {
      const a = Math.floor(Math.random() * 20) + 10;
      const b = Math.floor(Math.random() * 20) + 5;
      const op = Math.random() > 0.5 ? '+' : '-';
      setMathProblem({
        q: `${a} ${op} ${b}`,
        a: op === '+' ? a + b : a - b
      });
    } else if (puzzleType === 'word') {
      const original = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
      const scrambled = original.split('').sort(() => Math.random() - 0.5).join('');
      setScrambledWord({ original, scrambled });
    }
  }, [puzzleType]);

  useEffect(() => {
    if (isOpen) {
      initializeGame();
    }
  }, [isOpen, initializeGame]);

  const handleMemoryClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched || isWon) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlippedCards;

      if (cards[firstId].icon === cards[secondId].icon) {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true } 
              : card
          ));
          setFlippedCards([]);
          setCards(current => {
            if (current.every(c => (c.id === firstId || c.id === secondId) ? true : c.isMatched)) {
              setIsWon(true);
            }
            return current;
          });
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer) === mathProblem.a) {
      setIsWon(true);
    } else {
      setMoves(m => m + 1);
      setUserAnswer("");
    }
  };

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wordGuess.toUpperCase() === scrambledWord.original) {
      setIsWon(true);
    } else {
      setMoves(m => m + 1);
      setWordGuess("");
    }
  };

  const renderPuzzle = () => {
    if (isWon) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-10 text-center space-y-6"
        >
          <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center border border-emerald-500/20 shadow-2xl">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black uppercase tracking-tight text-foreground">Solved!</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              {puzzleType === 'memory' ? `Finished in ${moves} moves` : 'Great job!'}
            </p>
          </div>
          <Button 
            onClick={onComplete}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:shadow-emerald-500/20 transition-all duration-500"
          >
            Claim My Rewards
          </Button>
        </motion.div>
      );
    }

    switch (puzzleType) {
      case 'memory':
        return (
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMemoryClick(card.id)}
                className={`aspect-square rounded-xl cursor-pointer flex items-center justify-center text-3xl transition-all duration-500 relative preserve-3d ${
                  card.isFlipped || card.isMatched 
                    ? 'bg-primary/20 border-primary/40' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                } border shadow-lg`}
              >
                <AnimatePresence mode="wait">
                  {(card.isFlipped || card.isMatched) ? (
                    <motion.span
                      key="icon"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                    >
                      {card.icon}
                    </motion.span>
                  ) : (
                    <motion.div key="back" className="text-primary/20 font-black text-lg">?</motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        );

      case 'math':
        return (
          <form onSubmit={handleMathSubmit} className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Solve this equation</p>
              <h2 className="text-5xl font-black tracking-tighter text-primary">{mathProblem.q} = ?</h2>
            </div>
            <input
              autoFocus
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl font-black focus:outline-none focus:ring-2 ring-primary/50 transition-all"
              placeholder="?"
            />
            <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px]">
              Check Answer
            </Button>
          </form>
        );

      case 'word':
        return (
          <form onSubmit={handleWordSubmit} className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Unscramble the word</p>
              <h2 className="text-4xl font-black tracking-widest text-primary uppercase">{scrambledWord.scrambled}</h2>
            </div>
            <input
              autoFocus
              type="text"
              value={wordGuess}
              onChange={(e) => setWordGuess(e.target.value.toUpperCase())}
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl font-black focus:outline-none focus:ring-2 ring-primary/50 transition-all uppercase"
              placeholder="WORD"
            />
            <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px]">
              Check Word
            </Button>
          </form>
        );
    }
  };

  const getHeaderIcon = () => {
    if (puzzleType === 'math') return <Calculator className="h-6 w-6" />;
    if (puzzleType === 'word') return <Type className="h-6 w-6" />;
    return <Brain className="h-6 w-6" />;
  };

  const getHeaderTitle = () => {
    if (puzzleType === 'math') return "Math Challenge";
    if (puzzleType === 'word') return "Word Unscramble";
    return "Memory Match";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card/95 backdrop-blur-2xl border-white/10 rounded-[2rem] p-8">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 text-primary">
              {getHeaderIcon()}
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">{getHeaderTitle()}</DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                Complete the challenge to claim your rewards!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-8 min-h-[300px] flex flex-col justify-center">
          {renderPuzzle()}
        </div>

        {!isWon && (
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                {puzzleType === 'memory' ? `${moves} Moves` : moves > 0 ? `${moves} Failed Attempts` : 'Daily Challenge'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              onClick={initializeGame}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Reset
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
