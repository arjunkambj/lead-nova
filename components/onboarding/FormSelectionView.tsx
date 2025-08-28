"use client";

import { useState, useEffect } from "react";
import { Card, Button, Checkbox, Spinner, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import OnboardingCard from "./OnboardingCard";
import { useTriggerSyncWithForms, useGetPageForms } from "@/hooks/useMeta";
import { Id } from "@/convex/_generated/dataModel";

interface FormInfo {
  id: string;
  name: string;
  status: string;
  created_time?: string;
  leads_count?: number;
  questions?: any[];
}

interface PageData {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  integrationId: Id<"metaIntegrations">;
}

export default function FormSelectionView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getPageForms = useGetPageForms();
  const triggerSyncWithForms = useTriggerSyncWithForms();
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [forms, setForms] = useState<FormInfo[]>([]);
  const [selectedFormIds, setSelectedFormIds] = useState<Set<string>>(new Set());
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // Parse page data from URL params
    const pageDataParam = searchParams.get("pageData");
    
    if (pageDataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(pageDataParam));
        setPageData(parsedData);
        
        // Fetch forms for this page
        fetchForms(parsedData.pageId, parsedData.pageAccessToken);
      } catch (error) {
        console.error("Failed to parse page data:", error);
        toast.error("Failed to load page data. Please try again.");
        router.push("/onboarding/meta-connect");
      }
    } else {
      toast.error("No page data found. Please reconnect.");
      router.push("/onboarding/meta-connect");
    }
  }, [searchParams, router]);

  const fetchForms = async (pageId: string, pageAccessToken: string) => {
    setIsLoadingForms(true);
    try {
      const result = await getPageForms({ pageId, pageAccessToken });
      
      if (result && result.success && result.forms) {
        setForms(result.forms);
        
        // Pre-select active forms with leads
        const activeFormsWithLeads = result.forms
          .filter((form: FormInfo) => form.status === "ACTIVE" && (form.leads_count || 0) > 0)
          .map((form: FormInfo) => form.id);
        
        setSelectedFormIds(new Set(activeFormsWithLeads));
        
        // Set select all if all forms are selected
        if (activeFormsWithLeads.length === result.forms.length && result.forms.length > 0) {
          setSelectAll(true);
        }
      } else {
        toast.error(result?.error || "Failed to fetch forms");
      }
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      toast.error("Failed to fetch forms. Please try again.");
    } finally {
      setIsLoadingForms(false);
    }
  };

  const handleFormToggle = (formId: string) => {
    const newSelection = new Set(selectedFormIds);
    if (newSelection.has(formId)) {
      newSelection.delete(formId);
    } else {
      newSelection.add(formId);
    }
    setSelectedFormIds(newSelection);
    
    // Update select all state
    setSelectAll(newSelection.size === forms.length && forms.length > 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedFormIds(new Set());
      setSelectAll(false);
    } else {
      // Select all forms
      const allFormIds = forms.map(form => form.id);
      setSelectedFormIds(new Set(allFormIds));
      setSelectAll(true);
    }
  };

  const handleSync = async () => {
    if (!pageData || selectedFormIds.size === 0) {
      toast.error("Please select at least one form to sync");
      return;
    }

    setIsSyncing(true);
    
    try {
      const result = await triggerSyncWithForms({
        integrationId: pageData.integrationId,
        formIds: Array.from(selectedFormIds),
      });

      if (result.success) {
        const formCount = selectedFormIds.size;
        toast.success(`Started syncing ${formCount} form${formCount !== 1 ? 's' : ''}`);
        
        // Navigate to next step
        router.push("/onboarding/invite-team");
      } else {
        throw new Error("Failed to trigger sync");
      }
    } catch (error) {
      console.error("Failed to trigger sync:", error);
      toast.error("Failed to start sync. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSkip = () => {
    // Skip form selection and continue without syncing
    router.push("/onboarding/invite-team");
  };

  const handleBack = () => {
    router.push("/onboarding/select-page");
  };

  // Calculate estimated sync time
  const estimatedLeads = forms
    .filter(form => selectedFormIds.has(form.id))
    .reduce((total, form) => total + (form.leads_count || 0), 0);
  const estimatedTime = Math.ceil(estimatedLeads / 100) * 2; // ~2 seconds per 100 leads

  return (
    <OnboardingCard
      title="Select Lead Forms to Sync"
      subtitle="Choose which forms to import historical leads from"
    >
      <div className="space-y-6">
        {isLoadingForms ? (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Spinner size="lg" />
              <p className="text-default-500">Loading available forms...</p>
            </div>
          </Card>
        ) : forms.length === 0 ? (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Icon 
                icon="solar:document-broken-bold" 
                width={48} 
                height={48} 
                className="text-default-300"
              />
              <p className="text-default-500">No lead forms found</p>
              <p className="text-sm text-default-400 text-center max-w-md">
                Create lead generation forms in Facebook Ads Manager to start capturing leads.
              </p>
              <Button variant="flat" onPress={handleSkip}>
                Continue Without Forms
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Select All Option */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    isSelected={selectAll}
                    onValueChange={handleSelectAll}
                    color="primary"
                  />
                  <span className="font-medium">Select All Forms</span>
                </div>
                <Chip size="sm" variant="flat">
                  {selectedFormIds.size} of {forms.length} selected
                </Chip>
              </div>
            </Card>

            {/* Form List */}
            <div className="space-y-3">
              {forms.map((form) => (
                <Card 
                  key={form.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedFormIds.has(form.id) 
                      ? "border-2 border-primary bg-primary-50/10" 
                      : "hover:bg-default-50"
                  }`}
                  isPressable
                  onPress={() => handleFormToggle(form.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      isSelected={selectedFormIds.has(form.id)}
                      onValueChange={() => handleFormToggle(form.id)}
                      color="primary"
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{form.name}</p>
                        <Chip 
                          size="sm" 
                          color={form.status === "ACTIVE" ? "success" : "warning"}
                          variant="flat"
                        >
                          {form.status}
                        </Chip>
                        {form.leads_count !== undefined && form.leads_count > 0 && (
                          <Chip size="sm" variant="flat">
                            ~{form.leads_count} leads
                          </Chip>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-default-500">
                        <span>Form ID: {form.id}</span>
                        {form.created_time && (
                          <span>
                            Created: {new Date(form.created_time).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {form.questions && form.questions.length > 0 && (
                        <div className="mt-2 text-xs text-default-400">
                          {form.questions.length} questions
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {form.leads_count === 0 && (
                    <div className="mt-3 p-2 bg-warning-50 rounded-lg">
                      <p className="text-xs text-warning-700 flex items-center gap-1">
                        <Icon icon="solar:warning-bold" width={14} height={14} />
                        No leads detected in this form
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Sync Summary */}
            {selectedFormIds.size > 0 && (
              <Card className="p-4 bg-primary-50/20">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-default-600">Forms Selected</span>
                    <span className="font-medium">{selectedFormIds.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-600">Estimated Leads</span>
                    <span className="font-medium">~{estimatedLeads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-600">Estimated Time</span>
                    <span className="font-medium">~{estimatedTime} seconds</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant="flat"
                onPress={handleBack}
                startContent={
                  <Icon icon="solar:arrow-left-bold" width={18} height={18} />
                }
              >
                Back
              </Button>
              
              <div className="flex gap-2">
                <Button variant="light" onPress={handleSkip}>
                  Skip for now
                </Button>
                
                <Button
                  color="primary"
                  onPress={handleSync}
                  isLoading={isSyncing}
                  isDisabled={selectedFormIds.size === 0}
                  endContent={
                    <Icon icon="solar:arrow-right-bold" width={18} height={18} />
                  }
                >
                  {selectedFormIds.size > 0 
                    ? `Sync ${selectedFormIds.size} Form${selectedFormIds.size !== 1 ? 's' : ''}`
                    : "Select Forms to Continue"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </OnboardingCard>
  );
}