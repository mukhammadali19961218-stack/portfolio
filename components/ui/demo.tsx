import { AnimatedNavigationTabs } from "@/components/ui/animated-navigation-tabs";

const ITEMS = [
  { id: 1, title: "Overview" },
  { id: 2, title: "Activity" },
  { id: 3, title: "Domains" },
  { id: 4, title: "AI" },
  { id: 5, title: "Settings" },
];

const AnimatedNavigationTabsDemo = () => (
  <div className="bg-background h-40 flex items-center justify-center">
    <AnimatedNavigationTabs items={ITEMS} />
  </div>
);

export default AnimatedNavigationTabsDemo;
export { AnimatedNavigationTabsDemo };
