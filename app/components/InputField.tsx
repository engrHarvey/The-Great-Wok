'use client'; // Mark this component as a Client Component

import React from 'react';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, type, name, value, onChange }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-bold mb-2 text-primary">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
      />
    </div>
  );
};

export default InputField;
