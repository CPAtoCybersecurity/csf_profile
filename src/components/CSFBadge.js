import React from 'react';

/**
 * CSF Function Badge Component
 * Displays CSF functions with appropriate color coding matching Confluence styling
 */

// Color mapping for CSF functions (matching Confluence UI)
const FUNCTION_COLORS = {
  'GOVERN': { bg: '#E8DEF8', text: '#6B21A8' },        // Purple
  'IDENTIFY': { bg: '#DBEAFE', text: '#1E40AF' },     // Blue
  'PROTECT': { bg: '#DCFCE7', text: '#166534' },      // Green
  'DETECT': { bg: '#FEE2E2', text: '#991B1B' },       // Red
  'RESPOND': { bg: '#FFEDD5', text: '#C2410C' },      // Orange
  'RECOVER': { bg: '#FEF3C7', text: '#B45309' }       // Amber
};

// Extract function code from full function name (e.g., "DETECT (DE)" -> "DETECT")
const extractFunctionCode = (functionName) => {
  if (!functionName) return null;
  const match = functionName.match(/^(\w+)/);
  return match ? match[1].toUpperCase() : functionName.toUpperCase();
};

const CSFBadge = ({ functionName, size = 'sm' }) => {
  if (!functionName) return null;

  const functionCode = extractFunctionCode(functionName);
  const colors = FUNCTION_COLORS[functionCode] || { bg: '#F3F4F6', text: '#374151' };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text
      }}
      title={functionName}
    >
      {functionName}
    </span>
  );
};

/**
 * Subcategory ID Badge Component
 * Displays subcategory IDs with color coding based on function
 */
export const SubcategoryBadge = ({ subcategoryId, size = 'sm' }) => {
  if (!subcategoryId) return null;

  // Extract function code from subcategory ID (e.g., "DE.AE-02" -> "DE")
  const match = subcategoryId.match(/^([A-Z]{2})/);
  const funcCode = match ? match[1] : null;

  // Map short codes to function names
  const codeToFunction = {
    'GV': 'GOVERN',
    'ID': 'IDENTIFY',
    'PR': 'PROTECT',
    'DE': 'DETECT',
    'RS': 'RESPOND',
    'RC': 'RECOVER'
  };

  const functionCode = codeToFunction[funcCode] || null;
  const colors = functionCode
    ? FUNCTION_COLORS[functionCode]
    : { bg: '#FFF7ED', text: '#C2410C' }; // Default orange if unknown

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium font-mono ${sizeClasses[size]}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text
      }}
      title={subcategoryId}
    >
      {subcategoryId}
    </span>
  );
};

export default CSFBadge;
