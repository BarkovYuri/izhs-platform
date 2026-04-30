import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-rs py-24 text-center">
      <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
        404
      </div>
      <h1 className="h-display mt-3 text-[40px] sm:text-[56px] font-extrabold">
        Страница не найдена
      </h1>
      <p className="mt-4 text-[15px] text-[var(--rs-muted)] max-w-md mx-auto">
        Возможно, проект был перенесён или ссылка устарела. Загляните в каталог
        проектов или вернитесь на главную.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link href="/" className="btn-primary">
          <Home size={16} /> На главную
        </Link>
        <Link href="/builds" className="btn-secondary">
          Каталог проектов <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
