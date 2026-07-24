export type PlatformSettings = {
  version: 1;
  general: { platformName:string; platformLogo:string; favicon:string; timezone:string; currency:string; defaultLanguage:string };
  contact: { supportEmail:string; supportPhone:string; whatsapp:string; companyAddress:string };
  email: { senderName:string; senderEmail:string; replyToEmail:string; provider:"RESEND"|"SMTP"; providerSettings:string };
  payment: { instapayAccount:string; vodafoneCashNumber:string; bankAccountDetails:string; instructions:string; qrImage:string; acceptedProofTypes:readonly string[] };
  uploads: { maxSizeMb:number; allowedFileTypes:readonly string[] };
  security: { registrationEnabled:boolean; maintenanceMode:boolean; emailVerificationRequired:boolean; sessionTimeoutMinutes:number };
  seo: { metaTitle:string; metaDescription:string; ogImage:string; robots:string };
  social: { facebook:string; instagram:string; linkedin:string; x:string; youtube:string };
};

export const defaultPlatformSettings: PlatformSettings = {
  version:1,
  general:{platformName:"OI Platform",platformLogo:"",favicon:"",timezone:"UTC",currency:"USD",defaultLanguage:"en"},
  contact:{supportEmail:"",supportPhone:"",whatsapp:"",companyAddress:""},
  email:{senderName:"OI Platform",senderEmail:"",replyToEmail:"",provider:"RESEND",providerSettings:""},
  payment:{instapayAccount:"",vodafoneCashNumber:"",bankAccountDetails:"",instructions:"",qrImage:"",acceptedProofTypes:["image/jpeg","image/png","image/webp"]},
  uploads:{maxSizeMb:10,allowedFileTypes:["image/jpeg","image/png","image/webp"]},
  security:{registrationEnabled:true,maintenanceMode:false,emailVerificationRequired:false,sessionTimeoutMinutes:1440},
  seo:{metaTitle:"",metaDescription:"",ogImage:"",robots:"index, follow"},
  social:{facebook:"",instagram:"",linkedin:"",x:"",youtube:""},
};
