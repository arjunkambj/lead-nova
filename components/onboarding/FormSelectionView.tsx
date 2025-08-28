"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Checkbox, Spinner, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTriggerSyncWithForms, useGetPageForms } from "@/hooks/useMeta";
import { Id } from "@/convex/_generated/dataModel";

interface FormInfo {
  id: string;
  name: string;
  status: string;
  created_time?: string;
  leads_count?: number;
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
  const triggerSync = useTriggerSyncWithForms();
  const getPageForms = useGetPageForms();
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [forms, setForms] = useState<FormInfo[]>([]);
  const [selectedFormIds, setSelectedFormIds] = useState<Set<string>>(new Set());
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  const fetchForms = useCallback(async (data: PageData) => {
    setIsLoadingForms(true);
    
    try {
      const result = await getPageForms({
        pageId: data.pageId,
        pageAccessToken: data.pageAccessToken,
      });
      
      if (result.success && result.forms) {
        setForms(result.forms);
        
        // Pre-select all forms
        const allFormIds = new Set(result.forms.map((f: FormInfo) => f.id));
        setSelectedFormIds(allFormIds);
      }
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      toast.error("Failed to load forms. Please try again.");
    } finally {
      setIsLoadingForms(false);
    }
  }, [getPageForms]);

  useEffect(() => {
    const pageDataParam = searchParams.get("pageData");
    
    if (pageDataParam) {
      try {
        const parsedPageData = JSON.parse(decodeURIComponent(pageDataParam));
        setPageData(parsedPageData);
        
        // Fetch forms for this page
        fetchForms(parsedPageData);
      } catch (error) {
        console.error("Failed to parse page data:", error);
        toast.error("Failed to load page data. Please try again.");
        router.push("/onboarding/meta-connect");
      }
    } else {
      toast.error("No page data found. Please reconnect.");
      router.push("/onboarding/meta-connect");
    }
  }, [searchParams, router, fetchForms]);

  const handleFormToggle = (formId: string) => {
    const newSelected = new Set(selectedFormIds);
    if (newSelected.has(formId)) {
      newSelected.delete(formId);
    } else {
      newSelected.add(formId);
    }
    setSelectedFormIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFormIds.size === forms.length) {
      setSelectedFormIds(new Set());
    } else {
      const allFormIds = new Set(forms.map(f => f.id));
      setSelectedFormIds(allFormIds);
    }
  };

  const handleSync = async () => {
    if (!pageData) {
      toast.error("Missing page data. Please reconnect.");
      return;
    }

    if (selectedFormIds.size === 0) {
      // Skip to next step without syncing
      router.push("/onboarding/invite-team");
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
    
    try {
      const result = await triggerSync({
        integrationId: pageData.integrationId,
        formIds: Array.from(selectedFormIds),
      });
      
      if (result.success) {
        clearInterval(progressInterval);
        setSyncProgress(100);
        
        toast.success("Historical lead sync initiated!");
        
        // Continue to next step
        setTimeout(() => {
          router.push("/onboarding/invite-team");
        }, 500);
      } else {
        throw new Error("Failed to initiate sync");
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Failed to sync:", error);
      toast.error("Failed to start sync. You can retry from settings later.");
      
      // Continue anyway
      router.push("/onboarding/invite-team");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/invite-team");
  };

  const handleBack = () => {
    router.push("/onboarding/select-page");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Select Lead Forms</h1>
      <p className="text-default-500 text-sm mb-8">Choose forms to sync</p>
      
      <div className="space-y-6 max-w-2xl">
        {isLoadingForms ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="text-default-500 mt-4">Loading forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="solar:document-linear" width={48} className="text-default-300 mx-auto mb-4" />
            <p className="text-default-600 mb-2">No lead forms found</p>
            <p className="text-sm text-default-500">Create lead forms in Facebook Ads Manager first</p>
            
            <div className="flex justify-center gap-3 mt-8">
              <Button variant="flat" size="lg" onPress={handleBack}>
                Back
              </Button>
              <Button color="primary" size="lg" onPress={handleSkip}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Select all */}
            <div className="flex items-center justify-between pb-2 border-b border-default-200">
              <div className="flex items-center gap-3">
                <Checkbox
                  isSelected={selectedFormIds.size === forms.length}
                  isIndeterminate={selectedFormIds.size > 0 && selectedFormIds.size < forms.length}
                  onValueChange={handleSelectAll}
                  color="primary"
                />
                <span className="text-sm font-medium">
                  Select All ({forms.length} form{forms.length !== 1 ? 's' : ''})
                </span>
              </div>
              <div className="min-w-[80px] text-right">
                {selectedFormIds.size > 0 && (
                  <Chip size="sm" color="primary" variant="flat">
                    {selectedFormIds.size} selected
                  </Chip>
                )}
              </div>
            </div>

            {/* Form list */}
            <div className="space-y-3">
              {forms.map((form) => (
                <div
                  key={form.id}
                  onClick={() => handleFormToggle(form.id)}
                  className={`
                    relative p-6 rounded-xl border cursor-pointer transition-all
                    ${selectedFormIds.has(form.id) 
                      ? "border-primary bg-primary-50/30 dark:bg-primary-100/10" 
                      : "border-default-200 hover:border-default-300 hover:bg-default-50 dark:hover:bg-default-100/5"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      isSelected={selectedFormIds.has(form.id)}
                      onValueChange={() => handleFormToggle(form.id)}
                      color="primary"
                    />
                    
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{form.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-default-500">
                          <span className="text-default-400">Status:</span> <span className="font-medium capitalize">{form.status}</span>
                        </span>
                        {form.created_time && (
                          <span className="text-sm text-default-400">
                            Created {new Date(form.created_time).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sync progress */}
            {isSyncing && (
              <div className="p-4 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Initiating sync...</span>
                  <span className="text-sm text-default-500">{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} color="primary" size="sm" />
                <p className="text-xs text-default-500 mt-2">
                  Historical leads will sync in the background
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button
                variant="flat"
                size="lg"
                onPress={handleBack}
                isDisabled={isSyncing}
                startContent={
                  <Icon icon="solar:alt-arrow-left-linear" width={20} />
                }
              >
                Back
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="flat"
                  size="lg"
                  onPress={handleSkip}
                  isDisabled={isSyncing}
                >
                  Skip for now
                </Button>
                
                <Button
                  color="primary"
                  size="lg"
                  onPress={handleSync}
                  isLoading={isSyncing}
                  isDisabled={selectedFormIds.size === 0}
                  endContent={
                    !isSyncing && <Icon icon="solar:alt-arrow-right-linear" width={20} />
                  }
                >
                  {selectedFormIds.size === 0 ? "Continue" : `Sync ${selectedFormIds.size} Form${selectedFormIds.size !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}