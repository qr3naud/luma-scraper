
import React from 'react';

interface RotatingWordsProps {
  words: string[];
  baseClassName?: string;
}

const RotatingWords: React.FC<RotatingWordsProps> = ({ 
  words,
  baseClassName = "inline-block overflow-hidden relative h-[1.5em] align-bottom"
}) => {
  return (
    <span className={baseClassName}>
      {words.map((word, index) => {
        // Calculate unique delay class for each word based on index
        const delayClass = index === 0 
          ? 'animate-rotate-words' 
          : `animate-rotate-words-delay-${index}`;
        
        // Apply custom gradient for each word
        return (
          <span 
            key={word} 
            className={`absolute left-0 right-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 ${delayClass}`}
            style={{ 
              opacity: 0, 
              transform: 'translateY(0)' 
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

export default RotatingWords;
