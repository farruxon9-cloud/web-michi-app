// Small a11y helpers — add keyboard/semantic support to clickable non-button
// elements without changing their look (no new classes or styles).

/**
 * Props for a clickable <div> that should behave like a button:
 * role="button", focusable, Enter/Space activation.
 * Accessible name comes from the element's text unless `label` is given.
 */
export function pressable(onActivate, label) {
  const props = {
    role: 'button',
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        onActivate?.(e);
      }
    },
  };
  if (label) props['aria-label'] = label;
  return props;
}

/** Props for a tab button inside a role="tablist" container. */
export function tabProps(selected) {
  return { role: 'tab', 'aria-selected': Boolean(selected) };
}
