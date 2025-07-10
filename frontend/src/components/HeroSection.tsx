
import React from 'react';
import RotatingWords from './RotatingWords';

interface HeroSectionProps {
  rotatingWords: string[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ rotatingWords }) => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-6xl font-bold text-[#111827] tracking-tight mb-4 leading-tight">
        Meet the people who <RotatingWords words={rotatingWords} /> matter.
      </h1>
      <p className="text-lg md:text-xl text-[#6B7280] max-w-3xl mx-auto">
        Paste your Luma link, tell us who you're hoping to meet, and get your top 20 ranked leads — enriched, explained, and ready to connect.
      </p>
    </div>
  );
};

export default HeroSection;
