import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Attendee } from "@/types/attendee";

interface WhyMeetSectionProps {
  attendees: Attendee[];
}

const WhyMeetSection: React.FC<WhyMeetSectionProps> = ({ attendees }) => {
  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-bold text-[#111827]">Why Meet These People?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attendees.map((attendee, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#111827]">{attendee.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#6B7280]">{attendee.whyMeet}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WhyMeetSection;
