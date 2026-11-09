import {
  Activity,
  Ambulance,
  Baby,
  Bone,
  Eye,
  FlaskConical,
  HeartPulse,
  Pill,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  "heart-pulse": HeartPulse,
  baby: Baby,
  ambulance: Ambulance,
  flask: FlaskConical,
  pill: Pill,
  shield: ShieldCheck,
  eye: Eye,
  bone: Bone,
  activity: Activity,
};

/** Icons offered to administrators when creating a service. */
export const SERVICE_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "stethoscope", label: "Stethoscope" },
  { value: "heart-pulse", label: "Heart beat" },
  { value: "baby", label: "Maternal & child" },
  { value: "ambulance", label: "Emergency" },
  { value: "flask", label: "Laboratory" },
  { value: "pill", label: "Pharmacy" },
  { value: "shield", label: "Public health" },
  { value: "eye", label: "Eye care" },
  { value: "bone", label: "Orthopaedics" },
  { value: "activity", label: "General care" },
];

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Activity;
  return <Icon className={className} aria-hidden="true" />;
}
