import type { TemplateContext } from "./email-service.interface";

/** A rendered email ready to be handed to the transport provider. */
export interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
}

/** Signature every email template must implement. */
export type EmailTemplate = (context: TemplateContext) => RenderedTemplate;

/** Simple template registry for looking up named templates at runtime. */
export class TemplateEngine {
  private readonly templates = new Map<string, EmailTemplate>();

  register(name: string, template: EmailTemplate): void {
    this.templates.set(name, template);
  }

  render(name: string, context: TemplateContext): RenderedTemplate {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Unknown email template: "${name}"`);
    }
    return template(context);
  }

  list(): string[] {
    return Array.from(this.templates.keys()).sort();
  }
}
