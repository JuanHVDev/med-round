"use client";

import { useCallback } from "react";

interface TrackFunction {
  (eventName: string, params?: Record<string, unknown>): void;
}

export function useMedicalTracking() {
  const track: TrackFunction = (eventName, params) => {
    if (typeof window !== "undefined") {
      const gtag = (window as unknown as { gtag?: TrackFunction }).gtag;
      if (gtag) {
        gtag(eventName, params);
      }
    }
  };

  const trackPageView = useCallback(
    (pagePath: string, pageTitle?: string) => {
      track("page_view", {
        page_path: pagePath,
        page_title: pageTitle,
      });
    },
    [track]
  );

  const trackPatientView = useCallback(
    (patientId: string, patientName: string) => {
      track("view_patient", {
        patient_id: patientId,
        patient_name: patientName,
        category: "patients",
      });
    },
    [track]
  );

  const trackSOAPNoteCreated = useCallback(
    (patientId: string, noteType: string) => {
      track("create_soap_note", {
        patient_id: patientId,
        note_type: noteType,
        category: "clinical_notes",
      });
    },
    [track]
  );

  const trackHandoverCreated = useCallback(
    (handoverId: string, patientCount: number) => {
      track("create_handover", {
        handover_id: handoverId,
        patient_count: patientCount,
        category: "handoffs",
      });
    },
    [track]
  );

  const trackHandoverViewed = useCallback(
    (handoverId: string, handoverType: string) => {
      track("view_handover", {
        handover_id: handoverId,
        handover_type: handoverType,
        category: "handoffs",
      });
    },
    [track]
  );

  const trackTaskCreated = useCallback(
    (taskId: string, priority: string, patientId?: string) => {
      track("create_task", {
        task_id: taskId,
        priority: priority,
        patient_id: patientId,
        category: "tasks",
      });
    },
    [track]
  );

  const trackTaskCompleted = useCallback(
    (taskId: string, priority: string, timeToComplete?: number) => {
      track("complete_task", {
        task_id: taskId,
        priority: priority,
        time_to_complete_minutes: timeToComplete,
        category: "tasks",
      });
    },
    [track]
  );

  const trackTaskAssigned = useCallback(
    (taskId: string, assigneeId: string, assigneeName: string) => {
      track("assign_task", {
        task_id: taskId,
        assignee_id: assigneeId,
        assignee_name: assigneeName,
        category: "tasks",
      });
    },
    [track]
  );

  const trackPatientSearch = useCallback(
    (searchTerm: string, resultCount: number) => {
      track("search_patients", {
        search_term: searchTerm,
        result_count: resultCount,
        category: "search",
      });
    },
    [track]
  );

  const trackImportAction = useCallback(
    (fileType: string, recordCount: number, success: boolean) => {
      track("import_records", {
        file_type: fileType,
        record_count: recordCount,
        success: success,
        category: "import",
      });
    },
    [track]
  );

  const trackExportAction = useCallback(
    (exportType: string, recordCount: number, format: string) => {
      track("export_records", {
        export_type: exportType,
        record_count: recordCount,
        format: format,
        category: "export",
      });
    },
    [track]
  );

  const trackLogin = useCallback(
    (method: string, success: boolean) => {
      track("login", {
        method: method,
        success: success,
        category: "authentication",
      });
    },
    [track]
  );

  const trackRegistration = useCallback(
    (userType: string, specialty?: string) => {
      track("sign_up", {
        user_type: userType,
        specialty: specialty,
        category: "authentication",
      });
    },
    [track]
  );

  const trackFeatureUsed = useCallback(
    (featureName: string, context?: string) => {
      track("feature_usage", {
        feature_name: featureName,
        context: context,
        category: "engagement",
      });
    },
    [track]
  );

  const trackError = useCallback(
    (errorType: string, errorMessage: string, page?: string) => {
      track("error_occurred", {
        error_type: errorType,
        error_message: errorMessage,
        page: page,
        category: "errors",
      });
    },
    [track]
  );

  const trackPerformance = useCallback(
    (metricName: string, value: number, unit?: string) => {
      track("performance_metric", {
        metric_name: metricName,
        value: value,
        unit: unit,
        category: "performance",
      });
    },
    [track]
  );

  return {
    track,
    trackPageView,
    trackPatientView,
    trackSOAPNoteCreated,
    trackHandoverCreated,
    trackHandoverViewed,
    trackTaskCreated,
    trackTaskCompleted,
    trackTaskAssigned,
    trackPatientSearch,
    trackImportAction,
    trackExportAction,
    trackLogin,
    trackRegistration,
    trackFeatureUsed,
    trackError,
    trackPerformance,
  };
}

export function useFormTracking(formName: string) {
  const { track, trackError } = useMedicalTracking();

  const trackFormStart = useCallback(() => {
    track("form_start", {
      form_name: formName,
      category: "forms",
    });
  }, [formName, track]);

  const trackFormComplete = useCallback(
    (fieldCount?: number) => {
      track("form_complete", {
        form_name: formName,
        field_count: fieldCount,
        category: "forms",
      });
    },
    [formName, track]
  );

  const trackFormFieldFocus = useCallback(
    (fieldName: string, order: number) => {
      track("form_field_focus", {
        form_name: formName,
        field_name: fieldName,
        field_order: order,
        category: "forms",
      });
    },
    [formName, track]
  );

  const trackFormSubmit = useCallback(
    (success: boolean, errorMessage?: string) => {
      track("form_submit", {
        form_name: formName,
        success: success,
        error_message: errorMessage,
        category: "forms",
      });
    },
    [formName, track]
  );

  const trackFormError = useCallback(
    (fieldName: string, errorType: string) => {
      trackError("validation_error", `${fieldName}: ${errorType}`, formName);
    },
    [formName, trackError]
  );

  return {
    trackFormStart,
    trackFormComplete,
    trackFormFieldFocus,
    trackFormSubmit,
    trackFormError,
  };
}

export function useEngagementTracking() {
  const { track } = useMedicalTracking();

  const startEngagementTracking = useCallback(() => {
    if (typeof window === "undefined") return;

    let secondsOnPage = 0;
    const engagementTimer = setInterval(() => {
      secondsOnPage += 10;
      track("user_engagement", {
        engagement_time_msec: secondsOnPage * 1000,
      });
    }, 10000);

    let maxScrollDepth = 0;

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
      }

      if (scrollPercent >= 25 && maxScrollDepth < 50) {
        track("scroll", {
          scroll_depth: 25,
          scroll_depth_trigger: "25%",
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(engagementTimer);
    };
  }, [track]);

  const stopEngagementTracking = useCallback(() => {}, []);

  return {
    startEngagementTracking,
    stopEngagementTracking,
  };
}
