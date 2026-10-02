import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent } from 'react';
import { cn } from '@/lib/utils';

interface NumberFieldProps {
  /** Current numeric value held by the parent. */
  value: number;
  /** Receives a clamped number on every edit, and the fallback on blur when cleared. */
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /**
   * Value applied on blur when the field is left empty or invalid.
   * Pass `0` for a genuinely optional field so clearing sticks as 0.
   */
  emptyFallback?: number;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
  disabled?: boolean;
}

/**
 * Number input that can always be fully cleared.
 *
 * A plain `value={n} onChange={e => set(Number(e.target.value))}` input turns
 * an emptied field into `0`/`1` immediately, so the user cannot remove the last
 * digit and the value looks permanent. This keeps the raw text in local state
 * while the field has focus, so blank stays blank; the parent still receives a
 * real number, and the fallback is only applied on blur.
 */
const NumberField = ({
  value,
  onChange,
  min,
  max,
  step,
  emptyFallback = 0,
  className,
  inputClassName,
  placeholder,
  id,
  disabled,
  ...rest
}: NumberFieldProps) => {
  const [text, setText] = useState(() => (value === 0 ? '' : String(value)));
  const isFocused = useRef(false);

  // Keep in step with external resets, but never stomp on what the user is typing.
  useEffect(() => {
    if (isFocused.current) return;
    setText(value === 0 ? '' : String(value));
  }, [value]);

  const clamp = (n: number) => {
    let out = n;
    if (typeof min === 'number' && out < min) out = min;
    if (typeof max === 'number' && out > max) out = max;
    return out;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setText(raw);

    if (raw.trim() === '') {
      // Report a neutral value immediately so dependent state stays valid, but
      // the field itself remains empty because the text lives in local state.
      onChange(0);
      return;
    }

    const parsed = Number(raw);
    if (Number.isFinite(parsed)) onChange(clamp(parsed));
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    isFocused.current = false;
    const raw = event.target.value;
    const parsed = Number(raw);

    if (raw.trim() === '' || !Number.isFinite(parsed)) {
      const fallback = clamp(emptyFallback);
      setText(fallback === 0 ? '' : String(fallback));
      onChange(fallback);
      return;
    }

    const clamped = clamp(parsed);
    setText(String(clamped));
    onChange(clamped);
  };

  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      value={text}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(inputClassName ?? className)}
      {...rest}
    />
  );
};

export default NumberField;
