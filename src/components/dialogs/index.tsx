import { SessionDetailDialog } from "./SessionDetailDialog";
import { DeclineReasonDialog } from "./DeclineReasonDialog";
import { RequestDetailDialog } from "./RequestDetailDialog";
import { TimezoneDialog } from "./TimezoneDialog";
import { GroupProfileDialog } from "./GroupProfileDialog";
import { AvailabilityNudgeDialog } from "./AvailabilityNudgeDialog";
import { MarkNotAvailableDialog } from "./MarkNotAvailableDialog";
import AvailabilityBuilderDialog from "./AvailabilityBuilderDialog";
import { LearnerRatingsDialog } from "./LearnerRatingsDialog";
import { PollBuilderDialog } from "./PollBuilderDialog";
import { MarkUnavailableModal } from "./MarkUnavailableModal";
import { AddAvailabilityModal } from "./AddAvailabilityModal";

/**
 * Global dialogs rendered at the root layout level.
 * They read their open state from Redux and can be triggered from any page.
 */
export function GlobalDialogs() {
  return (
    <>
      <SessionDetailDialog />
      <DeclineReasonDialog />
      <RequestDetailDialog />
      <TimezoneDialog />
      <GroupProfileDialog />
      <AvailabilityNudgeDialog />
      <MarkNotAvailableDialog />
      <AvailabilityBuilderDialog />
      <LearnerRatingsDialog />
      <PollBuilderDialog />
      <MarkUnavailableModal />
      <AddAvailabilityModal />
    </>
  );
}
