import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ProfitChart({ bookings = {} }) {
  const [data30, setData30] = useState([]);

  function getDayDiff(d1, d2) {
    return Math.ceil((d2 - d1) / (1000 * 3600 * 24));
  }

  function expandBooking(b) {
    const [startStr, endStr] = b.dateRange || [];
    if (!startStr || !endStr) return [];

    const start = new Date(startStr);
    const end = new Date(endStr);
    const days = getDayDiff(start, end);
    if (days <= 0) return [];

    const perDay = b.totalPrice / days;

    const arr = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push({ date: d, value: perDay });
    }
    return arr;
  }

  function toDaysAgo(date) {
    const today = new Date();
    return Math.floor((today - date) / (1000 * 3600 * 24));
  }

  useEffect(() => {
    const past30 = {};
    for (let i = 0; i <= 30; i++) past30[i] = 0;

    Object.values(bookings).forEach((b) => {
      if (b.status !== "accepted") return;

      expandBooking(b).forEach(({ date, value }) => {
        const daysAgo = toDaysAgo(date);
        if (daysAgo >= 0 && daysAgo <= 30) past30[daysAgo] += value;
      });
    });

    const arr = [];
    for (let i = 0; i <= 30; i++) {
      arr.push({ daysAgo: i, profit: Number(past30[i].toFixed(2)) });
    }

    setData30(arr.reverse());
  }, [bookings]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data30}>
          <CartesianGrid stroke="#ddd" />
          <XAxis dataKey="daysAgo" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="profit" stroke="#4dabf7" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProfitChart;
