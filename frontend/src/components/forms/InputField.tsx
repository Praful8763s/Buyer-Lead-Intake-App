import React, { forwardRef } from 'react'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  required?: boolean
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, required, className, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          className={`input-field ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className || ''}`}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
      </div>
    )
  }
)

InputField.displayName = 'InputField'

export default InputField