import React from "react";
import { BusinessCardView } from "../types";
import {
  CardContainer,
  CoverImage,
  Avatar,
  CardSection,
  ContactButton,
  SocialButton,
  ActionGrid,
  Badge,
  FooterBrand,
} from "../ui";

export function MedicalTheme({ card }: { card: BusinessCardView }) {
  const socialLinks = card.socialLinks;

  return (
    <div className="min-h-screen bg-teal-50 py-8 px-4 font-sans">
      <CardContainer className="bg-white shadow-xl rounded-[2rem] border border-teal-100 pb-8">
        <CoverImage
          src={card.coverImage}
          fallbackClass="bg-gradient-to-br from-teal-500 to-teal-700"
          className="h-36"
        />

        <div className="px-8 relative">
          <div className="flex justify-center -mt-16 mb-6">
            <Avatar
              src={card.avatar}
              fallback={card.name || "M"}
              className="w-32 h-32 border-4 border-white shadow-md bg-teal-50 text-teal-600 text-4xl"
            />
          </div>

          <div className="text-center flex flex-col items-center">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              {card.name}
            </h1>

            {card.title && (
              <Badge className="bg-teal-100 text-teal-700 mt-3 text-sm px-4 py-1.5">
                {card.title}
              </Badge>
            )}

            {card.company && (
              <p className="text-sm font-medium text-slate-500 mt-3">
                {card.company}
              </p>
            )}

            {card.bio && (
              <CardSection className="mt-6 w-full">
                <div className="text-sm text-slate-600 leading-relaxed bg-teal-50/50 border border-teal-100/50 p-5 rounded-2xl text-left">
                  {card.bio}
                </div>
              </CardSection>
            )}
          </div>

          <CardSection className="mt-8">
            <ActionGrid columns={1}>
              {card.phone && (
                <ContactButton
                  href={`tel:${card.phone}`}
                  icon={<span>📞</span>}
                  label="Phone"
                  value={card.phone}
                  className="bg-slate-50 hover:bg-teal-50 hover:shadow-md text-slate-700"
                />
              )}
              {card.email && (
                <ContactButton
                  href={`mailto:${card.email}`}
                  icon={<span>✉️</span>}
                  label="Email"
                  value={card.email}
                  className="bg-slate-50 hover:bg-teal-50 hover:shadow-md text-slate-700"
                />
              )}
              {card.website && (
                <ContactButton
                  href={card.website}
                  icon={<span>🌐</span>}
                  label="Website"
                  value={card.website}
                  className="bg-slate-50 hover:bg-teal-50 hover:shadow-md text-slate-700"
                />
              )}
              {card.address && (
                <ContactButton
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    card.address
                  )}`}
                  icon={<span>📍</span>}
                  label="Location"
                  value={card.address}
                  className="bg-slate-50 hover:bg-teal-50 hover:shadow-md text-slate-700"
                />
              )}
            </ActionGrid>
          </CardSection>

          {socialLinks.length > 0 && (
            <CardSection className="mt-8 flex justify-center">
              <div className="flex flex-wrap gap-4 justify-center">
                {socialLinks.map((link) => (
                  <SocialButton
                    key={link.platform}
                    href={link.url}
                    label={link.platform}
                    icon={
                      <span className="font-bold text-xs uppercase">
                        {link.platform.substring(0, 2)}
                      </span>
                    }
                    className="bg-teal-100 text-teal-700 hover:bg-teal-600 hover:text-white"
                  />
                ))}
              </div>
            </CardSection>
          )}
        </div>
      </CardContainer>

      <FooterBrand className="mt-8 text-teal-800" />
    </div>
  );
}
