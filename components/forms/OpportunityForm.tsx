"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Search, Plus, X } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { opportunityApi, tagApi, type Tag } from "@/lib/api";
import { OPPORTUNITY_TYPES } from "@/lib/types";

interface OpportunityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  details: string;
  requirements: string;
  reward: string;
  type: string;
}

interface TagWithId extends Tag {
  ID?: number;
}

export default function OpportunityForm({
  onSuccess,
  onCancel,
}: OpportunityFormProps) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<TagWithId[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");
  const [addingTag, setAddingTag] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    details: "",
    requirements: "",
    reward: "",
    type: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const fetchTags = async () => {
    try {
      const response = await tagApi.getAll();
      setTags(response || []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Filter tags based on search - exclude already selected tags
  const filteredTags = useMemo(() => {
    const searchLower = tagSearch.toLowerCase().trim();
    return tags.filter(
      (tag) =>
        !selectedTags.includes(Number(tag.ID || tag.id)) &&
        tag.name?.toLowerCase().includes(searchLower)
    );
  }, [tags, tagSearch, selectedTags]);

  // Get selected tag objects for display
  const selectedTagObjects = useMemo(() => {
    return tags.filter((tag) =>
      selectedTags.includes(Number(tag.ID || tag.id))
    );
  }, [tags, selectedTags]);

  const handleAddTag = (tagId: number) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags((prev) => [...prev, tagId]);
      setTagSearch("");
    }
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setAddingTag(true);
    try {
      const newTag = await tagApi.create({
        name: newTagName.trim(),
        description: newTagDescription.trim() || undefined,
      });
      toast.success("Tag created successfully!");
      setShowAddTagModal(false);
      setNewTagName("");
      setNewTagDescription("");
      // Refetch tags and auto-select the new one
      await fetchTags();
      if (newTag?.id) {
        setSelectedTags((prev) => [...prev, Number(newTag.id)]);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create tag"
      );
    } finally {
      setAddingTag(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.details.trim()) {
      newErrors.details = "Details are required";
    } else if (formData.details.length < 10) {
      newErrors.details = "Details must be at least 10 characters";
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await opportunityApi.create({
        name: formData.name,
        details: formData.details,
        requirements: formData.requirements || undefined,
        reward: formData.reward || undefined,
        type: formData.type,
        tag_ids: selectedTags,
      });

      toast.success("Opportunity created successfully!");
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create opportunity"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Opportunity Name"
          name="name"
          placeholder="e.g., Machine Learning Research Assistant"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Textarea
          label="Details"
          name="details"
          placeholder="Describe the opportunity, responsibilities, and what students will learn..."
          value={formData.details}
          onChange={handleChange}
          error={errors.details}
          rows={5}
          required
        />

        <Textarea
          label="Requirements (optional)"
          name="requirements"
          placeholder="e.g., Experience with Python, Strong foundation in mathematics"
          value={formData.requirements}
          onChange={handleChange}
          rows={3}
        />

        <Textarea
          label="Reward (optional)"
          name="reward"
          placeholder="e.g., Research credit, Letter of recommendation, $500 stipend"
          value={formData.reward}
          onChange={handleChange}
          rows={2}
        />

        <Select
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          error={errors.type}
          required
        >
          <option value="">Select type</option>
          <option value={OPPORTUNITY_TYPES.RESEARCH}>Research</option>
          <option value={OPPORTUNITY_TYPES.PROJECT}>Project</option>
          <option value={OPPORTUNITY_TYPES.INTERNSHIP}>Internship</option>
          <option value={OPPORTUNITY_TYPES.COMPETITION}>Competition</option>
        </Select>

        {/* Tags Section */}
        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            Required Skills / Tags
          </label>

          {/* Selected Tags */}
          {selectedTagObjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTagObjects.map((tag) => (
                <span
                  key={tag.ID || tag.id}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveTag(Number(tag.ID || tag.id))
                    }
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Search tags..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Tag Search Results */}
          {tagSearch && (
            <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-0">
              {filteredTags.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.ID || tag.id}
                      type="button"
                      onClick={() =>
                        handleAddTag(Number(tag.ID || tag.id))
                      }
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="font-medium text-sm text-heading">
                        {tag.name}
                      </div>
                      {tag.description && (
                        <div className="text-xs text-muted">{tag.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted">
                  <p className="text-sm mb-2">
                    No tags found for &quot;{tagSearch}&quot;
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setNewTagName(tagSearch);
                      setShowAddTagModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create &quot;{tagSearch}&quot;
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Available Tags (when not searching) */}
          {!tagSearch && filteredTags.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted mb-2">
                Available tags (click to add):
              </p>
              <div className="flex flex-wrap gap-2">
                {filteredTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.ID || tag.id}
                    type="button"
                    onClick={() =>
                      handleAddTag(Number(tag.ID || tag.id))
                    }
                    className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-heading hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
            className="mt-3 inline-flex items-center text-sm text-primary hover:underline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create new tag
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create Opportunity"}
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
          setShowAddTagModal(false);
          setNewTagName("");
          setNewTagDescription("");
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
              {addingTag ? "Creating..." : "Create Tag"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowAddTagModal(false);
                setNewTagName("");
                setNewTagDescription("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
