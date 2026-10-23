import {
  calculatorCardAlt,
  renderCalculatorCard,
  socialImageSize,
} from "@/lib/og/socialCard";

export const alt = calculatorCardAlt("calorie-calculator");
export const size = socialImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderCalculatorCard("calorie-calculator");
}
