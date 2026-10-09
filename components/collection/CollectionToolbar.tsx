import Link from "next/link";

import { SORT_KEYS, SORT_LABELS, type SortKey } from "@/lib/shopify/products";
import type { CollectionFilter } from "@/lib/shopify/types";

type UrlState = { sort: SortKey; filters: string[]; after?: string | null };

// Sort and filters live in the query string, so every control is a plain link
// and the page stays a server component.
export function collectionHref(base: string, state: UrlState): string {
  const params = new URLSearchParams();
  if (state.sort !== "featured") params.set("sort", state.sort);
  for (const filter of state.filters) params.append("filter", filter);
  if (state.after) params.set("after", state.after);

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

type Props = {
  base: string;
  sort: SortKey;
  activeFilters: string[];
  filters: CollectionFilter[];
};

const idle = "text-bone/60 transition-colors hover:text-bone";
const current = "text-gold";

export function CollectionToolbar({ base, sort, activeFilters, filters }: Props) {
  // Price ranges need a number input; only pick-from-a-list filters are shown.
  const groups = filters.filter(
    (filter) => filter.type !== "PRICE_RANGE" && filter.values.length > 0,
  );

  return (
    <div className="eyebrow mt-10 flex flex-col gap-5 border-y border-bone/10 py-5 md:flex-row md:items-start md:justify-between">
      {groups.length > 0 && (
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          {groups.map((group) => {
            const activeCount = group.values.filter((value) =>
              activeFilters.includes(value.input),
            ).length;

            return (
              <details key={group.id} className="group relative">
                <summary
                  className={`cursor-pointer list-none [&::-webkit-details-marker]:hidden ${
                    activeCount > 0 ? current : idle
                  }`}
                >
                  {group.label}
                  {activeCount > 0 && ` (${activeCount})`}
                  <span aria-hidden className="ml-2 inline-block group-open:rotate-45">
                    +
                  </span>
                </summary>

                <ul className="mt-4 space-y-3 md:absolute md:left-0 md:top-full md:z-30 md:min-w-52 md:border md:border-bone/10 md:bg-coal md:p-5">
                  {group.values.map((value) => {
                    const active = activeFilters.includes(value.input);
                    const next = active
                      ? activeFilters.filter((input) => input !== value.input)
                      : [...activeFilters, value.input];

                    return (
                      <li key={value.id}>
                        {value.count === 0 && !active ? (
                          <span className="text-bone/25">{value.label}</span>
                        ) : (
                          <Link
                            href={collectionHref(base, { sort, filters: next })}
                            aria-current={active ? "true" : undefined}
                            className={active ? current : idle}
                          >
                            {value.label}
                            <span className="ml-2 text-bone/35 tabular-nums">
                              {value.count}
                            </span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}

          {activeFilters.length > 0 && (
            <Link href={collectionHref(base, { sort, filters: [] })} className={idle}>
              Clear
            </Link>
          )}
        </div>
      )}

      <nav
        aria-label="Sort"
        className="no-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 md:mx-0 md:ml-auto md:px-0"
      >
        {SORT_KEYS.map((key) => (
          <Link
            key={key}
            href={collectionHref(base, { sort: key, filters: activeFilters })}
            aria-current={key === sort ? "true" : undefined}
            className={`shrink-0 ${key === sort ? current : idle}`}
          >
            {SORT_LABELS[key]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
