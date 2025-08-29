"use client";

import {
  Avatar,
  Button,
  Chip,
  Radio,
  RadioGroup,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  lead_forms_count?: number;
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

    const selectedPage = pages.find((p) => p.id === selectedPageId);
    if (!selectedPage || !tokens) {
      toast.error("Missing required data. Please reconnect.");
      router.push("/onboarding/meta-connect");
      return;
    }

    setIsConnecting(true);

    try {
      const result = await connectMetaPage({
        pageId: selectedPage.id,
        pageName: selectedPage.name,
        pageAccessToken: selectedPage.access_token,
        userAccessToken: tokens.userAccessToken,
        tokenExpiresAt: tokens.tokenExpiresAt,
        triggerSync: false,
      });

      if (result.success && result.integrationId) {
        toast.success(`Successfully connected ${selectedPage.name}`);

        const pageData = {
          pageId: selectedPage.id,
          pageName: selectedPage.name,
          pageAccessToken: selectedPage.access_token,
          integrationId: result.integrationId,
        };

        const formSelectionUrl = new URL(
          `${window.location.origin}/onboarding/select-forms`,
        );
        formSelectionUrl.searchParams.set(
          "pageData",
          encodeURIComponent(JSON.stringify(pageData)),
        );

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
    <div>
      <h1 className="text-2xl font-semibold mb-2">Select Facebook Page</h1>
      <p className="text-default-500 text-sm mb-8">
        Choose which page to connect
      </p>

      <div className="space-y-6 max-w-2xl">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="text-default-500 mt-4">Loading available pages...</p>
          </div>
        ) : (
          <>
            <RadioGroup
              value={selectedPageId}
              onValueChange={setSelectedPageId}
              className="gap-3"
            >
              {pages.map((page) => (
                <Radio
                  key={page.id}
                  value={page.id}
                  classNames={{
                    base: `
                      relative p-6 rounded-xl border cursor-pointer transition-all max-w-full
                      data-[selected=true]:border-primary data-[selected=true]:bg-primary-50/30 
                      data-[selected=true]:dark:bg-primary-100/10
                      border-default-200 hover:border-default-300 hover:bg-default-50 
                      dark:hover:bg-default-100/5
                    `,
                    label: "w-full",
                    labelWrapper: "w-full m-0",
                    control: "hidden",
                  }}
                >
                  <div className="flex items-center gap-4 w-full">
                    {/* Avatar with subtle border */}
                    <Avatar
                      src={page.picture?.data?.url}
                      icon={
                        <Icon
                          icon="solar:facebook-bold"
                          width={20}
                          height={20}
                        />
                      }
                      className="bg-primary ring-1 ring-default-200/50"
                      size="md"
                    />

                    {/* Page info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold">{page.name}</p>
                        {page.lead_forms_count !== undefined &&
                          page.lead_forms_count > 0 && (
                            <Chip size="sm" color="success" variant="flat">
                              {page.lead_forms_count} Lead Form
                              {page.lead_forms_count !== 1 ? "s" : ""}
                            </Chip>
                          )}
                      </div>
                      <p className="text-sm text-default-500 mt-0.5">
                        {page.category || "Social Media Agency"}
                      </p>
                    </div>
                  </div>
                </Radio>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button
                variant="flat"
                size="lg"
                onPress={handleBack}
                startContent={
                  <Icon icon="solar:alt-arrow-left-linear" width={20} />
                }
              >
                Back
              </Button>

              <Button
                color="primary"
                size="lg"
                onPress={handlePageSelect}
                isLoading={isConnecting}
                isDisabled={!selectedPageId}
                endContent={
                  <Icon icon="solar:alt-arrow-right-linear" width={20} />
                }
              >
                Connect Selected Page
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
