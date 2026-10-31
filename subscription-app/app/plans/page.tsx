import { Suspense } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function addPlan(formData: FormData) {
  "use server";
  const endDate = String(formData.get("endDate") || "");
  await prisma.plan.create({
    data: {
      name: String(formData.get("name")),
      price: Number(formData.get("price")),
      billingPeriod: String(formData.get("billingPeriod")),
      minQuantity: Number(formData.get("minQuantity") || 1),
      startDate: new Date(String(formData.get("startDate"))),
      endDate: endDate ? new Date(endDate) : null,
      autoClose: formData.get("autoClose") === "on",
      pausable: formData.get("pausable") === "on",
      renewable: formData.get("renewable") === "on",
    },
  });
  revalidatePath("/plans");
  redirect("/plans");
}

async function deletePlan(formData: FormData) {
  "use server";
  await prisma.plan.delete({ where: { id: Number(formData.get("id")) } });
  revalidatePath("/plans");
  redirect("/plans");
}

function fmt(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "-";
}

async function PlanTable() {
  const plans = await prisma.plan.findMany({ orderBy: { id: "desc" } });

  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100 text-black text-left">
          <th className="p-2">Name</th>
          <th className="p-2">Price</th>
          <th className="p-2">Billing</th>
          <th className="p-2">Min qty</th>
          <th className="p-2">Available</th>
          <th className="p-2">Options</th>
          <th className="p-2"></th>
        </tr>
      </thead>
      <tbody>
        {plans.map((p) => (
          <tr key={p.id} className="border-t">
            <td className="p-2">{p.name}</td>
            <td className="p-2">{p.price}</td>
            <td className="p-2">{p.billingPeriod}</td>
            <td className="p-2">{p.minQuantity}</td>
            <td className="p-2">
              {fmt(p.startDate)} to {fmt(p.endDate)}
            </td>
            <td className="p-2">
              {[p.autoClose && "Auto-close", p.pausable && "Pausable", p.renewable && "Renewable"]
                .filter(Boolean)
                .join(", ") || "-"}
            </td>
            <td className="p-2">
              <form action={deletePlan}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-red-400 underline">Delete</button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PlansPage() {
  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Plans</h1>

      <form action={addPlan} className="grid grid-cols-2 gap-3 mb-8 border p-4 rounded">
        <input name="name" placeholder="Plan name" required className="border p-2 rounded" />
        <input name="price" type="number" step="0.01" placeholder="Price" required className="border p-2 rounded" />
        <select name="billingPeriod" className="border p-2 rounded bg-black">
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
        <input name="minQuantity" type="number" min="1" defaultValue="1" placeholder="Min quantity" className="border p-2 rounded" />
        <label className="text-sm">
          Available from
          <input name="startDate" type="date" required className="border p-2 rounded w-full" />
        </label>
        <label className="text-sm">
          Available until (optional)
          <input name="endDate" type="date" className="border p-2 rounded w-full" />
        </label>
        <div className="col-span-2 flex gap-6 text-sm">
          <label><input type="checkbox" name="autoClose" /> Auto-close at end</label>
          <label><input type="checkbox" name="pausable" /> Pausable</label>
          <label><input type="checkbox" name="renewable" /> Renewable</label>
        </div>
        <button className="bg-blue-600 text-white p-2 rounded col-span-2">Add plan</button>
      </form>

      <Suspense fallback={<p>Loading...</p>}>
        <PlanTable />
      </Suspense>
    </main>
  );
}