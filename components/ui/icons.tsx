import type { IconType } from "react-icons";
import {
  HiArrowLeft,
  HiArrowPath,
  HiArrowRight,
  HiBars3,
  HiBell,
  HiCheck,
  HiCheckCircle,
  HiChatBubbleLeftRight,
  HiChevronDown,
  HiChevronRight,
  HiClipboardDocument,
  HiClipboardDocumentCheck,
  HiClock,
  HiEye,
  HiEyeSlash,
  HiGlobeAlt,
  HiMinusCircle,
  HiPlay,
  HiPlus,
  HiTrash,
} from "react-icons/hi2";

type AppIconProps = {
  className?: string;
  size?: number;
  title?: string;
};

function createIcon(Icon: IconType) {
  function AppIcon({ className, size = 18, title }: AppIconProps) {
    return (
      <Icon
        aria-hidden={title ? undefined : true}
        className={className || "text-[#8b95a1]"}
        size={size}
        title={title}
      />
    );
  }

  return AppIcon;
}

export const ArrowLeftIcon = createIcon(HiArrowLeft);
export const ArrowPathIcon = createIcon(HiArrowPath);
export const ArrowRightIcon = createIcon(HiArrowRight);
export const BarsIcon = createIcon(HiBars3);
export const BellIcon = createIcon(HiBell);
export const CheckIcon = createIcon(HiCheck);
export const CheckCircleIcon = createIcon(HiCheckCircle);
export const ChatIcon = createIcon(HiChatBubbleLeftRight);
export const ChevronDownIcon = createIcon(HiChevronDown);
export const ChevronRightIcon = createIcon(HiChevronRight);
export const ClockIcon = createIcon(HiClock);
export const CopyIcon = createIcon(HiClipboardDocument);
export const CopiedIcon = createIcon(HiClipboardDocumentCheck);
export const EyeIcon = createIcon(HiEye);
export const EyeSlashIcon = createIcon(HiEyeSlash);
export const GlobeIcon = createIcon(HiGlobeAlt);
export const MinusCircleIcon = createIcon(HiMinusCircle);
export const PlayIcon = createIcon(HiPlay);
export const PlusIcon = createIcon(HiPlus);
export const TrashIcon = createIcon(HiTrash);
