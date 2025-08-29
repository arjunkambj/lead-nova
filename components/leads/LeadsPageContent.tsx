"use client";

import {
  Badge,
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
  Tab,
  Tabs,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  useLeadFilters,
  useLeadStages,
  useLeadStats,
  useSavedViews,
} from "@/hooks/useLeads";
import { CustomFieldManager } from "./CustomFieldManager";
import { LeadDetailModal } from "./LeadDetailModal";
import { LeadsFilters } from "./LeadsFilters";
import { LeadsKanbanView } from "./LeadsKanbanView";
import { LeadsTableView } from "./LeadsTableView";

type ViewType = "table" | "kanban" | "calendar";

export function LeadsPageContent() {
  const [viewType, setViewType] = useState<ViewType>("table");
  const [selectedLeadId, setSelectedLeadId] = useState<Id<"leads"> | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(false);

  const { stats, isLoading: statsLoading } = useLeadStats();
  const { filters, updateFilter, clearFilters, activeFilterCount } =
    useLeadFilters();
  const { initializeStages } = useLeadStages();
  const { views } = useSavedViews();
  // const createSampleLeads = useMutation(api.core.seedLeads.createSampleLeads); // TODO: Implement seedLeads

  const handleCreateSampleData = async () => {
    // TODO: Implement sample data creation
    console.log("Sample data creation not yet implemented");
  };

  // Initialize stages on mount
  useEffect(() => {
    initializeStages();
  }, [initializeStages]);

  // Stats cards at the top
  const statsCards = stats
    ? [
        {
          title: "Total Leads",
          value: stats.total,
          icon: "solar:users-group-two-rounded-bold",
          color: "primary" as const,
        },
        {
          title: "Recent Activity",
          value: stats.recentActivity,
          icon: "solar:lightning-bold",
          color: "success" as const,
        },
        {
          title: "Average Score",
          value: Math.round(stats.averageScore),
          icon: "solar:star-bold",
          color: "warning" as const,
        },
        {
          title: "High Priority",
          value:
            stats.byPriority.find((p) => p.priority === "high")?.count || 0,
          icon: "solar:danger-triangle-bold",
          color: "danger" as const,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Leads Management</h1>
          <p className="text-default-500 text-sm">
            Track and manage your leads through the sales pipeline
          </p>
        </div>
        <div className="flex gap-3">
          {stats?.total === 0 && (
            <Button
              variant="flat"
              color="secondary"
              startContent={<Icon icon="solar:test-tube-linear" />}
              onPress={handleCreateSampleData}
            >
              Create Sample Data
            </Button>
          )}
          <Button
            variant="flat"
            startContent={<Icon icon="solar:import-linear" />}
          >
            Import
          </Button>
          <Button
            variant="flat"
            startContent={<Icon icon="solar:export-linear" />}
          >
            Export
          </Button>
          <Button
            color="primary"
            startContent={<Icon icon="solar:add-circle-linear" />}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={`skeleton-card-${index + 1}`}>
                  <CardBody className="p-4">
                    <Skeleton className="rounded-lg">
                      <div className="h-20 rounded-lg bg-default-300"></div>
                    </Skeleton>
                  </CardBody>
                </Card>
              ))
          : statsCards.map((stat) => (
              <Card
                key={`stat-${stat.title.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-small text-default-500">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-semibold mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                      <Icon
                        icon={stat.icon}
                        className={`text-2xl text-${stat.color}`}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
      </div>

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {/* View Type Tabs */}
          <Tabs
            selectedKey={viewType}
            onSelectionChange={(key) => setViewType(key as ViewType)}
            variant="light"
            color="primary"
          >
            <Tab
              key="table"
              title={
                <div className="flex items-center space-x-2">
                  <Icon icon="solar:list-bold" />
                  <span>Table</span>
                </div>
              }
            />
            <Tab
              key="kanban"
              title={
                <div className="flex items-center space-x-2">
                  <Icon icon="solar:widget-4-bold" />
                  <span>Kanban</span>
                </div>
              }
            />
            <Tab
              key="calendar"
              title={
                <div className="flex items-center space-x-2">
                  <Icon icon="solar:calendar-bold" />
                  <span>Calendar</span>
                </div>
              }
            />
          </Tabs>

          {/* Saved Views */}
          {views.length > 0 && (
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  startContent={<Icon icon="solar:bookmark-linear" />}
                >
                  Saved Views
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Saved views">
                {views.map((view) => (
                  <DropdownItem key={view._id}>
                    {view.name}
                    {view.isShared && (
                      <Icon
                        icon="solar:share-linear"
                        className="ml-1 text-xs"
                      />
                    )}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>

        <div className="flex gap-2">
          {/* Filter Toggle */}
          <Button
            variant="flat"
            startContent={<Icon icon="solar:filter-linear" />}
            onPress={() => setShowFilters(!showFilters)}
            endContent={
              activeFilterCount > 0 && (
                <Badge color="primary" size="sm">
                  {activeFilterCount}
                </Badge>
              )
            }
          >
            Filters
          </Button>

          {/* Custom Fields Manager */}
          <Button
            variant="flat"
            startContent={<Icon icon="solar:settings-linear" />}
            onPress={() => setShowCustomFields(!showCustomFields)}
          >
            Fields
          </Button>

          {/* View Options */}
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="flat">
                <Icon icon="solar:menu-dots-bold" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="View options">
              <DropdownItem
                key="save"
                startContent={<Icon icon="solar:save-2-linear" />}
              >
                Save current view
              </DropdownItem>
              <DropdownItem
                key="settings"
                startContent={
                  <Icon icon="solar:settings-minimalistic-linear" />
                }
              >
                View settings
              </DropdownItem>
              <DropdownItem
                key="refresh"
                startContent={<Icon icon="solar:refresh-linear" />}
              >
                Refresh
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardBody>
            <LeadsFilters
              filters={filters}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
              onClose={() => setShowFilters(false)}
            />
          </CardBody>
        </Card>
      )}

      {/* Custom Fields Panel */}
      {showCustomFields && (
        <Card>
          <CardBody>
            <CustomFieldManager onClose={() => setShowCustomFields(false)} />
          </CardBody>
        </Card>
      )}

      {/* Main Content Area */}
      <Card>
        <CardBody className="p-0">
          {viewType === "table" && (
            <LeadsTableView filters={filters} onLeadClick={setSelectedLeadId} />
          )}
          {viewType === "kanban" && (
            <LeadsKanbanView
              filters={filters}
              onLeadClick={setSelectedLeadId}
            />
          )}
          {viewType === "calendar" && (
            <div className="p-8 text-center text-default-500">
              <Icon
                icon="solar:calendar-bold"
                className="text-6xl mx-auto mb-4"
              />
              <p>Calendar view coming soon</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Lead Detail Modal */}
      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          isOpen={!!selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
}
