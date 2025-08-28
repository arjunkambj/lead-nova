"use client";

import { useState, useEffect } from "react";
import { Card, Button, Avatar, Chip, Checkbox, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import OnboardingCard from "./OnboardingCard";
import { useConnectMetaPage } from "@/hooks/useMeta";

interface PageInfo {
  id: string;
  name: string;
  category?: string;
  access_token: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
  tasks?: string[];
  lead_forms_count?: number;
  lead_forms_error?: string;
  dev_mode_limitation?: boolean;
}

export default function PageSelectionView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const connectMetaPage = useConnectMetaPage();
  
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokens, setTokens] = useState<{
    userAccessToken: string;
    tokenExpiresAt: number;
  } | null>(null);

  useEffect(() => {
    // Parse page data from URL params
    const pagesParam = searchParams.get("pages");
    const tokensParam = searchParams.get("tokens");
    
    if (pagesParam) {
      try {
        const parsedPages = JSON.parse(decodeURIComponent(pagesParam));
        setPages(parsedPages);
        
        // Pre-select first page if only one available
        if (parsedPages.length === 1) {
          setSelectedPageId(parsedPages[0].id);
        }
      } catch (error) {
        console.error("Failed to parse pages data:", error);
        toast.error("Failed to load pages. Please try connecting again.");
        router.push("/onboarding/meta-connect");
      }
    } else {
      // No pages data, redirect back
      toast.error("No pages data found. Please reconnect.");
      router.push("/onboarding/meta-connect");
    }
    
    if (tokensParam) {
      try {
        const parsedTokens = JSON.parse(decodeURIComponent(tokensParam));
        setTokens(parsedTokens);
      } catch (error) {
        console.error("Failed to parse tokens:", error);
      }
    }
  }, [searchParams, router]);

  const handlePageSelect = async () => {
    if (!selectedPageId) {
      toast.error("Please select a page to continue");
      return;
    }

    const selectedPage = pages.find(p => p.id === selectedPageId);
    if (!selectedPage || !tokens) {
      toast.error("Missing required data. Please reconnect.");
      router.push("/onboarding/meta-connect");
      return;
    }

    setIsConnecting(true);
    
    try {
      // Connect the selected page WITHOUT triggering sync
      const result = await connectMetaPage({
        pageId: selectedPage.id,
        pageName: selectedPage.name,
        pageAccessToken: selectedPage.access_token,
        userAccessToken: tokens.userAccessToken,
        tokenExpiresAt: tokens.tokenExpiresAt,
        triggerSync: false, // Don't trigger sync yet
      });

      if (result.success && result.integrationId) {
        toast.success(`Successfully connected ${selectedPage.name}`);
        
        // Prepare data for form selection
        const pageData = {
          pageId: selectedPage.id,
          pageName: selectedPage.name,
          pageAccessToken: selectedPage.access_token,
          integrationId: result.integrationId,
        };
        
        // Navigate to form selection
        const formSelectionUrl = new URL(`${window.location.origin}/onboarding/select-forms`);
        formSelectionUrl.searchParams.set("pageData", encodeURIComponent(JSON.stringify(pageData)));
        
        router.push(formSelectionUrl.pathname + formSelectionUrl.search);
      } else {
        throw new Error("Failed to connect page");
      }
    } catch (error) {
      console.error("Failed to connect page:", error);
      toast.error("Failed to connect page. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/meta-connect");
  };

  return (
    <OnboardingCard
      title="Select Your Facebook Page"
      subtitle="Choose which page you want to connect for lead management"
    >
      <div className="space-y-6">
        {pages.length === 0 ? (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Spinner size="lg" />
              <p className="text-default-500">Loading available pages...</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {pages.map((page) => (
                <Card 
                  key={page.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedPageId === page.id 
                      ? "border-2 border-primary bg-primary-50/10" 
                      : "hover:bg-default-50"
                  }`}
                  isPressable
                  onPress={() => setSelectedPageId(page.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      isSelected={selectedPageId === page.id}
                      onValueChange={(checked) => {
                        if (checked) setSelectedPageId(page.id);
                      }}
                      color="primary"
                    />
                    
                    <Avatar
                      src={page.picture?.data?.url}
                      icon={
                        <Icon icon="solar:facebook-bold" width={20} height={20} />
                      }
                      className="bg-primary"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{page.name}</p>
                        {page.lead_forms_count !== undefined && page.lead_forms_count > 0 && (
                          <Chip size="sm" color="success" variant="flat">
                            {page.lead_forms_count} Lead Form{page.lead_forms_count !== 1 ? 's' : ''}
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-default-500">
                        {page.category || "Facebook Page"} • ID: {page.id}
                      </p>
                      
                      {page.tasks && page.tasks.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {page.tasks.slice(0, 3).map((task) => (
                            <Chip key={task} size="sm" variant="flat">
                              {task}
                            </Chip>
                          ))}
                          {page.tasks.length > 3 && (
                            <Chip size="sm" variant="flat">
                              +{page.tasks.length - 3} more
                            </Chip>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {page.lead_forms_count === 0 && (
                    <div className="mt-3 p-2 bg-warning-50 rounded-lg">
                      <p className="text-xs text-warning-700 flex items-center gap-1">
                        <Icon icon="solar:warning-bold" width={14} height={14} />
                        {page.dev_mode_limitation ? (
                          <>No lead forms detected (Dev Mode). Forms may exist but can&apos;t be accessed in development mode.</>
                        ) : (
                          <>No lead forms found. You&apos;ll need to create lead forms to capture leads.</>
                        )}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {selectedPageId && pages.find(p => p.id === selectedPageId)?.lead_forms_count === 0 && (
              <Card className="p-4 bg-warning-50">
                <div className="flex items-start space-x-2">
                  <Icon 
                    icon="solar:warning-bold" 
                    width={20} 
                    height={20} 
                    className="text-warning-600 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warning-700">
                      {pages.find(p => p.id === selectedPageId)?.dev_mode_limitation 
                        ? "Development Mode Limitation" 
                        : "No Lead Forms Detected"}
                    </p>
                    <p className="text-xs text-warning-600 mt-1">
                      {pages.find(p => p.id === selectedPageId)?.dev_mode_limitation ? (
                        <>
                          Lead forms cannot be accessed in development mode due to Facebook API restrictions. 
                          You can still connect this page to test webhook integration. Forms will be accessible 
                          once the app is approved and in live mode.
                        </>
                      ) : (
                        <>
                          The selected page doesn&apos;t have any lead generation forms. You&apos;ll need to create 
                          lead forms in Facebook Ads Manager to start capturing leads.
                        </>
                      )}
                    </p>
                    {pages.find(p => p.id === selectedPageId)?.dev_mode_limitation && (
                      <div className="mt-2 pt-2 border-t border-warning-200">
                        <p className="text-xs text-warning-700 font-medium">To test lead capture:</p>
                        <ul className="text-xs text-warning-600 mt-1 space-y-1">
                          <li>• Create Instant Forms in Facebook Ads Manager</li>
                          <li>• Submit a test lead yourself (you have app access)</li>
                          <li>• Or proceed now and test with production forms later</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

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
              
              <Button
                color="primary"
                onPress={handlePageSelect}
                isLoading={isConnecting}
                isDisabled={!selectedPageId}
                endContent={
                  <Icon icon="solar:arrow-right-bold" width={18} height={18} />
                }
              >
                Connect Selected Page
              </Button>
            </div>

            {pages.length > 1 && (
              <p className="text-xs text-center text-default-400">
                You can connect additional pages later from settings
              </p>
            )}
          </>
        )}
      </div>
    </OnboardingCard>
  );
}