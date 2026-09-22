import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AbbeyPage } from "../src/components/abbey-page";
import { AbiPage } from "../src/components/abi-page";
import { CompanyPage } from "../src/components/company-page";
import { InvestorsPage } from "../src/components/investors-page";
import { PlatformPage } from "../src/components/platform-page";
import { WdbxPage } from "../src/components/wdbx-page";

const pages = [
  ["Abbey", AbbeyPage],
  ["ABI", AbiPage],
  ["WDBX", WdbxPage],
  ["Platform", PlatformPage],
  ["Company", CompanyPage],
  ["Investors", InvestorsPage],
] as const;

describe("public product pages", () => {
  it.each(pages)(
    "%s renders shared button and card slots from @mlai/ui",
    (_name, Page) => {
      const markup = renderToStaticMarkup(<Page />);
      expect(markup).toContain('data-slot="button"');
      expect(markup).toContain('data-slot="card"');
      expect(markup).not.toContain("<article");
    },
  );
});
