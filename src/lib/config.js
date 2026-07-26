const config = {
  appName: "Digital Business Card",
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  },
  db: {
    url: process.env.DATABASE_URL,
  }
};

export default config;
