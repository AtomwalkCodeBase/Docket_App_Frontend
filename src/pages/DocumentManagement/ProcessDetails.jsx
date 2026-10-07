import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import styles from "./DocumentManagement.module.css";
import { Toolbar, DataTable, Breadcrumbs, DetailField } from "./ProcessList";
import { FiArrowLeft } from "react-icons/fi";
import Button from "../../components/common/Button";

import {
    getProcessList,
    getProcessActivityList
} from "../../services/productServices";

export default function ProcessDetails({ onBack, onOpenDocuments, onOpenEmailTemplate }) {
  const { processId } = useParams();
  const location = useLocation();
  const [process, setProcess] = useState(location.state?.process || null);
  const [activityList, setActivityList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (process) return;
    getProcessList()
      .then((res) => {
        const match = (res.data || []).find(
          (p) => String(p.process_id) === String(processId)
        );
        if (match) setProcess(match);
      })
      .catch((err) => console.log(err));
  }, [process, processId]);

  const loadActivityList = () => {
    setLoading(true);
    getProcessActivityList({process_id: processId})
      .then((res) => {
        setActivityList(res.data || []);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActivityList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processId]);

  const rows = useMemo(
    () =>
      activityList.filter((a) =>
        (a.activity_name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [search, activityList]
  );

  const resolvedProcess = process || { process_id: processId };

  const columns = [
    { key: "activity_name", label: "Activity Name" },
    { key: "activity_id", label: "Activity ID" },
    { key: "planned_days", label: "Planned Days" },
    { key: "dependent_activity", label: "Dependent Activity" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className={styles.rowActions}>
          <Button
            variant="view"
            onClick={() => onOpenDocuments(resolvedProcess, row)}
          >
            Documents
          </Button>
          <Button
            variant={row.mail_template_name ? "edit" : "add"}
            onClick={() => onOpenEmailTemplate(resolvedProcess, row)}
          >
            {row.mail_template_name ? "Edit Template" : "Add Template"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex",
    justifyContent: "flex-end",
    marginBottom: 14, }}>
        <Button
          variant="back"
          icon={<FiArrowLeft size={14} />}
          onClick={onBack}
        >
          Back to Process List
        </Button>
      </div>
      <Breadcrumbs
        items={[
          { label: "Process List", onClick: onBack },
          { label: process?.process_name || `Process ${processId}` },
        ]}
      />

      <div className={styles.detailCard}>
        <div className={styles.detailGrid}>
          <DetailField label="Process Name" value={process?.process_name} />
          <DetailField label="Process ID" value={process?.process_id || processId} />
          <DetailField label="Process Type" value={process?.process_type} />
          <DetailField label="Planned Days" value={process?.planned_days} />
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search activities..."
        onRefresh={loadActivityList}
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id ?? row.activity_id}
        emptyMessage={loading ? "Loading activities..." : "No activities found."}
      />
    </div>
  );
}