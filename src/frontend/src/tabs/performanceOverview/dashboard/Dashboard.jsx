import React, { useState, useEffect } from "react";
import {
  Grid2,
  Card,
  CardHeader,
  CardContent,
  Typography,
} from "@mui/material";

import { getPerformance } from "../../../api/performances(t1)/getPerformance";
import ActivitiesPerResource from "./visualisations/ActivitiesPerResource";
import AvgDurationPerResource from "./visualisations/AvgDurationPerResource";
import ResourcePerformanceOverTime from "./visualisations/ResourcePerformanceOverTime";

export default function Dashboard({
  tableOneData,
  tableOneDataLoading,
  performanceData,
  loading,
}) {
  console.log("tableOneData:", tableOneData);
  return (
    <Grid2 container spacing={2} padding={2}>
      <Grid2 size={{ xs: 12 }}>
        <Card>
          <CardHeader title="Performance Dashboard" />
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              Number of Resources: {performanceData.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid2>

      {/* Row 1: Activities per Resource & Avg Duration per Resource */}
      <Grid2 size={{ xs: 12, sm: 6 }}>
        <Card>
          <CardHeader title="Activities per Resource" />
          <CardContent>
            {loading ? (
              <Typography>Loading…</Typography>
            ) : (
              <ActivitiesPerResource data={performanceData} />
            )}
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6 }}>
        <Card>
          <CardHeader title="Avg. Duration per Resource" />
          <CardContent>
            {loading ? (
              <Typography>Loading…</Typography>
            ) : (
              <AvgDurationPerResource data={performanceData} />
            )}
          </CardContent>
        </Card>
      </Grid2>

      {/* Row 2: Resource Performance over Time */}
      <Grid2 size={{ xs: 12 }}>
        <Card>
          <CardHeader title="Resource Performance over Time" />
          <CardContent>
            {tableOneDataLoading ? (
              <Typography>Loading…</Typography>
            ) : (
              <ResourcePerformanceOverTime
                data={tableOneData}
                resource="random1"
              />
            )}
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
}
