'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });

        if (res.status === 401) {
          router.push('/login'); // or trigger refresh token
        }

        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        router.push('/404'); // not found
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) return <p>Loading order...</p>;

  if (loading) return <p>Loading order...</p>;
if (!order) return <p>Order not found or failed to load.</p>;

return (
  <div className="max-w-3xl mx-auto p-6">
    <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>

    <div className="mb-6">
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Total:</strong> ${order.total}</p>
      <p><strong>Ordered on:</strong> {new Date(order.created_at).toLocaleString()}</p>
    </div>

    <h2 className="text-xl font-semibold mb-2">Items</h2>
    <ul className="space-y-4">
      {order.items.map((item: any) => (
        <li key={item.id} className="border rounded-lg p-4">
          <p className="font-medium">{item.product.name}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${item.total_price}</p>
        </li>
      ))}
    </ul>
  </div>
);

}
