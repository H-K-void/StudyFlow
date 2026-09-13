import React, { useState } from 'react';
import { Flashcard } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());

  if (!flashcards || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setReviewedCards((prev) => new Set(prev).add(currentIndex));
  };

  return (
    <div className="bg-surface-secondary border border-border rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-bold text-text-primary">
            Interactive Flashcard Recall
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            {currentIndex + 1} / {flashcards.length}
          </Badge>
          <span className="text-xs text-text-muted">
            ({reviewedCards.size} reviewed)
          </span>
        </div>
      </div>

      {/* 3D Flashcard Flip Container */}
      <div
        onClick={handleFlip}
        className="relative h-48 sm:h-52 w-full cursor-pointer select-none perspective group"
      >
        <div
          className={cn(
            'w-full h-full rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between shadow-subtle',
            isFlipped
              ? 'bg-brand/20 text-text-primary border-brand/50'
              : 'bg-surface text-text-primary border-border hover:border-brand'
          )}
        >
          {/* Card Category Header */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'text-[11px] font-bold uppercase tracking-wider',
                isFlipped ? 'text-brand' : 'text-text-muted'
              )}
            >
              {currentCard.category}
            </span>
            <span
              className={cn(
                'text-xs flex items-center gap-1 font-medium',
                isFlipped ? 'text-brand' : 'text-text-muted'
              )}
            >
              <RotateCw className="w-3 h-3" />
              {isFlipped ? 'Answer Revealed' : 'Click to Flip'}
            </span>
          </div>

          {/* Card Content */}
          <div className="text-center px-2">
            <p
              className={cn(
                'text-sm sm:text-base font-semibold leading-relaxed',
                isFlipped ? 'text-text-primary' : 'text-text-primary'
              )}
            >
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>

          {/* Bottom helper */}
          <div className="text-center">
            <span
              className={cn(
                'text-[10px] uppercase font-bold tracking-widest',
                isFlipped ? 'text-brand' : 'text-brand'
              )}
            >
              {isFlipped ? 'Definition / Explanation' : 'Prompt / Question'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleFlip}
          leftIcon={<RotateCw className="w-3.5 h-3.5" />}
        >
          {isFlipped ? 'Show Front' : 'Flip Card'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next Card
        </Button>
      </div>
    </div>
  );
};
