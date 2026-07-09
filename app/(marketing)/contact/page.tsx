import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ContactForm } from "@/components/sections/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about a fragrance, an order, or a tier. Ask us.",
};

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <header>
          <p className="overline">Contact</p>
          <h1 className="mt-4 text-h1 font-semibold tracking-tight text-foreground">
            Ask us anything
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Questions about a fragrance, an order, or why something is tiered
            the way it is. We answer all three.
          </p>

          <dl className="mt-12 flex flex-col gap-8">
            <div>
              <dt className="overline">Before you write</dt>
              <dd className="mt-3 text-base text-muted-foreground">
                Most questions about how a fragrance wears are answered on its
                page — longevity, projection, and the full pyramid are published
                for every bottle.{" "}
                <Link
                  href="/shop"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Browse the catalogue
                </Link>
                .
              </dd>
            </div>
            <div>
              <dt className="overline">Response time</dt>
              <dd className="mt-3 text-base text-muted-foreground">
                Two working days. We are a small team and we read everything
                ourselves.
              </dd>
            </div>
          </dl>
        </header>

        <div>
          <h2 className="sr-only">Contact form</h2>
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
