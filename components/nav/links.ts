export const NAV = {
  shop: { href: "/collections/all", label: "Shop" },
  quiz: { href: "/quiz", label: "Quiz" },
  about: { href: "/pages/about", label: "About" },
  account: { href: "/account", label: "Account" },
  contact: { href: "/pages/contact", label: "Contact" },
} as const;

export const MENU_LINKS = [NAV.shop, NAV.quiz, NAV.about, NAV.account];
