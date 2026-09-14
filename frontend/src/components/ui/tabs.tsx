'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function Tabs({ tabs, activeId, onChange, className, ariaLabel = 'Onglets' }: TabsProps) {
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const generatedId = React.useId();
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeId));
  const activeTab = tabs[activeIndex];

  const moveFocus = (nextIndex: number) => {
    if (!tabs.length) return;
    const clampedIndex = (nextIndex + tabs.length) % tabs.length;
    const nextTab = tabs[clampedIndex];
    if (!nextTab || nextTab.disabled) {
      const direction = nextIndex > activeIndex ? 1 : -1;
      moveFocus(clampedIndex + direction);
      return;
    }
    onChange(nextTab.id);
    tabRefs.current[clampedIndex]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveFocus(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveFocus(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      const firstIndex = tabs.findIndex((tab) => !tab.disabled);
      if (firstIndex >= 0) moveFocus(firstIndex);
    } else if (event.key === 'End') {
      event.preventDefault();
      const lastIndex = tabs.map((tab, tabIndex) => (!tab.disabled ? tabIndex : -1)).filter((tabIndex) => tabIndex >= 0).pop();
      if (lastIndex !== undefined) moveFocus(lastIndex);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab, index) => {
          const isSelected = tab.id === activeId;
          const panelId = `${generatedId}-panel-${tab.id}`;
          const tabId = `${generatedId}-tab-${tab.id}`;
          return (
            <button
              key={tab.id}
              id={tabId}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              disabled={tab.disabled}
              aria-selected={isSelected}
              aria-controls={isSelected ? panelId : undefined}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => !tab.disabled && onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'whitespace-nowrap border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected && 'border-primary text-foreground',
                tab.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab && !activeTab.disabled && (
        <div
          id={`${generatedId}-panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`${generatedId}-tab-${activeTab.id}`}
          tabIndex={0}
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
