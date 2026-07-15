import { avatarUrl } from '../utils/cloudinaryUrl';

interface AvatarProps {
  name: string;
  color: string;
  size?: number;
  className?: string;
  imageUrl?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function Avatar({ name, color, size = 44, className = '', imageUrl }: AvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={avatarUrl(imageUrl, size)}
        alt={name}
        title={name}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${className}`}
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.36 }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
