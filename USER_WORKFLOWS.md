# TaskMe - User Workflows and Interaction Diagrams

## 1. Core User Workflows

### 1.1 Primary Event Creation Flow

```
User Action: Press Hotkey (Ctrl+Shift+T)
    ↓
Extension: Display Command Bar Overlay
    ↓
User Action: Type Event Description ("Lunch with Sam tomorrow at noon")
    ↓
Extension: Real-time Parsing with LLM
    ↓
Extension: Display Parsed Event Preview
    ↓
Decision: Confidence Level Check
    ├─ High Confidence (>0.8)
    │   ├─ Auto-approve setting enabled?
    │   │   ├─ Yes → Create Event Immediately
    │   │   └─ No → Show Quick Confirm Button
    │   └─ User clicks "Create" → Create Event
    └─ Low Confidence (<0.8)
        └─ Show Detailed Preview with Edit Options
            ↓
        User Action: Review and Edit Details
            ↓
        User Action: Click "Create Event"
            ↓
        Extension: Create Calendar Event via API
            ↓
        Extension: Show Success Notification with Undo Option
            ↓
        Optional: User clicks "Undo" → Delete Event
```

### 1.2 Context Menu Workflow

```
User Action: Select Text on Webpage
    ↓
User Action: Right-click → "Add to Calendar"
    ↓
Extension: Extract and Pre-process Selected Text
    ↓
Extension: Open Command Bar with Pre-filled Text
    ↓
Extension: Auto-start Parsing Process
    ↓
[Continue with Primary Event Creation Flow]
```

### 1.3 Initial Setup Workflow

```
Installation: User installs extension from Firefox Add-ons
    ↓
First Launch: Extension opens welcome/setup page
    ↓
Step 1: Google Account Authentication
    ├─ User clicks "Connect Google Calendar"
    ├─ Redirect to Google OAuth consent page
    ├─ User grants calendar permissions
    └─ Extension receives and stores auth tokens
    ↓
Step 2: Calendar Selection
    ├─ Extension fetches user's calendars
    ├─ User selects default calendar
    └─ User configures default event duration
    ↓
Step 3: LLM Configuration
    ├─ User chooses LLM provider (OpenAI/Claude/Local)
    ├─ User enters API key (if required)
    └─ Extension validates API access
    ↓
Step 4: Preferences Setup
    ├─ Hotkey configuration
    ├─ Privacy settings
    └─ Feature preferences
    ↓
Completion: Extension ready for use
```

## 2. Detailed Interaction Diagrams

### 2.1 Command Bar Interaction States

```
State: Hidden
    ↓ [Hotkey pressed]
State: Opening (Animation)
    ↓ [Animation complete]
State: Ready for Input
    ├─ [User types] → State: Typing
    ├─ [Escape pressed] → State: Closing
    └─ [Click outside] → State: Closing

State: Typing
    ├─ [Text changed] → Trigger: Real-time Parsing
    ├─ [Enter pressed] → State: Processing
    ├─ [Escape pressed] → State: Closing
    └─ [Tab pressed] → State: Preview Mode

State: Processing
    ├─ [Parsing complete, high confidence] → State: Quick Confirm
    ├─ [Parsing complete, low confidence] → State: Detailed Preview
    └─ [Parsing failed] → State: Error Display

State: Quick Confirm
    ├─ [Enter pressed] → Action: Create Event
    ├─ [Tab pressed] → State: Detailed Preview
    └─ [Escape pressed] → State: Ready for Input

State: Detailed Preview
    ├─ [Create button clicked] → Action: Create Event
    ├─ [Edit field] → State: Editing
    └─ [Cancel button] → State: Ready for Input

State: Editing
    ├─ [Save changes] → State: Detailed Preview
    └─ [Cancel] → State: Detailed Preview

Action: Create Event
    ↓
State: Creating (Loading)
    ├─ [Success] → State: Success Notification
    └─ [Error] → State: Error Display

State: Success Notification
    ├─ [Undo clicked] → Action: Delete Event
    ├─ [Timeout] → State: Closing
    └─ [Create another] → State: Ready for Input

State: Error Display
    ├─ [Retry button] → State: Processing
    ├─ [Edit button] → State: Detailed Preview
    └─ [Cancel] → State: Ready for Input

State: Closing (Animation)
    ↓ [Animation complete]
State: Hidden
```

### 2.2 Settings Page Navigation Flow

```
Entry Points:
├─ Extension icon → Popup → "Settings" link
├─ Extension toolbar menu → "Options"
└─ Right-click extension icon → "Options"
    ↓
Settings Page Opens
    ↓
Navigation Tabs:
├─ General
│   ├─ Default duration settings
│   ├─ Timezone configuration
│   ├─ Hotkey customization
│   └─ Theme preferences
├─ Calendar
│   ├─ Connected accounts management
│   ├─ Calendar selection
│   ├─ Event privacy settings
│   └─ Default reminders
├─ Language Processing
│   ├─ LLM provider selection
│   ├─ API configuration
│   ├─ Confidence thresholds
│   └─ Custom vocabulary
├─ Privacy
│   ├─ Data retention settings
│   ├─ Analytics preferences
│   ├─ Cloud processing options
│   └─ Data export/deletion
└─ Advanced
    ├─ Debug options
    ├─ Beta features
    ├─ Backup/restore settings
    └─ Reset to defaults

Save Flow:
User modifies setting → Auto-save on change → Show success indicator
                     → Validate setting → Show error if invalid
```

## 3. Error Handling Workflows

### 3.1 Authentication Error Flow

```
Trigger: API call fails with auth error
    ↓
Extension: Detect token expiration/invalidity
    ↓
Extension: Attempt token refresh
    ├─ Refresh successful → Retry original request
    └─ Refresh failed
        ↓
    Extension: Show re-authentication prompt
        ↓
    User Action: Click "Re-authenticate"
        ↓
    Extension: Open Google OAuth flow
        ├─ User grants permission → Store new tokens → Retry request
        └─ User cancels → Show manual setup instructions
```

### 3.2 Parsing Error Flow

```
Trigger: LLM API call fails or returns invalid data
    ↓
Extension: Check error type
    ├─ Rate limit exceeded
    │   └─ Show "Too many requests" message with retry timer
    ├─ API key invalid
    │   └─ Show settings link to update API configuration
    ├─ Network error
    │   ├─ Show offline fallback options
    │   └─ Offer retry button
    └─ Parsing confidence too low
        ├─ Show manual entry form
        └─ Provide parsing tips and examples
```

### 3.3 Calendar Creation Error Flow

```
Trigger: Google Calendar API returns error
    ↓
Extension: Identify error type
    ├─ Calendar not found
    │   └─ Show calendar selection dialog
    ├─ Permission denied
    │   └─ Show re-authentication flow
    ├─ Quota exceeded
    │   └─ Show quota information and retry later
    ├─ Event conflict
    │   ├─ Show conflict details
    │   └─ Offer to create anyway or suggest alternatives
    └─ Network/server error
        ├─ Offer to save event draft for later
        └─ Provide retry options
```

## 4. Accessibility Workflows

### 4.1 Keyboard Navigation

```
Command Bar Keyboard Flow:
Tab Order: Input field → Preview fields → Action buttons → Cancel
    ↓
Arrow Keys: Navigate between preview fields
    ↓
Enter: Activate focused button/confirm current action
    ↓
Escape: Close command bar or cancel current operation
    ↓
Ctrl+Z: Undo last action (when notification visible)

Settings Page Keyboard Flow:
Tab Order: Navigation menu → Content areas → Form fields → Buttons
    ↓
Arrow Keys: Navigate between menu items
    ↓
Enter/Space: Select menu item or activate button
    ↓
Tab: Move through form fields in logical order
```

### 4.2 Screen Reader Support

```
Command Bar Screen Reader Flow:
1. Hotkey pressed → Announce: "TaskMe command bar opened"
2. Focus on input → Announce: "Type event description, autocomplete available"
3. Parsing starts → Announce: "Processing event details..."
4. Preview shown → Announce: "Event preview available, [event details]"
5. Navigation → Announce current field and value
6. Event created → Announce: "Event created successfully, undo available for 30 seconds"

Error Announcements:
- "Error: Unable to parse event details, please try different wording"
- "Error: Failed to create calendar event, check your connection"
- "Authentication required, press Enter to sign in to Google Calendar"
```

## 5. Performance Optimization Workflows

### 5.1 Lazy Loading Flow

```
Extension Startup:
Load only essential components → Register hotkey and context menu
    ↓
First Command Bar Open:
Load command bar UI → Load parsing utilities → Initialize LLM client
    ↓
First Settings Access:
Load settings page → Load calendar API client → Fetch user preferences
    ↓
Feature Usage:
Load components only when needed → Cache frequently used components
```

### 5.2 Caching Strategy Flow

```
Parsing Cache:
User input → Check cache for similar inputs → Cache hit?
    ├─ Yes: Return cached result with confidence adjustment
    └─ No: Process with LLM → Cache result → Return to user

Calendar Cache:
Calendar operation → Check local cache → Cache valid?
    ├─ Yes: Use cached data
    └─ No: Fetch from API → Update cache → Return fresh data

Cache Invalidation:
├─ Time-based: Expire cache entries after TTL
├─ Event-based: Clear related cache on user actions
└─ Manual: Provide cache clear option in advanced settings
```

## 6. Multi-Platform Considerations

### 6.1 Cross-Platform Hotkey Handling

```
Hotkey Registration Flow:
Extension startup → Detect operating system
    ├─ Windows/Linux: Register Ctrl+Shift+T
    ├─ macOS: Register Cmd+Shift+T
    └─ Custom: Use user-defined hotkey from settings
        ↓
Hotkey pressed → Validate context (not in input field)
    ├─ Valid context: Open command bar
    └─ Invalid context: Ignore or show brief indicator
```

### 6.2 Timezone Handling Workflow

```
Event Creation with Timezone:
User input parsing → Extract date/time
    ↓
Determine timezone context:
    ├─ Explicit in input ("3pm PST") → Use specified timezone
    ├─ Location mentioned → Attempt timezone lookup
    └─ No context → Use user's default timezone
        ↓
Create event with proper timezone information
    ↓
Display confirmation in user's local timezone
```

## 7. Privacy and Security Workflows

### 7.1 Data Minimization Flow

```
User Input Processing:
Capture user input → Apply data minimization
    ├─ Remove unnecessary personal details
    ├─ Sanitize before sending to LLM
    └─ Log only essential debugging info
        ↓
LLM Processing: Send minimal necessary context
        ↓
Store Results: Cache only parsing results, not personal details
        ↓
Auto-cleanup: Regular cleanup of temporary data
```

### 7.2 Consent Management Flow

```
First Use:
Display privacy notice → Explain data usage
    ├─ User accepts: Enable all features
    ├─ User customizes: Show granular consent options
    │   ├─ Cloud processing: Yes/No
    │   ├─ Usage analytics: Yes/No
    │   └─ Error reporting: Yes/No
    └─ User declines: Enable offline-only mode
        ↓
Ongoing: Respect user choices → Provide easy opt-out options
```

## 8. Testing Workflows

### 8.1 User Acceptance Testing Flow

```
Test Scenario Execution:
1. New User Setup
   → Install extension → Complete setup wizard → Create first event
2. Daily Usage Patterns
   → Multiple event creation → Context menu usage → Settings adjustment
3. Error Recovery
   → Simulate network issues → Test authentication flow → Verify error messages
4. Accessibility Testing
   → Keyboard-only navigation → Screen reader compatibility → High contrast mode

Success Criteria:
├─ Task completion rate > 90%
├─ Error recovery rate > 95%
├─ User satisfaction score > 4.0/5.0
└─ Accessibility compliance: WCAG 2.1 AA
```

### 8.2 Performance Testing Workflow

```
Performance Benchmark Tests:
1. Command Bar Response Time
   → Measure hotkey to display time → Target: <200ms
2. Parsing Performance
   → Various input complexity → Target: <3s for 95th percentile
3. Memory Usage
   → Extended usage patterns → Target: <50MB steady state
4. Network Efficiency
   → API call optimization → Minimize requests and payload size

Monitoring:
├─ Real-user monitoring data collection
├─ Performance regression detection
└─ Automated performance testing in CI/CD
```

This workflow document provides comprehensive visual and procedural guidance for understanding how users will interact with the TaskMe extension and how the system should respond to various scenarios and edge cases.