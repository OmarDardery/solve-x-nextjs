import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../context/AuthContext'
import { dummyDataService } from '../../services/dummyDataService'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { validateDriveLink, formatDriveLink } from '../../utils/validateDriveLink'
import toast from 'react-hot-toast'

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  skills: z.string().min(1, 'Skills are required'),
  timeline: z.string().min(1, 'Timeline is required'),
  positions: z.string().min(1, 'Number of positions is required'),
  published: z.boolean().optional(),
  cvLink: z.string().optional().refine((val) => !val || validateDriveLink(val), {
    message: 'Must be a valid Google Drive link',
  }),
  proposalLink: z.string().optional().refine((val) => !val || validateDriveLink(val), {
    message: 'Must be a valid Google Drive link',
  }),
  datasetLink: z.string().optional().refine((val) => !val || validateDriveLink(val), {
    message: 'Must be a valid Google Drive link',
  }),
})

export function ProjectForm({ onSuccess, onCancel }) {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      published: false,
    },
  })

  const isPublished = watch('published')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Parse skills from comma-separated string
      const skills = data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      
      // Format Drive links
      const projectData = {
        title: data.title,
        description: data.description,
        skills,
        timeline: data.timeline,
        positions: parseInt(data.positions, 10),
        cvLink: data.cvLink ? formatDriveLink(data.cvLink) : null,
        proposalLink: data.proposalLink ? formatDriveLink(data.proposalLink) : null,
        datasetLink: data.datasetLink ? formatDriveLink(data.datasetLink) : null,
        createdBy: currentUser.uid,
        published: data.published || false,
      }

      dummyDataService.createProject(projectData)
      toast.success(isPublished ? 'Opportunity published successfully!' : 'Opportunity created successfully!')
      onSuccess?.()
    } catch (error) {
      toast.error(error.message || 'Failed to create opportunity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="space-y-4">
        <Input
          label="Project Title"
          placeholder="e.g., Machine Learning Research Project"
          {...register('title')}
          error={errors.title?.message}
        />
        
        <Textarea
          label="Description"
          placeholder="Describe the project, objectives, and expected outcomes..."
          rows={5}
          {...register('description')}
          error={errors.description?.message}
        />
        
        <Input
          label="Required Skills (comma-separated)"
          placeholder="e.g., Python, Machine Learning, Data Analysis"
          {...register('skills')}
          error={errors.skills?.message}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Timeline"
            placeholder="e.g., 6 months, Spring 2024, etc."
            {...register('timeline')}
            error={errors.timeline?.message}
          />
          
          <Input
            type="number"
            label="Number of Positions"
            placeholder="1"
            min="1"
            {...register('positions')}
            error={errors.positions?.message}
          />
        </div>
        
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-heading">Optional Links (Google Drive)</h3>
          
          <Input
            label="CV Template Link"
            placeholder="https://drive.google.com/..."
            {...register('cvLink')}
            error={errors.cvLink?.message}
          />
          
          <Input
            label="Proposal Template Link"
            placeholder="https://drive.google.com/..."
            {...register('proposalLink')}
            error={errors.proposalLink?.message}
          />
          
          <Input
            label="Dataset Link"
            placeholder="https://drive.google.com/..."
            {...register('datasetLink')}
            error={errors.datasetLink?.message}
          />
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="published"
            {...register('published')}
            className="w-4 h-4 text-brand border-default rounded focus:ring-brand"
          />
          <label htmlFor="published" className="text-sm text-body cursor-pointer">
            Publish immediately (make visible to students)
          </label>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-default mt-6">
        <Button type="submit" disabled={loading} className="flex-1 sm:flex-none sm:min-w-[200px]">
          {loading ? (isPublished ? 'Publishing...' : 'Creating...') : (isPublished ? 'Publish Opportunity' : 'Create as Draft')}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

