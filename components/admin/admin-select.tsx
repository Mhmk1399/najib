"use client";

export type AdminSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function AdminSelect({
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled}
      aria-invalid={invalid || undefined}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option
          value={option.value}
          disabled={option.disabled}
          key={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
