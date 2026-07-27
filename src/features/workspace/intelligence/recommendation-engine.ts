// ═══════════════════════════════════════════════════════════════════════════
// Decision Support & Recommendation Engine
//
// Generates human-readable, actionable recommendations for the creator
// in the Workspace, based on explicit Profile Type and Link data.
// ═══════════════════════════════════════════════════════════════════════════

import type { PreviewButton } from "@/components/card-renderer/types";

export type ProfileType = "CREATOR" | "DEVELOPER" | "BUSINESS" | "RESTAURANT" | "HEALTHCARE" | "AGENCY" | "ARTIST" | "STUDENT" | "DEFAULT";

export interface Recommendation {
  id: string;
  message: string;
  type: "UX" | "CONVERSION" | "STRUCTURE";
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

/**
 * Analyzes the profile type and current link distribution to offer
 * non-destructive decision support to the creator.
 */
export function getLinkRecommendations(profileType: ProfileType, buttons: ReadonlyArray<PreviewButton>): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (buttons.length === 0) return recommendations;

  const firstLink = buttons[0];
  const firstType = firstLink.type ?? "CUSTOM";
  const firstLabel = firstLink.label.toLowerCase();

  const hasLinkType = (type: string) => buttons.some(b => b.type === type);
  const hasLinkWord = (word: string) => buttons.some(b => b.label.toLowerCase().includes(word));

  // 1. Evaluate the Featured (Top) Link against Profile Type
  switch (profileType) {
    case "DEVELOPER":
      if (hasLinkType("GITHUB") && firstType !== "GITHUB" && firstType !== "PORTFOLIO") {
        recommendations.push({
          id: "dev-github",
          message: "GitHub appears to be your strongest professional destination. Consider making it your featured action.",
          type: "CONVERSION",
          confidence: "HIGH"
        });
      }
      break;
      
    case "HEALTHCARE":
      if ((hasLinkType("CALENDLY") || hasLinkWord("book")) && firstType !== "CALENDLY" && !firstLabel.includes("book")) {
        recommendations.push({
          id: "health-booking",
          message: "Booking links usually convert better for healthcare profiles. Consider moving your booking link to the top.",
          type: "CONVERSION",
          confidence: "HIGH"
        });
      }
      break;
      
    case "RESTAURANT":
      if ((hasLinkWord("menu") || hasLinkWord("reservation")) && !firstLabel.includes("menu") && !firstLabel.includes("reservation")) {
        recommendations.push({
          id: "rest-menu",
          message: "Restaurant customers primarily look for Menus or Reservations. Consider featuring one of these at the top.",
          type: "CONVERSION",
          confidence: "HIGH"
        });
      }
      break;
      
    case "CREATOR":
      if ((hasLinkType("YOUTUBE") || hasLinkType("TWITCH") || hasLinkWord("latest")) && firstType === "INSTAGRAM") {
        recommendations.push({
          id: "creator-content",
          message: "Your primary content platforms often convert better than general social media. Consider featuring YouTube over Instagram.",
          type: "CONVERSION",
          confidence: "MEDIUM"
        });
      }
      break;

    case "ARTIST":
      if (hasLinkType("PORTFOLIO") && firstType !== "PORTFOLIO") {
        recommendations.push({
          id: "art-portfolio",
          message: "This portfolio would likely perform better as your featured action.",
          type: "CONVERSION",
          confidence: "HIGH"
        });
      }
      break;
  }

  // 2. Evaluate General Structure & Friction
  const socialLinks = ["INSTAGRAM", "X", "FACEBOOK", "SNAPCHAT", "PINTEREST", "TIKTOK"];
  if (socialLinks.includes(firstType)) {
    recommendations.push({
      id: "general-social-top",
      message: "Social media links are typically best used as secondary trust markers. Featuring a core destination (like a Website or Portfolio) often increases engagement.",
      type: "UX",
      confidence: "MEDIUM"
    });
  }

  if (buttons.length > 7) {
    recommendations.push({
      id: "general-fatigue",
      message: "You have more than 7 links. Consider grouping or removing some to prevent decision fatigue for your visitors.",
      type: "STRUCTURE",
      confidence: "MEDIUM"
    });
  }

  return recommendations;
}
