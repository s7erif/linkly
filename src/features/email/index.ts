export type { EmailService, EmailEnvelope, SendResult, HealthCheckResult, TemplateContext } from "./services/email-service.interface";
export { PlatformEmailService } from "./services/email-service";
export { TemplateEngine } from "./services/template-engine";
export type { EmailTemplate, RenderedTemplate } from "./services/template-engine";
export { createEmailService } from "./services/email-service.factory";
export type { EmailServiceConfig } from "./services/email-service.factory";
export { createTemplateEngine } from "./templates/registry";
