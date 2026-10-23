import {
  calculatorCardAlt,
  renderCalculatorCard,
  socialImageSize,
} from "@/lib/og/socialCard";

export const alt = calculatorCardAlt("mortgage-stress-test-calculator");
export const size = socialImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderCalculatorCard("mortgage-stress-test-calculator");
}
