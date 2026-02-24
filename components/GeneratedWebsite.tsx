
// Add missing React import to resolve namespace error
import React, { useRef, useEffect } from 'react';

interface Props {
  htmlContent: string;
  onHtmlUpdate?: (newHtml: string) => void;
  isEditing?: boolean;
}

const GeneratedWebsite: React.FC<Props> = ({ htmlContent, onHtmlUpdate, isEditing = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !isEditing) return;

    const container = containerRef.current;
    const textElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, button, td, th, caption, div');
    
    textElements.forEach(el => {
      const element = el as HTMLElement;
      // Don't make links or elements inside links editable as it breaks navigation
      if (element.tagName === 'A' || element.closest('a')) return;
      
      const hasText = Array.from(element.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      if (hasText) {
        element.contentEditable = "true";
        element.spellcheck = false;
        // Ensure editable text breaks correctly
        element.style.wordBreak = "break-word";
        element.style.overflowWrap = "break-word";
      }
    });

    const handleBlur = () => {
      if (onHtmlUpdate && container.innerHTML !== htmlContent) {
        onHtmlUpdate(container.innerHTML);
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const tag = (e.target as HTMLElement).tagName;
        if (['H1','H2','H3','H4','H5','H6','BUTTON'].includes(tag)) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const href = link.getAttribute('href');
        if (!href) return;

        // Handle internal anchors
        if (href.startsWith('#')) {
          e.preventDefault();
          const id = href.substring(1);
          const element = container.querySelector(`[id="${id}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } 
        // Force external map links to open, bypassing potential contentEditable interference
        else if (href.includes('google.com/maps')) {
          e.preventDefault();
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    };

    container.addEventListener('focusout', handleBlur);
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('focusout', handleBlur);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('click', handleClick);
    };
  }, [htmlContent, isEditing, onHtmlUpdate]);

  return (
    <div 
      ref={containerRef}
      className="w-full bg-white overflow-x-hidden overflow-y-auto break-words min-h-[600px] website-preview-container pb-32 animate-in fade-in duration-500"
      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default GeneratedWebsite;
