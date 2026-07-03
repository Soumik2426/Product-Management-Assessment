import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Boxes,
  BarChart3,
  Search,
  ShieldCheck,
  Warehouse,
  Zap,
  ArrowRight,
  Check,
  Github,
  Twitter,
  Linkedin,
  Sparkles,
  Package,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NimbusLogo, NimbusWordmark } from "@/components/nimbus/logo";
import { useSession } from "@/lib/auth-context";
import heroImg from "@/assets/hero-dashboard.jpg";
import featInventory from "@/assets/feature-inventory.jpg";
import featSearch from "@/assets/feature-search.jpg";
import featRoles from "@/assets/feature-roles.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nimbus — Modern Inventory Management for Growing Teams" },
      {
        name: "description",
        content:
          "Track products, SKUs, stock levels and suppliers in one sleek dashboard. Role-based access, powerful search, and real-time insights.",
      },
      { property: "og:title", content: "Nimbus — Modern Inventory Management" },
      {
        property: "og:description",
        content: "Sleek inventory management for teams that hate spreadsheets.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const session = useSession();
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      <BackgroundFX />
      <Nav session={session} />
      <main>
        <Hero session={session} />
        <TrustStrip />
        <Features />
        <Showcase />
        <HowItWorks />
        <Stats />
        <Pricing />
        <FAQ />
        <CTA session={session} />
      </main>
      <Footer />
    </div>
  );
}

function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/20 blur-[140px]" />
      <div className="absolute top-[420px] right-[-100px] h-[400px] w-[400px] rounded-full bg-brand-2/20 blur-[120px]" />
    </div>
  );
}

function Nav({ session }: { session: ReturnType<typeof useSession> }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/60 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <NimbusWordmark />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#showcase" className="hover:text-foreground transition-colors">Product</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              <Link to="/app/dashboard">
                Open Nimbus <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground hover:opacity-90">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ session }: { session: ReturnType<typeof useSession> }) {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 text-center">
      <Badge variant="outline" className="mx-auto mb-6 border-border/60 bg-card/50 backdrop-blur">
        <Sparkles className="mr-1 h-3 w-3 text-brand-2" /> v1.0 — now open for teams
      </Badge>
      <h1 className="mx-auto max-w-4xl text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
        Inventory that{" "}
        <span className="text-gradient-brand">moves as fast</span>
        <br /> as your team.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        Nimbus is the sleek inventory management platform for modern teams. Track every SKU,
        every warehouse, every supplier — with role-based access and real-time dashboards.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground hover:opacity-90 glow-brand">
          <Link to={session ? "/app/dashboard" : "/register"}>
            {session ? "Open dashboard" : "Start free"} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-border bg-card/40 backdrop-blur">
          <a href="#showcase">See the product</a>
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Demo credentials: <span className="font-mono">admin@nimbus.dev</span> / <span className="font-mono">password</span>
      </p>

      <div className="relative mx-auto mt-16 max-w-6xl">
        <div className="absolute -inset-6 bg-gradient-brand opacity-30 blur-3xl rounded-[2rem]" />
        <div className="relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-2 shadow-2xl">
          <img
            src={heroImg}
            alt="Nimbus dashboard preview"
            width={1600}
            height={1200}
            className="rounded-xl w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const brands = ["Auralux", "Halo Labs", "Ripple", "Ember", "Formwork", "Arc", "Pulse"];
  return (
    <section className="border-y border-border/60 bg-card/20 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
          Trusted by inventory-forward teams
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {brands.map((b) => (
            <span key={b} className="text-lg font-semibold text-muted-foreground/70 tracking-tight">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const featureList = [
  {
    icon: Boxes,
    title: "Real-time inventory",
    desc: "Every stock change syncs instantly across your team. No stale spreadsheets.",
  },
  {
    icon: Package,
    title: "SKU tracking",
    desc: "Structured SKUs, low-stock thresholds, and supplier metadata built in.",
  },
  {
    icon: Warehouse,
    title: "Multi-warehouse",
    desc: "Track stock across every warehouse, aisle, and bin with one click.",
  },
  {
    icon: Search,
    title: "Powerful search",
    desc: "Find any product by name, SKU, tag, or supplier in under 50ms.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    desc: "Admins manage, users view. Fine-grained control on every mutation.",
  },
  {
    icon: BarChart3,
    title: "Live analytics",
    desc: "Category breakdowns, low-stock alerts, and inventory value at a glance.",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <Badge variant="outline" className="mb-4">Features</Badge>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Every tool your ops team wishes it had.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Nimbus replaces the ten tabs, three spreadsheets, and one aging Airtable base you're
          juggling right now.
        </p>
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map((f) => (
          <Card key={f.title} className="border-border/60 bg-card/40 backdrop-blur transition-colors hover:border-primary/40">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Showcase() {
  const rows = [
    { img: featInventory, title: "See every unit.", body: "A live view of every SKU, stock level, and low-stock alert. Filter by category, warehouse, or supplier without writing a single query." },
    { img: featSearch, title: "Find anything, instantly.", body: "Keyword search across names, SKUs, descriptions, and tags. Sub-50ms results even at 100k+ SKU catalogs." },
    { img: featRoles, title: "Access that fits your team.", body: "Admins create, edit, and delete. Users browse and search. One toggle away from adding more granular roles." },
  ];
  return (
    <section id="showcase" className="mx-auto max-w-7xl px-6 py-24 space-y-24">
      {rows.map((r, i) => (
        <div key={r.title} className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
          <div>
            <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">{r.title}</h3>
            <p className="mt-4 text-lg text-muted-foreground">{r.body}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Zero config", "Instant sync", "Role-aware"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-brand opacity-20 blur-2xl rounded-3xl" />
            <img src={r.img} alt="" width={1024} height={768} loading="lazy" className="relative rounded-xl border border-border/60" />
          </div>
        </div>
      ))}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Import your catalog", d: "Drop in a CSV or start fresh. Nimbus infers categories, SKUs, and stock." },
    { n: "02", t: "Invite your team", d: "Grant admin or user access. Everyone stays on the same source of truth." },
    { n: "03", t: "Run your operation", d: "Track, edit, and ship. Get low-stock alerts before you feel them." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-4">How it works</Badge>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Live in an afternoon.</h2>
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s) => (
          <Card key={s.n} className="border-border/60 bg-card/40 backdrop-blur">
            <CardContent className="p-8">
              <div className="font-mono text-sm text-gradient-brand">{s.n}</div>
              <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "10k+", l: "SKUs tracked" },
    { v: "99.99%", l: "Uptime" },
    { v: "<50ms", l: "Search latency" },
    { v: "24/7", l: "Team support" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="text-4xl md:text-5xl font-semibold text-gradient-brand">{s.v}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      period: "/mo",
      desc: "For solo operators getting organized.",
      features: ["Up to 200 SKUs", "1 warehouse", "1 admin, 2 users", "Email support"],
      cta: "Start free",
    },
    {
      name: "Growth",
      price: "$29",
      period: "/mo",
      desc: "For growing teams shipping every day.",
      features: ["Up to 10k SKUs", "5 warehouses", "Unlimited users", "Priority support", "CSV import/export"],
      cta: "Start Growth",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "For operations at real scale.",
      features: ["Unlimited SKUs", "Unlimited warehouses", "SSO + audit logs", "SLA + dedicated CSM"],
      cta: "Talk to sales",
    },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-4">Pricing</Badge>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Simple, honest pricing.</h2>
        <p className="mt-4 text-muted-foreground">Start free. Upgrade only when it pays for itself.</p>
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={`relative border-border/60 bg-card/40 backdrop-blur ${
              t.highlight ? "border-primary/60 glow-brand" : ""
            }`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-brand text-primary-foreground border-none">Most popular</Badge>
              </div>
            )}
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold">{t.price}</span>
                <span className="text-muted-foreground">{t.period}</span>
              </div>
              <Button
                asChild
                className={`mt-6 w-full ${
                  t.highlight
                    ? "bg-gradient-brand text-primary-foreground hover:opacity-90"
                    : ""
                }`}
                variant={t.highlight ? "default" : "outline"}
              >
                <Link to="/register">{t.cta}</Link>
              </Button>
              <ul className="mt-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Is there a free plan?", a: "Yes — Starter is free forever for up to 200 SKUs and a single warehouse." },
    { q: "Can I import my existing catalog?", a: "Absolutely. CSV import is available on Growth and above; enterprise gets bespoke ETL." },
    { q: "How do roles work?", a: "Nimbus ships with Admin and User roles out of the box. Admins can create, edit, and delete; users can browse and search." },
    { q: "Do you have an API?", a: "The full REST API mirrors what the dashboard uses — search, list, CRUD, and profile endpoints." },
    { q: "Where is my data stored?", a: "Your data is stored in region-locked, encrypted-at-rest databases. Choose US, EU, or APAC." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <Badge variant="outline" className="mb-4">FAQ</Badge>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Questions, answered.</h2>
      </div>
      <Accordion type="single" collapsible className="mt-10">
        {items.map((i) => (
          <AccordionItem key={i.q} value={i.q} className="border-border/60">
            <AccordionTrigger className="text-left">{i.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{i.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function CTA({ session }: { session: ReturnType<typeof useSession> }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-14 text-center">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-primary/30 blur-3xl" />
        <div className="relative">
          <Zap className="mx-auto h-8 w-8 text-brand-2" />
          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
            Get your inventory on Nimbus today.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Free to start. No credit card required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground hover:opacity-90 glow-brand">
              <Link to={session ? "/app/dashboard" : "/register"}>
                {session ? "Open dashboard" : "Create your workspace"} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<{ h: string; links: Array<{ l: string; to?: string; href?: string }> }> = [
    { h: "Product", links: [{ l: "Features", href: "#features" }, { l: "Pricing", href: "#pricing" }, { l: "Changelog", href: "#" }, { l: "Roadmap", href: "#" }] },
    { h: "Company", links: [{ l: "About", href: "#" }, { l: "Customers", href: "#" }, { l: "Careers", href: "#" }, { l: "Contact", href: "#" }] },
    { h: "Resources", links: [{ l: "Docs", href: "#" }, { l: "API reference", href: "#" }, { l: "Community", href: "#" }, { l: "Status", href: "#" }] },
    { h: "Legal", links: [{ l: "Privacy", href: "#" }, { l: "Terms", href: "#" }, { l: "Security", href: "#" }, { l: "DPA", href: "#" }] },
  ];
  return (
    <footer className="border-t border-border/60 bg-card/20 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <NimbusLogo />
              <span className="text-lg font-semibold">Nimbus</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Inventory management for modern teams. Built for the operators who make ecommerce work.
            </p>
            <div className="mt-4 flex items-center gap-3 text-muted-foreground">
              <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div className="text-sm font-semibold">{c.h}</div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {c.links.map((l) => (
                  <li key={l.l}>
                    <a href={l.href ?? "#"} className="hover:text-foreground">{l.l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Nimbus, Inc. All rights reserved.</span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> Made for operators.
          </span>
        </div>
      </div>
    </footer>
  );
}
