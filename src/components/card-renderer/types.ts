export interface SocialLinkView {
  platform: string;
  url: string;
}

export interface BusinessCardView {
  id: string;
  templateId: string;

  name: string;

  title?: string;
  company?: string;
  bio?: string;

  avatar?: string | null;
  coverImage?: string | null;

  phone?: string;
  email?: string;
  website?: string;
  address?: string;

  socialLinks: SocialLinkView[];
}
