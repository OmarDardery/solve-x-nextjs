import { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import apiService from '../../services/api'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { OPPORTUNITY_TYPES } from '../../types'
import { Search, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

const opportunitySchema = z.object({
  name: z.string().min(1, 'Name is required').min(3, 'Name must be at least 3 characters'),
  details: z.string().min(1, 'Details are required').min(10, 'Details must be at least 10 characters'),
  requirements: z.string().optional(),
  reward: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  tag_ids: z.array(z.number()).optional(),
})

export function OpportunityForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [tagSearch, setTagSearch] = useState('')
  const [showAddTagModal, setShowAddTagModal] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagDescription, setNewTagDescription] = useState('')
  const [addingTag, setAddingTag] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      name: '',
      details: '',
      requirements: '',
      reward: '',
      type: '',
    },
  })

  const fetchTags = async () => {
    try {
      const response = await apiService.getAllTags()
      setTags(response || [])
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  // Filter tags based on search - exclude already selected tags
  const filteredTags = useMemo(() => {
    const searchLower = tagSearch.toLowerCase().trim()
    return tags.filter(tag => 
      !selectedTags.includes(tag.ID) && 
      (tag.name?.toLowerCase().includes(searchLower) || 
       tag.description?.toLowerCase().includes(searchLower))
    )
  }, [tags, tagSearch, selectedTags])

  // Get selected tag objects for display
  const selectedTagObjects = useMemo(() => {
    return tags.filter(tag => selectedTags.includes(tag.ID))
  }, [tags, selectedTags])

  const handleAddTag = (tagId) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags(prev => [...prev, tagId])
      setTagSearch('') // Clear search after adding
    }
  }

  const handleRemoveTag = (tagId) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId))
  }

  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTagName.trim()) {
      toast.error('Tag name is required')
      return
    }

    setAddingTag(true)
    try {
      const newTag = await apiService.createTag({
        name: newTagName.trim(),
        description: newTagDescription.trim(),
      })
      toast.success('Tag created successfully!')
      setShowAddTagModal(false)
      setNewTagName('')
      setNewTagDescription('')
      // Refetch tags and auto-select the new one
      await fetchTags()
      if (newTag?.ID) {
        setSelectedTags(prev => [...prev, newTag.ID])
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create tag')
    } finally {
      setAddingTag(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const opportunityData = {
        name: data.name,
        details: data.details,
        requirements: data.requirements || '',
        reward: data.reward || '',
        type: data.type,
        tag_ids: selectedTags,
      }

      await apiService.createOpportunity(opportunityData)
      toast.success('Opportunity created successfully!')
      onSuccess?.()
    } catch (error) {
      toast.error(error.message || 'Failed to create opportunity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Opportunity Name"
          placeholder="e.g., Machine Learning Research Assistant"
          {...register('name')}
          error={errors.name?.message}
        />
        
        <Controller
          name="details"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Details"
              placeholder="Describe the opportunity, responsibilities, and what students will learn..."
              rows={5}
              {...field}
              error={errors.details?.message}
            />
          )}
        />
        
        <Controller
          name="requirements"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Requirements (optional)"
              placeholder="e.g., Experience with Python, Strong foundation in mathematics"
              rows={3}
              {...field}
              error={errors.requirements?.message}
            />
          )}
        />

        <Controller
          name="reward"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Reward (optional)"
              placeholder="e.g., Research credit, Letter of recommendation, $500 stipend"
              rows={2}
              {...field}
              error={errors.reward?.message}
            />
          )}
        />
        
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Type"
              {...field}
              error={errors.type?.message}
            >
              <option value="">Select type</option>
              <option value={OPPORTUNITY_TYPES.RESEARCH}>Research</option>
              <option value={OPPORTUNITY_TYPES.PROJECT}>Project</option>
              <option value={OPPORTUNITY_TYPES.INTERNSHIP}>Internship</option>
            </Select>
          )}
        />

        {/* Tags Section */}
        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            Required Skills / Tags
          </label>
          
          {/* Selected Tags */}
          {selectedTagObjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTagObjects.map(tag => (
                <span
                  key={tag.ID}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.ID)}
                    className="hover:bg-blue-700 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 icon-muted" />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Search tags..."
              className="input-field pl-10"
            />
          </div>

          {/* Tag Search Results */}
          {tagSearch && (
            <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg border-default card p-0">
              {filteredTags.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredTags.map(tag => (
                    <button
                      key={tag.ID}
                      type="button"
                      onClick={() => handleAddTag(tag.ID)}
                      className="w-full text-left px-3 py-2 hover:bg-tertiary rounded-md transition-colors"
                    >
                      <div className="font-medium text-sm text-heading">{tag.name}</div>
                      {tag.description && (
                        <div className="text-xs text-muted">{tag.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted">
                  <p className="text-sm mb-2">No tags found for "{tagSearch}"</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewTagName(tagSearch)
                      setShowAddTagModal(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create "{tagSearch}"
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Available Tags (when not searching) */}
          {!tagSearch && filteredTags.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted mb-2">Available tags (click to add):</p>
              <div className="flex flex-wrap gap-2">
                {filteredTags.slice(0, 10).map(tag => (
                  <button
                    key={tag.ID}
                    type="button"
                    onClick={() => handleAddTag(tag.ID)}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-tertiary text-heading hover:bg-brand-light transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
                {filteredTags.length > 10 && (
                  <span className="px-3 py-1 text-sm text-muted">
                    +{filteredTags.length - 10} more (use search)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Add New Tag Button */}
          <button
            type="button"
            onClick={() => setShowAddTagModal(true)}
            className="mt-3 inline-flex items-center text-sm text-brand"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create new tag
          </button>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creating...' : 'Create Opportunity'}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Add Tag Modal */}
      <Modal
        isOpen={showAddTagModal}
        onClose={() => {
          setShowAddTagModal(false)
          setNewTagName('')
          setNewTagDescription('')
        }}
        title="Create New Tag"
        size="md"
      >
        <form onSubmit={handleCreateTag} className="space-y-4">
          <Input
            label="Tag Name"
            placeholder="e.g., Python, Machine Learning, Data Analysis"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            required
          />
          <Textarea
            label="Description (optional)"
            placeholder="Brief description of this skill or tag"
            rows={2}
            value={newTagDescription}
            onChange={(e) => setNewTagDescription(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={addingTag} className="flex-1">
              {addingTag ? 'Creating...' : 'Create Tag'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowAddTagModal(false)
                setNewTagName('')
                setNewTagDescription('')
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}


