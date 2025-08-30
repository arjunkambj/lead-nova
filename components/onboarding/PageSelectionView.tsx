"use client";

import { Avatar, Button, Card, CardBody, Chip, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [isLoadingPages, setIsLoadingPages] = useState(true);
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

    setIsLoadingPages(false);
  }, [searchParams, router]);

  const handlePageSelect = useCallback(async () => {
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
  }, [selectedPageId, pages, tokens, connectMetaPage, router]);

  const handleBack = useCallback(() => {
    router.push("/onboarding/meta-connect");
  }, [router]);

  const selectedPage = useMemo(
    () => pages.find((p) => p.id === selectedPageId),
    [pages, selectedPageId],
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Select Facebook Page</h1>
      <p className="text-default-500 text-sm mb-8">
        Choose which page to connect
      </p>

      <div className="space-y-6 w-full">
        {isLoadingPages ? (
          <div className="space-y-3">
            {/* Skeleton loading for pages */}
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="rounded-xl">
                <div className="h-24 rounded-xl bg-default-300" />
              </Skeleton>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Icon
              icon="solar:facebook-bold"
              width={48}
              className="text-default-300 mb-4"
            />
            <p className="text-default-600 mb-2">No pages found</p>
            <p className="text-sm text-default-500">
              Please ensure you have admin access to at least one Facebook page
            </p>
            <Button
              variant="flat"
              size="lg"
              onPress={handleBack}
              className="mt-6"
              startContent={
                <Icon icon="solar:alt-arrow-left-linear" width={20} />
              }
            >
              Back to Meta Connect
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 w-full">
              {pages.map((page) => {
                const isSelected = selectedPageId === page.id;
                return (
                  <Card
                    key={page.id}
                    isPressable
                    onPress={() => setSelectedPageId(page.id)}
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
                        {/* Avatar */}
                        <Avatar
                          src={page.picture?.data?.url}
                          icon={
                            <Icon
                              icon="solar:facebook-bold"
                              width={20}
                              height={20}
                            />
                          }
                          className="bg-primary flex-shrink-0"
                          size="md"
                        />

                        {/* Page info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {page.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-sm text-default-500">
                              {page.category || "Social Media Agency"}
                            </p>
                            {page.lead_forms_count !== undefined &&
                              page.lead_forms_count > 0 && (
                                <Chip size="sm" color="success" variant="flat">
                                  {page.lead_forms_count} Lead Form
                                  {page.lead_forms_count !== 1 ? "s" : ""}
                                </Chip>
                              )}
                          </div>
                        </div>

                        {/* Radio button */}
                        <div className="flex-shrink-0">
                          <div
                            className={`
                            w-5 h-5 rounded-full border-2 transition-colors
                            ${
                              isSelected
                                ? "border-primary"
                                : "border-default-300"
                            }
                          `}
                          >
                            <div
                              className={`
                              w-full h-full rounded-full flex items-center justify-center
                              transition-transform ${isSelected ? "scale-100" : "scale-0"}
                            `}
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="flat"
                size="lg"
                onPress={handleBack}
                isDisabled={isConnecting}
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
                isDisabled={!selectedPageId || isConnecting}
                endContent={
                  !isConnecting && (
                    <Icon icon="solar:alt-arrow-right-linear" width={20} />
                  )
                }
              >
                {isConnecting
                  ? "Connecting..."
                  : selectedPage
                    ? `Connect ${selectedPage.name}`
                    : "Select a Page"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
