"use client";

import { Button, Chip, Input, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { parseDate } from "@internationalized/date";
import { useCallback } from "react";
import GlobalDateRangePicker from "@/components/shared/GlobalDateRangePicker";
import type { Doc } from "@/convex/_generated/dataModel";
import { useLeadStages, useLeadTags } from "@/hooks/useLeads";
import type { LeadFilters } from "@/types/leads";

interface LeadsFiltersProps {
  filters: LeadFilters;
  onFilterChange: (key: string, value: unknown) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export function LeadsFilters({
  filters,
  onFilterChange,
  onClearFilters,
  onClose,
}: LeadsFiltersProps) {
  const { stages } = useLeadStages();
  const { tags } = useLeadTags();

  // Handle date range change
  const handleDateRangeChange = useCallback(
    (
      range: {
        start: { year: number; month: number; day: number };
        end: { year: number; month: number; day: number };
      } | null,
      preset?: string | null,
    ) => {
      if (range?.start && range.end) {
        // Convert CalendarDate to Date strings
        const startDate = `${range.start.year}-${String(range.start.month).padStart(2, "0")}-${String(range.start.day).padStart(2, "0")}`;
        const endDate = `${range.end.year}-${String(range.end.month).padStart(2, "0")}-${String(range.end.day).padStart(2, "0")}`;

        onFilterChange("dateRange", {
          start: new Date(startDate),
          end: new Date(endDate),
          preset,
        });
      } else {
        onFilterChange("dateRange", null);
      }
    },
    [onFilterChange],
  );

  // Convert existing date range to CalendarDateRange for the picker
  const calendarDateRange = filters.dateRange
    ? {
        start: parseDate(
          filters.dateRange.start instanceof Date
            ? filters.dateRange.start.toISOString().split("T")[0]
            : filters.dateRange.start,
        ),
        end: parseDate(
          filters.dateRange.end instanceof Date
            ? filters.dateRange.end.toISOString().split("T")[0]
            : filters.dateRange.end,
        ),
      }
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button size="sm" variant="light" onPress={onClose} isIconOnly>
          <Icon icon="solar:close-circle-linear" className="text-xl" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <Input
          label="Search"
          placeholder="Search leads..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          startContent={<Icon icon="solar:magnifer-linear" />}
          variant="bordered"
        />

        {/* Stage Filter */}
        <Select
          label="Stage"
          placeholder="Select stage"
          selectedKeys={filters.stage ? [filters.stage] : []}
          onChange={(e) => onFilterChange("stage", e.target.value || null)}
          variant="bordered"
        >
          {stages.map((stage: Doc<"leadStages">) => (
            <SelectItem key={stage.name}>{stage.label}</SelectItem>
          ))}
        </Select>

        {/* Priority Filter */}
        <Select
          label="Priority"
          placeholder="Select priority"
          selectedKeys={filters.priority ? [filters.priority] : []}
          onChange={(e) => onFilterChange("priority", e.target.value || null)}
          variant="bordered"
        >
          <SelectItem key="low">Low</SelectItem>
          <SelectItem key="medium">Medium</SelectItem>
          <SelectItem key="high">High</SelectItem>
          <SelectItem key="urgent">Urgent</SelectItem>
        </Select>

        {/* Date Field Selector */}
        <Select
          label="Date Field"
          placeholder="Select date field"
          selectedKeys={
            filters.dateField ? [filters.dateField] : ["createdTime"]
          }
          onChange={(e) =>
            onFilterChange("dateField", e.target.value || "createdTime")
          }
          variant="bordered"
        >
          <SelectItem key="createdTime">Lead Created (Meta)</SelectItem>
          <SelectItem key="syncedAt">Imported Date</SelectItem>
          <SelectItem key="lastActivityAt">Last Activity</SelectItem>
          <SelectItem key="followUpDate">Follow-up Date</SelectItem>
          <SelectItem key="createdAt">Database Entry</SelectItem>
        </Select>

        {/* Date Range Picker */}
        <div className="md:col-span-2">
          <GlobalDateRangePicker
            value={calendarDateRange}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
            size="md"
            className="w-full"
            useGlobalState={false}
            presets={[
              "today",
              "yesterday",
              "last_7_days",
              "last_30_days",
              "last_90_days",
              "this_month",
              "last_month",
              "this_year",
              "lifetime",
            ]}
          />
        </div>

        {/* Tags Filter */}
        <div className="md:col-span-3">
          <p className="text-sm font-medium mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: Doc<"leadTags">) => (
              <Chip
                key={tag._id}
                className="cursor-pointer"
                color={filters.tags?.includes(tag._id) ? "primary" : "default"}
                variant={filters.tags?.includes(tag._id) ? "solid" : "flat"}
                onClick={() => {
                  const currentTags = filters.tags || [];
                  const newTags = currentTags.includes(tag._id)
                    ? currentTags.filter((t) => t !== tag._id)
                    : [...currentTags, tag._id];
                  onFilterChange("tags", newTags);
                }}
              >
                {tag.name}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="light"
          onPress={onClearFilters}
          startContent={<Icon icon="solar:refresh-linear" />}
        >
          Clear All
        </Button>
        <Button
          color="primary"
          onPress={onClose}
          startContent={<Icon icon="solar:check-circle-linear" />}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
