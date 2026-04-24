import React, { useState } from 'react';

function AIOutput({ response, feature, onRegenerate }) {
  const [copied, setCopied] = useState(false);

  if (!response) {
    return (
      <div className="ai-output">
        <div className="ai-output-placeholder">
          <div className="ai-output-placeholder-icon">{'\u2728'}</div>
          <p>Fill in the form above and click Generate to see AI-powered results.</p>
        </div>
      </div>
    );
  }

  const content = extractContent(response);
  const timestamp = response.timestamp || response.createdAt || new Date().toISOString();
  const model = response.model || 'AI Model';

  const handleCopy = () => {
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="ai-output">
      <div className="ai-output-header">
        <div className="ai-output-meta">
          <span className="badge badge-ai">{'\u2728'} AI Generated</span>
          <span className="badge badge-default">{model}</span>
          <span style={{ fontSize: '0.78rem', color: '#777' }}>
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="ai-output-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
            {copied ? '\u2713 Copied' : '\uD83D\uDCCB Copy'}
          </button>
          {onRegenerate && (
            <button className="btn btn-secondary btn-sm" onClick={onRegenerate}>
              {'\uD83D\uDD04'} Regenerate
            </button>
          )}
        </div>
      </div>
      <div className="ai-output-content">{renderContent(content)}</div>
    </div>
  );
}

function extractContent(response) {
  // Handle various response shapes from the backend
  if (typeof response === 'string') return response;
  if (response.result) return response.result;
  if (response.data) {
    if (typeof response.data === 'string') return response.data;
    if (response.data.result) return response.data.result;
    if (response.data.response) return response.data.response;
    if (response.data.content) return response.data.content;
    if (response.data.output) return response.data.output;
    return response.data;
  }
  if (response.response) return response.response;
  if (response.content) return response.content;
  if (response.output) return response.output;
  return response;
}

function renderContent(content) {
  if (typeof content === 'string') {
    return formatTextContent(content);
  }

  if (typeof content === 'object' && content !== null) {
    // Try to render object fields in a nice way
    return (
      <div>
        {Object.entries(content).map(([key, value]) => {
          if (key === '_id' || key === '__v' || key === 'id') return null;
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\w/, (c) => c.toUpperCase());
          return (
            <div key={key} style={{ marginBottom: '16px' }}>
              <h3>{label}</h3>
              {typeof value === 'string' ? (
                formatTextContent(value)
              ) : Array.isArray(value) ? (
                <ul>
                  {value.map((item, i) => (
                    <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                  ))}
                </ul>
              ) : (
                <p>{JSON.stringify(value)}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <p>{String(content)}</p>;
}

function formatTextContent(text) {
  // Split into paragraphs and handle markdown-like formatting
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listType = null;

  const flushList = () => {
    if (currentList.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <Tag key={`list-${elements.length}`}>
          {currentList.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </Tag>
      );
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(4)) }} />
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(3)) }} />
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h3 key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(2)) }} />
      );
      return;
    }

    // Bullet lists
    if (/^[-*]\s/.test(trimmed)) {
      listType = 'ul';
      currentList.push(trimmed.slice(2));
      return;
    }

    // Numbered lists
    if (/^\d+[.)]\s/.test(trimmed)) {
      listType = 'ol';
      currentList.push(trimmed.replace(/^\d+[.)]\s/, ''));
      return;
    }

    // Highlight blocks
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <div
          key={i}
          className="ai-output-highlight"
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(2)) }}
        />
      );
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }} />
    );
  });

  flushList();
  return elements;
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(231,76,60,0.15);padding:1px 6px;border-radius:3px;color:#e74c3c;font-size:0.85em">$1</code>');
}

export default AIOutput;
