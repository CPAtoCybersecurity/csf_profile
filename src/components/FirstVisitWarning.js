import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { isFirstVisit, acknowledgeFirstVisit } from '../utils/backupTracking';

const MONO_STACK = "'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace";

/**
 * First Visit Welcome Modal
 * Greets new users, introduces the pre-loaded Alma Security sample assessment,
 * and notes local-storage persistence. Terminal design system.
 */
const FirstVisitWarning = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    if (isFirstVisit()) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    acknowledgeFirstVisit();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '512px',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: '#000000',
          border: '1px solid #33ff66',
          borderRadius: 0,
          fontFamily: MONO_STACK,
          color: '#33ff66'
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '1px solid #33ff66', padding: '16px 20px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            ▮ Welcome to CSF_Profile
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9ca3af', letterSpacing: '0.04em' }}>
            NIST CSF 2.0 Assessment Tool
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px', fontSize: '13px', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 12px', color: '#e5e7eb' }}>
            A comprehensive sample assessment for <span style={{ color: '#33ff66' }}>Alma Security</span> —
            a fictional company — is pre-loaded and selected, so you can explore
            scoring, the dashboard radar, findings, and CSV export right away.
          </p>
          <ul style={{ margin: '0 0 12px', paddingLeft: '18px', color: '#e5e7eb', listStyleType: '"> "' }}>
            <li style={{ marginBottom: '4px' }}>Score current vs. target state per subcategory</li>
            <li style={{ marginBottom: '4px' }}>Watch the Dashboard radar update as you go</li>
            <li style={{ marginBottom: '4px' }}>Document observations, findings, and evidence</li>
            <li>Export audit-ready CSV workpapers</li>
          </ul>
          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', letterSpacing: '0.02em' }}>
            Data lives in your browser's local storage — export CSV backups as you work
            (Settings has reminders).
          </p>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #33ff66', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            style={{
              backgroundColor: '#33ff66',
              color: '#000000',
              border: 'none',
              borderRadius: 0,
              fontFamily: MONO_STACK,
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '10px 18px',
              cursor: 'pointer'
            }}
          >
            Start exploring →
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to ensure it's at the top level
  return createPortal(modalContent, document.body);
};

export default FirstVisitWarning;
