import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: number;
  title?: string;
  tile?: string;
};

export interface AnimatedNavigationTabsProps {
  items: TabItem[];
  onTabChange?: (item: TabItem) => void;
}

export function AnimatedNavigationTabs({ items, onTabChange }: AnimatedNavigationTabsProps) {
  const [active, setActive] = useState<TabItem>(items[0]);
  const [isHover, setIsHover] = useState<TabItem | null>(null);

  const handleTabClick = (item: TabItem) => {
    setActive(item);
    if (onTabChange) {
      onTabChange(item);
    }
  };

  return (
    <nav className="relative w-full flex items-center justify-center py-2">
      <div className="relative">
        <ul className="flex items-center justify-center">
          {items.map((item) => (
            <button
              key={item.id}
              className={cn(
                "py-2 relative duration-300 transition-colors hover:!text-primary",
                active.id === item.id ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => handleTabClick(item)}
              onMouseEnter={() => setIsHover(item)}
              onMouseLeave={() => setIsHover(null)}
            >
              <div className="px-5 py-2 relative z-10 font-medium text-sm">
                {item.title || item.tile}
                {isHover?.id === item.id && (
                  <motion.div
                    layoutId="hover-bg"
                    className="absolute bottom-0 left-0 right-0 w-full h-full bg-primary/10"
                    style={{
                      borderRadius: 6,
                    }}
                  />
                )}
              </div>
              {active.id === item.id && (
                <motion.div
                  layoutId="active"
                  className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-primary z-20"
                />
              )}
              {isHover?.id === item.id && (
                <motion.div
                  layoutId="hover"
                  className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-primary z-20"
                />
              )}
            </button>
          ))}
        </ul>
      </div>
    </nav>
  );
}

