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
import { Input } from "@/components/ui/input";

interface ScheduleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

type FrequencyType = "once" | "hourly" | "daily" | "weekly" | "monthly" | "custom";

interface ScheduleConfig {
  frequency: FrequencyType;
  hour?: number;
  minute?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export function ScheduleSelector({ value, onChange }: ScheduleSelectorProps) {
  const [config, setConfig] = useState<ScheduleConfig>(() => parseCronExpression(value));

  // Only update the internal config when the external value changes
  useEffect(() => {
    setConfig(parseCronExpression(value));
  }, [value]);

  const updateConfig = (newConfig: Partial<ScheduleConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    // Generate and propagate the new cron expression
    const cronExpression = generateCronExpression(updatedConfig);
    onChange(cronExpression);
  };

  const handleFrequencyChange = (frequency: FrequencyType) => {
    const newConfig = {
      ...config,
      frequency,
      // Reset other values based on frequency
      hour: frequency === "once" ? undefined : config.hour,
      minute: frequency === "once" ? undefined : config.minute,
      dayOfWeek: ["weekly"].includes(frequency) ? config.dayOfWeek : undefined,
      dayOfMonth: ["monthly"].includes(frequency) ? config.dayOfMonth : undefined,
    };
    updateConfig(newConfig);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Frequency</Label>
        <Select
          value={config.frequency}
          onValueChange={(value: FrequencyType) => handleFrequencyChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">Once</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.frequency !== "once" && config.frequency !== "hourly" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Hour (0-23)</Label>
            <Input
              type="number"
              min={0}
              max={23}
              value={config.hour ?? 0}
              onChange={(e) =>
                updateConfig({ hour: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <Label>Minute (0-59)</Label>
            <Input
              type="number"
              min={0}
              max={59}
              value={config.minute ?? 0}
              onChange={(e) =>
                updateConfig({ minute: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      )}

      {config.frequency === "weekly" && (
        <div>
          <Label>Day of Week</Label>
          <Select
            value={String(config.dayOfWeek ?? 0)}
            onValueChange={(value) =>
              updateConfig({ dayOfWeek: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Sunday</SelectItem>
              <SelectItem value="1">Monday</SelectItem>
              <SelectItem value="2">Tuesday</SelectItem>
              <SelectItem value="3">Wednesday</SelectItem>
              <SelectItem value="4">Thursday</SelectItem>
              <SelectItem value="5">Friday</SelectItem>
              <SelectItem value="6">Saturday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {config.frequency === "monthly" && (
        <div>
          <Label>Day of Month (1-31)</Label>
          <Input
            type="number"
            min={1}
            max={31}
            value={config.dayOfMonth ?? 1}
            onChange={(e) =>
              updateConfig({ dayOfMonth: parseInt(e.target.value) || 1 })
            }
          />
        </div>
      )}

      {config.frequency === "custom" && (
        <div>
          <Label>Custom Cron Expression</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="* * * * *"
          />
        </div>
      )}
    </div>
  );
}

function parseCronExpression(cronExpression: string): ScheduleConfig {
  if (!cronExpression) {
    return { frequency: "daily", hour: 0, minute: 0 };
  }

  const parts = cronExpression.split(" ");
  if (parts.length !== 5) {
    return { frequency: "daily", hour: 0, minute: 0 };
  }

  const [minute, hour, dayOfMonth, , dayOfWeek] = parts;

  // Default to custom if the expression doesn't match any predefined pattern
  let frequency: FrequencyType = "custom";
  let config: ScheduleConfig = { frequency };

  if (minute === "*" && hour === "*") {
    frequency = "hourly";
  } else if (dayOfMonth === "*" && dayOfWeek === "*") {
    frequency = "daily";
    config = {
      frequency,
      hour: parseInt(hour),
      minute: parseInt(minute),
    };
  } else if (dayOfMonth === "*" && dayOfWeek !== "*") {
    frequency = "weekly";
    config = {
      frequency,
      hour: parseInt(hour),
      minute: parseInt(minute),
      dayOfWeek: parseInt(dayOfWeek),
    };
  } else if (dayOfMonth !== "*" && dayOfWeek === "*") {
    frequency = "monthly";
    config = {
      frequency,
      hour: parseInt(hour),
      minute: parseInt(minute),
      dayOfMonth: parseInt(dayOfMonth),
    };
  }

  return config;
}

function generateCronExpression(config: ScheduleConfig): string {
  switch (config.frequency) {
    case "once":
      return "0 0 1 1 *"; // Will run once at the next occurrence
    case "hourly":
      return "0 * * * *";
    case "daily":
      return `${config.minute ?? 0} ${config.hour ?? 0} * * *`;
    case "weekly":
      return `${config.minute ?? 0} ${config.hour ?? 0} * * ${config.dayOfWeek ?? 0}`;
    case "monthly":
      return `${config.minute ?? 0} ${config.hour ?? 0} ${config.dayOfMonth ?? 1} * *`;
    case "custom":
    default:
      return "* * * * *";
  }
}
