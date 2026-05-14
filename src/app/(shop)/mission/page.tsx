import { Heart, Globe, Leaf, Users } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Every decision we make starts with our customers. We are committed to delivering products and experiences that exceed expectations.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Globe,
    title: "Accessible to All",
    description:
      "Quality products should not come at premium prices. We work directly with manufacturers to bring you the best value without compromise.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "We are committed to reducing our environmental footprint through eco-friendly packaging, carbon-neutral shipping, and responsible sourcing.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We believe in building a community of conscious shoppers. A portion of every sale goes to local initiatives that make a difference.",
    color: "bg-violet-50 text-violet-600",
  },
];

export default function MissionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Our Mission</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          At ShopNext, we believe that great shopping experiences should be
          simple, affordable, and sustainable. Our mission is to connect people
          with products they love while making a positive impact on the world.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title} className="rounded-2xl border bg-card p-6">
            <div className={`inline-flex rounded-xl p-3 ${v.color}`}>
              <v.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {v.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-zinc-900 p-8 text-center text-white sm:p-12">
        <h2 className="text-2xl font-bold">Our Promise</h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          We stand behind every product we sell. If you are not completely
          satisfied, our dedicated support team is here to make it right — no
          questions asked, no hassle, no exceptions.
        </p>
      </div>
    </div>
  );
}
