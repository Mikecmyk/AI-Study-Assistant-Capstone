// MarkdownRenderer.js - FIXED VERSION
import React from 'react';
import './Dashboard.css';

const MarkdownRenderer = ({ content }) => {
    if (!content) return null;

    // Function to parse and render markdown-like content
    const renderMarkdown = (text) => {
        if (!text) return null;

        // Split by lines and process each line
        const lines = text.split('\n');
        const elements = [];
        let inList = false;
        let inCodeBlock = false;
        let codeBlockContent = [];
        let listItems = [];

        const closeList = () => {
            if (inList && listItems.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`} className="markdown-list">
                        {listItems}
                    </ul>
                );
                listItems = [];
                inList = false;
            }
        };

        const closeCodeBlock = () => {
            if (inCodeBlock && codeBlockContent.length > 0) {
                elements.push(
                    <pre key={`pre-${elements.length}`} className="markdown-pre">
                        <code className="markdown-code-block">
                            {codeBlockContent.join('\n')}
                        </code>
                    </pre>
                );
                codeBlockContent = [];
                inCodeBlock = false;
            }
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Handle code blocks (```)
            if (trimmedLine.startsWith('```')) {
                if (inCodeBlock) {
                    closeCodeBlock();
                } else {
                    closeList();
                    inCodeBlock = true;
                }
                return;
            }

            if (inCodeBlock) {
                codeBlockContent.push(line);
                return;
            }

            // Empty line
            if (!trimmedLine) {
                closeList();
                elements.push(<br key={`br-${index}`} />);
                return;
            }

            // Headers (## Header, ### Header, etc.)
            if (trimmedLine.startsWith('# ')) {
                closeList();
                elements.push(
                    <h2 key={`h2-${index}`} className="markdown-h2">
                        {trimmedLine.substring(2)}
                    </h2>
                );
                return;
            }

            if (trimmedLine.startsWith('## ')) {
                closeList();
                elements.push(
                    <h3 key={`h3-${index}`} className="markdown-h3">
                        {trimmedLine.substring(3)}
                    </h3>
                );
                return;
            }

            if (trimmedLine.startsWith('### ')) {
                closeList();
                elements.push(
                    <h4 key={`h4-${index}`} className="markdown-h4">
                        {trimmedLine.substring(4)}
                    </h4>
                );
                return;
            }

            if (trimmedLine.startsWith('#### ')) {
                closeList();
                elements.push(
                    <h5 key={`h5-${index}`} className="markdown-h5">
                        {trimmedLine.substring(5)}
                    </h5>
                );
                return;
            }

            // Blockquotes (> quote)
            if (trimmedLine.startsWith('> ')) {
                closeList();
                elements.push(
                    <blockquote key={`blockquote-${index}`} className="markdown-blockquote">
                        {renderInlineMarkdown(trimmedLine.substring(2))}
                    </blockquote>
                );
                return;
            }

            // Horizontal rules (---, ***)
            if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
                closeList();
                elements.push(
                    <hr key={`hr-${index}`} className="markdown-hr" />
                );
                return;
            }

            // Lists (* item, - item, 1. item)
            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ') || /^\d+\.\s/.test(trimmedLine)) {
                const listItem = trimmedLine.replace(/^[*\-]\s+/, '').replace(/^\d+\.\s+/, '');
                listItems.push(
                    <li key={`li-${listItems.length}`} className="markdown-li">
                        {renderInlineMarkdown(listItem)}
                    </li>
                );
                inList = true;
                return;
            }

            // Tables (basic table detection)
            if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
                closeList();
                // Skip separator rows (|---|)
                if (!trimmedLine.replace(/[|\s-]/g, '')) return;
                
                const cells = trimmedLine.split('|').filter(cell => cell.trim() !== '');
                const isHeaderRow = elements.length === 0 || 
                                  (elements[elements.length - 1].type === 'div' && 
                                   elements[elements.length - 1].props.className === 'markdown-table-row');
                
                elements.push(
                    <div key={`table-row-${index}`} className={`markdown-table-row ${isHeaderRow ? 'markdown-table-header' : ''}`}>
                        {cells.map((cell, cellIndex) => (
                            <div key={cellIndex} className="markdown-table-cell">
                                {renderInlineMarkdown(cell.trim())}
                            </div>
                        ))}
                    </div>
                );
                return;
            }

            // Regular paragraph
            closeList();
            elements.push(
                <p key={`p-${index}`} className="markdown-p">
                    {renderInlineMarkdown(trimmedLine)}
                </p>
            );
        });

        closeList(); // Close any remaining list
        closeCodeBlock(); // Close any remaining code block
        return elements;
    };

    // Function to handle inline markdown (bold, italic, code, links)
    const renderInlineMarkdown = (text) => {
        if (!text) return null;

        const elements = [];
        let currentText = '';
        let inBold = false;
        let inItalic = false;
        let inCode = false;
        let inLink = false;
        let linkText = '';
        let linkUrl = '';

        const pushCurrentText = () => {
            if (currentText) {
                let element = currentText;
                
                if (inBold && inItalic) {
                    element = (
                        <strong key={elements.length} className="markdown-strong">
                            <em className="markdown-em">{element}</em>
                        </strong>
                    );
                } else if (inBold) {
                    element = <strong key={elements.length} className="markdown-strong">{element}</strong>;
                } else if (inItalic) {
                    element = <em key={elements.length} className="markdown-em">{element}</em>;
                } else if (inCode) {
                    element = <code key={elements.length} className="markdown-code">{element}</code>;
                } else if (inLink) {
                    element = (
                        <a 
                            key={elements.length} 
                            href={linkUrl} 
                            className="markdown-a"
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            {linkText || element}
                        </a>
                    );
                    linkText = '';
                    linkUrl = '';
                }
                
                elements.push(element);
                currentText = '';
            }
        };

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            // Handle links [text](url)
            if (char === '[' && !inLink && !inCode) {
                pushCurrentText();
                inLink = true;
                // Find the closing bracket and parentheses
                const closingBracket = text.indexOf(']', i);
                const openingParen = text.indexOf('(', closingBracket);
                const closingParen = text.indexOf(')', openingParen);
                
                if (closingBracket !== -1 && openingParen !== -1 && closingParen !== -1) {
                    linkText = text.substring(i + 1, closingBracket);
                    linkUrl = text.substring(openingParen + 1, closingParen);
                    i = closingParen; // Skip to end of link
                    pushCurrentText();
                    inLink = false;
                }
                continue;
            }

            // Handle code spans `code`
            if (char === '`' && !inLink) {
                pushCurrentText();
                inCode = !inCode;
                continue;
            }

            // Handle bold **bold** or __bold__
            if ((char === '*' && nextChar === '*') || (char === '_' && nextChar === '_')) {
                pushCurrentText();
                inBold = !inBold;
                i++; // Skip next character
                continue;
            }

            // Handle italic *italic* or _italic_
            if ((char === '*' && !inBold) || (char === '_' && !inBold && nextChar !== '_')) {
                pushCurrentText();
                inItalic = !inItalic;
                continue;
            }

            currentText += char;
        }

        pushCurrentText(); // Push any remaining text

        return elements.length > 0 ? elements : text;
    };

    return (
        <div className="markdown-content">
            {renderMarkdown(content)}
        </div>
    );
};

export default MarkdownRenderer;