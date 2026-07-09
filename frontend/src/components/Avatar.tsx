interface AvatarProps {
  name: string;
  color: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function Avatar({ name, color }: AvatarProps) {
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
