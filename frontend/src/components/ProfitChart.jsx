import { useEffect, useState } from "react";
import {LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,ResponsiveContainer,ReferenceArea} from "recharts";

function ProfitChart({ bookings = [] }) {
  const [data30, setData30] = useState([]);

  // Three background colors for month separation
  const monthColors = ["#f2f6ff", "#fff4e6", "#e6fff4"];

  function getDayDiff(d1, d2) {
    return Math.ceil((d2 - d1) / (1000 * 3600 * 24));
  }

  // Expand a booking into daily income values
  function expandBooking(b) {
    const { start, end } = b.dateRange || {};
    if (!start || !end) return [];

    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = getDayDiff(startDate, endDate);
    if (days <= 0) return [];

    const perDay = b.totalPrice / days;
    const arr = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      arr.push({
        date: d,
        value: perDay,
      });
    }
    return arr;
  }

  // Generate the most recent 30 days
  function getLast30Days() {
    const today = new Date();        // real system date
    // const today = new Date("2025-11-30"); // for testing

    const arr = [];

    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      arr.push({
        date: d,
        label: d.getDate().toString(), // X-axis label (day of month)
        month: d.getMonth() + 1,       // used for month detection
        profit: 0,                     // initial value
      });
    }
    return arr;
  }

  useEffect(() => {
    const daysArray = getLast30Days();

    bookings
      .filter((b) => b.status === "accepted")
      .forEach((b) => {
        expandBooking(b).forEach(({ date, value }) => {
          for (let i = 0; i < daysArray.length; i++) {
            if (daysArray[i].date.toDateString() === date.toDateString()) {
              daysArray[i].profit += value;
            }
          }
        });
      });

    setData30(daysArray);
  }, [bookings]);

  // Build month background regions
  function renderMonthAreas() {
    if (data30.length === 0) return [];

    const monthAreas = [];
    let startIndex = 0;

    for (let i = 1; i < data30.length; i++) {
      if (data30[i].month !== data30[i - 1].month) {
        monthAreas.push({
          start: startIndex,
          end: i - 1,
          month: data30[i - 1].month,
        });
        startIndex = i;
      }
    }

    // Last month segment
    monthAreas.push({
      start: startIndex,
      end: data30.length - 1,
      month: data30[data30.length - 1].month,
    });

    return monthAreas;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data30}>
          <CartesianGrid stroke="#eee" />

          {/* Month background shading */}
          {renderMonthAreas().map((m, idx) => (
            <ReferenceArea
              key={idx}
              x1={data30[m.start].label}
              x2={data30[m.end].label}
              strokeOpacity={0}
              fill={monthColors[idx % 3]} // cycle through three colors
            />
          ))}

          <XAxis dataKey="label" />
          <YAxis />

          <Tooltip
            formatter={(value) => [`$${value.toFixed(2)}`, "Profit"]}
            labelFormatter={(label, payload) => {
              if (!payload || payload.length === 0) return label;
              const item = payload[0].payload;
              const d = item.date;

              const fullDate = `${d.getFullYear()}-${String(
                d.getMonth() + 1
              ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

              return fullDate;
            }}
          />

          <Line
            type="monotone"
            dataKey="profit"
            stroke="#4dabf7"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProfitChart;
