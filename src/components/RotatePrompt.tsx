import React from 'react';

interface RotatePromptProps {
  show: boolean;
}

export const RotatePrompt: React.FC<RotatePromptProps> = ({ show }) => {
  return (
    <div
      className="RotatePrompt"
      data-show={show}
      style={{
        display: show ? 'flex' : 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 101,
        backgroundColor: '#121212',
        color: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div className="heading3">PLEASE ROTATE YOUR DEVICE</div>
    </div>
  );
};
