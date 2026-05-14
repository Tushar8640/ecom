import { Separator } from "@/components/ui/separator";

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business day delivery. Free shipping on orders over ৳5,000.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day return policy on all items. Products must be in their original condition and packaging. Refunds are processed within 5-7 business days.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship within the United States. International shipping is coming soon. Sign up for our newsletter to be notified.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order ships, you will receive a tracking number via email. You can also check your order status in the Orders section of your account.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and Apple Pay. All transactions are secured with 256-bit SSL encryption.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team and we will do our best to accommodate your request.",
  },
  {
    q: "Do you offer warranty on products?",
    a: "Warranty varies by product and manufacturer. Check the product page for specific warranty details. We also offer extended protection plans on select items.",
  },
  {
    q: "How do I contact customer support?",
    a: "You can reach us via the Contact page, email us at support@shopnext.com, or use the Messages section in your account for direct support.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find answers to the most common questions about ShopNext.
        </p>
      </div>

      <div className="mt-10 space-y-1">
        {faqs.map((faq, i) => (
          <div key={i}>
            <div className="py-5">
              <h3 className="text-base font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </div>
            {i < faqs.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );
}
