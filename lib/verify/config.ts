/**
 * Dwell prompt: when a trained-but-unrecognised item sits on the mat for this
 * long while its line is still open, the "What happened?" sheet opens by
 * itself. The current design frames don't show it, so it ships off (0) to
 * keep the demo deterministic.
 */
export const DWELL_PROMPT_MS = 0;

/**
 * Status notifications behave like toasts: they slide in from the top right
 * and dismiss themselves after this long unless superseded or undone first.
 */
export const NOTIFICATION_DISMISS_MS = 5000;

/**
 * The amber "Put all N down together" guidance (toast + count frame) only
 * appears once a partial multi-quantity line has lingered this long. A packer
 * placing the units in quick succession never sees it flash.
 */
export const PARTIAL_PROMPT_DWELL_MS = 1500;
