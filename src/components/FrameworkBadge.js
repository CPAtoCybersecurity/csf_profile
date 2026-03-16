import React from 'react';
import useFrameworksStore from '../stores/frameworksStore';

const FrameworkBadge = ({ frameworkId, size = 'sm', showName = false }) => {
  const getFramework = useFrameworksStore((state) => state.getFramework);
  const framework = getFramework(frameworkId);

  if (!framework) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
        {frameworkId}
      </span>
    );
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  // Create lighter background color from the framework color
  const bgColor = `${framework.color}20`; // 20 = 12.5% opacity in hex
  const textColor = framework.color;

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: bgColor,
        color: textColor
      }}
      title={`${framework.name} ${framework.version}`}
    >
      <span
        className="w-2 h-2 rounded-full mr-1.5"
        style={{ backgroundColor: textColor }}
      />
      {showName ? framework.name : framework.shortName}
    </span>
  );
};

export default FrameworkBadge;
