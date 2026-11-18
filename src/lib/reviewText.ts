/**
 * Guards against the most common review-form mistake.
 *
 * Customers routinely type their whole review into the name field. The old form
 * made that unrecoverable: the submit button stayed disabled because the review
 * box was empty, so the customer was stuck staring at a form that looked
 * broken with no explanation.
 *
 * These helpers detect the mix-up and move the text to the field it belongs in,
 * so a mistyped review still gets published instead of silently discarded.
 */

export const MAX_REVIEW_NAME_LENGTH = 60;
export const MAX_REVIEW_TEXT_LENGTH = 2000;

const REVIEW_MIN_WORDS = 6;
const REVIEW_MIN_CHARS = 32;

/**
 * Heuristic: does this value read like review prose rather than a person's name?
 *
 * Deliberately conservative. A false positive only costs the reviewer their
 * display name, whereas a false negative costs them the whole review, so the
 * bar is set high: several words, a plausible sentence length, or something
 * that cannot be a name at all.
 */
export const looksLikeReviewText = (value: string): boolean => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Longer than the name field allows, so it was never going to be a name.
  if (trimmed.length > MAX_REVIEW_NAME_LENGTH) return true;

  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length >= REVIEW_MIN_WORDS && trimmed.length >= REVIEW_MIN_CHARS) return true;

  // Sentence-like: real names do not normally carry terminal punctuation.
  if (trimmed.length >= REVIEW_MIN_CHARS && /[.!?]/.test(trimmed)) return true;

  return false;
};

export interface ReviewSplitResult {
  name: string;
  text: string;
  /** True when review prose was found in the name field and was relocated. */
  migrated: boolean;
}

/**
 * Splits the submitted form fields into a display name and a review body,
 * relocating review prose that was typed into the name box.
 */
export const splitMisplacedReview = (rawName: string, rawText: string): ReviewSplitResult => {
  const name = rawName.trim();
  const text = rawText.trim();

  if (!looksLikeReviewText(name)) {
    return {
      name: name.slice(0, MAX_REVIEW_NAME_LENGTH),
      text: text.slice(0, MAX_REVIEW_TEXT_LENGTH),
      migrated: false,
    };
  }

  // The review landed in the name field. Move it across rather than lose it.
  if (text.length === 0) {
    return {
      name: 'Anonymous',
      text: name.slice(0, MAX_REVIEW_TEXT_LENGTH),
      migrated: true,
    };
  }

  // Prose in the name box and prose in the review box: keep both, in reading
  // order, and publish without a display name.
  return {
    name: 'Anonymous',
    text: `${name} ${text}`.slice(0, MAX_REVIEW_TEXT_LENGTH),
    migrated: true,
  };
};
