import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  TextField,
  Box,
  Autocomplete,
} from "@mui/material";
import {
  subDays,
  addDays,
  subWeeks,
  addWeeks,
  subMonths,
  addMonths,
  subYears,
  addYears,
  format,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { getWeekOfMonth } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { uniq } from "lodash";
import { COLORS } from "../../../../components/COLORS";

function parseGermanDateTime(dtStr) {
  const [date, time] = dtStr.split(", ");
  const [day, month, year] = date.split(".").map(Number);
  return new Date(year, month - 1, day, ...time.split(":").map(Number));
}

function aggregateByFilter(data, resource, filter, currentDate) {
  // get all unique resources
  const resources = uniq(data.map((r) => r.resource));
  let start,
    end,
    groupBy,
    labelFormat,
    groups = {};

  if (filter === "day") {
    start = new Date(currentDate.setHours(0, 0, 0, 0));
    end = new Date(currentDate.setHours(23, 59, 59, 999));
    // bIn by hour
    for (let h = 0; h < 24; ++h) {
      groups[h] = {};
      resources.forEach((res) => (groups[h][res] = []));
    }
    data.forEach((r) => {
      const t =
        typeof r.complete === "string"
          ? parseGermanDateTime(r.complete)
          : new Date(r.complete);
      if (t >= start && t <= end) {
        const h = t.getHours();
        groups[h][r.resource].push(Number(r.duration));
      }
    });
    return Array.from({ length: 24 }, (_, h) => {
      const entry = { label: `${String(h).padStart(2, "0")}:00` };
      resources.forEach((res) => {
        const arr = groups[h][res];
        entry[res] = arr.length
          ? arr.reduce((a, b) => a + b, 0) / arr.length
          : 0;
      });
      return entry;
    });
  } else if (filter === "week") {
    start = startOfWeek(currentDate, { weekStartsOn: 1 });
    end = addDays(start, 6);
    // Bin by weekday
    for (let d = 0; d < 7; ++d) {
      groups[d] = {};
      resources.forEach((res) => (groups[d][res] = []));
    }
    data.forEach((r) => {
      const t =
        typeof r.complete === "string"
          ? parseGermanDateTime(r.complete)
          : new Date(r.complete);
      if (t >= start && t <= end) {
        const d = (t.getDay() + 6) % 7; // 0=Monday, ...6=Sunday
        groups[d][r.resource].push(Number(r.duration));
      }
    });
    return Array.from({ length: 7 }, (_, d) => {
      const dayDate = addDays(start, d);
      const entry = { label: format(dayDate, "EEE dd.MM", { locale: enUS }) };
      resources.forEach((res) => {
        const arr = groups[d][res];
        entry[res] = arr.length
          ? arr.reduce((a, b) => a + b, 0) / arr.length
          : 0;
      });
      return entry;
    });
  } else if (filter === "month") {
    // Weeks of month (1-based)
    const start = startOfMonth(currentDate);
    const end = addMonths(start, 1);
    const weekCount = getWeekOfMonth(new Date(end - 1), { weekStartsOn: 1 });
    for (let w = 1; w <= weekCount; ++w) {
      groups[w] = {};
      resources.forEach((res) => (groups[w][res] = []));
    }
    data.forEach((r) => {
      const t =
        typeof r.complete === "string"
          ? parseGermanDateTime(r.complete)
          : new Date(r.complete);
      if (t >= start && t < end) {
        const w = getWeekOfMonth(t, { weekStartsOn: 1 });
        groups[w][r.resource].push(Number(r.duration));
      }
    });
    return Array.from({ length: weekCount }, (_, w) => {
      const entry = { label: `Week ${w + 1}` };
      resources.forEach((res) => {
        const arr = groups[w + 1][res];
        entry[res] = arr.length
          ? arr.reduce((a, b) => a + b, 0) / arr.length
          : 0;
      });
      return entry;
    });
  } else if (filter === "year") {
    const start = startOfYear(currentDate);
    const end = addYears(start, 1);
    for (let m = 0; m < 12; ++m) {
      groups[m] = {};
      resources.forEach((res) => (groups[m][res] = []));
    }
    data.forEach((r) => {
      const t =
        typeof r.complete === "string"
          ? parseGermanDateTime(r.complete)
          : new Date(r.complete);
      if (t >= start && t < end) {
        const m = t.getMonth();
        groups[m][r.resource].push(Number(r.duration));
      }
    });
    return Array.from({ length: 12 }, (_, m) => {
      const entry = {
        label: format(new Date(currentDate.getFullYear(), m, 1), "MMM", {
          locale: enUS,
        }),
      };
      resources.forEach((res) => {
        const arr = groups[m][res];
        entry[res] = arr.length
          ? arr.reduce((a, b) => a + b, 0) / arr.length
          : 0;
      });
      return entry;
    });
  }
  return [];
}
export default function ResourcePerformanceOverTimeChart({ data, resource }) {
  const [filter, setFilter] = useState("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  function handlePrev() {
    if (filter === "day") setCurrentDate((d) => subDays(d, 1));
    if (filter === "week") setCurrentDate((d) => subWeeks(d, 1));
    if (filter === "month") setCurrentDate((d) => subMonths(d, 1));
    if (filter === "year") setCurrentDate((d) => subYears(d, 1));
  }
  function handleNext() {
    if (filter === "day") setCurrentDate((d) => addDays(d, 1));
    if (filter === "week") setCurrentDate((d) => addWeeks(d, 1));
    if (filter === "month") setCurrentDate((d) => addMonths(d, 1));
    if (filter === "year") setCurrentDate((d) => addYears(d, 1));
  }

  const resourceList = useMemo(() => uniq(data.map((d) => d.resource)), [data]);
  const [shownResources, setShownResources] = useState(resourceList);

  const filteredResourceList = resourceList.filter((r) =>
    shownResources.includes(r)
  );


  const chartData = useMemo(
    () => aggregateByFilter(data, null, filter, new Date(currentDate)), // resource = null -> all
    [data, filter, currentDate]
  );

  // Label for selected period
  const periodLabel = useMemo(() => {
    if (filter === "day") return format(currentDate, "dd.MM.yyyy");
    if (filter === "week") {
      const startLabel = format(
        startOfWeek(currentDate, { weekStartsOn: 1 }),
        "dd.MM",
        { locale: enUS }
      );
      const endLabel = format(
        addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6),
        "dd.MM.yyyy",
        { locale: enUS }
      );
      return `${startLabel} - ${endLabel}`;
    }
    if (filter === "month") return format(currentDate, "MMMM yyyy");
    if (filter === "year") return format(currentDate, "yyyy");
    return "";
  }, [currentDate, filter]);

  useEffect(() => {
    setShownResources(resourceList);
  }, [resourceList]);

  return (
    <div style={{ width: "100%", maxWidth: 1800, marginLeft: 0  }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => v && setFilter(v)}
          size="small"
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
        <Button onClick={handlePrev} size="small">
          &lt;
        </Button>
        <span>{periodLabel}</span>
        <Button onClick={handleNext} size="small">
          &gt;
        </Button>
      </Stack>
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis
              label={{
                value: "Avg Duration (s)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            {filteredResourceList.map((resource, idx) => (
              <Line
                key={resource}
                type="monotone"
                dataKey={resource}
                stroke={COLORS[idx % COLORS.length]}
                dot
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        </Box>
        <Box sx={{ width: 400, minWidth: 200 }}>
          <Autocomplete
            multiple
            size="small"
            options={resourceList}
            value={shownResources}
            onChange={(_, value) => setShownResources(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Resources"
                placeholder="Select..."
              />
            )}
            disableCloseOnSelect
          />
        </Box>
      </Stack>
    </div>
  );
}
