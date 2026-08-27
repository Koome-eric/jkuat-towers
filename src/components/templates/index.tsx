import type { TemplateKey, TemplateProps } from "@/lib/templates";
import FashionTemplate from "./FashionTemplate";
import ElectronicsTemplate from "./ElectronicsTemplate";
import BeautyTemplate from "./BeautyTemplate";
import HomeTemplate from "./HomeTemplate";
import GroceryTemplate from "./GroceryTemplate";

const TEMPLATE_COMPONENTS: Record<TemplateKey, (props: TemplateProps) => React.ReactElement> = {
  fashion: FashionTemplate,
  electronics: ElectronicsTemplate,
  beauty: BeautyTemplate,
  home: HomeTemplate,
  grocery: GroceryTemplate,
};

export function StorefrontTemplate({ templateKey, ...props }: TemplateProps & { templateKey: TemplateKey }) {
  const Template = TEMPLATE_COMPONENTS[templateKey];
  return <Template {...props} />;
}
