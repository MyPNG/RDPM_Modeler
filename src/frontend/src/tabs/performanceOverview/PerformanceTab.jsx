import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

import PerformanceTable from "./tables/PerformanceTable";
import Dashboard from "./dashboard/Dashboard";
import ResourcePerformanceTable from "./tables/ResourcePerformanceTable";
import ResPerformanceProfileTable from "./tables/ResPerformanceProfileTable";

import { getPerformance } from "../../api/performances(t1)/getPerformance";
import { deleteAllPerformance } from "../../api/performances(t1)/deleteAllPerformance";

import { getPerformancePr } from "../../api/performanceProfile(t2)/getPerformancePr";
import { deleteAllPerformancePr } from "../../api/performanceProfile(t2)/deleteAllPerformancePr";
import { updateProfile } from "../../api/performanceProfile(t2)/updateProfile";


import { deleteAllResPerformanceData } from "../../api/resourcePerformanceProfile(t3)/deleteAllResPerformanceData";
import { updateResProfile } from "../../api/resourcePerformanceProfile(t3)/updateResProfile";
import { getResPerformancePr } from "../../api/resourcePerformanceProfile(t3)/getResPerformanceData";
import { getPerformanceData } from "../../api/pythonService/getPerformance";
import { savePerformance } from "../../api/performances(t1)/savePerformance";

const PerformanceTab = () => {
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // table 2
  const [rowsPerformancePr, setRowsPerformancePr] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [loadingPerformancePr, setLoadingPerformancePr] = useState(false);
  const [deletingPerformancePr, setDeletingPerformancePr] = useState(false);

  // table 3
  const [rowsResPerformancePr, setRowsResPerformancePr] = useState([]);
  const [resSyncing, setResSyncing] = useState(false);
  const [loadingResPerformancePr, setLoadingResPerformancePr] = useState(false);
  const [deletingResPerformancePr, setDeletingResPerformancePr] =
    useState(false);

  const [performanceData, setPerformanceData] = useState([]);
  const [performancePrData, setPerformancePrData] = useState([]);
  const [resPerformanceData, setResPerformanceData] = useState([]);

  const fetchAndSet = useCallback(async () => {
    setLoading(true);
    try {
      const savedRes = await getPerformance();
      setPerformanceData(savedRes);
      const gridRows = savedRes.map((r) => ({
        id: r._id,
        case_id: r.meta.case_id,
        activity: r.meta.task_name,
        resource: r.meta.resource_name,
        start: new Date(r.start_time).toLocaleString(),
        complete: new Date(r.complete_time).toLocaleString(),
        duration: r.duration,
      }));
      setRows(gridRows);
    } catch (err) {
      console.error("Error loading performance data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSet();
  }, [fetchAndSet]);

  const fetchAndSetPerfPr = useCallback(async () => {
    setLoadingPerformancePr(true);
    try {
      const savedRes = await getPerformancePr();
      setPerformancePrData(savedRes);
      const gridRows = savedRes.map((r) => ({
        id: r._id,
        resource: r.resource,
        task: r.task,
        count: r.count.toLocaleString(),
        totalDuration: r.totalDuration.toLocaleString(),
        minDuration: r.minDuration.toLocaleString(),
        maxDuration: r.maxDuration.toLocaleString(),
        avgDuration: r.avgDuration.toLocaleString(),
        lastUpdated: r.lastUpdated.toLocaleString(),
      }));
      setRowsPerformancePr(gridRows);
    } catch (err) {
      console.error("Error loading performance data:", err);
    } finally {
      setLoadingPerformancePr(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetPerfPr();
  }, [fetchAndSetPerfPr]);

  const fetchAndSetResPerfPr = useCallback(async () => {
    setLoadingResPerformancePr(true);
    try {
      const profiles = await getResPerformancePr();
      setResPerformanceData(profiles);
      const gridRows = profiles.map((p) => ({
        id: p._id,
        resource: p.resource,
        count: p.count,
        totalDuration: p.totalDuration,
        minDuration: p.minDuration,
        maxDuration: p.maxDuration,
        avgDuration: p.avgDuration,
        lastUpdated: p.lastUpdated,
      }));
      setRowsResPerformancePr(gridRows);
    } catch (err) {
      console.error("Error loading performance profiles:", err);
    } finally {
      setLoadingResPerformancePr(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetResPerfPr();
  }, [fetchAndSetResPerfPr]);

  function extractForProfile(record) {
    return {
      resource: record.resource,
      task: record.activity,
      duration: Number(record.duration),
    };
  }

  function extractForProfileForSync(record) {
    return {
      resource: record.meta.resource_name,
      task: record.meta.task_name,
      duration: Number(record.duration),
    };
  }

  function extractForProfileForResSync(record) {
    return {
      resource: record.resource,
      count: record.count,
      duration: Number(record.duration),
      minDuration: Number(record.minDuration),
      maxDuration: Number(record.maxDuration),
    };
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await getPerformanceData(); //python service 
      const {data} = await res;

      // save to table 1
      const savePromises = data.map((record) => {
        const payload = {
          meta: {
            case_id: record.case_id,
            task_name: record.activity,
            resource_name: record.resource,
          },
          start_time: new Date(record.start).toISOString(),
          complete_time: new Date(record.complete).toISOString(),
          duration: Number(record.duration),
        };
        return savePerformance(payload).catch((err) => {
          console.error("Error saving record:", err);
        });
      });
      await Promise.all(savePromises);
      console.log("All performance records saved.");

      // update table 2
      const updatePromises = data.map((record) => {
        console.log("record", record);
        const profilePayload = extractForProfile(record);
        return updateProfile(profilePayload).catch((err) => {
          console.error("Error updating profile:", err);
        });
      });
      await Promise.all(updatePromises);
      console.log("Alle Performance-Profile upgedatet.");

      // update table 3
      const dataOfTable3 = await getPerformancePr();
      const updateTable3rPromises = dataOfTable3.map((record) => {
        const profilePayload = {
          resource: record.resource,
          count: record.count,
          duration: Number(record.totalDuration),
          minDuration: Number(record.minDuration),
          maxDuration: Number(record.maxDuration),
        };
        return updateResProfile(profilePayload).catch((err) => {
          console.error("Error updating Table 3 profile:", err);
        });
      });
      await Promise.all(updateTable3rPromises);
      console.log("Alle Res-Performance-Profile (Table 3) upgedatet.");

      await fetchAndSet();
      await fetchAndSetPerfPr();
      await fetchAndSetResPerfPr();
    } catch (err) {
      console.error("Error in handleSave:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);

    try {
      await deleteAllPerformancePr();
      console.log("All performance profile data deleted.");

      const data = await getPerformance();
      console.log("data:", data);

      const updatePromises = data.map((record) => {
        const profilePayload = extractForProfileForSync(record);
        return updateProfile(profilePayload).catch((err) => {
          console.error("Error syncing profile:", err);
        });
      });
      await Promise.all(updatePromises);
      console.log("Alle Performance-Profile mit der Performance gesynct.");

      await fetchAndSetPerfPr();
    } catch (err) {
      console.error("Error in handleSync:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleResSync = async () => {
    setResSyncing(true);

    try {
      await deleteAllResPerformanceData();
      console.log("All resource performance profile data deleted.");

      const data = await getPerformancePr();
      console.log("data:", data);

      const updatePromises = data.map((record) => {
        const profilePayload = extractForProfileForResSync(record);
        return updateResProfile(profilePayload).catch((err) => {
          console.error("Error syncing res profile:", err);
        });
      });
      await Promise.all(updatePromises);
      console.log("Alle Performance-Profile mit der Performance gesynct.");

      await fetchAndSetPerfPr();
    } catch (err) {
      console.error("Error in handleSync:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm("Are you sure you want to delete ALL performance data?")
    ) {
      return;
    }

    setDeleting(true);
    try {
      await deleteAllPerformance();
      console.log("All performance data deleted.");

      await fetchAndSet();
    } catch (err) {
      console.error("Error deleting all performance data:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllPerformanceData = async () => {
    if (
      !window.confirm("Are you sure you want to delete ALL performance data?")
    ) {
      return;
    }

    setDeletingPerformancePr(true);
    try {
      await deleteAllPerformancePr();
      console.log("All performance profile data deleted.");

      await fetchAndSetPerfPr();
    } catch (err) {
      console.error("Error deleting all performance data:", err);
    } finally {
      setDeletingPerformancePr(false);
    }
  };

  const handleDeleteAllResPerformanceData = async () => {
    if (
      !window.confirm("Are you sure you want to delete ALL performance data?")
    ) {
      return;
    }

    setDeletingResPerformancePr(true);
    try {
      await deleteAllResPerformanceData();
      console.log("All performance res profile data deleted.");

      await fetchAndSetResPerfPr();
    } catch (err) {
      console.error("Error deleting all res performance data:", err);
    } finally {
      setDeletingResPerformancePr(false);
    }
  };

  return (
    <>
      <Dashboard
        tableOneData={rows}
        tableOneDataLoading={loading}
        performanceData={rowsResPerformancePr}
        loading={loadingResPerformancePr}
      ></Dashboard>
      <PerformanceTable
        loading={loading}
        saving={saving}
        handleSave={handleSave}
        handleDeleteAll={handleDeleteAll}
        deleting={deleting}
        rows={rows}
      ></PerformanceTable>
      <ResourcePerformanceTable
        loadingPerformancePr={loadingPerformancePr}
        syncing={syncing}
        handleSync={handleSync}
        handleDeleteAllPerformanceData={handleDeleteAllPerformanceData}
        deletingPerformancePr={deletingPerformancePr}
        rowsPerformancePr={rowsPerformancePr}
      ></ResourcePerformanceTable>
      <ResPerformanceProfileTable
        loadingPerformancePr={loadingResPerformancePr}
        syncing={resSyncing}
        handleSync={handleResSync}
        handleDeleteAllPerformanceData={handleDeleteAllResPerformanceData}
        deletingPerformancePr={deletingResPerformancePr}
        rowsPerformancePr={rowsResPerformancePr}
      ></ResPerformanceProfileTable>
    </>
  );
};

export default PerformanceTab;
