import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchForms,
  createForm,
  updateForm,
  deleteForm as deleteFormAction,
  fetchFormById,
  clearError,
  clearSuccess,
  setCurrentForm,
  clearCurrentForm
} from "../../store/slices/formSlice";
import "./css/FormBuilder.css";

const FormBuilder = () => {
  const dispatch = useDispatch();
  const { forms, currentForm, loading, error, success } = useSelector((state) => state.forms);
  const { isAuthenticated, token } = useSelector((state) => state.auth || {});
  const formsList = Array.isArray(forms) ? forms : (Array.isArray(forms?.data) ? forms.data : []);
  
  const [formName, setFormName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [formResponses, setFormResponses] = useState({});

  // Fetch forms on component mount
  useEffect(() => {
    if (token) {
      dispatch(fetchForms());
    }
  }, [dispatch, token]);

  // Handle notifications
  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
    if (success) {
      alert(success);
      dispatch(clearSuccess());
    }
  }, [error, success, dispatch]);

  const questionTypes = [
    { id: "single_choice", label: "Single Choice", icon: "🔘" },
    { id: "multiple_choice", label: "Multiple Choice", icon: "☑️" },
    { id: "long_text", label: "Long Text", icon: "📝" }
  ];

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now() + Math.random(),
      type: type,
      question: "",
      required: false,
      options: type === "single_choice" || type === "multiple_choice" ? [""] : [],
      placeholder: "",
      validation: {
        minLength: "",
        maxLength: "",
        pattern: ""
      }
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ""] };
      }
      return q;
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = q.options.filter((_, index) => index !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };
  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const moveQuestion = (id, direction) => {
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return;

    const newQuestions = [...questions];
    if (direction === "up" && index > 0) {
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    } else if (direction === "down" && index < questions.length - 1) {
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    }
    setQuestions(newQuestions);
  };

  const saveForm = () => {
    const errors = [];

    const trimmedName = (formName || "").trim();
    if (!trimmedName) {
      errors.push("Form name is required");
    } else if (trimmedName.length < 3) {
      errors.push("Form name must be at least 3 characters");
    }

    if (questions.length === 0) {
      errors.push("Add at least one question");
    }

    // Sanitize and validate questions per API spec
    const sanitizedQuestions = questions.map((q, index) => {
      const questionText = (q.question || "").trim();
      const type = q.type;
      const required = !!q.required;
      const isChoice = type === "single_choice" || type === "multiple_choice";
      const isLongText = type === "long_text";

      if (!questionText) {
        errors.push(`Question ${index + 1}: question is required`);
      } else if (questionText.length < 3) {
        errors.push(`Question ${index + 1}: must be at least 3 characters`);
      }

      if (!["single_choice", "multiple_choice", "long_text"].includes(type)) {
        errors.push(`Question ${index + 1}: invalid type`);
      }

      const payload = { question: questionText, type, required };

      if (isLongText) {
        const placeholder = (q.placeholder || "").trim();
        if (placeholder) payload.placeholder = placeholder;
      }

      if (isChoice) {
        const opts = (q.options || []).map(o => (o || "").trim()).filter(Boolean);
        if (opts.length < 2) {
          errors.push(`Question ${index + 1}: at least two non-empty options are required`);
        }
        payload.options = opts;
      }

      return payload;
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const formData = {
      name: trimmedName,
      questions: sanitizedQuestions,
    };

    if (currentForm) {
      dispatch(updateForm({ id: currentForm.id, formData }));
    } else {
      dispatch(createForm(formData));
    }

    // Reset form
    dispatch(clearCurrentForm());
    setFormName("");
    setQuestions([]);
    setShowPreview(false);
  };

  const loadForm = (form) => {
    // Prefer fetching full form from API to ensure questions are loaded
    dispatch(fetchFormById(form.id))
      .unwrap()
      .then((fullForm) => {
        dispatch(setCurrentForm(fullForm));
        setFormName(fullForm.name || "");
        setQuestions(fullForm.questions || []);
        setShowPreview(false);
      })
      .catch(() => {
        // Fallback to available data
        dispatch(setCurrentForm(form));
        setFormName(form.name || "");
        setQuestions(Array.isArray(form.questions) ? form.questions : []);
        setShowPreview(false);
      });
  };

  const deleteForm = (formId) => {
    if (confirm("Are you sure you want to delete this form?")) {
      dispatch(deleteFormAction(formId));
      if (currentForm?.id === formId) {
        dispatch(clearCurrentForm());
        setFormName("");
        setQuestions([]);
      }
    }
  };

  const handleFormResponse = (questionId, value) => {
    setFormResponses({
      ...formResponses,
      [questionId]: value
    });
  };

  const renderQuestionBuilder = (question) => {
    return (
      <div key={question.id} className="question-builder">
        <div className="question-header">
          <div className="question-type-badge">
            {questionTypes.find(t => t.id === question.type)?.icon} {questionTypes.find(t => t.id === question.type)?.label}
          </div>
          <div className="question-actions">
            <button 
              onClick={() => moveQuestion(question.id, "up")}
              disabled={questions.indexOf(question) === 0}
              className="action-btn"
            >
              ⬆️
            </button>
            <button 
              onClick={() => moveQuestion(question.id, "down")}
              disabled={questions.indexOf(question) === questions.length - 1}
              className="action-btn"
            >
              ⬇️
            </button>
            <button onClick={() => removeQuestion(question.id)} className="action-btn delete">
              🗑️
            </button>
          </div>
        </div>

        <div className="question-content">
          <input
            type="text"
            placeholder="Enter your question here..."
            value={question.question}
            onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
            className="question-input"
          />

                                           <div className="question-settings">
              <label className="required-checkbox">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => updateQuestion(question.id, "required", e.target.checked)}
                />
                Required
              </label>

              {(question.type === "long_text") && (
                <input
                  type="text"
                  placeholder="Placeholder text (optional)"
                  value={question.placeholder}
                  onChange={(e) => updateQuestion(question.id, "placeholder", e.target.value)}
                  className="placeholder-input"
                />
              )}

              {(question.type === "single_choice" || question.type === "multiple_choice") && (
                <div className="options-container">
                  <label>Options:</label>
                  {question.options.map((option, index) => (
                    <div key={index} className="option-row">
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateQuestionOption(question.id, index, e.target.value)}
                        className="option-input"
                      />
                      {question.options.length > 1 && (
                        <button 
                          onClick={() => removeOption(question.id, index)}
                          className="remove-option-btn"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => addOption(question.id)}
                    className="add-option-btn"
                  >
                    + Add Option
                  </button>
                </div>
              )}
            </div>
        </div>
      </div>
    );
  };

  const renderQuestionPreview = (question) => {
    return (
      <div key={question.id} className="question-preview">
        <label className="question-label">
          {question.question}
          {question.required && <span className="required-mark">*</span>}
        </label>

        {question.type === "long_text" && (
          <textarea
            placeholder={question.placeholder || "Enter your answer..."}
            onChange={(e) => handleFormResponse(question.id, e.target.value)}
            className="preview-textarea"
            rows="4"
          />
        )}

        {question.type === "single_choice" && (
          <div className="radio-group">
            {question.options.map((option, index) => (
              <label key={index} className="radio-option">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  onChange={(e) => handleFormResponse(question.id, e.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
        )}

        {question.type === "multiple_choice" && (
          <div className="checkbox-group">
            {question.options.map((option, index) => (
              <label key={index} className="checkbox-option">
                <input
                  type="checkbox"
                  value={option}
                  onChange={(e) => {
                    const currentValues = formResponses[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleFormResponse(question.id, newValues);
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="form-builder-container">
      <div className="form-builder-header">
        <h1>Form Builder</h1>
        <p>Create dynamic forms with different question types</p>
      </div>

      <div className="form-builder-content">
        <div className="forms-sidebar">
          <div className="forms-header">
            <h3>My Forms</h3>
                         <button 
               onClick={() => {
                 dispatch(clearCurrentForm());
                 setFormName("");
                 setQuestions([]);
                 setShowPreview(false);
               }}
               className="new-form-btn"
             >
              + New Form
            </button>
          </div>
          
                     <div className="forms-list">
             {loading ? (
               <div className="loading-state">
                 <p>Loading forms...</p>
               </div>
             ) : formsList.length === 0 ? (
               <div className="empty-forms-state">
                 <p>No forms created yet. Create your first form!</p>
               </div>
             ) : (
               formsList.map(form => (
                 <div key={form.id} className="form-item">
                   <div className="form-item-content" onClick={() => loadForm(form)}>
                     <h4>{form.name}</h4>
                     <p>{Array.isArray(form.questions) ? `${form.questions.length} questions` : (typeof form.questions_count === 'number' ? `${form.questions_count} questions` : '')}</p>
                     <small>{new Date(form.updated_at || form.updatedAt).toLocaleDateString()}</small>
                   </div>
                   <button 
                     onClick={() => deleteForm(form.id)}
                     className="delete-form-btn"
                     disabled={loading}
                   >
                     🗑️
                   </button>
                 </div>
               ))
             )}
           </div>
        </div>

        <div className="form-editor">
          <div className="editor-header">
            <input
              type="text"
              placeholder="Enter form name..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="form-name-input"
            />
                         <div className="editor-actions">
               <button 
                 onClick={() => setShowPreview(!showPreview)}
                 className="preview-btn"
                 disabled={loading}
               >
                 {showPreview ? "Edit" : "Preview"}
               </button>
               <button 
                 onClick={saveForm} 
                 className="save-btn"
                 disabled={loading}
               >
                 {loading ? "Saving..." : "Save Form"}
               </button>
             </div>
          </div>

          {showPreview ? (
            <div className="form-preview">
              <h2>{formName || "Untitled Form"}</h2>
              {questions.map(renderQuestionPreview)}
              <button className="submit-btn">Submit Form</button>
            </div>
          ) : (
            <div className="form-builder">
              <div className="question-types">
                <h3>Add Questions</h3>
                <div className="question-types-grid">
                  {questionTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => addQuestion(type.id)}
                      className="question-type-btn"
                    >
                      <span className="type-icon">{type.icon}</span>
                      <span className="type-label">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="questions-container">
                <h3>Questions ({questions.length})</h3>
                {questions.length === 0 ? (
                  <div className="empty-state">
                    <p>No questions added yet. Click on a question type above to get started!</p>
                  </div>
                ) : (
                  questions.map(renderQuestionBuilder)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
