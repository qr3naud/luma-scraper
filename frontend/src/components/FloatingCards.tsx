
import React from 'react';

interface FloatingCard {
  title: string;
  color: string;
  animationClass: string;
  position: string;
}

const FloatingCards: React.FC = () => {
  const cards: FloatingCard[] = [
    { 
      title: "Investor", 
      color: "bg-indigo-100", 
      animationClass: "animate-float", 
      position: "top-20 -left-10 md:left-10"
    },
    { 
      title: "Climate Founder", 
      color: "bg-amber-100", 
      animationClass: "animate-float-delay-1", 
      position: "top-40 -right-4 md:right-20"
    },
    { 
      title: "AI Builder", 
      color: "bg-purple-100", 
      animationClass: "animate-float-delay-2", 
      position: "bottom-32 left-20"
    },
    { 
      title: "Community Leader", 
      color: "bg-blue-100", 
      animationClass: "animate-float", 
      position: "bottom-10 -right-5 md:right-28"
    },
    { 
      title: "Product Designer", 
      color: "bg-rose-100", 
      animationClass: "animate-float-delay-1", 
      position: "top-72 left-10"
    },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`absolute ${card.position} ${card.animationClass} ${card.color} px-4 py-2 rounded-lg shadow-sm opacity-70`}
        >
          <p className="text-sm font-medium text-gray-700">{card.title}</p>
        </div>
      ))}
    </div>
  );
};

export default FloatingCards;
