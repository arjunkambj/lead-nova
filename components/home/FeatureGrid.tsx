"use client";

import { Icon } from "@iconify/react";

// Static data moved outside component to prevent recreation on each render
const features = [
  {
    icon: "ri:facebook-fill",
    title: "Meta Integration",
    description: "Seamlessly connect with Facebook & Instagram lead forms",
    size: "large",
  },
  {
    icon: "lucide:zap",
    title: "Real-Time Capture",
    description: "Instant webhook notifications for new leads",
    size: "medium",
  },
  {
    icon: "lucide:users",
    title: "Team Management",
    description: "Collaborate with unlimited team members",
    size: "medium",
  },
  {
    icon: "lucide:bar-chart-3",
    title: "Analytics & Reporting",
    description:
      "Track lead performance, conversion rates, and team productivity with comprehensive dashboards",
    size: "wide",
  },
  {
    icon: "lucide:clock-3",
    title: "Historical Sync",
    description:
      "Import up to 90 days of past leads with our Business plan. Never lose valuable lead data.",
    size: "tall",
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 space-y-20">
        {/* Header */}
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center">
          <span className="text-sm font-medium bg-content1 px-4 py-1 rounded-full  border border-divider text-default-500 tracking-wider uppercase">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-default-900">
            Everything You Need to Scale
          </h2>
          <p className="text-lg text-default-600 max-w-2xl">
            From lead capture to conversion, LeadNova provides all the tools you
            need to manage your Facebook leads effectively.
          </p>
        </div>

        {/* Sophisticated Bento Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-8/12 flex flex-col gap-6">
            {/* Top Row */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Meta Integration - Large Card */}
              <div className="sm:w-1/2 bg-content1 border border-divider rounded-2xl p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary-50">
                    <Icon
                      icon={features[0].icon}
                      className="text-primary"
                      width={24}
                    />
                  </div>
                  <span className="text-xs text-default-500 bg-content2 px-2 py-1 rounded-full">
                    Core
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-default-900">
                  {features[0].title}
                </h3>
                <p className="text-sm text-default-600">
                  {features[0].description}
                </p>
                <div className="mt-6 flex gap-2">
                  <Icon
                    icon="ri:facebook-fill"
                    className="text-default-400"
                    width={24}
                  />
                  <Icon
                    icon="ri:instagram-fill"
                    className="text-default-400"
                    width={24}
                  />
                </div>
              </div>

              {/* Real-Time Capture */}
              <div className="sm:w-1/2 bg-content1 border border-divider rounded-2xl p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-warning-50">
                    <Icon
                      icon={features[1].icon}
                      className="text-warning"
                      width={24}
                    />
                  </div>
                  <span className="text-xs text-default-500 bg-content2 px-2 py-1 rounded-full">
                    Fast
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-default-900">
                  {features[1].title}
                </h3>
                <p className="text-sm text-default-600">
                  {features[1].description}
                </p>
                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-success">Live Updates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics - Wide Card */}
            <div className="bg-content1 border border-divider rounded-2xl p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-success-50">
                  <Icon
                    icon={features[3].icon}
                    className="text-success"
                    width={24}
                  />
                </div>
                <span className="text-xs text-default-500 bg-content2 px-2 py-1 rounded-full">
                  Analytics
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-default-900">
                {features[3].title}
              </h3>
              <p className="text-sm text-default-600 mb-6">
                {features[3].description}
              </p>

              {/* Mini Chart Visualization */}
              <div className="grid grid-cols-4 gap-2 h-20">
                {[40, 65, 45, 80, 55, 70, 60, 75].map((height) => (
                  <div key={`chart-bar-${height}`} className="flex items-end">
                    <div
                      className="w-full bg-primary-100 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Tall Card */}
          <div className="lg:w-4/12">
            <div className="h-full bg-content1 border border-divider rounded-2xl p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-secondary-50">
                  <Icon
                    icon={features[4].icon}
                    className="text-secondary"
                    width={24}
                  />
                </div>
                <span className="text-xs text-default-500 bg-content2 px-2 py-1 rounded-full">
                  Pro
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-default-900">
                {features[4].title}
              </h3>
              <p className="text-sm text-default-600 mb-6">
                {features[4].description}
              </p>

              {/* Timeline Visualization */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-default-900">
                      Today
                    </p>
                    <p className="text-xs text-default-500">Real-time sync</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary-300 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-default-900">
                      30 Days
                    </p>
                    <p className="text-xs text-default-500">
                      Professional plan
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary-200 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-default-900">
                      90 Days
                    </p>
                    <p className="text-xs text-default-500">Business plan</p>
                  </div>
                </div>
              </div>

              {/* Team Management Feature */}
              <div className="mt-8 p-4 bg-content2 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Icon
                    icon="lucide:users"
                    className="text-default-600"
                    width={18}
                  />
                  <h4 className="text-sm font-medium text-default-900">
                    Team Collaboration
                  </h4>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="w-8 h-8 rounded-full bg-default-200 border-2 border-background flex items-center justify-center"
                    >
                      <span className="text-xs text-default-600">{n}</span>
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-primary-50 border-2 border-background flex items-center justify-center">
                    <Icon
                      icon="lucide:plus"
                      className="text-primary"
                      width={14}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
