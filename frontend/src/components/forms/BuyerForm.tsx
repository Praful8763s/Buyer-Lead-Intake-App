'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buyerSchema, BuyerFormData } from '@/lib/validation'
import InputField from './InputField'

interface BuyerFormProps {
  initialData?: Partial<BuyerFormData>
  onSubmit: (data: BuyerFormData) => void
  isLoading?: boolean
}

export default function BuyerForm({ initialData, onSubmit, isLoading }: BuyerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: initialData,
  })

  const propertyType = watch('property_type')
  const showBHK = propertyType === 'apartment' || propertyType === 'villa'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Full Name"
          {...register('full_name')}
          error={errors.full_name?.message}
          required
        />
        
        <InputField
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          required
        />
        
        <InputField
          label="Phone"
          {...register('phone')}
          error={errors.phone?.message}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <select
            {...register('city')}
            className="input-field"
          >
            <option value="">Select City</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
            <option value="pune">Pune</option>
            <option value="hyderabad">Hyderabad</option>
          </select>
          {errors.city && <p className="form-error">{errors.city.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('property_type')}
            className="input-field"
          >
            <option value="">Select Property Type</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
          {errors.property_type && <p className="form-error">{errors.property_type.message}</p>}
        </div>
        
        {showBHK && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BHK <span className="text-red-500">*</span>
            </label>
            <select
              {...register('bhk')}
              className="input-field"
            >
              <option value="">Select BHK</option>
              <option value="1bhk">1 BHK</option>
              <option value="2bhk">2 BHK</option>
              <option value="3bhk">3 BHK</option>
              <option value="4bhk">4 BHK</option>
              <option value="5bhk">5+ BHK</option>
            </select>
            {errors.bhk && <p className="form-error">{errors.bhk.message}</p>}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose <span className="text-red-500">*</span>
          </label>
          <select
            {...register('purpose')}
            className="input-field"
          >
            <option value="">Select Purpose</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
            <option value="investment">Investment</option>
          </select>
          {errors.purpose && <p className="form-error">{errors.purpose.message}</p>}
        </div>
        
        <InputField
          label="Budget Min"
          type="number"
          {...register('budget_min', { valueAsNumber: true })}
          error={errors.budget_min?.message}
          required
        />
        
        <InputField
          label="Budget Max"
          type="number"
          {...register('budget_max', { valueAsNumber: true })}
          error={errors.budget_max?.message}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeline <span className="text-red-500">*</span>
          </label>
          <select
            {...register('timeline')}
            className="input-field"
          >
            <option value="">Select Timeline</option>
            <option value="immediate">Immediate</option>
            <option value="1month">Within 1 Month</option>
            <option value="3months">Within 3 Months</option>
            <option value="6months">Within 6 Months</option>
            <option value="1year">Within 1 Year</option>
          </select>
          {errors.timeline && <p className="form-error">{errors.timeline.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source <span className="text-red-500">*</span>
          </label>
          <select
            {...register('source')}
            className="input-field"
          >
            <option value="">Select Source</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social_media">Social Media</option>
            <option value="advertisement">Advertisement</option>
            <option value="walk_in">Walk In</option>
          </select>
          {errors.source && <p className="form-error">{errors.source.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            {...register('status')}
            className="input-field"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          {errors.status && <p className="form-error">{errors.status.message}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="input-field"
          placeholder="Additional notes about the buyer..."
        />
        {errors.notes && <p className="form-error">{errors.notes.message}</p>}
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Lead'}
        </button>
      </div>
    </form>
  )
}