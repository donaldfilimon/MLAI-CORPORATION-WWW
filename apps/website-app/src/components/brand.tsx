import NextLink from "next/link";
import { Brand as DesignSystemBrand, type BrandProps } from "@mlai/ui";
export function Brand(props: BrandProps) {
  return <DesignSystemBrand Link={NextLink} {...props} />;
}
