import { useState } from 'react';
import { User as UserIcon } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
  '2xl': 'w-12 h-12',
};

export default function UserAvatar({
  photoPath,
  name,
  size = 'sm',
  className = '',
  ring = true,
}) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n) => {
    if (!n) return '';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const fullPhotoUrl = photoPath
    ? photoPath.startsWith('http')
      ? photoPath
      : `${API_BASE_URL}${photoPath}`
    : null;

  const ringClass = ring ? 'ring-2 ring-indigo-100 ring-offset-1' : '';

  if (fullPhotoUrl && !imgError) {
    return (
      <img
        src={fullPhotoUrl}
        alt={name || 'Avatar'}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 ${sizeClasses[size] || sizeClasses.sm} ${ringClass} ${className}`}
      />
    );
  }

  const initials = getInitials(name);

  return (
    <div
      className={`rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm ${
        sizeClasses[size] || sizeClasses.sm
      } ${ringClass} ${className}`}
    >
      {initials ? initials : <UserIcon className={iconSizes[size] || iconSizes.sm} />}
    </div>
  );
}

