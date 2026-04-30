import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getSettings } from "@/services/api";

export const metadata: Metadata = {
  title: "Пользовательское соглашение",
  description: "Условия использования сайта Ремстрой и информации, размещённой на нём.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default async function TermsPage() {
  const s = await getSettings();
  const name = s.legal_name || "ИП Барков Юрий Михайлович";
  const inn = s.inn ? ` (ИНН ${s.inn})` : "";

  return (
    <article className="container-rs py-12 sm:py-16 max-w-3xl">
      <Breadcrumbs items={[{ label: "Пользовательское соглашение" }]} />
      <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--rs-brand)] font-bold">
        Документы
      </div>
      <h1 className="h-display mt-2 text-[32px] sm:text-[44px] font-extrabold">
        Пользовательское соглашение
      </h1>

      <div className="mt-10 grid gap-7 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-bold text-[20px] mb-2">1. Стороны</h2>
          <p>
            Настоящее Соглашение заключено между {name}{inn} (далее — «Оператор») и
            пользователем сайта {s.site_name} (далее — «Пользователь»).
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[20px] mb-2">2. Предмет соглашения</h2>
          <p>
            Соглашение регулирует условия использования информации, размещённой на
            сайте, а также порядок взаимодействия Пользователя с Оператором при
            оформлении заявок на консультацию, расчёт стоимости и заключение договоров
            на строительство домов.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[20px] mb-2">3. Информация на сайте</h2>
          <p>
            Размещённые на сайте проекты домов, цены, характеристики и сроки носят
            информационный характер и не являются публичной офертой по смыслу ст. 437
            Гражданского кодекса РФ. Окончательная стоимость и условия определяются
            индивидуально и фиксируются в договоре подряда.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[20px] mb-2">4. Заявка и обработка</h2>
          <p>
            При отправке формы Пользователь подтверждает достоверность указанных им
            данных и согласие на их обработку в соответствии с{" "}
            <a className="text-[var(--rs-brand)] hover:underline" href="/privacy">Политикой
            обработки персональных данных</a>.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[20px] mb-2">5. Интеллектуальная собственность</h2>
          <p>
            Все материалы сайта (изображения, тексты, проекты домов, схемы, рендеры)
            принадлежат Оператору. Их использование без письменного разрешения
            запрещено.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[20px] mb-2">6. Ответственность</h2>
          <p>
            Оператор не несёт ответственности за временные сбои в работе сайта,
            прерывания связи и иные технические обстоятельства, не зависящие от него.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[20px] mb-2">7. Изменения</h2>
          <p>
            Оператор вправе изменять условия настоящего Соглашения. Актуальная редакция
            всегда доступна на странице <code>/terms</code>.
          </p>
        </section>
      </div>
    </article>
  );
}
