const CONTACT_EMAIL = "khsumit28@gmail.com";

export function Contact() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-4 flex flex-wrap items-center gap-x-2 text-muted-foreground">
        Email:
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex min-h-10 items-center font-medium text-foreground underline-offset-4 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
    </section>
  );
}
