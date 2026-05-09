/**
 * Blog Form Actions Component
 * Save Draft and Publish buttons with validation status
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Send, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BlogFormActionsProps {
  // Validation states
  isFormValidForDraft: boolean;
  isFormValidForPublish: boolean;
  
  // Loading states
  isDraftSaving: boolean;
  isPublishing: boolean;
  
  // Actions
  onSaveDraft: () => void;
  onPublish: () => void;
  
  // Preview
  previewUrl?: string;
  
  // Validation messages
  draftValidationMessage?: string;
  publishValidationMessage?: string;
}

export function BlogFormActions({
  isFormValidForDraft,
  isFormValidForPublish,
  isDraftSaving,
  isPublishing,
  onSaveDraft,
  onPublish,
  previewUrl,
  draftValidationMessage,
  publishValidationMessage,
}: BlogFormActionsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* URL Preview */}
          {previewUrl && (
            <div className="text-sm text-gray-600 pb-4 border-b border-gray-100">
              <span className="font-medium">Preview URL:</span> {previewUrl}
            </div>
          )}

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <Button
              type="button"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link href="/admin/portal">Cancel</Link>
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Save as Draft Button */}
              <Button
                type="button"
                onClick={onSaveDraft}
                disabled={isDraftSaving || !isFormValidForDraft}
                variant="outline"
                className="flex-1 sm:flex-none border-[#3BAB6B] text-[#256c43] hover:bg-[#E8F5ED] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDraftSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isDraftSaving ? 'Saving Draft...' : 'Save as Draft'}
              </Button>

              {/* Publish Blog Button */}
              <Button
                type="button"
                onClick={onPublish}
                disabled={isPublishing || !isFormValidForPublish}
                className="flex-1 sm:flex-none btn-gradient-green text-white shadow-lg shadow-[#3BAB6B]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isPublishing ? 'Publishing...' : 'Publish Blog'}
              </Button>
            </div>
          </div>

          {/* Validation Messages */}
          {!isFormValidForDraft && draftValidationMessage && (
            <div className="text-xs text-amber-600 flex items-start gap-1.5">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{draftValidationMessage}</span>
            </div>
          )}

          {isFormValidForDraft && !isFormValidForPublish && publishValidationMessage && (
            <div className="text-xs text-amber-600 flex items-start gap-1.5">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{publishValidationMessage}</span>
            </div>
          )}

          {/* Success indicator */}
          {isFormValidForPublish && (
            <div className="text-xs text-green-600 flex items-center gap-1.5">
              <span className="font-medium">✓ Ready to publish</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

