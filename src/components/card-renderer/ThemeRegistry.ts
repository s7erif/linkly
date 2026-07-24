import { BaseCard } from "./BaseCard";
import { MedicalTheme } from "./themes/MedicalTheme";
import React from "react";

export const ThemeRegistry: Record<string, React.ElementType> = {
  medical: MedicalTheme,
  default: BaseCard,
};
