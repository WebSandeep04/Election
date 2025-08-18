## Form API Specification

### Overview
- **Base URL**: `${API_BASE_URL}/api`
- **Auth**: Bearer token (recommended). Header: `Authorization: Bearer <token>`
- **Content-Type**: `application/json`
- **Entity**: A Form has nested Questions and Options (for choice questions)

### Data Model
- **Form**
  - `id`: number
  - `name`: string (required)
  - `user_id`: number (from auth/session)
  - `created_at`, `updated_at`: ISO strings
  - `questions`: `Question[]`
- **Question**
  - `id`: number
  - `question`: string (required)
  - `type`: `single_choice | multiple_choice | long_text` (required)
  - `required`: boolean (default false)
  - `placeholder`: string (only for `long_text`)
  - `options`: `string[]` (required for choice questions, min 2 non-empty)
  - `order`: number (server-managed optional in request)

### Endpoints

#### GET `/api/forms`
- **Query**
  - `page`: number (default 1)
  - `per_page`: number (default 10, max 100)
  - `search`: string (optional; matches `name`)
- **Response 200**
```json
{
  "data": [
    { "id": 1, "name": "Customer Feedback", "created_at": "2024-01-01T12:00:00Z", "updated_at": "2024-01-02T12:00:00Z" }
  ],
  "meta": { "page": 1, "per_page": 10, "total": 1, "total_pages": 1 }
}
```

#### POST `/api/forms`
- **Body**
```json
{
  "name": "Customer Feedback",
  "questions": [
    {"question": "Overall experience?", "type": "single_choice", "required": true, "options": ["Excellent", "Good", "Average", "Poor"]},
    {"question": "Issues you faced?", "type": "multiple_choice", "options": ["Price", "Support", "Quality", "Delivery"]},
    {"question": "Additional comments", "type": "long_text", "placeholder": "Write here..."}
  ]
}
```
- **Response 201** (example)
```json
{
  "id": 123,
  "name": "Customer Feedback",
  "user_id": 45,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "questions": [
    {"id": 1, "question": "Overall experience?", "type": "single_choice", "required": true, "options": ["Excellent", "Good", "Average", "Poor"], "order": 1},
    {"id": 2, "question": "Issues you faced?", "type": "multiple_choice", "required": false, "options": ["Price", "Support", "Quality", "Delivery"], "order": 2},
    {"id": 3, "question": "Additional comments", "type": "long_text", "required": false, "placeholder": "Write here...", "order": 3}
  ]
}
```

#### GET `/api/forms/{id}`
- **Response 200**
```json
{
  "id": 123,
  "name": "Customer Feedback",
  "user_id": 45,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-02T09:00:00Z",
  "questions": [
    {"id": 1, "question": "Overall experience?", "type": "single_choice", "required": true, "options": ["Excellent", "Good", "Average", "Poor"], "order": 1}
  ]
}
```

#### PUT `/api/forms/{id}`
- **Body** (same shape as POST; full replace/update)
```json
{
  "name": "Customer Feedback (v2)",
  "questions": [
    {"question": "Overall experience?", "type": "single_choice", "required": true, "options": ["Excellent","Good","Average","Poor"]},
    {"question": "Any comments?", "type": "long_text", "placeholder": "Write here..."}
  ]
}
```
- **Response 200**: Updated `Form` object

#### DELETE `/api/forms/{id}`
- **Response 200**
```json
{ "message": "deleted" }
```

### Validation Rules
- **Form**
  - `name`: required, 3..255 chars
  - `questions`: required, array, min 1
- **Question**
  - `question`: required, 3..1000 chars
  - `type`: one of `single_choice`, `multiple_choice`, `long_text`
  - `required`: boolean
  - `placeholder`: string (only allowed for `long_text`)
  - `options`: required for `single_choice`/`multiple_choice`, array of strings, min 2, each 1..500 chars, non-empty when trimmed

### Error Format
- Status codes: `400|401|403|404|422|500`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "questions.0.options": ["At least two options are required"] }
  }
}
```

### Transactional Behavior
- **POST/PUT**: Create/update `forms`, then upsert `questions` in order; for choice types, replace `options`. All within a single DB transaction.
- **DELETE**: Cascade deletes questions and options.

### Sample cURL
```bash
# Create
curl -X POST "$API_BASE_URL/api/forms" \
 -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
 -d '{
  "name": "Customer Feedback",
  "questions": [
    {"question": "Overall experience?", "type": "single_choice", "required": true, "options": ["Excellent","Good","Average","Poor"]},
    {"question": "Issues you faced?", "type": "multiple_choice", "options": ["Price","Support","Quality","Delivery"]},
    {"question": "Additional comments", "type": "long_text", "placeholder": "Write here..."}
  ]
}'

# Update
curl -X PUT "$API_BASE_URL/api/forms/123" \
 -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
 -d '{
  "name": "Customer Feedback (v2)",
  "questions": [
    {"question": "Overall experience?", "type": "single_choice", "required": true, "options": ["Excellent","Good","Average","Poor"]},
    {"question": "Any comments?", "type": "long_text", "placeholder": "Write here..."}
  ]
}'

# List
curl "$API_BASE_URL/api/forms?page=1&per_page=10&search=feedback" -H "Authorization: Bearer <token>"

# Get single
curl "$API_BASE_URL/api/forms/123" -H "Authorization: Bearer <token>"

# Delete
curl -X DELETE "$API_BASE_URL/api/forms/123" -H "Authorization: Bearer <token>"
```

### OpenAPI 3.0 (Swagger)
```yaml
openapi: 3.0.3
info:
  title: Form API
  version: 1.0.0
servers:
  - url: https://api.example.com/api
paths:
  /forms:
    get:
      summary: List forms
      parameters:
        - in: query
          name: page
          schema: { type: integer, default: 1 }
        - in: query
          name: per_page
          schema: { type: integer, default: 10, maximum: 100 }
        - in: query
          name: search
          schema: { type: string }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema: { $ref: '#/components/schemas/PaginatedForms' }
    post:
      summary: Create form
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/FormCreate' }
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Form' }
  /forms/{id}:
    get:
      summary: Get form
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: integer }
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Form' } } } }
        '404': { description: Not Found }
    put:
      summary: Update form
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/FormCreate' }
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Form' } } } }
    delete:
      summary: Delete form
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: integer }
      responses:
        '200': { description: Deleted }
components:
  schemas:
    FormCreate:
      type: object
      required: [name, questions]
      properties:
        name: { type: string, minLength: 3, maxLength: 255 }
        questions:
          type: array
          minItems: 1
          items: { $ref: '#/components/schemas/QuestionInput' }
    QuestionInput:
      type: object
      required: [question, type]
      properties:
        question: { type: string, minLength: 3, maxLength: 1000 }
        type: { type: string, enum: [single_choice, multiple_choice, long_text] }
        required: { type: boolean, default: false }
        placeholder: { type: string }
        options:
          type: array
          items: { type: string, minLength: 1, maxLength: 500 }
    Form:
      allOf:
        - $ref: '#/components/schemas/FormCreate'
        - type: object
          required: [id, created_at, updated_at]
          properties:
            id: { type: integer }
            user_id: { type: integer }
            created_at: { type: string, format: date-time }
            updated_at: { type: string, format: date-time }
    PaginatedForms:
      type: object
      properties:
        data:
          type: array
          items:
            type: object
            properties:
              id: { type: integer }
              name: { type: string }
              created_at: { type: string, format: date-time }
              updated_at: { type: string, format: date-time }
        meta:
          type: object
          properties:
            page: { type: integer }
            per_page: { type: integer }
            total: { type: integer }
            total_pages: { type: integer }
```

### MySQL Schema (DDL)
```sql
CREATE TABLE forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('single_choice','multiple_choice','long_text') NOT NULL,
  is_required TINYINT(1) DEFAULT 0,
  placeholder_text TEXT NULL,
  question_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_questions_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  INDEX idx_form_id (form_id),
  INDEX idx_question_order (question_order)
);

CREATE TABLE question_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_text VARCHAR(500) NOT NULL,
  option_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id),
  INDEX idx_option_order (option_order)
);
```

### Laravel (optional) integration notes
- **Routes** (`routes/api.php`)
```php
Route::middleware('auth:sanctum')->group(function () {
  Route::get('/forms', [FormController::class, 'index']);
  Route::post('/forms', [FormController::class, 'store']);
  Route::get('/forms/{id}', [FormController::class, 'show']);
  Route::put('/forms/{id}', [FormController::class, 'update']);
  Route::delete('/forms/{id}', [FormController::class, 'destroy']);
});
```
- **Controller transaction pattern** (store/update)
```php
DB::transaction(function () use ($request, $form) {
  $form->fill(['name' => $request->name, 'user_id' => auth()->id()])->save();
  $form->questions()->delete();
  foreach ($request->questions as $i => $q) {
    $question = $form->questions()->create([
      'question_text' => $q['question'],
      'question_type' => $q['type'],
      'is_required' => $q['required'] ?? false,
      'placeholder_text' => $q['placeholder'] ?? null,
      'question_order' => $i + 1,
    ]);
    if (in_array($q['type'], ['single_choice','multiple_choice'])) {
      foreach (($q['options'] ?? []) as $j => $opt) {
        $question->options()->create(['option_text' => $opt, 'option_order' => $j + 1]);
      }
    }
  }
});
```

### Notes
- **Auth**: Use your existing auth to resolve `user_id`
- **CORS**: Configure as per environment
- **Limits**: Enforce sane limits for text length and list sizes
- **Security**: Sanitize inputs and use prepared statements/ORM
