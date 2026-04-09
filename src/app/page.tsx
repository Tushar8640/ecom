"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import FlashSaleSection from "@/components/shared/FlashSaleSection";
import RecentlyViewed from "@/components/products/RecentlyViewed";
import PersonalizedSection from "@/components/shared/PersonalizedSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Truck,
  Shield,
  Headphones,
  RotateCcw,
  Monitor,
  Shirt,
  Watch,
  Home as HomeIcon,
  Dumbbell,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  _count: { products: number };
}

const categoryStyles: Record<
  string,
  { icon: typeof Monitor; gradient: string; image: string }
> = {
  Electronics: {
    icon: Monitor,
    gradient: "from-blue-600 to-indigo-700",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80",
  },
  Clothing: {
    icon: Shirt,
    gradient: "from-rose-500 to-pink-700",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
  },
  Accessories: {
    icon: Watch,
    gradient: "from-amber-500 to-orange-700",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  },
  "Home & Kitchen": {
    icon: HomeIcon,
    gradient: "from-emerald-500 to-teal-700",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
  },
  Sports: {
    icon: Dumbbell,
    gradient: "from-violet-500 to-purple-700",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
  },
};

const defaultCategoryStyle = {
  icon: Monitor,
  gradient: "from-gray-500 to-gray-700",
  image:
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products?limit=8"),
          fetch("/api/categories"),
        ]);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.products || []);
        }
        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data.categories || []);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-zinc-900 text-white">
          <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:gap-12 lg:px-8 lg:py-24">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-300 backdrop-blur">
                New Season Collection
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Discover Products{" "}
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  You&apos;ll Love
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-lg text-zinc-400 lg:mx-0">
                Shop the latest tech, fashion, and lifestyle essentials. Great
                prices, fast delivery, and exceptional service — all in one
                place.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Button
                  size="lg"
                  className="bg-white text-zinc-900 hover:bg-zinc-100"
                  asChild
                >
                  <Link href="/products">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  asChild
                >
                  <Link href="/products">Browse Categories</Link>
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative flex-1">
              <div className="relative mx-auto aspect-square w-full max-w-lg">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 to-violet-500/30 blur-3xl" />
                <div className="relative h-full w-full overflow-hidden rounded-3xl">
                  <Image
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80"
                    alt="Shopping collection"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        </section>

        {/* Services */}
        <section className="border-b bg-white py-12">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "On orders over ৳5,000",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Shield,
                title: "Secure Payment",
                desc: "100% secure checkout",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                desc: "Dedicated support team",
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                desc: "30-day return policy",
                color: "bg-amber-50 text-amber-600",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-4 rounded-xl border border-transparent bg-gray-50/80 p-4 transition-colors hover:border-gray-200 hover:bg-white hover:shadow-sm"
              >
                <div className={`rounded-xl p-3 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Flash Sales */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FlashSaleSection />
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Shop by Category
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Find exactly what you&apos;re looking for
                </p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {categories.map((cat) => {
                  const style =
                    categoryStyles[cat.name] || defaultCategoryStyle;
                  const Icon = style.icon;
                  return (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      className="group relative overflow-hidden rounded-2xl"
                    >
                      {/* Background image */}
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={style.image}
                          alt={cat.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                        />
                        {/* Gradient overlay */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-t ${style.gradient} opacity-70 transition-opacity group-hover:opacity-80`}
                        />
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                        <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mt-3 text-lg font-bold">{cat.name}</h3>
                        <p className="mt-1 text-sm text-white/80">
                          {cat._count.products} product
                          {cat._count.products !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed />

        {/* Personalized Recommendations */}
        <PersonalizedSection />

        {/* Featured Products */}
        <section className="bg-muted/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                Featured Products
              </h2>
              <Button variant="ghost" asChild>
                <Link href="/products">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 rounded-xl" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="py-12 text-center text-muted-foreground">
                  No products yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
