"use client";

import React, { useCallback, useMemo, useState, useEffect, memo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Spinner,
  Checkbox,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { 
  useLeadsTable, 
  useUpdateLeadField,
  useLeadSelection,
  useLeadSort,
  useLeadStages,
} from "@/hooks/useLeads";
import { Id, Doc } from "@/convex/_generated/dataModel";
import type { LeadFilters, EnrichedLead } from "@/types/leads";
import { format } from "date-fns";

// Priority colors mapping
const priorityColorMap: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  low: "default",
  medium: "primary",
  high: "warning",
  urgent: "danger",
};

// Stage colors mapping
const stageColorMap: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  new: "default",
  contacted: "primary",
  qualified: "secondary",
  proposal: "warning",
  negotiation: "warning",
  "closed-won": "success",
  "closed-lost": "danger",
  nurture: "default",
};

// Table columns configuration
const columns = [
  { name: "SELECT", uid: "select", sortable: false },
  { name: "NAME", uid: "fullName", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "PHONE", uid: "phone", sortable: false },
  { name: "COMPANY", uid: "company", sortable: true },
  { name: "STAGE", uid: "stage", sortable: true },
  { name: "PRIORITY", uid: "priority", sortable: true },
  { name: "SCORE", uid: "score", sortable: true },
  { name: "ASSIGNED TO", uid: "assignedTo", sortable: true },
  { name: "CREATED", uid: "createdAt", sortable: true },
  { name: "ACTIONS", uid: "actions", sortable: false },
];

interface LeadsTableViewProps {
  filters?: LeadFilters;
  onLeadClick?: (leadId: Id<"leads">) => void;
}

export const LeadsTableView = memo(function LeadsTableView({ filters, onLeadClick }: LeadsTableViewProps) {
  const { sortConfig } = useLeadSort();
  const { leads, isLoading, loadMore, status } = useLeadsTable(filters, sortConfig || undefined);
  const { updateOptimistic: updateField } = useUpdateLeadField();
  const { stages, initializeStages } = useLeadStages();
  
  const {
    selectedLeads,
    selectedCount,
    toggleSelection,
    toggleSelectAll,
    isSelected,
    selectAll,
  } = useLeadSelection();

  // Initialize stages on mount
  useEffect(() => {
    initializeStages();
  }, [initializeStages]);

  // Editing state
  const [editingCell, setEditingCell] = useState<{
    leadId: Id<"leads">;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  // Handle cell edit start
  const startEdit = useCallback((leadId: Id<"leads">, field: string, currentValue: unknown) => {
    setEditingCell({ leadId, field });
    setEditValue(String(currentValue || ""));
  }, []);

  // Handle cell edit save
  const saveEdit = useCallback(async () => {
    if (!editingCell) return;

    await updateField(editingCell.leadId, editingCell.field, editValue);
    setEditingCell(null);
    setEditValue("");
  }, [editingCell, editValue, updateField]);

  // Handle cell edit cancel
  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue("");
  }, []);

  // Handle keyboard events for editing
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

  // Render cell content based on column
  const renderCell = useCallback((lead: EnrichedLead, columnKey: React.Key): React.ReactNode => {
    const cellValue = lead[columnKey as keyof typeof lead];
    const isEditing = editingCell?.leadId === lead._id && editingCell?.field === columnKey;

    // Handle editing state
    if (isEditing) {
      return (
        <Input
          size="sm"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEdit}
          autoFocus
          classNames={{
            input: "bg-transparent",
            inputWrapper: "bg-transparent shadow-none",
          }}
        />
      );
    }

    switch (columnKey) {
      case "select":
        return (
          <Checkbox
            isSelected={isSelected(lead._id)}
            onValueChange={() => toggleSelection(lead._id)}
            aria-label={`Select ${lead.fullName || lead.email || "lead"}`}
          />
        );

      case "fullName":
        return (
          <div 
            className="flex flex-col cursor-pointer"
            onClick={() => onLeadClick?.(lead._id)}
          >
            <p className="text-bold text-small capitalize">{String(cellValue) || "—"}</p>
            {lead.company && (
              <p className="text-bold text-tiny text-default-400">{lead.company}</p>
            )}
          </div>
        );

      case "email":
        return (
          <div
            className="cursor-text"
            onDoubleClick={() => startEdit(lead._id, "email", cellValue)}
          >
            <p className="text-small">{String(cellValue) || "—"}</p>
          </div>
        );

      case "phone":
        return (
          <div
            className="cursor-text"
            onDoubleClick={() => startEdit(lead._id, "phone", cellValue)}
          >
            <p className="text-small">{String(cellValue) || "—"}</p>
          </div>
        );

      case "company":
        return (
          <div
            className="cursor-text"
            onDoubleClick={() => startEdit(lead._id, "company", cellValue)}
          >
            <p className="text-small">{String(cellValue) || "—"}</p>
          </div>
        );

      case "stage":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Chip
                className="capitalize cursor-pointer"
                color={stageColorMap[String(cellValue)] || "default"}
                size="sm"
                variant="flat"
              >
                {String(cellValue) || "new"}
              </Chip>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Stage selection"
              onAction={(key) => updateField(lead._id, "stage", key)}
            >
              {stages.map((stage) => (
                <DropdownItem key={stage.name}>
                  <Chip
                    color={stage.color as "default" | "primary" | "secondary" | "success" | "warning" | "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {stage.label}
                  </Chip>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        );

      case "priority":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Chip
                className="capitalize cursor-pointer"
                color={priorityColorMap[String(cellValue)] || "default"}
                size="sm"
                variant="flat"
              >
                {String(cellValue) || "medium"}
              </Chip>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Priority selection"
              onAction={(key) => updateField(lead._id, "priority", key)}
            >
              <DropdownItem key="low">Low</DropdownItem>
              <DropdownItem key="medium">Medium</DropdownItem>
              <DropdownItem key="high">High</DropdownItem>
              <DropdownItem key="urgent">Urgent</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      case "score":
        const scoreValue = Number(cellValue) || 0;
        return (
          <div className="flex items-center gap-1">
            <span className="text-small">{scoreValue}</span>
            <div className="w-16 h-1 bg-default-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${scoreValue}%` }}
              />
            </div>
          </div>
        );

      case "assignedTo":
        return lead.assignedUser ? (
          <User
            name={lead.assignedUser.name}
            avatarProps={{
              src: lead.assignedUser.image,
              size: "sm",
            }}
          />
        ) : (
          <Button
            size="sm"
            variant="flat"
            startContent={<Icon icon="solar:user-plus-linear" />}
          >
            Assign
          </Button>
        );

      case "createdAt":
        return (
          <p className="text-small text-default-400">
            {cellValue ? format(new Date(Number(cellValue)), "MMM dd, yyyy") : "—"}
          </p>
        );

      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <Icon icon="solar:menu-dots-bold" className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Lead actions">
                <DropdownItem
                  key="view"
                  startContent={<Icon icon="solar:eye-linear" />}
                  onPress={() => onLeadClick?.(lead._id)}
                >
                  View details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Icon icon="solar:pen-linear" />}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="duplicate"
                  startContent={<Icon icon="solar:copy-linear" />}
                >
                  Duplicate
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Icon icon="solar:trash-bin-trash-linear" />}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        // Handle array values (like fieldData) by rendering as JSON or formatted string
        if (Array.isArray(cellValue)) {
          if (cellValue.length === 0) return "—";
          // For fieldData arrays with {name, value} objects
          if (cellValue[0] && typeof cellValue[0] === 'object' && 'name' in cellValue[0] && 'value' in cellValue[0]) {
            interface FieldData {
              name: string;
              value: string;
            }
            return (
              <div className="flex flex-col gap-1">
                {(cellValue as FieldData[]).map((field, index) => (
                  <div key={index} className="text-small">
                    <span className="font-medium">{field.name}:</span> {field.value}
                  </div>
                ))}
              </div>
            );
          }
          // For tag arrays
          if (cellValue[0] && typeof cellValue[0] === 'object' && '_id' in cellValue[0]) {
            return (
              <div className="flex flex-wrap gap-1">
                {(cellValue as Doc<"leadTags">[]).map((tag) => (
                  <span key={tag._id} className="text-small px-2 py-0.5 rounded-md bg-default-100">
                    {tag.name}
                  </span>
                ))}
              </div>
            );
          }
          // Default array rendering
          return cellValue.join(", ");
        }
        // Handle objects
        if (typeof cellValue === 'object' && cellValue !== null) {
          return JSON.stringify(cellValue);
        }
        return cellValue || "—";
    }
  }, [editingCell, editValue, handleKeyDown, saveEdit, isSelected, toggleSelection, onLeadClick, startEdit, updateField, stages]);

  // Top content with search and filters
  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name, email, company..."
            startContent={<Icon icon="solar:magnifer-linear" />}
            variant="bordered"
          />
          <div className="flex gap-3">
            {selectedCount > 0 && (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    startContent={<Icon icon="solar:settings-linear" />}
                  >
                    Bulk Actions ({selectedCount})
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Bulk actions"
                  onAction={async (key) => {
                    if (key === "delete") {
                      // Handle delete
                    } else if (key === "assign") {
                      // Handle assign
                    }
                  }}
                >
                  <DropdownItem key="assign">Assign to...</DropdownItem>
                  <DropdownItem key="stage">Change stage...</DropdownItem>
                  <DropdownItem key="priority">Change priority...</DropdownItem>
                  <DropdownItem key="tags">Add tags...</DropdownItem>
                  <DropdownItem key="export">Export selected</DropdownItem>
                  <DropdownItem key="delete" className="text-danger" color="danger">
                    Delete selected
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
            <Button
              color="primary"
              startContent={<Icon icon="solar:add-circle-linear" />}
            >
              Add New Lead
            </Button>
          </div>
        </div>
      </div>
    );
  }, [selectedCount]);

  // Bottom content with pagination
  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="text-default-400 text-small">
          {selectedCount > 0 ? `${selectedCount} of ${leads.length} selected` : `Total ${leads.length} leads`}
        </span>
        <Button
          isDisabled={status !== "CanLoadMore"}
          variant="flat"
          onPress={() => loadMore(10)}
        >
          {status === "LoadingMore" ? "Loading..." : "Load More"}
        </Button>
      </div>
    );
  }, [selectedCount, leads.length, status, loadMore]);

  return (
    <Table
      aria-label="Leads table with editable cells"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "min-h-[400px]",
      }}
      selectedKeys={new Set(selectedLeads)}
      selectionMode="multiple"
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={(selection) => {
        if (selection === "all") {
          toggleSelectAll(leads.map(l => l._id));
        } else if (selection instanceof Set) {
          // Handle individual selection changes
        }
      }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "end" : "start"}
            allowsSorting={column.sortable}
            className={column.uid === "select" ? "w-12" : ""}
          >
            {column.uid === "select" ? (
              <Checkbox
                isSelected={selectAll}
                onValueChange={() => toggleSelectAll(leads.map(l => l._id))}
                aria-label="Select all"
              />
            ) : (
              column.name
            )}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={isLoading ? <Spinner /> : "No leads found"}
        items={leads}
        isLoading={isLoading}
        loadingContent={<Spinner label="Loading leads..." />}
      >
        {(item) => (
          <TableRow key={item._id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
});