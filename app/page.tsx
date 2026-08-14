import { HeroSection } from '../src/components/home/HeroSection';
import { ValueSection } from '../src/components/home/ValueSection';
import { HowItWorks } from '../src/components/home/HowItWorks';
import { DepartmentCatalog } from '../src/components/departments/DepartmentCatalog';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValueSection />
      <HowItWorks />
      <DepartmentCatalog />
    </>
  );
}
