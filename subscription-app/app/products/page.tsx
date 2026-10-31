import { Suspense } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function addProduct(formData: FormData) {
  "use server";
  await prisma.product.create({
    data: {
      name: String(formData.get("name")),
      type: String(formData.get("type")),
      salesPrice: Number(formData.get("salesPrice")),
      costPrice: Number(formData.get("costPrice")),
      notes: String(formData.get("notes") || ""),
    },
  });
  revalidatePath("/products");
  redirect("/products");
}

async function addVariant(formData: FormData) {
  "use server";
  await prisma.variant.create({
    data: {
      productId: Number(formData.get("productId")),
      attribute: String(formData.get("attribute")),
      value: String(formData.get("value")),
      extraPrice: Number(formData.get("extraPrice") || 0),
    },
  });
  revalidatePath("/products");
  redirect("/products");
}

async function deleteProduct(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.variant.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
  redirect("/products");
}

async function ProductSection() {
  const products = await prisma.product.findMany({
    orderBy: { id: "desc" },
    include: { variants: true },
  });

  return (
    <>
      <form action={addVariant} className="grid grid-cols-4 gap-3 mb-8 border p-4 rounded">
        <select name="productId" required className="border p-2 rounded bg-black">
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.id} {p.name}
            </option>
          ))}
        </select>
        <input name="attribute" placeholder="Attribute (e.g. Brand)" required className="border p-2 rounded" />
        <input name="value" placeholder="Value (e.g. Odoo)" required className="border p-2 rounded" />
        <input name="extraPrice" type="number" step="0.01" placeholder="Extra price (e.g. 560)" className="border p-2 rounded" />
        <button className="bg-green-600 text-white p-2 rounded col-span-4">Add variant</button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-black text-left">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Type</th>
            <th className="p-2">Sales</th>
            <th className="p-2">Cost</th>
            <th className="p-2">Variants (final price)</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t align-top">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.type}</td>
              <td className="p-2">{p.salesPrice}</td>
              <td className="p-2">{p.costPrice}</td>
              <td className="p-2">
                {p.variants.length === 0
                  ? "-"
                  : p.variants.map((v) => (
                      <div key={v.id}>
                        {v.attribute}: {v.value} (+{v.extraPrice}) = {p.salesPrice + v.extraPrice}
                      </div>
                    ))}
              </td>
              <td className="p-2">
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-red-400 underline">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function ProductsPage() {
  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <form action={addProduct} className="grid grid-cols-2 gap-3 mb-8 border p-4 rounded">
        <input name="name" placeholder="Name" required className="border p-2 rounded" />
        <input name="type" placeholder="Type (e.g. Software)" required className="border p-2 rounded" />
        <input name="salesPrice" type="number" step="0.01" placeholder="Sales price" required className="border p-2 rounded" />
        <input name="costPrice" type="number" step="0.01" placeholder="Cost price" required className="border p-2 rounded" />
        <input name="notes" placeholder="Notes" className="border p-2 rounded col-span-2" />
        <button className="bg-blue-600 text-white p-2 rounded col-span-2">Add product</button>
      </form>

      <Suspense fallback={<p>Loading...</p>}>
        <ProductSection />
      </Suspense>
    </main>
  );
}