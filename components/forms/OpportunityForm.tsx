"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { opportunityApi, tagApi, type Tag } from "@/lib/api";
import { OPPORTUNITY_TYPES } from "@/lib/types";

interface OpportunityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  description: string;
  requirements: string;
  compensation: string;
  type: string;
  duration: string;
  location: string;
  is_remote: boolean;
}

export default function OpportunityForm({ onSuccess, onCancel }: OpportunityFormProps) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    requirements: "",
    compensation: "",
    type: "",
    duration: "",
    location: "",
    is_remote: false,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await tagApi.getAll();
      setTags(response || []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is modified
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
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
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        compensation: formData.compensation,
        type: formData.type as "research" | "project" | "internship",
        duration: formData.duration,
        location: formData.location,
        is_remote: formData.is_remote,
        skills_needed: selectedTags.map((id) => tags.find((t) => t.id === id)?.name || ""),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Opportunity Title"
        name="title"
        placeholder="e.g., Machine Learning Research Assistant"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
      />

      <Textarea
        label="Description"
        name="description"
        placeholder="Describe the opportunity, responsibilities, and what students will learn..."
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
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
        label="Compensation (optional)"
        name="compensation"
        placeholder="e.g., Research credit, Letter of recommendation, $500 stipend"
        value={formData.compensation}
        onChange={handleChange}
        rows={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </Select>

        <Input
          label="Duration (optional)"
          name="duration"
          placeholder="e.g., 3 months, 1 semester"
          value={formData.duration}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Location (optional)"
          name="location"
          placeholder="e.g., Room 301, Engineering Building"
          value={formData.location}
          onChange={handleChange}
        />

        <div className="flex items-center gap-2 pt-8">
          <input
            type="checkbox"
            id="is_remote"
            name="is_remote"
            checked={formData.is_remote}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="is_remote" className="text-sm text-muted">
            This is a remote opportunity
          </label>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <label className="input-label">Tags (optional)</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.id)
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-muted hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Opportunity"
          )}
        </Button>
      </div>
    </form>
  );
}
