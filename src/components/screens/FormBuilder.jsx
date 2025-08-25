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
  
  // Form state matching the prompt requirements
  const [formName, setFormName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [formResponses, setFormResponses] = useState({});
  const [showFormBuilder, setShowFormBuilder] = useState(false);

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

    // If a form is selected elsewhere (e.g., FormList → Open), hydrate local editor state
  useEffect(() => {
    if (currentForm && (currentForm.name || Array.isArray(currentForm.questions))) {
      setFormName(currentForm.name || "");
      // Transform backend data structure to frontend structure
      const transformedQuestions = (currentForm.questions || []).map(q => ({
        id: q.id || Date.now() + Math.random(),
        questionText: q.question || q.questionText || "",
        type: q.type === "single_choice" ? "single" : q.type === "multiple_choice" ? "multiple" : "long",
        required: q.required || false,
        options: q.type === "long_text" ? [] : (q.options || [""])
      }));
      console.log('Transformed questions from currentForm:', transformedQuestions);
      setQuestions(transformedQuestions);
      setShowPreview(false);
      setShowFormBuilder(true);
    }
  }, [currentForm]);

  const handleCreateForm = () => {
    setShowFormBuilder(true);
    setFormName("");
    setQuestions([]);
    setShowPreview(false);
    dispatch(clearCurrentForm());
  };

  // Add new question with default values
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now() + Math.random(),
      questionText: "",
      type: "single", // Default to single choice
      options: [""], // Start with one empty option
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update question field
  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  // Update question option
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

  // Add new option to a question
  const addOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ""] };
      }
      return q;
    }));
  };

  // Remove option from a question
  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = q.options.filter((_, index) => index !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  // Remove question
  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Move question up/down
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

  // Save form to database
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

    // Validate questions
    questions.forEach((q, index) => {
      const questionText = (q.questionText || "").trim();
      if (!questionText) {
        errors.push(`Question ${index + 1}: question text is required`);
      } else if (questionText.length < 3) {
        errors.push(`Question ${index + 1}: must be at least 3 characters`);
      }

      // Validate options for choice questions
      if (q.type === "single" || q.type === "multiple") {
        const validOptions = (q.options || []).map(o => (o || "").trim()).filter(Boolean);
        if (validOptions.length < 2) {
          errors.push(`Question ${index + 1}: at least two non-empty options are required for choice questions`);
        }
      }
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // Prepare form data for database
    const formData = {
      name: trimmedName,
      questions: questions.map(q => {
        const filteredOptions = q.type === "long" ? [] : q.options.map(o => (o || "").trim()).filter(Boolean);
        
        return {
          question: q.questionText.trim(),
          type: q.type === "single" ? "single_choice" : q.type === "multiple" ? "multiple_choice" : "long_text",
          required: q.required,
          options: filteredOptions
        };
      })
    };

    // Debug: Log the data being sent
    console.log('Sending form data to backend:', formData);
    
    // Additional check: Make sure all choice questions have at least 2 options
    const finalErrors = [];
    formData.questions.forEach((q, index) => {
      if ((q.type === "single_choice" || q.type === "multiple_choice") && q.options.length < 2) {
        console.error(`Backend validation will fail: Question ${index + 1} (${q.type}) has only ${q.options.length} options:`, q.options);
        finalErrors.push(`Question ${index + 1}: Must have at least 2 non-empty options (currently has ${q.options.length})`);
      }
    });
    
    if (finalErrors.length > 0) {
      alert("Form validation failed:\n" + finalErrors.join("\n"));
      return;
    }

    // Save to database
    if (currentForm) {
      dispatch(updateForm({ id: currentForm.id, formData }));
    } else {
      dispatch(createForm(formData));
    }

    // Don't show alert immediately - wait for success/error from Redux
    // The alert will be shown by the useEffect that handles success/error
  };

  // Load form for editing
  const loadForm = (form) => {
    dispatch(fetchFormById(form.id))
      .unwrap()
      .then((fullForm) => {
        dispatch(setCurrentForm(fullForm));
        setFormName(fullForm.name || "");
        // Transform backend data structure to frontend structure
        const transformedQuestions = (fullForm.questions || []).map(q => ({
          id: q.id || Date.now() + Math.random(),
          questionText: q.question || q.questionText || "",
          type: q.type === "single_choice" ? "single" : q.type === "multiple_choice" ? "multiple" : "long",
          required: q.required || false,
          options: q.type === "long_text" ? [] : (q.options || [""])
        }));
        console.log('Transformed questions from fullForm:', transformedQuestions);
        setQuestions(transformedQuestions);
        setShowPreview(false);
        setShowFormBuilder(true);
      })
      .catch(() => {
        dispatch(setCurrentForm(form));
        setFormName(form.name || "");
        // Transform backend data structure to frontend structure
        const transformedQuestions = (form.questions || []).map(q => ({
          id: q.id || Date.now() + Math.random(),
          questionText: q.question || q.questionText || "",
          type: q.type === "single_choice" ? "single" : q.type === "multiple_choice" ? "multiple" : "long",
          required: q.required || false,
          options: q.type === "long_text" ? [] : (q.options || [""])
        }));
        console.log('Transformed questions from form (fallback):', transformedQuestions);
        setQuestions(transformedQuestions);
        setShowPreview(false);
        setShowFormBuilder(true);
      });
  };

  // Delete form
  const deleteForm = (formId) => {
    if (confirm("Are you sure you want to delete this form?")) {
      dispatch(deleteFormAction(formId));
      if (currentForm?.id === formId) {
        dispatch(clearCurrentForm());
        setFormName("");
        setQuestions([]);
        setShowFormBuilder(false);
      }
    }
  };

  // Handle form responses in preview
  const handleFormResponse = (questionId, value) => {
    setFormResponses({
      ...formResponses,
      [questionId]: value
    });
  };

  // Render question builder
  const renderQuestionBuilder = (question) => {
    return (
      <div key={question.id} className="question-builder">
        <div className="question-header">
          <div className="question-type-selector">
            <label>Answer Type:</label>
            <select
              value={question.type}
              onChange={(e) => {
                const newType = e.target.value;
                
                let newOptions = question.options;
                
                // Reset options based on type
                if (newType === "long") {
                  newOptions = [];
                } else if (newType === "single" || newType === "multiple") {
                  newOptions = question.options.length > 0 ? question.options : [""];
                }
                
                // Update both type and options in a single state update
                setQuestions(questions.map(q => 
                  q.id === question.id ? { ...q, type: newType, options: newOptions } : q
                ));
              }}
              className="question-type-dropdown"
            >
              <option value="single">Single Choice (Radio)</option>
              <option value="multiple">Multiple Choice (Checkbox)</option>
              <option value="long">Long Text (Textarea)</option>
            </select>

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
            value={question.questionText}
            onChange={(e) => updateQuestion(question.id, "questionText", e.target.value)}
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

            {(question.type === "single" || question.type === "multiple") && (
              <div className="options-container">
                <label>Answer Options:</label>
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

  // Render question preview (for respondents)
  const renderQuestionPreview = (question) => {
    return (
      <div key={question.id} className="question-preview">
        <label className="question-label">
          {question.questionText}
          {question.required && <span className="required-mark">*</span>}
        </label>

        {question.type === "long" && (
          <textarea
            placeholder="Enter your answer..."
            onChange={(e) => handleFormResponse(question.id, e.target.value)}
            className="preview-textarea"
            rows="4"
          />
        )}

        {question.type === "single" && (
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

        {question.type === "multiple" && (
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

  // Show initial create form screen
  if (!showFormBuilder) {
    return (
      <div className="form-builder-container">
        <div className="form-builder-header">
          <h1>Dynamic Form Builder</h1>
          <p>Create forms with different question types - Single Choice, Multiple Choice, and Long Text</p>
        </div>
        
        <div className="create-form-screen">
          <div className="create-form-content">
            <h2>Welcome to Form Builder</h2>
            <p>Start building your dynamic form by clicking the button below</p>
            <button 
              onClick={handleCreateForm}
              className="create-form-btn"
            >
              + Create New Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-builder-container">
      <div className="form-builder-header">
        <h1>Dynamic Form Builder</h1>
        <p>Create forms with different question types - Single Choice, Multiple Choice, and Long Text</p>
      </div>

      <div className="form-editor">
        <div className="editor-header">
          <input
            type="text"
            placeholder="Enter Form Name..."
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
              {showPreview ? "Edit Form" : "Preview Form"}
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
            <div className="questions-container">
              <div className="questions-header">
                <h3>Questions ({questions.length})</h3>
                <button 
                  onClick={addQuestion}
                  className="add-question-btn"
                >
                  + Add Question
                </button>
              </div>
              
              {questions.length === 0 ? (
                <div className="empty-state">
                  <p>No questions added yet. Click "Add Question" to get started!</p>
                </div>
              ) : (
                <>
                  {questions.map(renderQuestionBuilder)}
                  <div className="add-question-below">
                    <button 
                      onClick={addQuestion}
                      className="add-question-below-btn"
                    >
                      + Add Another Question
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
