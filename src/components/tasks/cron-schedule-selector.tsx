"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clock, CalendarDays, CalendarClock } from "lucide-react";

interface CronScheduleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const scheduleOptions = [
  {
    label: "Every minute",
    value: "* * * * *",
    description: "Task runs every minute of every hour",
    icon: Clock,
  },
  {
    label: "Every hour",
    value: "0 * * * *",
    description: "Task runs at the start of every hour",
    icon: Clock,
  },
  {
    label: "Every day at midnight",
    value: "0 0 * * *",
    description: "Task runs once per day at 12:00 AM",
    icon: CalendarDays,
  },
  {
    label: "Every week on Sunday",
    value: "0 0 * * 0",
    description: "Task runs weekly on Sunday at 12:00 AM",
    icon: CalendarDays,
  },
  {
    label: "Every month on the 1st",
    value: "0 0 1 * *",
    description: "Task runs monthly on the 1st at 12:00 AM",
    icon: CalendarClock,
  },
];

export function CronScheduleSelector({
  value,
  onChange,
}: CronScheduleSelectorProps) {
  const [selectedSchedule, setSelectedSchedule] = useState(
    value || scheduleOptions[0].value
  );

  useEffect(() => {
    if (value && value !== selectedSchedule) {
      setSelectedSchedule(value);
    }
  }, [value, selectedSchedule]);

  const handleScheduleChange = (newValue: string) => {
    setSelectedSchedule(newValue);
    onChange(newValue);
  };

  const selectedOption = scheduleOptions.find(
    (option) => option.value === selectedSchedule
  );

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Schedule Frequency</Label>
      <Select value={selectedSchedule} onValueChange={handleScheduleChange}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue>
            <div className="flex items-center space-x-2">
              {selectedOption && (
                <>
                  <selectedOption.icon className="h-4 w-4" />
                  <span>{selectedOption.label}</span>
                </>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {scheduleOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="py-3"
            >
              <div className="flex items-start space-x-3">
                <option.icon className="h-5 w-5" />
                <div className="space-y-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs">{option.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
