import html2canvas from 'html2canvas-pro';
import { toast } from 'sonner';

export const convertPostToImage = async (element: HTMLElement): Promise<void> => {
  try {
    // Add white background to the element temporarily
    const originalBg = element.style.background;
    element.style.background = 'white';
    
    // Configure html2canvas options
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true, // Handle cross-origin images
      allowTaint: true,
      removeContainer: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });
    
    // Restore original background
    element.style.background = originalBg;
    
    // Convert canvas to blob
    canvas.toBlob(async (blob: Blob | null) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }
      
      // Check if the browser supports the navigator.clipboard API
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          // Copy to clipboard
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          
          // Show success message
          toast.success('Post copied to clipboard as image! You can paste it anywhere.');
        } catch (clipboardError) {
          // If clipboard fails, download the image instead
          downloadImage(blob, 'post-image.png');
        }
      } else {
        // Fallback: download the image
        downloadImage(blob, 'post-image.png');
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error converting post to image:', error);
    toast.error('Failed to convert post to image. Please try again.');
  }
};

const downloadImage = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success('Post saved as image! Check your downloads folder.');
};