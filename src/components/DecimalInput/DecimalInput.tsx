import { useEffect, useState, type MouseEventHandler } from 'react';
import { formatDecimalInput, parseDecimalInput } from '../../utils/decimalNumber';

type DecimalInputProps = {
  className?: string;
  dataTour?: string;
  value: number | undefined;
  onCommit: (value: number | undefined) => void;
  onClick?: MouseEventHandler<HTMLInputElement>;
};

export function DecimalInput({ className, dataTour, value, onCommit, onClick }: DecimalInputProps) {
  const [draft, setDraft] = useState(formatDecimalInput(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(formatDecimalInput(value));
    }
  }, [isFocused, value]);

  const commit = () => {
    const parsed = parseDecimalInput(draft);
    if (parsed === undefined) {
      setDraft(formatDecimalInput(value));
      return;
    }

    onCommit(parsed);
    setDraft(formatDecimalInput(parsed));
  };

  return (
    <input
      className={className}
      data-tour={dataTour}
      inputMode="decimal"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        commit();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') {
          setDraft(formatDecimalInput(value));
          event.currentTarget.blur();
        }
      }}
      onClick={onClick}
    />
  );
}
