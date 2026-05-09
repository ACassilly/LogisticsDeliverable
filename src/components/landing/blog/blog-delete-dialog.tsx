/**
 * Blog Delete Confirmation Dialog
 * Reusable dialog for confirming blog deletion with proper UX
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface BlogDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  blogTitle: string;
  isDeleting?: boolean;
}

export function BlogDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  blogTitle,
  isDeleting = false,
}: BlogDeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    // Don't close here - let parent handle it after success
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Delete Blog Post</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Are you sure you want to delete <strong>&ldquo;{blogTitle}&rdquo;</strong>?
            <br />
            <span className="text-red-600 font-medium mt-2 block">
              This action cannot be undone. The blog will be permanently removed from your site.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Blog'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

