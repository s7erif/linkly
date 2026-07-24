import { describe, expect, it } from "vitest";
import { hasWorkspacePermission } from "@/domain/workspace-access";
describe("workspace role permissions",()=>{
 it("allows owners to manage memberships",()=>expect(hasWorkspacePermission("OWNER","MEMBERSHIP_MANAGE")).toBe(true));
 it("prevents viewers from mutating tenant data",()=>{expect(hasWorkspacePermission("VIEWER","CARD_WRITE")).toBe(false);expect(hasWorkspacePermission("VIEWER","ORDER_WRITE")).toBe(false)});
 it("allows managers operational writes without workspace administration",()=>{expect(hasWorkspacePermission("MANAGER","ORDER_WRITE")).toBe(true);expect(hasWorkspacePermission("MANAGER","WORKSPACE_MANAGE")).toBe(false)});
});
