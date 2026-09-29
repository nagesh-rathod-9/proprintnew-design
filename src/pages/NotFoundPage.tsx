import React from 'react';
import { ArrowLeft, ArrowRight, House, SearchX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NotFoundPageProps {
  title?: string;
  description?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  title = 'Page not found',
  description = 'The page you are looking for may have moved or no longer exists.'
}) => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-5 py-16">
      <section className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-600 shadow-sm">
          <SearchX className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-black uppercase tracking-widest text-rose-600">404</p>
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700"
          >
            <House className="h-4 w-4" aria-hidden="true" />
            Go to Home
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Go Back
          </button>
        </div>
      </section>
    </main>
  );
};