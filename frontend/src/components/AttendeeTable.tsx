import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Check, Unlock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Attendee } from "@/types/attendee";

interface AttendeeTableProps {
  attendees: Attendee[];
  isUnlocked: boolean;
  handleUnlock: () => void;
  isProcessingPayment: boolean;
  scrapingError: string | null;
}

const AttendeeTable: React.FC<AttendeeTableProps> = ({
  attendees,
  isUnlocked,
  handleUnlock,
  isProcessingPayment,
  scrapingError
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#111827]">Top People to Meet</h2>
        {!isUnlocked && (
          <Button 
            onClick={handleUnlock} 
            disabled={isProcessingPayment} 
            className="bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white flex items-center gap-2 py-6 px-6"
          >
            <Unlock className="h-5 w-5" /> 
            Unlock Insights - $4.99
          </Button>
        )}
        {isUnlocked && (
          <div className="flex items-center text-green-600 font-medium">
            <Check className="mr-2 h-5 w-5" /> Insights Unlocked
          </div>
        )}
      </div>
      
      {scrapingError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Note</h3>
              <p className="text-amber-700 text-sm">{scrapingError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-100">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className={!isUnlocked ? "blur-sm font-semibold" : "font-semibold"}>LinkedIn</TableHead>
              <TableHead className={!isUnlocked ? "blur-sm font-semibold" : "font-semibold"}>Twitter</TableHead>
              <TableHead className={!isUnlocked ? "blur-sm font-semibold" : "font-semibold"}>Instagram</TableHead>
              <TableHead className={!isUnlocked ? "blur-sm font-semibold" : "font-semibold"}>Warpcast</TableHead>
              <TableHead className={!isUnlocked ? "blur-sm font-semibold" : "font-semibold"}>Lead Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendees.map((attendee, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <TableCell className="font-medium">{attendee.name}</TableCell>
                <TableCell className={!isUnlocked ? "blur-sm" : ""}>
                  {attendee.linkedin ? (
                    <a href={attendee.linkedin} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      Profile
                    </a>
                  ) : "—"}
                </TableCell>
                <TableCell className={!isUnlocked ? "blur-sm" : ""}>
                  {attendee.twitter ? (
                    <a href={attendee.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Profile
                    </a>
                  ) : "—"}
                </TableCell>
                <TableCell className={!isUnlocked ? "blur-sm" : ""}>
                  {attendee.instagram ? (
                    <a href={attendee.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                      Profile
                    </a>
                  ) : "—"}
                </TableCell>
                <TableCell className={!isUnlocked ? "blur-sm" : ""}>
                  {attendee.warpcast ? (
                    <a href={attendee.warpcast} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                      Profile
                    </a>
                  ) : "—"}
                </TableCell>
                <TableCell className={!isUnlocked ? "blur-sm" : ""}>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {attendee.leadScore}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttendeeTable;
