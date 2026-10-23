import {
  calculatorCardAlt,
  renderCalculatorCard,
  socialImageSize,
} from "@/lib/og/socialCard";

export const alt = calculatorCardAlt("mortgage-calculator");
export const size = socialImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderCalculatorCard("mortgage-calculator");
}
