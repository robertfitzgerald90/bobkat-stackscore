export const BRAND = {
  companyName: "Bobkat IT",
  productName: "StackScore",
  reportTitle: "Technology Maturity Assessment",
  website: process.env.BOBKAT_IT_WEBSITE ?? "www.bobkatit.com",
  email: process.env.BOBKAT_IT_EMAIL ?? "bobby@bobkatit.com",
  phone: process.env.BOBKAT_IT_PHONE ?? "",
  primaryColor: "#7D97AC",
  darkColor: "#2C3E50",
  lightBackground: "#F8FAFB",
} as const;
