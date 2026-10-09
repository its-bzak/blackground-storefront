export type Money = { amount: string; currencyCode: string };

export type ShopImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ProductCardData = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money };
  featuredImage: ShopImage | null;
  images: { nodes: ShopImage[] };
};

export type SelectedOption = { name: string; value: string };

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
};

export type ProductOption = {
  id: string;
  name: string;
  optionValues: { id: string; name: string }[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  descriptionHtml: string;
  availableForSale: boolean;
  priceRange: { minVariantPrice: Money };
  seo: { title: string | null; description: string | null };
  featuredImage: ShopImage | null;
  images: { nodes: ShopImage[] };
  options: ProductOption[];
  variants: { nodes: ProductVariant[] };
};

export type CollectionFilterValue = {
  id: string;
  label: string;
  count: number;
  // JSON for a Storefront API ProductFilter, passed back as ?filter=
  input: string;
};

export type CollectionFilter = {
  id: string;
  label: string;
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN";
  values: CollectionFilterValue[];
};

export type PageInfo = { hasNextPage: boolean; endCursor: string | null };

export type CollectionPage = {
  title: string;
  description: string;
  products: ProductCardData[];
  filters: CollectionFilter[];
  pageInfo: PageInfo;
};

export type ContentPage = {
  title: string;
  body: string;
  seo: { title: string | null; description: string | null } | null;
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    image: ShopImage | null;
    product: { handle: string; title: string };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money };
  lines: { nodes: CartLine[] };
};

export type Customer = {
  id: string;
  email: string | null;
  firstName: string | null;
};
