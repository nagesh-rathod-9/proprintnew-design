import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs font-medium text-slate-500 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.active;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1 sm:gap-1.5">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 select-none" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="font-bold text-rose-600 truncate max-w-[200px] sm:max-w-xs md:max-w-md"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.to ? (
                <Link
                  to={item.to}
                  onClick={item.onClick}
                  className="hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold text-slate-600 hover:underline cursor-pointer"
                >
                  {index === 0 && <Home className="w-3 h-3 text-slate-400 -mt-0.5 shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold text-slate-600 hover:underline cursor-pointer bg-transparent p-0 border-none"
                >
                  {index === 0 && <Home className="w-3 h-3 text-slate-400 -mt-0.5 shrink-0" />}
                  <span>{item.label}</span>
                </button>
              ) : (
                <span className="text-slate-600 font-semibold">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
