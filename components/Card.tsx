import React from 'react';
import { CardData } from '../types';

interface CardProps {
  card: CardData;
  onClick: (card: CardData) => void;
  disabled: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick(card);
    }
  };

  return (
    <div 
      className="relative w-full aspect-[3/4] perspective-1000 cursor-pointer group"
      onClick={handleClick}
    >
      <div
        className={`w-full h-full transition-transform duration-500 transform-style-3d shadow-xl rounded-xl ${
          card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card (The pink side with Question Mark - visually "front" before flip) */}
        <div
          className="absolute w-full h-full bg-pink-500 rounded-xl backface-hidden flex items-center justify-center border-2 md:border-4 border-white ring-2 md:ring-4 ring-pink-300"
          style={{ transform: 'rotateY(0deg)' }}
        >
           <span className="text-white text-3xl md:text-5xl font-bold drop-shadow-md">?</span>
        </div>

        {/* Back of card (The content side - visually "back" until flipped) */}
        <div
          className={`absolute w-full h-full bg-white rounded-xl backface-hidden flex flex-col items-center justify-center p-2 md:p-4 border-2 md:border-4 ${card.isMatched ? 'border-green-400' : 'border-blue-400'} shadow-inner`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <span className={`text-[10px] md:text-xs uppercase font-bold tracking-widest mb-1 md:mb-2 ${card.lang === 'en' ? 'text-blue-500' : 'text-red-500'}`}>
            {card.lang === 'en' ? 'English' : 'Spanish'}
          </span>
          <span className="text-lg md:text-2xl font-extrabold text-gray-800 text-center break-words w-full leading-tight">
            {card.content}
          </span>
          {card.isMatched && (
             <div className="absolute top-1 right-1 md:top-2 md:right-2 text-green-500">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};