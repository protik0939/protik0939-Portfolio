import type { ReactNode } from "react";
import {
  Book,
  CheckCircle,
  Code,
  Compass,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Folder,
  Globe,
  Info,
  Layers,
  Link,
  Monitor,
  Package,
  Play,
  Presentation,
  Rocket,
  Server,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Terminal,
  Video,
  Zap,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";

export type ProjectCustomButton = {
  id: string;
  labelEn: string;
  labelBn: string;
  url: string;
  color: string;
  icon: string;
};

export type AvailableIconItem = {
  name: string;
  label: string;
};

export const AVAILABLE_BUTTON_ICONS: AvailableIconItem[] = [
  { name: "Globe", label: "Live Website" },
  { name: "Github", label: "GitHub / Repo" },
  { name: "ExternalLink", label: "External Link" },
  { name: "Code", label: "Source Code" },
  { name: "Play", label: "Live Demo / Video" },
  { name: "Download", label: "Download / Release" },
  { name: "FileText", label: "Documentation" },
  { name: "Book", label: "Guide / Wiki" },
  { name: "Eye", label: "Preview" },
  { name: "Sparkles", label: "AI / Features" },
  { name: "Layers", label: "Architecture" },
  { name: "Terminal", label: "CLI / Console" },
  { name: "Cpu", label: "Hardware / Engine" },
  { name: "Server", label: "Backend / API" },
  { name: "Database", label: "Database / SQL" },
  { name: "Link", label: "Link" },
  { name: "Folder", label: "Assets / Folder" },
  { name: "Smartphone", label: "Mobile App" },
  { name: "ShieldCheck", label: "Security / Audit" },
  { name: "Zap", label: "Fast / Zap" },
  { name: "Package", label: "NPM / Library" },
  { name: "Rocket", label: "Launch / Product" },
  { name: "Star", label: "Starred / Best" },
  { name: "Video", label: "Walkthrough" },
  { name: "Presentation", label: "Slide Deck" },
  { name: "Compass", label: "Explore" },
  { name: "Monitor", label: "Desktop Demo" },
  { name: "Share2", label: "Community" },
  { name: "CheckCircle", label: "Verified" },
  { name: "Info", label: "About / Info" },
];

export function renderProjectButtonIcon(
  name: string,
  className = "h-4 w-4",
  style?: React.CSSProperties,
): ReactNode {
  const key = name.trim().toLowerCase();

  switch (key) {
    case "github":
      return <FaGithub className={className} style={style} aria-hidden />;
    case "globe":
      return <Globe className={className} style={style} aria-hidden />;
    case "code":
      return <Code className={className} style={style} aria-hidden />;
    case "play":
      return <Play className={className} style={style} aria-hidden />;
    case "download":
      return <Download className={className} style={style} aria-hidden />;
    case "filetext":
    case "doc":
    case "docs":
      return <FileText className={className} style={style} aria-hidden />;
    case "book":
      return <Book className={className} style={style} aria-hidden />;
    case "eye":
      return <Eye className={className} style={style} aria-hidden />;
    case "sparkles":
      return <Sparkles className={className} style={style} aria-hidden />;
    case "layers":
      return <Layers className={className} style={style} aria-hidden />;
    case "terminal":
      return <Terminal className={className} style={style} aria-hidden />;
    case "cpu":
      return <Cpu className={className} style={style} aria-hidden />;
    case "server":
      return <Server className={className} style={style} aria-hidden />;
    case "database":
      return <Database className={className} style={style} aria-hidden />;
    case "link":
      return <Link className={className} style={style} aria-hidden />;
    case "folder":
      return <Folder className={className} style={style} aria-hidden />;
    case "smartphone":
      return <Smartphone className={className} style={style} aria-hidden />;
    case "shieldcheck":
      return <ShieldCheck className={className} style={style} aria-hidden />;
    case "zap":
      return <Zap className={className} style={style} aria-hidden />;
    case "package":
      return <Package className={className} style={style} aria-hidden />;
    case "rocket":
      return <Rocket className={className} style={style} aria-hidden />;
    case "star":
      return <Star className={className} style={style} aria-hidden />;
    case "video":
      return <Video className={className} style={style} aria-hidden />;
    case "presentation":
      return <Presentation className={className} style={style} aria-hidden />;
    case "compass":
      return <Compass className={className} style={style} aria-hidden />;
    case "monitor":
      return <Monitor className={className} style={style} aria-hidden />;
    case "share2":
      return <Share2 className={className} style={style} aria-hidden />;
    case "checkcircle":
      return <CheckCircle className={className} style={style} aria-hidden />;
    case "info":
      return <Info className={className} style={style} aria-hidden />;
    default:
      return <ExternalLink className={className} style={style} aria-hidden />;
  }
}

export function ProjectButtonIcon({
  name,
  className = "h-4 w-4",
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <>{renderProjectButtonIcon(name, className, style)}</>;
}

export function parseCustomButtons(raw: unknown): ProjectCustomButton[] {
  if (!raw) {
    return [];
  }

  let items: unknown = raw;
  if (typeof raw === "string") {
    try {
      items = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, index) => ({
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `btn-${index + 1}-${Date.now()}`,
      labelEn:
        typeof item.labelEn === "string"
          ? item.labelEn.trim()
          : typeof item.label === "string"
            ? item.label.trim()
            : "",
      labelBn: typeof item.labelBn === "string" ? item.labelBn.trim() : "",
      url:
        typeof item.url === "string"
          ? item.url.trim()
          : typeof item.link === "string"
            ? item.link.trim()
            : "",
      color: typeof item.color === "string" && item.color.trim() ? item.color.trim() : "#af88ff",
      icon: typeof item.icon === "string" && item.icon.trim() ? item.icon.trim() : "ExternalLink",
    }))
    .filter((item) => item.labelEn.length > 0 || item.labelBn.length > 0 || item.url.length > 0);
}
