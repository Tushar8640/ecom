import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">About ShopNest</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          We started with a simple idea: shopping online should be easy,
          enjoyable, and affordable for everyone.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl">
        <Image
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
          alt="ShopNest team"
          width={1200}
          height={500}
          className="h-64 w-full object-cover sm:h-80"
        />
      </div>

      <div className="mt-12 space-y-6 text-muted-foreground">
        <p>
          Founded in 2024, ShopNest has grown from a small online store to a
          trusted marketplace serving thousands of happy customers. We carefully
          curate our product catalog to bring you the best in electronics,
          fashion, accessories, home essentials, and sports gear.
        </p>
        <p>
          Our team is passionate about finding quality products at great prices.
          We work directly with brands and manufacturers to cut out the
          middleman, passing the savings on to you. Every product is vetted for
          quality before it makes it to our shelves.
        </p>
        <p>
          But we are more than just a store. We are building a community of
          conscious shoppers who care about value, quality, and sustainability.
          We are committed to eco-friendly packaging, responsible sourcing, and
          giving back to the communities we serve.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {[
          { stat: "10,000+", label: "Happy Customers" },
          { stat: "500+", label: "Products" },
          { stat: "4.9/5", label: "Average Rating" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border bg-card p-6 text-center"
          >
            <p className="text-3xl font-bold">{item.stat}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
