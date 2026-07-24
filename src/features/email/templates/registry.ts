import { TemplateEngine } from "../services/template-engine";
import { welcomeTemplate } from "./welcome";
import { verifyEmailTemplate } from "./verify-email";
import { passwordResetTemplate } from "./password-reset";
import { passwordChangedTemplate } from "./password-changed";
import { subscriptionActivatedTemplate } from "./subscription-activated";
import { subscriptionRenewedTemplate } from "./subscription-renewed";
import { subscriptionExpiredTemplate } from "./subscription-expired";
import { paymentSuccessfulTemplate } from "./payment-successful";
import { paymentFailedTemplate } from "./payment-failed";

/** Create the standard template engine with all registered templates. */
export function createTemplateEngine(): TemplateEngine {
  const engine = new TemplateEngine();
  engine.register("welcome", welcomeTemplate);
  engine.register("verify-email", verifyEmailTemplate);
  engine.register("password-reset", passwordResetTemplate);
  engine.register("password-changed", passwordChangedTemplate);
  engine.register("subscription-activated", subscriptionActivatedTemplate);
  engine.register("subscription-renewed", subscriptionRenewedTemplate);
  engine.register("subscription-expired", subscriptionExpiredTemplate);
  engine.register("payment-successful", paymentSuccessfulTemplate);
  engine.register("payment-failed", paymentFailedTemplate);
  return engine;
}
