"use client";
import { memo, useEffect, useState, type DragEvent } from "react";
import type {
  CardBlockConfig,
  CardBlockDTO,
  CardBlockKind,
  WorkspaceCardDTO,
} from "@/dto";
import {
  createWorkspaceBlock,
  deleteWorkspaceBlock,
  duplicateWorkspaceBlock,
  initializeWorkspaceBlocks,
  reorderWorkspaceBlocks,
  updateWorkspaceBlock,
} from "./workspace-session-client";
import styles from "./appearance-editor.module.css";
const labels: Record<CardBlockKind, string> = {
  HERO: "Hero",
  ABOUT: "About",
  CONTACT: "Contact",
  SOCIAL_LINKS: "Social Links",
  CTA_BUTTONS: "CTA Buttons",
  GALLERY: "Gallery",
  VIDEO: "Video",
  FAQ: "FAQ",
  LOCATION_MAP: "Location Map",
  DIVIDER: "Divider",
  RICH_TEXT: "Rich Text",
};
const defaults: Record<CardBlockKind, CardBlockConfig> = {
  HERO: { title: null, subtitle: null, showAvatar: true, mediaId: null },
  ABOUT: { heading: "About", body: null },
  CONTACT: { heading: "Contact" },
  SOCIAL_LINKS: { heading: "Connect" },
  CTA_BUTTONS: { heading: null },
  GALLERY: { heading: "Gallery", mediaIds: [], columns: 3 },
  VIDEO: { heading: "Video", url: null, mediaId: null, caption: null },
  FAQ: { heading: "Frequently asked questions", items: [] },
  LOCATION_MAP: {
    heading: "Location",
    address: "Your address",
    latitude: null,
    longitude: null,
    zoom: 14,
  },
  DIVIDER: { style: "SOLID" },
  RICH_TEXT: { heading: null, content: "" },
};
const move = <T,>(items: readonly T[], from: number, to: number) => {
  const next = [...items],
    [item] = next.splice(from, 1);
  if (item) next.splice(to, 0, item);
  return next;
};
function ConfigFields({
  block,
  onChange,
}: {
  block: CardBlockDTO;
  onChange: (config: CardBlockConfig) => void;
}) {
  const config = block.config,
    field = (key: keyof CardBlockConfig, label: string) => (
      <label className={`${styles.field} ${styles.stackField}`}>
        <span>{label}</span>
        <input
          value={String(config[key] ?? "")}
          onChange={(event) =>
            onChange({ ...config, [key]: event.target.value || null })
          }
        />
      </label>
    );
  if (block.kind === "HERO")
    return (
      <>
        {field("title", "Title override")}
        {field("subtitle", "Subtitle override")}
        <label className={styles.iconToggle}>
          <input
            type="checkbox"
            checked={config.showAvatar ?? true}
            onChange={(event) =>
              onChange({ ...config, showAvatar: event.target.checked })
            }
          />
          Show avatar
        </label>
      </>
    );
  if (block.kind === "ABOUT")
    return (
      <>
        {field("heading", "Heading")}
        <label className={`${styles.field} ${styles.stackField}`}>
          <span>Body</span>
          <textarea
            rows={5}
            value={config.body ?? ""}
            onChange={(event) =>
              onChange({ ...config, body: event.target.value || null })
            }
          />
        </label>
      </>
    );
  if (["CONTACT", "SOCIAL_LINKS", "CTA_BUTTONS"].includes(block.kind))
    return field("heading", "Heading");
  if (block.kind === "GALLERY")
    return (
      <>
        {field("heading", "Heading")}
        <label className={styles.field}>
          <span>Columns</span>
          <select
            value={config.columns ?? 3}
            onChange={(event) =>
              onChange({
                ...config,
                columns: Number(event.target.value) as 2 | 3,
              })
            }
          >
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </label>
        <p className={styles.note}>
          Media IDs are supported by the block contract. Selection arrives with
          Media Library.
        </p>
      </>
    );
  if (block.kind === "VIDEO")
    return (
      <>
        {field("heading", "Heading")}
        <label className={`${styles.field} ${styles.stackField}`}>
          <span>Video URL</span>
          <input
            type="url"
            value={config.url ?? ""}
            onChange={(event) =>
              onChange({ ...config, url: event.target.value || null })
            }
          />
        </label>
        {field("caption", "Caption")}
      </>
    );
  if (block.kind === "FAQ")
    return (
      <>
        {field("heading", "Heading")}
        <label className={`${styles.field} ${styles.stackField}`}>
          <span>Questions (one Question | Answer per line)</span>
          <textarea
            rows={6}
            value={(config.items ?? [])
              .map((item) => `${item.question} | ${item.answer}`)
              .join("\n")}
            onChange={(event) =>
              onChange({
                ...config,
                items: event.target.value
                  .split("\n")
                  .filter(Boolean)
                  .map((line, index) => {
                    const [question, ...answer] = line.split("|");
                    return {
                      id: config.items?.[index]?.id ?? crypto.randomUUID(),
                      question: question.trim(),
                      answer: answer.join("|").trim(),
                    };
                  }),
              })
            }
          />
        </label>
      </>
    );
  if (block.kind === "LOCATION_MAP")
    return (
      <>
        {field("heading", "Heading")}
        {field("address", "Address")}
      </>
    );
  if (block.kind === "DIVIDER")
    return (
      <label className={styles.field}>
        <span>Style</span>
        <select
          value={config.style ?? "SOLID"}
          onChange={(event) =>
            onChange({
              ...config,
              style: event.target.value as "SOLID" | "DASHED" | "DOTTED",
            })
          }
        >
          <option>SOLID</option>
          <option>DASHED</option>
          <option>DOTTED</option>
        </select>
      </label>
    );
  return (
    <>
      {field("heading", "Heading")}
      <label className={`${styles.field} ${styles.stackField}`}>
        <span>Content</span>
        <textarea
          rows={7}
          value={config.content ?? ""}
          onChange={(event) =>
            onChange({ ...config, content: event.target.value })
          }
        />
      </label>
    </>
  );
}
function BlockEditorComponent({
  card,
  onChange,
}: {
  card: WorkspaceCardDTO;
  onChange: (card: WorkspaceCardDTO) => void;
}) {
  const [kind, setKind] = useState<CardBlockKind>("RICH_TEXT"),
    [open, setOpen] = useState<string | null>(null),
    [drafts, setDrafts] = useState<Record<string, CardBlockConfig>>({}),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const blocks = card.editorBlocks ?? card.blocks ?? [];
  useEffect(() => {
    if (blocks.some((block) => block.id.startsWith("legacy-"))) {
      initializeWorkspaceBlocks(card.id)
        .then(onChange)
        .catch((error) =>
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to initialize blocks",
          ),
        )
        .finally(() => setBusy(false));
    }
  }, [card.id]);
  async function run(task: Promise<WorkspaceCardDTO>) {
    setBusy(true);
    setMessage("");
    try {
      onChange(await task);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save block",
      );
    } finally {
      setBusy(false);
    }
  }
  async function reorder(from: number, to: number) {
    if (to < 0 || to >= blocks.length || from === to) return;
    const next = move(blocks, from, to);
    onChange({
      ...card,
      editorBlocks: next,
      blocks: next.filter((block) => block.isEnabled),
    });
    await run(
      reorderWorkspaceBlocks(
        card.id,
        next.map((block) => block.id),
      ),
    );
  }
  return (
    <div className={styles.sectionBody}>
      <div className={styles.collectionHeader}>
        <div>
          <h3>Page blocks</h3>
          <p>Add, collapse, duplicate, disable, remove, or reorder.</p>
        </div>
        <span>{blocks.length}</span>
      </div>
      {message && <p className={styles.sessionError}>{message}</p>}
      <div className={styles.addRow}>
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value as CardBlockKind)}
        >
          {Object.entries(labels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void run(
              createWorkspaceBlock(card.id, {
                kind,
                config: defaults[kind],
                isEnabled: true,
              }),
            )
          }
        >
          Add block
        </button>
      </div>
      <div className={styles.blockList}>
        {blocks.map((block, index) => {
          const expanded = open === block.id,
            config = drafts[block.id] ?? block.config;
          return (
            <section
              className={styles.blockEditor}
              draggable
              key={block.id}
              onDragStart={(event) =>
                event.dataTransfer.setData("text/plain", String(index))
              }
              onDragOver={(event: DragEvent) => event.preventDefault()}
              onDrop={(event) =>
                void reorder(
                  Number(event.dataTransfer.getData("text/plain")),
                  index,
                )
              }
            >
              <header>
                <span className={styles.dragHandle}>⋮⋮</span>
                <button
                  type="button"
                  className={styles.blockTitle}
                  onClick={() => setOpen(expanded ? null : block.id)}
                  aria-expanded={expanded}
                >
                  {labels[block.kind]}{" "}
                  <small>{block.isEnabled ? "Visible" : "Hidden"}</small>
                </button>
                <span className={styles.orderButtons}>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => void reorder(index, index - 1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === blocks.length - 1}
                    onClick={() => void reorder(index, index + 1)}
                  >
                    ↓
                  </button>
                </span>
              </header>
              {expanded && (
                <div className={styles.blockSettings}>
                  <ConfigFields
                    block={{ ...block, config }}
                    onChange={(next) =>
                      setDrafts({ ...drafts, [block.id]: next })
                    }
                  />
                  <label className={styles.iconToggle}>
                    <input
                      type="checkbox"
                      checked={block.isEnabled}
                      onChange={(event) =>
                        void run(
                          updateWorkspaceBlock(card.id, block.id, {
                            isEnabled: event.target.checked,
                          }),
                        )
                      }
                    />
                    Enabled
                  </label>
                  <div className={styles.blockActions}>
                    <button
                      type="button"
                      onClick={() =>
                        void run(
                          updateWorkspaceBlock(card.id, block.id, { config }),
                        )
                      }
                    >
                      Save block
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void run(duplicateWorkspaceBlock(card.id, block.id))
                      }
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className={styles.danger}
                      disabled={blocks.length === 1}
                      onClick={() =>
                        void run(deleteWorkspaceBlock(card.id, block.id))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
      {busy && <small className={styles.hint}>Saving blocks…</small>}
    </div>
  );
}
export const BlockEditor = memo(BlockEditorComponent);
