import { Routes, Route, useNavigate } from "react-router-dom";
import styles from "./DocumentManagement.module.css";

import ProcessList from "./ProcessList";
import ProcessDetails from "./ProcessDetails";
import ActivityDocuments from "./ActivityDocuments";

import EmailTemplate from "../EmailTemplate/EmailTemplate";
import DashboardLayout from "../../components/layout/DashboardLayout";

const BASE_PATH = "/document-management";

export default function DocumentManagement() {
  const navigate = useNavigate();

  return (
    <DashboardLayout activeNav="docket-process" pageTitle="Docket Process">
      <div className={styles.page}>
        <div className={styles.content}>
          <Routes>
            <Route
              index
              element={
                <ProcessList
                  onView={(process) =>
                    navigate(`${BASE_PATH}/process/${process.process_id}`, {
                      state: { process },
                    })
                  }
                />
              }
            />

            <Route
              path="process/:processId"
              element={
                <ProcessDetails
                  onBack={() => navigate(BASE_PATH)}
                  onOpenDocuments={(process, activity) =>
                    navigate(
                      `${BASE_PATH}/process/${process.process_id}/activity/${activity.activity_id}/documents`,
                      { state: { process, activity } }
                    )
                  }
                  onOpenEmailTemplate={(process, activity) =>
                    navigate(
                      `${BASE_PATH}/email-templates/${activity.activity_id}`,
                      {
                        state: {
                          process,
                          activity,
                        },
                      }
                    )
                  }
                />
              }
            />

            <Route
              path="process/:processId/activity/:activityId/documents"
              element={
                <ActivityDocuments
                  onBackToList={() => navigate(BASE_PATH)}
                  onBack={(process) =>
                    navigate(`${BASE_PATH}/process/${process.process_id}`, {
                      state: { process },
                    })
                  }
                />
              }
            />

            <Route path="email-templates/:activityId" element={<EmailTemplate />} />
          </Routes>
        </div>
      </div>
    </DashboardLayout>
  );
}