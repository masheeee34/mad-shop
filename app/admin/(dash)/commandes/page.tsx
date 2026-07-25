import { allOrders } from "@/lib/data/orders";
import { OrderManager } from "@/components/admin/order-manager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await allOrders();
  return <OrderManager orders={orders} />;
}
