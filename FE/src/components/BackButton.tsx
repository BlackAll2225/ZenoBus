// src/components/ui/BackButton.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackButton = ({ label = 'Quay lại' }: { label?: string }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(-1)}
      className="border-gray-300 text-green-700 hover:bg-green-100 mb-4"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};

export default BackButton;
