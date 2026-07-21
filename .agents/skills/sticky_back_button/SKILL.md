---
name: sticky-back-button
description: Pinned sticky back button navigation wizard pattern for forms and dashboards
---

# Sticky Pinned Back Button Navigation Wizard Pattern

This skill documents how to implement a user-friendly wizard navigation pattern with a **pinned (sticky) back button** and a **step-by-step history back flow** in React.

## 1. UI Layout (Only Back Button is Sticky)

When designing long wizard forms, the title should scroll out of view while the back button remains pinned at the top-left of the viewport. This is achieved using a container with `position: sticky` and negative margin to prevent pushing adjacent elements down.

### Example React Component Structure

```jsx
return (
  <div className="feed-container" style={{ position: 'relative' }}>
    {/* Pinned Sticky Back Button */}
    <div style={{ 
      position: 'sticky', 
      top: '12px', 
      left: '16px', 
      zIndex: 120, 
      width: 'fit-content',
      marginBottom: '-40px', // Negative margin to avoid pushing the header title container
      pointerEvents: 'none'  // Let mouse clicks fall through empty space
    }}>
      <button 
        className="icon-btn glass" 
        onClick={handleFormBack}
        style={{ 
          pointerEvents: 'auto', // Re-enable pointer events for the button itself
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)'
        }}
      >
        <ArrowLeft size={20} />
      </button>
    </div>

    {/* Header Title (Non-sticky, scrolls with the page) */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 20px 72px' }}>
      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
        {t('addNewJob', "New Job Posting")}
      </h2>
    </div>

    {/* Form Fields Container */}
    <div style={{ padding: '0 16px' }}>
      {/* ... Form inputs ... */}
    </div>
  </div>
);
```

## 2. Step-by-Step Back Navigation Logic

When clicking the Back button, the user should be taken to the previous logical wizard step, not kicked out entirely to the dashboard/home screen.

### Example State Transition Handler

```javascript
const handleFormBack = () => {
  if (showAddForm) {
    setShowAddForm(false);
    setErrors({});
    setJobImage(null);
    
    // If editing an existing item, close directly
    if (itemToEdit) {
      setItemToEdit(null);
      return;
    }
    
    // Navigate back to the previous screen (e.g., Select Ad Type)
    if (selectedAdType === 'school') {
      setShowAdTypeSelect(true);
    } else {
      setShowJobTypeSelect(true);
    }
  } else if (showJobTypeSelect) {
    setShowJobTypeSelect(false);
    if (userProfile?.companyType === 'driving_school') {
      setShowAdTypeSelect(true);
    }
  } else if (showAdTypeSelect) {
    setShowAdTypeSelect(false);
  }
};
```
