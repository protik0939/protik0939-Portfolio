"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Search, Trash2, X } from "lucide-react";
import { AVAILABLE_BUTTON_ICONS, ProjectButtonIcon, type ProjectCustomButton } from "@/lib/project-buttons";

type CustomButtonsManagerProps = {
  buttons: ProjectCustomButton[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<ProjectCustomButton>) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  title?: string;
  description?: string;
};

const COLOR_PRESETS = ["#af88ff", "#3cddc7", "#69f6b8", "#3b82f6", "#f59e0b", "#fd6f85", "#e7e5e4"];

export default function CustomButtonsManager({
  buttons,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
  title = "Custom Action Buttons",
  description = "Add custom links (GitHub, live preview, docs, etc.) with custom colors and selectable icons.",
}: Readonly<CustomButtonsManagerProps>) {
  const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);
  const [iconPickerSearch, setIconPickerSearch] = useState("");

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-outline-variant/30 bg-surface-container/60 p-4 sm:p-5 md:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
            <p className="text-xs text-on-surface-variant">{description}</p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/60 hover:bg-primary/20"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            <span>Add Button</span>
          </button>
        </div>

        {buttons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant/40 py-6 text-center text-xs text-on-surface-variant">
            No custom buttons added yet. Click &quot;Add Button&quot; to add custom links.
          </div>
        ) : (
          <div className="space-y-4">
            {buttons.map((btn, index) => {
              const btnColor = btn.color || "#af88ff";

              return (
                <div
                  key={btn.id || `custom-btn-${index}`}
                  className="relative rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-on-surface">
                        {btn.labelEn || btn.labelBn || `Button ${index + 1}`}
                      </span>

                      {/* Live Preview pill */}
                      <div
                        style={{
                          borderColor: `${btnColor}66`,
                          color: btnColor,
                          backgroundColor: `${btnColor}14`,
                        }}
                        className="ml-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                      >
                        <ProjectButtonIcon name={btn.icon} className="h-3 w-3" style={{ color: btnColor }} />
                        <span>{btn.labelEn || btn.labelBn || "Preview"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => onMove(index, index - 1)}
                        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-variant disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        disabled={index === buttons.length - 1}
                        onClick={() => onMove(index, index + 1)}
                        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-variant disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="rounded-lg p-1.5 text-error hover:bg-error/10"
                        title="Remove Button"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="space-y-1 text-xs">
                      <span className="text-on-surface font-medium">Button Text (EN)</span>
                      <input
                        type="text"
                        value={btn.labelEn}
                        onChange={(e) => onUpdate(index, { labelEn: e.target.value })}
                        placeholder="e.g. GitHub Repo"
                        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                      />
                    </label>

                    <label className="space-y-1 text-xs">
                      <span className="text-on-surface font-medium">Button Text (BN)</span>
                      <input
                        type="text"
                        value={btn.labelBn}
                        onChange={(e) => onUpdate(index, { labelBn: e.target.value })}
                        placeholder="যেমন: গিটহাব রিপো"
                        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                      />
                    </label>

                    <label className="space-y-1 text-xs sm:col-span-2">
                      <span className="text-on-surface font-medium">Target Link / URL</span>
                      <input
                        type="url"
                        value={btn.url}
                        onChange={(e) => onUpdate(index, { url: e.target.value })}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-outline-variant/40 bg-surface-container px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Color Picker */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-on-surface font-medium">Button Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={btn.color.startsWith("#") ? btn.color : "#af88ff"}
                          onChange={(e) => onUpdate(index, { color: e.target.value })}
                          className="h-8 w-10 cursor-pointer rounded-lg border border-outline-variant/40 bg-transparent p-0.5"
                          title="Pick color"
                        />
                        <input
                          type="text"
                          value={btn.color}
                          onChange={(e) => onUpdate(index, { color: e.target.value })}
                          placeholder="#af88ff"
                          className="w-24 rounded-xl border border-outline-variant/40 bg-surface-container px-2.5 py-1.5 font-mono text-xs text-on-surface outline-none focus:border-primary"
                        />
                        <div className="flex flex-wrap gap-1">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => onUpdate(index, { color: preset })}
                              style={{ backgroundColor: preset }}
                              className="h-4.5 w-4.5 rounded-full border border-black/30 shadow-xs transition hover:scale-110"
                              title={preset}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Icon Picker Trigger */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-on-surface font-medium">Button Icon</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container px-3 py-1.5 text-xs text-on-surface">
                          <ProjectButtonIcon name={btn.icon} className="h-4 w-4 text-primary" />
                          <span className="font-medium">{btn.icon || "ExternalLink"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIconPickerIndex(index);
                            setIconPickerSearch("");
                          }}
                          className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                        >
                          Choose Icon...
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Icon Picker Modal */}
      {iconPickerIndex !== null ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIconPickerIndex(null);
            }
          }}
        >
          <div
            className="modal-panel glass-panel flex w-full max-w-xl max-h-[85vh] flex-col rounded-3xl border border-outline-variant/30 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/20 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-on-surface">Select Button Icon</h3>
                <p className="text-xs text-on-surface-variant">Choose an icon representing this action button</p>
              </div>
              <button
                type="button"
                onClick={() => setIconPickerIndex(null)}
                className="inline-flex items-center gap-1 rounded-full border border-outline-variant/50 px-3 py-1 text-xs font-semibold text-on-surface transition hover:bg-surface-variant"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                <span>Close</span>
              </button>
            </div>

            <div className="p-4 border-b border-outline-variant/20">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={iconPickerSearch}
                  onChange={(e) => setIconPickerSearch(e.target.value)}
                  placeholder="Search icons (e.g. github, code, link, play, docs)..."
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low py-2 pr-3 pl-9 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {AVAILABLE_BUTTON_ICONS.filter(
                  (item) =>
                    item.name.toLowerCase().includes(iconPickerSearch.toLowerCase().trim()) ||
                    item.label.toLowerCase().includes(iconPickerSearch.toLowerCase().trim()),
                ).map((item) => {
                  const isCurrent = buttons[iconPickerIndex]?.icon.toLowerCase() === item.name.toLowerCase();

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        onUpdate(iconPickerIndex, { icon: item.name });
                        setIconPickerIndex(null);
                      }}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs transition ${
                        isCurrent
                          ? "border-primary bg-primary/20 text-primary font-semibold"
                          : "border-outline-variant/30 bg-surface-container-low text-on-surface hover:border-primary/50 hover:bg-surface-container"
                      }`}
                    >
                      <ProjectButtonIcon name={item.name} className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1 truncate">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-[10px] text-on-surface-variant truncate">{item.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
