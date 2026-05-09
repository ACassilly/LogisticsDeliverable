/**
 * Blog Form Tags Component
 * Handles tag input with add/remove functionality
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { BlogFormField } from './blog-form-field';
import type { FieldError, Merge } from 'react-hook-form';
import toast from 'react-hot-toast';

interface BlogFormTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  error?: FieldError | Merge<FieldError, (FieldError | undefined)[]>;
  disabled?: boolean;
  maxTags?: number;
}

export function BlogFormTags({
  tags,
  onTagsChange,
  error,
  disabled = false,
  maxTags = 10,
}: BlogFormTagsProps) {
  const [currentTag, setCurrentTag] = useState('');

  const addTag = () => {
    const trimmedTag = currentTag.trim();
    
    if (!trimmedTag) {
      return;
    }
    
    if (tags.includes(trimmedTag)) {
      toast.error('Tag already exists');
      return;
    }
    
    if (tags.length >= maxTags) {
      toast.error(`Cannot add more than ${maxTags} tags`);
      return;
    }
    
    onTagsChange([...tags, trimmedTag]);
    setCurrentTag('');
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <BlogFormField
      label="Tags"
      htmlFor="tags"
      error={error}
      helperText={`Tags help readers find your content (${tags.length}/${maxTags})`}
    >
      <div className="space-y-3">
        {/* Tag Input */}
        <div className="flex gap-2">
          <Input
            id="tags"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag"
            disabled={disabled}
            className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          <Button
            type="button"
            onClick={addTag}
            size="sm"
            disabled={disabled || !currentTag.trim() || tags.length >= maxTags}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Display Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  disabled={disabled}
                  className="ml-1 hover:text-red-500 focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </BlogFormField>
  );
}

