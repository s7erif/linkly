import { normalizeCard } from "./src/components/card-renderer/adapters/card.adapter";

const testCard = {
  id: "test",
  name: "Sherif",
  templateId: "medical",
  socialLinks: []
};

const result = normalizeCard(testCard);
console.log("Original templateId:", testCard.templateId);
console.log("Normalized templateId:", result.templateId);
