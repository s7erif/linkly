export interface LegacyBusinessCardDTO {
  id: string; name: string; title: string; company: string; address: string | null;
  phone: string | null; email: string | null; website: string | null; bio: string | null;
  avatar: string | null; backgroundImage: string | null; socialLinks: string; templateId: string;
  urlHash: string; slug: string; isActive: boolean; createTime: Date; updateTime: Date; userId: string;
}
export interface LegacySocialLinkDTO {
  id: string; businessCardId: string; platform: string; url: string; order: number; createdAt: Date;
}
export interface LegacyUserDTO { id: string; name: string | null; email: string | null; }
