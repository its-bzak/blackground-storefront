// A title over HTML written by the merchant in the Shopify admin: pages,
// policies and the like. The styles cover what the admin's editor produces.
const PROSE = [
  "mt-12 text-lg leading-relaxed text-bone/75",
  "[&_a]:underline [&_a]:underline-offset-4 [&_a]:break-words",
  "[&_strong]:text-bone [&_p+p]:mt-6",
  "[&_h1]:mt-14 [&_h1]:font-display [&_h1]:text-4xl [&_h1]:text-bone",
  "[&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-4xl [&_h2]:text-bone",
  "[&_h3]:mt-10 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-bone",
  "[&_h2+*]:mt-5 [&_h3+*]:mt-4",
  "[&_ul]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2",
  "[&_table]:mt-8 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-base",
  "[&_th]:border [&_th]:border-bone/15 [&_th]:p-3 [&_th]:text-left [&_th]:align-top [&_th]:text-bone",
  "[&_td]:border [&_td]:border-bone/15 [&_td]:p-3 [&_td]:align-top",
  "[&_pre]:mt-6 [&_pre]:whitespace-pre-wrap [&_pre]:font-sans",
].join(" ");

export function Article({
  title,
  html,
  children,
}: {
  title: string;
  html?: string;
  children?: React.ReactNode;
}) {
  return (
    <article>
      <h1 className="font-display text-[clamp(3rem,10vw,6rem)] leading-[0.95]">
        {title}
      </h1>
      {html && (
        <div
          className={PROSE}
          // Written by the merchant in the Shopify admin.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
      {children}
    </article>
  );
}
