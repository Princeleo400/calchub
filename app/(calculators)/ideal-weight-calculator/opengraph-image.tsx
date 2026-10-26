import {
  calculatorCardAlt,
  renderCalculatorCard,
  socialImageSize,
} from "@/lib/og/socialCard";

export const alt = calculatorCardAlt("ideal-weight-calculator");
export const size = socialImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderCalculatorCard("ideal-weight-calculator");
}
