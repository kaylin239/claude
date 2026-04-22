import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- str_replace_editor labels ---

test("shows 'Creating' for str_replace_editor create", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="result" result="ok" />);
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor str_replace", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "str_replace", path: "/Button.jsx" }} state="result" result="ok" />);
  expect(screen.getByText("Editing /Button.jsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor insert", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "insert", path: "/App.jsx" }} state="result" result="ok" />);
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("shows 'Reading' for str_replace_editor view", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "view", path: "/App.jsx" }} state="result" result="ok" />);
  expect(screen.getByText("Reading /App.jsx")).toBeDefined();
});

test("shows 'Undoing edit in' for str_replace_editor undo_edit", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "undo_edit", path: "/App.jsx" }} state="result" result="ok" />);
  expect(screen.getByText("Undoing edit in /App.jsx")).toBeDefined();
});

// --- file_manager labels ---

test("shows 'Renaming' for file_manager rename", () => {
  render(<ToolCallBadge toolName="file_manager" args={{ command: "rename", path: "/old.jsx" }} state="result" result="ok" />);
  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

test("shows 'Deleting' for file_manager delete", () => {
  render(<ToolCallBadge toolName="file_manager" args={{ command: "delete", path: "/App.jsx" }} state="result" result="ok" />);
  expect(screen.getByText("Deleting /App.jsx")).toBeDefined();
});

// --- fallback ---

test("falls back to raw tool name for unknown tool", () => {
  render(<ToolCallBadge toolName="some_unknown_tool" args={{}} state="result" result="ok" />);
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

// --- state indicators ---

test("renders green dot when completed", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="result" result="ok" />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("renders spinner when pending", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="call" />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("renders spinner when result is null", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="result" result={null} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
