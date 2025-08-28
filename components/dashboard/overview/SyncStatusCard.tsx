"use client";

import { memo } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Chip,
  Progress
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface SyncStatusCardProps {
  syncStatus: {
    currentJob?: {
      _id: string;
      status: string;
      jobType: string;
      totalLeads?: number;
      processedLeads?: number;
      failedLeads?: number;
      startedAt?: number;
      pageId: string;
      error?: string;
    };
    recentJobs: Array<{
      _id: string;
      status: string;
      jobType: string;
      totalLeads?: number;
      completedAt?: number;
      pageId: string;
    }>;
    webhookEvents: number;
  };
  prevSyncJobId: string | null;
}

const SyncStatusCard = memo(({ syncStatus, prevSyncJobId }: SyncStatusCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Sync Status</h3>
          {syncStatus.currentJob && (
            <Chip size="sm" color="warning" variant="flat" className="animate-pulse">
              Live
            </Chip>
          )}
        </div>
        <Icon 
          icon={syncStatus.currentJob ? "solar:refresh-circle-bold" : "solar:check-circle-bold"} 
          width={24} 
          className={syncStatus.currentJob ? "text-warning animate-spin" : "text-success"}
        />
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        {syncStatus.currentJob ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Job</span>
              <div className="flex items-center gap-2">
                <Chip size="sm" color="warning" variant="flat">
                  {syncStatus.currentJob.jobType}
                </Chip>
                <Chip size="sm" color="warning" variant="dot">
                  Processing
                </Chip>
              </div>
            </div>
            {syncStatus.currentJob.totalLeads && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-default-500">
                  <span>Progress</span>
                  <span className="font-mono">
                    {syncStatus.currentJob.processedLeads || 0} / {syncStatus.currentJob.totalLeads} leads
                  </span>
                </div>
                <Progress 
                  value={(syncStatus.currentJob.processedLeads || 0) / syncStatus.currentJob.totalLeads * 100}
                  color="warning"
                  size="sm"
                  className="animate-pulse"
                />
                <div className="text-xs text-default-400">
                  {Math.round((syncStatus.currentJob.processedLeads || 0) / syncStatus.currentJob.totalLeads * 100)}% complete
                </div>
              </div>
            )}
            {syncStatus.currentJob.startedAt && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-default-500">
                  <span>Started</span>
                  <span>{new Date(syncStatus.currentJob.startedAt).toLocaleTimeString()}</span>
                </div>
                {Date.now() - syncStatus.currentJob.startedAt > 5 * 60 * 1000 && (
                  <Chip size="sm" color="warning" variant="flat" className="w-full">
                    ⚠️ This job is taking longer than expected
                  </Chip>
                )}
              </div>
            )}
            {syncStatus.currentJob.error && (
              <Chip size="sm" color="danger" variant="flat">
                Error: {syncStatus.currentJob.error}
              </Chip>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Icon icon="solar:check-circle-bold" width={48} className="text-success mx-auto mb-2" />
            <p className="text-sm font-medium">All Synced</p>
            <p className="text-xs text-default-500">No active sync jobs</p>
            {syncStatus.recentJobs.length > 0 && syncStatus.recentJobs[0].completedAt && (
              <p className="text-xs text-default-400 mt-2">
                Last sync: {new Date(syncStatus.recentJobs[0].completedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {syncStatus.recentJobs.length > 0 && (
          <>
            <Divider className="my-2" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Jobs</p>
              {syncStatus.recentJobs.map((job, index) => {
                const isNewlyCompleted = index === 0 && job._id === prevSyncJobId;
                const timeSinceCompletion = job.completedAt 
                  ? Date.now() - job.completedAt 
                  : Infinity;
                const isRecent = timeSinceCompletion < 60000;
                
                return (
                  <div 
                    key={job._id} 
                    className={`flex justify-between items-center p-2 rounded-lg transition-all ${
                      isNewlyCompleted 
                        ? "bg-success-100 dark:bg-success-900/20 animate-pulse" 
                        : isRecent 
                          ? "bg-default-100 border-l-2 border-success"
                          : "bg-default-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon 
                        icon={job.status === "completed" ? "solar:check-circle-bold" : "solar:close-circle-bold"} 
                        width={16} 
                        className={job.status === "completed" ? "text-success" : "text-danger"}
                      />
                      <span className="text-xs">{job.jobType}</span>
                      {isRecent && (
                        <Chip size="sm" color="success" variant="dot">
                          Recent
                        </Chip>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {job.totalLeads !== undefined && (
                        <Chip size="sm" variant="flat">
                          {job.totalLeads} {job.totalLeads === 1 ? 'lead' : 'leads'}
                        </Chip>
                      )}
                      {job.completedAt && (
                        <span className="text-xs text-default-500">
                          {new Date(job.completedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="flex justify-between items-center text-xs text-default-500">
          <span>Webhook Events Processed:</span>
          <span>{syncStatus.webhookEvents}</span>
        </div>
      </CardBody>
    </Card>
  );
});

SyncStatusCard.displayName = "SyncStatusCard";

export default SyncStatusCard;