import logoLight from "../assets/brand/logo.svg";
import logoDark from "../assets/brand/logo-on-dark.svg";

/** شعار حروف: نسخة للخلفية الفاتحة وأخرى للغامقة، ويتبدّلان حسب الوضع */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <>
      <img src={logoLight} alt="حروف" className={`brand-logo on-light ${className}`} />
      <img src={logoDark} alt="" aria-hidden="true" className={`brand-logo on-dark ${className}`} />
    </>
  );
}
