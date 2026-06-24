export const BRAND = {
  companyName: "Bobkat IT",
  productName: "StackScore",
  productVersion: "1.0.0",
  reportTitle: "Technology Maturity Assessment",
  website: process.env.BOBKAT_IT_WEBSITE ?? "www.bobkatit.com",
  email: process.env.BOBKAT_IT_EMAIL ?? "bobby@bobkatit.com",
  phone: process.env.BOBKAT_IT_PHONE ?? "",
  primaryColor: "#082F5B",
  secondaryColor: "#7D97AC",
  darkColor: "#082F5B",
  lightBackground: "#F4F6F8",
} as const;
