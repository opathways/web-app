interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_REVIEW':
      case 'IN-REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'HIRED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${getStatusColor(status)}`}>
      {status.replace('_', ' ').replace('-', ' ')}
    </span>
  );
}
