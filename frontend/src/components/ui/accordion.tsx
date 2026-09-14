'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
  ariaLabel?: string;
}

export function Accordion({ items, multiple = false, defaultOpenIds = [], className, ariaLabel = 'Accordion' }: AccordionProps) {
  const [openIds, setOpenIds] = React.useState<string[]>(() =>
    multiple ? defaultOpenIds : defaultOpenIds.slice(0, 1),
  );
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const generatedId = React.useId();

  const toggleItem = (id: string) => {
    setOpenIds((currentIds) => {
      const isOpen = currentIds.includes(id);
      if (isOpen) return currentIds.filter((openId) => openId !== id);
      return multiple ? [...currentIds, id] : [id];
    });
  };

  const focusItem = (index: number) => {
    if (!items.length) return;
    const nextIndex = (index + items.length) % items.length;
    const item = items[nextIndex];
    if (item?.disabled) {
      focusItem(nextIndex + (nextIndex >= index ? 1 : -1));
      return;
    }
    itemRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={cn('divide-y divide-border rounded-lg border border-border bg-card', className)} role="region" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const contentId = `${generatedId}-content-${item.id}`;
        const headingId = `${generatedId}-heading-${item.id}`;
        return (
          <div key={item.id} className="px-4 first:rounded-t-lg last:rounded-b-lg">
            <h3 id={headingId} className="text-sm font-medium">
              <button
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                disabled={item.disabled}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => !item.disabled && toggleItem(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    focusItem(index + 1);
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    focusItem(index - 1);
                  } else if (event.key === 'Home') {
                    event.preventDefault();
                    focusItem(0);
                  } else if (event.key === 'End') {
                    event.preventDefault();
                    focusItem(items.length - 1);
                  }
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-4 px-2 py-3 text-left font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  item.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <span>{item.title}</span>
                <span
                  className={cn(
                    'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-sm leading-none transition-transform',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                >
                  ‹
                </span>
              </button>
            </h3>
            {isOpen && (
              <div
                id={contentId}
                role="region"
                aria-labelledby={headingId}
                className="pb-4 pl-2 pr-2 text-sm text-muted-foreground"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
