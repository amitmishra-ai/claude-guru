import { SessionDetailDialog } from "./SessionDetailDialog";
import { CompletedSessionDetailDialog } from "./CompletedSessionDetailDialog";
import { DeclineReasonDialog } from "./DeclineReasonDialog";
import { RequestDetailDialog } from "./RequestDetailDialog";
import { TimezoneDialog } from "./TimezoneDialog";
import { GroupProfileDialog } from "./GroupProfileDialog";
import { MarkNotAvailableDialog } from "./MarkNotAvailableDialog";
import AvailabilityBuilderDialog from "./AvailabilityBuilderDialog";
import { LearnerRatingsDialog } from "./LearnerRatingsDialog";
import { PollBuilderDialog } from "./PollBuilderDialog";
import { MarkUnavailableModal } from "./MarkUnavailableModal";
import { AddAvailabilityModal } from "./AddAvailabilityModal";
import { SessionDetailsModal } from "./SessionDetailsModal";

/**
 * Global dialogs rendered at the root layout level.
 * They read their open state from Redux and can be triggered from any page.
 */
export function GlobalDialogs() {
  return (
    <>
      <SessionDetailDialog />
      <CompletedSessionDetailDialog />
      <DeclineReasonDialog />
      <RequestDetailDialog />
      <TimezoneDialog />
      <GroupProfileDialog />
      <MarkNotAvailableDialog />
      <AvailabilityBuilderDialog />
      <LearnerRatingsDialog />
      <PollBuilderDialog />
      <MarkUnavailableModal />
      <AddAvailabilityModal />
      <SessionDetailsModal />
    </>
  );
}
