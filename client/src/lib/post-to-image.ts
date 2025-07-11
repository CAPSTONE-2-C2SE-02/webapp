// @ts-ignore
import html2canvas from 'html2canvas-pro';

export interface PostToImageOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  scale?: number;
  quality?: number;
  format?: 'png' | 'jpeg';
}

export const convertPostToImage = async (
  element: HTMLElement,
  options: PostToImageOptions = {}
): Promise<Blob> => {
  const {
    width = 600,
    backgroundColor = '#ffffff',
    scale = 2,
    quality = 1,
    format = 'png'
  } = options;

  // Create a copy of the element for processing
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Apply post-to-image class for styling
  clonedElement.classList.add('post-to-image');
  
  // Hide action buttons and other UI elements
  const actionsElement = clonedElement.querySelector('.w-full.flex.items-center.justify-between');
  if (actionsElement) {
    (actionsElement as HTMLElement).style.display = 'none';
  }
  
  // Hide bookmark button and post actions
  const bookmarkButton = clonedElement.querySelector('[data-bookmark]');
  if (bookmarkButton) {
    (bookmarkButton as HTMLElement).style.display = 'none';
  }
  
  const postActions = clonedElement.querySelector('[data-post-actions]');
  if (postActions) {
    (postActions as HTMLElement).style.display = 'none';
  }

  // Temporarily add the cloned element to the body for rendering
  clonedElement.style.position = 'absolute';
  clonedElement.style.left = '-9999px';
  clonedElement.style.top = '-9999px';
  clonedElement.style.width = `${width}px`;
  document.body.appendChild(clonedElement);

  try {
    const canvas = await html2canvas(clonedElement, {
      backgroundColor,
      scale,
      width,
      height: undefined, // Auto height based on content
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: width,
      logging: false,
    });

    // Remove the cloned element
    document.body.removeChild(clonedElement);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob: Blob | null) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  } catch (error) {
    // Make sure to clean up the cloned element in case of error
    if (document.body.contains(clonedElement)) {
      document.body.removeChild(clonedElement);
    }
    console.error('Error converting post to image:', error);
    throw error;
  }
};

export const downloadImage = (blob: Blob, filename: string = 'post-image.png') => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyImageToClipboard = async (blob: Blob): Promise<boolean> => {
  try {
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      const clipboardItem = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error copying image to clipboard:', error);
    return false;
  }
};