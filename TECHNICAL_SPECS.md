# TaskMe - Technical Specifications

## 1. Extension Manifest Configuration

### 1.1 Manifest.json (Version 3)

```json
{
  "manifest_version": 3,
  "name": "TaskMe - Natural Language Calendar",
  "version": "1.0.0",
  "description": "Create Google Calendar events using natural language input",
  
  "permissions": [
    "storage",
    "contextMenus",
    "activeTab",
    "identity"
  ],
  
  "host_permissions": [
    "https://www.googleapis.com/*",
    "https://api.openai.com/*"
  ],
  
  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content-script.js"],
      "css": ["ui/styles/content-overlay.css"],
      "run_at": "document_end"
    }
  ],
  
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "TaskMe",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  
  "commands": {
    "open-command-bar": {
      "suggested_key": {
        "default": "Ctrl+Shift+T",
        "mac": "Command+Shift+T"
      },
      "description": "Open TaskMe command bar"
    },
    "undo-last-event": {
      "suggested_key": {
        "default": "Ctrl+Z",
        "mac": "Command+Z"
      },
      "description": "Undo last created event"
    }
  },
  
  "web_accessible_resources": [
    {
      "resources": [
        "ui/command-bar.html",
        "ui/styles/*.css",
        "icons/*.png"
      ],
      "matches": ["<all_urls>"]
    }
  ],
  
  "options_ui": {
    "page": "ui/settings.html",
    "open_in_tab": true
  }
}
```

## 2. API Specifications

### 2.1 Google Calendar API Integration

#### 2.1.1 OAuth2 Configuration
```javascript
const GOOGLE_OAUTH_CONFIG = {
  client_id: "your-client-id.googleusercontent.com",
  redirect_uri: chrome.identity.getRedirectURL(),
  response_type: "code",
  scope: [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly"
  ].join(" "),
  access_type: "offline",
  prompt: "consent"
};
```

#### 2.1.2 Event Creation Payload
```typescript
interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string; // RFC3339 format
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence?: string[]; // RRULE format
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}
```

### 2.2 Natural Language Processing API

#### 2.2.1 OpenAI API Integration
```typescript
interface NLPRequest {
  model: "gpt-3.5-turbo" | "gpt-4";
  messages: Array<{
    role: "system" | "user";
    content: string;
  }>;
  functions: Array<{
    name: string;
    description: string;
    parameters: object;
  }>;
  function_call: "auto" | { name: string };
  temperature: number;
  max_tokens: number;
}

interface ParsedEvent {
  title: string;
  start_date: string; // YYYY-MM-DD
  start_time?: string; // HH:MM
  duration_minutes?: number;
  location?: string;
  description?: string;
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly";
    interval?: number;
    end_date?: string;
  };
  confidence: number; // 0-1
  extracted_entities: {
    dates: string[];
    times: string[];
    locations: string[];
    people: string[];
  };
}
```

#### 2.2.2 Function Calling Schema
```json
{
  "name": "parse_calendar_event",
  "description": "Extract calendar event details from natural language",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Event title or summary"
      },
      "start_date": {
        "type": "string",
        "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
        "description": "Start date in YYYY-MM-DD format"
      },
      "start_time": {
        "type": "string",
        "pattern": "^\\d{2}:\\d{2}$",
        "description": "Start time in HH:MM format (24-hour)"
      },
      "duration_minutes": {
        "type": "integer",
        "minimum": 15,
        "maximum": 1440,
        "description": "Event duration in minutes"
      },
      "location": {
        "type": "string",
        "description": "Event location or venue"
      },
      "description": {
        "type": "string",
        "description": "Additional event details or notes"
      },
      "confidence": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Confidence score for the parsing"
      }
    },
    "required": ["title", "start_date", "confidence"]
  }
}
```

## 3. Data Storage Schema

### 3.1 Chrome Storage Structure

#### 3.1.1 User Settings
```typescript
interface UserSettings {
  // General preferences
  defaultDuration: number; // minutes
  defaultCalendarId: string;
  timezone: string;
  
  // NLP configuration
  llmProvider: "openai" | "claude" | "local";
  llmApiKey?: string;
  llmModel: string;
  confidenceThreshold: number; // 0-1
  
  // UI preferences
  hotkey: string;
  theme: "light" | "dark" | "system";
  showPreviews: boolean;
  autoApproveHighConfidence: boolean;
  
  // Privacy settings
  dataRetentionDays: number;
  analyticsEnabled: boolean;
  cloudProcessingEnabled: boolean;
  
  // Calendar settings
  connectedAccounts: Array<{
    id: string;
    email: string;
    calendars: Array<{
      id: string;
      name: string;
      primary: boolean;
      selected: boolean;
    }>;
  }>;
}
```

#### 3.1.2 Temporary Data
```typescript
interface TemporaryData {
  pendingEvents: Array<{
    id: string;
    eventId: string;
    calendarId: string;
    originalText: string;
    parsedEvent: ParsedEvent;
    createdAt: number; // timestamp
    undoable: boolean;
  }>;
  
  recentInputs: Array<{
    text: string;
    timestamp: number;
    successful: boolean;
  }>;
  
  authTokens: {
    [accountId: string]: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };
  };
}
```

## 4. User Interface Components

### 4.1 Command Bar Component

#### 4.1.1 HTML Structure
```html
<div id="taskme-command-bar" class="taskme-overlay">
  <div class="taskme-input-container">
    <input 
      type="text" 
      id="taskme-input" 
      placeholder="Describe your event (e.g., 'Lunch with Sam tomorrow at noon')"
      autocomplete="off"
      spellcheck="false"
    />
    <div class="taskme-parsing-indicator">
      <span class="confidence-indicator"></span>
      <span class="parsing-status">Parsing...</span>
    </div>
  </div>
  
  <div class="taskme-preview" id="taskme-preview">
    <div class="preview-header">
      <span class="preview-title">Event Preview</span>
      <span class="confidence-score"></span>
    </div>
    <div class="preview-content">
      <div class="preview-field">
        <label>Title:</label>
        <span class="preview-value" data-field="title"></span>
      </div>
      <div class="preview-field">
        <label>Date & Time:</label>
        <span class="preview-value" data-field="datetime"></span>
      </div>
      <div class="preview-field">
        <label>Duration:</label>
        <span class="preview-value" data-field="duration"></span>
      </div>
      <div class="preview-field">
        <label>Location:</label>
        <span class="preview-value" data-field="location"></span>
      </div>
    </div>
    <div class="preview-actions">
      <button class="btn-create">Create Event</button>
      <button class="btn-edit">Edit Details</button>
      <button class="btn-cancel">Cancel</button>
    </div>
  </div>
  
  <div class="taskme-suggestions" id="taskme-suggestions">
    <!-- Dynamic suggestions will be inserted here -->
  </div>
</div>
```

#### 4.1.2 CSS Styling
```css
.taskme-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2147483647; /* Maximum z-index */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 400px;
  max-width: 600px;
  animation: taskme-slide-in 0.2s ease-out;
}

.taskme-input-container {
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
}

.taskme-input-container input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.taskme-input-container input:focus {
  border-color: #0969da;
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
}

@keyframes taskme-slide-in {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
```

### 4.2 Settings Page Layout

#### 4.2.1 Navigation Structure
```html
<div class="settings-container">
  <nav class="settings-nav">
    <ul>
      <li><a href="#general" class="nav-link active">General</a></li>
      <li><a href="#calendar" class="nav-link">Calendar</a></li>
      <li><a href="#language" class="nav-link">Language Processing</a></li>
      <li><a href="#privacy" class="nav-link">Privacy</a></li>
      <li><a href="#advanced" class="nav-link">Advanced</a></li>
    </ul>
  </nav>
  
  <main class="settings-content">
    <div id="general" class="settings-section active">
      <!-- General settings content -->
    </div>
    <div id="calendar" class="settings-section">
      <!-- Calendar settings content -->
    </div>
    <!-- Additional sections -->
  </main>
</div>
```

## 5. Message Passing Architecture

### 5.1 Communication Protocols

#### 5.1.1 Content Script ↔ Background Messages
```typescript
interface MessageProtocol {
  // Command bar operations
  OPEN_COMMAND_BAR: {
    type: "OPEN_COMMAND_BAR";
    payload: {
      selectedText?: string;
      pageUrl: string;
    };
  };
  
  PARSE_EVENT_TEXT: {
    type: "PARSE_EVENT_TEXT";
    payload: {
      text: string;
      context: {
        currentTime: string;
        timezone: string;
        pageContext?: string;
      };
    };
  };
  
  CREATE_CALENDAR_EVENT: {
    type: "CREATE_CALENDAR_EVENT";
    payload: {
      parsedEvent: ParsedEvent;
      calendarId: string;
    };
  };
  
  UNDO_LAST_EVENT: {
    type: "UNDO_LAST_EVENT";
    payload: {
      eventId: string;
    };
  };
}
```

#### 5.1.2 Response Format
```typescript
interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: number;
    requestId: string;
  };
}
```

### 5.2 Error Handling

#### 5.2.1 Error Categories
```typescript
enum ErrorCategory {
  AUTHENTICATION = "auth",
  API_QUOTA = "quota",
  NETWORK = "network",
  PARSING = "parsing",
  VALIDATION = "validation",
  PERMISSION = "permission",
  UNKNOWN = "unknown"
}

interface TaskMeError {
  category: ErrorCategory;
  code: string;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryAfter?: number;
  helpUrl?: string;
}
```

## 6. Performance Specifications

### 6.1 Response Time Requirements

| Operation | Target Time | Maximum Time |
|-----------|-------------|--------------|
| Command bar open | < 200ms | < 500ms |
| Text parsing (LLM) | < 2s | < 5s |
| Event creation | < 1s | < 3s |
| Settings save | < 100ms | < 500ms |
| Undo operation | < 500ms | < 1s |

### 6.2 Resource Usage Limits

| Resource | Target | Maximum |
|----------|--------|---------|
| Memory usage | < 50MB | < 100MB |
| CPU usage (idle) | < 1% | < 5% |
| Network requests/min | < 20 | < 50 |
| Local storage | < 10MB | < 25MB |

### 6.3 Optimization Strategies

#### 6.3.1 Lazy Loading
- Load UI components only when needed
- Defer non-critical script loading
- Progressive enhancement for advanced features

#### 6.3.2 Caching
- Cache parsed results for similar inputs
- Store calendar metadata locally
- Implement intelligent cache invalidation

#### 6.3.3 Request Optimization
- Batch API requests where possible
- Use compression for large payloads
- Implement request deduplication

## 7. Security Implementation Details

### 7.1 Token Security

#### 7.1.1 Storage Encryption
```javascript
// Encrypt sensitive data before storage
async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(JSON.stringify(data))
  );
  
  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedData))
  };
}
```

#### 7.1.2 Secure Key Management
```javascript
// Generate encryption key from browser's crypto API
async function generateEncryptionKey() {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false, // non-extractable
    ["encrypt", "decrypt"]
  );
}
```

### 7.2 Content Security Policy

```javascript
// Implement strict CSP for extension pages
const CSP_POLICY = {
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-eval'", // Minimal unsafe-eval for JSON parsing
  "style-src": "'self' 'unsafe-inline'",
  "connect-src": "'self' https://www.googleapis.com https://api.openai.com",
  "img-src": "'self' data: https:",
  "font-src": "'self'",
  "object-src": "'none'",
  "base-uri": "'none'"
};
```

## 8. Testing Specifications

### 8.1 Unit Test Requirements

#### 8.1.1 Core Functions Coverage
- Date/time parsing: 95% coverage
- Event validation: 100% coverage
- API client methods: 90% coverage
- Settings management: 95% coverage

#### 8.1.2 Test Data Sets
```javascript
const TEST_INPUTS = [
  // Basic formats
  "Meeting tomorrow at 2pm",
  "Lunch with John next Friday at noon for 2 hours",
  "Doctor appointment on Dec 15th at 3:30pm",
  
  // Complex formats
  "Weekly standup every Monday at 9am starting next week",
  "Conference call with NYC team on 2024-01-15 from 10:00 to 11:30",
  "Dinner reservation at Giuseppe's on Saturday 7pm for 4 people",
  
  // Edge cases
  "Meeting in 5 minutes",
  "All day event tomorrow",
  "Birthday party next Saturday evening",
  "Call mom sometime this weekend"
];
```

### 8.2 Integration Test Scenarios

#### 8.2.1 End-to-End Workflows
1. **Basic Event Creation**
   - Open command bar with hotkey
   - Type event description
   - Verify parsing results
   - Confirm event creation
   - Check calendar for new event

2. **Context Menu Integration**
   - Select text on webpage
   - Right-click and select "Add to Calendar"
   - Verify text extraction
   - Complete event creation flow

3. **Undo Functionality**
   - Create an event
   - Click undo within time window
   - Verify event removal from calendar

### 8.3 Performance Test Cases

#### 8.3.1 Load Testing
```javascript
// Test concurrent request handling
async function testConcurrentRequests() {
  const promises = Array.from({ length: 10 }, (_, i) => 
    parseEventText(`Meeting ${i} tomorrow at ${10 + i}am`)
  );
  
  const results = await Promise.all(promises);
  
  // Verify all requests completed successfully
  expect(results.every(r => r.success)).toBe(true);
}
```

#### 8.3.2 Memory Leak Testing
```javascript
// Test for memory leaks in command bar operations
async function testMemoryLeaks() {
  const initialMemory = performance.memory.usedJSHeapSize;
  
  // Perform 100 command bar open/close cycles
  for (let i = 0; i < 100; i++) {
    await openCommandBar();
    await closeCommandBar();
  }
  
  // Force garbage collection and check memory usage
  if (window.gc) window.gc();
  
  const finalMemory = performance.memory.usedJSHeapSize;
  const memoryIncrease = finalMemory - initialMemory;
  
  // Memory increase should be minimal
  expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 5MB threshold
}
```

## 9. Deployment and Distribution

### 9.1 Build Process

#### 9.1.1 Build Script Configuration
```json
{
  "scripts": {
    "build": "webpack --mode=production",
    "build:dev": "webpack --mode=development",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.{js,ts}",
    "package": "npm run build && web-ext build",
    "sign": "web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET"
  }
}
```

#### 9.1.2 Webpack Configuration
```javascript
module.exports = {
  entry: {
    'background/service-worker': './src/background/service-worker.js',
    'content/content-script': './src/content/content-script.js',
    'popup/popup': './src/popup/popup.js',
    'ui/settings': './src/ui/settings.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        mangle: false // Preserve function names for debugging
      }
    })]
  }
};
```

### 9.2 Firefox Add-ons Store Requirements

#### 9.2.1 Listing Information
- **Name**: TaskMe - Natural Language Calendar
- **Summary**: Create Google Calendar events instantly using natural language
- **Category**: Productivity
- **Tags**: calendar, productivity, natural-language, automation, google-calendar

#### 9.2.2 Privacy Policy Requirements
- Clear explanation of data collection and usage
- Third-party service disclosure (Google, OpenAI)
- User control and opt-out mechanisms
- Data retention and deletion policies

### 9.3 Update Mechanism

#### 9.3.1 Version Management
```javascript
// Semantic versioning strategy
const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9]+))?$/;

// Migration handling for settings updates
async function handleSettingsMigration(oldVersion, newVersion) {
  const migrations = {
    '1.0.0': migrateFromBeta,
    '1.1.0': addNewSettings,
    '2.0.0': majorStructureUpdate
  };
  
  // Apply migrations sequentially
  for (const [version, migration] of Object.entries(migrations)) {
    if (semver.gt(version, oldVersion) && semver.lte(version, newVersion)) {
      await migration();
    }
  }
}
```

## 10. Monitoring and Analytics

### 10.1 Error Tracking

#### 10.1.1 Error Reporting Structure
```typescript
interface ErrorReport {
  timestamp: number;
  version: string;
  userAgent: string;
  error: {
    name: string;
    message: string;
    stack: string;
    category: ErrorCategory;
  };
  context: {
    action: string;
    userInput?: string; // Sanitized
    settings: Partial<UserSettings>; // Non-sensitive only
  };
  userId: string; // Anonymous hash
}
```

### 10.2 Usage Analytics (Optional)

#### 10.2.1 Privacy-Compliant Metrics
```typescript
interface UsageMetrics {
  // Feature usage counts
  commandBarOpens: number;
  eventsCreated: number;
  contextMenuUsage: number;
  undoOperations: number;
  
  // Performance metrics
  averageParsingTime: number;
  averageEventCreationTime: number;
  
  // Error rates
  parsingErrors: number;
  apiErrors: number;
  
  // User preferences (aggregated)
  popularSettings: Record<string, number>;
  
  // No personally identifiable information
  // No actual event content or user data
}
```

This technical specification document provides the detailed implementation guidelines needed to build the TaskMe Firefox extension according to the design requirements.