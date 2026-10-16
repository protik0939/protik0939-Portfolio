"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Briefcase,
  Check,
  ChevronRight,
  FileText,
  Folder,
  GraduationCap,
  Inbox,
  Layers,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
  Tag,
  Trash2,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { parseCustomButtons, type ProjectCustomButton } from "@/lib/project-buttons";
import CustomButtonsManager from "@/Components/admin/CustomButtonsManager";
import ImageCropModal from "@/Components/admin/ImageCropModal";
import WysiwygField from "@/Components/admin/RichTextEditor";

type AdminPanelProps = {
  email: string;
  fullName?: string | null;
};

const ENTITY_CONFIG = {
  educations: {
    label: "Educations",
    endpoint: "/api/admin/content/educations",
  },
  skills: {
    label: "Skills",
    endpoint: "/api/admin/content/skills",
  },
  "team-members": {
    label: "Team Members",
    endpoint: "/api/admin/content/team-members",
  },
  experiences: {
    label: "Experiences",
    endpoint: "/api/admin/content/experiences",
  },
  projects: {
    label: "Projects",
    endpoint: "/api/admin/content/projects",
  },
  blogs: {
    label: "Blogs",
    endpoint: "/api/admin/content/blogs",
  },
} as const;

type EntityTab = keyof typeof ENTITY_CONFIG;
type AdminTab = "site" | EntityTab | "inbox" | "security";

const ADMIN_NAV: ReadonlyArray<{ tab: AdminTab; label: string; icon: LucideIcon }> = [
  { tab: "site", label: "Site Config", icon: Settings },
  { tab: "educations", label: "Educations", icon: GraduationCap },
  { tab: "skills", label: "Skills", icon: Wrench },
  { tab: "team-members", label: "Team Members", icon: Users },
  { tab: "experiences", label: "Experiences", icon: Briefcase },
  { tab: "projects", label: "Projects", icon: Folder },
  { tab: "blogs", label: "Blogs", icon: FileText },
  { tab: "inbox", label: "Contact Inbox", icon: Inbox },
  { tab: "security", label: "Security", icon: ShieldCheck },
];

function isAdminTab(value: string | null): value is AdminTab {
  return (
    value === "site" ||
    value === "inbox" ||
    value === "security" ||
    (value !== null && value in ENTITY_CONFIG)
  );
}

type SiteConfigForm = {
  siteTitleEn: string;
  siteTitleBn: string;
  siteDescriptionEn: string;
  siteDescriptionBn: string;
  navHomeEn: string;
  navHomeBn: string;
  navAboutEn: string;
  navAboutBn: string;
  navEducationEn: string;
  navEducationBn: string;
  navSkillsEn: string;
  navSkillsBn: string;
  navProjectsEn: string;
  navProjectsBn: string;
  navBlogsEn: string;
  navBlogsBn: string;
  navContactEn: string;
  navContactBn: string;
  navCvEn: string;
  navCvBn: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  heroHelloEn: string;
  heroHelloBn: string;
  heroIamEn: string;
  heroIamBn: string;
  heroFirstNameEn: string;
  heroFirstNameBn: string;
  heroLastNameEn: string;
  heroLastNameBn: string;
  heroDescriptionEn: string;
  heroDescriptionBn: string;
  heroImageUrl: string;
  aboutDescriptionEn: string;
  aboutDescriptionBn: string;
  aboutSecondaryDescriptionEn: string;
  aboutSecondaryDescriptionBn: string;
  yearsExperience: number;
  aboutImagePrimaryUrl: string;
  aboutImageSecondaryUrl: string;
  aboutImageTertiaryUrl: string;
  projectsSectionTitleEn: string;
  projectsSectionTitleBn: string;
  blogsSectionTitleEn: string;
  blogsSectionTitleBn: string;
  problemSolvingSummaryEn: string;
  problemSolvingSummaryBn: string;
  contactEmail: string;
  contactPhone: string;
  contactLocationEn: string;
  contactLocationBn: string;
  cvUrl: string;
};

type EducationForm = {
  id: string;
  degreeEn: string;
  degreeBn: string;
  subjectEn: string;
  subjectBn: string;
  yearLabel: string;
  resultEn: string;
  resultBn: string;
  institutionEn: string;
  institutionBn: string;
  detailsEn: string;
  detailsBn: string;
  imageUrl: string;
  logoUrl: string;
  link: string;
  isCurrent: boolean;
  sortOrder: number;
  isPublished: boolean;
};

type SkillForm = {
  id: string;
  categoryKey: string;
  categoryTitleEn: string;
  categoryTitleBn: string;
  nameEn: string;
  nameBn: string;
  percentage: number;
  logoUrl: string;
  sortOrder: number;
  isPublished: boolean;
};

type TeamMemberForm = {
  id: string;
  memberCode: string;
  nameEn: string;
  nameBn: string;
  imageUrl: string;
  portfolioUrl: string;
  sortOrder: number;
  isPublished: boolean;
};

type ExperienceForm = {
  id: string;
  titleEn: string;
  titleBn: string;
  companyEn: string;
  companyBn: string;
  periodEn: string;
  periodBn: string;
  detailsEn: string;
  detailsBn: string;
  imageUrl: string;
  link: string;
  isCurrent: boolean;
  sortOrder: number;
  isPublished: boolean;
};

type ProjectForm = {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  typeEn: string;
  typeBn: string;
  detailsEn: string;
  detailsBn: string;
  level: string;
  categoryEn: string;
  categoryBn: string;
  technologiesEn: string;
  technologiesBn: string;
  technologySkillIds: string[];
  logoUrl: string;
  coverImageUrl: string;
  liveUrl: string;
  memberCodes: string[];
  customButtons: ProjectCustomButton[];
  sortOrder: number;
  isPublished: boolean;
};

type BlogForm = {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  fullDetailsEn: string;
  fullDetailsBn: string;
  mediaUrlsText: string;
  coverImageUrl: string;
  customButtons: ProjectCustomButton[];
  authorNameEn: string;
  authorNameBn: string;
  tagsEn: string;
  tagsBn: string;
  timeToReadMinutes: number;
  uploadedAt: string;
  sortOrder: number;
  isPublished: boolean;
};

type ContactMessageItem = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
  respondedAt: string | null;
};

type EntityItem = Record<string, unknown> & { id?: string };

type ImageBbResponse = {
  data?: {
    url?: string;
    display_url?: string;
  };
  error?: {
    message?: string;
  };
  success?: boolean;
};

const DEFAULT_SITE_CONFIG: SiteConfigForm = {
  siteTitleEn: "DevPortfolio",
  siteTitleBn: "ডেভপোর্টফোলিও",
  siteDescriptionEn: "Portfolio website",
  siteDescriptionBn: "পোর্টফোলিও ওয়েবসাইট",
  navHomeEn: "Home",
  navHomeBn: "হোম",
  navAboutEn: "About",
  navAboutBn: "পরিচিতি",
  navEducationEn: "Education",
  navEducationBn: "শিক্ষা",
  navSkillsEn: "Skills",
  navSkillsBn: "দক্ষতা",
  navProjectsEn: "Projects",
  navProjectsBn: "প্রজেক্ট",
  navBlogsEn: "Blogs",
  navBlogsBn: "ব্লগসমূহ",
  navContactEn: "Contact",
  navContactBn: "যোগাযোগ",
  navCvEn: "CV",
  navCvBn: "সিভি",
  logoLightUrl: "",
  logoDarkUrl: "",
  heroHelloEn: "Hello!",
  heroHelloBn: "হ্যালো!",
  heroIamEn: "I am",
  heroIamBn: "আমি",
  heroFirstNameEn: "",
  heroFirstNameBn: "",
  heroLastNameEn: "",
  heroLastNameBn: "",
  heroDescriptionEn: "",
  heroDescriptionBn: "",
  heroImageUrl: "",
  aboutDescriptionEn: "",
  aboutDescriptionBn: "",
  aboutSecondaryDescriptionEn: "",
  aboutSecondaryDescriptionBn: "",
  yearsExperience: 5,
  aboutImagePrimaryUrl: "",
  aboutImageSecondaryUrl: "",
  aboutImageTertiaryUrl: "",
  projectsSectionTitleEn: "Projects",
  projectsSectionTitleBn: "প্রজেক্ট",
  blogsSectionTitleEn: "Blogs",
  blogsSectionTitleBn: "ব্লগসমূহ",
  problemSolvingSummaryEn: "",
  problemSolvingSummaryBn: "",
  contactEmail: "",
  contactPhone: "",
  contactLocationEn: "",
  contactLocationBn: "",
  cvUrl: "",
};

const DEFAULT_EDUCATION: EducationForm = {
  id: "",
  degreeEn: "",
  degreeBn: "",
  subjectEn: "",
  subjectBn: "",
  yearLabel: "",
  resultEn: "",
  resultBn: "",
  institutionEn: "",
  institutionBn: "",
  detailsEn: "",
  detailsBn: "",
  imageUrl: "",
  logoUrl: "",
  link: "",
  isCurrent: false,
  sortOrder: 0,
  isPublished: true,
};

const DEFAULT_SKILL: SkillForm = {
  id: "",
  categoryKey: "",
  categoryTitleEn: "",
  categoryTitleBn: "",
  nameEn: "",
  nameBn: "",
  percentage: 0,
  logoUrl: "",
  sortOrder: 0,
  isPublished: true,
};

const DEFAULT_TEAM_MEMBER: TeamMemberForm = {
  id: "",
  memberCode: "",
  nameEn: "",
  nameBn: "",
  imageUrl: "",
  portfolioUrl: "",
  sortOrder: 0,
  isPublished: true,
};

const DEFAULT_EXPERIENCE: ExperienceForm = {
  id: "",
  titleEn: "",
  titleBn: "",
  companyEn: "",
  companyBn: "",
  periodEn: "",
  periodBn: "",
  detailsEn: "",
  detailsBn: "",
  imageUrl: "",
  link: "",
  isCurrent: false,
  sortOrder: 0,
  isPublished: true,
};

const DEFAULT_PROJECT: ProjectForm = {
  id: "",
  slug: "",
  titleEn: "",
  titleBn: "",
  typeEn: "",
  typeBn: "",
  detailsEn: "",
  detailsBn: "",
  level: "Beginner",
  categoryEn: "",
  categoryBn: "",
  technologiesEn: "",
  technologiesBn: "",
  technologySkillIds: [],
  logoUrl: "",
  coverImageUrl: "",
  liveUrl: "",
  memberCodes: [],
  customButtons: [],
  sortOrder: 0,
  isPublished: true,
};

const DEFAULT_BLOG: BlogForm = {
  id: "",
  slug: "",
  titleEn: "",
  titleBn: "",
  fullDetailsEn: "",
  fullDetailsBn: "",
  mediaUrlsText: "",
  coverImageUrl: "",
  customButtons: [],
  authorNameEn: "",
  authorNameBn: "",
  tagsEn: "",
  tagsBn: "",
  timeToReadMinutes: 5,
  uploadedAt: "",
  sortOrder: 0,
  isPublished: true,
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseArrayText(value: string) {
  return value
    .split(/[\n,]/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parseMultiSelectValues(options: HTMLOptionsCollection) {
  return Array.from(options)
    .filter((option) => option.selected)
    .map((option) => option.value);
}

function mapTechnologyNamesToSkillIds(technologiesEn: string, skillItems: EntityItem[]) {
  const names = technologiesEn
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);

  if (names.length === 0) {
    return [] as string[];
  }

  const nameSet = new Set(names);
  return skillItems
    .filter((skill) => nameSet.has(String(skill.nameEn ?? "").trim().toLowerCase()))
    .map((skill) => String(skill.id ?? ""))
    .filter((id) => id.length > 0);
}

function toDateInputValue(value: unknown) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function recordLabel(item: EntityItem, tab: EntityTab) {
  if (tab === "educations") return String(item.degreeEn ?? item.degreeBn ?? item.id ?? "Education");
  if (tab === "skills") return String(item.nameEn ?? item.nameBn ?? item.id ?? "Skill");
  if (tab === "team-members") return String(item.nameEn ?? item.nameBn ?? item.id ?? "Member");
  if (tab === "experiences") return String(item.titleEn ?? item.titleBn ?? item.id ?? "Experience");
  if (tab === "projects") return String(item.titleEn ?? item.titleBn ?? item.id ?? "Project");
  if (tab === "blogs") return String(item.titleEn ?? item.titleBn ?? item.id ?? "Blog");
  return String(item.id ?? "Item");
}

type InputFieldProps = {
  label: string;
  value: string | number;
  type?: "text" | "email" | "number" | "datetime-local";
  onChange: (value: string) => void;
};

function InputField({ label, value, type = "text", onChange }: Readonly<InputFieldProps>) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-on-surface">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
      />
    </label>
  );
}

type TextareaFieldProps = {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
};

function TextareaField({ label, value, rows = 4, onChange }: Readonly<TextareaFieldProps>) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-on-surface">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
      />
    </label>
  );
}

function ImagePlaceholderIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-6 w-6"}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.6" />
      <path d="M21 15.5 16.5 11 6.5 21" />
    </svg>
  );
}

type ImagePreviewProps = {
  src: string;
  alt: string;
  className?: string;
};

function ImagePreview({ src, alt, className = "h-14 w-14" }: Readonly<ImagePreviewProps>) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasImage = Boolean(src) && failedSrc !== src;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border ${
        hasImage
          ? "border-outline-variant/40 bg-surface-container"
          : "border-dashed border-outline-variant/50 bg-surface-container-low"
      } ${className}`}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <ImagePlaceholderIcon />
      )}
    </div>
  );
}

type ImageUrlFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (file: File) => void;
  isUploading: boolean;
};

function ImageUrlField({ label, value, onChange, onFileUpload, isUploading }: Readonly<ImageUrlFieldProps>) {
  return (
    <div className="space-y-2">
      <InputField label={label} value={value} onChange={onChange} />
      <div className="flex items-center gap-3">
        <ImagePreview src={value} alt={`${label} preview`} />
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-semibold text-on-surface transition hover:bg-surface-container-high">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected) {
                  onFileUpload(selected);
                }
                event.currentTarget.value = "";
              }}
            />
            {isUploading ? "Uploading..." : "Upload Image"}
          </label>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type BlogAuthorSectionProps = {
  authorNameEn: string;
  authorNameBn: string;
  teamMembers: EntityItem[];
  onChangeEn: (value: string) => void;
  onChangeBn: (value: string) => void;
};

function BlogAuthorSection({
  authorNameEn,
  authorNameBn,
  teamMembers,
  onChangeEn,
  onChangeBn,
}: Readonly<BlogAuthorSectionProps>) {
  const [userCustomOverride, setUserCustomOverride] = useState<boolean | null>(null);

  const matchedMember = useMemo(() => {
    const trimmedEn = authorNameEn.trim().toLowerCase();
    const trimmedBn = authorNameBn.trim();

    if (!trimmedEn && !trimmedBn) return null;

    return (
      teamMembers.find((m) => {
        const nameEn = String(m.nameEn ?? "").trim().toLowerCase();
        const nameBn = String(m.nameBn ?? "").trim();
        return (trimmedEn && nameEn === trimmedEn) || (trimmedBn && nameBn === trimmedBn);
      }) ?? null
    );
  }, [authorNameEn, authorNameBn, teamMembers]);

  const isCustomMode =
    userCustomOverride !== null
      ? userCustomOverride
      : !matchedMember && Boolean(authorNameEn.trim() || authorNameBn.trim());

  const selectedMemberId = matchedMember ? String(matchedMember.id ?? matchedMember.memberCode ?? "") : "";

  const handleSelectTeamMember = (memberId: string) => {
    if (!memberId) {
      setUserCustomOverride(false);
      return;
    }
    if (memberId === "__custom__") {
      setUserCustomOverride(true);
      return;
    }

    const member = teamMembers.find((m) => String(m.id ?? m.memberCode) === memberId);
    if (member) {
      setUserCustomOverride(false);
      onChangeEn(String(member.nameEn ?? ""));
      onChangeBn(String(member.nameBn ?? ""));
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-outline-variant/30 bg-surface-container/60 p-4 sm:p-5 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-on-surface">Blog Author</h3>
          </div>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Fetch author info from registered Team Members (EN &amp; BN) or configure a custom author name.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-outline-variant/30 bg-surface-container-high p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setUserCustomOverride(false)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              !isCustomMode
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Team Member
          </button>
          <button
            type="button"
            onClick={() => setUserCustomOverride(true)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              isCustomMode
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Custom Setting
          </button>
        </div>
      </div>

      {!isCustomMode ? (
        <div className="space-y-2">
          <label className="block space-y-1.5 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Select Team Member
            </span>
            <select
              value={selectedMemberId}
              onChange={(e) => handleSelectTeamMember(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition"
            >
              <option value="">-- Choose Team Member as Author --</option>
              {teamMembers.map((member) => {
                const id = String(member.id ?? member.memberCode ?? "");
                const nameEn = String(member.nameEn ?? "");
                const nameBn = String(member.nameBn ?? "");
                const code = String(member.memberCode ?? "");
                return (
                  <option key={id} value={id}>
                    {nameEn} {nameBn ? `(${nameBn})` : ""} {code ? `— ${code}` : ""}
                  </option>
                );
              })}
              <option value="__custom__">⚙️ Custom Setting (Manual Author Entry)</option>
            </select>
          </label>
          {teamMembers.length === 0 ? (
            <p className="text-xs text-amber-300/80">
              No team members registered yet. You can create team members in the Team Members tab or use Custom Setting below.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-on-surface-variant">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-primary">Custom Setting Active</span>
            <button
              type="button"
              onClick={() => setUserCustomOverride(false)}
              className="text-primary underline hover:text-primary-hover"
            >
              Select from Team Members instead
            </button>
          </div>
          <p className="mt-1">Enter your custom author name below for English and Bengali.</p>
        </div>
      )}

      <div className="grid gap-3 pt-1 sm:grid-cols-2">
        <InputField
          label="Author Name (EN)"
          value={authorNameEn}
          onChange={(val) => {
            onChangeEn(val);
            if (!isCustomMode) {
              const currentM = teamMembers.find((m) => String(m.id ?? m.memberCode) === selectedMemberId);
              if (!currentM || String(currentM.nameEn ?? "").trim().toLowerCase() !== val.trim().toLowerCase()) {
                setUserCustomOverride(true);
              }
            }
          }}
        />
        <InputField
          label="Author Name (BN)"
          value={authorNameBn}
          onChange={(val) => {
            onChangeBn(val);
            if (!isCustomMode) {
              const currentM = teamMembers.find((m) => String(m.id ?? m.memberCode) === selectedMemberId);
              if (!currentM || String(currentM.nameBn ?? "").trim() !== val.trim()) {
                setUserCustomOverride(true);
              }
            }
          }}
        />
      </div>
    </div>
  );
}

type BlogTagsFieldProps = {
  label: string;
  langLabel: "EN" | "BN";
  value: string;
  existingTags: string[];
  onChange: (value: string) => void;
};

function BlogTagsField({
  label,
  langLabel,
  value,
  existingTags,
  onChange,
}: Readonly<BlogTagsFieldProps>) {
  const [newTagInput, setNewTagInput] = useState("");

  const selectedTags = useMemo(() => {
    return value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [value]);

  const selectedKeys = useMemo(() => {
    return new Set(selectedTags.map((t) => t.toLowerCase()));
  }, [selectedTags]);

  const availableTags = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];

    // Add existing tags first
    for (const tag of existingTags) {
      const trimmed = tag.trim();
      const key = trimmed.toLowerCase();
      if (trimmed && !seen.has(key)) {
        seen.add(key);
        list.push(trimmed);
      }
    }

    // Include any current tags if not already present
    for (const tag of selectedTags) {
      const trimmed = tag.trim();
      const key = trimmed.toLowerCase();
      if (trimmed && !seen.has(key)) {
        seen.add(key);
        list.push(trimmed);
      }
    }

    return list.sort((a, b) =>
      langLabel === "BN" ? a.localeCompare(b, "bn-BD") : a.localeCompare(b, "en-US")
    );
  }, [existingTags, selectedTags, langLabel]);

  const handleToggleTag = (tagToToggle: string) => {
    const trimmed = tagToToggle.trim();
    if (!trimmed) return;

    if (selectedKeys.has(trimmed.toLowerCase())) {
      const next = selectedTags.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
      onChange(next.join(", "));
    } else {
      const next = [...selectedTags, trimmed];
      onChange(next.join(", "));
    }
  };

  const handleAddNewTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;

    if (!selectedKeys.has(trimmed.toLowerCase())) {
      const next = [...selectedTags, trimmed];
      onChange(next.join(", "));
    }
    setNewTagInput("");
  };

  return (
    <div className="space-y-3 rounded-xl border border-outline-variant/30 bg-surface-container-low/60 p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2">
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-primary" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface">
            {label}
          </h4>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {selectedTags.length} {selectedTags.length === 1 ? "tag" : "tags"} selected
        </span>
      </div>

      {/* Add New Tag Bar */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
          {langLabel === "BN" ? "নতুন ট্যাগ যোগ করুন" : "Add New Tag"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagInput}
            placeholder={
              langLabel === "BN" ? "যেমন: ওয়েব ডেভেলপমেন্ট, রিঅ্যাক্ট..." : "e.g. Next.js, Cloud, React..."
            }
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddNewTag();
              }
            }}
            className="flex-1 rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary transition"
          />
          <button
            type="button"
            onClick={handleAddNewTag}
            disabled={!newTagInput.trim()}
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-40 transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            {langLabel === "BN" ? "যোগ করুন" : "Add"}
          </button>
        </div>
      </div>

      {/* Available / Existing Tags Chip Pool */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
            {langLabel === "BN" ? "উপলব্ধ ট্যাগ (ক্লিক করে নির্বাচন/বাতিল করুন)" : "Available Tags (Click to select/unselect)"}
          </span>
          <span className="text-[11px] text-on-surface-variant">
            {availableTags.length} total
          </span>
        </div>
        {availableTags.length === 0 ? (
          <p className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/40 px-3 py-2 text-xs italic text-on-surface-variant">
            {langLabel === "BN"
              ? "কোনো বিদ্যমান ট্যাগ পাওয়া যায়নি। উপরে নতুন ট্যাগ যোগ করুন।"
              : "No existing tags found yet. Add your first tag above."}
          </p>
        ) : (
          <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-outline-variant/20 bg-surface-container-lowest/50 p-2">
            {availableTags.map((tag) => {
              const isSelected = selectedKeys.has(tag.toLowerCase());
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition ${
                    isSelected
                      ? "border border-primary bg-primary text-on-primary font-medium shadow-sm hover:opacity-90"
                      : "border border-outline-variant/30 bg-surface-container-high/70 text-on-surface-variant hover:border-outline-variant hover:text-on-surface hover:bg-surface-container-highest"
                  }`}
                >
                  {isSelected ? (
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  ) : (
                    <Plus className="h-3 w-3 opacity-60" />
                  )}
                  <span>{tag}</span>
                  {isSelected ? <X className="ml-0.5 h-3 w-3 opacity-60 hover:opacity-100" /> : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Comma-separated Text Input */}
      <InputField
        label={langLabel === "BN" ? "সরাসরি কমা-বিভক্ত ট্যাগ" : "Direct comma-separated tags"}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default function AdminPanel({ email, fullName }: Readonly<AdminPanelProps>) {
  const [activeTab, setActiveTab] = useState<AdminTab>("site");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasResolvedInitialTab, setHasResolvedInitialTab] = useState(false);
  const pendingSelectIdRef = useRef<string | null>(null);
  const imageBbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? "";

  const syncUrl = useCallback((tab: AdminTab, id: string | null) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    if (id) {
      params.set("id", id);
    } else {
      params.delete("id");
    }
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, []);

  const [siteConfigForm, setSiteConfigForm] = useState<SiteConfigForm>(DEFAULT_SITE_CONFIG);

  const [educations, setEducations] = useState<EntityItem[]>([]);
  const [skills, setSkills] = useState<EntityItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<EntityItem[]>([]);
  const [experiences, setExperiences] = useState<EntityItem[]>([]);
  const [projects, setProjects] = useState<EntityItem[]>([]);
  const [blogs, setBlogs] = useState<EntityItem[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessageItem[]>([]);

  const [selectedEducationId, setSelectedEducationId] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  const [educationForm, setEducationForm] = useState<EducationForm>(DEFAULT_EDUCATION);
  const [skillForm, setSkillForm] = useState<SkillForm>(DEFAULT_SKILL);
  const [teamMemberForm, setTeamMemberForm] = useState<TeamMemberForm>(DEFAULT_TEAM_MEMBER);
  const [experienceForm, setExperienceForm] = useState<ExperienceForm>(DEFAULT_EXPERIENCE);
  const [projectForm, setProjectForm] = useState<ProjectForm>(DEFAULT_PROJECT);
  const [blogForm, setBlogForm] = useState<BlogForm>(DEFAULT_BLOG);

  const [cropExperienceFile, setCropExperienceFile] = useState<File | null>(null);
  const [isCroppingExperience, setIsCroppingExperience] = useState(false);
  const [isProcessingExperienceCrop, setIsProcessingExperienceCrop] = useState(false);

  const [cropEducationFile, setCropEducationFile] = useState<File | null>(null);
  const [isCroppingEducation, setIsCroppingEducation] = useState(false);
  const [isProcessingEducationCrop, setIsProcessingEducationCrop] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [securityOtp, setSecurityOtp] = useState("");
  const [securityChallengeId, setSecurityChallengeId] = useState("");
  const [maskedSecurityEmail, setMaskedSecurityEmail] = useState("");

  const currentEntityTab = useMemo(
    () => (activeTab in ENTITY_CONFIG ? (activeTab as EntityTab) : null),
    [activeTab],
  );

  const currentList = useMemo(() => {
    if (currentEntityTab === "educations") return educations;
    if (currentEntityTab === "skills") return skills;
    if (currentEntityTab === "team-members") return teamMembers;
    if (currentEntityTab === "experiences") return experiences;
    if (currentEntityTab === "projects") return projects;
    if (currentEntityTab === "blogs") return blogs;
    return [] as EntityItem[];
  }, [blogs, currentEntityTab, educations, experiences, projects, skills, teamMembers]);

  const selectedEntityId = useMemo(() => {
    if (currentEntityTab === "educations") return selectedEducationId;
    if (currentEntityTab === "skills") return selectedSkillId;
    if (currentEntityTab === "team-members") return selectedTeamMemberId;
    if (currentEntityTab === "experiences") return selectedExperienceId;
    if (currentEntityTab === "projects") return selectedProjectId;
    if (currentEntityTab === "blogs") return selectedBlogId;
    return null;
  }, [
    currentEntityTab,
    selectedBlogId,
    selectedEducationId,
    selectedExperienceId,
    selectedProjectId,
    selectedSkillId,
    selectedTeamMemberId,
  ]);

  const activeTabLabel = useMemo(
    () => ADMIN_NAV.find((entry) => entry.tab === activeTab)?.label ?? "Dashboard",
    [activeTab],
  );

  const ActiveTabIcon = ADMIN_NAV.find((entry) => entry.tab === activeTab)?.icon ?? Layers;

  const handleTabChange = useCallback(
    (tab: AdminTab) => {
      setSidebarOpen(false);
      if (tab === activeTab) return;
      setActiveTab(tab);
      if (tab !== "site" && tab !== "inbox" && tab !== "security") {
        pendingSelectIdRef.current = null;
      }
      syncUrl(tab, null);
    },
    [activeTab, syncUrl],
  );

  const loadProjectOptions = useCallback(async () => {
    const [membersResponse, skillsResponse] = await Promise.all([
      fetch(ENTITY_CONFIG["team-members"].endpoint, { cache: "no-store" }),
      fetch(ENTITY_CONFIG.skills.endpoint, { cache: "no-store" }),
    ]);

    const [membersPayload, skillsPayload] = await Promise.all([
      readJson<EntityItem[]>(membersResponse),
      readJson<EntityItem[]>(skillsResponse),
    ]);

    if (!membersResponse.ok) {
      throw new Error(membersPayload.error || "Failed to load team members for project form.");
    }

    if (!skillsResponse.ok) {
      throw new Error(skillsPayload.error || "Failed to load skills for project form.");
    }

    setTeamMembers(Array.isArray(membersPayload) ? membersPayload : []);
    setSkills(Array.isArray(skillsPayload) ? skillsPayload : []);
  }, []);

  const loadBlogOptions = useCallback(async () => {
    try {
      const response = await fetch(ENTITY_CONFIG["team-members"].endpoint, { cache: "no-store" });
      const payload = await readJson<EntityItem[]>(response);
      if (response.ok && Array.isArray(payload)) {
        setTeamMembers(payload);
      }
    } catch {
      // Keep existing teamMembers if fetch fails
    }
  }, []);

  const existingTagsEn = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      const raw = String(b.tagsEn ?? "");
      raw
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .forEach((t) => set.add(t));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [blogs]);

  const existingTagsBn = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      const raw = String(b.tagsBn ?? "");
      raw
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .forEach((t) => set.add(t));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "bn-BD"));
  }, [blogs]);

  const uploadImageToImageBb = useCallback(
    async (file: File, options?: { preferOriginal?: boolean }) => {
      if (!imageBbApiKey.trim()) {
        throw new Error("ImageBB API key is required.");
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(imageBbApiKey.trim())}`, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ImageBbResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message || "Image upload failed.");
      }

      // ImageBB's display_url is a server-side optimized/resized rendition.
      // For the hero banner we want the untouched, full-resolution original.
      const url = options?.preferOriginal
        ? payload.data?.url || payload.data?.display_url
        : payload.data?.display_url || payload.data?.url;
      if (!url) {
        throw new Error("Image URL was not returned by ImageBB.");
      }

      return url;
    },
    [imageBbApiKey],
  );

  const handleImageFieldUpload = useCallback(
    async (file: File, fieldName: string, apply: (url: string) => void, options?: { preferOriginal?: boolean }) => {
      setError("");
      setMessage("");
      setUploadingField(fieldName);

      try {
        const url = await uploadImageToImageBb(file, options);
        apply(url);
        setMessage(`${fieldName} uploaded via ImageBB.`);
      } catch (uploadError) {
        const uploadMessage = uploadError instanceof Error ? uploadError.message : "Image upload failed.";
        setError(uploadMessage);
      } finally {
        setUploadingField(null);
      }
    },
    [uploadImageToImageBb],
  );

  const handleExperienceCropComplete = useCallback(
    async (croppedFile: File) => {
      setIsProcessingExperienceCrop(true);
      setError("");
      try {
        const url = await uploadImageToImageBb(croppedFile);
        setExperienceForm((prev) => ({ ...prev, imageUrl: url }));
        setMessage("Experience logo cropped (1:1, 150x150 WebP) and uploaded to ImageBB.");
        setIsCroppingExperience(false);
        setCropExperienceFile(null);
      } catch (cropErr) {
        const msg = cropErr instanceof Error ? cropErr.message : "Failed to upload cropped image.";
        setError(msg);
      } finally {
        setIsProcessingExperienceCrop(false);
      }
    },
    [uploadImageToImageBb],
  );

  const handleEducationCropComplete = useCallback(
    async (croppedFile: File) => {
      setIsProcessingEducationCrop(true);
      setError("");
      try {
        const url = await uploadImageToImageBb(croppedFile);
        setEducationForm((prev) => ({ ...prev, imageUrl: url }));
        setMessage("Education logo cropped (1:1, 150x150 WebP) and uploaded to ImageBB.");
        setIsCroppingEducation(false);
        setCropEducationFile(null);
      } catch (cropErr) {
        const msg = cropErr instanceof Error ? cropErr.message : "Failed to upload cropped image.";
        setError(msg);
      } finally {
        setIsProcessingEducationCrop(false);
      }
    },
    [uploadImageToImageBb],
  );

  const handleCvFileUpload = useCallback(async (file: File) => {
    setError("");
    setMessage("");
    setUploadingField("cvUrl");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
            return;
          }
          reject(new Error("Failed to convert file to base64."));
        };
        reader.onerror = () => reject(new Error("Failed to read CV file."));
        reader.readAsDataURL(file);
      });

      setSiteConfigForm((previous) => ({ ...previous, cvUrl: base64 }));
      setMessage("CV converted to base64 and placed in CV field.");
    } catch (cvError) {
      const cvMessage = cvError instanceof Error ? cvError.message : "CV upload failed.";
      setError(cvMessage);
    } finally {
      setUploadingField(null);
    }
  }, []);

  const handleProjectLogoUpload = useCallback(
    async (file: File) => {
      const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

      if (!isSvg) {
        await handleImageFieldUpload(file, "project.logoUrl", (url) => {
          setProjectForm((previous) => ({ ...previous, logoUrl: url }));
        });
        return;
      }

      setError("");
      setMessage("");
      setUploadingField("project.logoUrl");

      try {
        const svgDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
              return;
            }

            reject(new Error("Failed to read SVG file."));
          };
          reader.onerror = () => reject(new Error("Failed to read SVG file."));
          reader.readAsDataURL(file);
        });

        setProjectForm((previous) => ({ ...previous, logoUrl: svgDataUrl }));
        setMessage("Project logo SVG saved directly to database field.");
      } catch (uploadError) {
        const uploadMessage = uploadError instanceof Error ? uploadError.message : "SVG upload failed.";
        setError(uploadMessage);
      } finally {
        setUploadingField(null);
      }
    },
    [handleImageFieldUpload],
  );

  async function readJson<T>(response: Response) {
    return (await response.json()) as T & { error?: string };
  }

  const loadSiteConfig = useCallback(async () => {
    const response = await fetch("/api/admin/content/site-config", { cache: "no-store" });
    const payload = await readJson<Record<string, unknown>>(response);
    if (!response.ok) throw new Error(payload.error || "Failed to load site config.");

    setSiteConfigForm({
      siteTitleEn: String(payload.siteTitleEn ?? ""),
      siteTitleBn: String(payload.siteTitleBn ?? ""),
      siteDescriptionEn: String(payload.siteDescriptionEn ?? ""),
      siteDescriptionBn: String(payload.siteDescriptionBn ?? ""),
      navHomeEn: String(payload.navHomeEn ?? ""),
      navHomeBn: String(payload.navHomeBn ?? ""),
      navAboutEn: String(payload.navAboutEn ?? ""),
      navAboutBn: String(payload.navAboutBn ?? ""),
      navEducationEn: String(payload.navEducationEn ?? ""),
      navEducationBn: String(payload.navEducationBn ?? ""),
      navSkillsEn: String(payload.navSkillsEn ?? ""),
      navSkillsBn: String(payload.navSkillsBn ?? ""),
      navProjectsEn: String(payload.navProjectsEn ?? ""),
      navProjectsBn: String(payload.navProjectsBn ?? ""),
      navBlogsEn: String(payload.navBlogsEn ?? ""),
      navBlogsBn: String(payload.navBlogsBn ?? ""),
      navContactEn: String(payload.navContactEn ?? ""),
      navContactBn: String(payload.navContactBn ?? ""),
      navCvEn: String(payload.navCvEn ?? ""),
      navCvBn: String(payload.navCvBn ?? ""),
      logoLightUrl: String(payload.logoLightUrl ?? ""),
      logoDarkUrl: String(payload.logoDarkUrl ?? ""),
      heroHelloEn: String(payload.heroHelloEn ?? ""),
      heroHelloBn: String(payload.heroHelloBn ?? ""),
      heroIamEn: String(payload.heroIamEn ?? ""),
      heroIamBn: String(payload.heroIamBn ?? ""),
      heroFirstNameEn: String(payload.heroFirstNameEn ?? ""),
      heroFirstNameBn: String(payload.heroFirstNameBn ?? ""),
      heroLastNameEn: String(payload.heroLastNameEn ?? ""),
      heroLastNameBn: String(payload.heroLastNameBn ?? ""),
      heroDescriptionEn: String(payload.heroDescriptionEn ?? ""),
      heroDescriptionBn: String(payload.heroDescriptionBn ?? ""),
      heroImageUrl: String(payload.heroImageUrl ?? ""),
      aboutDescriptionEn: String(payload.aboutDescriptionEn ?? ""),
      aboutDescriptionBn: String(payload.aboutDescriptionBn ?? ""),
      aboutSecondaryDescriptionEn: String(payload.aboutSecondaryDescriptionEn ?? ""),
      aboutSecondaryDescriptionBn: String(payload.aboutSecondaryDescriptionBn ?? ""),
      yearsExperience: Number(payload.yearsExperience ?? 5),
      aboutImagePrimaryUrl: String(payload.aboutImagePrimaryUrl ?? ""),
      aboutImageSecondaryUrl: String(payload.aboutImageSecondaryUrl ?? ""),
      aboutImageTertiaryUrl: String(payload.aboutImageTertiaryUrl ?? ""),
      projectsSectionTitleEn: String(payload.projectsSectionTitleEn ?? ""),
      projectsSectionTitleBn: String(payload.projectsSectionTitleBn ?? ""),
      blogsSectionTitleEn: String(payload.blogsSectionTitleEn ?? ""),
      blogsSectionTitleBn: String(payload.blogsSectionTitleBn ?? ""),
      problemSolvingSummaryEn: String(payload.problemSolvingSummaryEn ?? ""),
      problemSolvingSummaryBn: String(payload.problemSolvingSummaryBn ?? ""),
      contactEmail: String(payload.contactEmail ?? ""),
      contactPhone: String(payload.contactPhone ?? ""),
      contactLocationEn: String(payload.contactLocationEn ?? ""),
      contactLocationBn: String(payload.contactLocationBn ?? ""),
      cvUrl: String(payload.cvUrl ?? ""),
    });
  }, []);

  const loadContactMessages = useCallback(async () => {
    const response = await fetch("/api/admin/contact-messages", { cache: "no-store" });
    const payload = await readJson<ContactMessageItem[]>(response);
    if (!response.ok) throw new Error(payload.error || "Failed to load contact messages.");

    const items = Array.isArray(payload) ? payload : [];
    setContactMessages(items);
  }, []);

  const loadEntity = useCallback(async (tab: EntityTab) => {
    const endpoint = ENTITY_CONFIG[tab].endpoint;
    const response = await fetch(endpoint, { cache: "no-store" });
    const payload = await readJson<EntityItem[]>(response);
    if (!response.ok) throw new Error(payload.error || `Failed to load ${ENTITY_CONFIG[tab].label}.`);

    const items = Array.isArray(payload) ? payload : [];

    if (tab === "educations") {
      setEducations(items);
      if (items.length === 0) {
        setSelectedEducationId(null);
        setEducationForm(DEFAULT_EDUCATION);
      } else {
        const first = (pendingSelectIdRef.current ? items.find((entry) => String(entry.id ?? "") === pendingSelectIdRef.current) : undefined) ?? items[0];
        setSelectedEducationId(String(first.id ?? ""));
        setEducationForm({
          id: String(first.id ?? ""),
          degreeEn: String(first.degreeEn ?? ""),
          degreeBn: String(first.degreeBn ?? ""),
          subjectEn: String(first.subjectEn ?? ""),
          subjectBn: String(first.subjectBn ?? ""),
          yearLabel: String(first.yearLabel ?? ""),
          resultEn: String(first.resultEn ?? ""),
          resultBn: String(first.resultBn ?? ""),
          institutionEn: String(first.institutionEn ?? ""),
          institutionBn: String(first.institutionBn ?? ""),
          detailsEn: String(first.detailsEn ?? ""),
          detailsBn: String(first.detailsBn ?? ""),
          imageUrl: String(first.imageUrl ?? ""),
          logoUrl: String(first.logoUrl ?? ""),
          link: String(first.link ?? ""),
          isCurrent: Boolean(first.isCurrent ?? false),
          sortOrder: Number(first.sortOrder ?? 0),
          isPublished: Boolean(first.isPublished ?? true),
        });
      }
    }

    if (tab === "skills") {
      setSkills(items);
      if (items.length === 0) {
        setSelectedSkillId(null);
        setSkillForm(DEFAULT_SKILL);
      } else {
        const first = (pendingSelectIdRef.current ? items.find((entry) => String(entry.id ?? "") === pendingSelectIdRef.current) : undefined) ?? items[0];
        setSelectedSkillId(String(first.id ?? ""));
        setSkillForm({
          id: String(first.id ?? ""),
          categoryKey: String(first.categoryKey ?? ""),
          categoryTitleEn: String(first.categoryTitleEn ?? ""),
          categoryTitleBn: String(first.categoryTitleBn ?? ""),
          nameEn: String(first.nameEn ?? ""),
          nameBn: String(first.nameBn ?? ""),
          percentage: Number(first.percentage ?? 0),
          logoUrl: String(first.logoUrl ?? ""),
          sortOrder: Number(first.sortOrder ?? 0),
          isPublished: Boolean(first.isPublished ?? true),
        });
      }
    }

    if (tab === "team-members") {
      setTeamMembers(items);
      if (items.length === 0) {
        setSelectedTeamMemberId(null);
        setTeamMemberForm(DEFAULT_TEAM_MEMBER);
      } else {
        const first = (pendingSelectIdRef.current ? items.find((entry) => String(entry.id ?? "") === pendingSelectIdRef.current) : undefined) ?? items[0];
        setSelectedTeamMemberId(String(first.id ?? ""));
        setTeamMemberForm({
          id: String(first.id ?? ""),
          memberCode: String(first.memberCode ?? ""),
          nameEn: String(first.nameEn ?? ""),
          nameBn: String(first.nameBn ?? ""),
          imageUrl: String(first.imageUrl ?? ""),
          portfolioUrl: String(first.portfolioUrl ?? ""),
          sortOrder: Number(first.sortOrder ?? 0),
          isPublished: Boolean(first.isPublished ?? true),
        });
      }
    }

    if (tab === "experiences") {
      setExperiences(items);
      if (items.length === 0) {
        setSelectedExperienceId(null);
        setExperienceForm(DEFAULT_EXPERIENCE);
      } else {
        const first = (pendingSelectIdRef.current ? items.find((entry) => String(entry.id ?? "") === pendingSelectIdRef.current) : undefined) ?? items[0];
        setSelectedExperienceId(String(first.id ?? ""));
        setExperienceForm({
          id: String(first.id ?? ""),
          titleEn: String(first.titleEn ?? ""),
          titleBn: String(first.titleBn ?? ""),
          companyEn: String(first.companyEn ?? ""),
          companyBn: String(first.companyBn ?? ""),
          periodEn: String(first.periodEn ?? ""),
          periodBn: String(first.periodBn ?? ""),
          detailsEn: String(first.detailsEn ?? ""),
          detailsBn: String(first.detailsBn ?? ""),
          imageUrl: String(first.imageUrl ?? ""),
          link: String(first.link ?? ""),
          isCurrent: Boolean(first.isCurrent ?? false),
          sortOrder: Number(first.sortOrder ?? 0),
          isPublished: Boolean(first.isPublished ?? true),
        });
      }
    }

    if (tab === "projects") {
      setProjects(items);
      if (items.length === 0) {
        setSelectedProjectId(null);
        setProjectForm(DEFAULT_PROJECT);
      } else {
        const first = (pendingSelectIdRef.current ? items.find((entry) => String(entry.id ?? "") === pendingSelectIdRef.current) : undefined) ?? items[0];
        setSelectedProjectId(String(first.id ?? ""));
        setProjectForm({
          id: String(first.id ?? ""),
          slug: String(first.slug ?? ""),
          titleEn: String(first.titleEn ?? ""),
          titleBn: String(first.titleBn ?? ""),
          typeEn: String(first.typeEn ?? ""),
          typeBn: String(first.typeBn ?? ""),
          detailsEn: String(first.detailsEn ?? ""),
          detailsBn: String(first.detailsBn ?? ""),
          level: String(first.level ?? "Beginner"),
          categoryEn: String(first.categoryEn ?? ""),
          categoryBn: String(first.categoryBn ?? ""),
          technologiesEn: String(first.technologiesEn ?? ""),
          technologiesBn: String(first.technologiesBn ?? ""),
          technologySkillIds: [],
          logoUrl: String(first.logoUrl ?? ""),
          coverImageUrl: String(first.coverImageUrl ?? ""),
          liveUrl: String(first.liveUrl ?? ""),
          memberCodes: Array.isArray(first.memberCodes) ? first.memberCodes.map((v) => String(v)) : [],
          customButtons: parseCustomButtons(first.customButtons),
          sortOrder: Number(first.sortOrder ?? 0),
          isPublished: Boolean(first.isPublished ?? true),
        });
      }
    }

    if (tab === "blogs") {
      setBlogs(items);
      if (items.length === 0) {
        setSelectedBlogId(null);
        setBlogForm(DEFAULT_BLOG);
      } else {
        const first = (pendingSelectIdRef.current ? items.find((entry) => String(entry.id ?? "") === pendingSelectIdRef.current) : undefined) ?? items[0];
        setSelectedBlogId(String(first.id ?? ""));
        setBlogForm({
          id: String(first.id ?? ""),
          slug: String(first.slug ?? ""),
          titleEn: String(first.titleEn ?? ""),
          titleBn: String(first.titleBn ?? ""),
          fullDetailsEn: String(first.fullDetailsEn ?? ""),
          fullDetailsBn: String(first.fullDetailsBn ?? ""),
          mediaUrlsText: Array.isArray(first.mediaUrls) ? first.mediaUrls.map((v) => String(v)).join("\n") : "",
          coverImageUrl: String(first.coverImageUrl ?? ""),
          customButtons: parseCustomButtons(first.customButtons),
          authorNameEn: String(first.authorNameEn ?? ""),
          authorNameBn: String(first.authorNameBn ?? ""),
          tagsEn: String(first.tagsEn ?? ""),
          tagsBn: String(first.tagsBn ?? ""),
          timeToReadMinutes: Number(first.timeToReadMinutes ?? 5),
          uploadedAt: toDateInputValue(first.uploadedAt),
          sortOrder: Number(first.sortOrder ?? 0),
          isPublished: Boolean(first.isPublished ?? true),
        });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get("tab");
    const urlId = params.get("id");
    if (urlId) {
      pendingSelectIdRef.current = urlId;
    }
    if (isAdminTab(urlTab)) {
      setActiveTab(urlTab);
    }
    setHasResolvedInitialTab(true);
  }, []);

  useEffect(() => {
    if (!hasResolvedInitialTab) return;
    syncUrl(activeTab, currentEntityTab ? selectedEntityId : null);
  }, [activeTab, currentEntityTab, hasResolvedInitialTab, selectedEntityId, syncUrl]);

  useEffect(() => {
    if (!hasResolvedInitialTab) return;

    const run = async () => {
      setError("");
      setMessage("");
      setIsLoading(true);

      try {
        if (activeTab === "site") {
          await loadSiteConfig();
        } else if (activeTab === "inbox") {
          await loadContactMessages();
        } else if (activeTab === "projects") {
          await Promise.all([loadEntity("projects"), loadProjectOptions()]);
        } else if (activeTab === "blogs") {
          await Promise.all([loadEntity("blogs"), loadBlogOptions()]);
        } else if (activeTab !== "security") {
          await loadEntity(activeTab);
        }
      } catch (loadError) {
        const loadMessage = loadError instanceof Error ? loadError.message : "Failed to load data.";
        setError(loadMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [activeTab, hasResolvedInitialTab, loadBlogOptions, loadContactMessages, loadEntity, loadProjectOptions, loadSiteConfig]);

  useEffect(() => {
    if (activeTab !== "projects") {
      return;
    }

    if (projectForm.technologySkillIds.length > 0 || !projectForm.technologiesEn.trim()) {
      return;
    }

    if (skills.length === 0) {
      return;
    }

    const mapped = mapTechnologyNamesToSkillIds(projectForm.technologiesEn, skills);
    if (mapped.length === 0) {
      return;
    }

    setProjectForm((previous) => ({
      ...previous,
      technologySkillIds: mapped,
    }));
  }, [activeTab, projectForm.technologiesEn, projectForm.technologySkillIds.length, skills]);

  const handleLogout = async () => {
    setError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      globalThis.location.reload();
    } catch (logoutError) {
      const message = logoutError instanceof Error ? logoutError.message : "Logout failed.";
      setError(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  async function handleSaveSiteConfig() {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/content/site-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(siteConfigForm),
      });

      const payload = await readJson<Record<string, unknown>>(response);
      if (!response.ok) throw new Error(payload.error || "Failed to save site config.");
      await loadSiteConfig();
      setMessage("Site config saved.");
    } catch (saveError) {
      const saveMessage = saveError instanceof Error ? saveError.message : "Failed to save site config.";
      setError(saveMessage);
    } finally {
      setIsSaving(false);
    }
  }

  const handleAddCustomButton = () => {
    setProjectForm((prev) => ({
      ...prev,
      customButtons: [
        ...prev.customButtons,
        {
          id: `btn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          labelEn: "",
          labelBn: "",
          url: "",
          color: "#af88ff",
          icon: "ExternalLink",
        },
      ],
    }));
  };

  const handleUpdateCustomButton = (index: number, patch: Partial<ProjectCustomButton>) => {
    setProjectForm((prev) => {
      const next = [...prev.customButtons];
      if (next[index]) {
        next[index] = { ...next[index], ...patch };
      }
      return { ...prev, customButtons: next };
    });
  };

  const handleRemoveCustomButton = (index: number) => {
    setProjectForm((prev) => ({
      ...prev,
      customButtons: prev.customButtons.filter((_, i) => i !== index),
    }));
  };

  const handleMoveCustomButton = (fromIndex: number, toIndex: number) => {
    setProjectForm((prev) => {
      if (toIndex < 0 || toIndex >= prev.customButtons.length) {
        return prev;
      }
      const next = [...prev.customButtons];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return { ...prev, customButtons: next };
    });
  };

  const handleAddBlogButton = () => {
    setBlogForm((prev) => ({
      ...prev,
      customButtons: [
        ...prev.customButtons,
        {
          id: `btn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          labelEn: "",
          labelBn: "",
          url: "",
          color: "#af88ff",
          icon: "ExternalLink",
        },
      ],
    }));
  };

  const handleUpdateBlogButton = (index: number, patch: Partial<ProjectCustomButton>) => {
    setBlogForm((prev) => {
      const next = [...prev.customButtons];
      if (next[index]) {
        next[index] = { ...next[index], ...patch };
      }
      return { ...prev, customButtons: next };
    });
  };

  const handleRemoveBlogButton = (index: number) => {
    setBlogForm((prev) => ({
      ...prev,
      customButtons: prev.customButtons.filter((_, i) => i !== index),
    }));
  };

  const handleMoveBlogButton = (fromIndex: number, toIndex: number) => {
    setBlogForm((prev) => {
      if (toIndex < 0 || toIndex >= prev.customButtons.length) {
        return prev;
      }
      const next = [...prev.customButtons];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return { ...prev, customButtons: next };
    });
  };

  async function handleSaveEntity() {
    if (!currentEntityTab) return;

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const endpoint = ENTITY_CONFIG[currentEntityTab].endpoint;
      const selectedId =
        currentEntityTab === "educations"
          ? selectedEducationId
          : currentEntityTab === "skills"
            ? selectedSkillId
            : currentEntityTab === "team-members"
              ? selectedTeamMemberId
              : currentEntityTab === "experiences"
                ? selectedExperienceId
              : currentEntityTab === "projects"
                ? selectedProjectId
                : selectedBlogId;
      const method = selectedId ? "PUT" : "POST";
      const target = selectedId ? `${endpoint}/${selectedId}` : endpoint;

      let body: Record<string, unknown> = {};

      if (currentEntityTab === "educations") {
        body = {
          degreeEn: educationForm.degreeEn,
          degreeBn: educationForm.degreeBn,
          subjectEn: educationForm.subjectEn,
          subjectBn: educationForm.subjectBn,
          yearLabel: educationForm.yearLabel,
          resultEn: educationForm.resultEn,
          resultBn: educationForm.resultBn,
          institutionEn: educationForm.institutionEn,
          institutionBn: educationForm.institutionBn,
          detailsEn: educationForm.detailsEn,
          detailsBn: educationForm.detailsBn,
          imageUrl: educationForm.imageUrl,
          logoUrl: educationForm.logoUrl,
          link: educationForm.link,
          isCurrent: educationForm.isCurrent,
          sortOrder: educationForm.sortOrder,
          isPublished: educationForm.isPublished,
        };
      }

      if (currentEntityTab === "skills") {
        body = {
          categoryKey: skillForm.categoryKey,
          categoryTitleEn: skillForm.categoryTitleEn,
          categoryTitleBn: skillForm.categoryTitleBn,
          nameEn: skillForm.nameEn,
          nameBn: skillForm.nameBn,
          percentage: skillForm.percentage,
          logoUrl: skillForm.logoUrl,
          sortOrder: skillForm.sortOrder,
          isPublished: skillForm.isPublished,
        };
      }

      if (currentEntityTab === "team-members") {
        body = {
          memberCode: teamMemberForm.memberCode,
          nameEn: teamMemberForm.nameEn,
          nameBn: teamMemberForm.nameBn,
          imageUrl: teamMemberForm.imageUrl,
          portfolioUrl: teamMemberForm.portfolioUrl,
          sortOrder: teamMemberForm.sortOrder,
          isPublished: teamMemberForm.isPublished,
        };
      }

      if (currentEntityTab === "experiences") {
        body = {
          titleEn: experienceForm.titleEn,
          titleBn: experienceForm.titleBn,
          companyEn: experienceForm.companyEn,
          companyBn: experienceForm.companyBn,
          periodEn: experienceForm.periodEn,
          periodBn: experienceForm.periodBn,
          detailsEn: experienceForm.detailsEn,
          detailsBn: experienceForm.detailsBn,
          imageUrl: experienceForm.imageUrl,
          link: experienceForm.link,
          isCurrent: experienceForm.isCurrent,
          sortOrder: experienceForm.sortOrder,
          isPublished: experienceForm.isPublished,
        };
      }

      if (currentEntityTab === "projects") {
        const selectedTechnologySkills = skills.filter((skill) => {
          const skillId = String(skill.id ?? "");
          return projectForm.technologySkillIds.includes(skillId);
        });

        body = {
          slug: projectForm.slug,
          titleEn: projectForm.titleEn,
          titleBn: projectForm.titleBn,
          typeEn: projectForm.typeEn,
          typeBn: projectForm.typeBn,
          detailsEn: projectForm.detailsEn,
          detailsBn: projectForm.detailsBn,
          level: projectForm.level,
          categoryEn: projectForm.categoryEn,
          categoryBn: projectForm.categoryBn,
          technologiesEn: selectedTechnologySkills
            .map((skill) => String(skill.nameEn ?? "").trim())
            .filter((value) => value.length > 0)
            .join(", "),
          technologiesBn: selectedTechnologySkills
            .map((skill) => String(skill.nameBn ?? "").trim())
            .filter((value) => value.length > 0)
            .join(", "),
          logoUrl: projectForm.logoUrl,
          coverImageUrl: projectForm.coverImageUrl,
          liveUrl: projectForm.liveUrl,
          memberCodes: projectForm.memberCodes,
          customButtons: JSON.stringify(projectForm.customButtons),
          sortOrder: projectForm.sortOrder,
          isPublished: projectForm.isPublished,
        };
      }

      if (currentEntityTab === "blogs") {
        body = {
          slug: blogForm.slug,
          titleEn: blogForm.titleEn,
          titleBn: blogForm.titleBn,
          fullDetailsEn: blogForm.fullDetailsEn,
          fullDetailsBn: blogForm.fullDetailsBn,
          mediaUrls: parseArrayText(blogForm.mediaUrlsText),
          coverImageUrl: blogForm.coverImageUrl,
          customButtons: JSON.stringify(blogForm.customButtons),
          authorNameEn: blogForm.authorNameEn,
          authorNameBn: blogForm.authorNameBn,
          tagsEn: blogForm.tagsEn,
          tagsBn: blogForm.tagsBn,
          timeToReadMinutes: blogForm.timeToReadMinutes,
          uploadedAt: blogForm.uploadedAt || undefined,
          sortOrder: blogForm.sortOrder,
          isPublished: blogForm.isPublished,
        };
      }

      const response = await fetch(target, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = await readJson<Record<string, unknown>>(response);
      if (!response.ok) throw new Error(payload.error || "Save failed.");

      setMessage(selectedId ? "Record updated." : "Record created.");
      await loadEntity(currentEntityTab);
    } catch (saveError) {
      const saveMessage = saveError instanceof Error ? saveError.message : "Save failed.";
      setError(saveMessage);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteEntity() {
    if (!currentEntityTab) return;

    const selectedId =
      currentEntityTab === "educations"
        ? selectedEducationId
        : currentEntityTab === "skills"
          ? selectedSkillId
          : currentEntityTab === "team-members"
            ? selectedTeamMemberId
            : currentEntityTab === "experiences"
              ? selectedExperienceId
            : currentEntityTab === "projects"
              ? selectedProjectId
              : selectedBlogId;
    if (!selectedId) {
      setError("Select a record to delete.");
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const endpoint = ENTITY_CONFIG[currentEntityTab].endpoint;
      const response = await fetch(`${endpoint}/${selectedId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const payload = await readJson<{ ok?: boolean }>(response);
      if (!response.ok) throw new Error(payload.error || "Delete failed.");

      setMessage("Record deleted.");
      await loadEntity(currentEntityTab);
    } catch (deleteError) {
      const deleteMessage = deleteError instanceof Error ? deleteError.message : "Delete failed.";
      setError(deleteMessage);
    } finally {
      setIsSaving(false);
    }
  }

  function handleSelectEntity(id: string) {
    if (!currentEntityTab) return;
    const item = currentList.find((candidate) => String(candidate.id) === id);
    if (!item) return;

    pendingSelectIdRef.current = id;

    if (currentEntityTab === "educations") {
      setSelectedEducationId(id);
      setEducationForm({
        id,
        degreeEn: String(item.degreeEn ?? ""),
        degreeBn: String(item.degreeBn ?? ""),
        subjectEn: String(item.subjectEn ?? ""),
        subjectBn: String(item.subjectBn ?? ""),
        yearLabel: String(item.yearLabel ?? ""),
        resultEn: String(item.resultEn ?? ""),
        resultBn: String(item.resultBn ?? ""),
        institutionEn: String(item.institutionEn ?? ""),
        institutionBn: String(item.institutionBn ?? ""),
        detailsEn: String(item.detailsEn ?? ""),
        detailsBn: String(item.detailsBn ?? ""),
        imageUrl: String(item.imageUrl ?? ""),
        logoUrl: String(item.logoUrl ?? ""),
        link: String(item.link ?? ""),
        isCurrent: Boolean(item.isCurrent ?? false),
        sortOrder: Number(item.sortOrder ?? 0),
        isPublished: Boolean(item.isPublished ?? true),
      });
    }

    if (currentEntityTab === "skills") {
      setSelectedSkillId(id);
      setSkillForm({
        id,
        categoryKey: String(item.categoryKey ?? ""),
        categoryTitleEn: String(item.categoryTitleEn ?? ""),
        categoryTitleBn: String(item.categoryTitleBn ?? ""),
        nameEn: String(item.nameEn ?? ""),
        nameBn: String(item.nameBn ?? ""),
        percentage: Number(item.percentage ?? 0),
        logoUrl: String(item.logoUrl ?? ""),
        sortOrder: Number(item.sortOrder ?? 0),
        isPublished: Boolean(item.isPublished ?? true),
      });
    }

    if (currentEntityTab === "team-members") {
      setSelectedTeamMemberId(id);
      setTeamMemberForm({
        id,
        memberCode: String(item.memberCode ?? ""),
        nameEn: String(item.nameEn ?? ""),
        nameBn: String(item.nameBn ?? ""),
        imageUrl: String(item.imageUrl ?? ""),
        portfolioUrl: String(item.portfolioUrl ?? ""),
        sortOrder: Number(item.sortOrder ?? 0),
        isPublished: Boolean(item.isPublished ?? true),
      });
    }

    if (currentEntityTab === "experiences") {
      setSelectedExperienceId(id);
      setExperienceForm({
        id,
        titleEn: String(item.titleEn ?? ""),
        titleBn: String(item.titleBn ?? ""),
        companyEn: String(item.companyEn ?? ""),
        companyBn: String(item.companyBn ?? ""),
        periodEn: String(item.periodEn ?? ""),
        periodBn: String(item.periodBn ?? ""),
        detailsEn: String(item.detailsEn ?? ""),
        detailsBn: String(item.detailsBn ?? ""),
        imageUrl: String(item.imageUrl ?? ""),
        link: String(item.link ?? ""),
        isCurrent: Boolean(item.isCurrent ?? false),
        sortOrder: Number(item.sortOrder ?? 0),
        isPublished: Boolean(item.isPublished ?? true),
      });
    }

    if (currentEntityTab === "projects") {
      setSelectedProjectId(id);
      setProjectForm({
        id,
        slug: String(item.slug ?? ""),
        titleEn: String(item.titleEn ?? ""),
        titleBn: String(item.titleBn ?? ""),
        typeEn: String(item.typeEn ?? ""),
        typeBn: String(item.typeBn ?? ""),
        detailsEn: String(item.detailsEn ?? ""),
        detailsBn: String(item.detailsBn ?? ""),
        level: String(item.level ?? "Beginner"),
        categoryEn: String(item.categoryEn ?? ""),
        categoryBn: String(item.categoryBn ?? ""),
        technologiesEn: String(item.technologiesEn ?? ""),
        technologiesBn: String(item.technologiesBn ?? ""),
        technologySkillIds: mapTechnologyNamesToSkillIds(String(item.technologiesEn ?? ""), skills),
        logoUrl: String(item.logoUrl ?? ""),
        coverImageUrl: String(item.coverImageUrl ?? ""),
        liveUrl: String(item.liveUrl ?? ""),
        memberCodes: Array.isArray(item.memberCodes) ? item.memberCodes.map((v) => String(v)) : [],
        customButtons: parseCustomButtons(item.customButtons),
        sortOrder: Number(item.sortOrder ?? 0),
        isPublished: Boolean(item.isPublished ?? true),
      });
    }

    if (currentEntityTab === "blogs") {
      setSelectedBlogId(id);
      setBlogForm({
        id,
        slug: String(item.slug ?? ""),
        titleEn: String(item.titleEn ?? ""),
        titleBn: String(item.titleBn ?? ""),
        fullDetailsEn: String(item.fullDetailsEn ?? ""),
        fullDetailsBn: String(item.fullDetailsBn ?? ""),
        mediaUrlsText: Array.isArray(item.mediaUrls) ? item.mediaUrls.map((v) => String(v)).join("\n") : "",
        coverImageUrl: String(item.coverImageUrl ?? ""),
        customButtons: parseCustomButtons(item.customButtons),
        authorNameEn: String(item.authorNameEn ?? ""),
        authorNameBn: String(item.authorNameBn ?? ""),
        tagsEn: String(item.tagsEn ?? ""),
        tagsBn: String(item.tagsBn ?? ""),
        timeToReadMinutes: Number(item.timeToReadMinutes ?? 5),
        uploadedAt: toDateInputValue(item.uploadedAt),
        sortOrder: Number(item.sortOrder ?? 0),
        isPublished: Boolean(item.isPublished ?? true),
      });
    }
  }

  function handleNewEntity() {
    if (!currentEntityTab) return;

    pendingSelectIdRef.current = null;

    if (currentEntityTab === "educations") {
      setSelectedEducationId(null);
      setEducationForm(DEFAULT_EDUCATION);
    }

    if (currentEntityTab === "skills") {
      setSelectedSkillId(null);
      setSkillForm(DEFAULT_SKILL);
    }

    if (currentEntityTab === "team-members") {
      setSelectedTeamMemberId(null);
      setTeamMemberForm(DEFAULT_TEAM_MEMBER);
    }

    if (currentEntityTab === "experiences") {
      setSelectedExperienceId(null);
      setExperienceForm(DEFAULT_EXPERIENCE);
    }

    if (currentEntityTab === "projects") {
      setSelectedProjectId(null);
      setProjectForm(DEFAULT_PROJECT);
    }

    if (currentEntityTab === "blogs") {
      setSelectedBlogId(null);
      setBlogForm(DEFAULT_BLOG);
    }
  }

  async function handleRequestPasswordOtp() {
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/auth/request-password-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword }),
      });

      const payload = await readJson<{ challengeId: string; maskedEmail: string }>(response);
      if (!response.ok) throw new Error(payload.error || "Failed to request OTP.");

      setSecurityChallengeId(payload.challengeId);
      setMaskedSecurityEmail(payload.maskedEmail);
      setMessage("Password change OTP sent.");
    } catch (securityError) {
      const securityMessage = securityError instanceof Error ? securityError.message : "Failed to request OTP.";
      setError(securityMessage);
    }
  }

  async function handleChangePassword() {
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId: securityChallengeId,
          otp: securityOtp,
          newPassword,
        }),
      });

      const payload = await readJson<{ ok?: boolean }>(response);
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Failed to change password.");
      }

      setMessage("Password changed successfully.");
      setSecurityOtp("");
      setSecurityChallengeId("");
      setMaskedSecurityEmail("");
      setCurrentPassword("");
      setNewPassword("");
    } catch (securityError) {
      const securityMessage = securityError instanceof Error ? securityError.message : "Failed to change password.";
      setError(securityMessage);
    }
  }

  return (
    <div className="lg:pl-60">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/30 bg-surface-container px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          className="rounded-xl bg-surface-container-low p-2 text-on-surface transition hover:bg-surface-container-high"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-on-surface">{activeTabLabel}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <ActiveTabIcon className="h-5 w-5" />
        </span>
      </div>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-outline-variant/30 bg-surface-container transition-transform duration-300 lg:w-60 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant/30 px-4 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Layers className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-on-surface">Admin CMS</p>
                <p className="text-[11px] text-on-surface-variant">Control Panel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
            {ADMIN_NAV.map(({ tab, label, icon: Icon }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive ? <ChevronRight className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-outline-variant/30 p-3">
            <div className="mb-2 rounded-xl bg-surface-container-low px-3 py-2">
              <p className="truncate text-xs font-semibold text-on-surface">{fullName?.trim() || email}</p>
              <p className="text-[11px] text-on-surface-variant">Signed in</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </aside>

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="hidden items-center justify-between gap-4 lg:flex">
            <div>
              <h1 className="text-2xl font-bold text-on-surface">{activeTabLabel}</h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                Signed in as {fullName?.trim() || email}
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ActiveTabIcon className="h-5 w-5" />
            </span>
          </div>

          <section className="rounded-3xl border border-outline-variant/30 bg-surface-container p-4 md:p-6">
          {activeTab !== "security" && activeTab !== "inbox" ? (
            <div className="mb-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
              <h2 className="text-sm font-semibold text-on-surface">Upload Settings</h2>
              <p className="mt-1 text-xs text-on-surface-variant">
                Image upload buttons use ImageBB API key from `.env` (`NEXT_PUBLIC_IMGBB_API_KEY`).
              </p>
              {imageBbApiKey ? null : (
                <p className="mt-2 text-xs text-red-500">Set NEXT_PUBLIC_IMGBB_API_KEY in .env to enable image uploads.</p>
              )}
            </div>
          ) : null}

          {activeTab === "site" ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-on-surface">Site Config (EN/BN + Navbar + Hero)</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <InputField label="Site Title (EN)" value={siteConfigForm.siteTitleEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, siteTitleEn: value }))} />
                <InputField label="Site Title (BN)" value={siteConfigForm.siteTitleBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, siteTitleBn: value }))} />
                <TextareaField label="Site Description (EN)" value={siteConfigForm.siteDescriptionEn} rows={3} onChange={(value) => setSiteConfigForm((p) => ({ ...p, siteDescriptionEn: value }))} />
                <TextareaField label="Site Description (BN)" value={siteConfigForm.siteDescriptionBn} rows={3} onChange={(value) => setSiteConfigForm((p) => ({ ...p, siteDescriptionBn: value }))} />
                <InputField label="Hero Hello (EN)" value={siteConfigForm.heroHelloEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroHelloEn: value }))} />
                <InputField label="Hero Hello (BN)" value={siteConfigForm.heroHelloBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroHelloBn: value }))} />
                <InputField label="Hero I am (EN)" value={siteConfigForm.heroIamEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroIamEn: value }))} />
                <InputField label="Hero I am (BN)" value={siteConfigForm.heroIamBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroIamBn: value }))} />
                <InputField label="Hero First Name (EN)" value={siteConfigForm.heroFirstNameEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroFirstNameEn: value }))} />
                <InputField label="Hero First Name (BN)" value={siteConfigForm.heroFirstNameBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroFirstNameBn: value }))} />
                <InputField label="Hero Last Name (EN)" value={siteConfigForm.heroLastNameEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroLastNameEn: value }))} />
                <InputField label="Hero Last Name (BN)" value={siteConfigForm.heroLastNameBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroLastNameBn: value }))} />
                <TextareaField label="Hero Description (EN)" value={siteConfigForm.heroDescriptionEn} rows={4} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroDescriptionEn: value }))} />
                <TextareaField label="Hero Description (BN)" value={siteConfigForm.heroDescriptionBn} rows={4} onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroDescriptionBn: value }))} />
                <TextareaField label="About Description (EN)" value={siteConfigForm.aboutDescriptionEn} rows={4} onChange={(value) => setSiteConfigForm((p) => ({ ...p, aboutDescriptionEn: value }))} />
                <TextareaField label="About Description (BN)" value={siteConfigForm.aboutDescriptionBn} rows={4} onChange={(value) => setSiteConfigForm((p) => ({ ...p, aboutDescriptionBn: value }))} />
                <TextareaField label="About Secondary Description (EN)" value={siteConfigForm.aboutSecondaryDescriptionEn} rows={4} onChange={(value) => setSiteConfigForm((p) => ({ ...p, aboutSecondaryDescriptionEn: value }))} />
                <TextareaField label="About Secondary Description (BN)" value={siteConfigForm.aboutSecondaryDescriptionBn} rows={4} onChange={(value) => setSiteConfigForm((p) => ({ ...p, aboutSecondaryDescriptionBn: value }))} />
                <InputField label="Years Experience" type="number" value={siteConfigForm.yearsExperience} onChange={(value) => setSiteConfigForm((p) => ({ ...p, yearsExperience: toNumber(value) }))} />
                <InputField label="Projects Section Title (EN)" value={siteConfigForm.projectsSectionTitleEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, projectsSectionTitleEn: value }))} />
                <InputField label="Projects Section Title (BN)" value={siteConfigForm.projectsSectionTitleBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, projectsSectionTitleBn: value }))} />
                <InputField label="Blogs Section Title (EN)" value={siteConfigForm.blogsSectionTitleEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, blogsSectionTitleEn: value }))} />
                <InputField label="Blogs Section Title (BN)" value={siteConfigForm.blogsSectionTitleBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, blogsSectionTitleBn: value }))} />
                <TextareaField
                  label="Problem Solving Summary (EN)"
                  value={siteConfigForm.problemSolvingSummaryEn}
                  rows={3}
                  onChange={(value) => setSiteConfigForm((p) => ({ ...p, problemSolvingSummaryEn: value }))}
                />
                <TextareaField
                  label="Problem Solving Summary (BN)"
                  value={siteConfigForm.problemSolvingSummaryBn}
                  rows={3}
                  onChange={(value) => setSiteConfigForm((p) => ({ ...p, problemSolvingSummaryBn: value }))}
                />
              </div>

              <h3 className="pt-2 text-lg font-semibold text-on-surface">Navbar Labels</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <InputField label="Home (EN)" value={siteConfigForm.navHomeEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navHomeEn: value }))} />
                <InputField label="Home (BN)" value={siteConfigForm.navHomeBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navHomeBn: value }))} />
                <InputField label="About (EN)" value={siteConfigForm.navAboutEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navAboutEn: value }))} />
                <InputField label="About (BN)" value={siteConfigForm.navAboutBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navAboutBn: value }))} />
                <InputField label="Education (EN)" value={siteConfigForm.navEducationEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navEducationEn: value }))} />
                <InputField label="Education (BN)" value={siteConfigForm.navEducationBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navEducationBn: value }))} />
                <InputField label="Skills (EN)" value={siteConfigForm.navSkillsEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navSkillsEn: value }))} />
                <InputField label="Skills (BN)" value={siteConfigForm.navSkillsBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navSkillsBn: value }))} />
                <InputField label="Projects (EN)" value={siteConfigForm.navProjectsEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navProjectsEn: value }))} />
                <InputField label="Projects (BN)" value={siteConfigForm.navProjectsBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navProjectsBn: value }))} />
                <InputField label="Blogs (EN)" value={siteConfigForm.navBlogsEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navBlogsEn: value }))} />
                <InputField label="Blogs (BN)" value={siteConfigForm.navBlogsBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navBlogsBn: value }))} />
                <InputField label="Contact (EN)" value={siteConfigForm.navContactEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navContactEn: value }))} />
                <InputField label="Contact (BN)" value={siteConfigForm.navContactBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navContactBn: value }))} />
                <InputField label="CV (EN)" value={siteConfigForm.navCvEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navCvEn: value }))} />
                <InputField label="CV (BN)" value={siteConfigForm.navCvBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, navCvBn: value }))} />
              </div>

              <h3 className="pt-2 text-lg font-semibold text-on-surface">Assets and Contact</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <ImageUrlField
                  label="Logo Light URL"
                  value={siteConfigForm.logoLightUrl}
                  onChange={(value) => setSiteConfigForm((p) => ({ ...p, logoLightUrl: value }))}
                  isUploading={uploadingField === "logoLightUrl"}
                  onFileUpload={(file) => {
                    void handleImageFieldUpload(file, "logoLightUrl", (url) => {
                      setSiteConfigForm((p) => ({ ...p, logoLightUrl: url }));
                    });
                  }}
                />
                <ImageUrlField
                  label="Logo Dark URL"
                  value={siteConfigForm.logoDarkUrl}
                  onChange={(value) => setSiteConfigForm((p) => ({ ...p, logoDarkUrl: value }))}
                  isUploading={uploadingField === "logoDarkUrl"}
                  onFileUpload={(file) => {
                    void handleImageFieldUpload(file, "logoDarkUrl", (url) => {
                      setSiteConfigForm((p) => ({ ...p, logoDarkUrl: url }));
                    });
                  }}
                />
                <ImageUrlField
                  label="Hero Banner Image URL"
                  value={siteConfigForm.heroImageUrl}
                  onChange={(value) => setSiteConfigForm((p) => ({ ...p, heroImageUrl: value }))}
                  isUploading={uploadingField === "heroImageUrl"}
                onFileUpload={(file) => {
                  void handleImageFieldUpload(
                    file,
                    "heroImageUrl",
                    (url) => {
                      setSiteConfigForm((p) => ({ ...p, heroImageUrl: url }));
                    },
                    { preferOriginal: true },
                  );
                }}
                />
                <ImageUrlField
                  label="About Image Primary URL"
                  value={siteConfigForm.aboutImagePrimaryUrl}
                  onChange={(value) => setSiteConfigForm((p) => ({ ...p, aboutImagePrimaryUrl: value }))}
                  isUploading={uploadingField === "aboutImagePrimaryUrl"}
                  onFileUpload={(file) => {
                    void handleImageFieldUpload(file, "aboutImagePrimaryUrl", (url) => {
                      setSiteConfigForm((p) => ({ ...p, aboutImagePrimaryUrl: url }));
                    });
                  }}
                />
                <ImageUrlField
                  label="About Image Secondary URL"
                  value={siteConfigForm.aboutImageSecondaryUrl}
                  onChange={(value) => setSiteConfigForm((p) => ({ ...p, aboutImageSecondaryUrl: value }))}
                  isUploading={uploadingField === "aboutImageSecondaryUrl"}
                  onFileUpload={(file) => {
                    void handleImageFieldUpload(file, "aboutImageSecondaryUrl", (url) => {
                      setSiteConfigForm((p) => ({ ...p, aboutImageSecondaryUrl: url }));
                    });
                  }}
                />
                <ImageUrlField
                  label="About Image Tertiary URL"
                  value={siteConfigForm.aboutImageTertiaryUrl}
                  onChange={(value) => setSiteConfigForm((p) => ({ ...p, aboutImageTertiaryUrl: value }))}
                  isUploading={uploadingField === "aboutImageTertiaryUrl"}
                  onFileUpload={(file) => {
                    void handleImageFieldUpload(file, "aboutImageTertiaryUrl", (url) => {
                      setSiteConfigForm((p) => ({ ...p, aboutImageTertiaryUrl: url }));
                    });
                  }}
                />
                <InputField label="Contact Email" type="email" value={siteConfigForm.contactEmail} onChange={(value) => setSiteConfigForm((p) => ({ ...p, contactEmail: value }))} />
                <InputField label="Contact Phone" value={siteConfigForm.contactPhone} onChange={(value) => setSiteConfigForm((p) => ({ ...p, contactPhone: value }))} />
                <InputField label="Location (EN)" value={siteConfigForm.contactLocationEn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, contactLocationEn: value }))} />
                <InputField label="Location (BN)" value={siteConfigForm.contactLocationBn} onChange={(value) => setSiteConfigForm((p) => ({ ...p, contactLocationBn: value }))} />
                <div className="space-y-2 md:col-span-2">
                  <TextareaField
                    label="CV Field (Base64/Data URL)"
                    rows={3}
                    value={siteConfigForm.cvUrl}
                    onChange={(value) => setSiteConfigForm((p) => ({ ...p, cvUrl: value }))}
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-semibold text-on-surface">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(event) => {
                        const selected = event.target.files?.[0];
                        if (selected) {
                          void handleCvFileUpload(selected);
                        }
                        event.currentTarget.value = "";
                      }}
                    />
                    {uploadingField === "cvUrl" ? "Converting..." : "Upload CV File (stores base64)"}
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void handleSaveSiteConfig();
                  }}
                  disabled={isSaving || isLoading}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Save Site Config"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void loadSiteConfig();
                  }}
                  disabled={isLoading}
                  className="rounded-xl border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface"
                >
                  Reload
                </button>
              </div>
            </div>
          ) : null}

          {currentEntityTab ? (
            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-3">
                <h2 className="text-sm font-semibold text-on-surface">{ENTITY_CONFIG[currentEntityTab].label}</h2>
                <p className="mt-1 text-xs text-on-surface-variant">Select a record to edit, or create a new one.</p>
                <button
                  type="button"
                  onClick={handleNewEntity}
                  className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"
                >
                  + New Record
                </button>
                <div className="mt-3 max-h-87.5 space-y-2 overflow-y-auto">
                  {currentList.map((item) => {
                    const id = String(item.id ?? "");
                    const selectedId =
                      currentEntityTab === "educations"
                        ? selectedEducationId
                        : currentEntityTab === "skills"
                          ? selectedSkillId
                          : currentEntityTab === "team-members"
                            ? selectedTeamMemberId
                            : currentEntityTab === "experiences"
                              ? selectedExperienceId
                            : currentEntityTab === "projects"
                              ? selectedProjectId
                              : selectedBlogId;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelectEntity(id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                          selectedId === id
                            ? "border-primary bg-primary/15 text-on-surface"
                            : "border-outline-variant/40 bg-surface text-on-surface-variant"
                        }`}
                      >
                        {recordLabel(item, currentEntityTab)}
                      </button>
                    );
                  })}
                  {currentList.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-outline-variant/40 p-3 text-xs text-on-surface-variant">
                      No records yet.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-on-surface">{ENTITY_CONFIG[currentEntityTab].label} Form</h2>

                {currentEntityTab === "educations" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <InputField label="Degree (EN)" value={educationForm.degreeEn} onChange={(value) => setEducationForm((p) => ({ ...p, degreeEn: value }))} />
                    <InputField label="Degree (BN)" value={educationForm.degreeBn} onChange={(value) => setEducationForm((p) => ({ ...p, degreeBn: value }))} />
                    <InputField label="Subject (EN)" value={educationForm.subjectEn} onChange={(value) => setEducationForm((p) => ({ ...p, subjectEn: value }))} />
                    <InputField label="Subject (BN)" value={educationForm.subjectBn} onChange={(value) => setEducationForm((p) => ({ ...p, subjectBn: value }))} />
                    <InputField label="Year Label" value={educationForm.yearLabel} onChange={(value) => setEducationForm((p) => ({ ...p, yearLabel: value }))} />
                    <InputField label="Result (EN)" value={educationForm.resultEn} onChange={(value) => setEducationForm((p) => ({ ...p, resultEn: value }))} />
                    <InputField label="Result (BN)" value={educationForm.resultBn} onChange={(value) => setEducationForm((p) => ({ ...p, resultBn: value }))} />
                    <InputField label="Institution (EN)" value={educationForm.institutionEn} onChange={(value) => setEducationForm((p) => ({ ...p, institutionEn: value }))} />
                    <InputField label="Institution (BN)" value={educationForm.institutionBn} onChange={(value) => setEducationForm((p) => ({ ...p, institutionBn: value }))} />
                    {/* Education Image Upload with 1:1 Crop */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold text-on-surface">Institution Logo / Image (1:1 Ratio)</label>
                      <div className="flex flex-wrap items-center gap-3">
                        <ImagePreview src={educationForm.imageUrl} alt="Education logo preview" />
                        <div className="flex-1 min-w-50 space-y-1.5">
                          <InputField
                            label="Image URL (ImageBB or direct link)"
                            value={educationForm.imageUrl}
                            onChange={(value) => setEducationForm((p) => ({ ...p, imageUrl: value }))}
                          />
                          <div className="flex items-center gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => {
                                  const selected = event.target.files?.[0];
                                  if (selected) {
                                    setCropEducationFile(selected);
                                    setIsCroppingEducation(true);
                                  }
                                  event.currentTarget.value = "";
                                }}
                              />
                              Upload & Crop Image (1:1)
                            </label>
                            {educationForm.imageUrl ? (
                              <button
                                type="button"
                                onClick={() => setEducationForm((p) => ({ ...p, imageUrl: "" }))}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Education Link */}
                    <div className="md:col-span-2">
                      <InputField
                        label="Link / Website URL (optional - opens in new tab when degree is tapped)"
                        value={educationForm.link}
                        onChange={(value) => setEducationForm((p) => ({ ...p, link: value }))}
                      />
                    </div>

                    <InputField label="Sort Order" type="number" value={educationForm.sortOrder} onChange={(value) => setEducationForm((p) => ({ ...p, sortOrder: toNumber(value) }))} />
                    <div className="mt-6 flex flex-wrap items-center gap-6">
                      <label className="inline-flex items-center gap-2 text-sm text-on-surface">
                        <input
                          type="checkbox"
                          checked={educationForm.isCurrent}
                          onChange={(event) => setEducationForm((p) => ({ ...p, isCurrent: event.target.checked }))}
                        />
                        Currently studying here
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-on-surface">
                        <input
                          type="checkbox"
                          checked={educationForm.isPublished}
                          onChange={(event) => setEducationForm((p) => ({ ...p, isPublished: event.target.checked }))}
                        />
                        Published
                      </label>
                    </div>
                    <TextareaField label="Details (EN)" value={educationForm.detailsEn} rows={4} onChange={(value) => setEducationForm((p) => ({ ...p, detailsEn: value }))} />
                    <TextareaField label="Details (BN)" value={educationForm.detailsBn} rows={4} onChange={(value) => setEducationForm((p) => ({ ...p, detailsBn: value }))} />
                  </div>
                ) : null}

                {currentEntityTab === "skills" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <InputField label="Category Key" value={skillForm.categoryKey} onChange={(value) => setSkillForm((p) => ({ ...p, categoryKey: value }))} />
                    <InputField label="Category Title (EN)" value={skillForm.categoryTitleEn} onChange={(value) => setSkillForm((p) => ({ ...p, categoryTitleEn: value }))} />
                    <InputField label="Category Title (BN)" value={skillForm.categoryTitleBn} onChange={(value) => setSkillForm((p) => ({ ...p, categoryTitleBn: value }))} />
                    <InputField label="Skill Name (EN)" value={skillForm.nameEn} onChange={(value) => setSkillForm((p) => ({ ...p, nameEn: value }))} />
                    <InputField label="Skill Name (BN)" value={skillForm.nameBn} onChange={(value) => setSkillForm((p) => ({ ...p, nameBn: value }))} />
                    <InputField label="Percentage" type="number" value={skillForm.percentage} onChange={(value) => setSkillForm((p) => ({ ...p, percentage: toNumber(value) }))} />
                    <ImageUrlField
                      label="Logo URL"
                      value={skillForm.logoUrl}
                      onChange={(value) => setSkillForm((p) => ({ ...p, logoUrl: value }))}
                      isUploading={uploadingField === "skill.logoUrl"}
                      onFileUpload={(file) => {
                        void handleImageFieldUpload(file, "skill.logoUrl", (url) => {
                          setSkillForm((p) => ({ ...p, logoUrl: url }));
                        });
                      }}
                    />
                    <InputField label="Sort Order" type="number" value={skillForm.sortOrder} onChange={(value) => setSkillForm((p) => ({ ...p, sortOrder: toNumber(value) }))} />
                    <label className="mt-6 inline-flex items-center gap-2 text-sm text-on-surface">
                      <input
                        type="checkbox"
                        checked={skillForm.isPublished}
                        onChange={(event) => setSkillForm((p) => ({ ...p, isPublished: event.target.checked }))}
                      />
                      Published
                    </label>
                  </div>
                ) : null}

                {currentEntityTab === "team-members" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <InputField label="Member Code" value={teamMemberForm.memberCode} onChange={(value) => setTeamMemberForm((p) => ({ ...p, memberCode: value }))} />
                    <InputField label="Name (EN)" value={teamMemberForm.nameEn} onChange={(value) => setTeamMemberForm((p) => ({ ...p, nameEn: value }))} />
                    <InputField label="Name (BN)" value={teamMemberForm.nameBn} onChange={(value) => setTeamMemberForm((p) => ({ ...p, nameBn: value }))} />
                    <ImageUrlField
                      label="Image URL"
                      value={teamMemberForm.imageUrl}
                      onChange={(value) => setTeamMemberForm((p) => ({ ...p, imageUrl: value }))}
                      isUploading={uploadingField === "teamMember.imageUrl"}
                      onFileUpload={(file) => {
                        void handleImageFieldUpload(file, "teamMember.imageUrl", (url) => {
                          setTeamMemberForm((p) => ({ ...p, imageUrl: url }));
                        });
                      }}
                    />
                    <InputField label="Portfolio URL" value={teamMemberForm.portfolioUrl} onChange={(value) => setTeamMemberForm((p) => ({ ...p, portfolioUrl: value }))} />
                    <InputField label="Sort Order" type="number" value={teamMemberForm.sortOrder} onChange={(value) => setTeamMemberForm((p) => ({ ...p, sortOrder: toNumber(value) }))} />
                    <label className="mt-6 inline-flex items-center gap-2 text-sm text-on-surface">
                      <input
                        type="checkbox"
                        checked={teamMemberForm.isPublished}
                        onChange={(event) => setTeamMemberForm((p) => ({ ...p, isPublished: event.target.checked }))}
                      />
                      Published
                    </label>
                  </div>
                ) : null}

                {currentEntityTab === "experiences" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <InputField label="Title (EN)" value={experienceForm.titleEn} onChange={(value) => setExperienceForm((p) => ({ ...p, titleEn: value }))} />
                    <InputField label="Title (BN)" value={experienceForm.titleBn} onChange={(value) => setExperienceForm((p) => ({ ...p, titleBn: value }))} />
                    <InputField label="Company (EN)" value={experienceForm.companyEn} onChange={(value) => setExperienceForm((p) => ({ ...p, companyEn: value }))} />
                    <InputField label="Company (BN)" value={experienceForm.companyBn} onChange={(value) => setExperienceForm((p) => ({ ...p, companyBn: value }))} />
                    <InputField label="Period (EN)" value={experienceForm.periodEn} onChange={(value) => setExperienceForm((p) => ({ ...p, periodEn: value }))} />
                    <InputField label="Period (BN)" value={experienceForm.periodBn} onChange={(value) => setExperienceForm((p) => ({ ...p, periodBn: value }))} />

                    {/* Experience Image Upload with 1:1 Crop */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold text-on-surface">Experience Logo / Image (1:1 Ratio)</label>
                      <div className="flex flex-wrap items-center gap-3">
                        <ImagePreview src={experienceForm.imageUrl} alt="Experience logo preview" />
                        <div className="flex-1 min-w-50 space-y-1.5">
                          <InputField
                            label="Image URL (ImageBB or direct link)"
                            value={experienceForm.imageUrl}
                            onChange={(value) => setExperienceForm((p) => ({ ...p, imageUrl: value }))}
                          />
                          <div className="flex items-center gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => {
                                  const selected = event.target.files?.[0];
                                  if (selected) {
                                    setCropExperienceFile(selected);
                                    setIsCroppingExperience(true);
                                  }
                                  event.currentTarget.value = "";
                                }}
                              />
                              Upload & Crop Image (1:1)
                            </label>
                            {experienceForm.imageUrl ? (
                              <button
                                type="button"
                                onClick={() => setExperienceForm((p) => ({ ...p, imageUrl: "" }))}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Experience Link */}
                    <div className="md:col-span-2">
                      <InputField
                        label="Link / Website URL (optional - opens in new tab when title is tapped)"
                        value={experienceForm.link}
                        onChange={(value) => setExperienceForm((p) => ({ ...p, link: value }))}
                      />
                    </div>

                    <InputField label="Sort Order" type="number" value={experienceForm.sortOrder} onChange={(value) => setExperienceForm((p) => ({ ...p, sortOrder: toNumber(value) }))} />
                    <div className="mt-6 flex flex-wrap items-center gap-6">
                      <label className="inline-flex items-center gap-2 text-sm text-on-surface">
                        <input
                          type="checkbox"
                          checked={experienceForm.isCurrent}
                          onChange={(event) => setExperienceForm((p) => ({ ...p, isCurrent: event.target.checked }))}
                        />
                        Currently working here
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-on-surface">
                        <input
                          type="checkbox"
                          checked={experienceForm.isPublished}
                          onChange={(event) => setExperienceForm((p) => ({ ...p, isPublished: event.target.checked }))}
                        />
                        Published
                      </label>
                    </div>
                    <TextareaField label="Details (EN)" value={experienceForm.detailsEn} rows={4} onChange={(value) => setExperienceForm((p) => ({ ...p, detailsEn: value }))} />
                    <TextareaField label="Details (BN)" value={experienceForm.detailsBn} rows={4} onChange={(value) => setExperienceForm((p) => ({ ...p, detailsBn: value }))} />
                  </div>
                ) : null}

                {currentEntityTab === "projects" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <InputField label="Slug" value={projectForm.slug} onChange={(value) => setProjectForm((p) => ({ ...p, slug: value }))} />
                    <InputField label="Title (EN)" value={projectForm.titleEn} onChange={(value) => setProjectForm((p) => ({ ...p, titleEn: value }))} />
                    <InputField label="Title (BN)" value={projectForm.titleBn} onChange={(value) => setProjectForm((p) => ({ ...p, titleBn: value }))} />
                    <InputField label="Type (EN)" value={projectForm.typeEn} onChange={(value) => setProjectForm((p) => ({ ...p, typeEn: value }))} />
                    <InputField label="Type (BN)" value={projectForm.typeBn} onChange={(value) => setProjectForm((p) => ({ ...p, typeBn: value }))} />
                    <InputField label="Level" value={projectForm.level} onChange={(value) => setProjectForm((p) => ({ ...p, level: value }))} />
                    <InputField label="Category (EN)" value={projectForm.categoryEn} onChange={(value) => setProjectForm((p) => ({ ...p, categoryEn: value }))} />
                    <InputField label="Category (BN)" value={projectForm.categoryBn} onChange={(value) => setProjectForm((p) => ({ ...p, categoryBn: value }))} />
                    <label className="space-y-1 text-sm md:col-span-2">
                      <span className="text-on-surface">Technologies (from Skills)</span>
                      <select
                        multiple
                        value={projectForm.technologySkillIds}
                        onChange={(event) => {
                          const selected = parseMultiSelectValues(event.currentTarget.options);
                          setProjectForm((previous) => ({ ...previous, technologySkillIds: selected }));
                        }}
                        className="h-40 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                      >
                        {skills.map((skill) => {
                          const id = String(skill.id ?? "");
                          const nameEn = String(skill.nameEn ?? id);
                          const nameBn = String(skill.nameBn ?? "");
                          return (
                            <option key={id} value={id}>
                              {nameEn}
                              {nameBn ? ` | ${nameBn}` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <ImageUrlField
                      label="Logo URL"
                      value={projectForm.logoUrl}
                      onChange={(value) => setProjectForm((p) => ({ ...p, logoUrl: value }))}
                      isUploading={uploadingField === "project.logoUrl"}
                      onFileUpload={(file) => {
                        void handleProjectLogoUpload(file);
                      }}
                    />
                    <ImageUrlField
                      label="Cover Image URL"
                      value={projectForm.coverImageUrl}
                      onChange={(value) => setProjectForm((p) => ({ ...p, coverImageUrl: value }))}
                      isUploading={uploadingField === "project.coverImageUrl"}
                      onFileUpload={(file) => {
                        void handleImageFieldUpload(file, "project.coverImageUrl", (url) => {
                          setProjectForm((p) => ({ ...p, coverImageUrl: url }));
                        });
                      }}
                    />
                    <InputField label="Live URL" value={projectForm.liveUrl} onChange={(value) => setProjectForm((p) => ({ ...p, liveUrl: value }))} />
                    <InputField label="Sort Order" type="number" value={projectForm.sortOrder} onChange={(value) => setProjectForm((p) => ({ ...p, sortOrder: toNumber(value) }))} />
                    <label className="mt-6 inline-flex items-center gap-2 text-sm text-on-surface">
                      <input
                        type="checkbox"
                        checked={projectForm.isPublished}
                        onChange={(event) => setProjectForm((p) => ({ ...p, isPublished: event.target.checked }))}
                      />
                      Published
                    </label>
                    <TextareaField label="Details (EN)" value={projectForm.detailsEn} rows={4} onChange={(value) => setProjectForm((p) => ({ ...p, detailsEn: value }))} />
                    <TextareaField label="Details (BN)" value={projectForm.detailsBn} rows={4} onChange={(value) => setProjectForm((p) => ({ ...p, detailsBn: value }))} />
                    <label className="space-y-1 text-sm md:col-span-2">
                      <span className="text-on-surface">Team Members</span>
                      <select
                        multiple
                        value={projectForm.memberCodes}
                        onChange={(event) => {
                          const selected = parseMultiSelectValues(event.currentTarget.options);
                          setProjectForm((previous) => ({ ...previous, memberCodes: selected }));
                        }}
                        className="h-32 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                      >
                        {teamMembers.map((member) => {
                          const code = String(member.memberCode ?? "");
                          if (!code) return null;
                          const label = String(member.nameEn ?? member.nameBn ?? code);
                          return (
                            <option key={code} value={code}>
                              {label} ({code})
                            </option>
                          );
                        })}
                      </select>
                    </label>

                    {/* Custom Action Buttons Manager */}
                    <CustomButtonsManager
                      buttons={projectForm.customButtons}
                      onAdd={handleAddCustomButton}
                      onUpdate={handleUpdateCustomButton}
                      onRemove={handleRemoveCustomButton}
                      onMove={handleMoveCustomButton}
                    />
                  </div>
                ) : null}

                {currentEntityTab === "blogs" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <InputField label="Slug" value={blogForm.slug} onChange={(value) => setBlogForm((p) => ({ ...p, slug: value }))} />
                    <InputField label="Title (EN)" value={blogForm.titleEn} onChange={(value) => setBlogForm((p) => ({ ...p, titleEn: value }))} />
                    <InputField label="Title (BN)" value={blogForm.titleBn} onChange={(value) => setBlogForm((p) => ({ ...p, titleBn: value }))} />
                    <InputField label="Read Time (minutes)" type="number" value={blogForm.timeToReadMinutes} onChange={(value) => setBlogForm((p) => ({ ...p, timeToReadMinutes: toNumber(value) }))} />
                    <InputField label="Uploaded At" type="datetime-local" value={blogForm.uploadedAt} onChange={(value) => setBlogForm((p) => ({ ...p, uploadedAt: value }))} />
                    <InputField label="Sort Order" type="number" value={blogForm.sortOrder} onChange={(value) => setBlogForm((p) => ({ ...p, sortOrder: toNumber(value) }))} />
                    <ImageUrlField
                      label="Cover Image URL"
                      value={blogForm.coverImageUrl}
                      onChange={(value) => setBlogForm((p) => ({ ...p, coverImageUrl: value }))}
                      isUploading={uploadingField === "blog.coverImageUrl"}
                      onFileUpload={(file) => {
                        void handleImageFieldUpload(file, "blog.coverImageUrl", (url) => {
                          setBlogForm((p) => ({ ...p, coverImageUrl: url }));
                        });
                      }}
                    />
                    <label className="mt-6 inline-flex items-center gap-2 text-sm text-on-surface">
                      <input
                        type="checkbox"
                        checked={blogForm.isPublished}
                        onChange={(event) => setBlogForm((p) => ({ ...p, isPublished: event.target.checked }))}
                      />
                      Published
                    </label>

                    {/* Blog Author Section with Team Members Fetch & Custom Setting Option */}
                    <BlogAuthorSection
                      authorNameEn={blogForm.authorNameEn}
                      authorNameBn={blogForm.authorNameBn}
                      teamMembers={teamMembers}
                      onChangeEn={(value) => setBlogForm((p) => ({ ...p, authorNameEn: value }))}
                      onChangeBn={(value) => setBlogForm((p) => ({ ...p, authorNameBn: value }))}
                    />

                    {/* Blog Tags Section with Existing Tags & Add New Tag Option */}
                    <div className="space-y-4 rounded-2xl border border-outline-variant/30 bg-surface-container/60 p-4 sm:p-5 md:col-span-2">
                      <div className="border-b border-outline-variant/20 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-semibold text-on-surface">Blog Tags</h3>
                        </div>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          Select from existing tags across your blogs or add new tags for English and Bengali.
                        </p>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <BlogTagsField
                          label="Tags (EN)"
                          langLabel="EN"
                          value={blogForm.tagsEn}
                          existingTags={existingTagsEn}
                          onChange={(value) => setBlogForm((p) => ({ ...p, tagsEn: value }))}
                        />
                        <BlogTagsField
                          label="Tags (BN)"
                          langLabel="BN"
                          value={blogForm.tagsBn}
                          existingTags={existingTagsBn}
                          onChange={(value) => setBlogForm((p) => ({ ...p, tagsBn: value }))}
                        />
                      </div>
                    </div>
                    <WysiwygField label="Full Details (EN)" value={blogForm.fullDetailsEn} onChange={(value) => setBlogForm((p) => ({ ...p, fullDetailsEn: value }))} />
                    <WysiwygField label="Full Details (BN)" value={blogForm.fullDetailsBn} onChange={(value) => setBlogForm((p) => ({ ...p, fullDetailsBn: value }))} />
                    <div className="space-y-2 md:col-span-2">
                      <TextareaField
                        label="Media URLs (comma/new line)"
                        value={blogForm.mediaUrlsText}
                        rows={4}
                        onChange={(value) => setBlogForm((p) => ({ ...p, mediaUrlsText: value }))}
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-semibold text-on-surface">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const selected = event.target.files?.[0];
                            if (selected) {
                              void handleImageFieldUpload(selected, "blog.mediaUrls", (url) => {
                                setBlogForm((previous) => {
                                  const trimmed = previous.mediaUrlsText.trim();
                                  const nextValue = trimmed ? `${trimmed}, ${url}` : url;
                                  return { ...previous, mediaUrlsText: nextValue };
                                });
                              });
                            }
                            event.currentTarget.value = "";
                          }}
                        />
                        {uploadingField === "blog.mediaUrls" ? "Uploading..." : "Upload Media Image"}
                      </label>
                      {parseArrayText(blogForm.mediaUrlsText).length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {parseArrayText(blogForm.mediaUrlsText).map((url, index) => (
                            <ImagePreview
                              key={`${url}-${index}`}
                              src={url}
                              alt={`Blog media ${index + 1} preview`}
                              className="h-16 w-24"
                            />
                          ))}
                        </div>
                      ) : (
                        <ImagePreview src="" alt="Blog media placeholder" className="h-16 w-24" />
                      )}
                    </div>

                    {/* Custom Action Buttons Manager */}
                    <CustomButtonsManager
                      buttons={blogForm.customButtons}
                      onAdd={handleAddBlogButton}
                      onUpdate={handleUpdateBlogButton}
                      onRemove={handleRemoveBlogButton}
                      onMove={handleMoveBlogButton}
                      title="Custom Blog Buttons"
                      description="Add custom links (references, source, related reads, etc.) with custom colors and selectable icons."
                    />
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void handleSaveEntity();
                    }}
                    disabled={isSaving || isLoading}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving
                      ? "Saving..."
                      : (
                          currentEntityTab === "educations"
                            ? selectedEducationId
                            : currentEntityTab === "skills"
                              ? selectedSkillId
                              : currentEntityTab === "team-members"
                                ? selectedTeamMemberId
                                : currentEntityTab === "experiences"
                                  ? selectedExperienceId
                                : currentEntityTab === "projects"
                                  ? selectedProjectId
                                  : selectedBlogId
                        )
                        ? "Update"
                        : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDeleteEntity();
                    }}
                    disabled={
                      isSaving ||
                      isLoading ||
                      !(
                        currentEntityTab === "educations"
                          ? selectedEducationId
                          : currentEntityTab === "skills"
                            ? selectedSkillId
                            : currentEntityTab === "team-members"
                              ? selectedTeamMemberId
                              : currentEntityTab === "experiences"
                                ? selectedExperienceId
                              : currentEntityTab === "projects"
                                ? selectedProjectId
                                : selectedBlogId
                      )
                    }
                    className="rounded-xl border border-red-400/60 px-4 py-2 text-sm font-semibold text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void loadEntity(currentEntityTab);
                    }}
                    disabled={isLoading}
                    className="rounded-xl border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface"
                  >
                    Reload
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "inbox" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-on-surface">Contact Message Inbox</h2>
                <button
                  type="button"
                  onClick={() => {
                    void loadContactMessages();
                  }}
                  disabled={isLoading}
                  className="rounded-xl border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface"
                >
                  Reload
                </button>
              </div>

              {contactMessages.length === 0 ? (
                <p className="rounded-xl border border-dashed border-outline-variant/40 p-4 text-sm text-on-surface-variant">
                  No contact messages yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {contactMessages.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-on-surface">{item.name}</h3>
                        <span className="text-xs text-on-surface-variant">{formatDateTime(item.createdAt)}</span>
                      </div>

                      <div className="mb-2 grid gap-2 text-sm md:grid-cols-2">
                        <p className="text-on-surface-variant">
                          <span className="font-semibold text-on-surface">Email:</span>{" "}
                          <a href={`mailto:${item.email}`} className="text-primary underline underline-offset-2">
                            {item.email}
                          </a>
                        </p>
                        <p className="text-on-surface-variant">
                          <span className="font-semibold text-on-surface">Subject:</span> {item.subject || "General Inquiry"}
                        </p>
                      </div>

                      <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">{item.message}</p>

                      <p className="mt-3 text-xs text-on-surface-variant">
                        Response Status: {item.respondedAt ? `Auto-response sent at ${formatDateTime(item.respondedAt)}` : "Pending"}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "security" ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-on-surface">Admin Password Change (with OTP)</h2>
              <p className="text-sm text-on-surface-variant">
                Step 1: Verify current password and request OTP. Step 2: Submit OTP and new password.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-on-surface">Current Password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      void handleRequestPasswordOtp();
                    }}
                    className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Request OTP
                  </button>
                </div>
              </div>

              {maskedSecurityEmail ? (
                <p className="text-xs text-on-surface-variant">OTP sent to {maskedSecurityEmail}</p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-on-surface">OTP Code</span>
                  <input
                    type="text"
                    value={securityOtp}
                    onChange={(event) => setSecurityOtp(event.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 font-mono text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-on-surface">New Password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-on-surface outline-none focus:border-primary"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleChangePassword();
                }}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
              >
                Change Password
              </button>
            </div>
          ) : null}

          {isLoading ? <p className="mt-4 text-sm text-on-surface-variant">Loading...</p> : null}
          {message ? <p className="mt-4 text-sm text-green-600">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
          </section>
        </div>

      <ImageCropModal
        isOpen={isCroppingExperience}
        imageFile={cropExperienceFile}
        onClose={() => {
          setIsCroppingExperience(false);
          setCropExperienceFile(null);
        }}
        onCropComplete={handleExperienceCropComplete}
        isProcessing={isProcessingExperienceCrop}
      />

      <ImageCropModal
        isOpen={isCroppingEducation}
        imageFile={cropEducationFile}
        onClose={() => {
          setIsCroppingEducation(false);
          setCropEducationFile(null);
        }}
        onCropComplete={handleEducationCropComplete}
        isProcessing={isProcessingEducationCrop}
      />
    </div>
  );
}
