import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchForms,
  deleteForm as deleteFormAction,
  fetchFormById,
  setCurrentForm,
} from "../../store/slices/formSlice";
import { setActiveScreen } from "../../store/slices/uiSlice";
import "./css/FormList.css";

const FormList = () => {
  const dispatch = useDispatch();
  const { forms, meta, loading, error } = useSelector((state) => state.forms);
  const { token } = useSelector((state) => state.auth || {});
  const [search, setSearch] = useState("");

  const formsList = useMemo(() => {
    const list = Array.isArray(forms) ? forms : (Array.isArray(forms?.data) ? forms.data : []);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((f) => (f?.name || "").toLowerCase().includes(q));
  }, [forms, search]);

  useEffect(() => {
    if (token) {
      dispatch(fetchForms());
    }
  }, [dispatch, token]);

  const handleRefresh = () => {
    dispatch(fetchForms({ page: meta?.page || 1, perPage: meta?.per_page || 10, search }));
  };

  const handleOpen = (form) => {
    dispatch(fetchFormById(form.id))
      .unwrap()
      .then((full) => {
        dispatch(setCurrentForm(full));
        dispatch(setActiveScreen("form-builder"));
      })
      .catch(() => {
        dispatch(setCurrentForm(form));
        dispatch(setActiveScreen("form-builder"));
      });
  };

  const handleDelete = (id) => {
    if (confirm("Delete this form?")) {
      dispatch(deleteFormAction(id));
    }
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <h1>Forms</h1>
        <p>View and manage all created forms</p>
      </div>

      {/* Search input */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search forms by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, minWidth: 320, width: "100%", maxWidth: 480 }}
          />
        </div>
      </div>

      <div className="component-content">
        <div className="content-card">
          {/* List header with count and refresh on right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: 0 }}>Form List</h2>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Showing {formsList.length} form{formsList.length !== 1 ? 's' : ''}</div>
            </div>
            <div>
              <button onClick={handleRefresh} className="save-btn" disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: "#c0392b", marginBottom: 12 }}>Error: {String(error)}</div>
          )}

          {loading ? (
            <div className="loading-state"><p>Loading forms...</p></div>
          ) : formsList.length === 0 ? (
            <div className="empty-forms-state"><p>No forms found.</p></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr style={{ textAlign: "left", background: "#f8f9fa" }}>
                    <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>#</th>
                    <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Name</th>
                    <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Questions</th>
                    <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Updated</th>
                    <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formsList.map((form, idx) => (
                    <tr key={form.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: 12 }}>{idx + 1}</td>
                      <td style={{ padding: 12 }}>{form.name}</td>
                      <td style={{ padding: 12 }}>{Array.isArray(form.questions) ? form.questions.length : (form.questions_count ?? "-")}</td>
                      <td style={{ padding: 12 }}>{form.updated_at ? new Date(form.updated_at).toLocaleString() : (form.updatedAt ? new Date(form.updatedAt).toLocaleString() : "-")}</td>
                      <td style={{ padding: 12, display: "flex", gap: 8 }}>
                        <button className="preview-btn" onClick={() => handleOpen(form)}>Open</button>
                        <button className="delete-form-btn" onClick={() => handleDelete(form.id)} disabled={loading}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormList;
