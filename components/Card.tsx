import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'light' | 'dark';
}

export const Card: React.FC<CardProps> = ({ title, children, variant = 'light' }) => {
  const baseClasses = "rounded-lg shadow";
  const lightClasses = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700";
  const darkClasses = "bg-slate-800/50 border border-slate-700";
  
  const headerLightClasses = "text-slate-900 dark:text-white";
  const headerDarkClasses = "text-white";
  
  const borderLightClasses = "border-slate-200 dark:border-slate-700";
  const borderDarkClasses = "border-slate-700";

  const isDark = variant === 'dark';

  return (
    <div className={`${baseClasses} ${isDark ? darkClasses : lightClasses}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className={`text-lg leading-6 font-medium ${isDark ? headerDarkClasses : headerLightClasses}`}>{title}</h3>
      </div>
      <div className={`border-t ${isDark ? borderDarkClasses : borderLightClasses} px-4 py-5 sm:p-6`}>
        {children}
      </div>
    </div>
  );
};

// Simple markdown parser to format AI-generated content.
const parseMarkdownToHTML = (markdown: string): string => {
    const lines = markdown.split('\n');
    let html = '';
    let buffer: string[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;

    const flushBuffer = () => {
        if (buffer.length > 0) {
            html += `<p>${buffer.join('<br />')}</p>`;
            buffer = [];
        }
    };

    const flushList = () => {
        if (inList) {
            html += `</${listType}>`;
            inList = false;
            listType = null;
        }
    };

    lines.forEach(line => {
        // Headings
        if (line.startsWith('### ')) {
            flushBuffer();
            flushList();
            html += `<h3>${line.substring(4)}</h3>`;
            return;
        }
        if (line.startsWith('## ')) {
            flushBuffer();
            flushList();
            html += `<h2>${line.substring(3)}</h2>`;
            return;
        }

        // Unordered list
        if (line.startsWith('* ') || line.startsWith('- ')) {
            flushBuffer();
            if (listType !== 'ul') {
                flushList();
                html += '<ul>';
                inList = true;
                listType = 'ul';
            }
            html += `<li>${line.substring(2)}</li>`;
            return;
        }

        // Ordered list
        if (/^\d+\.\s/.test(line)) {
            flushBuffer();
            if (listType !== 'ol') {
                flushList();
                html += '<ol>';
                inList = true;
                listType = 'ol';
            }
            html += `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
            return;
        }

        // End of list
        flushList();
        
        if (line.trim() !== '') {
            buffer.push(line);
        } else {
            flushBuffer();
        }
    });
    
    flushBuffer();
    flushList();
    
    // Post-process for bold text.
    return html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};


export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const html = parseMarkdownToHTML(content);
    return <div className="prose-custom" dangerouslySetInnerHTML={{ __html: html }} />;
};
