"use client";

import {
  Button,
  cn,
  type DateValue,
  Divider,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RangeCalendar,
  type RangeValue,
  Select,
  SelectItem,
  type Selection,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  type CalendarDate,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";
import { useAtom } from "jotai";
import { memo, useCallback, useMemo, useState } from "react";

import { analyticsDateRangeAtom } from "@/store/atoms";

interface CalendarDateRange {
  start: CalendarDate;
  end: CalendarDate;
}

// Analytics date range format with string dates
interface AnalyticsDateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  preset?: string;
}

interface GlobalDateRangePickerProps {
  value?: CalendarDateRange;
  onChange?: (range: CalendarDateRange, preset?: string | null) => void;
  onAnalyticsChange?: (range: AnalyticsDateRange) => void;
  onPresetChange?: (preset: string | null) => void;
  mode?: "button" | "select";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  placeholder?: string;
  showCustomRange?: boolean;
  presets?: string[];
  minDate?: CalendarDate;
  maxDate?: CalendarDate;
  selectedPreset?: string | null;
  useGlobalState?: boolean;
}

// Comprehensive date range presets configuration
const DATE_RANGE_PRESETS = {
  today: { key: "today", label: "Today" },
  yesterday: { key: "yesterday", label: "Yesterday" },
  last_7_days: { key: "last_7_days", label: "Last 7 days" },
  last_30_days: { key: "last_30_days", label: "Last 30 days" },
  last_90_days: { key: "last_90_days", label: "Last 90 days" },
  this_month: { key: "this_month", label: "This month" },
  this_year: { key: "this_year", label: "This year" },
  last_month: { key: "last_month", label: "Last month" },
  last_year: { key: "last_year", label: "Last year" },
  lifetime: { key: "lifetime", label: "Lifetime" },
} as const;

// Default presets for different contexts
const DEFAULT_PRESETS = [
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "this_month",
  "last_month",
  "this_year",
  "lifetime",
];

// Helper function to format single date - memoized internally
const formatSingleDate = (date?: CalendarDate): string => {
  if (!date) return "";

  try {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return jsDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date.toString();
  }
};

// Convert CalendarDate to YYYY-MM-DD string
const calendarDateToString = (date: CalendarDate): string => {
  const year = date.year;
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Convert DateRange to AnalyticsDateRange
const toAnalyticsDateRange = (
  range: CalendarDateRange,
  preset?: string | null,
): AnalyticsDateRange => ({
  start: calendarDateToString(range.start),
  end: calendarDateToString(range.end),
  preset: preset || undefined,
});

// Get date range from preset - extracted as pure function for better performance
const getDateRangeFromPreset = (preset: string): CalendarDateRange => {
  try {
    const todayDate = today(getLocalTimeZone());
    const now = new Date();

    switch (preset) {
      case "today":
        return { start: todayDate, end: todayDate };

      case "yesterday": {
        const yesterday = todayDate.subtract({ days: 1 });
        return { start: yesterday, end: yesterday };
      }

      case "last_7_days":
        return {
          start: todayDate.subtract({ days: 6 }),
          end: todayDate,
        };

      case "last_30_days":
        return {
          start: todayDate.subtract({ days: 29 }),
          end: todayDate,
        };

      case "last_90_days":
        return {
          start: todayDate.subtract({ days: 89 }),
          end: todayDate,
        };

      case "this_month": {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const startOfMonth = parseDate(`${year}-${month}-01`);
        return {
          start: startOfMonth,
          end: todayDate,
        };
      }

      case "last_month": {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        const year = lastMonth.getFullYear();
        const month = String(lastMonth.getMonth() + 1).padStart(2, "0");
        const lastDay = new Date(year, lastMonth.getMonth() + 1, 0).getDate();
        const startOfLastMonth = parseDate(`${year}-${month}-01`);
        const endOfLastMonth = parseDate(
          `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
        );
        return {
          start: startOfLastMonth,
          end: endOfLastMonth,
        };
      }

      case "this_year": {
        const year = now.getFullYear();
        const startOfYear = parseDate(`${year}-01-01`);
        return {
          start: startOfYear,
          end: todayDate,
        };
      }

      case "last_year": {
        const lastYear = now.getFullYear() - 1;
        const startOfLastYear = parseDate(`${lastYear}-01-01`);
        const endOfLastYear = parseDate(`${lastYear}-12-31`);
        return {
          start: startOfLastYear,
          end: endOfLastYear,
        };
      }

      case "lifetime": {
        // Limit to 2 years of data for performance
        const twoYearsAgo = todayDate.subtract({ years: 2 });
        return {
          start: twoYearsAgo,
          end: todayDate,
        };
      }

      default:
        // Default to last 30 days
        return {
          start: todayDate.subtract({ days: 29 }),
          end: todayDate,
        };
    }
  } catch {
    // Fallback to last 30 days
    const todayDate = today(getLocalTimeZone());
    return {
      start: todayDate.subtract({ days: 29 }),
      end: todayDate,
    };
  }
};

// Memoized preset button component
const PresetButton = memo(
  ({
    preset,
    isSelected,
    onSelect,
  }: {
    preset: (typeof DATE_RANGE_PRESETS)[keyof typeof DATE_RANGE_PRESETS];
    isSelected: boolean;
    onSelect: (key: string) => void;
  }) => (
    <Button
      key={preset.key}
      className={cn(
        "w-full justify-start text-xs h-8 rounded-md",
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-default-100",
      )}
      size="sm"
      variant="light"
      onPress={() => onSelect(preset.key)}
    >
      {preset.label}
    </Button>
  ),
);

PresetButton.displayName = "PresetButton";

// Memoized calendar content component
const CalendarContent = memo(
  ({
    value,
    onChange,
    onClose,
    onApply,
  }: {
    value?: RangeValue<DateValue>;
    onChange: (range: RangeValue<DateValue>) => void;
    onClose: () => void;
    onApply: () => void;
  }) => (
    <div className="p-4 bg-content1 rounded-r-xl">
      <div className="mb-3">
        <div className="flex gap-3 w-full items-center text-xs">
          <Input
            readOnly
            aria-label="Start date"
            className="max-w-[160px]"
            size="sm"
            startContent={
              <Icon
                aria-hidden
                className="mr-1"
                icon="solar:calendar-bold"
                width={16}
              />
            }
            value={formatSingleDate(value?.start as CalendarDate | undefined)}
          />
          <Icon
            aria-hidden
            className="text-default-800"
            icon="solar:arrow-right-bold"
            width={18}
          />
          <Input
            readOnly
            aria-label="End date"
            className="max-w-[160px]"
            size="sm"
            startContent={
              <Icon aria-hidden icon="solar:calendar-linear" width={16} />
            }
            value={formatSingleDate(value?.end as CalendarDate | undefined)}
          />
        </div>
      </div>

      <RangeCalendar
        aria-label="Select custom date range"
        className="rounded-lg mt-2 overflow-hidden border shadow-none border-divider"
        classNames={{
          base: "bg-content1",
          headerWrapper: "pt-2",
          gridWrapper: "bg-content1",
        }}
        pageBehavior="visible"
        value={value}
        visibleMonths={2}
        onChange={onChange}
      />

      <Divider className="bg-divider mt-4" />

      <div className="flex justify-end gap-2 mt-4 pt-3">
        <Button variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button color="primary" onPress={onApply}>
          Done
        </Button>
      </div>
    </div>
  ),
);

CalendarContent.displayName = "CalendarContent";

// Main component with React.memo for performance
const GlobalDateRangePicker = memo(function GlobalDateRangePicker({
  value: externalValue,
  onChange,
  onAnalyticsChange,
  onPresetChange,
  mode = "button",
  size = "md",
  className = "",
  label,
  placeholder = "Select date range",
  presets = DEFAULT_PRESETS,
  selectedPreset: externalSelectedPreset,
  useGlobalState = true,
}: GlobalDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use Jotai atom for global state management
  const [globalDateRange, setGlobalDateRange] = useAtom(analyticsDateRangeAtom);

  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    externalSelectedPreset ||
      (useGlobalState ? globalDateRange?.preset || null : null),
  );

  // Convert global date range to CalendarDateRange - memoized
  const globalCalendarRange = useMemo(() => {
    if (!useGlobalState || !globalDateRange) return null;

    try {
      return {
        start: parseDate(globalDateRange.start),
        end: parseDate(globalDateRange.end),
      };
    } catch {
      return null;
    }
  }, [globalDateRange, useGlobalState]);

  // Use either global state or external value
  const value = useGlobalState ? globalCalendarRange : externalValue;

  // Format date range for display - memoized
  const formatDateRange = useMemo(() => {
    if (!value?.start || !value?.end) return placeholder;

    try {
      const startStr = value.start.toString();
      const endStr = value.end.toString();

      if (startStr === endStr) {
        return startStr;
      }

      return `${startStr} - ${endStr}`;
    } catch {
      return placeholder;
    }
  }, [value, placeholder]);

  // Get label for current selection - memoized
  const getSelectionLabel = useMemo(() => {
    if (
      selectedPreset &&
      DATE_RANGE_PRESETS[selectedPreset as keyof typeof DATE_RANGE_PRESETS]
    ) {
      return DATE_RANGE_PRESETS[
        selectedPreset as keyof typeof DATE_RANGE_PRESETS
      ].label;
    }

    return formatDateRange;
  }, [selectedPreset, formatDateRange]);

  // Handle preset selection - optimized with stable callback
  const handlePresetSelect = useCallback(
    (preset: string) => {
      const range = getDateRangeFromPreset(preset);

      // Update global state if enabled
      if (useGlobalState) {
        const analyticsRange = toAnalyticsDateRange(range, preset);
        setGlobalDateRange(analyticsRange);
      }

      // Call callbacks
      onChange?.(range, preset);
      setSelectedPreset(preset);
      onPresetChange?.(preset);
      onAnalyticsChange?.(toAnalyticsDateRange(range, preset));

      setIsOpen(false);
    },
    [
      onChange,
      onPresetChange,
      onAnalyticsChange,
      useGlobalState,
      setGlobalDateRange,
    ],
  );

  // Handle custom range selection - optimized
  const handleCustomRangeChange = useCallback(
    (range: CalendarDateRange | null) => {
      if (range?.start && range.end) {
        const dateRange = {
          start: range.start as CalendarDate,
          end: range.end as CalendarDate,
        };

        // Update global state if enabled
        if (useGlobalState) {
          const analyticsRange = toAnalyticsDateRange(dateRange, null);
          setGlobalDateRange(analyticsRange);
        }

        // Call callbacks
        onChange?.(dateRange, null);
        setSelectedPreset(null);
        onPresetChange?.(null);
        onAnalyticsChange?.(toAnalyticsDateRange(dateRange, null));
      }
    },
    [
      onChange,
      onPresetChange,
      onAnalyticsChange,
      useGlobalState,
      setGlobalDateRange,
    ],
  );

  // Handle apply button click - optimized
  const handleApply = useCallback(() => {
    if (value) {
      // Update global state if enabled
      if (useGlobalState) {
        const analyticsRange = toAnalyticsDateRange(value, null);
        setGlobalDateRange(analyticsRange);
      }
      // Call callbacks
      onChange?.(value, null);
      setSelectedPreset(null);
      onPresetChange?.(null);
      onAnalyticsChange?.(toAnalyticsDateRange(value, null));
      setIsOpen(false);
    }
  }, [
    value,
    onChange,
    onPresetChange,
    onAnalyticsChange,
    useGlobalState,
    setGlobalDateRange,
  ]);

  // Handle select mode change - optimized
  const handleSelectChange = useCallback(
    (keys: Selection) => {
      if (keys === "all") return;
      const keysSet = keys as Set<string>;
      const selectedKey = Array.from(keysSet)[0] as string;

      if (selectedKey) {
        const range = getDateRangeFromPreset(selectedKey);

        // Update global state if enabled
        if (useGlobalState) {
          const analyticsRange = toAnalyticsDateRange(range, selectedKey);
          setGlobalDateRange(analyticsRange);
        }

        // Call callbacks
        onChange?.(range, selectedKey);
        setSelectedPreset(selectedKey);
        onPresetChange?.(selectedKey);
        onAnalyticsChange?.(toAnalyticsDateRange(range, selectedKey));
      }
    },
    [
      onChange,
      onPresetChange,
      onAnalyticsChange,
      useGlobalState,
      setGlobalDateRange,
    ],
  );

  // Filter available presets - memoized
  const availablePresets = useMemo(
    () =>
      presets
        .filter(
          (key) => DATE_RANGE_PRESETS[key as keyof typeof DATE_RANGE_PRESETS],
        )
        .map(
          (key) => DATE_RANGE_PRESETS[key as keyof typeof DATE_RANGE_PRESETS],
        ),
    [presets],
  );

  // Render select mode
  if (mode === "select") {
    return (
      <Select
        className={className}
        label={label}
        placeholder={placeholder}
        selectedKeys={selectedPreset ? [selectedPreset] : []}
        size={size}
        onSelectionChange={handleSelectChange}
      >
        {availablePresets.map((option) => (
          <SelectItem key={option.key}>{option.label}</SelectItem>
        ))}
      </Select>
    );
  }

  // Render button mode with popover
  return (
    <Popover
      isOpen={isOpen}
      offset={10}
      placement="bottom"
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger>
        <Button
          aria-label="Select date range"
          className={cn(
            "min-w-[220px] justify-between rounded-xl bg-content1 border border-divider",
            className,
          )}
          endContent={<Icon icon="solar:calendar-bold" width={20} />}
          size={size}
          variant="light"
        >
          <span className="text-left flex-1 truncate">{getSelectionLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto bg-transparent">
        <div className="flex rounded-xl bg-content1 border border-divider">
          {/* Preset options */}
          <div className="w-44 bg-content2 p-3 rounded-l-xl">
            <div className="space-y-1">
              {availablePresets.map((option) => (
                <PresetButton
                  key={option.key}
                  preset={option}
                  isSelected={selectedPreset === option.key}
                  onSelect={handlePresetSelect}
                />
              ))}
            </div>
          </div>

          {/* Custom range calendar */}
          <CalendarContent
            value={
              value ? (value as unknown as RangeValue<DateValue>) : undefined
            }
            onChange={
              handleCustomRangeChange as unknown as (
                range: RangeValue<DateValue>,
              ) => void
            }
            onClose={() => setIsOpen(false)}
            onApply={handleApply}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
});

GlobalDateRangePicker.displayName = "GlobalDateRangePicker";

// Export the component and helper functions for external use
export default GlobalDateRangePicker;

// Export helper functions for external use
export {
  getDateRangeFromPreset,
  calendarDateToString,
  toAnalyticsDateRange,
  formatSingleDate,
  DATE_RANGE_PRESETS,
  DEFAULT_PRESETS,
};
