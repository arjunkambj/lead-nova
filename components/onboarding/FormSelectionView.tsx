"use client";

import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Chip,
  Progress,
  Skeleton,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { useGetPageForms, useTriggerSyncWithForms } from "@/hooks/useMeta";

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
  const [selectedFormIds, setSelectedFormIds] = useState<Set<string>>(
    new Set(),
  );
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  const fetchForms = useCallback(
    async (data: PageData) => {
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
    },
    [getPageForms],
  );

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

  const handleFormToggle = useCallback((formId: string) => {
    setSelectedFormIds((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(formId)) {
        newSelected.delete(formId);
      } else {
        newSelected.add(formId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedFormIds.size === forms.length) {
      setSelectedFormIds(new Set());
    } else {
      const allFormIds = new Set(forms.map((f) => f.id));
      setSelectedFormIds(allFormIds);
    }
  }, [selectedFormIds.size, forms]);

  const handleSync = useCallback(async () => {
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
      setSyncProgress((prev) => {
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
  }, [pageData, selectedFormIds, triggerSync, router]);

  const handleSkip = useCallback(async () => {
    setIsSkipping(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay for UI feedback
    router.push("/onboarding/invite-team");
  }, [router]);

  const handleBack = useCallback(async () => {
    setIsGoingBack(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay for UI feedback
    router.push("/onboarding/select-page");
  }, [router]);

  const isAnyActionInProgress = useMemo(
    () => isSyncing || isSkipping || isGoingBack,
    [isSyncing, isSkipping, isGoingBack],
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Select Lead Forms</h1>
      <p className="text-default-500 text-sm mb-8">Choose forms to sync</p>

      <div className="space-y-6 max-w-2xl">
        {isLoadingForms ? (
          <div className="space-y-3">
            {/* Select all skeleton */}
            <div className="flex items-center justify-between pb-2 border-b border-default-200">
              <Skeleton className="rounded-lg">
                <div className="h-6 w-32 rounded-lg bg-default-300" />
              </Skeleton>
              <Skeleton className="rounded-lg">
                <div className="h-6 w-20 rounded-lg bg-default-300" />
              </Skeleton>
            </div>
            {/* Form skeletons */}
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="rounded-xl">
                <Card className="p-6">
                  <CardBody>
                    <div className="h-20 rounded-xl bg-default-300" />
                  </CardBody>
                </Card>
              </Skeleton>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-12">
            <Icon
              icon="solar:document-linear"
              width={48}
              className="text-default-300 mx-auto mb-4"
            />
            <p className="text-default-600 mb-2">No lead forms found</p>
            <p className="text-sm text-default-500">
              Create lead forms in Facebook Ads Manager first
            </p>

            <div className="flex justify-center gap-3 mt-8">
              <Button
                variant="flat"
                size="lg"
                onPress={handleBack}
                isLoading={isGoingBack}
                isDisabled={isSkipping}
                startContent={
                  !isGoingBack && (
                    <Icon icon="solar:alt-arrow-left-linear" width={20} />
                  )
                }
              >
                {isGoingBack ? "Going back..." : "Back"}
              </Button>
              <Button
                color="primary"
                size="lg"
                onPress={handleSkip}
                isLoading={isSkipping}
                isDisabled={isGoingBack}
                endContent={
                  !isSkipping && (
                    <Icon icon="solar:alt-arrow-right-linear" width={20} />
                  )
                }
              >
                {isSkipping ? "Continuing..." : "Continue"}
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
                  isIndeterminate={
                    selectedFormIds.size > 0 &&
                    selectedFormIds.size < forms.length
                  }
                  onValueChange={handleSelectAll}
                  color="primary"
                />
                <span className="text-sm font-medium">
                  Select All ({forms.length} form{forms.length !== 1 ? "s" : ""}
                  )
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
            <div className="space-y-3 w-full">
              {forms.map((form) => {
                const isSelected = selectedFormIds.has(form.id);
                return (
                  <Card
                    key={form.id}
                    isPressable
                    onPress={() => handleFormToggle(form.id)}
                    className={`
                      w-full transition-all cursor-pointer
                      ${
                        isSelected
                          ? "border-2 border-primary"
                          : "border-2 border-transparent bg-content1 hover:bg-content2"
                      }
                    `}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          isSelected={isSelected}
                          onValueChange={() => handleFormToggle(form.id)}
                          color="primary"
                          className="flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {form.name}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-sm text-default-500 capitalize">
                              {form.status}
                            </span>
                            {form.created_time && (
                              <span className="text-sm text-default-400">
                                {new Date(
                                  form.created_time,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {/* Sync progress */}
            {isSyncing && (
              <div className="p-4 bg-primary-50 dark:bg-primary-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Initiating sync...
                  </span>
                  <span className="text-sm text-default-500">
                    {syncProgress}%
                  </span>
                </div>
                <Progress value={syncProgress} color="primary" size="sm" />
                <p className="text-xs text-default-500 mt-2">
                  Historical leads will sync in the background
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {/* First row: Back and Sync buttons */}
              <div className="flex justify-between">
                <Button
                  variant="flat"
                  size="lg"
                  onPress={handleBack}
                  isLoading={isGoingBack}
                  isDisabled={isAnyActionInProgress && !isGoingBack}
                  startContent={
                    !isGoingBack && (
                      <Icon icon="solar:alt-arrow-left-linear" width={20} />
                    )
                  }
                >
                  {isGoingBack ? "Going back..." : "Back"}
                </Button>

                <Button
                  color="primary"
                  size="lg"
                  onPress={handleSync}
                  isLoading={isSyncing}
                  isDisabled={
                    (selectedFormIds.size === 0 && !isSyncing) ||
                    (isAnyActionInProgress && !isSyncing)
                  }
                  endContent={
                    !isSyncing && (
                      <Icon icon="solar:alt-arrow-right-linear" width={20} />
                    )
                  }
                >
                  {isSyncing
                    ? "Syncing..."
                    : selectedFormIds.size === 0
                      ? "Continue"
                      : `Sync ${selectedFormIds.size} Form${selectedFormIds.size !== 1 ? "s" : ""}`}
                </Button>
              </div>

              {/* Second row: Skip button */}
              <div className="flex justify-end">
                <Button
                  variant="flat"
                  size="md"
                  onPress={handleSkip}
                  isLoading={isSkipping}
                  isDisabled={isAnyActionInProgress && !isSkipping}
                  className="text-default-500"
                >
                  {isSkipping ? "Skipping..." : "Skip for now"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
