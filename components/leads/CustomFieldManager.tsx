"use client";

import React, { useState } from "react";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Switch,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useCustomFields } from "@/hooks/useLeads";
import { Doc } from "@/convex/_generated/dataModel";

interface CustomFieldManagerProps {
  onClose: () => void;
}

export function CustomFieldManager({ onClose }: CustomFieldManagerProps) {
  const { fields, createField } = useCustomFields();
  const [isAdding, setIsAdding] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    fieldType: "text",
    required: false,
    showInTable: true,
    showInKanban: false,
  });

  const handleCreateField = async () => {
    if (!newField.name || !newField.label) return;

    await createField({
      ...newField,
      options: undefined, // Add options handling for select fields
      defaultValue: undefined,
    });

    setNewField({
      name: "",
      label: "",
      fieldType: "text",
      required: false,
      showInTable: true,
      showInKanban: false,
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Custom Fields</h3>
        <Button
          size="sm"
          variant="light"
          onPress={onClose}
          isIconOnly
        >
          <Icon icon="solar:close-circle-linear" className="text-xl" />
        </Button>
      </div>

      {/* Existing Fields */}
      <div className="space-y-2">
        {fields.map((field: Doc<"leadCustomFields">) => (
          <Card key={field._id} className="border-none bg-default-50">
            <CardBody className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{field.label}</p>
                  <p className="text-sm text-default-500">
                    Type: {field.fieldType} • Name: {field.name}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Icon 
                      icon="solar:list-linear" 
                      className={field.showInTable ? "text-primary" : "text-default-300"}
                    />
                    <Icon 
                      icon="solar:widget-4-linear" 
                      className={field.showInKanban ? "text-primary" : "text-default-300"}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                  >
                    <Icon icon="solar:settings-linear" />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Divider />

      {/* Add New Field */}
      {!isAdding ? (
        <Button
          variant="flat"
          onPress={() => setIsAdding(true)}
          startContent={<Icon icon="solar:add-circle-linear" />}
          className="w-full"
        >
          Add Custom Field
        </Button>
      ) : (
        <Card>
          <CardBody className="space-y-4">
            <h4 className="font-medium">New Custom Field</h4>
            
            <Input
              label="Field Name"
              placeholder="e.g., budget"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              description="Unique identifier for the field (no spaces)"
              variant="bordered"
            />

            <Input
              label="Display Label"
              placeholder="e.g., Budget Range"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              description="Label shown to users"
              variant="bordered"
            />

            <Select
              label="Field Type"
              selectedKeys={[newField.fieldType]}
              onChange={(e) => setNewField({ ...newField, fieldType: e.target.value })}
              variant="bordered"
            >
              <SelectItem key="text">Text</SelectItem>
              <SelectItem key="number">Number</SelectItem>
              <SelectItem key="date">Date</SelectItem>
              <SelectItem key="select">Dropdown</SelectItem>
              <SelectItem key="multiselect">Multi-select</SelectItem>
              <SelectItem key="checkbox">Checkbox</SelectItem>
              <SelectItem key="email">Email</SelectItem>
              <SelectItem key="phone">Phone</SelectItem>
              <SelectItem key="url">URL</SelectItem>
              <SelectItem key="currency">Currency</SelectItem>
              <SelectItem key="percent">Percentage</SelectItem>
              <SelectItem key="textarea">Text Area</SelectItem>
            </Select>

            <div className="space-y-2">
              <Switch
                isSelected={newField.required}
                onValueChange={(value) => setNewField({ ...newField, required: value })}
              >
                Required field
              </Switch>
              <Switch
                isSelected={newField.showInTable}
                onValueChange={(value) => setNewField({ ...newField, showInTable: value })}
              >
                Show in table view
              </Switch>
              <Switch
                isSelected={newField.showInKanban}
                onValueChange={(value) => setNewField({ ...newField, showInKanban: value })}
              >
                Show in kanban cards
              </Switch>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="light"
                onPress={() => {
                  setIsAdding(false);
                  setNewField({
                    name: "",
                    label: "",
                    fieldType: "text",
                    required: false,
                    showInTable: true,
                    showInKanban: false,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleCreateField}
                isDisabled={!newField.name || !newField.label}
              >
                Create Field
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}